# Writing Gallery

The Writing Gallery is Screenwritr's opening room, above Story Overview. It collects approved story folders, explicitly selected files, recent native projects and preserved working drafts. Search covers title, author, summary and filename. Collections, format filters, sorting and pages of 24 cards keep large folders usable.

## Files and recovery

Source files and working drafts have separate cards. Opening a source creates an editable working copy and archives the original under app data. Opening an older named Screenwritr file preserves a differing local draft under its existing identity and opens the named version under a fresh identity. Reopening a working draft restores its named path only with its original persisted file baseline, so external edits still require Save as.

Gallery switching locks competing editor actions, flushes the current draft, commits the next story and resets active-story sharing. The close handshake waits for this transition. The gallery itself is never included in MCP sharing.

Add story folder uses the native folder picker. A trusted local launch can also seed a folder with:

```powershell
.\Screenwritr.exe --gallery-folder "D:\path\to\Stories"
```

The selected folder is saved in app-owned gallery.json; no user's path is baked into source or the distribution. Folder refresh is explicit, and chosen roots are rescanned at launch. Files are read, never rewritten in their original locations.

## Interchange

| Source | Gallery behavior |
| --- | --- |
| KIT Scenarist .kitsp | Story metadata, screenplay and existing research/entity import |
| Fountain .fountain / .txt | Title/author, screenplay and metadata |
| Final Draft .fdx / .fdxt | Existing Final Draft XML import |
| Screenwritr .screenwritr | Validated native project with working-draft protection |
| DOCX, ODT, Trelby, desktop Celtx | Existing importers; multi-script Celtx asks for a script when opened |
| Final Cut .fcpxml | Timeline clips become an editable story outline; names, timings, title/caption text, notes, markers, metadata and media references are retained where supported |
| Final Cut .fcpxmld directory | Reads the bundle's regular Info.fcpxml; media is not read |
| Legacy Final Cut .xml (xmeml) | Sequence/clip names, frame timings, markers and media references become an outline |
| Native .fcp / .fcpbundle | Listed with XML export instructions; binary project editing is not implemented |

Final Cut XML is an interchange format, not the native library database. Export XML in Final Cut Pro on macOS before importing it here. A multi-project XML file asks which project to open. No dialogue is invented or transcribed. Effects, media, complex compound/multicam editing data and unsupported editing details stay in the preserved original XML. Directory bundles are supported; zipped bundles must be extracted first.

Apple references: [Transfer projects with XML](https://support.apple.com/guide/final-cut-pro/use-xml-to-transfer-projects-verdbd66ae/mac), [FCPXML data model](https://developer.apple.com/documentation/professional-video-applications/describing-final-cut-pro-items-in-fcpxml).

## Implementation and bounds

Gallery descriptors are metadata only. Opaque entry IDs cross the renderer boundary; the main process resolves app-owned paths. IPC requires the trusted top-level renderer. Metadata parsing runs in a separate Electron-as-Node process, with a 40-second per-file timeout. File size and modification time cache successful previews; unchanged files are not reparsed. Existing recovery summaries are reused; uncached drafts migrate one at a time.

Limits: 50 roots, 2,500 discovered files, 1,000 directories, 8 nested folder levels, 50 MB source files and 25 MB Final Cut XML. Symlinks/junctions are not followed. Unavailable/corrupt entries remain visible with explanations; one bad file does not discard the rest. XML entities, external DTDs, oversized/deep documents and unrelated XML are rejected. Final Cut media URLs remain text references and are never fetched.

The optional Gallery renderer is lazy loaded. The native gallery smoke utility uses isolated app profiles and synthetic fixtures; an explicitly supplied SCREENWRITR_CORPUS_ROOT adds a read-only real corpus validation. Identifying screenshots and receipts stay under ignored .local.
