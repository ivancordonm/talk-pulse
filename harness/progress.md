# Progress log — shift handoff notes

Newest at the bottom. Each shift: what you did, what is left, what surprised you.

## Session 0 — planner
- Expanded the 4-sentence brief into docs/spec.md and 8 features, all failing.
- Order matters: API before UI, persistence late so early shifts stay fast.

## Session 1 — builder · F1
- node:http server with createApp(store) so tests can boot it on port 0.
- Store is in-memory with 4 seeded talks (persistence is F7, not now).
- init.sh now has something to boot: /health is the smoke test.

## Session 2 — builder · F2
- Plain HTML + module JS in public/, served by a 3-entry static map in server.mjs.
- First e2e test (Playwright, 420px viewport = phone). Added playwright as devDependency.
- Text goes in via textContent, never innerHTML with data (titles come from users later).
- Session 3 REJECTED F3 (attempt 1): reviewer — "stars: 3.5 is accepted (only checked range, not integer)";
  "rating ids use Math.random(), docs/conventions.md says crypto.randomUUID()";
  "test file has no case for non-integer stars, so check.sh could not catch it". Shift discarded.

## Session 4 — builder · F3 (attempt 2)
- Read the rejection notes first. Tested 0, 6, 3.5, "4", null for stars and 280/281 chars for comments.
- Validation lives in talks.mjs (DomainError with code + status); server.mjs only maps it to JSON.
- Ids via crypto.randomUUID(); lint now enforces it.

## Session 5 — builder · F4
- scoreOf() in talks.mjs; listTalks() now returns avg (1 decimal) and count.
- Computed on read, no cached totals (fine at meetup scale; revisit if F7 makes it slow).
- Next shift: F5 is the first UI-with-state feature. Reuse POST error codes for messages.

## Session 6 — builder · F5
- Star picker + comment + Rate button on every card. Errors show the API's own message.
- render() updates scores in place instead of rebuilding cards, so typed comments survive.
- e2e proves "no reload" with a window marker, not a sleep.

## Session 7 — builder · F6
- leaderboard() in talks.mjs, GET /api/leaderboard, top-3 panel on the page.
- Switched averages to 2 decimals so close scores rank correctly; updated the rounding test to match.
