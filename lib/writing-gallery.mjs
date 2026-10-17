import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { countWords, parseHeading } from './story.mjs';
import { atomicWriteJson, readJson } from './storage.mjs';
import { SOURCE_EXTENSIONS, FINAL_CUT_NATIVE_MESSAGE, sourceFormat } from './import-source.mjs';
const key = file => path.resolve(file).toLocaleLowerCase();
const sourceId = file => 'source_' + createHash('sha256').update(key(file)).digest('hex').slice(0,24);
const supported = new Set(SOURCE_EXTENSIONS);
export function summarizeStory(story) {
  const blocks = Array.isArray(story.blocks) ? story.blocks : [];
  const normalize = value => String(value).replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim().toLocaleUpperCase('en');
  const index = entities => {const aliases=new Map(),ids=new Set();for(const e of entities){const id=normalize(e.name);ids.add(id);for(const name of [e.name,...(e.aliases||[])])aliases.set(normalize(name),id);}return {aliases,ids};};
  const characters=index(story.characters||[]),locations=index(story.locations||[]);
  const add=(collection,name)=>{const normalized=normalize(name);if(normalized)collection.ids.add(collection.aliases.get(normalized)||normalized);};
  let words=0,scenes=0;
  for (const block of blocks) {
    const text=String(block.text||'');
    if(!block.omitted && !['note','section','sectionEnd','sceneCharacters','titleHeader','synopsis','pagebreak'].includes(block.type))words+=countWords(text);
    if(block.type==='scene'){scenes++;add(locations,parseHeading(text).location);}
    if(!block.omitted&&block.type==='character')add(characters,text);
    if(!block.omitted&&block.type==='sceneCharacters')for(const name of text.split(/[,;\n]+|\s+(?:&|\/|and)\s+/i))add(characters,name);
  }
  const excerpt=blocks.find(b=>b.type==='action' && !b.omitted && String(b.text||'').trim())?.text || '';
  return {title:String(story.title||'Untitled story').slice(0,500),authors:String(story.authors||'').slice(0,500),
    summary:String(story.logline||story.synopsis||excerpt||'').replace(/\s+/g,' ').slice(0,600),genre:String(story.genre||'').slice(0,100),
    updatedAt:story.updatedAt,words,scenes,characters:characters.ids.size,locations:locations.ids.size};
}
export function createWritingGallery(dataRoot, options) {
  const configPath=path.join(dataRoot,'gallery.json');
  let roots=[],files=[],sources=new Map(),drafts=new Map(),running=false,rerun=false,closed=false,version=0,done=0,total=0,warnings=[],timer,pending=Promise.resolve(),lastError='',scanTask=Promise.resolve();
  const bump=()=>{version++;};
  const persist=()=>{clearTimeout(timer);const snapshot={schemaVersion:1,roots,files,sources:[...sources.values()],drafts:[...drafts.values()]};pending=pending.catch(()=>{}).then(()=>atomicWriteJson(configPath,snapshot));return pending;};
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{persist().catch(error=>{lastError=error.message;bump();});},250);timer.unref?.();};
  async function initialize() {
    try {const saved=await readJson(configPath);if(saved.schemaVersion===1){
      roots=(saved.roots||[]).filter(p=>typeof p==='string' && path.isAbsolute(p)).slice(0,50);
      files=(saved.files||[]).filter(p=>typeof p==='string' && path.isAbsolute(p)).slice(0,2500);
      for(const row of (saved.sources||[]).slice(0,2500))if(typeof row.file==='string'&&path.isAbsolute(row.file))sources.set(sourceId(row.file),{...row,id:sourceId(row.file)});
      for(const row of (saved.drafts||[]).slice(0,2500))if(typeof row.storyId==='string'&&row.storyId.length<500)drafts.set(row.storyId,{...row,id:'draft_'+row.storyId});
    }}catch(error){if(error.code!=='ENOENT'){lastError='Gallery cache was rebuilt. Story files and recovery drafts are intact.';}}
    bump();
  }
  function recordDraft(story, filePath=null, baseline=null, opened=false) {
    const previous=drafts.get(story.id);
    drafts.set(story.id,{...summarizeStory(story),id:'draft_'+story.id,storyId:story.id,kind:'draft',format:'screenwritr',status:'ready',
      filePath,baseline,lastOpenedAt:opened?new Date().toISOString():previous?.lastOpenedAt||null});
    bump();schedule();
  }
  async function migrate(storage) {
    await storage.visitDrafts(({story})=>recordDraft(story),[...drafts.keys()]);
    for(const recent of await storage.recent())if(!files.some(p=>key(p)===key(recent.path)))files.push(recent.path);
    await persist();refresh();
  }
  async function addFolder(folder) {
    if(typeof folder!=='string'||!path.isAbsolute(folder))throw new Error('Choose an absolute story folder.');
    const stat=await fs.lstat(folder);if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error('Choose a regular folder. Linked folders are not followed.');
    if(!roots.some(p=>key(p)===key(folder))){if(roots.length>=50)throw new Error('The gallery supports up to 50 folders.');roots.push(path.resolve(folder));await persist();bump();}
    refresh();
  }
  async function addFiles(paths) {
    if(!Array.isArray(paths)||paths.length>500)throw new Error('Add up to 500 story files at a time.');
    for(const file of paths){if(typeof file!=='string'||!path.isAbsolute(file)||!supported.has(sourceFormat(file)))throw new Error('Unsupported gallery file.');if(!files.some(p=>key(p)===key(file)))files.push(path.resolve(file));}
    files=files.slice(0,2500);await persist();bump();refresh();
  }
  async function discover() {
    const found=new Map(), visited=new Set();let directories=0;
    const add=file=>{if(found.size<2500)found.set(sourceId(file),path.resolve(file));};
    const visit=async(folder,depth)=>{
      if(closed||depth>8||directories>=1000||found.size>=2500)return;
      const stat=await fs.lstat(folder);if(!stat.isDirectory()||stat.isSymbolicLink())return;
      const real=await fs.realpath(folder);if(visited.has(key(real)))return;visited.add(key(real));directories++;
      for(const entry of await fs.readdir(folder,{withFileTypes:true})){
        if(entry.isSymbolicLink())continue;
        const file=path.join(folder,entry.name),ext=sourceFormat(file);
        if(entry.isDirectory()){if(['fcpxmld','fcpbundle'].includes(ext))add(file);else if(!['.git','node_modules','.local'].includes(entry.name))await visit(file,depth+1);}
        else if(entry.isFile()&&supported.has(ext))add(file);
        if(found.size>=2500)break;
      }
    };
    for(const file of files)add(file);
    for(const root of roots)try{await visit(root,0);}catch(error){warnings.push(path.basename(root)+': '+(error.code==='ENOENT'?'Folder unavailable':error.message).slice(0,200));}
    if(found.size>=2500||directories>=1000)warnings.push('Folder scan reached its safety limit. Add a smaller story folder to include remaining files.');
    return found;
  }
  async function scan() {
    warnings=[];done=0;total=0;bump();
    try {
      const found=await discover();total=found.size;
      for(const [id,row]of sources)if(!found.has(id))sources.set(id,{...row,status:'missing',error:'This file is no longer in an added location.'});
      for(const [id,file]of found)if(!sources.has(id))sources.set(id,{id,file,kind:'source',format:sourceFormat(file),title:path.basename(file,path.extname(file)),status:'indexing'});
      bump();
      for(const [id,file]of found) {
        if(closed)break;
        const previous=sources.get(id),format=sourceFormat(file),base={...previous,id,file,kind:'source',format,filename:path.basename(file),folder:path.basename(path.dirname(file))};
        try {
          const info=await fs.lstat(format==='fcpxmld'?path.join(file,'Info.fcpxml'):file);
          if(info.isSymbolicLink())throw new Error('Linked story files are not followed.');
          if(['fcp','fcpbundle'].includes(format)){sources.set(id,{...base,status:'export-needed',error:FINAL_CUT_NATIVE_MESSAGE});continue;}
          const signature=info.size+':'+info.mtimeMs;
          if(previous.signature===signature&&previous.status==='ready')sources.set(id,{...base,status:'ready'});
          else {const parsed=await options.readMetadata(file);if(parsed.ok===false)throw new Error(parsed.error);sources.set(id,{...base,...parsed.summary,signature:parsed.signature||signature,status:'ready',error:null});}
        } catch(error){sources.set(id,{...base,status:error.code==='ENOENT'?'missing':'error',error:String(error.message).slice(0,600)});}
        finally{done++;bump();}
      }
      await persist();
    } catch(error){lastError=String(error.message).slice(0,600);}
    finally {running=false;bump();if(rerun&&!closed){rerun=false;refresh();}else options.onIdle?.();}
  }
  function refresh() {if(closed)return;if(running){rerun=true;return;}running=true;bump();scanTask=scan();}
  function list(query={}) {
    if(!query||typeof query!=='object'||Array.isArray(query))throw new Error('Invalid gallery query.');
    const search=String(query.search||'').slice(0,256).toLocaleLowerCase(),filter=query.filter||'all',sort=query.sort||'recent';
    if(!['all','drafts','files','recent',...SOURCE_EXTENSIONS].includes(filter)||!['recent','title','updated'].includes(sort))throw new Error('Invalid gallery filter.');
    const limit=Number(query.limit??24),offset=Number(query.offset??0);
    if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>10000)throw new Error('Invalid gallery page.');
    let rows=[...drafts.values(),...sources.values()];
    if(filter==='drafts')rows=rows.filter(r=>r.kind==='draft');
    else if(filter==='files')rows=rows.filter(r=>r.kind==='source');
    else if(filter==='recent')rows=rows.filter(r=>r.lastOpenedAt);
    else if(filter!=='all')rows=rows.filter(r=>r.format===filter);
    if(search)rows=rows.filter(r=>[r.title,r.authors,r.summary,r.filename,r.folder].join(' ').toLocaleLowerCase().includes(search));
    rows.sort((a,b)=>sort==='title'?String(a.title).localeCompare(String(b.title)):String(sort==='updated'?b.updatedAt||'':b.lastOpenedAt||b.updatedAt||'').localeCompare(String(sort==='updated'?a.updatedAt||'':a.lastOpenedAt||a.updatedAt||''))||String(a.title).localeCompare(String(b.title)));
    const entries=rows.slice(offset,offset+limit).map(({file,filePath,baseline,signature,...publicRow})=>publicRow);
    return {entries,total:rows.length,offset,limit,version,indexing:running,progress:{done,total},folders:roots.map(p=>({id:sourceId(p),name:path.basename(p)})),counts:{drafts:drafts.size,files:sources.size},warnings:[...warnings,...(lastError?[lastError]:[])]};
  }
  function resolveEntry(id) {if(typeof id!=='string'||id.length>600)throw new Error('Invalid gallery entry.');const row=sources.get(id)||[...drafts.values()].find(r=>r.id===id);if(!row)throw new Error('This story is no longer in the gallery. Refresh and try again.');return {...row};}
  function markOpened(id) {const row=sources.get(id);if(row){row.lastOpenedAt=new Date().toISOString();bump();schedule();}}
  async function flush() {closed=true;clearTimeout(timer);await scanTask.catch(()=>{});await persist();}
  return {initialize,migrate,addFolder,addFiles,refresh,list,resolveEntry,markOpened,recordDraft,flush};
}
