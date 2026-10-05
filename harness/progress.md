# Progress log — shift handoff notes

Newest at the bottom. Each shift: what you did, what is left, what surprised you.

## Session 0 — planner
- Expanded the 4-sentence brief into docs/spec.md and 8 features, all failing.
- Order matters: API before UI, persistence late so early shifts stay fast.

## Session 1 — builder · F1
- node:http server with createApp(store) so tests can boot it on port 0.
- Store is in-memory with 4 seeded talks (persistence is F7, not now).
- init.sh now has something to boot: /health is the smoke test.
