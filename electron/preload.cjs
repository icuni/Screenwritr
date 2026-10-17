'use strict';
const {contextBridge,ipcRenderer}=require('electron');
const invoke=(name,...args)=>ipcRenderer.invoke('screenwritr:'+name,...args);
contextBridge.exposeInMainWorld('screenwritr',Object.freeze({
 getGallery:query=>invoke('gallery-list',query),refreshGallery:()=>invoke('gallery-refresh'),addGalleryFiles:()=>invoke('gallery-add-files'),addGalleryFolder:()=>invoke('gallery-add-folder'),openGalleryEntry:id=>invoke('gallery-open',id),
 load:()=>invoke('load'),save:(story,saveAs=false)=>invoke('save',story,saveAs),autosave:story=>invoke('autosave',story),open:()=>invoke('open'),importStory:()=>invoke('import'),exportStory:(story,format)=>invoke('export',story,format),attach:()=>invoke('attach'),getMcpStatus:()=>invoke('mcp-status'),setMcpEnabled:enabled=>invoke('set-mcp',enabled),openExternal:url=>invoke('external',url),windowControls:action=>invoke('window',action),
 onMenu:callback=>{if(typeof callback!=='function')throw new TypeError('A menu callback is required.');const listener=(_event,action)=>{Promise.resolve().then(()=>callback(action)).then(()=>{if(action==='before-close')ipcRenderer.send('screenwritr:close-ready',{ok:true});}).catch(error=>{if(action==='before-close')ipcRenderer.send('screenwritr:close-ready',{ok:false,error:String(error?.message||error).slice(0,2000)});});};ipcRenderer.on('screenwritr:menu',listener);return ()=>ipcRenderer.removeListener('screenwritr:menu',listener);}
}));
