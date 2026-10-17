import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url),{extractFile}=require('@electron/asar');
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')),folder=path.join(root,'release','Screenwritr-'+pkg.version+'-win-x64'),archive=path.join(folder,'resources','app.asar');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputs=['package.json','THIRD-PARTY-NOTICES.txt'];
async function walk(relative){for(const entry of await fs.readdir(path.join(root,relative),{withFileTypes:true})){const file=path.join(relative,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile())inputs.push(file);}}
for(const directory of ['dist','electron','lib','mcp'])await walk(directory);
const files=[];
for(const relative of inputs){const expected=await fs.readFile(path.join(root,relative)),shipped=extractFile(archive,path.normalize(relative));if(!expected.equals(shipped))throw new Error('Packaged input differs: '+relative);files.push({path:relative.split(path.sep).join('/'),bytes:expected.length,sha256:hash(expected)});}
const installer=path.join(root,'release','Screenwritr-'+pkg.version+'-Setup.exe'),modulePath=path.join(root,'release','Screenwritr-'+pkg.version+'.asar');
const archiveBytes=await fs.readFile(archive),moduleBytes=await fs.readFile(modulePath);if(!archiveBytes.equals(moduleBytes))throw new Error('Shared module differs from packaged application');
const installerBytes=await fs.readFile(installer);
const receipt={product:'Screenwritr',version:pkg.version,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),createdAt:new Date().toISOString(),appFilesExactMatch:true,inputCount:files.length,files,asarBytes:archiveBytes.length,asarSha256:hash(archiveBytes),executableSha256:hash(await fs.readFile(path.join(folder,'Screenwritr.exe'))),installerBytes:installerBytes.length,installerSha256:hash(installerBytes)};
const target=path.join(root,'.local','release-validation-'+pkg.version+'.json');await fs.writeFile(target,JSON.stringify(receipt,null,2));console.log(JSON.stringify({version:pkg.version,sourceCommit:receipt.sourceCommit,inputCount:files.length,appFilesExactMatch:true,asarBytes:receipt.asarBytes,asarSha256:receipt.asarSha256,installerBytes:receipt.installerBytes,installerSha256:receipt.installerSha256,receipt:target},null,2));
