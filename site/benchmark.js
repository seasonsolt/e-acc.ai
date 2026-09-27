// Progressive enhancement for the server-rendered benchmark SVG and table.
(function () {
  "use strict";

  const chart = document.getElementById("bench-chart");
  const readout = document.getElementById("bench-readout");
  if (!chart || !readout) return;

  const series = [...chart.querySelectorAll(".bench-series")];
  const svgs = [...chart.querySelectorAll("[data-bench-svg]")];
  const rows = [...document.querySelectorAll(".bench-table tbody tr")];
  const metricButtons = [...document.querySelectorAll("[data-bench-metric]")];
  const modeButtons = [...document.querySelectorAll("[data-bench-mode]")];
  const vendorButtons = [...document.querySelectorAll(".bench-legend [data-vendor]")];
  const modelFilters = [...document.querySelectorAll("[data-model-filter]")];
  const modelCount = document.getElementById("bench-model-count");
  const modelVendor = new Map();
  let pinnedModel = null;

  for (const item of series) {
    if (!modelVendor.has(item.dataset.model)) {
      modelVendor.set(item.dataset.model, item.dataset.vendor);
    }
  }

  const defaultCopy = {
    best: "Best configuration per model. Hover, focus, or tap a model for every effort level; outlined dots sit on the cost Pareto frontier.",
    all: "Every reasoning-effort configuration. Hover, focus, or tap a curve to isolate one model.",
  };

  const currentSeries = () =>
    series.filter(
      (item) => !item.closest("[data-bench-svg]").hasAttribute("hidden") && !item.hasAttribute("hidden")
    );

  const renderReadout = (item) => {
    readout.replaceChildren();
    const name = document.createElement("strong");
    name.textContent = item.dataset.model || "";
    readout.append(name);
    for (const entry of (item.dataset.readout || "").split(";").filter(Boolean)) {
      const [effort, pass, lo, hi, cost, output, steps] = entry.split("|");
      const detail = document.createElement("span");
      const effortLabel = document.createElement("span");
      effortLabel.className = "bench-eff";
      effortLabel.textContent = effort;
      detail.append(effortLabel, ` ${pass}% (${lo}–${hi}%) · $${cost} · ${output} tok · ${steps} steps`);
      readout.append(detail);
    }
  };

  const clearVisual = () => {
    chart.classList.remove("is-hovering");
    series.forEach((item) => item.classList.remove("is-active"));
    rows.forEach((row) => row.classList.remove("is-active"));
    readout.textContent = defaultCopy[chart.dataset.mode] || defaultCopy.best;
  };

  const activate = (model, pin = false) => {
    const item = currentSeries().find((candidate) => candidate.dataset.model === model);
    if (!item) return;
    if (pin) pinnedModel = model;
    chart.classList.add("is-hovering");
    series.forEach((candidate) => candidate.classList.toggle("is-active", candidate.dataset.model === model));
    rows.forEach((row) => row.classList.toggle("is-active", row.dataset.model === model));
    renderReadout(item);
  };

  const clear = (force = false) => {
    if (pinnedModel && !force) return;
    if (force) pinnedModel = null;
    clearVisual();
  };

  const togglePinned = (model) => {
    if (pinnedModel === model) clear(true);
    else activate(model, true);
  };

  for (const item of series) {
    item.addEventListener("mouseenter", () => {
      if (!pinnedModel) activate(item.dataset.model);
    });
    item.addEventListener("focusin", () => {
      if (!pinnedModel) activate(item.dataset.model);
    });
    item.addEventListener("click", () => togglePinned(item.dataset.model));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePinned(item.dataset.model);
      }
    });
  }

  chart.addEventListener("mouseleave", () => clear());
  chart.addEventListener("focusout", (event) => {
    if (!chart.contains(event.relatedTarget)) clear();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clear(true);
  });

  for (const row of rows) {
    row.addEventListener("mouseenter", () => {
      if (!pinnedModel) activate(row.dataset.model);
    });
    row.addEventListener("mouseleave", () => clear());
    row.addEventListener("focusin", () => {
      if (!pinnedModel) activate(row.dataset.model);
    });
    row.addEventListener("focusout", (event) => {
      if (!row.contains(event.relatedTarget)) clear();
    });
  }

  const applyFilters = () => {
    const selected = new Set(modelFilters.filter((input) => input.checked).map((input) => input.dataset.modelFilter));
    const bestOnly = chart.dataset.mode === "best";

    series.forEach((item) => item.toggleAttribute("hidden", !selected.has(item.dataset.model)));
    rows.forEach((row) => {
      const hidden = !selected.has(row.dataset.model) || (bestOnly && row.dataset.best !== "true");
      row.toggleAttribute("hidden", hidden);
    });

    for (const button of vendorButtons) {
      const vendorModels = modelFilters.filter(
        (input) => modelVendor.get(input.dataset.modelFilter) === button.dataset.vendor
      );
      const selectedCount = vendorModels.filter((input) => input.checked).length;
      button.setAttribute("aria-pressed", String(selectedCount === vendorModels.length));
      button.toggleAttribute("data-partial", selectedCount > 0 && selectedCount < vendorModels.length);
    }

    if (modelCount) modelCount.textContent = `(${selected.size}/${modelFilters.length})`;
    if (pinnedModel && !selected.has(pinnedModel)) clear(true);
  };

  const setMetric = (metric) => {
    chart.dataset.metric = metric;
    svgs.forEach((svg) => svg.toggleAttribute("hidden", svg.dataset.benchSvg !== metric));
    metricButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.benchMetric === metric))
    );
    const label = metric === "cost" ? "cost per task" : metric === "output" ? "output tokens" : "agent steps";
    chart.setAttribute("aria-label", `Benchmark configurations: pass rate versus ${label}`);
    if (pinnedModel) activate(pinnedModel, true);
    else clearVisual();
  };

  const setMode = (mode) => {
    chart.dataset.mode = mode;
    modeButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.benchMode === mode))
    );
    applyFilters();
    if (pinnedModel) activate(pinnedModel, true);
    else clearVisual();
  };

  metricButtons.forEach((button) =>
    button.addEventListener("click", () => setMetric(button.dataset.benchMetric))
  );
  modeButtons.forEach((button) =>
    button.addEventListener("click", () => setMode(button.dataset.benchMode))
  );
  modelFilters.forEach((input) => input.addEventListener("change", applyFilters));

  for (const button of vendorButtons) {
    button.addEventListener("click", () => {
      const vendorModels = modelFilters.filter(
        (input) => modelVendor.get(input.dataset.modelFilter) === button.dataset.vendor
      );
      const turnOn = vendorModels.some((input) => !input.checked);
      vendorModels.forEach((input) => {
        input.checked = turnOn;
      });
      applyFilters();
    });
  }

  document.querySelectorAll("[data-model-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const checked = button.dataset.modelSelect === "all";
      modelFilters.forEach((input) => {
        input.checked = checked;
      });
      applyFilters();
    });
  });

  applyFilters();
})();
