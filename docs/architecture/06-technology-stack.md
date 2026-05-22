# Technology Stack

## Runtime & Languages

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 24 (`.nvmrc`) | CLI and MCP server runtime |
| TypeScript | 6 | Strict type-safe implementation |
| JavaScript (ES2020+) | Native | Consumer service compatibility |

## Core Analysis Engine

| Library | Version | Purpose |
|---------|---------|---------|
| ts-morph | 27 | TypeScript/JavaScript AST parsing and symbol resolution |
| TypeScript Compiler | 6 | Type system and symbol lookup |

## Data & Validation

| Library | Version | Purpose |
|---------|---------|---------|
| Zod | 3 | MCP tool input/output schema validation |

## File System & Discovery

| Library | Version | Purpose |
|---------|---------|---------|
| glob | 13 | Recursive file pattern matching |
| Node.js fs/path | Native | File I/O and path utilities |

## MCP Integration

| Library | Version | Purpose |
|---------|---------|---------|
| @modelcontextprotocol/sdk | 1.29 | MCP server implementation (stdio transport) |

## Development & Execution

| Tool | Version | Purpose |
|---------|---------|---------|
| tsx | Latest | Direct TS/JS execution (no build step) |
| nodemon | Latest | Dev server auto-reload |
| npm | 10+ | Package management |

## Visualization

| Technology | Source | Purpose |
|-----------|--------|---------|
| D3.js | v7 (CDN) | Interactive force-directed graph rendering |
| HTML5/CSS3 | Inline | Web UI layout and styling |

---

See [02-architecture.md](./02-architecture.md) for architectural context and [03-components.md](./03-components.md) for how these technologies are used.
