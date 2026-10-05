import http from "node:http";
import { createStore } from "./store.mjs";
import { listTalks } from "./talks.mjs";
import { log } from "./log.mjs";

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

export function createApp(store = createStore()) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/talks") return json(res, 200, listTalks(store));
    json(res, 404, { error: "not_found", message: `No route for ${req.method} ${url.pathname}` });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => log(`talk-pulse listening on :${port}`));
}
