import { test } from "node:test";
import assert from "node:assert/strict";
import { openPage } from "./helpers.mjs";

test("page shows the top 3 after ratings", async () => {
  const { page, close } = await openPage();
  for (const [id, n] of [["t1", 5], ["t2", 4], ["t3", 3], ["t4", 2]]) {
    const card = page.locator(`.talk[data-id="${id}"]`);
    await card.locator(`[data-stars="${n}"]`).click();
    await card.locator(".send").click();
    await card.locator(".score").filter({ hasText: "1 rating" }).waitFor();
  }
  await page.locator("#top li").nth(2).waitFor();
  assert.equal(await page.locator("#top li").count(), 3);
  assert.match(await page.locator("#top li").first().textContent(), /Why your agent forgets everything/);
  await close();
});
