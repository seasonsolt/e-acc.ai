// /benchmark — cited coding-agent benchmark: capability vs cost.
// The numbers are DeepSWE's (Datacurve). We cite with attribution and add
// the one thing we can add honestly: our own agreement from private runs.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const bench = JSON.parse(readFileSync(join(root, "site", "data", "benchmark.json"), "utf8"));
const registry = JSON.parse(readFileSync(join(root, "site", "data", "models.json"), "utf8"));

const esc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// link a benchmark model id to our pricing page when we track that model
const slugFor = (model) => {
  const norm = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hit = registry.models.find((m) => m.slug.replace(/-/g, "") === norm);
  return hit ? hit.slug : null;
};

// ── Pareto frontier: no run is both cheaper and better ────────────────────
const byCost = [...bench.runs].sort((a, b) => a.mean_cost_usd - b.mean_cost_usd);
const frontier = new Set();
let best = -Infinity;
for (const r of byCost) {
  if (r.pass_at_1 > best) {
    best = r.pass_at_1;
    frontier.add(r);
  }
}

// group every configuration by model: powers both the effort curves and the
// spread insight below
const byModel = new Map();
for (const r of bench.runs) {
  if (!byModel.has(r.model)) byModel.set(r.model, []);
  byModel.get(r.model).push(r);
}

const EFFORT_ORDER = new Map(["low", "medium", "high", "xhigh", "max"].map((effort, i) => [effort, i]));
const effortRank = (effort) => EFFORT_ORDER.get(effort) ?? EFFORT_ORDER.size;

// best configuration per model — the "which model should I use" answer
const bestByModel = [...byModel.values()]
  .map((runs) => runs.reduce((a, b) => (b.pass_at_1 > a.pass_at_1 ? b : a)))
  .sort((a, b) => b.pass_at_1 - a.pass_at_1);
const bestRuns = new Set(bestByModel);
const bestRunFor = new Map(bestByModel.map((run) => [run.model, run]));

let spreadCase = null;
for (const [model, rs] of byModel) {
  // compare only usable configurations — a degenerate low-effort run that
  // barely completes anything is a broken setting, not a cost/quality trade
  const usable = rs.filter((r) => r.pass_at_1 >= 0.25);
  if (usable.length < 2) continue;
  const hi = usable.reduce((a, b) => (b.pass_at_1 > a.pass_at_1 ? b : a));
  const lo = usable.reduce((a, b) => (b.pass_at_1 < a.pass_at_1 ? b : a));
  const gap = hi.pass_at_1 - lo.pass_at_1;
  if (!spreadCase || gap > spreadCase.gap) spreadCase = { model, hi, lo, gap };
}

// best value above a real quality bar
const valuePick = bench.runs
  .filter((r) => r.pass_at_1 > 0.6)
  .sort((a, b) => b.pass_at_1 / b.mean_cost_usd - a.pass_at_1 / a.mean_cost_usd)[0];

const top = bench.runs.reduce((a, b) => (b.pass_at_1 > a.pass_at_1 ? b : a));
const budgetPick = bench.runs
  .filter((r) => r.mean_cost_usd <= 5)
  .reduce((a, b) => (b.pass_at_1 > a.pass_at_1 ? b : a));

// ── scatter: pass@1 versus cost/tokens/steps, one series per model ─────────
// The SVGs are rendered server-side. JS only switches views and filters data.
const VENDOR = [
  [/^gpt-/, "OpenAI", "#33ff66"],
  [/^claude-/, "Anthropic", "#ffb347"],
  [/^gemini-/, "Google", "#4db8ff"],
  [/^kimi-/, "Moonshot", "#ff6b8a"],
  [/^grok-/, "xAI", "#b98cff"],
  [/^glm-/, "Zhipu", "#5ce0d8"],
];
const vendorOf = (model) => {
  const hit = VENDOR.find(([re]) => re.test(model));
  return hit ? { name: hit[1], color: hit[2] } : { name: "Other", color: "#9aa8a0" };
};
const vendorsUsed = [...new Set(bench.runs.map((r) => vendorOf(r.model).name))].map(
  (name) => ({ name, color: (VENDOR.find((v) => v[1] === name) || [, , "#9aa8a0"])[2] })
);

const W = 900;
const H = 520;
const PAD = { top: 42, right: 128, bottom: 58, left: 64 };
const yTop = 0.8;
const y = (p) => PAD.top + (1 - p / yTop) * (H - PAD.top - PAD.bottom);

const yGrid = [0, 0.2, 0.4, 0.6, 0.8]
  .map(
    (p) => `      <line x1="${PAD.left}" y1="${y(p).toFixed(1)}" x2="${W - PAD.right}" y2="${y(p).toFixed(1)}" stroke="#0d2d1c" stroke-width="1"/>
      <text x="${PAD.left - 9}" y="${(y(p) + 4).toFixed(1)}" text-anchor="end" fill="#7da68a" font-size="12">${Math.round(p * 100)}%</text>`
  )
  .join("\n");

const chartMetrics = [
  {
    id: "cost",
    key: "mean_cost_usd",
    label: "mean cost per task, log scale",
    ticks: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20],
    tick: (v) => `$${v}`,
    scale: "log",
  },
  {
    id: "output",
    key: "mean_output_tokens",
    label: "mean output tokens per task",
    ticks: [0, 50000, 100000, 150000, 200000, 250000, 300000],
    tick: (v) => `${v / 1000}k`,
    scale: "linear",
  },
  {
    id: "steps",
    key: "median_agent_steps",
    label: "median agent steps",
    ticks: [0, 50, 100, 150, 200, 250, 300],
    tick: String,
    scale: "linear",
  },
];

const metricScale = (metric) => {
  const values = bench.runs.map((run) => run[metric.key]).filter((value) => Number.isFinite(value) && value > 0);
  if (metric.scale === "log") {
    const min = Math.log10(Math.min(...values) * 0.75);
    const max = Math.log10(Math.max(...values) * 1.2);
    return {
      x: (value) =>
        PAD.left + ((Math.log10(value) - min) / (max - min)) * (W - PAD.left - PAD.right),
      ticks: metric.ticks.filter((value) => Math.log10(value) >= min && Math.log10(value) <= max),
    };
  }
  const max = Math.max(metric.ticks.at(-1), ...values);
  return {
    x: (value) => PAD.left + (value / max) * (W - PAD.left - PAD.right),
    ticks: metric.ticks.filter((value) => value <= max),
  };
};

// Label only the leading model per vendor; the rest appear on focus/hover.
const labelled = new Set();
for (const v of vendorsUsed) {
  const best = bestByModel.find((r) => vendorOf(r.model).name === v.name);
  if (best) labelled.add(best.model);
}

const labelY = new Map();
let previousLabelY = PAD.top - 28;
for (const model of [...labelled].sort(
  (a, b) => bestRunFor.get(b).pass_at_1 - bestRunFor.get(a).pass_at_1
)) {
  const desired = y(bestRunFor.get(model).pass_at_1) - 5;
  const position = Math.max(desired, previousLabelY + 27);
  labelY.set(model, position);
  previousLabelY = position;
}

const renderSeries = (metric, x) =>
  [...byModel.entries()]
    .map(([model, runs]) => {
      const { name: vendor, color } = vendorOf(model);
      const points = [...runs].sort((a, b) => effortRank(a.effort) - effortRank(b.effort));
      const best = bestRunFor.get(model);
      const path = points
        .map((run, i) => `${i === 0 ? "M" : "L"}${x(run[metric.key]).toFixed(1)},${y(run.pass_at_1).toFixed(1)}`)
        .join(" ");
      const dots = points
        .map((run) => {
          const cx = x(run[metric.key]).toFixed(1);
          const cy = y(run.pass_at_1).toFixed(1);
          const isBest = run === best;
          const title = `${model} ${run.effort || ""} — ${(run.pass_at_1 * 100).toFixed(1)}% pass@1, $${run.mean_cost_usd.toFixed(2)}, ${Math.round(run.mean_output_tokens / 1000)}k output tokens, ${run.median_agent_steps} steps`;
          return `        <circle class="bench-point-hit" data-best="${isBest}" cx="${cx}" cy="${cy}" r="12"/>
        <circle class="bench-point" data-best="${isBest}" data-frontier="${frontier.has(run)}" cx="${cx}" cy="${cy}" r="${isBest ? 5 : 4}" fill="${color}" fill-opacity="${frontier.has(run) ? 1 : 0.65}" stroke="${frontier.has(run) ? "#e7ffec" : "none"}" stroke-width="${frontier.has(run) ? 1.5 : 0}"><title>${esc(title)}</title></circle>`;
        })
        .join("\n");
      const readout = points
        .map(
          (run) =>
            `${run.effort || "—"}|${(run.pass_at_1 * 100).toFixed(1)}|${(run.ci_lo * 100).toFixed(1)}|${(run.ci_hi * 100).toFixed(1)}|${run.mean_cost_usd.toFixed(2)}|${Math.round(run.mean_output_tokens / 1000)}k|${run.median_agent_steps}`
        )
        .join(";");
      const bestX = x(best[metric.key]);
      const textAnchor = bestX > W - PAD.right - 100 ? "end" : "start";
      const labelX = bestX + (textAnchor === "end" ? -11 : 11);
      const bestY = y(best.pass_at_1);
      const textY = labelY.get(model);
      const lineX = labelX + (textAnchor === "end" ? 4 : -4);
      return `      <g class="bench-series" tabindex="0" role="listitem" data-vendor="${esc(vendor)}" aria-label="${esc(model)}: ${points.length} configuration${points.length > 1 ? "s" : ""}, best ${(best.pass_at_1 * 100).toFixed(1)} percent at $${best.mean_cost_usd.toFixed(2)}" data-model="${esc(model)}" data-readout="${esc(readout)}">
${points.length > 1 ? `        <path class="bench-path" d="${path}" fill="none" stroke="${color}" stroke-width="1.75" stroke-opacity="0.5" stroke-linejoin="round"/>\n        <path class="bench-hit" d="${path}" fill="none" stroke="transparent" stroke-width="16"/>` : ""}
${dots}
${labelled.has(model) ? `        <line class="bench-label-line" x1="${bestX.toFixed(1)}" y1="${bestY.toFixed(1)}" x2="${lineX.toFixed(1)}" y2="${(textY - 4).toFixed(1)}" stroke="${color}"/>\n        <text class="bench-label" x="${labelX.toFixed(1)}" y="${textY.toFixed(1)}" text-anchor="${textAnchor}" fill="${color}" paint-order="stroke" stroke="#030806" stroke-width="4" stroke-linejoin="round">${esc(model)}<tspan class="bench-label-effort" x="${labelX.toFixed(1)}" dy="13">${esc((best.effort || "best").toUpperCase())}</tspan></text>` : ""}
      </g>`;
    })
    .join("\n");

const renderChart = (metric, index) => {
  const scale = metricScale(metric);
  const xGrid = scale.ticks
    .map(
      (value) => `      <line x1="${scale.x(value).toFixed(1)}" y1="${PAD.top}" x2="${scale.x(value).toFixed(1)}" y2="${H - PAD.bottom}" stroke="#0d2d1c" stroke-width="1" opacity="0.65"/>
      <text x="${scale.x(value).toFixed(1)}" y="${H - 32}" text-anchor="middle" fill="#7da68a" font-size="12">${metric.tick(value)}</text>`
    )
    .join("\n");
  const costFrontier =
    metric.id === "cost"
      ? [...frontier]
          .sort((a, b) => a.mean_cost_usd - b.mean_cost_usd)
          .map((run, i) => `${i === 0 ? "M" : "L"}${scale.x(run.mean_cost_usd).toFixed(1)},${y(run.pass_at_1).toFixed(1)}`)
          .join(" ")
      : "";
  return `            <svg data-bench-svg="${metric.id}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"${index ? " hidden" : ""}>
${yGrid}
${xGrid}
              <text class="bench-axis-y" x="16" y="${(PAD.top + H - PAD.bottom) / 2}" transform="rotate(-90 16 ${(PAD.top + H - PAD.bottom) / 2})" text-anchor="middle">pass@1</text>
              <text class="bench-axis-title" x="${((W - PAD.right + PAD.left) / 2).toFixed(0)}" y="${H - 8}" text-anchor="middle">${metric.label}</text>
              <text class="bench-better" x="${PAD.left + 8}" y="${PAD.top + 18}">better value ↖</text>
${costFrontier ? `              <path class="bench-frontier" d="${costFrontier}"/>\n              <text class="bench-frontier-label" x="${PAD.left + 8}" y="${PAD.top + 36}">Pareto frontier</text>` : ""}
${renderSeries(metric, scale.x)}
            </svg>`;
};

const chartsSvg = chartMetrics.map(renderChart).join("\n");

const legendSvg = vendorsUsed
  .map(
    (v) =>
      `            <button class="bench-chip" type="button" data-vendor="${esc(v.name)}" aria-pressed="true"><span class="bench-swatch" style="background:${v.color}"></span>${esc(v.name)}</button>`
  )
  .join("\n");

const modelOptions = bestByModel
  .map((run, index) => {
    const { color } = vendorOf(run.model);
    return `                <label for="bench-model-${index}"><input id="bench-model-${index}" type="checkbox" data-model-filter="${esc(run.model)}" checked> <span class="bench-swatch" style="background:${color}"></span>${esc(run.model)}</label>`;
  })
  .join("\n");

const rows = bench.runs
  .map((r) => {
    const slug = slugFor(r.model);
    const name = slug ? `<a href="./pricing/${slug}">${esc(r.model)}</a>` : esc(r.model);
    const { color } = vendorOf(r.model);
    const score = r.pass_at_1 * 100;
    const ciHalf = ((r.ci_hi - r.ci_lo) * 50).toFixed(1);
    return `            <tr data-model="${esc(r.model)}" data-best="${bestRuns.has(r)}"${frontier.has(r) ? ' class="calc-cheapest"' : ""}>
              <th scope="row"><span class="bench-swatch" style="background:${color}"></span>${name} <span class="bench-effort">[${esc(r.effort || "—")}]</span></th>
              <td class="bench-score-cell">
                <span class="bench-score">
                  <span class="bench-score-track" aria-hidden="true">
                    <span class="bench-score-fill" style="width:${score.toFixed(1)}%;background:${color}"></span>
                    <span class="bench-score-ci" style="left:${(r.ci_lo * 100).toFixed(1)}%;width:${((r.ci_hi - r.ci_lo) * 100).toFixed(1)}%"></span>
                  </span>
                  <strong>${score.toFixed(1)}%</strong><small>±${ciHalf}%</small>
                </span>
              </td>
              <td class="bench-col-pass4">${(r.pass_at_4 * 100).toFixed(1)}%</td>
              <td>$${r.mean_cost_usd.toFixed(2)}</td>
              <td class="bench-col-output">${Math.round(r.mean_output_tokens / 1000)}k</td>
              <td class="bench-col-steps">${r.median_agent_steps ?? "—"}</td>
            </tr>`;
  })
  .join("\n");


const cheapestOnFrontier = byCost.find((r) => frontier.has(r) && r.pass_at_1 > 0.4);
const spread = (top.mean_cost_usd / (cheapestOnFrontier?.mean_cost_usd || top.mean_cost_usd)).toFixed(1);

const body = `
        <p class="panel-lead">
          How well do frontier models actually <em>finish real engineering tasks</em>, and what does each
          attempt cost? The numbers below are the public
          <a href="${esc(bench.source.homepage)}" target="_blank" rel="noopener">${esc(bench.source.name)}</a>
          leaderboard (${esc(bench.source.version || "")}) by <strong>${esc(bench.source.owner)}</strong> —
          ${bench.runs.length} configurations across ${bestByModel.length} models on ${bench.n_tasks_in_set} agentic tasks, pass@1 over repeated runs with 95% confidence intervals, generated
          ${esc(bench.generated_at.slice(0, 10))}. <strong>All figures belong to ${esc(bench.source.owner)}</strong>;
          we cite them, we don't own them.
        </p>
        <p class="panel-lead">
          Why cite this one: we ran our own agentic evaluations against a private ~1M-line polyglot
          repository (Java, Go, Python, Vue, React, Next.js) and <strong>our ordering agrees with
          theirs</strong> — so this is the closest public, reproducible reference to what we see on
          real production code. Prices per model live on <a href="./pricing">our pricing pages</a>.
        </p>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ plot pass@1 --vs cost --log</span>
          <span class="panel-name">Capability versus cost per task</span>
        </h2>

        <dl class="bench-highlights" aria-label="Benchmark recommendations">
          <div>
            <dt>highest capability</dt>
            <dd>${(top.pass_at_1 * 100).toFixed(1)}% <small>$${top.mean_cost_usd.toFixed(2)}</small></dd>
            <span>${esc(top.model)} [${esc(top.effort || "—")}]</span>
          </div>
          <div>
            <dt>strongest under $5</dt>
            <dd>${(budgetPick.pass_at_1 * 100).toFixed(1)}% <small>$${budgetPick.mean_cost_usd.toFixed(2)}</small></dd>
            <span>${esc(budgetPick.model)} [${esc(budgetPick.effort || "—")}]</span>
          </div>
          <div>
            <dt>best value above 60%</dt>
            <dd>${(valuePick.pass_at_1 * 100).toFixed(1)}% <small>$${valuePick.mean_cost_usd.toFixed(2)}</small></dd>
            <span>${esc(valuePick.model)} [${esc(valuePick.effort || "—")}]</span>
          </div>
        </dl>

        <figure class="chart-frame bench-frame">
          <div class="bench-toolbar">
            <div class="bench-toggle" role="group" aria-label="Horizontal axis">
              <button type="button" data-bench-metric="cost" aria-pressed="true">Cost</button>
              <button type="button" data-bench-metric="output" aria-pressed="false">Output tokens</button>
              <button type="button" data-bench-metric="steps" aria-pressed="false">Agent steps</button>
            </div>
            <div class="bench-toggle" role="group" aria-label="Reasoning effort levels">
              <button type="button" data-bench-mode="best" aria-pressed="true">Best</button>
              <button type="button" data-bench-mode="all" aria-pressed="false">All effort levels</button>
            </div>
            <details class="bench-model-picker">
              <summary>Models <span id="bench-model-count">(${bestByModel.length}/${bestByModel.length})</span></summary>
              <div class="bench-model-menu">
                <div class="bench-model-actions">
                  <button type="button" data-model-select="all">all</button>
                  <button type="button" data-model-select="none">none</button>
                </div>
${modelOptions}
              </div>
            </details>
          </div>
          <p class="bench-readout" id="bench-readout" aria-live="polite">Best configuration per model. Hover, focus, or tap a model for every effort level; outlined dots sit on the cost Pareto frontier.</p>
          <div class="bench-chart-viewport">
            <div class="bench-chart" id="bench-chart" data-mode="best" data-metric="cost" role="list" aria-label="Benchmark configurations: pass rate versus cost per task">
${chartsSvg}
            </div>
          </div>
          <div class="bench-legend" aria-label="Filter by vendor">
${legendSvg}
          </div>
          <figcaption class="chart-caption">
            Source: ${esc(bench.source.name)} ${esc(bench.source.version || "")} (${esc(bench.source.owner)}), generated ${esc(bench.generated_at.slice(0, 10))}.
          </figcaption>
        </figure>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ rank --visual --ci</span>
          <span class="panel-name">Leaderboard</span>
        </h2>
        <p class="panel-lead">Bars show pass@1; whiskers show the 95% confidence interval. The chart controls also filter this table.</p>
        <div class="bench-table-wrap">
          <table class="calc-table bench-table">
            <thead>
              <tr>
                <th scope="col">model</th>
                <th scope="col">pass@1 · 95% CI</th>
                <th scope="col" class="bench-col-pass4">pass@4</th>
                <th scope="col">cost/task</th>
                <th scope="col" class="bench-col-output">output tok</th>
                <th scope="col" class="bench-col-steps">steps</th>
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>

        <h2 class="panel-title">
          <span class="panel-cmd" aria-hidden="true">$ cat METHOD</span>
          <span class="panel-name">What the numbers mean</span>
        </h2>
        <div class="readme">
          <p>${esc(bench.unit)}</p>
          <p>${esc(bench.scope)}</p>
          <p>
            Reasoning effort is a per-run setting, not a different model — and it moves the numbers
            as much as switching vendors does. The widest case here is
            <strong>${esc(spreadCase.model)}</strong>: ${(spreadCase.lo.pass_at_1 * 100).toFixed(1)}%
            at <code>${esc(spreadCase.lo.effort)}</code> for $${spreadCase.lo.mean_cost_usd.toFixed(2)}
            versus ${(spreadCase.hi.pass_at_1 * 100).toFixed(1)}% at
            <code>${esc(spreadCase.hi.effort)}</code> for $${spreadCase.hi.mean_cost_usd.toFixed(2)} —
            ${(spreadCase.gap * 100).toFixed(1)} points of pass rate for
            ${(spreadCase.hi.mean_cost_usd / spreadCase.lo.mean_cost_usd).toFixed(1)}× the bill, same
            model. The practical lesson: <strong>tune effort before you switch vendors</strong>.
            Best value above a 60% bar is
            <strong>${esc(valuePick.model)} ${esc(valuePick.effort || "")}</strong> at
            ${(valuePick.pass_at_1 * 100).toFixed(1)}% for $${valuePick.mean_cost_usd.toFixed(2)}
            (${(valuePick.pass_at_1 * 100 / valuePick.mean_cost_usd).toFixed(1)} points per dollar),
            while the top score costs $${top.mean_cost_usd.toFixed(2)}.
          </p>
          <p class="readme-links">
            <a href="${esc(bench.source.homepage)}" target="_blank" rel="noopener">${esc(bench.source.name)} leaderboard by ${esc(bench.source.owner)} (original source)</a>
            <a href="./pricing">our LLM API pricing comparison</a>
            <a href="./calculator">token cost calculator</a>
          </p>
        </div>`;

export default {
  slug: "benchmark",
  title: "AI Coding Agent Benchmark: Score vs Cost per Task | e-acc.ai",
  description: `Coding-agent benchmark as capability versus cost: ${bench.runs.length} configurations over ${bench.n_tasks_in_set} agentic tasks, pass@1 with CIs. Data cited from DeepSWE by Datacurve.`,
  h1Cmd: "$ eacc bench --agentic",
  h1Text: "AI coding agent benchmark — capability versus cost per task",
  keyword: "benchmark",
  jsonLd: [],
  headExtra: '    <script src="./benchmark.js" defer></script>\n',
  body,
};
