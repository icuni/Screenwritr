# Screenwritr

A local home for screenplays, story worlds and the work around a story. An original Electron application by ICUNI, with a forest-and-paper workspace and an explicitly granted, read-only MCP connection.

**Status: working development preview. Full KIT Scenarist parity is an acceptance target, not a completed claim.** See [parity status](docs/parity-status.md) and [research evidence](docs/scenarist-parity-research.md). There is no comparative performance claim yet.

## Run

Requires Node.js 22.12+ and npm. On Windows, install trusted dependencies with npm ci, then run npm run desktop. Use npm run build followed by npm start for the production renderer.

- npm test — domain, storage, interoperability and actual MCP stdio protocol regressions.
- npm run test:desktop — native Electron editor, save, PDF/Word/FDX/Fountain/HTML/graph export, recovery and MCP smoke utility. Uses an isolated .local profile and synthetic story.
- npm run package — Windows unpacked app in release/Screenwritr-0.1.1-win-x64.
- npm run dist:win — Windows installer in release.

Prebuilt Windows candidates are release/Screenwritr-0.1.1-win-x64/Screenwritr.exe and release/Screenwritr-0.1.1-Setup.exe. The separate release/Screenwritr-0.1.1.asar module passed launch and MCP checks on a compatible supplied Electron runtime. See [validation](docs/validation.md) for evidence and limits.

The unsigned preview may trigger Windows reputation prompts. Signing and automatic updates are not configured.

## Workspace

Write with semantic screenplay paragraphs, Enter transitions, Tab paragraph switching, keyboard shortcuts, inline emphasis, scene navigation and focus mode. Organize synchronized scene cards, acts, colors, tags and stamps. Keep character/location/detail profiles with aliases, notes, images and custom fields. Collect hierarchical research, URLs and attachments. Arrange an editable mind map, save named drafts, compare/restore passages, and inspect story statistics.

Import KITSP, Fountain, Final Draft XML, Word DOCX, ODT, Trelby and desktop Celtx. KIT imports preserve their original archive and vendor metadata; this does not guarantee identical vendor layout or editable conversion of every annotation/map. Export native projects, Fountain, FDX, DOCX, PDF, HTML, plain text and a versioned creative-family story graph. Runtime/page estimates are labeled estimates.

## Your files

Projects use versioned .screenwritr JSON. Explicit Save writes the named project and keeps its prior valid .bak copy. Automatic recovery preserves drafts locally after edits; it does not silently rewrite the named project. Closing waits for the renderer's last edit. Interrupted recovery reconciles newer per-story drafts. External named-file changes require Save as or an explicit overwrite through Save as.

Normal desktop data lives in %APPDATA%/Screenwritr. Keep this directory and your named projects in your own backup system. Recovery is not encryption or an off-device backup. Imported originals are copied to import-sources under app data and left untouched. Some large/vendor-only assets depend on that archive; keep it with the project when migrating.

Private story corpora, credentials, app profiles and exported story files are excluded from Git. The provided real scripts are used only in ignored local compatibility receipts. The included demo is original synthetic material.

## Assistant and creative-family access

Open Connect, enable active-story sharing, and copy the exact Codex or Claude MCP configuration. Sharing starts off and is revoked on project switch, close or crash. The stdio server exposes screenplay, outline, characters, locations, details, research, source references and statistics. It distinguishes declared facts from inferred mentions. It has no network listener or write tools. See [MCP](docs/mcp.md).

The org.icuni.story-graph v1 export carries stable source IDs for future Storytellr, Storyboarder and MMMedia integration. Those adapters are planned. See [family contract](docs/creative-family.md).

## Provenance

The installed KIT executable and official public documentation/source were studied as interoperability references. No KIT code, icons or branding were copied. This repository is private original source; no open-source license grant is made. Third-party packages retain their own licenses.
