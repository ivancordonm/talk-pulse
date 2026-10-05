# AGENTS.md — talk-pulse

You are **one shift in a relay**. You have no memory of earlier shifts.
Everything you need is in this repo. Anything that is not in the repo does not exist.

This file is a map, not a manual. Keep it under 80 lines.

## The RELAY protocol (every session, in this order)

1. **R — Read.** `cat harness/progress.md | tail -40` and `git log --oneline -10`.
2. **E — Establish baseline.** Run `./harness/init.sh`. If it is red, fixing it *is* your task.
3. **L — Lock one feature.** Open `harness/features.json` and take the FIRST item
   with `"passes": false`. Work on that one feature only.
4. **A — Act.** Implement it, plus the tests listed in its `verify` field.
5. **Y — Yield.** Run `./harness/check.sh`. Stop when it is green.
   Write 3–6 lines in `harness/progress.md` for the next shift.

The harness (not you) runs the reviewer, flips `passes` and commits.

## Hard rules

- Never edit or delete an existing test to make it pass.
- Never change `harness/features.json` except to *add* notes. `passes` is not yours.
- Never touch `harness/` scripts. If the harness is wrong, say so in progress.md.
- No new runtime dependencies. Node standard library only.
- Leave the repo in a state where the next shift can start immediately.

## Map

| Need                         | Read                      |
|------------------------------|---------------------------|
| What we are building         | `docs/spec.md`            |
| Layers and where code goes   | `docs/architecture.md`    |
| Naming, errors, ids, style   | `docs/conventions.md`     |
| How "done" is decided        | `harness/check.sh`        |

## Commands

```sh
./harness/init.sh     # boot app on :3000 + smoke test
./harness/check.sh    # lint + unit + e2e  (the only judge of "done")
npm start             # run the app
```
