// The RELAY loop. Deterministic code holds the plan; models only do the shifts.
//   node harness/relay.mjs plan     -> planner turns docs/brief.md into features.json
//   node harness/relay.mjs run      -> builder/reviewer shifts until every feature passes
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { runAgent } from "./agent.mjs";

const sh = (cmd) => { try { return { ok: true, out: execSync(cmd, { encoding: "utf8", stdio: "pipe" }) }; }
                      catch (e) { return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` }; } };
const env = (s) => s.replace(/\$\{(\w+)\}/g, (_, k) => process.env[k] ?? "");
const cfg = JSON.parse(env(readFileSync("harness/relay.config.json", "utf8")));
const prompt = (name, vars) => readFileSync(`harness/prompts/${name}.md`, "utf8")
  .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
const FEATURES = "harness/features.json";
const load = () => JSON.parse(readFileSync(FEATURES, "utf8"));
const log = (line) => appendFileSync("harness/progress.md", line + "\n");

async function plan() {
  const out = await runAgent(cfg.roles.planner, prompt("planner", { brief: readFileSync("docs/brief.md", "utf8") }), { tools: false });
  const { spec, features } = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
  writeFileSync("docs/spec.md", spec);
  writeFileSync(FEATURES, JSON.stringify({ features: features.map((f) => ({ ...f, passes: false, attempts: 0 })) }, null, 2) + "\n");
  log(`\n## Session 0 — planner\n- Expanded brief into ${features.length} features, all failing.`);
  sh(`git add -A && git commit -m "plan: ${features.length} features from brief"`);
}

async function shift(n) {
  const db = load();
  const f = db.features.find((x) => !x.passes);
  if (!f) return false;
  if (f.attempts >= cfg.loop.maxAttemptsPerFeature) throw new Error(`${f.id} needs a human`);

  const base = sh("git rev-parse HEAD").out.trim();
  await runAgent(cfg.roles.builder, prompt("builder", { id: f.id, title: f.title, verify: f.verify.join("\n- ") }));

  const check = sh("./harness/check.sh");                         // sensors: computational
  const diff = sh(`git diff ${base} -- . ':!harness/progress.md'`).out;
  const review = check.ok                                         // sensor: inferential, different model
    ? JSON.parse(await runAgent(cfg.roles.reviewer, prompt("reviewer", { id: f.id, title: f.title, diff, check: check.out }), { tools: false }))
    : { verdict: "reject", reasons: ["check.sh is red"] };

  f.attempts++;
  if (review.verdict !== "approve") {
    sh(`git checkout -- . && git clean -fdq -e data/`);           // throw the shift away, keep the lesson
    log(`- Session ${n} REJECTED ${f.id}: ${review.reasons.join("; ")}`);
    writeFileSync(FEATURES, JSON.stringify(db, null, 2) + "\n");
    sh(`git add -A && git commit -m "relay: ${f.id} attempt ${f.attempts} rejected"`);
    return true;
  }
  f.passes = true;
  writeFileSync(FEATURES, JSON.stringify(db, null, 2) + "\n");
  const summary = check.out.trim().split("\n").at(-1);
  sh(`git add -A && git commit -m "feat(${f.id}): ${f.title}" -m "Session: ${n}" -m "Checks: ${summary}" -m "Reviewed-by: reviewer (approve)"`);
  return true;
}

const mode = process.argv[2];
if (mode === "plan" || !existsSync(FEATURES)) await plan();
if (mode === "run") for (let n = 1; n <= cfg.loop.maxSessions && (await shift(n)); n++);
