// Which origin serves a path on e-acc.ai (ADR-0006). The news site (news-e-accs repo, on DMIT behind a
// Cloudflare Tunnel) owns the root and its own routes; everything else is this repo's static site on
// Cloudflare Pages, so every indexed page and every future product path keeps its home by default.
// A few files exist on both and are merged by the Worker.

/** The news site's page routes (apps/web/app/routes.ts), each with its subpaths. */
const NEWS_SECTIONS = [
  "all", "search-busy", "items", "hot", "story", "daily", "weekly", "monthly", "topics", "about", "terms",
  "privacy", "changelog", "feedback", "more", "starred", "agent", "leaderboard", "admin", "subscribe", "codex-reset", "chronicle", "products",
  // build assets, media, feeds and the other api-owned prefixes (packages/contracts/src/http-policy.ts)
  "assets", "media", "feed", "sitemaps", "model-providers", "leaderboard-sources", "og", "contact", ".well-known",
];

const NEWS_EXACT = new Set([
  "/", "/__manifest", "/rss", "/rss.xml", "/atom.xml", "/openapi-v1.json",
  "/favicon.ico", "/icon.png", "/icon-192.png", "/apple-icon.png", "/logo.svg", "/manifest.webmanifest",
]);

/** This site's own JSON endpoints under /api/; the rest of /api/ is the news site's API. */
const PAGES_API = new Set(["/api/benchmark.json", "/api/latest-frontier.json", "/api/timeline.json"]);

/** Built by the Worker from both origins. */
const MERGED = new Set(["/sitemap.xml", "/sitemap-tools.xml", "/sitemap-news.xml", "/robots.txt", "/llms.txt"]);

/** @returns {"news" | "pages" | "merged"} */
export function routeOf(pathname) {
  if (MERGED.has(pathname)) return "merged";
  if (NEWS_EXACT.has(pathname)) return "news";
  // React Router's single-fetch data requests: /_root.data, /daily.data, /items/x.data …
  if (pathname.endsWith(".data")) return "news";
  if (pathname.startsWith("/api/")) return PAGES_API.has(pathname) ? "pages" : "news";
  // First segment only: /feed/picks.xml is the news site's, /feed.xml (segment "feed.xml") stays this
  // site's acceleration-log feed.
  const first = pathname.split("/")[1] ?? "";
  return NEWS_SECTIONS.includes(first) ? "news" : "pages";
}
