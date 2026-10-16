import { BookOpen, Clapperboard, Layers3, Network, BarChart3, Library, UsersRound, Settings2, Search, ChevronDown, ArrowUpRight, Plus, FolderOpen, History, Command, Check, Minus, Square, X, Feather, Upload, Download, PanelLeftClose } from 'lucide-react';
import { useState,lazy,Suspense } from 'react';
import { useStory } from './store';
import { IconButton } from './components/ui';
import { Screenplay } from './views/Screenplay';
const Overview=lazy(()=>import('./views/Overview').then(m=>({default:m.Overview})));
const World=lazy(()=>import('./views/World').then(m=>({default:m.World})));
const Board=lazy(()=>import('./views/Board').then(m=>({default:m.Board})));
const MindMap=lazy(()=>import('./views/MindMap').then(m=>({default:m.MindMap})));
const Reports=lazy(()=>import('./views/Reports').then(m=>({default:m.Reports})));
const ResearchView=lazy(()=>import('./views/Research').then(m=>({default:m.ResearchView})));
const Versions=lazy(()=>import('./views/Versions').then(m=>({default:m.Versions})));
const Dialogs=lazy(()=>import('./components/Dialogs').then(m=>({default:m.Dialogs})));

const navigation = [
  { id: 'overview', label: 'Story overview', icon: BookOpen },
  { id: 'screenplay', label: 'Screenplay', icon: Feather },
  { id: 'board', label: 'Scene board', icon: Layers3 },
  { id: 'world', label: 'Story world', icon: UsersRound },
  { id: 'research', label: 'Research', icon: Library },
  { id: 'mindmap', label: 'Mind map', icon: Network },
  { id: 'reports', label: 'Insights', icon: BarChart3 },
  { id: 'versions', label: 'Draft history', icon: History },
] as const;

export function App() {
  const { story, view, setView, setDialog, dialog, toast, saveStatus, filePath, open, save, importFile } = useStory();
  const [projectMenu, setProjectMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const focus = Boolean(story.settings.focus);
  const ActiveView = { screenplay: Screenplay, overview: Overview, world: World, board: Board, mindmap: MindMap, reports: Reports, research: ResearchView, versions: Versions }[view];
  return <><a className="skip-link" href="#main-content">Skip to workspace</a><div className={`app-shell ${focus ? 'is-focused' : ''} ${collapsed ? 'nav-collapsed' : ''}`}>
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="brand"><span className="brand-symbol">s<span>•</span></span><span className="brand-name">screenwritr<span>A HOME FOR STORIES</span></span></div>
      <div className="project-switcher-wrap">
        <button className="project-switcher" aria-expanded={projectMenu} onClick={() => setProjectMenu(!projectMenu)}><span className="project-monogram">{story.title.slice(0,1)}</span><span className="project-name">{story.title}<small>{filePath ? 'Local project' : 'Working draft'}</small></span><ChevronDown size={14} /></button>
        {projectMenu && <><button className="menu-dismiss" aria-label="Close project menu" onClick={() => setProjectMenu(false)} /><div className="dropdown project-menu">
          <button onClick={() => { setDialog('new'); setProjectMenu(false); }}><Plus size={16} />New story<kbd>Ctrl N</kbd></button>
          <button onClick={() => { void open(); setProjectMenu(false); }}><FolderOpen size={16} />Open project<kbd>Ctrl O</kbd></button>
          <button onClick={() => { void save(true); setProjectMenu(false); }}><Download size={16} />Save as…</button>
          <button onClick={() => { void importFile(); setProjectMenu(false); }}><Upload size={16} />Import screenplay</button>
        </div></>}
      </div>
      <div className="nav-caption">YOUR WORKSPACE</div>
      <nav>{navigation.map(({ id, label, icon: Icon }) => <button className={`nav-item ${view === id ? 'active' : ''}`} key={id} aria-label={label} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} title={collapsed ? label : undefined}><Icon size={18} strokeWidth={1.6} /><span>{label}</span>{id === 'screenplay' && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom">
        <button className="family-link" aria-label="Connect creative tools" onClick={() => setDialog('share')}><Clapperboard size={18} /><span>Part of your creative world<small>ICUNI creative tools <ArrowUpRight size={11} /></small></span></button>
        <div className="sidebar-footer"><button aria-label="Preferences" onClick={() => setDialog('settings')}><Settings2 size={16} /><span>Preferences</span></button><IconButton label={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(!collapsed)}><PanelLeftClose size={15} /></IconButton></div>
      </div>
    </aside>
    <div className="app-main">
      <header className="app-header">
        <div className="breadcrumbs"><span>{story.title}</span><span className="breadcrumb-slash">/</span><span>{navigation.find(item => item.id === view)?.label}</span><span className="draft-pill">DRAFT {String(story.versions.length + 1).padStart(2,'0')}</span></div>
        <div className="header-actions"><IconButton label="Search story (Ctrl K)" onClick={() => setDialog('search')}><Search size={17} /></IconButton><button className="button quiet" onClick={() => setDialog('share')}><Network size={15} />Connect</button><button className="button export-button" onClick={() => setDialog('export')}>Export<ArrowUpRight size={15} /></button></div>
        {window.screenwritr && <div className="window-controls"><IconButton label="Minimize window" onClick={() => window.screenwritr?.windowControls('minimize')}><Minus size={14} /></IconButton><IconButton label="Maximize window" onClick={() => window.screenwritr?.windowControls('maximize')}><Square size={12} /></IconButton><IconButton label="Close window" onClick={() => window.screenwritr?.windowControls('close')}><X size={14} /></IconButton></div>}
      </header>
      <main className="workspace" id="main-content" tabIndex={-1}><Suspense fallback={<div className="loading-view" role="status">Opening workspace…</div>}><ActiveView /></Suspense></main>
      <footer className="statusbar"><span className={saveStatus === 'Save failed' ? 'error-text' : ''}><Check size={12} />{saveStatus}</span><span className="status-hint">{focus ? 'Esc to leave focus mode' : 'Every great story starts with a little space.'}</span><button onClick={() => setDialog('shortcuts')}><Command size={12} />Keyboard shortcuts</button></footer>
    </div>
    {dialog&&<Suspense fallback={<div role="status" className="toast">Opening…</div>}><Dialogs /></Suspense>}
    {toast && <div className="toast" role="status"><Check size={16} /><span>{toast}</span></div>}
  </div></>;
}
