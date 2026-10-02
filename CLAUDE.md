# CLAUDE.md

e-acc.ai — opens on the e/acc news site (ADR-0006, repo `seasonsolt/news-e-accs`) and hosts an AI
SaaS matrix (ADR-0005); www.e-accs.com is the official site that finds the traffic. The pages here
are the static free-tool area: phosphor-CRT aesthetic, zero dependencies, generated from JSON data
and deployed on Cloudflare Pages (build output directory `site/`, configured in `wrangler.toml`).
An edge Worker (`edge/`, route `e-acc.ai/*`) sends the root and the news site's paths to the news
site and everything else to Pages.

## Commands

- `npm run build` — regenerate all pages + sitemap from `site/data/*.json` (`gen/build.mjs`)
- `npm run verify` — full-site contract tests: data schemas, per-page TDH, canonicals,
  cross-page link graph, sitemap consistency (`site/verify.mjs`)
- `npm test` — unit tests for the pure modules in `site/lib/` (calculator math, coding-plan config rendering)
  and the edge routing table (`edge/src/route.mjs`: every Pages file must stay on Pages)
- `cd edge && cf deploy --secrets-file <file with EDGE_SECRET>` — deploy the edge Worker
- `node gen/indexnow.mjs` — push sitemap URLs to IndexNow (Bing/Yandex) after deploys

## Architecture

`site/data/*.json` → `gen/build.mjs` → emitted `site/*.html` + `sitemap.xml` + `feed.xml`
+ `site/api/*.json`. Every generated page is a module in `gen/pages/` exporting
`{ slug, title, description, h1Cmd, h1Text, jsonLd, body }`, wrapped by `gen/layout.mjs`
(head, nav, breadcrumb, subscribe CTA, footer). The generated output is committed
(ADR-0003), so a build with no data change should produce an empty diff.

- `models.json` is a *page generator*: each entry emits `site/pricing/<slug>.html` and a
  sitemap URL. Adding a model adds a permanent URL; renaming a `slug` breaks an indexed
  one. Removing a model deletes a live page — check it isn't ranking first.
- Top-level pages live in `gen/nav.mjs` (single source for header + footer, asserted by
  verify). Cluster children — `/eacc-vs-dacc`, `/eacc-glossary` — are deliberately *not*
  in nav; they hang off `/what-is-eacc` as their hub and are linked from the terminal
  page's manifesto block. Adding a page outside nav means linking it from a hub yourself.
- `verify.mjs` reads only emitted HTML, never the page modules. A new page needs its
  target keyword added to `keywordFor()` there or it only warns.

## Rules

- The terminal page (`site/terminal.html`, the former homepage) is hand-written; all other pages are generated —
  edit `gen/pages/*.mjs` templates, never the emitted `site/*.html`.
- Never change or repurpose an already-indexed URL; new content only ever adds pages.
- The site root `/` belongs to the news site. A new top-level path here needs no edge change
  (unknown paths go to Pages); a new top-level route on the news site must be added to `edge/src/route.mjs`.
- Data refresh = edit `site/data/*.json` when a price or release changes (at least monthly)
  → build → verify → push (auto-deploys) → `node gen/indexnow.mjs`.
- Every SaaS product must pass ADR-0001 (no quota/subscription/account resale or relays).
- Run build + verify + test before claiming any change is done.

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues (seasonsolt/eacc) via the `gh` CLI; external PRs are NOT a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles use their default strings (needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
