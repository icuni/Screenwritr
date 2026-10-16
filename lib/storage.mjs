import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { validateStory } from './story.mjs';

export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;
const queues = new Map();
const pending = new Set();
const digest = data => createHash('sha256').update(data).digest('hex');

function enqueue(key, task) {
  const previous = queues.get(key) || Promise.resolve();
  const promise = previous.catch(() => {}).then(task);
  queues.set(key, promise); pending.add(promise);
  promise.finally(() => { pending.delete(promise); if (queues.get(key) === promise) queues.delete(key); }).catch(() => {});
  return promise;
}

export async function flushWrites() { while (pending.size) await Promise.allSettled([...pending]); }

/** Same-directory temp + fsync + rename. Readers see the old complete file or new complete file. */
export function atomicWrite(filePath, data, options = {}) {
  const target = path.resolve(filePath);
  return enqueue(target, async () => {
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    if (bytes.byteLength > (options.maxBytes ?? MAX_DOCUMENT_BYTES)) throw new Error('Document exceeds the 50 MB safety limit.');
    await fs.mkdir(path.dirname(target), { recursive: true });
    const temp = `${target}.tmp-${process.pid}-${randomUUID()}`;
    let handle;
    try {
      handle = await fs.open(temp, 'wx', 0o600); await handle.writeFile(bytes); await handle.sync(); await handle.close(); handle = null;
      await fs.rename(temp, target);
      // Directory fsync is unavailable on some Windows filesystems; the data fsync above still applies.
      let directory;try { directory=await fs.open(path.dirname(target),'r');await directory.sync(); } catch {} finally { await directory?.close().catch(()=>{}); }
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      await fs.unlink(temp).catch(() => {}); throw error;
    }
    return target;
  });
}

export function atomicWriteJson(filePath, value) { return atomicWrite(filePath, `${JSON.stringify(value, null, 2)}\n`); }

export async function readJson(filePath) {
  const info = await fs.stat(filePath);
  if (info.size > MAX_DOCUMENT_BYTES) throw new Error('Document exceeds the 50 MB safety limit.');
  const bytes = await fs.readFile(filePath);
  if (bytes.byteLength > MAX_DOCUMENT_BYTES) throw new Error('Document exceeds the 50 MB safety limit.');
  try { return JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); }
  catch { throw new Error(`The file is not valid JSON: ${path.basename(filePath)}`); }
}

export async function readStory(filePath, options = {}) {
  try { return { story: validateStory(await readJson(filePath)), recovered: false }; }
  catch (error) {
    if (!options.allowBackup) throw error;
    try { return { story: validateStory(await readJson(`${filePath}.bak`)), recovered: true, warning: `The original file could not be read. Its last valid backup was recovered. ${error.message}` }; }
    catch { throw error; }
  }
}

/** App-owned storage; renderer-provided paths never reach this class directly. */
export function createStoryStorage(userDataDirectory) {
  const root = path.resolve(userDataDirectory);
  const recentPath = path.join(root, 'recent.json');
  const recoveryPath = path.join(root, 'recovery.json');
  const revisionRoot = path.join(root, 'revisions');
  const draftRoot = path.join(root, 'recovery');
  const baselines=new Map();const fileKey=file=>path.resolve(file).toLocaleLowerCase();
  let recentQueue = Promise.resolve();
  let operationQueue = Promise.resolve();
  const sequence = task => { const next = operationQueue.catch(() => {}).then(task); operationQueue = next; return next; };
  const safeId = id => digest(id).slice(0, 32);

  async function recent() {
    try { const value = await readJson(recentPath); if (!Array.isArray(value)) return []; return value.filter(item => item && typeof item.path === 'string' && typeof item.title === 'string' && typeof item.updatedAt === 'string').slice(0, 20); }
    catch { return []; }
  }
  async function remember(filePath, story) {
    const task = recentQueue.catch(() => {}).then(async () => {
      const entries = await recent(); const target = path.resolve(filePath);
      await atomicWriteJson(recentPath, [{ title: story.title, path: target, updatedAt: story.updatedAt }, ...entries.filter(entry => path.resolve(entry.path).toLocaleLowerCase() !== target.toLocaleLowerCase())].slice(0, 20));
    }); recentQueue = task; return task;
  }
  async function recordRevision(story) {
    const folder = path.join(revisionRoot, safeId(story.id));
    const revision = { schemaVersion: 1, savedAt: new Date().toISOString(), hash: digest(JSON.stringify(story)), story };
    await fs.mkdir(folder, { recursive: true });
    const entries = (await fs.readdir(folder)).filter(name => name.endsWith('.json')).sort();
    if (entries.length) { try { const last = await readJson(path.join(folder, entries.at(-1))); if (last.hash === revision.hash) return; } catch {} }
    await atomicWriteJson(path.join(folder, `${Date.now()}-${randomUUID()}.json`), revision);
    const after = (await fs.readdir(folder)).filter(name => name.endsWith('.json')).sort();
    await Promise.all(after.slice(0, -30).map(name => fs.unlink(path.join(folder, name)).catch(() => {})));
  }
  async function save(filePath, input, options={}) {
    const story = validateStory(input), target = path.resolve(filePath);
    return sequence(async () => {
      // Keep the last valid saved version. An externally damaged file must not replace it.
      try { const previous = validateStory(await readJson(target));const expected=baselines.get(fileKey(target));if(!options.allowOverwrite&&expected&&digest(JSON.stringify(previous))!==expected){const conflict=new Error('This project changed outside Screenwritr. Use Save as to preserve both versions.');conflict.code='FILE_CHANGED';throw conflict;}await atomicWriteJson(target+'.bak',previous); }
      catch (error) {if(error.code==='FILE_CHANGED')throw error; if (error.code !== 'ENOENT') { /* preserve an existing backup and allow saving the valid current story */ } }
      await atomicWriteJson(target, story);baselines.set(fileKey(target),digest(JSON.stringify(story))); await remember(target, story); await recordRevision(story);
      return { path: target, savedAt: new Date().toISOString() };
    });
  }
  async function autosave(input, filePath = null) {
    const story = validateStory(input);
    return sequence(async () => {
      const savedAt = new Date().toISOString(), serialized = JSON.stringify(story);
      await atomicWriteJson(path.join(draftRoot,safeId(story.id)+'.screenwritr'),story);
      const envelope = { schemaVersion: 1, savedAt, path: filePath, fileHash:filePath?baselines.get(fileKey(filePath))||null:null, hash: digest(serialized), story };
      try { const previous = await readJson(recoveryPath); if (previous.schemaVersion === 1) { const old = validateStory(previous.story); if (previous.hash === digest(JSON.stringify(old))) await atomicWriteJson(`${recoveryPath}.bak`, previous); } } catch {}
      await atomicWriteJson(recoveryPath, envelope);
      return { savedAt, path: filePath };
    });
  }
  async function recover() {
    for (const candidate of [recoveryPath, `${recoveryPath}.bak`]) {
      try {
        const value = await readJson(candidate);
        if (value.schemaVersion !== 1) continue;
        const story = validateStory(value.story);
        if (typeof value.hash !== 'string' || value.hash !== digest(JSON.stringify(story))) continue;
        if(typeof value.path==='string')baselines.set(fileKey(value.path),typeof value.fileHash==='string'?value.fileHash:digest(JSON.stringify(story)));let latest=story;try{const draft=validateStory(await readJson(path.join(draftRoot,safeId(story.id)+'.screenwritr')));// A same-ID draft is written before its recovery envelope, so differing content is a later interrupted autosave regardless of document timestamps.
        if(draft.id===story.id&&digest(JSON.stringify(draft))!==value.hash)latest=draft;}catch{}
        return { story:latest, path: typeof value.path === 'string' ? value.path : null, recovered: candidate !== recoveryPath||latest!==story, savedAt:latest===story?value.savedAt:latest.updatedAt };
      } catch {}
    }
    const available=await drafts();if(available.length)return {story:available[0].story,path:null,recovered:true,savedAt:available[0].savedAt};
    return null;
  }
  async function open(filePath) { const value = await readStory(filePath, { allowBackup: true });baselines.set(fileKey(filePath),digest(JSON.stringify(value.story))); await remember(filePath, value.story); return { ...value, path: path.resolve(filePath) }; }
  async function revisions(storyId) {
    const folder = path.join(revisionRoot, safeId(storyId)); let names;
    try { names = await fs.readdir(folder); } catch { return []; }
    const entries = await Promise.all(names.filter(name => name.endsWith('.json')).sort().reverse().map(async name => { try { const value = await readJson(path.join(folder, name)); return { id: name, savedAt: value.savedAt, story: validateStory(value.story) }; } catch { return null; } }));
    return entries.filter(Boolean);
  }
  async function drafts() { let names;try{names=await fs.readdir(draftRoot);}catch{return [];}const entries=await Promise.all(names.filter(name=>name.endsWith('.screenwritr')).map(async name=>{try{const story=validateStory(await readJson(path.join(draftRoot,name)));return {story,path:path.join(draftRoot,name),savedAt:story.updatedAt};}catch{return null;}}));return entries.filter(Boolean).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)); }
  async function flush() { await operationQueue.catch(() => {}); await recentQueue.catch(() => {}); await flushWrites(); }
  return { root, recoveryPath, recent, remember, save, autosave, recover, open, revisions, drafts, flush };
}
