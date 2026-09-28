import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CLIENTS, renderConfig, renderOutputHtml } from "../site/lib/codingplan.mjs";

const { offerings } = JSON.parse(readFileSync(new URL("../site/data/coding-plans.json", import.meta.url), "utf8"));
const byId = Object.fromEntries(offerings.map((o) => [o.id, o]));

test("every offering renders for every client without throwing", () => {
  for (const o of offerings) {
    for (const c of CLIENTS) {
      const r = renderConfig(o, c.id);
      assert.ok(r.steps.length > 0, `${o.id}/${c.id} has no steps`);
      assert.match(r.source, /^https:\/\//, `${o.id}/${c.id} has no source link`);
    }
  }
});

test("Claude Code config is valid JSON carrying the registry env verbatim", () => {
  for (const o of offerings) {
    const r = renderConfig(o, "claude-code");
    assert.deepEqual(JSON.parse(r.code), { env: o.claude_code.env });
  }
});

test("Codex config uses the registry base_url, wire_api and the right auth form", () => {
  const ds = renderConfig(byId["deepseek-api"], "codex").code;
  assert.match(ds, /base_url = "https:\/\/api\.deepseek\.com\/"/);
  assert.match(ds, /wire_api = "responses"/);
  assert.match(ds, /experimental_bearer_token = "<YOUR_API_KEY>"/);
  assert.match(ds, /model_catalog_json = /);

  const kimi = renderConfig(byId["kimi-api"], "codex");
  assert.match(kimi.code, /env_key = "KIMI_API_KEY"/);
  assert.doesNotMatch(kimi.code, /experimental_bearer_token|model_catalog_json/);
  assert.ok(kimi.steps.some((s) => s.includes("export KIMI_API_KEY")));
});

test("an offering without a Codex config explains why instead of inventing one", () => {
  const r = renderConfig(byId["bailian-token-plan"], "codex");
  assert.equal(r.code, null);
  assert.equal(r.steps[0], byId["bailian-token-plan"].codex_note);
});

test("output HTML escapes content and always links the official source", () => {
  const html = renderOutputHtml(byId["deepseek-api"], "claude-code");
  assert.ok(html.includes("&lt;DEEPSEEK_API_KEY&gt;"));
  assert.ok(!html.includes("<DEEPSEEK_API_KEY>"));
  assert.ok(html.includes('href="https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code"'));
});
