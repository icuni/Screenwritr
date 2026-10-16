import { open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { z } from 'zod';

export const MAX_SESSION_BYTES = 50 * 1024 * 1024;
export const idSchema = z.string().min(1).max(300);
const string = z.string().max(10_000_000);
const id = idSchema;
const block = z.object({ id, type: z.enum(['scene', 'sceneCharacters', 'titleHeader', 'title', 'sectionEnd', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot', 'note', 'section', 'synopsis', 'lyrics', 'pagebreak']), text: string, revision: string.optional(), omitted: z.boolean().optional() });
const asset = z.string().max(MAX_SESSION_BYTES);
const entity = z.object({ id, name: string, description: string, notes: string, color: string, aliases: z.array(string).max(1000), fields: z.record(string).refine(value => Object.keys(value).length <= 1000), image: asset.optional() });
const research = z.object({ id, parentId: id.nullable(), type: z.enum(['folder', 'note', 'link', 'image', 'document']), title: string, content: z.string().max(10_000_000), url: string, attachment: asset.optional(), hasAttachment:z.boolean().optional() });
const sceneMeta = z.object({ id, title: string, synopsis: string, color: string, act: string, sequence: string, status: string, notes: string, tags: z.array(string).max(1000) });
const comment = z.object({ id, blockId: id, text: string, author: string, resolved: z.boolean(), createdAt: string });
export const sharedStorySchema = z.object({
  format: z.literal('screenwritr'), version: z.literal(1), id, title: string, subtitle: string,
  logline: string, synopsis: string, authors: string, genre: string, language: string,
  contact: string, copyright: string, createdAt: string, updatedAt: string,
  blocks: z.array(block).max(100_000), scenes: z.record(sceneMeta),
  characters: z.array(entity).max(10_000), locations: z.array(entity).max(10_000), items: z.array(entity).max(10_000),
  research: z.array(research).max(20_000), comments: z.array(comment).max(100_000),
  versions: z.array(z.object({ id, name: string, createdAt: string, blocks: z.array(block).max(100_000) })).max(1000),
  mindmap: z.object({ nodes: z.array(z.object({ id, label: string, x: z.number().finite(), y: z.number().finite(), color: string })).max(100_000), edges: z.array(z.object({ id, from: id, to: id, label: string })).max(100_000) }),
  // Preferences are deliberately not part of AI disclosure.
  settings: z.object({}).passthrough(),
  writingSessions: z.array(z.object({ date: string, words: z.number().finite(), minutes: z.number().finite() })).max(100_000),
});

export class SessionError extends Error {
  constructor(code, message) { super(message); this.name = 'SessionError'; this.code = code; }
}
const unavailable = () => new SessionError('SESSION_UNAVAILABLE', 'The active Screenwritr session is unavailable. Open Screenwritr and enable sharing for the active story.');

/** No cached story survives a request, consent change, or project switch. */
export class ActiveStorySession {
  constructor(sessionPath) {
    if (typeof sessionPath !== 'string' || !isAbsolute(sessionPath)) throw new SessionError('INVALID_CONFIGURATION', 'Provide --session with an absolute active-story session path.');
    this.sessionPath = sessionPath;
  }

  async read() {
    let handle;
    let raw;
    try {
      handle = await open(this.sessionPath, 'r');
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > MAX_SESSION_BYTES) throw unavailable();
      raw = await handle.readFile({ encoding: 'utf8' });
      if (Buffer.byteLength(raw, 'utf8') > MAX_SESSION_BYTES) throw unavailable();
    } catch { throw unavailable(); }
    finally { await handle?.close().catch(() => {}); }
    let envelope;
    try { envelope = JSON.parse(raw); } catch { throw unavailable(); }
    if (envelope?.enabled !== true) throw new SessionError('SHARING_DISABLED', 'Story sharing is disabled. Enable MCP sharing for the active story in Screenwritr.');
    if (!Number.isInteger(envelope.publisherPid)||envelope.publisherPid<=0) throw unavailable();
    try{process.kill(envelope.publisherPid,0);}catch{throw unavailable();}
    if (envelope.schemaVersion !== 1 || typeof envelope.updatedAt !== 'string' || !Number.isFinite(Date.parse(envelope.updatedAt))) throw unavailable();
    const validated = sharedStorySchema.safeParse(envelope.story);
    if (!validated.success) throw unavailable();
    const story = validated.data;
    // Duplicate references make allocation and pagination ambiguous.
    for (const records of [story.blocks, story.characters, story.locations, story.items, story.research]) {
      if (new Set(records.map(record => record.id)).size !== records.length) throw unavailable();
    }
    return { schemaVersion: 1, story, updatedAt: envelope.updatedAt };
  }

  async assertCurrent(snapshot) {
    const current = await this.read();
    if (current.story.id !== snapshot.story.id || current.updatedAt !== snapshot.updatedAt) {
      throw new SessionError('STORY_CHANGED', 'The active story changed while reading. Refresh get_active_story before continuing.');
    }
  }
}
