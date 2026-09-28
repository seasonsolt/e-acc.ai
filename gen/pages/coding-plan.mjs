// /coding-plan — first product of the SaaS matrix (ADR-0005, docs/products/coding-plan.md).
// Target cluster (zh-CN): "claude code 接入 deepseek / glm / kimi"、"codex 使用第三方模型"、
// "coding plan 对比". Traffic comes from the e-accs.com "AI 编程 × 国产模型" articles.
// Registry: site/data/coding-plans.json; rendering: site/lib/codingplan.mjs (shared with
// the browser so the pre-rendered default and the live tool can never drift apart).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { CLIENTS, escHtml as esc, renderOutputHtml } from "../../site/lib/codingplan.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const registry = JSON.parse(readFileSync(join(root, "site", "data", "coding-plans.json"), "utf8"));
const offerings = registry.offerings;
const DEFAULT_CLIENT = "claude-code";
const DEFAULT_OFFERING = "deepseek-api";

const clientOptions = CLIENTS.map(
  (c) => `<option value="${c.id}"${c.id === DEFAULT_CLIENT ? " selected" : ""}>${esc(c.label)}</option>`
).join("");
const offeringOptions = offerings
  .map(
    (o) =>
      `<option value="${o.id}"${o.id === DEFAULT_OFFERING ? " selected" : ""}>${esc(o.vendor)} · ${esc(o.product)}</option>`
  )
  .join("");

const priceSummary = (o) => {
  if (o.plans.length) {
    return o.plans.map((p) => `${esc(p.name)} ¥${p.monthly_cny}/月`).join("<br />");
  }
  if (o.pricing) {
    const r = o.pricing.rows[0];
    return `${esc(r.model)}：输入 ¥${r.input} / 输出 ¥${r.output} 每百万 tokens`;
  }
  return "—";
};
const compareRows = offerings
  .map(
    (o) => `            <tr>
              <td>${esc(o.vendor)}<br /><span class="cp-muted">${esc(o.product)}</span></td>
              <td>${o.billing === "subscription" ? "包月套餐" : "按量计费"}</td>
              <td>${priceSummary(o)}</td>
              <td><code>${esc(o.claude_code.env.ANTHROPIC_BASE_URL)}</code></td>
              <td><a href="${esc(o.plans_source_url || o.pricing?.source_url || o.claude_code.source_url)}" rel="nofollow noopener" target="_blank">${esc(o.verified_at)}</a></td>
            </tr>`
  )
  .join("\n");

const body = `
        <p class="panel-lead">
          选择你用的 AI 编程客户端和国产模型厂商，直接得到可以粘贴的配置。所有端点、模型名和价格都照抄自厂商官方文档，
          每一项都附来源链接和核实日期。读者直接向厂商付费，用厂商自己的 API key 和官方兼容端点——本页不收录任何中转、代充或共享账号服务。
        </p>

        <div class="cp-tool" id="cp-tool">
          <div class="calc-row cp-row">
            <label for="cp-client">客户端</label>
            <select id="cp-client">${clientOptions}</select>
            <label for="cp-offering">厂商 / 方案</label>
            <select id="cp-offering">${offeringOptions}</select>
          </div>
          <div class="cp-output" id="cp-output" aria-live="polite">
${renderOutputHtml(offerings.find((o) => o.id === DEFAULT_OFFERING), DEFAULT_CLIENT)}
          </div>
        </div>

        <h2 class="panel-title"><span class="panel-name">国产模型 Coding Plan 价格对比</span></h2>
        <table class="calc-table cp-table">
          <thead>
            <tr><th>厂商 / 方案</th><th>计费</th><th>价格 / 套餐</th><th>Claude Code 端点</th><th>核实</th></tr>
          </thead>
          <tbody>
${compareRows}
          </tbody>
        </table>
        <p class="chart-caption">
          数据更新于 ${esc(registry.updated)}，仅收录中国大陆区端点。套餐额度与价格经常调整，下单前请以厂商页面为准；
          英文 API 的美元价格见 <a href="./pricing">LLM API 价格表</a>，按 token 估算费用可用 <a href="./calculator">token 计算器</a>。
        </p>

        <h2 class="panel-title"><span class="panel-name">包月套餐还是按量计费？</span></h2>
        <p>
          <strong>按量计费</strong>（DeepSeek、Kimi 开放平台）用多少付多少，适合用量不稳定、或者要在脚本和生产环境里调用的场景。
          <strong>包月套餐</strong>（智谱 GLM Coding Plan、MiniMax Token Plan、阿里云百炼 Token Plan、火山方舟 Coding Plan）
          价格固定，按 5 小时 / 每周窗口限额，适合每天长时间用编程工具的个人开发者。
          多数套餐规定额度只能在官方支持的编程工具里使用，直接调 API 不走套餐额度。
        </p>

        <h2 class="panel-title"><span class="panel-name">Claude Code、Codex CLI、opencode 分别怎么接</span></h2>
        <p>
          <strong>Claude Code</strong> 通过 Anthropic 兼容端点接入：在 <code>~/.claude/settings.json</code> 的 <code>env</code> 里设置
          <code>ANTHROPIC_BASE_URL</code>、key 和各档模型名。<strong>Codex CLI</strong> 通过 OpenAI 兼容端点接入，
          上面收录的厂商官方配置都使用 Responses 接口（<code>wire_api = "responses"</code>）。
          <strong>opencode</strong> 大多已内置厂商 provider，运行 <code>opencode auth login</code> 选择厂商即可。
        </p>

        <h2 class="panel-title"><span class="panel-name">常见问题</span></h2>
        <h3>配置写好了，Claude Code 还是连到别的地方？</h3>
        <p>shell 里 export 的 <code>ANTHROPIC_AUTH_TOKEN</code>、<code>ANTHROPIC_BASE_URL</code> 优先级高于配置文件，先 unset，再检查 <code>~/.zshrc</code>、<code>~/.bashrc</code> 里有没有残留。</p>
        <h3>为什么要加 hasCompletedOnboarding？</h3>
        <p>不加的话，Claude Code 首次启动会要求登录 Anthropic 账号。智谱、MiniMax、百炼、火山的官方文档都要求在 <code>~/.claude.json</code> 里写入 <code>"hasCompletedOnboarding": true</code>。</p>
        <h3>包月套餐的 key 能当普通 API key 用吗？</h3>
        <p>一般不能。MiniMax 的 Token Plan key 与按量计费 key 不能互换；Kimi 开放平台 key 只能用于 api.moonshot.cn；火山方舟的套餐必须走 <code>/api/coding</code> 端点，填成 <code>/api/v3</code> 会按量额外扣费。</p>
        <h3>为什么不收录"中转"服务？</h3>
        <p>中转、代充、共享账号本质上是转售别人的额度，随时可能被封、跑路或泄露你的代码和 key。本页只收录厂商官方渠道。</p>

        <h2 class="panel-title"><span class="panel-name">全厂商预设包</span></h2>
        <p>
          即将上线：所有客户端 × 所有厂商的现成预设（cc-switch、Codex、opencode），CLAUDE.md / AGENTS.md 模板，用量与成本统计脚本，
          厂商改价后 30 天内免费更新。
        </p>

        <script type="application/json" id="cp-data">
${JSON.stringify(offerings)}
        </script>
        <script type="module" src="./coding-plan.js"></script>`;

export default {
  slug: "coding-plan",
  lang: "zh-CN",
  cta: false,
  title: "Claude Code / Codex 接入国产模型配置生成器：DeepSeek、GLM、Kimi | e-acc.ai",
  description:
    `Claude Code、Codex CLI、opencode 接入 DeepSeek、智谱 GLM、Kimi、MiniMax、阿里云百炼、火山方舟的配置生成器：选客户端和厂商，直接复制官方配置，附 Coding Plan 包月套餐价格对比与常见报错处理。所有端点和价格照抄厂商官方文档，核实于 ${registry.updated}。`,
  h1Cmd: "$ eacc coding-plan",
  h1Text: "Claude Code / Codex 接入国产模型：Coding Plan 配置生成器",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "国产模型 Coding Plan 配置生成器",
      url: "https://e-acc.ai/coding-plan",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      inLanguage: "zh-CN",
      isAccessibleForFree: true,
      dateModified: registry.updated,
    },
  ],
  body,
};
