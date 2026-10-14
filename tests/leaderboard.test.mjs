import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./helpers.mjs";

const rate = (base, id, stars) =>
  fetch(`${base}/api/talks/${id}/ratings`, { method: "POST", body: JSON.stringify({ stars }) });
const board = async (base) => (await fetch(`${base}/api/leaderboard`)).json();

test("leaderboard is empty when nothing is rated", async () => {
  const app = await startApp();
  assert.deepEqual(await board(app.base), []);
  await app.close();
});

test("ranks by avg, ties broken by more ratings, unrated talks excluded", async () => {
  const app = await startApp();
  await rate(app.base, "t1", 3);
  await rate(app.base, "t2", 5);
  await rate(app.base, "t3", 5); await rate(app.base, "t3", 5);
  const b = await board(app.base);
  assert.deepEqual(b.map((t) => [t.rank, t.id]), [[1, "t3"], [2, "t2"], [3, "t1"]]);
  assert.ok(!b.some((t) => t.id === "t4"));
  await app.close();
});
