import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createDemoStory, createStory, uid, validateStory, countWords } from '../lib/story.mjs';
import type { Story } from './model';

type View = 'screenplay' | 'overview' | 'world' | 'board' | 'mindmap' | 'reports' | 'research' | 'versions';
type Dialog = null | 'new' | 'export' | 'share' | 'settings' | 'search' | 'shortcuts' | 'titlepage';
interface Store {
  story: Story; edit: (fn: (draft: Story) => void) => void; replace: (story: Story) => void;
  view: View; setView: (view: View) => void; dialog: Dialog; setDialog: (dialog: Dialog) => void;
  activeScene: string; setActiveScene: (id: string) => void; activeBlock: string; setActiveBlock: (id: string) => void;
  filePath: string | null; save: (as?: boolean) => Promise<void>; open: () => Promise<void>; importFile: () => Promise<void>;
  beginTransition: () => (() => void) | null;
  saveStatus: string; notify: (message: string) => void; toast: string; ready: boolean;
}
const StoryContext = createContext<Store | null>(null);
const browserKey = 'screenwritr.preview.v1';
export function StoryProvider({ children }: { children: ReactNode }) {
  const [story, setStory] = useState<Story>(() => createDemoStory() as Story);
  const [view, setView] = useState<View>('screenplay');
  const [dialog, setDialogState] = useState<Dialog>(null);
  const transition = useRef<{ done: Promise<void> } | null>(null);
  const beginTransition = useCallback(() => {
    if (transition.current) return null;
    let release!: () => void;
    const pending = { done: new Promise<void>(resolve => { release = resolve; }) };
    transition.current = pending;
    return () => { if (transition.current === pending) transition.current = null; release(); };
  }, []);
  const setDialog = useCallback((next: Dialog) => { if (!transition.current) setDialogState(next); }, []);
  const [activeScene, setActiveScene] = useState('');
  const [activeBlock, setActiveBlock] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('Opening story…');
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);
  const current = useRef(story);
  current.current = story;
  const notify = useCallback((message: string) => setToast(message), []);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (window.screenwritr) {
          const loaded = await window.screenwritr.load();
          if (mounted) { setStory(loaded.story); setFilePath(loaded.path); }
        } else {
          const stored = localStorage.getItem(browserKey);
          if (stored && mounted) setStory(validateStory(JSON.parse(stored)) as Story);
        }
        if (mounted) setSaveStatus(window.screenwritr ? 'Recovered locally' : 'Browser preview');
      } catch { notify('Your recovery could not be opened. The sample is available; your files are untouched.'); }
      finally { if (mounted) setReady(true); }
    })();
    return () => { mounted = false; };
  }, [notify]);
  useEffect(() => {
    if (!ready) return;
    setSaveStatus('Saving…');
    const timer = setTimeout(async () => {
      if (transition.current) return;
      try {
        if (window.screenwritr) await window.screenwritr.autosave(story);
        else localStorage.setItem(browserKey, JSON.stringify(story));
        if (current.current.updatedAt === story.updatedAt) setSaveStatus(window.screenwritr ? 'Draft preserved locally' : 'Saved in this browser');
      } catch { setSaveStatus('Save failed'); notify('Autosave failed. Use Save as to keep a separate copy.'); }
    }, 500);
    return () => clearTimeout(timer);
  }, [story, ready, notify]);
  useEffect(() => { document.documentElement.dataset.theme = story.settings.theme; }, [story.settings.theme]);
  const lastWritingEdit = useRef(0);
  const edit = useCallback((fn: (draft: Story) => void) => {if(transition.current)return;const now=Date.now(), elapsed=lastWritingEdit.current&&now-lastWritingEdit.current<120000?(now-lastWritingEdit.current)/60000:0;lastWritingEdit.current=now;setStory(previous => {
    const next = structuredClone(previous); fn(next); next.updatedAt = new Date().toISOString();
    if(next.blocks.some((block,index)=>block.text!==previous.blocks[index]?.text)||next.blocks.length!==previous.blocks.length){
      const total=(blocks:Story['blocks'])=>blocks.reduce((n,b)=>n+countWords(b.text),0);
      const words=Math.max(0,total(next.blocks)-total(previous.blocks));const date=new Date().toLocaleDateString('en-CA');
      const session=next.writingSessions.find(row=>row.date===date);if(session){session.words+=words;session.minutes+=elapsed;}else next.writingSessions.push({date,words,minutes:elapsed});
    }
    return next;
  });}, []);
  const replace = useCallback((next: Story) => {
    current.current = next;
    setStory(next); setFilePath(null); setActiveScene(''); setActiveBlock('');
    if (window.screenwritr) void window.screenwritr.setMcpEnabled(false).catch(() => notify('Story sharing could not be reset.'));
  }, [notify]);
  const save = useCallback(async (as = false) => {
    if (transition.current) return;
    try {
      if (window.screenwritr) {
        const result = await window.screenwritr.save(current.current, as);
        if (!result.cancelled) { setFilePath(result.path); setSaveStatus('Saved locally'); notify('Story saved.'); }
      } else {
        download(JSON.stringify(current.current, null, 2), `${current.current.title}.screenwritr`, 'application/json');
        notify('Project downloaded. Open it in Screenwritr to continue.');
      }
    } catch (error) { notify(error instanceof Error?error.message:'The story could not be saved. Choose another location and try again.'); }
  }, [notify]);
  const browserOpen = useCallback(() => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.screenwritr,.json';
    input.onchange = async () => { try { if (input.files?.[0]) replace(validateStory(JSON.parse(await input.files[0].text())) as Story); } catch { notify('This project is not a valid Screenwritr file.'); } };
    input.click();
  }, [notify, replace]);
  const open = useCallback(async () => {
    if (transition.current) return;
    try {
      if (!window.screenwritr) return browserOpen();
      await window.screenwritr.autosave(current.current);
      const result = await window.screenwritr.open();
      if (result.story) { replace(result.story); setFilePath(result.path ?? null); notify('Story opened.'); }
    } catch { notify('The project could not be opened. Your current story is still here.'); }
  }, [browserOpen, notify, replace]);
  const importFile = useCallback(async () => {
    if (transition.current) return;
    try {
      if (!window.screenwritr) return notify('Open the desktop app to import KIT Scenarist, Final Draft, Fountain, and Word files.');
      await window.screenwritr.autosave(current.current);
      const result = await window.screenwritr.importStory();
      if (result.story) { replace(result.story); notify(result.warnings?.length ? result.warnings.join(' ') : 'Imported as a new story. Save as to keep your copy.'); }
    } catch (error) { notify(error instanceof Error ? error.message : 'The file could not be imported.'); }
  }, [notify, replace]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (transition.current && (event.key === 'Escape' || event.ctrlKey || event.metaKey)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        if (key === 's') { event.preventDefault(); void save(event.shiftKey); }
        if (key === 'o') { event.preventDefault(); void open(); }
        if (key === 'n') { event.preventDefault(); setDialog('new'); }
        if (key === 'k' || key === 'f') { event.preventDefault(); setDialog('search'); }
        if (key === ',') { event.preventDefault(); setDialog('settings'); }
      }
      if (event.key === 'Escape') { setDialog(null); edit(draft => { draft.settings.focus = false; }); }
    };
    window.addEventListener('keydown', listener);
    const cleanup = window.screenwritr?.onMenu(async action => {
      if (action === 'before-close') { await transition.current?.done; await window.screenwritr!.autosave(current.current); return; }
      if (transition.current) return;
      if (action.startsWith('export:')) { try { await window.screenwritr!.exportStory(current.current, action.slice(7)); } catch { notify('Export could not be completed.'); } return; }
      if (action === 'focus') { edit(draft => { draft.settings.focus = !draft.settings.focus; }); return; }
      if (action === 'cards') { setView('board'); return; }
      if (action === 'research') { setView('research'); return; }
      if (action === 'statistics') { setView('reports'); return; }
      if (action === 'save') void save(); else if ((action === 'saveAs' || action === 'save-as')) void save(true);
      else if (action === 'open') void open(); else if (action === 'import') void importFile();
      else if (action === 'new') setDialog('new'); else if (['export','settings','search','shortcuts'].includes(action)) setDialog(action as Dialog);
    });
    return () => { window.removeEventListener('keydown', listener); cleanup?.(); };
  }, [edit, importFile, open, save, setDialog]);
  return <StoryContext.Provider value={{ story, edit, replace, view, setView, dialog, setDialog, activeScene, setActiveScene, activeBlock, setActiveBlock, filePath, save, open, importFile, saveStatus, notify, toast, ready, beginTransition }}>{children}</StoryContext.Provider>;
}
export function useStory() { const context = useContext(StoryContext); if (!context) throw new Error('Story provider missing'); return context; }
export function download(content: string | Blob, name: string, type = 'text/plain') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name.replace(/[<>:"/\\|?*]/g, '-'); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function addScene(story: Story, heading = 'INT. NEW LOCATION - DAY') {
  const id = uid('scene'); story.blocks.push({ id, type: 'scene', text: heading }, { id: uid('block'), type: 'action', text: '' });
  story.scenes[id] = { id, title: 'New scene', synopsis: '', color: '#b88764', act: 'Act I', sequence: '', status: 'To write', notes: '', tags: [] };
  return id;
}
export { createStory, uid };
