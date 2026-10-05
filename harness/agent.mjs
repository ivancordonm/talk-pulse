// Minimal, provider-agnostic agent loop (~80 lines).
// Works with any chat endpoint that speaks the OpenAI-compatible
// /chat/completions + tools format: OpenAI, Ollama, vLLM, OpenRouter, Mistral, ...
// Or delegate the whole session to an existing coding-agent CLI.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TOOLS = {
  read_file: ({ path }) => readFileSync(path, "utf8"),
  write_file: ({ path, content }) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return `wrote ${content.length} bytes to ${path}`;
  },
  run: ({ cmd }) => {
    try { return execSync(cmd, { encoding: "utf8", timeout: 120_000, stdio: "pipe" }); }
    catch (e) { return `EXIT ${e.status}\n${e.stdout}\n${e.stderr}`; }
  },
};

const schema = (name, props) => ({
  type: "function",
  function: { name, parameters: { type: "object", properties: props, required: Object.keys(props) } },
});
const TOOL_SPECS = [
  schema("read_file", { path: { type: "string" } }),
  schema("write_file", { path: { type: "string" }, content: { type: "string" } }),
  schema("run", { cmd: { type: "string" } }),
];

async function chat(role, messages, withTools) {
  const res = await fetch(`${role.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LLM_API_KEY ?? ""}` },
    body: JSON.stringify({ model: role.model, messages, ...(withTools ? { tools: TOOL_SPECS } : {}) }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()).choices[0].message;
}

// Runs one session for a role. Returns the final text of the model.
export async function runAgent(role, prompt, { tools = true, maxTurns = 60 } = {}) {
  if (role.adapter === "cli") {
    // e.g. "claude -p", "codex exec", "gemini -p", "aider --yes --message"
    return execSync(`${role.cmd} ${JSON.stringify(prompt)}`, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  }
  const system = readFileSync("AGENTS.md", "utf8");
  const messages = [{ role: "system", content: system }, { role: "user", content: prompt }];
  for (let turn = 0; turn < maxTurns; turn++) {
    const msg = await chat(role, messages, tools);
    messages.push(msg);
    if (!msg.tool_calls?.length) return msg.content ?? "";
    for (const call of msg.tool_calls) {
      const fn = TOOLS[call.function.name];
      let out;
      try { out = fn ? String(fn(JSON.parse(call.function.arguments))) : `unknown tool ${call.function.name}`; }
      catch (e) { out = `ERROR ${e.message}`; }
      messages.push({ role: "tool", tool_call_id: call.id, content: out.slice(0, 20_000) });
    }
  }
  return "STOPPED: max turns reached";
}
