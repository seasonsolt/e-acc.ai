# The news site is e-acc.ai's home; the static pages keep their URLs beside it

Partly supersedes ADR-0005: e-acc.ai is no longer only the SaaS matrix, it now opens on the news site.
ADR-0005's split of roles otherwise stands (www.e-accs.com finds the traffic, products live at paths on
e-acc.ai), and ADR-0001 binds the news site like every product.

**Context (2026-10-02):** the e/acc news site (fork of AIHOT, repo `seasonsolt/news-e-accs`) ran at
news.e-accs.com: curated AI news, daily report, newsletter, steampunk onboarding. The owner chose to
make it e-acc.ai's main site. e-acc.ai's own pages are indexed (27 sitemap URLs), and the rule that an
indexed URL is never changed or repurposed still holds.

**Decision:**

- **Path routing at the edge.** A Worker (`edge/`, route `e-acc.ai/*`) sends the root and the news
  site's own routes to the news site (DMIT, through its Cloudflare Tunnel) and everything else to this
  repo's Pages site. The routing table is `edge/src/route.mjs`; `test/edge-route.test.mjs` asserts that
  every file and sitemap URL of this site still goes to Pages. Unknown paths default to Pages, so new
  products at `e-acc.ai/<product>` need no edge change.
- **The root is the news site.** The hand-written homepage moves to `/terminal` (`site/terminal.html`).
- **Shared names:** `/feed.xml` stays this site's acceleration-log feed (the news picks feed is
  `/feed/picks.xml`); `/api/*.json` stay here, the rest of `/api/` is the news API; `/sitemap.xml` is
  a sitemap index the Worker builds over `/sitemap-news.xml` and `/sitemap-tools.xml` (this site's
  sitemap); `/robots.txt` and `/llms.txt` are merged by the Worker.
- **news.e-accs.com** answers only requests carrying the Worker's secret header and 301s everything else
  to the same path on e-acc.ai (old `/feed.xml` → `/feed/picks.xml`).
- **Language:** the news site and new features are Chinese; the indexed English pages stay as they are.
- **Newsletter** mail is sent from `daily@e-acc.ai`.

**Consequences:**

- e-acc.ai depends on the DMIT server for its root and news pages; Pages pages keep working if it is down.
- The news site's paths are a list in `edge/src/route.mjs`; a new top-level route there needs adding.
- Deploy the Worker from `edge/` with `cf deploy --secrets-file <file with EDGE_SECRET>`; the same secret
  is `EDGE_SECRET` in the news site's `.env`.
