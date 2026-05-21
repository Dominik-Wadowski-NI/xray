# Xray

**Xray** is a sophisticated, polyglot code intelligence platform for analyzing entry points across multi-service TypeScript/JavaScript codebases. Its generalized, layered pipeline transforms raw source code into structured, queryable data about function calls, cross-package dependencies, and external integrations:

1. **Discover** — Identify all entry points (GraphQL resolvers, REST endpoints, regular functions, methods) per service
2. **Aggregate** — Unify across services and packages, infer ownership, map cross-boundary links
3. **Trace** — Build call graphs, identify external integrations (APIs, databases, queues), analyze cross-package calls
4. **Output** — JSON reports, interactive visualization, MCP API for AI-assisted exploration

**Key Design Principles:**
- **Generality:** Support any entry point type (GraphQL, REST, functions, methods) via pluggable detectors
- **Modularity:** Each layer is independent; outputs of one feed into the next
- **Configurability:** Per-service configs enable multi-repo, multi-framework environments
- **Extensibility:** New entry point types, frameworks, and languages can be added without core changes
- **Accuracy:** ts-morph-based AST parsing ensures symbol resolution in full context

**Primary Use Cases:**
- Platform teams understanding service boundaries, federation patterns, and cross-package dependencies
- Backend developers debugging complex call chains, tracing integrations, identifying performance bottlenecks
- DevOps/SRE teams finding unused services, mapping infrastructure dependencies
- AI assistants exploring codebases, navigating call graphs, identifying dead code via MCP tools
