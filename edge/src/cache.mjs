import { routeOf } from "./route.mjs";

// The cache key is the URL only. These cookies personalize news responses, so a hit would be served to other visitors.
const SESSION_COOKIES = new Set(["aihot_admin", "aihot_oauth_state", "CF_Authorization"]);

function hasSessionCookie(cookie) {
  if (!cookie) return false;
  return cookie.split(";").some((part) => SESSION_COOKIES.has(part.split("=", 1)[0].trim()));
}

/** Personalized routes, including /zh/ editions and React Router .data requests. */
function isPrivatePath(pathname) {
  const page = pathname.endsWith(".data") ? pathname.slice(0, -5) : pathname;
  const paths = page.startsWith("/zh/") ? [page, page.slice(3)] : [page];
  return paths.some((path) => ["/api", "/admin", "/starred", "/feedback"]
    .some((prefix) => path === prefix || path.startsWith(`${prefix}/`)));
}

/** Anonymous reads of the news site's public images, pages and Router data can use the edge cache. */
export function isCacheEligible(request) {
  if ((request.method !== "GET" && request.method !== "HEAD") || request.headers.has("authorization")) return false;
  if (hasSessionCookie(request.headers.get("cookie"))) return false;
  const { pathname } = new URL(request.url);
  if (routeOf(pathname) !== "news" || isPrivatePath(pathname)) return false;
  // Apply the same exclusions to Router data, including /feed/picks.data and /.well-known/x.data.
  const page = pathname.endsWith(".data") ? pathname.slice(0, -5) : pathname;
  if (["/feed", "/sitemaps", "/assets", "/media", "/.well-known"]
    .some((prefix) => page === prefix || page.startsWith(`${prefix}/`))) return false;
  if (page.startsWith("/rss") || page === "/atom.xml" || page === "/__manifest" || page.startsWith("/contact")) return false;
  return true;
}

/** Require an explicit public shared TTL; personalized or uncacheable responses stay at the origin. */
export function isCacheable(response) {
  if (response.status !== 200 || response.headers.has("set-cookie")) return false;
  const directives = (response.headers.get("cache-control") ?? "").split(",").map((part) => part.trim().toLowerCase());
  const shared = directives.filter((part) => /^s-maxage(?:\s*=|$)/.test(part));
  const age = shared.length === 1 ? /^s-maxage\s*=\s*(?:"(\d+)"|(\d+))$/.exec(shared[0]) : null;
  const ttl = Number(age?.[1] ?? age?.[2] ?? 0);
  const vary = response.headers.get("vary");
  return directives.includes("public") &&
    !directives.some((part) => /^(private|no-store|no-cache)(?:\s*=|$)/.test(part)) &&
    Number.isFinite(ttl) && ttl > 0 &&
    (vary === null || vary.split(",").every((part) => part.trim().toLowerCase() === "accept-encoding"));
}
