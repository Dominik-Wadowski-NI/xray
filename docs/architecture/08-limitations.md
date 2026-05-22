# Known Limitations & Future Work

## Current Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| **Hardcoded service paths** | Not portable across developers/CI | Manual config per environment |
| **No automated tests** | Risk of regressions | Manual testing, code review |
| **TypeScript/JavaScript only** | REST APIs and entry points in other languages not analyzed | Use TS/JS services or wait for multi-language detectors |
| **Framework-specific detectors** | New frameworks require new detector implementations | Add detector in `entry-point-discovery/detectors/` |
| **URL extraction incomplete** | API request targets may be `undefined` | Manual inspection of call graph reports |
| **Database access extraction incomplete** | DB access not fully resolved | Manual inspection of call graph reports |
| **Dynamic calls untraced** | `axios[method]()`, `db[table]()` not tracked | Static analysis limitation; document known gaps |
| **Cross-package resolution** | Monorepo path aliases may not resolve in all layouts | Configure tsconfig paths explicitly per service |
| **No JS/TS build step** | Requires ts-morph in-memory AST | Slight startup latency; acceptable for CLI |
| **bin/ gitignored** | Artifacts not version-controlled | By design; regenerate as needed |
| **Single-threaded traversal** | Large codebases with many entry points may be slow | Potential for parallelization |

---

## Future Enhancements

- **Multi-language support** — Extend to Java, Python, Go for polyglot environments
- **Build-time caching** — Cache AST analysis and dependency graphs to speed up large codebases
- **Real-time analysis** — Watch-mode for detecting dependency changes as code is edited
- **Performance profiling** — Attribute exit point latency to specific calls
- **Dead code detection** — Automated identification of unused entry points and functions
- **Dependency update simulation** — Analyze impact of upgrading external packages
- **Custom categorization** — Allow teams to define their own package categories

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026  

See [07-challenges.md](./07-challenges.md) for technical challenges and solutions.
