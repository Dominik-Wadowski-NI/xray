# Xray Architecture Documentation

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Active Development

This directory contains the modular architecture documentation for Xray, a static analysis and code intelligence platform for TypeScript/JavaScript codebases.

## Documentation Structure

- **[00-overview.md](./00-overview.md)** — Executive summary, system context, key objectives, target users
- **[01-requirements.md](./01-requirements.md)** — Functional requirements and non-functional requirements (performance, reliability, usability, security)
- **[02-architecture.md](./02-architecture.md)** — Generalized pipeline architecture and component relationships  
- **[03-components.md](./03-components.md)** — Detailed design of all 6 components (Config, Discovery, Aggregation, Call Graph Tracer, Exit Point Extractor, System Map Aggregator)
- **[04-data-flow.md](./04-data-flow.md)** — All data pipelines (Discovery, Aggregation, Tracing, Extraction, Visualization, MCP, System Map Generation)
- **[05-data-models.md](./05-data-models.md)** — Complete JSON artifact schemas (Entry Points, Entry Point Map, Call Graphs, System Map)
- **[06-technology-stack.md](./06-technology-stack.md)** — Runtime, libraries, frameworks, and dependencies
- **[07-challenges.md](./07-challenges.md)** — Challenges and solutions (project analysis, deduplication, filtering, import resolution)
- **[08-limitations.md](./08-limitations.md)** — Known limitations and future work

## Quick Start

Start with **[00-overview.md](./00-overview.md)** for a high-level understanding, then dive into specific topics based on your interest:

- **Product/Stakeholders:** Read [01-requirements.md](./01-requirements.md)
- **Architects:** Read [02-architecture.md](./02-architecture.md) and [03-components.md](./03-components.md)
- **Developers:** Read [03-components.md](./03-components.md), [04-data-flow.md](./04-data-flow.md), and [05-data-models.md](./05-data-models.md)
- **DevOps/Operations:** Read [06-technology-stack.md](./06-technology-stack.md)
- **Troubleshooting:** Read [07-challenges.md](./07-challenges.md) and [08-limitations.md](./08-limitations.md)

## Key Concepts

**Xray** performs static analysis on TypeScript/JavaScript codebases to:
1. **Discover** entry points (GraphQL resolvers, REST endpoints, functions)
2. **Trace** call graphs to identify dependencies and integrations
3. **Extract** exit points showing where services connect to external systems
4. **Map** the full system skeleton showing service/package dependencies
5. **Expose** results via JSON reports, interactive visualization, and MCP server

See [00-overview.md](./00-overview.md) for detailed objectives and use cases.
