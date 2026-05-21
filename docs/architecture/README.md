# Xray Architecture Documentation

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Active Development

This directory contains the modular architecture documentation for Xray, a static analysis and code intelligence platform for TypeScript/JavaScript codebases.

## Documentation Structure

- **[00-overview.md](./00-overview.md)** — Executive summary, system context, key objectives, target users
- **[01-architecture.md](./01-architecture.md)** — Generalized pipeline architecture and component relationships  
- **[02-components.md](./02-components.md)** — Detailed design of all 6 components (Config, Discovery, Aggregation, Call Graph Tracer, Exit Point Extractor, System Map Aggregator)
- **[03-data-flow.md](./03-data-flow.md)** — All data pipelines (Discovery, Aggregation, Tracing, Extraction, Visualization, MCP, System Map Generation)
- **[04-data-models.md](./04-data-models.md)** — Complete JSON artifact schemas (Entry Points, Entry Point Map, Call Graphs, System Map)
- **[05-technology-stack.md](./05-technology-stack.md)** — Runtime, libraries, frameworks, and dependencies
- **[06-challenges.md](./06-challenges.md)** — Challenges and solutions (project analysis, deduplication, filtering, import resolution)
- **[07-limitations.md](./07-limitations.md)** — Known limitations and future work

## Quick Start

Start with **[00-overview.md](./00-overview.md)** for a high-level understanding, then dive into specific topics based on your interest:

- **Architects:** Read [01-architecture.md](./01-architecture.md) and [02-components.md](./02-components.md)
- **Developers:** Read [02-components.md](./02-components.md), [03-data-flow.md](./03-data-flow.md), and [04-data-models.md](./04-data-models.md)
- **DevOps/Operations:** Read [05-technology-stack.md](./05-technology-stack.md)
- **Troubleshooting:** Read [06-challenges.md](./06-challenges.md) and [07-limitations.md](./07-limitations.md)

## Key Concepts

**Xray** performs static analysis on TypeScript/JavaScript codebases to:
1. **Discover** entry points (GraphQL resolvers, REST endpoints, functions)
2. **Trace** call graphs to identify dependencies and integrations
3. **Extract** exit points showing where services connect to external systems
4. **Map** the full system skeleton showing service/package dependencies
5. **Expose** results via JSON reports, interactive visualization, and MCP server

See [00-overview.md](./00-overview.md) for detailed objectives and use cases.
