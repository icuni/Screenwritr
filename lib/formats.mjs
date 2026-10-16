import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createStory, uid, validateStory, BLOCK_TYPES } from './story.mjs';

export const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export const escapeXml = escapeHtml;
const plain = value => String(value ?? '').replace(/\r\n?/g, '\n');
const textOf = nodes => (nodes || []).map(node => node.type === 'hardBreak' ? '\n' : node.text || '').join('');
const inlineOf = block => Array.isArray(block.content) && textOf(block.content) === block.text ? block.content : [{ type: 'text', text: block.text }];
const allowedMarks = new Set(['bold', 'italic', 'underline', 'strike']);

export function inlineToHtml(block) {
  return inlineOf(block).map(node => {
    if (node.type === 'hardBreak') return '<br>';
    let text = escapeHtml(node.text || '').replace(/\n/g, '<br>');
    for (const mark of node.marks || []) { const tag = { bold: 'strong', italic: 'em', underline: 'u', strike: 's' }[mark.type]; if (tag) text = `<${tag}>${text}</${tag}>`; }
    return text;
  }).join('');
}

export function parseInlineFountain(value) {
  const content = [], source = String(value);
  const expression = /(?<!\\)(\*\*\*|\*\*|\*|_)([^\n]+?)(?<!\\)\1/g;
  let cursor = 0, match;
  const add = (text, marks) => { if (text) content.push({ type: 'text', text: text.replace(/\\([*_\\])/g, '$1'), ...(marks?.length ? { marks: marks.map(type => ({ type })) } : {}) }); };
  while ((match = expression.exec(source))) {
    add(source.slice(cursor, match.index));
    const marks = match[1] === '***' ? ['bold', 'italic'] : match[1] === '**' ? ['bold'] : match[1] === '*' ? ['italic'] : ['underline'];
    add(match[2], marks); cursor = expression.lastIndex;
  }
  add(source.slice(cursor));
  return { text: textOf(content), content };
}

function fountainInline(block) {
  return inlineOf(block).map(node => {
    if (node.type === 'hardBreak') return '\n';
    let text = String(node.text || '').replace(/\\/g, '\\\\').replace(/([*_])/g, '\\$1');
    const marks = new Set((node.marks || []).map(mark => mark.type));
    if (marks.has('underline')) text = `_${text}_`;
    if (marks.has('bold') && marks.has('italic')) text = `***${text}***`;
    else if (marks.has('bold')) text = `**${text}**`;
    else if (marks.has('italic')) text = `*${text}*`;
    return text;
  }).join('');
}

export function exportFountain(input) {
  const story = validateStory(input), title = [`Title: ${story.title}`];
  if (story.subtitle) title.push(`Credit: ${story.subtitle}`);
  if (story.authors) title.push(`Author: ${story.authors}`);
  if (story.contact) title.push(`Contact: ${story.contact.replace(/\n/g, '\n    ')}`);
  if (story.copyright) title.push(`Copyright: ${story.copyright}`);
  const paragraphs = [];
  for (const block of story.blocks) {
    let text = fountainInline(block);
    if (block.omitted) { paragraphs.push(`/*\n${text}\n*/`); continue; }
    switch (block.type) {
      case 'scene': if (!/^(?:INT|EXT|EST|I\/?E|INT\.?\/EXT)\b/i.test(block.text)) text = `.${text}`; break;
      case 'character': text = `@${text}${block.dualDialogue ? ' ^' : ''}`; break;
      case 'dialogue': break;
      case 'parenthetical': if (!/^\(.*\)$/s.test(block.text)) text = `(${text})`; break;
      case 'transition': text = `> ${text}`; break;
      case 'shot': text = `!${text}`; break;
      case 'note': text = `[[${text.replace(/\]\]/g, '] ]')}]]`; break;
      case 'section': text = `${'#'.repeat(Math.min(6, Math.max(1, block.sectionDepth || 1)))} ${text}`; break;
      case 'synopsis': text = `= ${text}`; break;
      case 'lyrics': text = text.split('\n').map(line => `~${line}`).join('\n'); break;
      case 'pagebreak': text = '==='; break;
      default: if (/^(?:[A-Z][A-Z\d .,'’()\-]{0,70}|[.#=@!~>])(?:\n|$)/.test(block.text)) text = `!${text}`;
    }
    // A character cue and its speech form one Fountain paragraph.
    if (['dialogue', 'parenthetical'].includes(block.type) && paragraphs.length) paragraphs[paragraphs.length - 1] += `\n${text}`;
    else paragraphs.push(text);
  }
  return `${title.join('\n')}\n\n${paragraphs.join('\n\n')}\n`;
}

export function importFountain(source, options = {}) {
  if (typeof source !== 'string' || source.length > 20_000_000) throw new Error('Fountain document exceeds the import limit.');
  const story = createStory({ title: options.title || 'Imported screenplay' }), warnings = [];
  const lines = plain(source).replace(/^\uFEFF/, '').split('\n');
  let index = 0, activeTitleKey = null;
  const titleKeys = { title: 'title', credit: 'subtitle', author: 'authors', authors: 'authors', contact: 'contact', copyright: 'copyright' };
  if (/^[\w ]+\s*:/.test(lines[0] || '')) {
    while (index < lines.length && lines[index].trim()) {
      const match = lines[index].match(/^([\w ]+):\s*(.*)$/);
      if (match) { activeTitleKey = titleKeys[match[1].toLowerCase()] || null; if (activeTitleKey) story[activeTitleKey] = match[2]; else { story.fountainTitleFields ||= {}; story.fountainTitleFields[match[1]] = match[2]; } }
      else if (/^\s+/.test(lines[index]) && activeTitleKey) story[activeTitleKey] += `\n${lines[index].trim()}`;
      else break;
      index++;
    }
  }
  story.blocks = [];
  let dialogue = false;
  const add = (type, text, extra = {}) => { const inline = parseInlineFountain(text); const block = { id: uid('block'), type, ...inline, ...extra }; story.blocks.push(block); return block; };
  const isScene = line => /^\.(?!\.)\S/.test(line) || /^(?:INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|INT\.?|EXT\.?|EST\.?|I\.?\s*\/\s*E\.?)\s+\S/i.test(line);
  while (index < lines.length) {
    let line = lines[index].trimEnd();
    if (!line.trim()) { dialogue = false; index++; continue; }
    if (line.startsWith('/*')) {
      const omitted = []; let done = false;
      do { let part = lines[index++]; if (part.includes('*/')) { part = part.slice(0, part.indexOf('*/')); done = true; } omitted.push(part); } while (index < lines.length && !done);
      add('note', omitted.join('\n').replace(/^\/\*\s*\n?/, '').trim(), { omitted: true }); dialogue = false; continue;
    }
    if (line.startsWith('[[')) {
      const note = []; let done = false;
      do { let part = lines[index++]; if (part.includes(']]')) { part = part.slice(0, part.indexOf(']]')); done = true; } note.push(part); } while (index < lines.length && !done);
      add('note', note.join('\n').replace(/^\[\[/, '').trim()); dialogue = false; continue;
    }
    if (/^={3,}\s*$/.test(line)) { add('pagebreak', ''); index++; dialogue = false; continue; }
    if (/^#{1,6}\s*/.test(line)) { const match = line.match(/^(#{1,6})\s*(.*)$/); add('section', match[2], { sectionDepth: match[1].length }); index++; dialogue = false; continue; }
    if (/^=(?!=)/.test(line)) { add('synopsis', line.replace(/^=\s*/, '')); index++; dialogue = false; continue; }
    if (isScene(line)) { add('scene', line.replace(/^\./, '')); index++; dialogue = false; continue; }
    if (line.startsWith('>') && line.endsWith('<')) { add('action', line.slice(1, -1).trim(), { centered: true }); index++; dialogue = false; continue; }
    if (line.startsWith('>') || (/^[A-Z][A-Z\s]+TO:$/.test(line))) { add('transition', line.replace(/^>\s*/, '')); index++; dialogue = false; continue; }
    if (line.startsWith('~')) { const lyrics = []; while (index < lines.length && lines[index].startsWith('~')) lyrics.push(lines[index++].slice(1)); add('lyrics', lyrics.join('\n')); continue; }
    if (dialogue && /^\(.*\)$/.test(line.trim())) { add('parenthetical', line.trim()); index++; continue; }
    const cue = line.startsWith('@') || (!dialogue && /^[A-Z][A-Z\d .,'’()\-]{0,70}(?:\s*\^)?$/.test(line.trim()) && lines[index + 1]?.trim() && !line.startsWith('!'));
    if (cue) { add('character', line.replace(/^@/, '').replace(/\s*\^$/, '').trim(), { ...(line.endsWith('^') ? { dualDialogue: true } : {}) }); dialogue = true; index++; continue; }
    const paragraph = [line.replace(/^!/, '')]; const type = dialogue ? 'dialogue' : 'action'; index++;
    while (index < lines.length && lines[index].trim() && !isScene(lines[index]) && !/^(?:\[\[|\/\*|#{1,6}|=(?!=)|>|@|~)/.test(lines[index]) && !(dialogue && /^\(.*\)$/.test(lines[index].trim()))) paragraph.push(lines[index++]);
    add(type, paragraph.join('\n'));
  }
  if (!story.blocks.length) story.blocks.push({ id: uid('block'), type: 'action', text: '' });
  if (story.blocks.some(block => block.dualDialogue)) warnings.push('Dual-dialogue cues were preserved as Fountain metadata; side-by-side layout is not implemented.');
  return { story: validateStory(story), warnings };
}

const fdxType = { sceneCharacters:'Scene Characters',titleHeader:'Title Header',title:'Title',sectionEnd:'Section End',scene: 'Scene Heading', action: 'Action', character: 'Character', dialogue: 'Dialogue', parenthetical: 'Parenthetical', transition: 'Transition', shot: 'Shot', lyrics: 'Lyrics', note: 'ScriptNote', section: 'Section', synopsis: 'Synopsis', pagebreak: 'Page Break' };
const fromFdx = Object.fromEntries(Object.entries(fdxType).map(([key, value]) => [value.toLowerCase(), key]));
const orderedChildren = (nodes, name) => (nodes || []).filter(node => Object.hasOwn(node, name)).flatMap(node => node[name]);
const xmlText = nodes => (nodes || []).map(node => Object.hasOwn(node, '#text') ? String(node['#text']) : Object.entries(node).filter(([key]) => key !== ':@').map(([, children]) => Array.isArray(children) ? xmlText(children) : '').join('')).join('');
function parseXml(source) {
  if (typeof source !== 'string' || source.length > 20_000_000) throw new Error('XML document exceeds the import limit.');
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('XML document types and custom entities are not permitted.');
  const valid = XMLValidator.validate(source); if (valid !== true) throw new Error(`Invalid XML: ${valid.err.msg}`);
  return new XMLParser({ preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: '', trimValues: false, parseTagValue: false, processEntities: true }).parse(source);
}
function fdxParagraph(node) {
  const attr = node[':@'] || {}, content = [];
  for (const textNode of node.Paragraph || []) {
    if (textNode.Text) {
      const text = xmlText(textNode.Text), styles = String(textNode[':@']?.Style || '').split('+');
      const marks = styles.map(style => style.toLowerCase()).filter(style => allowedMarks.has(style)).map(type => ({ type }));
      content.push({ type: 'text', text, ...(marks.length ? { marks } : {}) });
    }
  }
  const text = textOf(content) || xmlText(node.Paragraph);
  return { type: fromFdx[String(attr.Type || 'Action').toLowerCase()] || 'action', text, content: content.length ? content : [{ type: 'text', text }], fdxAttributes: attr };
}

export function importFdx(source, options = {}) {
  const xml = parseXml(source), root = xml.find(node => node.FinalDraft);
  if (!root) throw new Error('This is not a Final Draft XML document.');
  const story = createStory({ title: options.title || 'Imported screenplay' }), warnings = [];
  const body = root.FinalDraft.find(node => node.Content)?.Content || [];
  story.blocks = body.filter(node => node.Paragraph).map(node => { const paragraph = fdxParagraph(node); if (!fromFdx[String(node[':@']?.Type || 'Action').toLowerCase()]) warnings.push(`Final Draft paragraph type “${node[':@']?.Type}” was imported as action and its attributes retained.`); return { id: uid('block'), ...paragraph }; });
  const titlePage = root.FinalDraft.find(node => node.TitlePage)?.TitlePage;
  const titleParagraphs = orderedChildren(titlePage, 'Content').filter(node => node.Paragraph).map(node => ({ ...fdxParagraph(node), rawType: node[':@']?.Type || '' }));
  if (titleParagraphs.length) {
    const meaningful = titleParagraphs.filter(item => item.text.trim());
    story.title = meaningful.find(item => /title/i.test(item.rawType))?.text || meaningful[0]?.text || story.title;
    const byIndex=meaningful.findIndex(item=>/^(by|written by)$/i.test(item.text.trim())); story.authors=meaningful.find(item=>/author/i.test(item.rawType))?.text || (byIndex>=0?meaningful[byIndex+1]?.text:'') || '';
    story.fdxTitlePage = titleParagraphs;
  }
  story.fdxDocumentAttributes = root[':@'] || {};
  story.fdxExtraElements = root.FinalDraft.filter(node => !node.Content && !node.TitlePage);
  if (story.fdxExtraElements.length) warnings.push('Additional Final Draft document data was retained in the native project; the editor does not expose every vendor-specific setting.');
  if (!story.blocks.length) story.blocks = [{ id: uid('block'), type: 'action', text: '' }];
  return { story: validateStory(story), warnings: [...new Set(warnings)] };
}

function fdxText(block) {
  return inlineOf(block).map(node => {
    if (node.type === 'hardBreak') return '<Text>\n</Text>';
    const styles = (node.marks || []).map(mark => ({ bold: 'Bold', italic: 'Italic', underline: 'Underline', strike: 'Strike' })[mark.type]).filter(Boolean);
    return `<Text${styles.length ? ` Style="${styles.join('+')}"` : ''}>${escapeXml(node.text || '')}</Text>`;
  }).join('');
}
export function exportFdx(input) {
  const story = validateStory(input);
  const title = [`<Paragraph Type="Title"><Text>${escapeXml(story.title)}</Text></Paragraph>`, ...(story.subtitle ? [`<Paragraph Type="Credit"><Text>${escapeXml(story.subtitle)}</Text></Paragraph>`] : []), `<Paragraph Type="Author"><Text>${escapeXml(story.authors)}</Text></Paragraph>`, ...(story.contact ? [`<Paragraph Type="Contact"><Text>${escapeXml(story.contact)}</Text></Paragraph>`] : []), ...(story.copyright ? [`<Paragraph Type="Copyright"><Text>${escapeXml(story.copyright)}</Text></Paragraph>`] : [])];
  const body = story.blocks.filter(block => !block.omitted).map(block => `<Paragraph Type="${fdxType[block.type] || 'Action'}">${fdxText(block)}</Paragraph>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<FinalDraft DocumentType="Script" Template="No" Version="1"><Content>\n${body}\n</Content><TitlePage><Content>${title.join('\n')}</Content></TitlePage></FinalDraft>\n`;
}

export function exportText(input) { const story = validateStory(input); return `${story.title}\n${story.subtitle ? `${story.subtitle}\n` : ''}${story.authors ? `Written by ${story.authors}\n` : ''}\n${story.blocks.filter(block => !block.omitted).map(block => block.type === 'pagebreak' ? '\f' : block.text).join('\n\n')}\n`; }

export function exportHtml(input, options = {}) {
  const story = validateStory(input), paper = story.settings.paper === 'letter' ? 'letter' : 'A4';
  let sceneIndex=Number(story.settings.sceneNumberStart||1);
  const paragraphs = story.blocks.filter(block => !block.omitted && !['sectionEnd','titleHeader','sceneCharacters','section', 'synopsis', 'note'].includes(block.type)).map(block => block.type === 'pagebreak' ? '<div class="pagebreak"></div>' : `<p${block.type==='scene'&&story.settings.sceneNumbers?' data-number="'+escapeHtml(String(story.settings.sceneNumberPrefix||'')+String(story.scenes[block.id]?.lockedNumber||sceneIndex++))+'"':''} class="${BLOCK_TYPES.includes(block.type) ? block.type : 'action'}">${inlineToHtml(block) || '&nbsp;'}</p>`).join('\n');
  const title = `<section class="titlepage"><div><h1>${escapeHtml(story.title)}</h1>${story.subtitle ? `<p>${escapeHtml(story.subtitle)}</p>` : ''}<p class="written">Written by</p><p>${escapeHtml(story.authors)}</p></div><footer>${escapeHtml(story.contact).replace(/\n/g, '<br>')}<br>${escapeHtml(story.copyright)}</footer></section>`;
  return `<!doctype html><html lang="${escapeHtml(story.language || 'en')}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src data:"><title>${escapeHtml(story.title)}</title><style>@page{size:${paper};margin:25.4mm 25.4mm 25.4mm 38.1mm;@top-right{content:counter(page) '.';font:10pt 'Courier New',monospace}}@page:first{counter-reset:page ${Math.max(1,Number(story.settings.firstPageNumber)||1)-(options.titlePage===false?0:1)};${options.titlePage===false?'':'@top-right{content:none}'}}*{box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12pt;line-height:1;margin:0;color:#111;background:#fff}main{max-width:6in;margin:auto}p{white-space:pre-wrap;margin:0 0 12pt;orphans:2;widows:2}.scene{position:relative}.scene[data-number]:before{content:attr(data-number);position:absolute;left:-.45in;font-size:10pt}.running-header{position:fixed;top:-.55in;font-size:9pt;left:0;right:0;text-align:right}.running-footer{position:fixed;bottom:-.55in;font-size:9pt;left:0;right:0}.scene,.shot{font-weight:700;text-transform:uppercase;break-after:avoid}.character{margin-left:2.2in;break-after:avoid;text-transform:uppercase}.dialogue,.lyrics{margin-left:1in;margin-right:1.5in}.parenthetical{margin-left:1.6in;margin-right:1.8in;break-after:avoid}.transition{text-align:right;text-transform:uppercase}.lyrics{font-style:italic}.titlepage{height:9in;position:relative;page-break-after:always;display:flex;align-items:center;justify-content:center;text-align:center}.titlepage h1{font:700 20pt 'Courier New',monospace;text-transform:uppercase}.titlepage .written{margin-top:36pt}.titlepage footer{position:absolute;bottom:0;left:0;text-align:left;font-size:10pt}.pagebreak{break-before:page}@media screen{body{padding:48px}main{box-shadow:0 0 0 1px #ddd;padding:24px;max-width:8in}}</style></head><body>${story.settings.header?`<div class="running-header">${escapeHtml(String(story.settings.header))}</div>`:''}${story.settings.footer?`<div class="running-footer">${escapeHtml(String(story.settings.footer))}</div>`:''}<main>${options.titlePage === false ? '' : title}${paragraphs}</main></body></html>`;
}

export function importText(source, options = {}) {
  // Fountain's plain-action fallback preserves arbitrary text while recognizing screenplay structure.
  return importFountain(source, options);
}

export async function exportDocx(input) {
  const story = validateStory(input);
  const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Header, Footer, PageNumber } = await import('docx');
  const paragraph = block => {
    const indent = { character: { left: 3168 }, dialogue: { left: 1440, right: 2160 }, parenthetical: { left: 2304, right: 2592 }, lyrics: { left: 1440, right: 2160 } }[block.type];
    const children = inlineOf(block).flatMap(node => {
      if (node.type === 'hardBreak') return [new TextRun({ break: 1 })];
      const marks = new Set((node.marks || []).map(mark => mark.type));
      return String(node.text || '').split('\n').flatMap((text, index) => [new TextRun({ text, ...(index ? { break: 1 } : {}), font: 'Courier New', size: 24, bold: marks.has('bold') || ['scene', 'shot'].includes(block.type), italics: marks.has('italic') || block.type === 'lyrics', underline: marks.has('underline') ? {} : undefined, strike: marks.has('strike') })]);
    });
    return new Paragraph({ style:(fdxType[block.type]||'Action').replace(/ /g,''), children: block.type === 'pagebreak' ? [new PageBreak()] : children, indent, alignment: block.type === 'transition' ? AlignmentType.RIGHT : undefined, keepNext: ['scene', 'character', 'parenthetical', 'shot'].includes(block.type), spacing: { after: 240, line: 240 } });
  };
  const title = [new Paragraph({ children: [new TextRun({ text: story.title, font: 'Courier New', size: 40, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 3600, after: 480 } }), new Paragraph({ text: story.subtitle, alignment: AlignmentType.CENTER }), new Paragraph({ text: `Written by\n${story.authors}`, alignment: AlignmentType.CENTER, spacing: { before: 720 } }), new Paragraph({ children: [new PageBreak()] })];
  const doc = new Document({ styles:{paragraphStyles:Object.entries(fdxType).map(([,name])=>({id:name.replace(/ /g,''),name,run:{font:'Courier New',size:24}}))}, creator: story.authors, title: story.title, description: story.logline, sections: [{ headers:{default:new Header({children:[new Paragraph({text:String(story.settings.header||''),alignment:AlignmentType.RIGHT})]})},footers:{default:new Footer({children:[new Paragraph({children:[new TextRun(String(story.settings.footer||'')),new TextRun({children:['  ',PageNumber.CURRENT]})]})]})},properties: { page: { size: story.settings.paper === 'letter' ? { width: 12240, height: 15840 } : { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 2160, right: 1440 } } }, children: [...title, ...story.blocks.filter(block => !block.omitted && !['sectionEnd','titleHeader','sceneCharacters','section', 'synopsis', 'note'].includes(block.type)).map(paragraph)] }] });
  return Packer.toBuffer(doc);
}
