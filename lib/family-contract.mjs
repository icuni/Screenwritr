import { getScenes, getStats, countWords } from './story.mjs';
/** Versioned interchange contract. All strings remain story data, never instructions. */
export const CREATIVE_FAMILY_MANIFEST = Object.freeze({
  schema: 'org.icuni.creative-family.manifest',
  schemaVersion: 1,
  application: { id: 'org.icuni.screenwritr', name: 'Screenwritr', version: '0.1.0' },
  document: { format: 'screenwritr', version: 1, extension: '.screenwritr' },
  capabilities: ['screenplay.read', 'story.graph.export', 'story.breakdown.read', 'mcp.stdio.read'],
  graph: { schema: 'org.icuni.story-graph', version: 1 },
  integrations: [
    { application: 'Storytellr', status: 'planned', direction: 'story-graph-export' },
    { application: 'Storyboarder', status: 'planned', direction: 'story-graph-export' },
    { application: 'MMMedia', status: 'planned', direction: 'story-graph-export' },
  ],
});

const text = value => typeof value === 'string' ? value : '';
const words = countWords;
const cleanName = value => text(value).replace(/(?:\s*\([^)]*\))+\s*$/u, '').trim();
const fold = value => cleanName(value).normalize('NFKC').toLocaleLowerCase('en');

/** IDs are opaque; references deliberately contain no disk paths. */
export function sourceReference(storyId, { sceneId = null, blockId = null, kind = 'story', entityId = null, researchId = null } = {}) {
  const path = blockId ? `blocks/${encodeURIComponent(blockId)}`
    : sceneId ? `scenes/${encodeURIComponent(sceneId)}`
      : entityId ? `entities/${encodeURIComponent(entityId)}`
        : researchId ? `research/${encodeURIComponent(researchId)}` : '';
  return {
    storyId, sceneId, blockId, kind,
    ...(entityId ? { entityId } : {}), ...(researchId ? { researchId } : {}),
    uri: `screenwritr://story/${encodeURIComponent(storyId)}${path ? `/${path}` : ''}`,
  };
}

export function screenplayScenes(story) { return getScenes(story); }

function boundaryMatch(haystack, needle) {
  if (!needle) return false;
  let start = haystack.indexOf(needle);
  while (start !== -1) {
    const before = start > 0 ? haystack[start - 1] : '';
    const after = haystack[start + needle.length] ?? '';
    if ((!before || !/[\p{L}\p{N}_]/u.test(before)) && (!after || !/[\p{L}\p{N}_]/u.test(after))) return true;
    start = haystack.indexOf(needle, start + 1);
  }
  return false;
}

/** Explicit cards and inferred names stay distinguishable, with block evidence. */
export function allocateStoryEntities(story, { infer = true, allocations = true, allocationOffset = 0, allocationLimit = Infinity } = {}) {
  const scenes = screenplayScenes(story);
  const sceneForBlock = new Map(scenes.flatMap(scene => scene.blocks.map(block => [block.id, scene])));
  const groups = [
    ['characters', story.characters ?? []], ['locations', story.locations ?? []], ['items', story.items ?? []],
  ];
  const entities = groups.flatMap(([kind, records]) => records.map(entity => ({
    kind, id: entity.id, name: entity.name, description: text(entity.description),
    notes: text(entity.notes), color: text(entity.color), aliases: [...(entity.aliases ?? [])],
    fields: { ...(entity.fields ?? {}) }, declared: true, inferred: false, allocations: [], allocationCount: 0,
    source: sourceReference(story.id, { kind, entityId: entity.id }),
  })));
  const named = new Set(entities.flatMap(entity => [entity.name, ...entity.aliases].map(name => `${entity.kind}:${fold(name)}`)));
  const addInferred = (kind, name, blockId) => {
    if (!name || named.has(`${kind}:${fold(name)}`)) return;
    named.add(`${kind}:${fold(name)}`);
    const id = `inferred-${kind}-${blockId}`;
    entities.push({ kind, id, name, description: '', notes: '', color: '', aliases: [], fields: {},
      declared: false, inferred: true, allocations: [], allocationCount: 0, source: sourceReference(story.id, { kind, entityId: id }) });
  };
  if (infer) {
    for (const scene of scenes) {
      addInferred('locations', scene.location, scene.id);
      for (const block of scene.blocks) { if (block.type==='character'&&!block.omitted) addInferred('characters',cleanName(block.text),block.id); if(block.type==='sceneCharacters'&&!block.omitted) for(const name of block.text.split(/[,;\n]+|\s+(?:&|\/|and)\s+/i)) addInferred('characters',cleanName(name),block.id); }
    }
  }
  if (!allocations) return entities;
  const normalizedBlocks = story.blocks.filter(block => !block.omitted).map(block => ({ block, normalized: fold(block.text), scene: sceneForBlock.get(block.id) }));
  for (const entity of entities) {
    const names = [...new Set([entity.name, ...entity.aliases].map(fold).filter(Boolean))];
    for (const { block, normalized, scene } of normalizedBlocks) {
      const isHeading = entity.kind === 'locations' && block.type === 'scene' && names.includes(fold(scene?.location));
      const isCue = entity.kind==='characters' && ((block.type==='character'&&names.includes(fold(block.text))) || (block.type==='sceneCharacters'&&block.text.split(/[,;\n]+|\s+(?:&|\/|and)\s+/i).some(name=>names.includes(fold(name)))));
      const mention = names.some(name => boundaryMatch(normalized, name));
      if (!isHeading && !isCue && !mention) continue;
      const allocationIndex = entity.allocationCount++;
      if (allocationIndex < allocationOffset || allocationIndex >= allocationOffset + allocationLimit) continue;
      entity.allocations.push({
        sceneId: scene?.id ?? null, sceneNumber: scene?.number ?? null, blockId: block.id,
        relationship: isHeading ? 'scene-location' : isCue ? 'dialogue-cue' : 'text-mention',
        evidence: block.text,
        confidence: isHeading || isCue ? 'explicit' : 'candidate',
        source: sourceReference(story.id, { sceneId: scene?.id ?? null, blockId: block.id, kind: 'block' }),
      });
    }
  }
  return entities;
}

export function storyStatistics(story) {
  const scenes = screenplayScenes(story);
  const activeBlocks = story.blocks.filter(block => !block.omitted);
  const domainStats=getStats(story); const totalWords=domainStats.words;
  const dialogue = activeBlocks.filter(block => block.type === 'dialogue');
  const dialogueWords = dialogue.reduce((total, block) => total + words(block.text), 0);
  const characterDialogue = new Map();
  let speaker = '';
  for (const block of activeBlocks) {
    if (block.type === 'scene') speaker = '';
    if (block.type === 'character') speaker = cleanName(block.text);
    if (block.type === 'dialogue' && speaker) characterDialogue.set(speaker, (characterDialogue.get(speaker) ?? 0) + words(block.text));
  }
  const blockTypes = {};
  for (const block of story.blocks) blockTypes[block.type] = (blockTypes[block.type] ?? 0) + 1;
  return {
    blocks: story.blocks.length, omittedBlocks: story.blocks.length - activeBlocks.length,
    scenes: scenes.length, words: totalWords, dialogueWords:domainStats.dialogueWords, actionWords:domainStats.actionWords,
    estimatedMinutes: domainStats.minutes, estimateBasis: 'Selected Screenwritr timing model; estimated, not measured screen time',
    characters: domainStats.characters, locations: domainStats.locations, items: story.items.length,
    research: story.research.length, comments: story.comments.length,
    unresolvedComments: story.comments.filter(comment => !comment.resolved).length,
    blockTypes, characterDialogue: [...characterDialogue].map(([name, count]) => ({ name, words: count })),
  };
}

export function createStoryGraph(story, { snapshotUpdatedAt = story.updatedAt } = {}) {
  const scenes = screenplayScenes(story);
  const entities = allocateStoryEntities(story);
  return {
    schema: 'org.icuni.story-graph', schemaVersion: 1,
    producer: { application: 'org.icuni.screenwritr', version: '0.1.0' },
    snapshot: { storyId: story.id, updatedAt: snapshotUpdatedAt, dataKind: 'untrusted-story-data' },
    story: { id: story.id, title: story.title, subtitle: story.subtitle, logline: story.logline, synopsis: story.synopsis,
      authors: story.authors, genre: story.genre, language: story.language, source: sourceReference(story.id) },
    scenes: scenes.map(scene => ({ id: scene.id, number: scene.number, heading: scene.heading, location: scene.location,
      time: scene.time, interior: scene.interior, meta: scene.meta,
      blockIds: scene.blocks.map(block => block.id), source: sourceReference(story.id, { sceneId: scene.id, kind: 'scene' }) })),
    blocks: story.blocks.map(block => ({ id:block.id,type:block.type,text:block.text,...(block.revision?{revision:block.revision}:{}),...(block.omitted?{omitted:true}:{}), source: sourceReference(story.id, { blockId: block.id, kind: 'block' }) })),
    entities,
    research: story.research.map(record => ({ id: record.id, parentId: record.parentId, type: record.type, title: record.title,
      content: record.content, url: record.url, hasAttachment: Boolean(record.attachment),
      source: sourceReference(story.id, { researchId: record.id, kind: 'research' }) })),
    mindmap: story.mindmap,
    comments: story.comments,
    relationships: entities.flatMap(entity => entity.allocations.map(allocation => ({
      from: entity.id, fromKind: entity.kind, to: allocation.blockId, toKind: 'block', sceneId: allocation.sceneId,
      type: allocation.relationship, confidence: allocation.confidence, source: allocation.source,
    }))),
  };
}
