/** Screenwritr's browser-safe, versioned story domain. No filesystem or Electron imports. */
export const BLOCK_TYPES = Object.freeze(['scene', 'sceneCharacters', 'titleHeader', 'title', 'sectionEnd', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot', 'note', 'section', 'synopsis', 'lyrics', 'pagebreak']);
const ENTITY_KEYS = ['characters', 'locations', 'items'];
const MAX_TEXT = 10_000_000;
const MAX_BLOCKS = 100_000;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function uid(prefix = 'id') {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}

/** Accepts {title, demo}; a boolean is also accepted as a convenience. */
export function createStory(options = {}) {
  if (typeof options === 'boolean') options = { demo: options };
  if (options.demo) return createDemoStory();
  const now = new Date().toISOString();
  return {
    format: 'screenwritr', version: 1, id: uid('story'), title: options.title || 'Untitled story', subtitle: '',
    logline: '', synopsis: '', authors: '', genre: '', language: 'en', contact: '', copyright: '', createdAt: now, updatedAt: now,
    blocks: [{ id: uid('block'), type: 'scene', text: 'INT. LOCATION - DAY' }, { id: uid('block'), type: 'action', text: '' }],
    scenes: {}, characters: [], locations: [], items: [], research: [], comments: [], versions: [], mindmap: { nodes: [], edges: [] },
    settings: { theme: 'light', font: 'Courier Prime', paper: 'a4', sceneNumbers: true, spellcheck: true, goalWords: 1000, typewriter: false, focus: false, showRevisions: false, revisionColor: '#6a7eec', firstPageNumber: 1 },
    writingSessions: [],
  };
}

export function createDemoStory(){
 const story=createStory({title:'The Last Light'});Object.assign(story,{subtitle:'A story about finding your way home',authors:'Ama Mensah',genre:'Drama / Mystery',logline:'A restoration architect returns to her father’s lighthouse for its final night. A signal from the sea asks her family to decide what a light is really for.',synopsis:'Ama comes home to help decommission the Cape Three Points lighthouse. Her father Kofi refuses to pack. Her sister Esi refuses to let another farewell go unspoken. When a mysterious signal interrupts the final watch, the three must look toward the same horizon.'});
 const content=[
 ['scene','EXT. CAPE THREE POINTS ROAD - DUSK'],['action','The coast opens beneath a copper sky. Fishing boats are dark stitches on the Atlantic. Above them, a lighthouse turns its patient eye.'],['action','AMA MENSAH, 34, drives toward the light. A rolled architectural plan rests on the passenger seat. Her phone rings. She lets it.'],
 ['scene','INT. AMA’S CAR - DUSK'],['character','ESI (V.O.)'],['dialogue','You passed the turn.'],['character','AMA'],['dialogue','I know where home is.'],['character','ESI (V.O.)'],['dialogue','Then why do you always miss it?'],['action','Ama slows. The indicator clicks into the silence.'],
 ['scene','EXT. LIGHTHOUSE COURTYARD - DUSK'],['action','KOFI MENSAH, 68, oils a hinge that no longer needs oiling. ESI leans against a crate marked FRAGILE.'],['character','KOFI'],['dialogue','You brought your measuring things.'],['character','AMA'],['dialogue','You asked for a restoration architect.'],['character','KOFI'],['dialogue','I asked for my daughter.'],
 ['scene','INT. LIGHTHOUSE WORKROOM - NIGHT'],['action','Ama unrolls the plan across a table. Kofi moves a brass compass out of its way, then changes his mind and puts it back.'],['character','ESI'],['dialogue','The new system comes at six. We could spend tonight being here.'],['parenthetical','(to Ama)'],['dialogue','All three of us.'],['action','The old radio crackles. A voice almost forms.'],
 ['scene','INT. LIGHTHOUSE LANTERN ROOM - NIGHT'],['action','The lens turns. Dust becomes a constellation in the beam. Ama finds a fresh pencil mark on the chart.'],['character','AMA'],['dialogue','You still mark every boat?'],['character','KOFI'],['dialogue','Someone should know they passed.'],['action','Three clear pulses come through the radio. Kofi’s hand closes around the brass compass.'],
 ['scene','EXT. LIGHTHOUSE BALCONY - NIGHT'],['action','Rain arrives all at once. Esi holds the radio beneath her jacket. Ama searches the black water.'],['character','ESI'],['dialogue','There. Between the waves.'],['character','AMA'],['dialogue','I can’t see it.'],['character','KOFI'],['dialogue','You don’t have to see someone to keep a light for them.'],
 ['scene','INT. LIGHTHOUSE LANTERN ROOM - PRE-DAWN'],['action','Ama adjusts the old reflector by hand. Kofi follows her pencil marks. Esi counts the intervals between signals. For the first time tonight, they work together.'],['character','AMA'],['dialogue','Keep your eyes on the light. We are here.'],['action','The radio answers with one long, steady tone. Then the sea grows quiet.'],
 ['scene','EXT. CAPE THREE POINTS BEACH - DAWN'],['action','The lighthouse beam fades into morning. Ama, Kofi and Esi walk down to the water. The compass stays in Kofi’s pocket.'],['character','ESI'],['dialogue','Will you miss the last train?'],['character','AMA'],['dialogue','There’s another one tomorrow.'],['transition','FADE OUT.']];
 story.blocks=content.map(([type,text])=>({id:uid('block'),type,text}));const titles=['Homeward','The missed turn','A place at the table','The signal','Someone should know','A light for them','The final watch','First light'];const synopses=['Ama returns to a coast she knows by heart.','Esi challenges the distance between them.','Kofi asks Ama to arrive as his daughter.','The family hears a signal on the old radio.','Ama discovers the meaning of Kofi’s quiet work.','A distant light gives the family a common purpose.','The three guide an unseen vessel together.','Ama chooses to stay for another morning.'];story.blocks.filter(b=>b.type==='scene').forEach((b,i)=>{story.scenes[b.id]={id:b.id,title:titles[i],synopsis:synopses[i],color:i<3?'#7e9c88':i<6?'#b495ab':'#c1aa6d',act:i<3?'Act I · Homeward':i<6?'Act II · The signal':'Act III · First light',sequence:i<3?'The return':i<6?'The call':'The answer',status:i<3?'Revised':'First draft',notes:'',tags:i<3?['family','home']:i<6?['signal','sea']:['first light','belonging']};});
 story.characters=[
 {id:uid('character'),name:'AMA',description:'Ama Mensah, 34. A restoration architect who knows how to save buildings and struggles to stay inside the memories they hold.',notes:'She measures spaces when she cannot find the words.',color:'#7e9c88',aliases:['Ama Mensah'],fields:{Role:'Protagonist',Want:'To complete the job and leave',Need:'To allow herself to belong'}},
 {id:uid('character'),name:'KOFI',description:'Kofi Mensah, 68. The lighthouse keeper and Ama’s father. His care arrives as small practical acts, repeated until they look like a life.',notes:'His compass is a habit, not a certainty.',color:'#b88764',aliases:['Kofi Mensah'],fields:{Role:'Father / keeper',Want:'One final watch',Need:'To share the weight of keeping the light'}},
 {id:uid('character'),name:'ESI',description:'Esi Mensah, 29. Ama’s sister. Warm, direct and tired of carrying every unsaid thing between the people she loves.',notes:'She makes a joke just before telling the truth.',color:'#b495ab',aliases:['Esi Mensah'],fields:{Role:'Sister / bridge',Want:'The family together',Need:'To stop being responsible for everyone’s return'}}];
 story.locations=[{id:uid('location'),name:'CAPE THREE POINTS LIGHTHOUSE',description:'A white coastal tower, a small workroom and a lantern room where salt, dust and light make time visible.',notes:'The space should feel used and loved.',color:'#8c9fbc',aliases:['LIGHTHOUSE COURTYARD','LIGHTHOUSE WORKROOM','LIGHTHOUSE LANTERN ROOM','LIGHTHOUSE BALCONY'],fields:{Setting:'Coastal Ghana'}},{id:uid('location'),name:'CAPE THREE POINTS BEACH',description:'Open sand and rock beneath the tower. The morning horizon makes every distance feel possible.',notes:'',color:'#c1aa6d',aliases:[],fields:{Mood:'Release'}}];story.items=[{id:uid('item'),name:'Brass compass',description:'A worn compass that Kofi carries on every watch. Ama moves it aside, then learns to leave it a place.',notes:'A recurring image of direction and care.',color:'#b88764',aliases:['compass'],fields:{Significance:'A way to belong'}}];
 story.research=[{id:uid('research'),parentId:null,type:'note',title:'Lighthouse history & coastal life',content:'Research the working routines, materials, local maritime histories and living communities around the story’s coastal setting. Keep factual research separate from the fictional family.',url:''},{id:uid('research'),parentId:null,type:'note',title:'The central question',content:'What does it mean to keep a light for someone you cannot see? Every scene should move from private distance toward a shared horizon.',url:''}];
 const nodes=[['ama','Ama · return',120,160,'#7e9c88'],['kofi','Kofi · the watch',430,60,'#b88764'],['esi','Esi · the bridge',430,270,'#b495ab'],['light','The lighthouse',730,160,'#8c9fbc'],['signal','The signal',1010,60,'#b495ab'],['home','A shared horizon',1010,280,'#c1aa6d']];story.mindmap={nodes:nodes.map(([id,label,x,y,color])=>({id,label,x,y,color})),edges:[{id:'edge1',from:'ama',to:'kofi',label:'an unfinished conversation'},{id:'edge2',from:'ama',to:'esi',label:'the way back'},{id:'edge3',from:'kofi',to:'light',label:'care'},{id:'edge4',from:'esi',to:'light',label:'one final night'},{id:'edge5',from:'light',to:'signal',label:'a call'},{id:'edge6',from:'light',to:'home',label:'an answer'}]};return story;
}

export function countWords(text) { return (String(text).match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) || []).length; }
export function characterName(text) { return String(text).replace(/^@/, '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*\^\s*$/, '').trim().replace(/\s+/g, ' '); }
export function parseHeading(text) {
  const clean = String(text).replace(/^\./, '').replace(/\s+#.*?#\s*$/, '').trim();
  const match = clean.match(/^(INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|INT\.?|EXT\.?|I\.?\s*\/\s*E\.?)\s*(.*)$/i);
  const body = match ? match[2] : clean;
  const pieces = body.split(/\s+[–—-]\s+/);
  return { interior: match ? match[1].toUpperCase().replace(/\.$/, '') : '', location: pieces.length > 1 ? pieces.slice(0, -1).join(' - ').trim() : body.trim(), time: pieces.length > 1 ? pieces.at(-1).trim() : '' };
}

export function getScenes(story) {
  const scenes = [];
  let current;
  for (const block of story.blocks) {
    if (block.type === 'scene') {
      const meta = story.scenes[block.id] ?? { id: block.id, title: '', synopsis: '', color: '#b8c8bb', act: '', sequence: '', status: 'Draft', notes: '', tags: [] };
      current = { id: block.id, heading: block.text, number: meta.lockedNumber || (scenes.length + Number(story.settings.sceneNumberStart || 1)), blocks: [], meta, ...parseHeading(block.text), characters: [], words: 0, duration: 0 };
      scenes.push(current);
    }
    if (current) {
      current.blocks.push(block);
      if (!block.omitted && block.type === 'sceneCharacters') for (const raw of block.text.split(/[,;\n]+|\s+(?:&|\/|and)\s+/i)) { const name = characterName(raw); if (name && !current.characters.includes(name)) current.characters.push(name); }
      if (!block.omitted && !['note', 'section', 'sectionEnd', 'sceneCharacters', 'titleHeader', 'synopsis', 'pagebreak'].includes(block.type)) current.words += countWords(block.text);
      if (!block.omitted && block.type === 'character') {
        const name = characterName(block.text);
        if (name && !current.characters.includes(name)) current.characters.push(name);
      }
    }
  }
  scenes.forEach(scene => { const rate=Number(story.settings.wordsPerMinute)||160; const duration=story.settings.timingMode==='pages'?scene.words/180:story.settings.timingMode==='flexible'?scene.blocks.filter(b=>b.type==='dialogue').reduce((n,b)=>n+countWords(b.text),0)/rate+scene.blocks.filter(b=>b.type==='action'||b.type==='shot').reduce((n,b)=>n+countWords(b.text),0)/90:scene.words/rate; scene.duration=Math.max(0.1,Math.round(duration*10)/10); });
  return scenes;
}

const keyOf = value => String(value).normalize('NFKC').toLocaleUpperCase('en').replace(/\s+/g, ' ').trim();
function reconcile(explicit, candidates, kind) {
  const result = explicit.map(entity => ({ ...entity, aliases: [...entity.aliases], fields: { ...entity.fields }, sceneIds: [], mentions: 0, derived: false }));
  const lookup = new Map();
  result.forEach(entity => [entity.name, ...entity.aliases].forEach(alias => lookup.set(keyOf(alias), entity)));
  for (const candidate of candidates) {
    const key = keyOf(candidate.name);
    if (!key) continue;
    let entity = lookup.get(key);
    if (!entity) {
      entity = { id: `${kind}_${encodeURIComponent(key)}`, name: candidate.name, description: '', notes: '', color: kind === 'character' ? '#b8c8bb' : '#b7c8d0', aliases: [], fields: {}, sceneIds: [], mentions: 0, derived: true };
      result.push(entity); lookup.set(key, entity);
    }
    entity.mentions += candidate.mentions || 1;
    if (candidate.sceneId && !entity.sceneIds.includes(candidate.sceneId)) entity.sceneIds.push(candidate.sceneId);
  }
  return result;
}

/** Candidates come from screenplay blocks; saved entity descriptions remain authoritative. */
export function extractEntities(story) {
  const scenes = getScenes(story);
  const characters = [], locations = [], items = [];
  for (const scene of scenes) {
    if (scene.location) locations.push({ name: scene.location, sceneId: scene.id });
    for (const block of scene.blocks) {
      if (block.omitted) continue;
      if (block.type === 'character') characters.push({ name: characterName(block.text), sceneId: scene.id });
      if (block.type === 'sceneCharacters') for (const raw of block.text.split(/[,;\n]+|\s+(?:&|\/|and)\s+/i)) { const name=characterName(raw); if(name) characters.push({name,sceneId:scene.id}); }
      if (['action', 'dialogue', 'parenthetical', 'shot'].includes(block.type)) {
        const text = keyOf(block.text);
        for (const item of story.items) {
          if ([item.name, ...item.aliases].filter(Boolean).some(name => text.includes(keyOf(name)))) items.push({ name: item.name, sceneId: scene.id });
        }
      }
    }
  }
  // Character cues outside any scene still belong to the cast.
  const covered = new Set(scenes.flatMap(scene => scene.blocks.map(block => block.id)));
  story.blocks.filter(block => !covered.has(block.id) && block.type === 'character' && !block.omitted).forEach(block => characters.push({ name: characterName(block.text) }));
  return { characters: reconcile(story.characters, characters, 'character'), locations: reconcile(story.locations, locations, 'location'), items: reconcile(story.items, items, 'item') };
}

export function getStats(story) {
  const printable = story.blocks.filter(block => !block.omitted && !['note', 'section', 'sectionEnd', 'sceneCharacters', 'titleHeader', 'synopsis', 'pagebreak'].includes(block.type));
  const words = printable.reduce((total, block) => total + countWords(block.text), 0);
  const dialogueWords = printable.filter(block => ['dialogue', 'lyrics'].includes(block.type)).reduce((total, block) => total + countWords(block.text), 0);
  const actionWords = printable.filter(block => ['action', 'shot'].includes(block.type)).reduce((total, block) => total + countWords(block.text), 0);
  const scenes = getScenes(story), entities = extractEntities(story);
  const pages = Math.max(1, Math.ceil(words / 180));
  const minutes = Math.round(scenes.reduce((n,scene)=>n+scene.duration,0)*10)/10;
  return { words, scenes: scenes.length, characters: entities.characters.length, locations: entities.locations.length, dialogueWords, actionWords, pages, minutes, duration: minutes, progress: story.settings.goalWords > 0 ? Math.min(100, Math.round(words / story.settings.goalWords * 100)) : 0, comments: story.comments.filter(comment => !comment.resolved).length, research: story.research.length, versions: story.versions.length, dialoguePercentage: words ? Math.round(dialogueWords / words * 100) : 0 };
}

function fail(message) { throw new Error(`Invalid Screenwritr story: ${message}`); }
function object(value, path) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${path} must be an object`); }
function string(value, path, limit = MAX_TEXT) { if (typeof value !== 'string' || value.length > limit) fail(`${path} must be a string up to ${limit} characters`); }
function array(value, path, limit = 100_000) { if (!Array.isArray(value) || value.length > limit) fail(`${path} must be an array with at most ${limit} entries`); }
function date(value, path) { string(value, path, 100); if (!Number.isFinite(Date.parse(value))) fail(`${path} must be a valid date`); }
function finite(value, path) { if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1e9) fail(`${path} must be a finite bounded number`); }
function uniqueIds(entries, path) { const ids = new Set(); entries.forEach(entry => { object(entry, path); string(entry.id, `${path}.id`, 300); if (FORBIDDEN_KEYS.has(entry.id)) fail('reserved identifier'); if (!entry.id || ids.has(entry.id)) fail(`${path} contains empty or duplicate ids`); ids.add(entry.id); }); }
function jsonSafe(value, depth = 0, budget = { count: 0 }) {
  if (++budget.count > 2_000_000 || depth > 80) fail('document exceeds safe structural bounds');
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') { if (value.length > MAX_TEXT) fail('a field exceeds text limit'); return; }
  if (typeof value === 'number') { if (!Number.isFinite(value)) fail('non-finite number'); return; }
  if (typeof value !== 'object') fail('document contains a non-JSON value');
  if (Array.isArray(value)) { if (value.length > 100_000) fail('array exceeds entry limit'); value.forEach(child => jsonSafe(child, depth + 1, budget)); return; }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) fail('unsupported object prototype');
  const keys = Object.keys(value); if (keys.length > 100_000) fail('object exceeds field limit');
  keys.forEach(key => { if (FORBIDDEN_KEYS.has(key)) fail('unsafe object key'); jsonSafe(value[key], depth + 1, budget); });
}
function blocks(value, path) {
  array(value, path, MAX_BLOCKS); uniqueIds(value, path);
  value.forEach(block => { if (block.content !== undefined) { array(block.content, 'block.content', 100000); block.content.forEach(node=>{object(node,'inline node');if(!['text','hardBreak'].includes(node.type))fail('unknown inline node type');if(node.type==='text')string(node.text,'inline text');if(node.marks!==undefined){array(node.marks,'inline marks',16);node.marks.forEach(mark=>{object(mark,'inline mark');if(!['bold','italic','underline','strike'].includes(mark.type))fail('unknown inline mark');});}}); } if (!BLOCK_TYPES.includes(block.type)) fail(`${path} has unknown block type`); string(block.text, `${path}.text`); if (block.revision !== undefined) string(block.revision, `${path}.revision`, 100); if (block.omitted !== undefined && typeof block.omitted !== 'boolean') fail(`${path}.omitted must be boolean`); });
}

/** Strict shape/bounds validation, with lossless preservation of JSON extension fields. */
export function validateStory(value) {
  jsonSafe(value); object(value, 'root');
  if (value.format !== 'screenwritr' || value.version !== 1) fail('unsupported format or version');
  for (const key of ['id', 'title', 'subtitle', 'logline', 'synopsis', 'authors', 'genre', 'language', 'contact', 'copyright']) string(value[key], key, key === 'id' ? 300 : MAX_TEXT);
  if (!value.id) fail('id is required');
  date(value.createdAt, 'createdAt'); date(value.updatedAt, 'updatedAt'); blocks(value.blocks, 'blocks');
  object(value.scenes, 'scenes');
  Object.entries(value.scenes).forEach(([id, scene]) => { object(scene, `scenes.${id}`); string(scene.id, 'scene.id', 300); if (scene.id !== id) fail('scene key/id mismatch'); ['title', 'synopsis', 'color', 'act', 'sequence', 'status', 'notes'].forEach(key => string(scene[key], `scene.${key}`)); array(scene.tags, 'scene.tags', 1000); scene.tags.forEach(tag => string(tag, 'scene.tag', 1000)); });
  for (const key of ENTITY_KEYS) {
    array(value[key], key, 10_000); uniqueIds(value[key], key);
    value[key].forEach(entity => { ['name', 'description', 'notes', 'color'].forEach(field => string(entity[field], `${key}.${field}`)); array(entity.aliases, `${key}.aliases`, 1000); entity.aliases.forEach(alias => string(alias, 'alias', 1000)); object(entity.fields, `${key}.fields`); Object.values(entity.fields).forEach(field => string(field, 'entity field')); if (entity.image !== undefined) string(entity.image, 'image'); });
  }
  array(value.research, 'research', 20_000); uniqueIds(value.research, 'research');
  value.research.forEach(item => { if (!['folder', 'note', 'link', 'image', 'document'].includes(item.type)) fail('unknown research type'); if (item.parentId !== null) string(item.parentId, 'research.parentId', 300); ['title', 'content', 'url'].forEach(key => string(item[key], `research.${key}`)); if (item.attachment !== undefined) string(item.attachment, 'research.attachment'); });
  array(value.comments, 'comments', 50_000); uniqueIds(value.comments, 'comments');
  value.comments.forEach(comment => { ['blockId', 'text', 'author'].forEach(key => string(comment[key], `comment.${key}`)); date(comment.createdAt, 'comment.createdAt'); if (typeof comment.resolved !== 'boolean') fail('comment.resolved must be boolean'); });
  array(value.versions, 'versions', 1000); uniqueIds(value.versions, 'versions');
  value.versions.forEach(version => { string(version.name, 'version.name'); date(version.createdAt, 'version.createdAt'); blocks(version.blocks, 'version.blocks'); });
  object(value.mindmap, 'mindmap'); array(value.mindmap.nodes, 'mindmap.nodes', 20_000); uniqueIds(value.mindmap.nodes, 'mindmap.nodes');
  value.mindmap.nodes.forEach(node => { string(node.label, 'mindmap.label'); string(node.color, 'mindmap.color', 100); finite(node.x, 'mindmap.x'); finite(node.y, 'mindmap.y'); });
  array(value.mindmap.edges, 'mindmap.edges', 50_000); uniqueIds(value.mindmap.edges, 'mindmap.edges'); value.mindmap.edges.forEach(edge => ['from', 'to', 'label'].forEach(key => string(edge[key], `edge.${key}`)));
  object(value.settings, 'settings'); if (!['light', 'dark'].includes(value.settings.theme) || !['a4', 'letter'].includes(value.settings.paper)) fail('invalid theme or paper');
  ['font', 'revisionColor'].forEach(key => string(value.settings[key], `settings.${key}`, 1000));
  ['sceneNumbers', 'spellcheck', 'typewriter', 'focus', 'showRevisions'].forEach(key => { if (typeof value.settings[key] !== 'boolean') fail(`settings.${key} must be boolean`); });
  ['goalWords', 'firstPageNumber'].forEach(key => { finite(value.settings[key], `settings.${key}`); if (value.settings[key] < 0) fail(`settings.${key} cannot be negative`); });
  array(value.writingSessions, 'writingSessions', 100_000); value.writingSessions.forEach(session => { string(session.date, 'session.date', 100); finite(session.words, 'session.words'); finite(session.minutes, 'session.minutes'); if (session.words < 0 || session.minutes < 0) fail('session totals cannot be negative'); });
  return JSON.parse(JSON.stringify(value));
}

/** Only supported inline nodes whose text agrees with the canonical paragraph reach the editor. */
export function editorInlineContent(block) {
  const content = Array.isArray(block.content) ? block.content.flatMap(node => {
    if (node?.type === 'hardBreak') return [{type:'hardBreak'}];
    if (node?.type !== 'text' || typeof node.text !== 'string' || !node.text) return [];
    const marks = Array.isArray(node.marks) ? node.marks.filter(mark => ['bold','italic','underline','strike'].includes(mark?.type)).map(mark => ({type:mark.type})) : [];
    return [{type:'text',text:node.text,...(marks.length?{marks}:{})}];
  }) : [];
  const text=content.map(node=>node.type==='hardBreak'?'\n':node.text).join('');
  return text===block.text ? content : block.text ? [{type:'text',text:block.text}] : [];
}
