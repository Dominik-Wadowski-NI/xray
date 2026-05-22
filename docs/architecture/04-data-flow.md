# Data Flow & Pipelines

## Pipeline 1: Entry Point Discovery (Per-Service)

```
Service Source Code + Entry Point Config
       ↓
[Load Config]  → rootDir, tsconfig, entryPoints[]
       ↓
[Create Project] → ts-morph + load all TS/JS files
       ↓
[Dispatch Detectors] → Run enabled detectors (GraphQL, REST, function, method)
       ↓
[Normalize] → Unified EntryPoint[] across all types
       ↓
[Write bin/{service}/entry-points.json]
       ↓
Ready for Pipeline 2 (Aggregation)
```

---

## Pipeline 2: Aggregation (All Services & Packages)

```
bin/product-rts/entry-points.json
bin/content-element-rts/entry-points.json
       ↓
[Load All] → ServiceEntryPointEntry[][]
       ↓
[Classify] → Infer kind per entry point type (rootQuery, route, handler, etc.)
       ↓
[Infer Ownership] → Assign resource/package ownership
       ↓
[Link] → Build CrossBoundaryLink[] (cross-service, cross-package, cross-module)
       ↓
[Build Report] → Aggregate summary by type, deduplicate resources
       ↓
[Write bin/entry-point-map.json]
       ↓
Ready for Pipeline 3 (Call Graph Tracing) and Layer 4 (Visualization)
```

---

## Pipeline 3: Call Graph Tracing (Per-Service, Optional Per-Entry-Point)

```
bin/{service}/entry-points.json
       ↓
[Load Entry Point List] → Filter by optional --entry-point flag or --type flag
       ↓
For Each Entry Point:
  ├─ [Create Project] → Load full service + monorepo package source
  ├─ [Find Function/Method] → Locate by definition file + line
  ├─ [Scan Graph] → Recursive call traversal
  │  ├─ Collect calls & imports (npm, relative, cross-package)
  │  ├─ Classify (internal, external, unresolved)
  │  ├─ Recurse for internal and cross-package calls
  │  └─ Pattern-match HTTP/DB/messaging
  ├─ [Collect Classes] → new ClassName() instantiations
  └─ [Build Report] → CallGraphReport
       ↓
[Write bin/{service}/call-graphs.{entryPointId}.json]
       ↓
Ready for Pipeline 3a (Exit Point Extraction)
```

---

## Pipeline 3a: Exit Point Extraction (Per-Service Call Graphs)

```
All bin/{service}/call-graphs.*.json (all entry points, all services)
       ↓
[Load Call Graphs] → For each service, load all entry point call graph reports
       ↓
[Extract Exit Points] → Parse databaseCalls[], apiRequests[], externalPackages[]
  ├─ Identify database operations and targets
  ├─ Identify API requests and endpoints
  ├─ Identify message queue operations
  ├─ Identify cache operations
  └─ Identify external service integrations
       ↓
[Aggregate by Service] → Group exit points by service
       ↓
[Deduplicate] → Merge identical exit points, calculate usage frequency
       ↓
[Classify] → Tag by type, assign criticality, identify risk patterns
       ↓
[Write bin/service-exit-points.json]
       ↓
Ready for Pipeline 4c (System Map Generation)
```

---

## Pipeline 4a: Web Visualization (D3 Graph)

```
bin/entry-point-map.json
       ↓
[HTTP Server] → serve-docs-advanced.py
       ↓
[Client: D3.js]
  ├─ Load graph data (nodes = services/types/routes, edges = entry points & dependencies)
  ├─ Render force-directed layout
  ├─ On entry point click:
  │  ├─ Fetch bin/{service}/call-graphs.{entryPointId}.json
  │  └─ Render detail panel (calls, packages, DB queries, cross-package links)
  └─ Interactive filter by entry point type & zoom
```

---

## Pipeline 4b: MCP Tool Exposure (On-Demand Tracing)

```
MCP Client (Cursor, Claude, etc.)
       ↓
[Tool Request] → get-call-graph-code { service, entryPointId }
       ↓
[Xray MCP Server] → stdio subprocess
  ├─ Load config
  ├─ Run call graph tracing pipeline (same as Pipeline 3)
  └─ Embed source code snippets into report
       ↓
[JSON Response] → Full CallGraphReport
       ↓
MCP Client uses data for context-aware analysis
```

---

## Pipeline 4c: System Map Generation (Full System Dependency Mapping)

```
bin/entry-point-map.json + bin/service-exit-points.json + All bin/{service}/call-graphs.*.json
       ↓
[Load Reports] → Load entry points, exit points, and call graphs
       ↓
[Extract Dependencies] → Identify service-to-service, package-to-package relationships
       ↓
[Enrich with Exit Points] → Associate external systems from bin/service-exit-points.json
       ↓
[Build Graph] → Create service/package nodes and dependency edges with exit point context
       ↓
[Classify Edges] → Tag by dependency type (call, type import, federation, etc.)
       ↓
[Compute Topology] → Calculate layers, cycles, metrics, external system criticality
       ↓
[Write bin/system-map.json]
       ↓
Ready for visualization and architecture analysis
```

---

See [05-data-models.md](./05-data-models.md) for the complete schemas of all output artifacts.
