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

**Amendment (2026-10-09):** the e/acc concept pages `/what-is-eacc`, `/eacc-vs-dacc` and `/eacc-glossary`
moved to the news site with their URLs, titles, English text and structured data unchanged
(news-e-accs `industry/concepts.ts`). Their generators and HTML stay here as the rollback copy, out of
this site's sitemap; removing the three names from `NEWS_SECTIONS` and redeploying the Worker restores
them. Delete them here once the pages hold their rankings on the news site.

## Legacy tools cleanup (2026-10-18)

This cleanup removes the former configuration generator, its public registry and assets, and its sitemap and navigation entries. Initially, the existing Pages `404.html` handled its removed clean and `.html` URLs; no dedicated Worker route existed. There is no backend, database, job, setting or environment state to migrate.

The static pages now link to the news site's `/subscribe` daily briefing instead of posting to the former Buttondown weekly list. Publish the static Pages build and the matching news navigation change separately. External subscription lists and subscriber records are not modified.

Production acceptance found that Pages deployment `6dc65ded` (commit `97d54e3`) returned 404 for the deleted files on its `pages.dev` origins, while the custom domain still returned old 200 responses for the clean page and several scripts. Query variants returned 404. Exact URL, prefix and full-zone purges were accepted but did not remove those responses, including subsequent cache MISS responses.

The Worker therefore returns `410 Gone` directly for `/coding-plan`, `/coding-plan.html`, `/coding-plan.js`, `/lib/codingplan.mjs`, `/data/coding-plans.json` and `/guard.js`, including trailing-slash and query variants. These responses use `Cache-Control: no-store` and `X-Robots-Tag: noindex` and never read an origin or the Worker cache. Publish the Worker as well as Pages to complete retirement on the custom domain; rollback restores the previous Worker version. Other tool routes and external subscriber records are unaffected.
