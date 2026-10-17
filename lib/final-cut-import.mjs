import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createStory, uid, validateStory } from './story.mjs';
const MAX_BYTES = 25 * 1024 * 1024;
function document(source) {
  if (typeof source !== 'string' || Buffer.byteLength(source) > MAX_BYTES) throw new Error('Final Cut XML exceeds the 25 MB import limit.');
  if (/<!ENTITY\b|<!DOCTYPE[^>]*(?:SYSTEM|PUBLIC|\[)/i.test(source)) throw new Error('External entities and DTD subsets are not supported.');
  const clean = source.replace(/<!DOCTYPE\s+(?:fcpxml|xmeml)\s*>/ig, '');
  if (/<!DOCTYPE/i.test(clean)) throw new Error('Unsupported XML declaration.');
  let depth = 0, count = 0;
  for (const tag of clean.matchAll(/<\/?([\w:.-]+)(?=[\s/>])[^<>]*>/g)) {
    if (++count > 200000) throw new Error('Final Cut XML contains too many elements.');
    if (tag[0].startsWith('</')) depth--; else if (!tag[0].endsWith('/>') && ++depth > 80) throw new Error('Final Cut XML is too deeply nested.');
  }
  if (XMLValidator.validate(clean) !== true) throw new Error('This is not valid Final Cut XML.');
  const parsed = new XMLParser({ preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: '', trimValues: false, parseTagValue: false, processEntities: true }).parse(clean);
  const root = parsed.find(n => n.fcpxml || n.xmeml);
  if (!root) throw new Error('Expected an FCPXML or legacy Final Cut xmeml document.');
  return { root, format: root.fcpxml ? 'fcpxml' : 'xmeml' };
}
const children = node => Object.entries(node).find(([k,v]) => k !== ':@' && Array.isArray(v))?.[1] || [];
const tagOf = node => Object.keys(node).find(k => k !== ':@');
const attr = node => node[':@'] || {};
function all(nodes, name) {
  const result = [], stack = [...nodes].reverse();
  while (stack.length) { const node = stack.pop(); if (Object.hasOwn(node, name)) result.push(node); stack.push(...children(node).slice().reverse()); }
  return result;
}
function text(nodes) {
  const parts = [], stack = [...nodes].reverse();
  while (stack.length) { const node = stack.pop(); if (Object.hasOwn(node, '#text')) parts.push(String(node['#text'])); else stack.push(...children(node).slice().reverse()); }
  return parts.join('').trim();
}
const value = (node, name) => text(all(children(node), name)[0]?.[name] || []);
function projects(doc) {
  const candidates = all(children(doc.root), doc.format === 'fcpxml' ? 'project' : 'sequence');
  return candidates.length ? candidates : [doc.root];
}
export function listFinalCutProjects(source) {
  const doc = document(source);
  return projects(doc).map((p,i) => ({ index:i, name:attr(p).name || value(p,'name') || 'Timeline ' + (i+1) }));
}
export function importFinalCut(source, options = {}) {
  const doc = document(source), available = projects(doc), index = options.projectIndex ?? 0;
  if (!Number.isInteger(index) || index < 0 || index >= available.length) throw new Error('Choose a project present in the Final Cut XML.');
  const selected = available[index], name = attr(selected).name || value(selected,'name') || options.title || 'Imported timeline';
  const story = createStory({ title:name }); story.blocks = [];
  const add = (type, value) => { if (value) story.blocks.push({id:uid('block'),type,text:String(value).slice(0,1000000)}); };
  add('section', name);
  const resources = new Map(all(children(doc.root), 'asset').map(n => [attr(n).id, n]));
  let clips;
  if (doc.format === 'fcpxml') {
    const sequence = all(children(selected), 'sequence')[0];
    const spine = all(sequence ? children(sequence) : children(selected), 'spine')[0];
    clips = (spine ? children(spine) : children(selected)).filter(n => ['asset-clip','clip','ref-clip','sync-clip','mc-clip','title','caption','audio','video','gap'].includes(tagOf(n)));
  } else {
    const media = all(children(selected),'media')[0];
    clips = all(media ? children(media) : children(selected), 'clipitem');
  }
  for (const [i,clip] of clips.entries()) {
    const a = attr(clip), resource = resources.get(a.ref), title = a.name || value(clip,'name') || attr(resource || {}).name || tagOf(clip) + ' ' + (i+1);
    add('scene', title);
    const meta = { id:story.blocks.at(-1).id, title, synopsis:'',color:'#b8c8bb',act:name,sequence:name,status:'Imported outline',notes:'',tags:['Final Cut'] };
    story.scenes[meta.id] = meta;
    const timing = doc.format === 'fcpxml' ? ['offset','start','duration'].filter(k=>a[k]).map(k=>k+': '+a[k]) : ['start','end','in','out','duration'].map(k=>[k,value(clip,k)]).filter(([,v])=>v).map(([k,v])=>k+': '+v+' frames');
    if (timing.length) add('note', timing.join(' · '));
    // Preserve nested titles/captions in timeline order. This is text already in the edit, never a transcription.
    for (const node of all(children(clip), 'text')) add('action', text(children(node)));
    for (const node of all(children(clip), 'note')) add('note', text(children(node)));
    for (const node of [...all(children(clip),'marker'),...all(children(clip),'chapter-marker'),...all(children(clip),'rating')]) {
      const m = attr(node); add('note', [m.value || value(node,'name') || 'Marker',m.start,m.note || value(node,'comment')].filter(Boolean).join(' · '));
    }
    for (const node of all(children(clip),'md')) { const m=attr(node); if(m.key && m.value) add('note', m.key+': '+m.value); }
    const sourceUrl = attr(all(children(resource || {}),'media-rep')[0] || {}).src || attr(resource || {}).src || value(clip,'pathurl');
    if (sourceUrl) add('note', 'Media reference: ' + sourceUrl);
  }
  if (!clips.length) add('note','This XML contains no timeline clips. The complete original is preserved.');
  story.synopsis = 'Timeline outline imported from Final Cut: ' + clips.length + ' top-level clips. Titles, captions, notes and markers remain editable.';
  story.timelineImport = {format:doc.format,projectName:name,projectIndex:index,projectCount:available.length,clipCount:clips.length};
  return { story:validateStory(story), warnings:['Final Cut was imported as a story outline. Media, effects, transitions and compound editing data remain in the preserved XML; spoken dialogue is not transcribed.'] };
}
