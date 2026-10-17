import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { importFinalCut, listFinalCutProjects } from '../lib/final-cut-import.mjs';
import { readSource, importSource } from '../lib/import-source.mjs';
import { createWritingGallery, summarizeStory } from '../lib/writing-gallery.mjs';
import { createStoryStorage, atomicWriteJson } from '../lib/storage.mjs';
import { createStory } from '../lib/story.mjs';
async function temporary(t){const folder=await fs.mkdtemp(path.join(os.tmpdir(),'screenwritr-gallery-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));return folder;}
const fcpxml='<?xml version="1.0"?><!DOCTYPE fcpxml><fcpxml version="1.11"><resources><asset id="a1" name="Harbour" src="file:///never-follow-this.mov"/></resources><library><event name="Film"><project name="The Return"><sequence><spine><asset-clip name="Arrival" ref="a1" offset="0s" duration="120/24s"><title name="Opening"><text><text-style ref="ts1">A new morning.</text-style></text></title><marker start="1s" value="First light" note="Hold here"/><metadata><md key="Location" value="Harbour"/></metadata></asset-clip><caption duration="2s"><text><text-style>Hello &amp; welcome.</text-style></text></caption></spine></sequence></project><project name="Another cut"><sequence><spine><title name="End"><text>Farewell.</text></title></spine></sequence></project></event></library></fcpxml>';
test('Final Cut XML imports selected timeline names, timing, captions, markers and media references',()=>{
 const choices=listFinalCutProjects(fcpxml);assert.deepEqual(choices.map(p=>p.name),['The Return','Another cut']);
 const imported=importFinalCut(fcpxml);assert.equal(imported.story.title,'The Return');assert.equal(imported.story.timelineImport.clipCount,2);
 const text=imported.story.blocks.map(b=>b.text);for(const expected of ['Arrival','A new morning.','Hello & welcome.','First light · 1s · Hold here','Location: Harbour','Media reference: file:///never-follow-this.mov'])assert(text.includes(expected),expected);
 assert(!imported.story.blocks.some(b=>b.type==='dialogue'));assert.equal(importFinalCut(fcpxml,{projectIndex:1}).story.title,'Another cut');
 assert.throws(()=>importFinalCut(fcpxml,{projectIndex:5}),/Choose a project/);
});
test('legacy Final Cut XML retains clip order and frame timing',()=>{
 const xml='<xmeml version="5"><sequence><name>Legacy film</name><media><video><track><clipitem id="c1"><name>First shot</name><duration>100</duration><start>0</start><end>100</end><file><pathurl>file:///old.mov</pathurl></file><marker><name>Review</name><comment>Keep</comment></marker></clipitem><clipitem><name>Second shot</name></clipitem></track></video></media></sequence></xmeml>';
 const story=importFinalCut(xml).story;assert.deepEqual(story.blocks.filter(b=>b.type==='scene').map(b=>b.text),['First shot','Second shot']);assert(story.blocks.some(b=>b.text.includes('duration: 100 frames')));assert(story.blocks.some(b=>b.text==='Review · Keep'));
});
test('Final Cut parser rejects entities, external DTDs, malformed XML and excessive nesting',()=>{
 for(const bad of ['<!DOCTYPE fcpxml SYSTEM "file:///secret"><fcpxml/>','<!DOCTYPE fcpxml [<!ENTITY x "secret">]><fcpxml/>','<not-final-cut/>','<fcpxml><project></fcpxml>','<fcpxml>'+ '<gap>'.repeat(90)+'</gap>'.repeat(90)+'</fcpxml>'])assert.throws(()=>importFinalCut(bad));
});
test('Final Cut XML bundles read only their bounded Info.fcpxml; native projects explain export',async t=>{
 const root=await temporary(t),bundle=path.join(root,'Timeline.fcpxmld');await fs.mkdir(bundle);await fs.writeFile(path.join(bundle,'Info.fcpxml'),fcpxml);await fs.writeFile(path.join(bundle,'media.mov'),'not read');
 const read=await readSource(bundle);assert.equal(read.bytes.toString(),fcpxml);assert.equal((await importSource(read.bytes,read.format)).story.title,'The Return');
 const native=path.join(root,'Library.fcpbundle');await fs.mkdir(native);await assert.rejects(readSource(native),/Export XML/);
});
test('gallery persists source metadata, caches unchanged files, bounds queries and retains unavailable files',async t=>{
 const root=await temporary(t),stories=path.join(root,'Stories'),data=path.join(root,'App');await fs.mkdir(stories);const file=path.join(stories,'one.fountain');await fs.writeFile(file,'Title: One\nAuthor: A Writer\n\nINT. ROOM - DAY\n\nA quiet beginning.');
 let reads=0;const metadata=async file=>{reads++;const source=await readSource(file),result=await importSource(source.bytes,source.format);return {summary:summarizeStory(result.story),signature:source.signature};};
 const gallery=createWritingGallery(data,{readMetadata:metadata});await gallery.initialize();await gallery.addFolder(stories);
 const settle=async g=>{for(let i=0;i<200;i++){if(!g.list().indexing)return;await new Promise(r=>setTimeout(r,10));}throw new Error('Index did not finish');};await settle(gallery);
 let listed=gallery.list();assert.equal(listed.counts.files,1);assert.equal(listed.entries[0].title,'One');assert.equal(reads,1);assert(!JSON.stringify(listed).includes(stories));assert.equal(listed.entries[0].file,undefined);assert.throws(()=>gallery.list({limit:101}),/Invalid gallery page/);assert.throws(()=>gallery.resolveEntry('../../secret'),/no longer/);
 gallery.refresh();await settle(gallery);assert.equal(reads,1);gallery.markOpened(listed.entries[0].id);assert.equal(gallery.list({filter:'recent'}).total,1);await gallery.flush();
 const restored=createWritingGallery(data,{readMetadata:metadata});await restored.initialize();assert.equal(restored.list({search:'quiet'}).total,1);assert.equal(restored.list({filter:'recent'}).total,1);
 await fs.unlink(file);restored.refresh();await settle(restored);assert.equal(restored.list().entries[0].status,'missing');await restored.flush();
});
test('gallery preserves every draft summary and its file baseline across restarts',async t=>{
 const root=await temporary(t),gallery=createWritingGallery(root,{readMetadata:async()=>{throw new Error('Not used');}});await gallery.initialize();const store=createStoryStorage(root),file=path.join(root,'saved.screenwritr'),one=createStory({title:'One'}),two=createStory({title:'Two'});
 await store.save(file,one);await store.autosave(one,file);gallery.recordDraft(one,file,store.baseline(file),true);
 one.blocks[1].text='Newer unsaved words';await store.autosave(one,file);gallery.recordDraft(one,file,store.baseline(file));
 await store.autosave(two);gallery.recordDraft(two);await gallery.flush();
 const restored=createWritingGallery(root,{readMetadata:async()=>{}});await restored.initialize();const entry=restored.resolveEntry('draft_'+one.id);assert.equal(entry.filePath,file);assert.equal(restored.list({filter:'drafts'}).total,2);assert.equal((await store.draft(one.id)).blocks[1].text,'Newer unsaved words');
 const resumed=createStoryStorage(root);resumed.restoreBaseline(file,entry.baseline);await atomicWriteJson(file,{...one,title:'External edit'});await assert.rejects(resumed.save(file,one),/changed outside/);await restored.flush();
});
test('gallery scans nested story files, omits unrelated files and labels native Final Cut libraries',async t=>{
 const root=await temporary(t),stories=path.join(root,'Scripts');await fs.mkdir(path.join(stories,'Nested'),{recursive:true});await fs.writeFile(path.join(stories,'Nested','story.fountain'),'Title: Nested\n\nAn opening.');await fs.writeFile(path.join(stories,'private.pdf'),'unrelated');await fs.mkdir(path.join(stories,'Film.fcpbundle'));
 const gallery=createWritingGallery(path.join(root,'Data'),{readMetadata:async file=>{const src=await readSource(file);return {summary:summarizeStory((await importSource(src.bytes,src.format)).story),signature:src.signature};}});await gallery.initialize();await gallery.addFolder(stories);
 for(let i=0;i<200&&gallery.list().indexing;i++)await new Promise(r=>setTimeout(r,10));
 const result=gallery.list();assert.equal(result.counts.files,2);assert.equal(result.entries.find(e=>e.format==='fcpbundle').status,'export-needed');assert.equal(result.entries.find(e=>e.format==='fountain').title,'Nested');await gallery.flush();
});

test('gallery metadata matches printable word counts and reconciles declared character aliases',async()=>{
 const {createDemoStory,getStats}=await import('../lib/story.mjs');const story=createDemoStory(),summary=summarizeStory(story),stats=getStats(story);
 assert.equal(summary.words,stats.words);assert.equal(summary.characters,stats.characters);assert.equal(summary.locations,stats.locations);
});
test('gallery discovers uncached recovery drafts during migration without losing cached drafts',async t=>{
 const root=await temporary(t),storage=createStoryStorage(root),one=createStory({title:'A cached draft'}),two=createStory({title:'An interrupted draft'});
 await storage.autosave(one);await storage.autosave(two);
 const gallery=createWritingGallery(root,{readMetadata:async()=>{throw new Error('No sources expected');}});await gallery.initialize();gallery.recordDraft(one);await gallery.migrate(storage);
 assert.equal(gallery.list({filter:'drafts'}).total,2);assert.equal(gallery.list({search:'interrupted'}).entries[0].title,two.title);await gallery.flush();
});

test('Final Cut XML accepts wide attribute whitespace without an ambiguous token scan',()=>{
 const xml='<fcpxml'+' '.repeat(80000)+'version="1.11"><project name="Wide spacing"><sequence><spine><title name="Opening"><text>A beginning.</text></title></spine></sequence></project></fcpxml>';
 assert.equal(importFinalCut(xml).story.title,'Wide spacing');
});
