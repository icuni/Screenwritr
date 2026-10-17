import fs from 'node:fs/promises';
import path from 'node:path';
import { MAX_DOCUMENT_BYTES } from './storage.mjs';
import { validateStory } from './story.mjs';
import { importFdx, importFountain } from './formats.mjs';
import { importFinalCut } from './final-cut-import.mjs';
export const SOURCE_EXTENSIONS = ['screenwritr','kitsp','fdx','fdxt','fountain','txt','docx','odt','trelby','celtx','fcpxml','fcpxmld','xml','fcp','fcpbundle'];
export const FINAL_CUT_NATIVE_MESSAGE = 'Export XML from Final Cut Pro, then add the .fcpxml file or .fcpxmld bundle here. Native Final Cut projects require Final Cut Pro on macOS.';
export function sourceFormat(file) { return path.extname(file).slice(1).toLowerCase(); }
export async function readSource(file) {
  const format = sourceFormat(file), stat = await fs.lstat(file);
  if (stat.isSymbolicLink()) throw new Error('Linked files and folders are not followed. Add their original location.');
  if (['fcp','fcpbundle'].includes(format)) throw new Error(FINAL_CUT_NATIVE_MESSAGE);
  let target = file;
  if (stat.isDirectory()) {
    if (format !== 'fcpxmld') throw new Error('This is not a supported story bundle.');
    target = path.join(file,'Info.fcpxml');
    const info=await fs.lstat(target); if(info.isSymbolicLink() || !info.isFile()) throw new Error('The Final Cut bundle is missing a regular Info.fcpxml file.');
  } else if (!stat.isFile()) throw new Error('This is not a regular story file.');
  const info = await fs.stat(target);
  if (info.size > MAX_DOCUMENT_BYTES) throw new Error('Import exceeds the 50 MB safety limit.');
  const bytes = await fs.readFile(target);
  if (bytes.length > MAX_DOCUMENT_BYTES) throw new Error('Import exceeds the 50 MB safety limit.');
  return {bytes,format,archiveName:format==='fcpxmld'?path.basename(file)+'.fcpxml':path.basename(file),signature:info.size+':'+info.mtimeMs};
}
export async function importSource(bytes, format, options = {}) {
  if (format==='screenwritr') return {story:validateStory(JSON.parse(bytes.toString('utf8'))),warnings:[]};
  if (format==='kitsp') return (await import('./kit-import.mjs')).importKitsp(bytes,options);
  if (format==='fdx'||format==='fdxt') return importFdx(bytes.toString('utf8'),options);
  if (format==='fountain'||format==='txt') return importFountain(bytes.toString('utf8'),options);
  if (['fcpxml','fcpxmld','xml'].includes(format)) return importFinalCut(bytes.toString('utf8'),options);
  if (['docx','odt','trelby','celtx'].includes(format)) return (await import('./office-import.mjs')).importOffice(bytes,format,options);
  throw new Error('Unsupported story format.');
}
