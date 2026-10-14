import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./helpers.mjs";

test("GET /health returns ok", async () => {
  const app = await startApp();
  const res = await fetch(`${app.base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  await app.close();
});

test("GET /api/talks returns seeded talks ordered by slot", async () => {
  const app = await startApp();
  const talks = await (await fetch(`${app.base}/api/talks`)).json();
  assert.ok(talks.length >= 3);
  const slots = talks.map((t) => t.slot);
  assert.deepEqual(slots, [...slots].sort());
  for (const t of talks) assert.ok(t.id && t.title && t.speaker);
  await app.close();
});
