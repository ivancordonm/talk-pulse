import { test } from "node:test";
import assert from "node:assert/strict";
import { openPage } from "./helpers.mjs";

test("clicking 4 stars and submitting updates the card without reload", async () => {
  const { page, close } = await openPage();
  const card = page.locator('.talk[data-id="t2"]');
  await card.locator(".score").waitFor();
  assert.equal(await card.locator(".score").textContent(), "No ratings yet");
  await page.evaluate(() => (window.__marker = "same-page"));
  await card.locator('[data-stars="4"]').click();
  await card.locator("input").fill("Great demo");
  await card.locator(".send").click();
  await page.waitForFunction(() => document.querySelector('.talk[data-id="t2"] .score').textContent.includes("1 rating"));
  assert.equal(await card.locator(".score").textContent(), "★ 4.0 · 1 rating");
  assert.equal(await page.evaluate(() => window.__marker), "same-page");
  await close();
});

test("submitting without stars shows the API error message", async () => {
  const { page, close } = await openPage();
  const card = page.locator('.talk[data-id="t1"]');
  await card.locator(".send").click();
  await card.locator(".error").filter({ hasText: /Stars/ }).waitFor();
  assert.match(await card.locator(".error").textContent(), /whole number from 1 to 5/);
  await close();
});
