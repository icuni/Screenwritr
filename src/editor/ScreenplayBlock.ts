import { Node,mergeAttributes } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { uid,editorInlineContent } from '../../lib/story.mjs';
import type { Block,BlockType } from '../model';
export const blockLabels:Record<BlockType,string>={scene:'Scene heading',sceneCharacters:'Scene characters',action:'Action',character:'Character',dialogue:'Dialogue',parenthetical:'Parenthetical',transition:'Transition',shot:'Shot',note:'Nonprinting note',section:'Act / sequence',sectionEnd:'End of act',synopsis:'Scene synopsis',lyrics:'Lyrics',pagebreak:'Page break',title:'Title',titleHeader:'Title header'};
const cycle:BlockType[]=['action','character','dialogue','parenthetical','transition','scene','shot','sceneCharacters','note','section','sectionEnd','synopsis','lyrics','pagebreak','title','titleHeader'];
const next:Partial<Record<BlockType,BlockType>>={scene:'action',character:'dialogue',parenthetical:'dialogue',transition:'scene',section:'scene',lyrics:'lyrics'};
export const ScreenplayBlock=Node.create({name:'screenplayBlock',addOptions(){return {enterTransitions:{} as Partial<Record<BlockType,BlockType>>};},group:'block',content:'inline*',defining:true,
  addAttributes(){return {id:{default:null},blockType:{default:'action'},revision:{default:null},omitted:{default:false}};},
  parseHTML(){return [{tag:'p[data-type]',getAttrs:element=>({id:element.getAttribute('data-id'),blockType:element.getAttribute('data-type')})},{tag:'p'}];},
  renderHTML({node,HTMLAttributes}){return ['p',mergeAttributes(HTMLAttributes,{'data-type':node.attrs.blockType,'data-id':node.attrs.id,'data-revision':node.attrs.revision,'data-omitted':node.attrs.omitted||undefined}),0];},
  addKeyboardShortcuts(){const set=(type:BlockType)=>this.editor.commands.updateAttributes(this.name,{blockType:type});return {
    Enter:()=>{const parent=this.editor.state.selection.$from.parent;if(parent.type.name!==this.name)return false;const type=parent.attrs.blockType as BlockType;if(!parent.textContent&&type!=='action')return set('action');return this.editor.chain().splitBlock().updateAttributes(this.name,{id:uid('block'),blockType:this.options.enterTransitions[type]||next[type]||'action',revision:null}).run();},
    Tab:()=>set(cycle[(cycle.indexOf(this.editor.state.selection.$from.parent.attrs.blockType)+1)%cycle.length]),
    'Shift-Tab':()=>set(cycle[(cycle.indexOf(this.editor.state.selection.$from.parent.attrs.blockType)-1+cycle.length)%cycle.length]),
    'Mod-1':()=>set('scene'),'Mod-2':()=>set('action'),'Mod-3':()=>set('character'),'Mod-4':()=>set('dialogue'),'Mod-5':()=>set('parenthetical'),'Mod-6':()=>set('transition')};},
  addProseMirrorPlugins(){return [new Plugin({appendTransaction:(transactions,_old,state)=>{if(!transactions.some(t=>t.docChanged))return null;const tr=state.tr;const ids=new Set();let changed=false;state.doc.descendants((node,pos)=>{if(node.type.name!=='screenplayBlock')return;let {id,blockType}=node.attrs;if(!id||ids.has(id)){id=uid('block');changed=true;}ids.add(id);if(blockType==='action'&&/^(?:INT\.?\/EXT\.?|INT\.|EXT\.|I\/E\.|EST\.)\s/i.test(node.textContent)){blockType='scene';changed=true;}if(id!==node.attrs.id||blockType!==node.attrs.blockType)tr.setNodeMarkup(pos,undefined,{...node.attrs,id,blockType});});return changed?tr:null;}})];}
});
export function blocksToDocument(blocks:Block[]){return {type:'doc',content:(blocks.length?blocks:([{id:uid('block'),type:'action',text:''}] as Block[])).map(block=>({type:'screenplayBlock',attrs:{id:block.id,blockType:block.type,revision:block.revision||null,omitted:block.omitted||false},content:editorInlineContent(block) as NonNullable<Block['content']>}))};}
