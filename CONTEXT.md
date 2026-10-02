# e-acc.ai — the acceleration terminal

The home of an AI SaaS matrix. Traffic is found by the sister site www.e-accs.com (the
official site, with keyword article sections); e-acc.ai turns it into paying users. The
static pages here (prices, calculator, benchmark, timeline, API) are the matrix's free-tool
area. Positioning and history: ADR-0005, which supersedes ADR-0002.

## Language

### Strategy

**SaaS matrix**:
The set of AI products hosted on e-acc.ai, each at its own path (`e-acc.ai/<product>`),
each chosen from demand already evidenced on e-accs.com and charging from launch.
Every product must pass ADR-0001.
_Avoid_: platform, gateway (shelved), "the app"

**Official site**:
www.e-accs.com — presents e-acc and its products, and runs the keyword article sections.

**Keyword article section**:
A group of dated, step-by-step articles on e-accs.com, one searched keyword per page,
that solve a paid problem and end in a link to the matching product. The Claude
subscription guide is the proven pattern.
_Avoid_: blog, content marketing

**Audience asset** (retired):
The old ADR-0002 thesis that the newsletter audience was the goal. Superseded by ADR-0005.

**Capacity arbitrage**:
Any scheme that monetizes access to third-party model quota (resale, lending,
subscription-to-API conversion). Permanently banned by ADR-0001.
_Avoid_: token bank, sub2api, quota lending

**Keyword probe**:
A small programmatic page batch (~10 pages) shipped to test whether a template earns
search impressions before scaling it. Expansion requires Search Console evidence.
_Avoid_: bulk rollout, mass generation

**Keyword qualification**:
Making a page eligible to rank: target keyword present in Title, H1 and visible
headings. The first stage of the ranking pipeline, before links and engagement.
_Avoid_: keyword stuffing

### Site concepts

**Altar counter**:
The terminal page's (/terminal, the former homepage) live estimate of tokens consumed worldwide since the visitor arrived —
the site's signature element, driven by the token rate in the metrics data.
_Avoid_: token ticker, burn meter

**Acceleration log**:
The curated, sourced timeline of AI events (model / compute / policy / culture) in
`timeline.json`. The terminal page's log and /timeline page are views of it.
_Avoid_: news feed, changelog

**Frontier event**:
An acceleration-log entry marked `frontier: true` — a frontier-model release. Drives
every days-since metric.

**Days-since metric**:
A live counter of days elapsed since a frontier event, computed client-side at view
time so pages never go stale.

**Price registry**:
`models.json` — the per-model API price table (input/output USD per Mtok, provider,
source). Single source of truth for the calculator and all pricing pages.
_Avoid_: price list, catalog

**Price-of-intelligence series**:
`metrics.json`'s price curve: the cheapest API model matching original GPT-4 over
time. Powers the terminal page's log-scale chart and the "N× cheaper" headline.

**Data refresh**:
Edit the data files when a price or release changes (at least monthly), build, verify, push.
Each file stamps its own `updated` date; pages never promise a fixed cadence.
Everything regenerates from data; no page is edited by hand except the terminal page (the former homepage; the site root is the news site, ADR-0006).
