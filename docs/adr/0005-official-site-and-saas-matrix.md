# e-accs.com is the official site and traffic engine; e-acc.ai hosts an AI SaaS matrix

Supersedes ADR-0002. Partly supersedes ADR-0004 (its measurements stand; its "no further
growth investment" is replaced by the split below). ADR-0001 is unchanged and binds every
product in the matrix.

**Evidence (2026-09-28, Cloudflare RUM + Google Search Console):** e-acc.ai drew 22 Google
clicks in 90 days with zero referring domains; its own pages cannot pull search traffic
on their own. www.e-accs.com draws about 650 Google visits a month, still growing, almost
entirely from one dated Chinese how-to that solves a paid, urgent problem (the Claude
subscription guide). So the domain Google already trusts should find the traffic, and the
other domain should turn it into revenue.

**Decision:**

- **www.e-accs.com = official site + traffic engine.** The homepage presents e-acc and its
  products; below it, keyword article sections pull search traffic the way the Claude
  guide does: one searched keyword per page, dated, step by step, tested by the owner.
  Each section maps to a product and ends in a link to it.
- **e-acc.ai = AI SaaS matrix.** Products live at paths (`e-acc.ai/<product>`), not
  subdomains, so they share the domain's authority. Cloudflare can route a path to its own
  Worker or Pages project when a product needs a backend. The existing indexed pages
  (pricing, calculator, benchmark, timeline, API, the e/acc concept pages) keep their URLs
  and become the matrix's free-tool area.
- **How products are chosen:** only from demand already evidenced on e-accs.com (GSC
  queries, autocomplete) — never "I have data, let me make a page". Charge from launch.
- **Revenue order:** users paying for products > cash referral programmes > ads. The
  e-acc.ai homepage stays ad-free.

**Consequences:**

- Every product must pass ADR-0001: it may consume tokens from our own account and charge
  for real added value; it may never resell, relay or pool provider quota, subscriptions or
  accounts, and may not link to or earn from anyone who does (relays, 代充, account sales,
  subscription-to-API).
- `gateway/` stays shelved. A BYOK proxy is not quota resale, but it is a product-scale
  build competing with funded incumbents; reviving it needs its own ADR and demand evidence.
- The weekly data treadmill ends. Registry data is refreshed when it changes or monthly,
  and each file stamps its own `updated` date.
- Open: whether the ui., law., sure. and k12. subdomains join the matrix or stay separate.

Plan and numbers: `docs/profit-replan-2026-09.md`. First product: `docs/products/coding-plan.md`.
