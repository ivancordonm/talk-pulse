import { chromium } from "playwright";
import { startApp } from "../tests/helpers.mjs";

export async function openPage(store) {
  const app = await startApp(store);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await page.goto(app.base);
  return { app, page, close: async () => { await browser.close(); await app.close(); } };
}
