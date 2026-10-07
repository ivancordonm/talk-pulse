import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../src/store.mjs";
import { startApp } from "./helpers.mjs";

test("ratings survive a server restart", async () => {
  const file = join(mkdtempSync(join(tmpdir(), "talk-pulse-")), "db.json");

  const first = await startApp(createStore(file));
  await fetch(`${first.base}/api/talks/t1/ratings`, { method: "POST", body: JSON.stringify({ stars: 5 }) });
  await fetch(`${first.base}/api/talks/t1/ratings`, { method: "POST", body: JSON.stringify({ stars: 4 }) });
  await first.close();

  const second = await startApp(createStore(file));
  const t1 = (await (await fetch(`${second.base}/api/talks`)).json()).find((t) => t.id === "t1");
  assert.equal(t1.count, 2);
  assert.equal(t1.avg, 4.5);
  await second.close();
});

test("a fresh file starts with the seeded talks and no ratings", async () => {
  const file = join(mkdtempSync(join(tmpdir(), "talk-pulse-")), "nested", "db.json");
  const store = createStore(file);
  assert.equal(store.talks().length, 4);
  assert.equal(store.ratings().length, 0);
});
