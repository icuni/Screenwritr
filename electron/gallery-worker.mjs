import path from 'node:path';
import { readSource, importSource } from '../lib/import-source.mjs';
import { summarizeStory } from '../lib/writing-gallery.mjs';
process.on('message', async ({requestId,file}) => {
  try {
    const {bytes,format,signature}=await readSource(file);
    const result=await importSource(bytes,format,{title:path.basename(file,path.extname(file)),sourceName:path.basename(file),sourceArchive:'gallery-preview'});
    process.send?.({requestId,ok:true,signature,summary:summarizeStory(result.story)});
  } catch (error) { process.send?.({requestId,ok:false,error:String(error.message).slice(0,600)}); }
});
