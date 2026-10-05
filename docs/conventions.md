# Conventions

- ES modules (`.mjs`), Node 22, standard library only.
- Ids come from `crypto.randomUUID()`. Never `Math.random()`.
- Errors returned by the API: `{ "error": "<code>", "message": "<human text>" }`.
- Tests live in `tests/*.test.mjs` (node:test) and `e2e/*.e2e.mjs` (Playwright).
- No `console.log` in `src/` — use the `log()` helper in `src/log.mjs`.
