# Challenges & Solutions

## 1. Project static analysis

**Challenge:** Each service has different source layouts and tsconfig paths.

**Solution:**
- `src/shared/morph.ts` creates a ts-morph `Project` with glob patterns
- Service config specifies `rootDir`, `tsconfig` (optional)
- All source files added to project via `addAllSourceFilesToProject()`
- Enables symbol resolution across the entire codebase

**Implication:** Analyzer sees all types/symbols in context (accurate type checking).

## 2. Visit Deduplication

**Challenge:** Recursive call graphs can be cyclic; must avoid infinite loops.

**Solution:**
- `resolver-flow.traverser.ts` maintains a `visited` Set of `${filePath}:${functionName}`
- Before recursing into a function, check if already visited
- Prevents duplicate reporting and terminates cycles

**Trade-off:** May miss some edges in highly cyclic graphs, but avoids infinite loops.

## 3. Builtin Filtering

**Challenge:** Every function call in JavaScript/TypeScript includes array methods, string methods, etc.

**Solution:**
- `resolver-flow.builtins-filter.ts` maintains a blocklist of common JS builtins
- Methods like `Array.prototype.map()`, `JSON.parse()`, `console.log()` are filtered

**Implementation:** Pattern matching on receiver type + method name.

## 4. Proper Import Resolution

**Challenge:** Must distinguish npm imports from relative imports and resolve symbols correctly.

**Solution:**
- `resolver-flow.import-map.ts` builds a cache of all imports in a file
- Maps symbol name → package name or relative path
- Enables classification of calls as npm vs. internal

**Example:**
```typescript
import axios from 'axios';           // axios → npm
import { fetchUser } from './api';   // fetchUser → relative import in ./api.ts
```

## 5. Package Categorization

**Challenge:** Hundreds of npm packages; need to automatically categorize as HTTP, Database, Messaging, etc.

**Solution:**
- TBD

## 6. URL & SQL Pattern Extraction

**Challenge:** HTTP and database calls are made via library method calls; hard to statically extract target.

**Solution:**
- TBD

**Trade-off:** Works for hardcoded/simple string literals; fails for variables or dynamic URLs.

---

See [08-limitations.md](./08-limitations.md) for known limitations and future work.
