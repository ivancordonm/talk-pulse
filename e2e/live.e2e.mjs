import { test } from "node:test";
import assert from "node:assert/strict";
import { openPage } from "./helpers.mjs";

test("a rating from another client shows up on an open page within 5 seconds", async () => {
  const { page, app, close } = await openPage();
  await page.locator(".talk").first().waitFor();
  assert.equal(await page.locator("#top li").count(), 0);

  const sentAt = Date.now();
  await fetch(`${app.base}/api/talks/t4/ratings`, { method: "POST", body: JSON.stringify({ stars: 5 }) });

  await page.locator("#top li").first().waitFor({ timeout: 5000 });
  assert.match(await page.locator("#top li").first().textContent(), /Shipping with three models/);
  assert.match(await page.locator('.talk[data-id="t4"] .score').textContent(), /1 rating/);
  assert.ok(Date.now() - sentAt < 5000);
  await close();
});
