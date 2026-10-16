export type BlockType = 'scene' | 'sceneCharacters' | 'title' | 'titleHeader' | 'sectionEnd' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'shot' | 'note' | 'section' | 'synopsis' | 'lyrics' | 'pagebreak';
export interface Block { id: string; type: BlockType; text: string; revision?: string; omitted?: boolean; bookmark?: { label: string; color: string }; content?: { type: string; text?: string; marks?: { type: string }[] }[]; }
export interface SceneMeta { id: string; title: string; synopsis: string; color: string; act: string; sequence: string; status: string; notes: string; tags: string[]; }
export interface Entity { id: string; name: string; description: string; notes: string; color: string; aliases: string[]; fields: Record<string, string>; image?: string; }
export interface Research { id: string; parentId: string | null; type: 'folder' | 'note' | 'link' | 'image' | 'document'; title: string; content: string; url: string; attachment?: string; }
export interface Comment { id: string; blockId: string; text: string; author: string; resolved: boolean; createdAt: string; }
export interface MindNode { id: string; label: string; x: number; y: number; color: string; }
export interface Version { id: string; name: string; createdAt: string; blocks: Block[]; }
export interface Story {
  format: 'screenwritr'; version: 1; id: string; title: string; subtitle: string;
  logline: string; synopsis: string; authors: string; genre: string; language: string;
  contact: string; copyright: string; createdAt: string; updatedAt: string;
  blocks: Block[]; scenes: Record<string, SceneMeta>;
  characters: Entity[]; locations: Entity[]; items: Entity[]; research: Research[];
  comments: Comment[]; versions: Version[];
  mindmap: { nodes: MindNode[]; edges: { id: string; from: string; to: string; label: string }[] };
  settings: { theme: 'light' | 'dark'; font: string; paper: 'a4' | 'letter'; sceneNumbers: boolean;
    spellcheck: boolean; goalWords: number; typewriter: boolean; focus: boolean; showRevisions: boolean;
    revisionColor: string; firstPageNumber: number; [key: string]: unknown; };
  writingSessions: { date: string; words: number; minutes: number }[];
}
export interface Scene { id: string; heading: string; number: number; blocks: Block[]; meta: SceneMeta; location: string; time: string; interior: string; characters: string[]; words: number; duration: number; }
export interface DesktopApi {
  load: () => Promise<{ story: Story; path: string | null; recent: { title: string; path: string; updatedAt: string }[] }>;
  save: (story: Story, saveAs?: boolean) => Promise<{ path: string | null; cancelled?: boolean; savedAt?: string }>;
  autosave: (story: Story) => Promise<{ savedAt: string; path: string | null }>;
  open: () => Promise<{ story?: Story; path?: string; cancelled?: boolean }>;
  importStory: () => Promise<{ story?: Story; warnings?: string[]; cancelled?: boolean }>;
  exportStory: (story: Story, format: string) => Promise<{ path?: string; cancelled?: boolean }>;
  attach: () => Promise<{ name?: string; data?: string; cancelled?: boolean }>;
  getMcpStatus: () => Promise<{ enabled: boolean; config: unknown; manifestPath?: string }>;
  setMcpEnabled: (enabled: boolean) => Promise<{ enabled: boolean; config: unknown; manifestPath?: string }>;
  openExternal: (url: string) => Promise<void>;
  windowControls: (action: 'minimize' | 'maximize' | 'close') => void;
  onMenu: (callback: (action: string) => void) => () => void;
}
declare global { interface Window { screenwritr?: DesktopApi; } }
