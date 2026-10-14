import http from "node:http";
import { readFile } from "node:fs/promises";
import { createStore } from "./store.mjs";
import { listTalks } from "./talks.mjs";
import { log } from "./log.mjs";

const STATIC = { "/": ["index.html", "text/html"], "/app.js": ["app.js", "text/javascript"], "/style.css": ["style.css", "text/css"] };

async function serveStatic(res, [file, type]) {
  res.writeHead(200, { "content-type": `${type}; charset=utf-8` });
  res.end(await readFile(new URL(`../public/${file}`, import.meta.url)));
}

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

export function createApp(store = createStore()) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (req.method === "GET" && STATIC[url.pathname]) return serveStatic(res, STATIC[url.pathname]);
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/talks") return json(res, 200, listTalks(store));
    json(res, 404, { error: "not_found", message: `No route for ${req.method} ${url.pathname}` });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => log(`talk-pulse listening on :${port}`));
}
