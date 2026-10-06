#!/usr/bin/env bash
# Existing tests are a contract. A shift may ADD tests, never remove or rewrite lines.
removed=$(git diff --numstat HEAD -- tests/ e2e/ | awk '{s+=$2} END {print s+0}')
if [ "$removed" -gt 0 ]; then
  echo "tests-guard: $removed line(s) removed/changed in existing tests:"
  git diff HEAD -- tests/ e2e/ | grep '^-[^-]'
  echo "FIX: restore the test and change the code instead. If the test is truly wrong, write it in progress.md for a human."
  exit 1
fi
echo "tests-guard: no existing test lines changed"
