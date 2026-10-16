# Creative-family contract

Screenwritr owns a versioned story document and exports org.icuni.story-graph v1. Its product identity is org.icuni.screenwritr. The renderer, persistence layer, exporters and MCP server share one domain model; scene order and allocation are derived from screenplay source blocks.

The graph includes story metadata, ordered scenes, characters, locations, details, research references, relationships and a statistics snapshot. Each node/edge carries source references using screenwritr URIs and stable story/scene/block/entity IDs. Explicit canonical profiles and declared allocations are distinguished from inferred discoveries. The graph carries no absolute local source/archive paths.

Downstream applications should preserve these IDs when importing; store their own presentation/production data separately. Resolve an unknown schemaVersion explicitly and preserve unknown native extension fields. A graph is a snapshot: consumers must not treat it as a live mutable Screenwritr connection.

Planned adapters are Storytellr, Storyboarder and MMMedia. This preview exports the contract but does not implement bidirectional synchronization, shared asset storage, remote collaboration, accounts or a family-wide launcher. MCP is read-only; authored changes should return as an explicit new project/import until a conflict-aware write contract exists.

The Windows package also emits release/Screenwritr-0.1.1.asar. A compatible Electron 44.8.0 runtime can launch this archive as its application argument. This path passed native launch and active-story MCP grant/read/revoke checks. It is a runnable module with its own window/process and profile; it is not an implemented family launcher or an embeddable renderer component. Future hosts must preserve profile isolation and supply a compatible runtime rather than relying on an arbitrary installed Electron version.
