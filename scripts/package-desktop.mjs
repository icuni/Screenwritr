import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createPackageFromFiles}=require('@electron/asar');
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(await fs.readFile(path.join(root,'package-lock.json'),'utf8'));
if(!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(pkg.version))throw new Error('Invalid package version');
const out=path.join(root,'release','Screenwritr-'+pkg.version+'-win-x64');
try{await fs.access(out);throw new Error('Preserve existing output and choose a new version before rebuilding: '+out);}catch(error){if(error.code!=='ENOENT')throw error;}
const packages=Object.entries(lock.packages).filter(([name,entry])=>name.startsWith('node_modules/')&&!entry.dev);
const rendererOnly=name=>[...name.matchAll(/node_modules\/((?:@[^/]+\/)?[^/]+)/g)].some(([,n])=>n.startsWith('@tiptap/')||n.startsWith('prosemirror-')||n.startsWith('@floating-ui/')||n.startsWith('@types/')||['react','react-dom','scheduler','lucide-react'].includes(n));
const files=new Set();let notices='Screenwritr third-party notices\n\n',included=0;
function parents(file){let current=path.dirname(file);while(current!==root&&current.startsWith(root+path.sep)){files.add(current);current=path.dirname(current);}}
async function walk(directory,dependency=false){
 files.add(directory);parents(directory);
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(dependency&&entry.name==='node_modules')continue;
  if(entry.isSymbolicLink())throw new Error('Unexpected symbolic link in package inputs: '+file);
  if(entry.isDirectory())await walk(file,dependency);
  else if(entry.isFile()){
   if(dependency&&(/\.map$|\.d\.(?:ts|cts|mts)$/.test(entry.name)))continue;
   if(dependency&&file.includes(path.join('sql.js','dist')+path.sep)&&!['sql-wasm.js','sql-wasm.wasm'].includes(entry.name))continue;
   files.add(file);
  }
 }
}
for(const directory of ['dist','electron','lib','mcp'])await walk(path.join(root,directory));
files.add(path.join(root,'package.json'));
for(const [name,entry]of packages){
 const source=path.resolve(root,name);if(!source.startsWith(root+path.sep))throw new Error('Unsafe dependency path');
 let entries;try{entries=await fs.readdir(source,{withFileTypes:true});}catch(error){if(entry.optional)continue;throw error;}
 for(const file of entries.filter(file=>file.isFile()&&/^licen[cs]e(?:\.|$)/i.test(file.name)))notices+='\n\n--- '+name+' '+entry.version+' ---\n\n'+await fs.readFile(path.join(source,file.name),'utf8');
 if(rendererOnly(name))continue;
 await walk(source,true);included++;if(included%25===0)console.log('Selected runtime packages',included);
}
const noticePath=path.join(root,'THIRD-PARTY-NOTICES.txt');await fs.writeFile(noticePath,notices);files.add(noticePath);
await fs.mkdir(path.dirname(out),{recursive:true});
console.log('Copying Electron runtime');await fs.cp(path.join(root,'node_modules','electron','dist'),out,{recursive:true,dereference:true});
console.log('Writing application archive from',files.size,'selected files and directories');
await createPackageFromFiles(root,path.join(out,'resources','app.asar'),[...files].sort());
await fs.rename(path.join(out,'electron.exe'),path.join(out,'Screenwritr.exe'));
await fs.unlink(path.join(out,'resources','default_app.asar')).catch(error=>{if(error.code!=='ENOENT')throw error;});
for(const [source,name]of [['build/icon.ico','Screenwritr.ico'],['README.md','README.md'],['THIRD-PARTY-NOTICES.txt','THIRD-PARTY-NOTICES.txt']])await fs.copyFile(path.join(root,source),path.join(out,name));
const core=path.join(root,'release','Screenwritr-'+pkg.version+'.asar');await fs.copyFile(path.join(out,'resources','app.asar'),core);
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const receipt={product:'Screenwritr',version:pkg.version,electron:(await fs.readFile(path.join(out,'version'),'utf8')).trim(),productionPackages:included,archiveEntries:files.size,executableSha256:await hash(path.join(out,'Screenwritr.exe')),asarSha256:await hash(core),coreBytes:(await fs.stat(core)).size,createdAt:new Date().toISOString()};
await fs.writeFile(path.join(out,'build-receipt.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify({output:out,module:core,...receipt},null,2));
