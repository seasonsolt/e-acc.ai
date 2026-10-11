/** Only anonymous reads of the news site's public APIs and images use the edge cache. */
export function isCacheEligible(request) {
  if ((request.method !== "GET" && request.method !== "HEAD") || request.headers.has("authorization")) return false;
  const { pathname } = new URL(request.url);
  return pathname.startsWith("/api/site/") || pathname.startsWith("/api/img-proxy") || pathname.startsWith("/og/");
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
