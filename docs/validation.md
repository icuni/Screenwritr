# Validation record

16 October 2026. Development preview 0.1.1. This record separates working checks from the remaining acceptance work in [parity-status.md](parity-status.md).

## Source and compatibility

The installed target is a native Qt x86 executable, 15,773,184 bytes, SHA-256 424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e. Static inspection and official public documentation/source informed an original implementation. The exact installed version was not established. Runtime capture of the original app was unavailable; upstream source equivalence and original UI/performance parity are not claimed.

The authorized local corpus contains 48 root screenplay files: 36 KITSP, 10 Fountain and 2 FDX. All 48 imported and passed native/MCP schema validation; original SHA-256 hashes remained unchanged. An independent XML parse verified every primary-script KIT text value in all 36 KIT projects, including CDATA. That exact-text check does not cover all vendor annotations/layouts, or establish lossless round trips for the other formats. Four representative real files also passed native edit/undo, workspace and live MCP smoke checks.

Real stories, converted copies, exports and identifying receipts stay in ignored .local directories. They are not repository fixtures, a shipped demo or model-training data. Unrelated employment/contract PDFs were not opened.

## Automated checks

npm run check passed the production TypeScript/Vite build and 29 tests. Coverage includes schema/extension fidelity, empty editor paragraphs, canonical screenplay text, KIT/FDX/Fountain/Word/ODT/Trelby/Celtx interchange, archive bounds/traversal/entity rejection, actual MCP stdio discovery/consent/bounds/revocation/source references, atomic saves/backups, external-file conflicts and interrupted recovery with equal or earlier document timestamps.

A focused independent code review found no remaining blockers in the corrected project-switch/recovery scope. New-story commits lock dismissal and competing actions, native close waits for the commit, and the current story reference changes before that lock releases. Recovery reconciles differing same-ID per-story draft content using serialized write ordering rather than user document timestamps.

The current production dependency audit reports zero known vulnerabilities. This is a point-in-time dependency check, not a security guarantee.

## Native package

Packaged acceptance results are recorded here after the final executable smoke check. The test uses an isolated app profile and synthetic story. Its intended gates cover renderer isolation, editing and clearing text, named save, empty FDX import, SQLite/WASM KIT import, asynchronous new-story dismissal, live MCP reads/revocation, eight workspaces, serious accessibility findings, native exports and immediate-close/relaunch recovery.

Synthetic native screenshots are in output/playwright. Private real-story screenshots stay under .local. PDF export has also been inspected with independent text extraction and page rendering: the title is unnumbered and screenplay numbering starts at 1. Word export has semantic/archive checks; Word application rendering acceptance remains outstanding.

## Performance and footprint

A repeated identical local model workload (clone, append one character, validate and serialize; 20 repetitions) improved from 7,989,337 to 137,267 serialized bytes after moving duplicated vendor history/large source-only data out of the editing model into the preserved import archive. Mean time changed from 633.704 ms to 37.566 ms; p95 from 886.88 ms to 79.108 ms. Screenplay/profile/research semantics and the original file hash were unchanged. These are model-workload timings, not end-to-end keystroke latency or a comparison against KIT.

Optional creative workspaces/dialogs load separately. Initial renderer JavaScript is approximately 686 kB before compression, 220 kB gzip; CSS is approximately 66 kB, 14 kB gzip. The initial JavaScript budget still needs improvement.

The installed KIT directory measured 188,241,077 bytes across 135 files. A standalone Electron distribution is heavier; the lighter-install target is unmet. The package also produces a separate Screenwritr ASAR module for a future compatible shared Electron host. Sharing a runtime can reduce the marginal family footprint; a family launcher and cross-product adapters are not implemented.

## Publication and remaining acceptance

Local source commits/bundles are recovery copies. A GitHub repository is protected remotely only after creation and a verified remote commit. No hosted CI run, signed release, updater, cloud coauthoring, lossless vendor round trip, original-runtime comparison, user visual acceptance or full 1:1 parity is implied by these checks.
