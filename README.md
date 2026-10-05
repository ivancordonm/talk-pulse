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
