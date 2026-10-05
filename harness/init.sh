#!/usr/bin/env bash
# Boot the app and prove it is alive before any new work starts.
set -euo pipefail
[ -f src/server.mjs ] || { echo "init: no app yet (first shift) — OK"; exit 0; }
PORT=${PORT:-3000} node src/server.mjs > /tmp/talk-pulse.log 2>&1 &
echo $! > /tmp/talk-pulse.pid
for i in $(seq 1 30); do
  curl -sf "http://localhost:${PORT:-3000}/health" > /dev/null && { echo "init: app up on :${PORT:-3000} ✓"; exit 0; }
  sleep 0.2
done
echo "init: app did not start ✗"; cat /tmp/talk-pulse.log; exit 1
