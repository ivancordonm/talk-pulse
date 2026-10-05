// Architecture + convention linter. Error messages tell the agent HOW to fix it.
// Enforce invariants, not implementations: layers, limits and dependencies are
// checked here so no prompt has to remember them.
import { readdirSync, readFileSync, existsSync } from "node:fs";

// Layers, top to bottom. Code may only import its own layer or a lower one.
const LAYERS = {
  "src/server.mjs": { layer: 3, name: "http",   builtins: ["node:http", "node:fs/promises"] },
  "src/talks.mjs":  { layer: 2, name: "domain", builtins: ["node:crypto"] },
  "src/store.mjs":  { layer: 1, name: "store",  builtins: ["node:fs", "node:path"] },
  "src/log.mjs":    { layer: 0, name: "shared", builtins: [] },
};
const LIMITS = { "src/": 120, "public/": 150, "tests/": 120, "e2e/": 80 };  // lines per file
const MAX_FUNCTION_LINES = 40;
const MAX_AGENTS_MD_LINES = 80;
const DEV_DEPENDENCY_ALLOWLIST = ["playwright"];

const errors = [];
const rule = (cond, where, msg, fix) => cond && errors.push(`${where}: ${msg}\n    FIX: ${fix}`);
const ls = (dir, ext) => existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => `${dir}/${f}`) : [];
const read = (path) => readFileSync(path, "utf8");
const importsOf = (src) => [...src.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]);

const srcFiles = ls("src", ".mjs");
const allFiles = [...srcFiles, ...ls("public", ".js"), ...ls("tests", ".mjs"), ...ls("e2e", ".mjs")];

// 1. Layering: imports only point down, and each layer may only touch its own builtins.
for (const file of srcFiles) {
  const me = LAYERS[file];
  rule(!me, file, "file is not in any layer",
    "add it to LAYERS in harness/lint.mjs and to docs/architecture.md (ask a human first)");
  if (!me) continue;
  for (const spec of importsOf(read(file))) {
    if (spec.startsWith("./")) {
      const target = LAYERS[`src/${spec.slice(2)}`];
      rule(target && target.layer > me.layer, file,
        `${me.name} layer imports ${target?.name} layer (${spec}): dependencies must point down`,
        "pass the data or a callback in from the caller instead (docs/architecture.md)");
    } else {
      rule(spec.startsWith("node:") && !me.builtins.includes(spec), file,
        `${me.name} layer imports ${spec}`,
        `${me.name} may only use ${me.builtins.join(", ") || "no Node builtins"}; move that I/O to the layer that owns it`);
    }
  }
}

// 2. UI talks to the API only.
for (const file of ls("public", ".js")) {
  rule(importsOf(read(file)).length > 0 || /\/src\//.test(read(file)), file,
    "UI imports code", "public/ only talks to the server through fetch('/api/...')");
}

// 3. Size limits: small files and small functions are what agents edit reliably.
for (const file of allFiles) {
  const lines = read(file).split("\n");
  const limit = Object.entries(LIMITS).find(([dir]) => file.startsWith(dir))?.[1];
  rule(limit && lines.length > limit, file, `${lines.length} lines (limit ${limit})`,
    "split it by responsibility into a new module; do not raise the limit");
  let start = -1, name = "";
  lines.forEach((line, i) => {
    const m = line.match(/^(?:export )?(?:async )?function (\w+)|^(?:export )?const (\w+) = (?:async )?\(/);
    if (m) { start = i; name = m[1] ?? m[2]; }
    if (start >= 0 && /^}\)?;?$/.test(line)) {
      rule(i - start + 1 > MAX_FUNCTION_LINES, `${file}:${start + 1}`,
        `function ${name} is ${i - start + 1} lines (limit ${MAX_FUNCTION_LINES})`,
        "extract named helpers; each function should do one thing");
      start = -1;
    }
  });
}

// 4. Conventions.
for (const file of srcFiles) {
  const src = read(file);
  rule(file !== "src/log.mjs" && /console\.log/.test(src), file,
    "console.log in src/", "use log() from src/log.mjs (docs/conventions.md)");
}

// 5. Dependencies: boring and few. Runtime is the Node standard library only.
const pkg = JSON.parse(read("package.json"));
rule(Object.keys(pkg.dependencies ?? {}).length > 0, "package.json",
  `runtime dependencies added: ${Object.keys(pkg.dependencies ?? {}).join(", ")}`,
  "use the Node standard library; new dependencies need a human decision in docs/");
for (const dep of Object.keys(pkg.devDependencies ?? {})) {
  rule(!DEV_DEPENDENCY_ALLOWLIST.includes(dep), "package.json", `devDependency "${dep}" is not allowed`,
    `allowed: ${DEV_DEPENDENCY_ALLOWLIST.join(", ")}. Ask a human to extend the allowlist`);
}

// 6. The map stays a map.
const agents = read("AGENTS.md").split("\n").length;
rule(agents > MAX_AGENTS_MD_LINES, "AGENTS.md", `${agents} lines (limit ${MAX_AGENTS_MD_LINES})`,
  "move detail into docs/ and link it from the Map table");

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`lint: ${allFiles.length} files ok · layers, size limits, dependencies, conventions`);
