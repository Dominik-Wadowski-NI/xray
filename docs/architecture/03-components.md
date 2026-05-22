# Component Design

## 1. Configuration Module (`src/config/`)

**Purpose:** Central registry of service definitions, entry point type configurations, and output paths.

**Operations:**
- `getConfigForService(service: Services | string): Config` — Load service config
- Entry point configs declare which detectors run and where to look (resolver maps, route files, decorator patterns, etc.)

**⚠️ Limitation:** Hardcoded absolute paths; requires per-developer configuration.

---

## 2. Entry Point Discovery (`src/entry-point-discovery/`)

**Purpose:** Identify all configured entry points in a service using type-specific detectors.

**Input:** Service source code + `entryPoints` config

**Output:** `bin/{service}/entry-points.json`

**Algorithm:**
1. Load service config and create ts-morph `Project`
2. Dispatch to the appropriate detector per `EntryPointTypeConfig`
3. Each detector scans source using framework-specific patterns
4. Normalize results into the unified `EntryPoint` format
5. Write JSON report

**Polymorphic Detectors (`detectors/`):**

| Detector | Entry Point Type | Discovery Patterns |
|----------|------------------|-------------------|
| **`graphql-resolver-detector`** | `graphql-resolver` | Resolver map files (CommonJS, ESM, shorthand), federation fields |
| **`rest-endpoint-detector`** | `rest-endpoint` | Express/Fastify route registration, Next.js API routes, OpenAPI annotations |
| **`function-detector`** | `function` | Named exports, `@handler` / `@endpoint` decorators, CLI entry files |

**Supported Discovery Examples:**
- GraphQL: `export default { Query: { user: (_, { id }) => ... } }`
- REST: `router.get('/users/:id', getUserHandler)` or `app.post('/api/orders', ...)`
- Functions: `export async function handleWebhook(...)`, `@Command('sync')`

---

## 3. Entry Point Map Aggregation (`src/entry-point-map/`)

**Purpose:** Unify entry point definitions across all services and packages; classify ownership, scope, and cross-boundary dependencies.

**Input:** All service `entry-points.json` files

**Output:** `bin/entry-point-map.json`

**Classification Logic (`entry-point-map.classifier.ts`):**
- **GraphQL:** `rootQuery`, `resolveReference`, `fieldExtension`, `ownField` (federation-aware)
- **REST:** `route`, `middleware`, `nestedRouter`
- **Functions/Methods:** `exported`, `decorated`, `controller`, `service`, `internal`

**Ownership & Dependency Inference:**
- GraphQL types with Query resolvers are owned by that service; field extensions link to the owner
- REST routes grouped by path prefix and owning service/package
- Cross-package links detected when an entry point calls into or extends code owned by another package
- Cross-service links built from shared types, federation extensions, inter-service HTTP clients, and shared contracts

---

## 4. Call Graph Tracer (`src/call-graph-tracer/`)

**Purpose:** Trace the call graph from any entry point (resolver, endpoint, function, or method) to identify external integrations and internal dependencies across packages.

**Input:** Entry point list + full service/package source code

**Output:** `bin/{service}/call-graphs.{entryPointId}.json` per entry point

**Algorithm:**

1. **Load entry point and create ts-morph Project** for the service (including monorepo packages)
2. **Find entry point function/method** by definition location from discovery output
3. **Scan recursively:**
   - Collect direct call expressions in function body
   - Build import map for current file (npm, relative, monorepo package aliases)
   - For each call expression:
     - **Resolve callee** to npm import, relative import, cross-package import, or unresolved
     - **Classify imports** via `callGraphTracer.categoriesOverride` or default categories → HTTP/DB/messaging/generic
     - **For relative/cross-package imports:** resolve definition, add to internal calls, recurse
     - **For unresolved:** pattern-match against known HTTP/DB/messaging APIs
   - Collect class instantiations in parallel
4. **Build report** with sorted, deduplicated call lists

**Call Classification:**

| Call Type | Handler | Result |
|-----------|---------|--------|
| **npm import** | Check categories | External package with category |
| **Relative import** | Resolve source | Internal call within same package, recurse |
| **Cross-package import** | Resolve via monorepo paths | Internal call across package boundary, recurse |
| **Method call** (e.g., `axios.get()`) | Pattern match | HTTP request |
| **DB call** (e.g., `db.query()`) | Pattern match | Database call |
| **Unresolved** | Return as-is | Unknown call |

**Visit Deduplication:**
Maintains `visited` Set of `${filePath}:${functionName}` to prevent infinite recursion and duplicate reporting.

**Builtin Filtering (`call-graph.builtins-filter.ts`):**
- Excludes `Array.prototype.map()`, `String.prototype.split()`, etc.
- Filters `console.log()`, `JSON.parse()`, etc.

---

## 5. Exit Point Extractor (`src/exit-point-extractor/`)

**Purpose:** Extract and catalog all external system exit points (databases, APIs, caches, message queues) across all service flows.

**Input:** All `bin/{service}/call-graphs.*.json` files (from Pipeline 3)

**Output:** `bin/service-exit-points.json`

**Algorithm:**

1. **Load all call graph reports** — For each service, load all call graph JSON files
2. **Extract exit points from call graphs:**
   - **Database calls** — Parse `databaseCalls[]` to identify DB operations, targets, and libraries
   - **API requests** — Parse `apiRequests[]` to extract HTTP methods, URLs, and libraries
   - **Message queues** — Pattern-match `externalPackages[]` to identify queue libraries and operations
   - **Cache operations** — Identify Redis/cache libraries and their operations
   - **External services** — Track all non-internal npm packages (Stripe, Auth0, Datadog, etc.)
3. **Aggregate by service** — Group exit points by owning service
4. **Deduplicate** — Identify identical exit points used by multiple entry points; calculate usage frequency
5. **Classify and enrich:**
   - Assign criticality based on usage count and entry point spread
   - Identify single points of failure
   - Tag by data sensitivity (PII, financial, public)
6. **Generate inventory** — List all exit points by service with coverage metrics, risk assessment, and orphaned connections

**Data Model:**

Each exit point record includes:
- Type (database, http, messageQueue, cache, externalService)
- Target system (table name, API endpoint, queue name)
- Library/driver used
- Operations performed
- Entry point count and list of entry points using it
- Criticality level
- Source location

---

## 6. System Map Aggregator (`src/system-map-aggregator/`)

**Purpose:** Aggregate service reports and build a comprehensive dependency map showing which services and packages depend on which others, enriched with exit point context.

**Input:**
- `bin/entry-point-map.json` (aggregated entry points across all services)
- `bin/service-exit-points.json` (exit point inventory from Pipeline 3a)
- All `bin/{service}/call-graphs.*.json` files (call graphs for all entry points)

**Output:** `bin/system-map.json` (full system skeleton with dependency graph and exit point metadata)

**Algorithm:**

1. **Load all reports** — Entry point map, exit point inventory, and call graphs
2. **Extract service-to-service dependencies:**
   - Traverse call graphs to identify calls between services
   - Track federation extensions and shared types (GraphQL)
   - Collect HTTP client calls to other services
3. **Extract package-level dependencies:**
   - Identify cross-package imports and function calls
   - Build monorepo dependency graph
4. **Enrich with exit points (using exit point inventory):**
   - For each service-to-service or package-to-package dependency, identify underlying exit points from `bin/service-exit-points.json`
   - Link external system dependencies (databases, APIs, caches, queues) to service relationships
   - Calculate criticality and risk based on exit point data
5. **Build dependency graph:**
   - Create nodes for services and packages
   - Create edges for each dependency with type and exit point metadata
   - Detect circular dependencies
6. **Compute topology analysis:**
   - Calculate dependency layers (foundation, business, aggregation)
   - Identify bottlenecks and critical services
   - Find orphaned or isolated components
7. **Generate report** — Comprehensive system map with insights, risk assessment, and dependency matrix

---

See [04-data-flow.md](./04-data-flow.md) for pipeline implementations that use these components.
