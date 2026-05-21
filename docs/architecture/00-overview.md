# Executive Summary & System Context

**Xray** is a **static analysis and code intelligence platform** for TypeScript/JavaScript codebases. It inspects real service codebases via TypeScript AST parsing, extracts entry point metadata (GraphQL resolvers, REST API handlers, regular functions), traces implementation flows (function calls, DB/API exit points, class instantiations), aggregates cross-package and cross-service dependencies, and exposes results through JSON reports, an interactive visualization, and an MCP server for AI-assisted exploration.

## Key Objectives

- **Visibility:** Map entry point implementations (resolvers, endpoints, functions) across all services and packages
- **Dependency Tracing:** Understand cross-service and cross-package dependency usage patterns; identify unused functions and dead code
- **Flow Analysis:** Trace call graphs from any entry point to understand complete logic, identify data sources, and detect external integrations (APIs, databases, message queues)
- **System Mapping:** Generate a complete system skeleton that visualizes which services and packages depend on other services and packages
- **Developer Intelligence:** Provide on-demand, AI-friendly access to function metadata, call chains, and integration points via MCP server

## Supported Entry Point Types

- **GraphQL Resolvers** — Query/Mutation/Subscription fields in federated GraphQL services
- **REST API Endpoints** — Express routes, Fastify handlers, Next.js API routes, etc.
- **Regular Functions** — Any TypeScript/JavaScript function marked as entry point (CLI commands, jobs, webhooks, utilities)
- **Class Methods** — Service methods, controller actions, etc.

## Target Users

- **Platform/Infrastructure teams:** Understanding service boundaries, federation patterns, and dependencies, finding dead code
- **Backend developers:** Debugging complex call chains, identifying performance bottlenecks, tracing integrations
- **DevOps/SRE:** Mapping infrastructure dependencies, finding unused services, tracking external integrations
- **AI assistants (via MCP):** Context-aware code analysis, feature navigation, dead code detection

## System Context

### High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                             Codebase                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────-─┐     │
│  │ Backend Service │  │ Monorepo     │  │ Utility package  │     │
│  │ (TS)            │  │ (TS/JS/Mix)  │  │ (TS/JS)          │     │
│  └────────┬────────┘  └──────┬───────┘  └──────────┬────-──┘     │
│           │                   │                    │             │
│           │ Source code analysis                   │             │
│           │ (ts-morph AST parsing)                 │             │
│           └───────────────────┬────────────────────┘             │
└───────────────────────────────┼───────────────────────────---────┘
                                ▼
        ┌─────────────────────────────────────────────┐
        │    XRAY CODE INTELLIGENCE PIPELINE          │
        ├─────────────────────────────────────────────┤
        │                                             │
        │  ┌──────────────────────────────────────┐   │
        │  │ Layer 1: Entry Point Discovery       │   │ Identifies all entry points:
        │  │ (resolvers, endpoints, functions)    │   │ resolvers, REST handlers,
        │  └──────────────────────────────────────┘   │ regular functions, etc.
        │                 ▼                           │
        │  ┌──────────────────────────────────────┐   │
        │  │ Layer 2: Flow Tracing                │   │ Traces call graphs
        │  │ (call chains, integrations, deps)    │   │ to all external systems
        │  └──────────────────────────────────────┘   │
        │                 ▼                           │
        │  ┌──────────────────────────────────────┐   │
        │  │ Layer 3: Artifacts & Output          │   │ JSON reports, visualization,
        │  │ (JSON reports, web UI, MCP API)      │   │ MCP tools for AI consumers
        │  └──────────────────────────────────────┘   │
        │                                             │
        └──────────────────┬──────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
    ┌──────────-────┐ ┌──────────────┐ ┌──────────────┐
    │ JSON Artifacts│ │ Web Graph    │ │ MCP Server   │
    │ (reports)     │ │ Visualization│ │ (AI Tools)   │
    └──────────-────┘ └──────────────┘ └──────────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │  Consumer Applications               │
        │  • Engineering dashboards            │
        │  • IDE integrations                  │
        │  • Debugging workflows               │
        │  • Cursor + AI code assistants       │
        │  • Dependency audits                 │
        │  • Dead code detectors               │
        │  • AI agents                         │
        └──────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026  
