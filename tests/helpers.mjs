import { createApp } from "../src/server.mjs";

export async function startApp(store) {
  const server = createApp(store);
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}
