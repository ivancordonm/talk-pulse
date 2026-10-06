import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./helpers.mjs";

const rate = (base, id, stars) =>
  fetch(`${base}/api/talks/${id}/ratings`, { method: "POST", body: JSON.stringify({ stars }) });
const talk = async (base, id) => (await (await fetch(`${base}/api/talks`)).json()).find((t) => t.id === id);

test("a talk with no ratings has avg null and count 0", async () => {
  const app = await startApp();
  assert.deepEqual((({ avg, count }) => ({ avg, count }))(await talk(app.base, "t2")), { avg: null, count: 0 });
  await app.close();
});

test("avg is rounded to one decimal and count is exact", async () => {
  const app = await startApp();
  for (const s of [5, 4, 4]) await rate(app.base, "t2", s);   // 13/3 = 4.333…
  const t = await talk(app.base, "t2");
  assert.equal(t.avg, 4.3);
  assert.equal(t.count, 3);
  await app.close();
});

test("rejected ratings do not change the score", async () => {
  const app = await startApp();
  await rate(app.base, "t3", 2);
  await rate(app.base, "t3", 9);
  const t = await talk(app.base, "t3");
  assert.equal(t.avg, 2);
  assert.equal(t.count, 1);
  await app.close();
});
