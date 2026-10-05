import { test } from "node:test";
import assert from "node:assert/strict";
import { openPage } from "./helpers.mjs";

test("home page shows one card per talk with title, speaker and slot", async () => {
  const { page, app, close } = await openPage();
  const talks = await (await fetch(`${app.base}/api/talks`)).json();
  await page.waitForSelector(".talk");
  assert.equal(await page.locator(".talk").count(), talks.length);
  const first = page.locator(".talk").first();
  assert.equal(await first.locator("h2").textContent(), talks[0].title);
  assert.match(await first.locator(".meta").textContent(), new RegExp(talks[0].speaker));
  assert.match(await first.locator(".meta").textContent(), new RegExp(talks[0].slot));
  await close();
});
