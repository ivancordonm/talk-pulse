# Architecture

Three layers. Dependencies only point **down**.

```
public/        UI (plain HTML + JS, talks to /api only)
   │
src/server.mjs HTTP routes (no business rules here)
   │
src/talks.mjs  domain rules: validation, averages, ranking
   │
src/store.mjs  persistence (JSON file in data/)
```

- Imports only point **down**. `src/log.mjs` is shared and sits below everything.
- Each layer owns its I/O: only `server.mjs` touches `node:http`, only `store.mjs` touches `node:fs`.
  The domain layer (`talks.mjs`) is pure apart from `node:crypto`.
- `public/` never imports code; it talks to the server through `fetch('/api/...')`.
- Validation happens once, at the boundary (`talks.mjs`), never in the UI only.

## Limits

| What                     | Limit |
|--------------------------|-------|
| Lines per file in `src/` | 120   |
| Lines per file in `public/` | 150 |
| Lines per test file      | 120 (unit), 80 (e2e) |
| Lines per function       | 40    |
| Lines in `AGENTS.md`     | 80    |
| Runtime dependencies     | 0 (Node standard library only) |
| devDependencies          | `playwright` only |

All of this is enforced by `harness/lint.mjs`. Hitting a limit means "split it", never "raise it".
