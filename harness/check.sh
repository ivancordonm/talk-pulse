#!/usr/bin/env bash
# The only judge of "done". Fast, deterministic sensors first; e2e last.
set -uo pipefail
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
fail=0; summary=()

show() {  # print only what the agent needs to act on
  if grep -q "^not ok" <<<"$1"; then grep -E "^ *not ok|error:|expected:|actual:" <<<"$1" | grep -v "'test failed'" | head -30
  else tail -40 <<<"$1"; fi
}

run() {  # run <name> <cmd...>
  local name=$1; shift
  local out; out=$("$@" 2>&1); local code=$?
  local n; n=$(echo "$out" | sed -n 's/^# tests \([0-9]*\)/\1/p' | tail -1)
  local p; p=$(echo "$out" | sed -n 's/^# pass \([0-9]*\)/\1/p' | tail -1)
  local count=""; [ -n "$n" ] && count=" ($p/$n)"
  if [ $code -eq 0 ]; then summary+=("$name ✓$count"); else
    summary+=("$name ✗$count"); fail=1; echo "── $name failed ──"; show "$out"; fi
}

run "lint"  node harness/lint.mjs
if ls tests/*.test.mjs >/dev/null 2>&1; then run "unit" node --test --test-force-exit --test-timeout=30000 tests/*.test.mjs; fi
if ls e2e/*.e2e.mjs   >/dev/null 2>&1; then run "e2e"  node --test --test-force-exit --test-timeout=30000 --test-concurrency=1 e2e/*.e2e.mjs; fi

echo "check: ${summary[*]}"
exit $fail
