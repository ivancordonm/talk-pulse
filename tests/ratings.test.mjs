import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./helpers.mjs";

const post = (base, id, body) =>
  fetch(`${base}/api/talks/${id}/ratings`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("a valid rating returns 201 with an id", async () => {
  const app = await startApp();
  const res = await post(app.base, "t1", { stars: 4, comment: "Clear and fun" });
  assert.equal(res.status, 201);
  const r = await res.json();
  assert.equal(r.stars, 4);
  assert.ok(r.id);
  await app.close();
});

for (const stars of [0, 6]) {
  test(`stars=${JSON.stringify(stars)} is rejected with invalid_stars`, async () => {
    const app = await startApp();
    const res = await post(app.base, "t1", { stars });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, "invalid_stars");
    await app.close();
  });
}

test("comment over 280 chars is rejected", async () => {
  const app = await startApp();
  const res = await post(app.base, "t1", { stars: 5, comment: "x".repeat(281) });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_comment");
  await app.close();
});

test("comment of exactly 280 chars is accepted", async () => {
  const app = await startApp();
  assert.equal((await post(app.base, "t1", { stars: 5, comment: "x".repeat(280) })).status, 201);
  await app.close();
});

test("unknown talk returns 404 talk_not_found", async () => {
  const app = await startApp();
  const res = await post(app.base, "nope", { stars: 3 });
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error, "talk_not_found");
  await app.close();
});

test("malformed JSON returns 400 invalid_json", async () => {
  const app = await startApp();
  const res = await fetch(`${app.base}/api/talks/t1/ratings`, { method: "POST", body: "{not json" });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "invalid_json");
  await app.close();
});
