// e-acc.ai edge router (ADR-0006): sends each request to the news site or to the static Pages site
// (route.mjs decides), and builds the few files both have. Pages is reached with fetch(request): a
// Worker's subrequest to its own hostname goes to the origin behind the route, not back to the Worker.
import { routeOf } from "./route.mjs";

const SITE = "https://e-acc.ai";

/** The news site, which serves only requests carrying the edge secret (apps/web/server.ts). */
function toNews(request, env, pathname = null) {
  const url = new URL(request.url);
  const target = new URL(`${pathname ?? url.pathname}${pathname ? "" : url.search}`, env.NEWS_ORIGIN);
  const headers = new Headers(request.headers);
  headers.set("x-eacc-edge", env.EDGE_SECRET);
  headers.set("x-eacc-client-ip", request.headers.get("cf-connecting-ip") ?? "");
  headers.set("x-forwarded-host", url.host);
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
}

function toPages(request, pathname = null) {
  if (!pathname) return fetch(request);
  return fetch(new URL(pathname, request.url), { headers: request.headers });
}

async function text(response) {
  return response.ok ? await response.text() : "";
}

async function merged(request, env, pathname) {
  const plain = (body, type) => new Response(body, { headers: { "content-type": type, "cache-control": "public, max-age=3600" } });
  if (pathname === "/sitemap-tools.xml") return toPages(request, "/sitemap.xml");
  if (pathname === "/sitemap-news.xml") return toNews(request, env, "/sitemap.xml");
  if (pathname === "/sitemap.xml") {
    return plain(
      `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <sitemap><loc>${SITE}/sitemap-news.xml</loc></sitemap>\n  <sitemap><loc>${SITE}/sitemap-tools.xml</loc></sitemap>\n</sitemapindex>\n`,
      "application/xml; charset=utf-8",
    );
  }
  if (pathname === "/robots.txt") {
    // The news site's rules, narrowed so this site's own /api/*.json stays crawlable.
    return plain(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/site/",
        "Disallow: /api/ingest/",
        "Disallow: /admin/",
        "Disallow: /starred",
        "Disallow: /feedback",
        "",
        `Sitemap: ${SITE}/sitemap.xml`,
        "",
      ].join("\n"),
      "text/plain; charset=utf-8",
    );
  }
  // /llms.txt: the news site's guide first, then this site's tools and data.
  const [news, tools] = await Promise.all([toNews(request, env, "/llms.txt").then(text), toPages(request, "/llms.txt").then(text)]);
  return plain(`${news.trim()}\n\n---\n\n${tools.trim()}\n`, "text/plain; charset=utf-8");
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const where = routeOf(pathname);
    if (where === "news") return toNews(request, env);
    if (where === "merged") return merged(request, env, pathname);
    return toPages(request);
  },
};
