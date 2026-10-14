# talk-pulse

A tiny app to rate meetup talks — and a worked example of the **RELAY harness**:
a provider-agnostic way to let any LLM build software in short, verified shifts.

```
human brief ─▶ PLANNER ─▶ features.json ─┐
                                         ▼
            ┌──── BUILDER shift (one feature, any model / CLI)
            │            ▼
            │     check.sh  (lint · unit · e2e)      ← computational sensors
            │            ▼
            │     REVIEWER (a different model)       ← inferential sensor
            │            ▼
            └── approve → passes=true + commit + progress.md
                reject  → discard shift, log why, retry
```

- `AGENTS.md` — the map every shift reads first
- `harness/` — the loop, prompts, sensors and shared state
- `git log` — read it from the bottom up to watch the app being built

## How it went (read `git log --reverse`)

| | |
|---|---|
| Human brief | 4 sentences |
| Features planned | 8 |
| Builder shifts | 10 (8 approved, 2 rejected by the reviewer) |
| Models used | 4 different builders, 2 reviewers, 1 open-weights planner |
| Human commits | 3 — all of them changes to the **harness**, none to the app |
| Tests at the end | 19 unit + 5 end-to-end, all green |

The structural lints (`harness/lint.mjs`) shipped with the bootstrap, before the first feature:
layers only import downwards, files stay under 120 lines and functions under 40, no runtime
dependencies. Every error carries a `FIX:` line the agent can act on.

Every reviewer rejection became a deterministic sensor:

1. `Math.random()` ids → lint rule (`harness/lint.mjs`)
2. Weakened test → `harness/tests-guard.sh`

## Run it

```sh
npm install          # only devDependency: playwright (for e2e)
npm start            # http://localhost:3000
npm run check        # the same sensors the harness uses
```

## Run the harness with any model

```sh
export LLM_BASE_URL=http://localhost:11434/v1 PLANNER_MODEL=qwen3 REVIEWER_MODEL=gpt-5
export BUILDER_CMD="claude -p"         # or: codex exec | gemini -p | aider --yes --message
npm run relay:plan && npm run relay:run
```
