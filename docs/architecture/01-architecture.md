# Architecture Overview

## Generalized Pipeline Architecture

Xray implements a **4-layer pipeline** that transforms raw source code into structured, queryable code intelligence:

```
Input: Source Code + Entry Point Config
   ↓
[Layer 1: Discovery]       → Identify all entry points (resolvers, endpoints, functions)
   ↓
[Layer 2: Tracing]         → Analyze implementation details from each entry point
   ↓
[Layer 3: Mapping]         → Build system skeleton showing service/package dependencies
   ↓
[Layer 4: Output]          → Artifacts, visualization, APIs
   ↓
Output: Code Intelligence Data
```

## Component Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                      CLI Entry Points                        │
├──────────────────────────────────────────────────────────────┤
│  extract:graphql        map:resolvers        trace:flow      │
└────────┬────────────────────┬─────────────────────┬──────────┘
         │                    │                     │
    ┌────▼───-────┐    ┌──────▼──────┐    ┌────────▼──────┐
    │  graphql-   │    │ resolver-   │    │  resolver-    │
    │  resolvers  │    │  map         │    │  flow         │
    └────┬────-───┘    └──────┬──────┘    └────────┬──────┘
         │                    │                    │
         └─────────┬──-───────┴────────────────────┘
                   │
              ┌────▼────────────┐
              │   shared/       │
              │  - morph        │
              │  - cli          │
              │  - report       │
              └────┬────────────┘
                   │
              ┌────▼────────────┐
              │    config/      │
              │  getConfig()    │
              └─────────────────┘
```

### 4-Layer Pipeline

**Layer 1: Discovery** → Service-specific entry point detection  
**Layer 2: Tracing** → Call graph analysis from each entry point  
**Layer 3: Mapping** → System-wide dependency aggregation and exit point extraction  
**Layer 4: Output** → JSON reports, visualization, MCP APIs  

Each layer produces artifacts that feed into downstream layers and consumer applications.

---

See [02-components.md](./02-components.md) for detailed component design and [03-data-flow.md](./03-data-flow.md) for pipeline implementations.
