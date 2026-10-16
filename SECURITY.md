# Security and data handling

Renderer code runs sandboxed with context isolation, no Node integration, a narrow frozen preload and sender/main-frame/origin-checked IPC. Navigation, child windows, webviews and permissions are denied. Native dialogs choose file paths. URLs are restricted to explicit HTTP(S) opening. XML DTD/entities, unsupported archive compression/encryption, traversal and excessive file/entry/expanded sizes are rejected. Imported HTML is parsed as text, never executed.

Project and recovery files are local plaintext. Do not commit real stories, app profiles, credentials, imported source archives or private validation screenshots. This preview does not provide encryption, remote backups, accounts or automatic updates. MCP sharing is opt-in, read-only and scoped to the current live story. See docs/mcp.md for its limits.

Before a production release: complete dependency/advisory review, fuzz importers, sign binaries, verify updater provenance, and perform a separate security review of any future collaboration/write integration. Report issues privately to the repository owner.
