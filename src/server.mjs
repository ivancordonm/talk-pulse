import http from "node:http";
import { readFile } from "node:fs/promises";
import { createStore } from "./store.mjs";
import { listTalks, addRating, leaderboard, DomainError } from "./talks.mjs";
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

async function readJson(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  try { return JSON.parse(body || "{}"); }
  catch { throw new DomainError("invalid_json", "Request body must be JSON"); }
}

export function createApp(store = createStore()) {
  return http.createServer(async (req, res) => {
    try { await route(req, res, store); }
    catch (e) {
      if (e instanceof DomainError) return json(res, e.status, { error: e.code, message: e.message });
      log("unexpected error", e);
      json(res, 500, { error: "internal", message: "Something went wrong" });
    }
  });
}

async function route(req, res, store) {
  const url = new URL(req.url, "http://x");
  if (req.method === "GET" && STATIC[url.pathname]) return serveStatic(res, STATIC[url.pathname]);
  if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
  if (req.method === "GET" && url.pathname === "/api/talks") return json(res, 200, listTalks(store));
  if (req.method === "GET" && url.pathname === "/api/leaderboard") return json(res, 200, leaderboard(store));
  const rate = url.pathname.match(/^\/api\/talks\/([^/]+)\/ratings$/);
  if (req.method === "POST" && rate) return json(res, 201, addRating(store, rate[1], await readJson(req)));
  json(res, 404, { error: "not_found", message: `No route for ${req.method} ${url.pathname}` });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => log(`talk-pulse listening on :${port}`));
}
