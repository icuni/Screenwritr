# KIT Scenarist parity research for Screenwritr

Research date: 16 October 2026. Scope: the user-selected `C:\Program Files (x86)\KIT\Scenarist\Scenarist.exe`, its installation directory, official KIT documentation and the original public upstream repositories. No personal story files were opened in the initial static investigation. A later user-authorized corpus validation is recorded separately in docs/validation.md. No KIT code or assets were copied into Screenwritr.

## What this establishes

The requested executable is a 15,773,184-byte PE32 x86 image with SHA-256 `424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e`. REA observed no CLI directory, so it is not a managed .NET assembly. The installation directory contains Qt5 libraries, QtWebEngineProcess.exe, SQL/print plugins, translations and resource folders. This is static shipped-artifact evidence, not an observation of running features.

KIT is organized around project research, a synchronized scene/card/script structure, screenplay editing, statistics, settings, backups and version comparison. Its native project is an SQLite `.kitsp` database containing XML screenplay text and a hierarchical research tree. The replacement should treat those as one connected story model, not independent documents.

This report is a baseline and acceptance checklist. It does **not** establish full Screenwritr parity, verify every installed-app interaction, or establish that Electron is lighter/faster.

Evidence labels used below:

- **O**: observed installed bytes or directory entries.
- **D**: documented by KIT's official site or inspected public source.
- **I**: a proposed Screenwritr design or acceptance inference.
- **U**: unresolved and requiring a bounded follow-up.

## Target and investigation ledger

| Question | Status | Evidence and boundary |
| --- | --- | --- |
| Exact executable identity | Answered, O | REA open_binary: PE, x86, SHA-256 above. |
| Managed versus native boundary | Answered, O | `ev_838ad226cbddb974d2ae95c29e447cbcb1d3ab82e4cd7c4c9655d3a170affb24`: CLI directory absent; PE has 5 sections. |
| Safe package inventory | Answered within operation, O | `ev_deef913a33964ad65474cc49013e650120104394b32ff473e4306444bcabaacd` and nested `ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375`: one executable node, no container children or integrity contradictions. |
| PE resource inventory | Answered within operation, O | `ev_98b89692d9b8e07b0da6fa5754e0938d0f5b19b1a0e8e471c084c0586e98f4ec`: 27 entries examined, 12 resources; ten icon images, one IDI_ICON1 group, one manifest; language ID 1033. |
| Native functions, procedures, full strings/xrefs | Unresolved, U | binary_overview returned provider_unavailable. Ghidra/Java and IDA are not configured; Hopper is unsupported on Windows. No disassembly claim is made. |
| Actual installed version and source-build correspondence | Unresolved, U | No version-info resource was reported. Public documentation/source cannot identify this exact build. |
| Public feature baseline | Partially answered, D | Broad workflows below are documented. Exact dialogs, complete report names and all shortcuts/settings remain uncaptured. |
| Project compatibility | Partially answered, D | Upstream schema and XML conventions inspected; no user project or synthetic KIT-created project round-trip was performed in this lane. |
| Running UI/performance/cloud behavior | Unresolved, U | No runtime observation or benchmark in this lane. |

The native REA session opened for this investigation was closed successfully. The complete inline REA records are retained in the appendix because the calls did not supply portable retained references.

## Sources and version boundaries

The original desktop repository is [KITScenarist](https://github.com/dimkanovikov/KITScenarist). Its [.gitmodules](https://raw.githubusercontent.com/dimkanovikov/KITScenarist/develop/.gitmodules) identifies [KITScenaristCore](https://github.com/dimkanovikov/KITScenaristCore) as its core. The inspected desktop develop tree points to [core commit a777107fb3058887630ad13a3e85a3118e42a51e](https://github.com/dimkanovikov/KITScenaristCore/tree/a777107fb3058887630ad13a3e85a3118e42a51e). The source observations below use linked develop files; their equivalence to the installed binary has not been established. Both repositories display GPL-3.0 licensing. These sources are references for behavior/data interoperability; implementation must remain original.

The current [official homepage](https://kitscenarist.ru/en/index.html) says KIT was replaced by Story Architect and will receive no more updates. Its top banner advertises the **successor's** multiple episodes, extended character profiles, relationship/location maps and AI tools. Those promotional items are not evidence of KIT parity requirements. The [official help](https://kitscenarist.ru/en/help.html) and historical release pages describe KIT behavior; dated cloud documentation does not prove the cloud service works today.

## Feature checklist and acceptance evidence

All checkboxes are work to demonstrate in Screenwritr. D means the requirement has an upstream basis, not that it is implemented.

### Project lifecycle and research

- [ ] **D** Create/open local projects, display recent projects and open the corresponding research workspace. [Official first-use guide](https://kitscenarist.ru/en/help/first_glance.html).
- [ ] **D** Persist project name, logline, synopsis, title-page information, characters, locations and project materials. Provide descriptions and pictures for character/location records. [Official first-use guide](https://kitscenarist.ru/en/help/first_glance.html).
- [ ] **D** Preserve user ordering and arbitrary nested research items under characters and locations; support folders rather than old scene groups. [0.7.1 beta 1](https://kitscenarist.ru/en/history/2017-02-18.html).
- [ ] **D** Handle rich research documents, image galleries, URLs and mind maps; preserve the entity kinds and metadata specified in the format section. [Research model](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/Domain/Research.h).
- [ ] **D** Export research to PDF, import all research from KITSP, configure research-document font, reset text style and save a mind map as an image. [0.7.2 beta 1](https://kitscenarist.ru/en/history/2017-11-10.html).
- [ ] **D** Apply research colors, including character colors shown beside dialogue. [0.7.2 beta 8](https://kitscenarist.ru/en/history/2018-06-19.html).
- [ ] **D** Support research-document undo/redo and clearly expose a read-only project state when the file is unwritable. [0.7.2 rc6](https://kitscenarist.ru/en/history/2019-04-15.html).
- [ ] **U** Capture all mind-map node/edge/style commands, supported image formats and attachment limits using a synthetic project. A mind-map feature name alone is insufficient parity.

### Structure, outline and cards

- [ ] **D** Represent scenes as cards; arrange in rows or columns, reorder, color, annotate and group into acts/folders; reflect changes in both script and cards. Print cards. [Official homepage](https://kitscenarist.ru/en/index.html).
- [ ] **D** Keep a card's editorial title separate from its screenplay scene heading. Support named/color script versions and version comparison. [0.7.2 beta 9](https://kitscenarist.ru/en/history/2018-09-17.html).
- [ ] **D** Preserve card stamps and scene numbers. [0.7.2 rc4 release notes](https://kitscenarist.ru/en/history.html?start=28).
- [ ] **D** Support additional color tags, editable tag labels and board filtering. [0.7.2 rc9i](https://kitscenarist.ru/en/history/2020-07-15.html).
- [ ] **D** Print colored cards. [0.7.2 rc12](https://kitscenarist.ru/en/history/2021-03-13.html).
- [ ] **D** Provide distinct research, outline and script export choices. [Author response in official guide](https://kitscenarist.ru/en/help/first_glance.html).
- [ ] **I** Test rearranging nested folders/cards with annotations, locked numbers and undo/redo, then close/reopen; assert stable scene identities and no duplicated/disappearing cards. This addresses the failure surfaces documented in [rc9k](https://kitscenarist.ru/en/history/2020-11-09.html) and [rc12](https://kitscenarist.ru/en/history/2021-03-13.html).
- [ ] **U** Capture free-position versus automatic-layout behavior, folding/ungrouping rules, board geometry preferences and exact print pagination in the installed build.

### Screenplay editor and settings

- [ ] **D** Offer all public block types and template properties in the format section, including nonprinting material and outline descriptions. [ScenarioTemplate.h](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioTemplate.h).
- [ ] **D** Provide configurable Tab/Enter paragraph transitions, script navigation, searching, notes, multilingual text and dark/light modes. [Official homepage](https://kitscenarist.ru/en/index.html).
- [ ] **D** Support Zen/fullscreen, optional typewriter sounds, automatic dialogue continuation/page-break corrections, bold/italic/underline, dictionaries for places/times/transitions and dialogue numbering. [0.7.2 beta 3](https://kitscenarist.ru/en/history/2018-01-07.html).
- [ ] **D** Configure scene-number start/prefix, lock numbers, set custom locked numbers and edit colors for multiple selected scenes. [0.7.2 beta 8](https://kitscenarist.ru/en/history/2018-06-19.html).
- [ ] **D** Add/remove paragraph bookmarks and browse them. [0.7.2 beta 7](https://kitscenarist.ru/en/history/2018-05-15.html).
- [ ] **D** Persist script header/footer and allow undoing an automatic text correction. [0.7.2 rc6](https://kitscenarist.ru/en/history/2019-04-15.html).
- [ ] **D** Preserve editorial mark ranges, colors, highlighting, resolved state and comment author/date information. [ScenarioXml.cpp](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioXml.cpp).
- [ ] **D** Provide spell checking and navigator preview-line preferences. [Official first-use guide](https://kitscenarist.ru/en/help/first_glance.html).
- [ ] **I** Verify search/replace termination when replacement contains the search term, formatting/comments across page boundaries, cursor focus after style selection, IME/RTL input and keyboard-only navigation. [Historical regression examples](https://kitscenarist.ru/en/history/2018-12-17.html).
- [ ] **U** Capture complete shortcut mappings, text-language/dictionary selection, auto-completion rules, all review actions, pagination constraints and typography at print boundaries.

### Reports, statistics and timing

- [ ] **D** Calculate characters/symbols, words, pages and total/per-scene duration; support page-based, symbol-based and flexible chronometry; produce/save production reports and character-activity/scene-dynamics charts. [Official homepage](https://kitscenarist.ru/en/index.html).
- [ ] **D** Exclude nonprinting blocks and folder headers/footers from words/symbols; respect selected template for page timing. [0.7.2 beta 6](https://kitscenarist.ru/en/history/2018-03-14.html).
- [ ] **D** Include a character-dialogue report. [0.7.2 rc9](https://kitscenarist.ru/en/history/2019-07-28.html).
- [ ] **I** Derive counts, appearances and reports from the same versioned story graph exposed through MCP. Avoid independently maintained counters.
- [ ] **U** Enumerate every installed report/chart, filters, columns, sort order, timing formula/configuration and report export format. Public `Statistics/Reports` and `Plots` directory fetches failed in this pass, so their names/behavior are not asserted.

### Versions, backup and collaboration

- [ ] **D** Start a named/color version, retain previous script snapshots and compare additions, deletions and modifications. [0.7.2 beta 9](https://kitscenarist.ru/en/history/2018-09-17.html).
- [ ] **D** View older immutable drafts and copy chosen text back into work in progress. [Author clarification](https://kitscenarist.ru/en/history/2019-04-28.html).
- [ ] **D** List recoverable backups with date and size and restore selected screenplay text. [0.7.2 beta 7](https://kitscenarist.ru/en/history/2018-05-15.html).
- [ ] **D** Documented cloud behavior includes cross-device project lists, real-time edits and simultaneous co-authors; a synchronized filesystem folder alone cannot merge concurrent edits. [Official sync guide](https://kitscenarist.ru/en/help/howto_sync_projects.html).
- [ ] **D** Documented collaboration includes a comment-only access mode. [0.7.2 rc9h notes](https://kitscenarist.ru/en/history.html?start=14).
- [ ] **I** Demonstrate crash-safe persistence/recovery and conflict reconciliation without the original cloud service; keep an offline local authoring path.
- [ ] **U** Observe exact permissions/invitation UX, conflict resolution, presence/cursors, research sync, offline reconnect and current cloud availability. No existing credentials were inspected or used.

### Import, export and printing

| Direction | Documented format/workflow | Boundary |
| --- | --- | --- |
| Import | FDX, Fountain, DOCX, ODT, Trelby, desktop Celtx | [Official homepage](https://kitscenarist.ru/en/index.html); format fidelity still requires fixtures. |
| Import | KITSP including research | [0.7.2 beta 1](https://kitscenarist.ru/en/history/2017-11-10.html); schema notes below. |
| Import | FDXT | [Official 2017 release archive](https://kitscenarist.ru/en/history.html?start=91); exact template import semantics unknown. |
| Import | TXT | [Official mobile guide](https://kitscenarist.ru/en/help/howto_mobile_version.html); desktop exposure unresolved. |
| Export | PDF, FDX, Fountain, DOCX | [Official first-use guide](https://kitscenarist.ru/en/help/first_glance.html). |
| Export | Research PDF; mind-map image | [0.7.2 beta 1](https://kitscenarist.ru/en/history/2017-11-10.html). |
| Export/print | Research/outline/script selection; title page; scene/dialogue/page numbers; page-break correction | [Guide](https://kitscenarist.ru/en/help/first_glance.html), [homepage](https://kitscenarist.ru/en/index.html), [beta 3](https://kitscenarist.ru/en/history/2018-01-07.html). |
| Export | PDF watermark | [0.7.2 beta 7](https://kitscenarist.ru/en/history/2018-05-15.html). |

- [ ] **I** Round-trip original synthetic fixtures through each format and compare typed blocks, ordering, rich text, scene numbers, title pages and representable annotations.
- [ ] **I** Produce explicit loss/preservation receipts for unsupported features. Never silently substitute plain text for full project import.
- [ ] **I** Render and inspect actual PDF/DOCX/print output at A4 and Letter, with multiline dialogue and RTL scripts. An export button alone is not parity.
- [ ] **U** Capture format-specific advanced options, whether notes/colors survive each exporter, research selection behavior and exact per-format losses.
- [ ] **U** Do not assume PDF import, production page locking, automatic colored revision pages, multi-episode projects or dual dialogue. They have not been established for the selected binary. [Beta 9](https://kitscenarist.ru/en/history/2018-09-17.html) explicitly deferred dual dialogue and described automatic revision colors as future work.

## Native KITSP format observations

The [official project-format wiki](https://github.com/dimkanovikov/KITScenarist/wiki/kitsp-File-Fomat) identifies `.kitsp` as an open SQLite database. Inspect with a read-only connection and preserve the source file.

The inspected [Database.cpp](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/DataLayer/Database/Database.cpp) creates these tables. These are interoperability facts, not proposed Screenwritr schema.

| Table | Fields |
| --- | --- |
| `system_variables` | variable, value |
| `_database_history` | id, query, query_values, username, datetime |
| `scenario` | id, scheme, text, is_draft |
| `scenario_changes` | id, uuid, datetime, username, undo_patch, redo_patch, is_draft |
| `scenario_data` | id, data_name, data_value |
| `research` | id, parent_id, type, name, description, url, image, color, sort_order |
| `script_versions` | id, fk_script_id, username, datetime, color, name, description, script_text |
| Lookups: `places`, `scenary_days`, `times`, `character_states`, `transitions` | id, name |

The driver is QSQLITE. Research images are BLOBs; parent_id and sort_order form the hierarchy. The current screenplay and a separate draft can coexist. Historical migrations move older character/location tables into research, replace scene_group tags with folder, and introduce versions/colors. Preserve arbitrary scenario_data/system keys rather than relying only on known keys. Legacy schema and exact build correspondence remain compatibility obligations. [Database implementation](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/DataLayer/Database/Database.cpp).

### Research type map

[Research.h](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/Domain/Research.h) defines:

| ID | Kind |
| --- | --- |
| 0 | Script |
| 1 | TitlePage |
| 2 | Synopsis |
| 3 | ResearchRoot |
| 4 | Folder |
| 5 | Text |
| 6 | Url |
| 7 | ImagesGallery |
| 8 | Image |
| 9 | MindMap |
| 10 | Logline |
| 11 | Versions |
| 100 | CharactersRoot |
| 101 | Character |
| 200 | LocationsRoot |
| 201 | Location |

Research stores name, description, URL, image, color and ordering. Ordinary descriptions are rich HTML; URL descriptions can cache webpage content. A character's description has a separate XML wrapper: character contains real_name and description; the latter contains HTML-escaped rich text in CDATA. Recover the character name/description through those layers rather than stripping all XML into one string. [Research.cpp](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/Domain/Research.cpp).

### Screenplay XML and template contracts

[ScenarioXml.cpp](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioXml.cpp) serializes screenplay XML with a scenario root at version 1.0. Typed paragraphs contain their text in a v child; CDATA can still contain HTML-escaped text. Scene/folder metadata includes UUID, title, description, color, stamp and locked number information. Bookmarks have labels/colors. Reviews store character ranges, colors/highlights, done status and attributed/date comments. Formatting has ranges for bold/italic/underline. Two-column splitter markers exist in source, but this does not prove an exposed dual-dialogue feature. Preserve unknown nodes/attributes when converting. [ScenarioXml.h](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioXml.h) distinguishes legacy XML and v1 parsing and can retain linked scene identity during load.

[ScenarioTemplate.h](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioTemplate.h) enumerates SceneHeading, SceneCharacters, Action, Character, Parenthetical, Dialogue, Transition, Note, TitleHeader, Title, NoprintableText, FolderHeader, FolderFooter, SceneDescription and Lyrics, plus internal Undefined, SceneHeadingShadow and PageSplitter. Do not discard unfamiliar types.

The template API exposes page size/margins, numbering alignment and per-block activation, font, alignment, spacing, margins, prefixes/postfixes, uppercase and grouping behavior. Named defaults include Final Draft A4/Letter, Russian variants, Chinese, Hebrew and Arabic. User templates can be saved/removed. This describes configuration surfaces; exact typography and serialization still require validation. [Template API](https://raw.githubusercontent.com/dimkanovikov/KITScenaristCore/develop/BusinessLayer/ScenarioDocument/ScenarioTemplate.h).

## Connected model and MCP implications — proposed Screenwritr design

These are **I**, original design recommendations inferred from the requirements and data relationships.

1. Maintain stable project, document, folder, scene, block, entity, asset, annotation and version identifiers. Cards, outline, editor and reports should be projections of the same scene order and content.
2. Represent screenplay blocks semantically; compute page layout separately. Printed continuation labels and pagination corrections should not become duplicated authored dialogue.
3. Keep explicit canon separate from inferred mentions. Character presence may be explicit in SceneCharacters, voiced in dialogue, or merely mentioned in action. KIT's author identifies both action mentions and SceneCharacters as ways to represent nonspeaking characters. [Official guide clarification](https://kitscenarist.ru/en/help/first_glance.html).
4. Let character/location records contain arbitrary research children and media references. Attach scene/entity links with source block/range evidence and distinguish explicit links from machine suggestions.
5. Expose active-project identity, revision, selected scene and text selection through a local MCP adapter. Read operations should return bounded, paged, revision-consistent snapshots.
6. Provide project summary, scene list/full scene, typed screenplay, entity list/detail, appearances, research tree/document, assets metadata, annotations, versions and report queries. Return source IDs and relationships so Codex/Claude can cite what was read.
7. Add a structured story package that carries explicit characters, locations, scene appearances, time/place, descriptions and provenance to sibling creative tools. Generic additional entities such as props, costume, sound and beats are Screenwritr extensions, not established KIT feature types.
8. Keep story text untrusted in the MCP boundary: it is content, not tool instructions. Restrict adapters to the user-selected project; avoid exposing filesystem-wide reads or secrets. Validate every mutation, use expectedRevision, keep an undoable audit trail and separate read sharing from edits.
9. Persist atomically, retain recoverable snapshots and embed schema version/migration receipts. Import should preserve an untouched original and a loss report.
10. Share design tokens, command patterns and a versioned domain SDK with the creative-tool family; keep the editor, import/export, persistence and MCP services separable from presentation.

## Parity completion gates

A full-parity claim requires all of the following:

- A synthetic KIT project covering every entity/research type, nested structures, annotations, draft/version state and media; no unrelated personal story is needed.
- Installed native screenshots and interaction receipts for every module/dialog/action used to define parity.
- A feature-to-test ledger with working, partial, deferred and unknown states, plus data and export loss receipts.
- Save/close/reopen, crash recovery, backup restoration, undo/redo and import/export round trips with preserved scene/entity identities.
- Actual packaged Electron runtime checks, including MCP against the active story and error paths.
- Matching benchmarks on the same machine and synthetic workload: cold/warm start, idle/private memory, installed/package size, input latency, scroll/layout stability, autosave time and a large script with research images. “Lighter” and “smoother” remain unverified until measured.
- Browser/native visual review for the proposed better interface, and human acceptance of the creative-tool family direction.

## Complete REA evidence appendix

The JSON below is retained verbatim as returned structured Evidence. It contains only the selected executable's static metadata/resource inventory. No target execution, decompiled implementation or icon/image payload was collected.

<details>
<summary>Artifact inspection</summary>

```json
{
  "evidence_id": "ev_deef913a33964ad65474cc49013e650120104394b32ff473e4306444bcabaacd",
  "subject": {
    "name": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
    "digest": {
      "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e"
    },
    "format": "pe",
    "architecture": null,
    "local_path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
  },
  "provider": {
    "id": "rea-artifact-graph",
    "name": "REA safe artifact graph provider",
    "version": "1"
  },
  "analysis_profile": null,
  "predicate_type": "rea.analysis",
  "operation": "inspect_artifact",
  "parameters": {
    "integrity_policy": "fail"
  },
  "raw_result": null,
  "normalized_result": {
    "inspection_id": "ai_14790644041fa5fccbabf13737d1c66dab5fe3ff08bdf34c7b49971f39567c94",
    "subject": {
      "manifest_id": "agm_8b434ff0c9f964704b6f5f9efa7469b842bd23041bc644a89c6fef3d757d914f",
      "root_artifact_id": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
      "root_sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
      "root_format": "pe"
    },
    "substeps": [
      {
        "substep_id": "ais_ccf2339f07e1f0f387d097f9aae7b1b9cb9cbde6db56e16a8d9f185f766df425",
        "operation": "inventory_artifact",
        "status": "completed",
        "evidence_id": "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375",
        "evidence": {
          "evidence_id": "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375",
          "subject": {
            "name": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
            "digest": {
              "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e"
            },
            "format": "pe",
            "architecture": null,
            "local_path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
          },
          "provider": {
            "id": "rea-artifact-graph",
            "name": "REA safe artifact graph provider",
            "version": "1"
          },
          "analysis_profile": null,
          "predicate_type": "rea.analysis",
          "operation": "inventory_artifact",
          "parameters": {
            "integrity_policy": "fail"
          },
          "raw_result": null,
          "normalized_result": {
            "manifest": {
              "manifest_id": "agm_8b434ff0c9f964704b6f5f9efa7469b842bd23041bc644a89c6fef3d757d914f",
              "root_artifact_id": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
              "root_sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
              "root_format": "pe",
              "graph_sha256": "464180083a3d3f19aaf24133a63afa69e1ee903522fd27e4fd882dad171a4073",
              "node_count": 1,
              "occurrence_count": 1,
              "edge_count": 0
            },
            "nodes": [
              {
                "artifact_id": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
                "format": "pe",
                "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
                "size": 15773184,
                "media_type": null,
                "architecture": null,
                "content_state": "materialized",
                "limitations": []
              }
            ],
            "occurrences": [
              {
                "occurrence_id": "occ_061c53993afaaa14ba66cfe3cc669430ec0c572ce8011e46a493cd2f108d16f4",
                "artifact_id": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
                "parent_occurrence_id": null,
                "logical_path": ".",
                "entry_kind": "file",
                "artifact_kind": "executable",
                "artifact_format": "pe",
                "declared_size": 15773184,
                "compressed_size": null,
                "executable": false,
                "encrypted": false,
                "hash_status": "verified",
                "source_location": null,
                "limitations": []
              }
            ],
            "edges": [],
            "provenance": [],
            "integrity_contradictions": [],
            "limitations": [
              "Artifact has no child container entries."
            ]
          },
          "confidence": "observed",
          "authority": "shipped-artifact",
          "environment": null,
          "limitations": [
            "Artifact has no child container entries."
          ],
          "locations": [],
          "evidence_links": []
        }
      }
    ],
    "observations": [
      {
        "observation_id": "aio_73105b50e6b46a90f3aa6a68e1ce234d7e3fbdfa5338456a16dfbd61933ee36e",
        "kind": "root-manifest",
        "subject": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
        "value": {
          "manifest_id": "agm_8b434ff0c9f964704b6f5f9efa7469b842bd23041bc644a89c6fef3d757d914f",
          "root_artifact_id": "art_816faa48a2cf361d9e25e5b4ef23d3ebb34f418eeac5a3454c6fab1c9bd53863",
          "root_sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
          "root_format": "pe",
          "graph_sha256": "464180083a3d3f19aaf24133a63afa69e1ee903522fd27e4fd882dad171a4073",
          "node_count": 1,
          "occurrence_count": 1,
          "edge_count": 0
        },
        "evidence_id": "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
      }
    ],
    "hypotheses": [
      {
        "hypothesis_id": "aih_0c02db68c5cd8c29ca0b62236b78eea4d2f95e95dd04f65f9ccefba87a5d2436",
        "statement": "The PE artifact may contain managed CLI metadata or native code; inventory bytes alone do not distinguish them.",
        "confidence": "low",
        "basis_evidence_ids": [
          "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
        ],
        "limitation": "Format classification proposes a bounded follow-up; it is not semantic proof."
      }
    ],
    "contradictions": [],
    "unexplored_branches": [
      {
        "branch_id": "aib_fe3702bb05d0e37e67e25d9900a2ca68d713afab1f8ab16ed5a22484b3660e07",
        "reason": "format-specific-analysis-required",
        "detail": "inspect_managed_artifact was not run by provider-neutral artifact inspection.",
        "next_probe": {
          "operation": "inspect_managed_artifact",
          "rationale": "Check execution-free CLI metadata before choosing a deep native provider.",
          "authority": "managed-static-analysis"
        },
        "evidence_id": "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
      },
      {
        "branch_id": "aib_fe3d535e07906149a7794b9d5371bd5055dd9b5601b41bc754866a28fbe85f0d",
        "reason": "format-specific-analysis-required",
        "detail": "open_binary was not run by provider-neutral artifact inspection.",
        "next_probe": {
          "operation": "open_binary",
          "rationale": "Open as native code only when managed inspection reports a native or mixed boundary.",
          "authority": "native-analysis-provider"
        },
        "evidence_id": "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
      }
    ],
    "next_probes": [
      {
        "operation": "inspect_managed_artifact",
        "rationale": "Check execution-free CLI metadata before choosing a deep native provider.",
        "authority": "managed-static-analysis"
      },
      {
        "operation": "open_binary",
        "rationale": "Open as native code only when managed inspection reports a native or mixed boundary.",
        "authority": "native-analysis-provider"
      }
    ],
    "coverage": {
      "status": "complete-within-substeps",
      "substeps_completed": 1,
      "observations_retained": 1,
      "observations_omitted": 0,
      "hypotheses_retained": 1,
      "hypotheses_omitted": 0,
      "unexplored_branches_retained": 2,
      "unexplored_branches_omitted": 0,
      "next_probes_retained": 2,
      "next_probes_omitted": 0
    },
    "evidence_links": [
      "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
    ],
    "limitations": [
      "Artifact has no child container entries.",
      "Inspection derives bounded static hypotheses and next probes; it does not execute the artifact or claim format-specific semantics."
    ]
  },
  "confidence": "observed",
  "authority": "shipped-artifact",
  "environment": null,
  "limitations": [
    "Artifact has no child container entries.",
    "Inspection derives bounded static hypotheses and next probes; it does not execute the artifact or claim format-specific semantics."
  ],
  "locations": [],
  "evidence_links": [
    "ev_106ef14f54a788f73b203c70bad2163e55b620bbbefde1acbde0fbd8802f8375"
  ]
}
```

</details>

<details>
<summary>Managed classification</summary>

```json
{
  "evidence_id": "ev_838ad226cbddb974d2ae95c29e447cbcb1d3ab82e4cd7c4c9655d3a170affb24",
  "subject": {
    "name": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
    "digest": {
      "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e"
    },
    "format": "pe",
    "architecture": "x86",
    "local_path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
  },
  "provider": {
    "id": "rea-dotnet-static",
    "name": "REA managed static analysis provider",
    "version": "1"
  },
  "analysis_profile": null,
  "predicate_type": "rea.analysis",
  "operation": "inspect_managed_artifact",
  "parameters": {
    "path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
  },
  "raw_result": null,
  "normalized_result": {
    "artifact": {
      "path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
      "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
      "byte_length": 15773184,
      "format": "pe"
    },
    "pe": {
      "machine": 332,
      "machine_hex": "0x014c",
      "architecture": "x86",
      "optional_header": "pe32",
      "section_count": 5,
      "characteristics": 258,
      "cli": null
    },
    "classification": {
      "status": "not-managed",
      "container": "pe",
      "runtime_family": "unknown",
      "implementation": "not-managed",
      "managed_architecture": "unknown",
      "evidence": [
        {
          "code": "cli-directory-absent",
          "detail": "The PE has no CLI data directory; managed metadata and CIL are unavailable.",
          "file_offset": null
        }
      ]
    },
    "metadata": {
      "status": "absent",
      "version": null,
      "stream_names": [],
      "table_row_counts": {}
    },
    "module": null,
    "assembly": null,
    "target_frameworks": [],
    "references": [],
    "resources": [],
    "attributes": [],
    "coverage": {
      "state": "unavailable",
      "issues": []
    },
    "limitations": [
      "The PE has no CLI data directory; managed metadata and CIL are unavailable."
    ]
  },
  "confidence": "observed",
  "authority": "shipped-artifact",
  "environment": null,
  "limitations": [
    "The PE has no CLI data directory; managed metadata and CIL are unavailable."
  ],
  "locations": [
    {
      "kind": "file-offset",
      "offset": 0
    }
  ],
  "evidence_links": []
}
```

</details>

<details>
<summary>PE resources</summary>

```json
{
  "evidence_id": "ev_98b89692d9b8e07b0da6fa5754e0938d0f5b19b1a0e8e471c084c0586e98f4ec",
  "subject": {
    "name": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
    "digest": {
      "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e"
    },
    "format": "pe",
    "architecture": null,
    "local_path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
  },
  "provider": {
    "id": "rea-pe-resources",
    "name": "REA PE resource parser",
    "version": "1"
  },
  "analysis_profile": null,
  "predicate_type": "rea.analysis",
  "operation": "inspect_pe_resources",
  "parameters": {
    "path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
    "max_file_bytes": 67108864,
    "max_entries": 4096
  },
  "raw_result": null,
  "normalized_result": {
    "artifact": {
      "path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe",
      "sha256": "424011b7b8730fc369d53ca4afa05bdff991607a72f05406850a7019764e8a7e",
      "bytes": 15773184
    },
    "format": "pe32",
    "machine": 332,
    "directory": {
      "rva": 15319040,
      "location": {
        "offset": 15304704,
        "bytes": 156120
      },
      "data_directory_location": {
        "offset": 416,
        "bytes": 8
      }
    },
    "directories": [
      {
        "location": {
          "offset": 15304704,
          "bytes": 40
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 3
      },
      {
        "location": {
          "offset": 15304744,
          "bytes": 96
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 10
      },
      {
        "location": {
          "offset": 15304888,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304912,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304936,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304960,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304984,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305008,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305032,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305056,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305080,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305104,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304840,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 1,
        "id_entries": 0
      },
      {
        "location": {
          "offset": 15305128,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15304864,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      },
      {
        "location": {
          "offset": 15305152,
          "bytes": 24
        },
        "characteristics": 0,
        "timestamp": 0,
        "major_version": 0,
        "minor_version": 0,
        "named_entries": 0,
        "id_entries": 1
      }
    ],
    "resources": [
      {
        "index": 0,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 1
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304760,
            "bytes": 8
          },
          {
            "offset": 15304904,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305176,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15319728,
          "location": {
            "offset": 15305392,
            "bytes": 1384
          },
          "sha256": "cecc289cd99fa0aeddc89b780f0175b35953a3c25853de56fb619a752d98f9aa"
        }
      },
      {
        "index": 1,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 2
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304768,
            "bytes": 8
          },
          {
            "offset": 15304928,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305192,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15321112,
          "location": {
            "offset": 15306776,
            "bytes": 1736
          },
          "sha256": "964e15fda06658b63898868e2e81587801d42cf0d683113be020bc724b72c18a"
        }
      },
      {
        "index": 2,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 3
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304776,
            "bytes": 8
          },
          {
            "offset": 15304952,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305208,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15322848,
          "location": {
            "offset": 15308512,
            "bytes": 2216
          },
          "sha256": "3d150482afd6e6839bd9812a252f93de822691966e05b75c4f3d8071bf2ce556"
        }
      },
      {
        "index": 3,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 4
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304784,
            "bytes": 8
          },
          {
            "offset": 15304976,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305224,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15325064,
          "location": {
            "offset": 15310728,
            "bytes": 5672
          },
          "sha256": "973b7a8e3cb7c231c2a938c4c34e3af4b703feae9158f1a75ae2e8e1cbde539d"
        }
      },
      {
        "index": 4,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 5
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304792,
            "bytes": 8
          },
          {
            "offset": 15305000,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305240,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15330736,
          "location": {
            "offset": 15316400,
            "bytes": 51240
          },
          "sha256": "90c31515c0593628b284b696f55e8e169ca09283e66e112137133dba74a6620a"
        }
      },
      {
        "index": 5,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 6
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304800,
            "bytes": 8
          },
          {
            "offset": 15305024,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305256,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15381976,
          "location": {
            "offset": 15367640,
            "bytes": 1128
          },
          "sha256": "e39eb56abcad4a56429349a0ace52fd616fdd4e29e024e1feae91fe73d67f179"
        }
      },
      {
        "index": 6,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 7
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304808,
            "bytes": 8
          },
          {
            "offset": 15305048,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305272,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15383104,
          "location": {
            "offset": 15368768,
            "bytes": 2440
          },
          "sha256": "a117fe536f6712835d74f96b358af82108cab18e7fa32296f879b65d580ffe3b"
        }
      },
      {
        "index": 7,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 8
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304816,
            "bytes": 8
          },
          {
            "offset": 15305072,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305288,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15385544,
          "location": {
            "offset": 15371208,
            "bytes": 4264
          },
          "sha256": "919d3ad3e09658d4a61da992f6de1d887af3b8b3cfa0ebaebed22055f5a264fe"
        }
      },
      {
        "index": 8,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 9
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304824,
            "bytes": 8
          },
          {
            "offset": 15305096,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305304,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15389808,
          "location": {
            "offset": 15375472,
            "bytes": 16936
          },
          "sha256": "36aecaaae05ec143c8119f6c5f28fc567e37b7ea6146a0fc2755c225dfb53e8e"
        }
      },
      {
        "index": 9,
        "type": {
          "kind": "id",
          "id": 3
        },
        "name": {
          "kind": "id",
          "id": 10
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304720,
            "bytes": 8
          },
          {
            "offset": 15304832,
            "bytes": 8
          },
          {
            "offset": 15305120,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305320,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15406744,
          "location": {
            "offset": 15392408,
            "bytes": 67624
          },
          "sha256": "43558364db116201432c7fc02fb04e18ed1c47b036f37803e2d2eaf2184ea098"
        }
      },
      {
        "index": 10,
        "type": {
          "kind": "id",
          "id": 14
        },
        "name": {
          "kind": "name",
          "name": "IDI_ICON1",
          "utf16le_hex": "4900440049005f00490043004f004e003100",
          "location": {
            "offset": 15305368,
            "bytes": 20
          }
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304728,
            "bytes": 8
          },
          {
            "offset": 15304856,
            "bytes": 8
          },
          {
            "offset": 15305144,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305336,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15474368,
          "location": {
            "offset": 15460032,
            "bytes": 146
          },
          "sha256": "367005e6827de5a4c07f1efdee28ee8599ab2a0a46b6b0fbc926c926c1d1dc59"
        }
      },
      {
        "index": 11,
        "type": {
          "kind": "id",
          "id": 24
        },
        "name": {
          "kind": "id",
          "id": 1
        },
        "language": {
          "kind": "id",
          "id": 1033
        },
        "entry_locations": [
          {
            "offset": 15304736,
            "bytes": 8
          },
          {
            "offset": 15304880,
            "bytes": 8
          },
          {
            "offset": 15305168,
            "bytes": 8
          }
        ],
        "data_entry_location": {
          "offset": 15305352,
          "bytes": 16
        },
        "code_page": 0,
        "reserved": 0,
        "payload": {
          "rva": 15474520,
          "location": {
            "offset": 15460184,
            "bytes": 638
          },
          "sha256": "97b1dfac60ade39e293fb39a093e1fd01fec5438549c9bb1e341c7fc82d102fb"
        }
      }
    ],
    "icon_groups": [
      {
        "resource_index": 10,
        "images": [
          {
            "location": {
              "offset": 15460038,
              "bytes": 14
            },
            "width": 16,
            "height": 16,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 8,
            "declared_bytes": 1384,
            "resource_id": 1,
            "candidate_resource_indices": [
              0
            ],
            "same_language_resource_index": 0,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460052,
              "bytes": 14
            },
            "width": 24,
            "height": 24,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 8,
            "declared_bytes": 1736,
            "resource_id": 2,
            "candidate_resource_indices": [
              1
            ],
            "same_language_resource_index": 1,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460066,
              "bytes": 14
            },
            "width": 32,
            "height": 32,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 8,
            "declared_bytes": 2216,
            "resource_id": 3,
            "candidate_resource_indices": [
              2
            ],
            "same_language_resource_index": 2,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460080,
              "bytes": 14
            },
            "width": 64,
            "height": 64,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 8,
            "declared_bytes": 5672,
            "resource_id": 4,
            "candidate_resource_indices": [
              3
            ],
            "same_language_resource_index": 3,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460094,
              "bytes": 14
            },
            "width": 128,
            "height": 128,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 24,
            "declared_bytes": 51240,
            "resource_id": 5,
            "candidate_resource_indices": [
              4
            ],
            "same_language_resource_index": 4,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460108,
              "bytes": 14
            },
            "width": 16,
            "height": 16,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 32,
            "declared_bytes": 1128,
            "resource_id": 6,
            "candidate_resource_indices": [
              5
            ],
            "same_language_resource_index": 5,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460122,
              "bytes": 14
            },
            "width": 24,
            "height": 24,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 32,
            "declared_bytes": 2440,
            "resource_id": 7,
            "candidate_resource_indices": [
              6
            ],
            "same_language_resource_index": 6,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460136,
              "bytes": 14
            },
            "width": 32,
            "height": 32,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 32,
            "declared_bytes": 4264,
            "resource_id": 8,
            "candidate_resource_indices": [
              7
            ],
            "same_language_resource_index": 7,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460150,
              "bytes": 14
            },
            "width": 64,
            "height": 64,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 32,
            "declared_bytes": 16936,
            "resource_id": 9,
            "candidate_resource_indices": [
              8
            ],
            "same_language_resource_index": 8,
            "size_matches": true
          },
          {
            "location": {
              "offset": 15460164,
              "bytes": 14
            },
            "width": 128,
            "height": 128,
            "color_count": 0,
            "reserved": 0,
            "planes": 1,
            "bit_count": 32,
            "declared_bytes": 67624,
            "resource_id": 10,
            "candidate_resource_indices": [
              9
            ],
            "same_language_resource_index": 9,
            "size_matches": true
          }
        ]
      }
    ],
    "coverage": {
      "status": "complete",
      "examined_entries": 27,
      "resources": 12
    },
    "limitations": [
      "Static PE32/PE32+ type/name/language resource inventory; payloads other than RT_GROUP_ICON remain opaque.",
      "Icon candidates are resource-table relationships. Language fallback, image decoding and actual shell/window loading are not observed.",
      "Exact shared byte ranges are retained; non-identical overlapping resource structures or payloads are rejected."
    ]
  },
  "confidence": "observed",
  "authority": "shipped-artifact",
  "environment": null,
  "limitations": [
    "Static PE32/PE32+ type/name/language resource inventory; payloads other than RT_GROUP_ICON remain opaque.",
    "Icon candidates are resource-table relationships. Language fallback, image decoding and actual shell/window loading are not observed.",
    "Exact shared byte ranges are retained; non-identical overlapping resource structures or payloads are rejected."
  ],
  "locations": [
    {
      "kind": "artifact-path",
      "path": "C:\\Program Files (x86)\\KIT\\Scenarist\\Scenarist.exe"
    }
  ],
  "evidence_links": []
}
```

</details>

<details>
<summary>Native provider limitation</summary>

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"error\":{\"code\":\"provider_unavailable\",\"category\":\"unavailable\",\"message\":\"The selected analysis provider is unavailable. Review the reported local diagnostics or run `rea doctor`, then retry.\",\"retryable\":true,\"remediation\":{\"action\":\"The selected analysis provider is unavailable. Review the reported local diagnostics or run `rea doctor`, then retry.\"},\"details\":{\"operation\":\"current_document\",\"selection_reason\":\"provider_unavailable\",\"requested_provider_id\":\"auto\",\"candidate_ids\":[\"ghidra\",\"hopper\",\"ida\"],\"rejections\":[{\"provider_id\":\"ghidra\",\"code\":\"not_configured\",\"reason\":\"Set GHIDRA_INSTALL_DIR to an extracted Ghidra 12.1.x release directory.\",\"diagnostics\":{\"install_dir\":null,\"analyze_headless_path\":null,\"native_decompiler_path\":null,\"application_properties_path\":null,\"provider_version\":null,\"java_command\":\"java.exe\",\"java_home\":null,\"java_version\":null,\"platform\":\"win32\",\"architecture\":\"x64\",\"checks\":[{\"name\":\"configuration\",\"ok\":false,\"code\":\"not_configured\",\"detail\":\"GHIDRA_INSTALL_DIR is not set\"},{\"name\":\"platform\",\"ok\":true,\"code\":null,\"detail\":\"win32\"},{\"name\":\"architecture\",\"ok\":true,\"code\":null,\"detail\":\"x64\"},{\"name\":\"installation\",\"ok\":false,\"code\":\"executable_missing\",\"detail\":\"Ghidra application properties unavailable\"},{\"name\":\"version\",\"ok\":false,\"code\":\"version_unresolved\",\"detail\":\"unknown\"},{\"name\":\"headless\",\"ok\":false,\"code\":\"executable_missing\",\"detail\":\"analyzeHeadless unavailable\"},{\"name\":\"native_decompiler\",\"ok\":false,\"code\":\"executable_missing\",\"detail\":\"Matching native decompiler for win32/x64 was not found\"},{\"name\":\"java\",\"ok\":false,\"code\":\"runtime_missing\",\"detail\":\"java.exe\"}]}},{\"provider_id\":\"hopper\",\"code\":\"unsupported_host\",\"reason\":\"Hopper integration is not supported on win32.\",\"diagnostics\":{\"launcher_path\":\"/Applications/Hopper Disassembler.app/Contents/MacOS/hopper\",\"platform\":\"win32\"}},{\"provider_id\":\"ida\",\"code\":\"not_configured\",\"reason\":\"Set REA_IDA_MCP_CONFIG to an upstream IDA MCP JSON registration; see docs/ida-provider.md.\",\"diagnostics\":{\"configured\":false,\"live_connection_probed\":false}}]}}}"
    }
  ],
  "isError": true
}
```

</details>
