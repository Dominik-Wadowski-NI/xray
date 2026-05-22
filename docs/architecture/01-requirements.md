# Requirements & Non-Functional Requirements

## Functional Requirements (FRs)

### FR1: Discover Where Users Interact with the System
- Identify all user-facing endpoints (APIs, webhooks, scheduled jobs, CLI commands)
- Show which entry points are exposed and how they're structured
- Provide a complete inventory of application surfaces

### FR2: Understand What Happens When Code Runs
- Trace exactly what logic executes for any user action
- Show all data sources, databases, and external services involved
- Reveal dependencies between functions and modules
- Identify complex or circular dependencies

### FR3: Map System Dependencies & Identify Dead Code
- Visualize which parts of the system depend on each other
- Show which functions, modules, and services are actually used
- Highlight unused or orphaned code that can be safely removed
- Track shared components and how teams use them

### FR4: Share Intelligence Across Teams
- Generate human-readable reports of how code is organized
- Provide interactive visualizations of system structure
- Enable AI tools and assistants to understand codebase context
- Support integration with development workflows

---

## Non-Functional Requirements (NFRs)

### Reliability & Accuracy
- Correctly identify entry points for all supported frameworks (100% accuracy)
- Handle unsupported code patterns gracefully without stopping the analysis

### Usability
- Single command to set up and run analysis
- Clear, easy-to-read output (JSON and visual graphs)
- Works out-of-the-box with minimal configuration

### Extensibility
- Support new frameworks and patterns without rewriting core system
- Allow teams to customize for their specific tech stack
- Provide clear APIs for third-party integrations

### Security & Operations
- Runs entirely offline—no data leaves the user's machine
- Safe to run on production code without side effects
- Generates detailed logs for troubleshooting
- Deployable in CI/CD pipelines and containerized environments


### Cost & Resource Efficiency
- Prioritize static analysis over AI driven analysis
- AI-powered analysis is **forbidden** to eliminate API costs and latency
- Optimize memory footprint and CPU usage for cost-effective CI/CD execution
- No cloud dependencies; all analysis runs locally or in customer infrastructure

---

See [02-architecture.md](./02-architecture.md) for the technical approach to fulfilling these requirements.
