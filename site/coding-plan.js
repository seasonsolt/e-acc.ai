// /coding-plan page behavior. Rendering lives in lib/codingplan.mjs (shared with the
// build, which pre-renders the default combination); the registry is inlined at build time.
// Deep links from e-accs.com articles: ?client=claude-code|codex|opencode&vendor=<offering id>
import { CLIENTS, renderOutputHtml } from "./lib/codingplan.mjs";

const offerings = JSON.parse(document.getElementById("cp-data").textContent);
const clientEl = document.getElementById("cp-client");
const offeringEl = document.getElementById("cp-offering");
const outputEl = document.getElementById("cp-output");

const params = new URLSearchParams(location.search);
if (CLIENTS.some((c) => c.id === params.get("client"))) clientEl.value = params.get("client");
if (offerings.some((o) => o.id === params.get("vendor"))) offeringEl.value = params.get("vendor");

function render() {
  const offering = offerings.find((o) => o.id === offeringEl.value);
  outputEl.innerHTML = renderOutputHtml(offering, clientEl.value);
}

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set("client", clientEl.value);
  url.searchParams.set("vendor", offeringEl.value);
  history.replaceState(null, "", url);
}

outputEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const code = outputEl.querySelector(".cp-code code")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(code);
    button.textContent = "已复制";
  } catch {
    button.textContent = "复制失败，请手动选择";
  }
  setTimeout(() => (button.textContent = "复制配置"), 1600);
});

for (const el of [clientEl, offeringEl]) {
  el.addEventListener("change", () => {
    render();
    syncUrl();
  });
}

// Only re-render if a deep link changed the pre-rendered default.
if (params.has("client") || params.has("vendor")) render();
