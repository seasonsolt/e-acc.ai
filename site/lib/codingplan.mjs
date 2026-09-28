// Config rendering for /coding-plan. Pure module: imported by gen/pages/coding-plan.mjs
// (to pre-render the default combination into the HTML) and by site/coding-plan.js in
// the browser. Every value comes from site/data/coding-plans.json, which is copied from
// each vendor's official docs; this module only formats it.

export const CLIENTS = [
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex CLI" },
  { id: "opencode", label: "opencode" },
];

// "env_key:KIMI_API_KEY" -> "KIMI_API_KEY"
const envKeyName = (auth) => auth.slice("env_key:".length);

function claudeCode(o) {
  const settings = JSON.stringify({ env: o.claude_code.env }, null, 2);
  const steps = [
    "打开（或新建）~/.claude/settings.json，写入下面的内容，把尖括号里的占位符换成你自己的 key。",
  ];
  if (o.claude_code.onboarding) {
    steps.push('官方还要求在 ~/.claude.json 里加入 "hasCompletedOnboarding": true，跳过登录引导。');
  }
  steps.push("如果 shell 里 export 过 ANTHROPIC_* 变量，先 unset，否则会覆盖这里的配置。");
  return { file: "~/.claude/settings.json", lang: "json", code: settings, steps, source: o.claude_code.source_url };
}

function codex(o) {
  if (!o.codex) {
    return { file: null, lang: null, code: null, steps: [o.codex_note], source: o.codex_source_url };
  }
  const c = o.codex;
  const lines = [
    `model = "${c.model}"`,
    `model_provider = "${c.provider_id}"`,
    ...(c.needs_model_catalog ? ['model_catalog_json = "~/.codex/models.json"'] : []),
    "",
    `[model_providers.${c.provider_id}]`,
    `name = "${o.vendor}"`,
    `base_url = "${c.base_url}"`,
    `wire_api = "${c.wire_api}"`,
  ];
  const steps = ["在 ~/.codex/config.toml 中写入下面的内容。"];
  if (c.auth === "experimental_bearer_token") {
    lines.push('experimental_bearer_token = "<YOUR_API_KEY>"');
  } else if (c.auth.startsWith("env_key:")) {
    lines.push(`env_key = "${envKeyName(c.auth)}"`);
    steps.push(`再在 shell 里设置 key：export ${envKeyName(c.auth)}="<YOUR_API_KEY>"。`);
  }
  if (c.needs_model_catalog) {
    steps.push("官方配置还要求一个 ~/.codex/models.json 模型目录文件，内容见官方文档（链接在下方）。");
  }
  return { file: "~/.codex/config.toml", lang: "toml", code: lines.join("\n"), steps, source: c.source_url };
}

function opencode(o) {
  return { file: null, lang: null, code: null, steps: [o.opencode.steps], source: o.opencode.source_url };
}

export function renderConfig(offering, clientId) {
  if (clientId === "codex") return codex(offering);
  if (clientId === "opencode") return opencode(offering);
  return claudeCode(offering);
}

export function escHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// The HTML for the output panel. Used verbatim by the build and by the browser so the
// pre-rendered default and the live result can never drift apart.
export function renderOutputHtml(offering, clientId) {
  const r = renderConfig(offering, clientId);
  const steps = r.steps.map((s) => `<li>${escHtml(s)}</li>`).join("");
  const code = r.code
    ? `<p class="cp-file">${escHtml(r.file)}</p><pre class="cp-code"><code>${escHtml(r.code)}</code></pre>` +
      `<button type="button" class="cp-copy" data-copy>复制配置</button>`
    : "";
  const warnings = (offering.warnings || []).map((w) => `<li>${escHtml(w)}</li>`).join("");
  return (
    `<ol class="cp-steps">${steps}</ol>${code}` +
    (warnings ? `<h3 class="cp-sub">注意</h3><ul class="cp-warn">${warnings}</ul>` : "") +
    `<p class="cp-source">官方文档：<a href="${escHtml(r.source)}" rel="nofollow noopener" target="_blank">${escHtml(r.source)}</a>` +
    ` · 获取 key：<a href="${escHtml(offering.key_from)}" rel="nofollow noopener" target="_blank">${escHtml(offering.vendor)} 控制台</a>` +
    ` · 核实于 ${escHtml(offering.verified_at)}</p>`
  );
}
