import assert from "node:assert/strict";
import { test } from "node:test";
import { isCacheEligible, isCacheable } from "../edge/src/cache.mjs";
import worker from "../edge/src/index.mjs";

const SITE = "https://e-acc.ai";
const ENV = { NEWS_ORIGIN: "https://news.e-accs.com", EDGE_SECRET: "test-secret" };
const PUBLIC = { "cache-control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600" };

function mockEdge(t, respond = () => new Response("news", { headers: PUBLIC })) {
  const entries = new Map();
  const matches = [];
  const puts = [];
  const pending = [];
  const cache = {
    async match(key) {
      matches.push(key);
      return entries.get(key.url)?.clone();
    },
    async put(key, response) {
      puts.push({ key, response });
      entries.set(key.url, response.clone());
    },
  };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "caches");
  Object.defineProperty(globalThis, "caches", { value: { default: cache }, configurable: true });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "caches", previous);
    else delete globalThis.caches;
  });
  const upstream = t.mock.method(globalThis, "fetch", async (...args) => respond(...args));
  return { matches, puts, pending, upstream, ctx: { waitUntil(promise) { pending.push(promise); } } };
}

test("GET and HEAD public news APIs and images are eligible even with cookies", () => {
  for (const method of ["GET", "HEAD"]) {
    for (const path of ["/api/site/hot?lang=en", "/api/img-proxy?u=https%3A%2F%2Fexample.com%2Favatar&sig=a%2Bb", "/og/site.png"]) {
      assert.equal(isCacheEligible(new Request(`${SITE}${path}`, { method, headers: { cookie: "session=admin" } })), true, `${method} ${path}`);
    }
  }
});

test("other paths, methods and Authorization bypass the cache", () => {
  for (const path of ["/", "/hot", "/hot.data", "/api/admin/x", "/api/ingest/x", "/api/mcp", "/feed/picks.xml", "/api/timeline.json", "/api/site", "/og"]) {
    assert.equal(isCacheEligible(new Request(`${SITE}${path}`)), false, path);
  }
  for (const method of ["POST", "PUT", "DELETE", "OPTIONS"]) {
    assert.equal(isCacheEligible(new Request(`${SITE}/api/site/hot`, { method })), false, method);
  }
  for (const authorization of ["Bearer token", ""]) {
    assert.equal(isCacheEligible(new Request(`${SITE}/api/site/hot`, { headers: { authorization } })), false);
  }
});

test("only explicit public shared TTLs and Accept-Encoding variation can be stored", () => {
  for (const control of [
    "public, max-age=30, s-maxage=30",
    PUBLIC["cache-control"],
    "public, max-age=246103, s-maxage=246103",
    "public, max-age=0, s-maxage=30",
    "PUBLIC, S-MAXAGE = 30",
    'public, s-maxage="30"',
  ]) {
    for (const vary of [null, "Accept-Encoding", "accept-encoding", "Accept-Encoding, Accept-Encoding"]) {
      const headers = { "cache-control": control };
      if (vary !== null) headers.vary = vary;
      assert.equal(isCacheable(new Response(null, { headers })), true, `${control}; Vary: ${vary}`);
    }
  }
});

test("missing, forbidden, zero, malformed or ambiguous shared TTLs are not stored", () => {
  for (const control of [
    "", "public, max-age=60", "s-maxage=30", "public, s-maxage=0", "public, s-maxage=-1",
    "public, s-maxage=1.5", "public, s-maxage=abc", "public, s-maxage=30, s-maxage=60",
    "public, s-maxage=30, private", 'public, s-maxage=30, private="Set-Cookie"',
    "public, s-maxage=30, no-store", "public, s-maxage=30, no-cache", 'public, s-maxage=30, no-cache="ETag"',
    "PUBLIC, S-MAXAGE=30, NO-STORE",
  ]) {
    assert.equal(isCacheable(new Response(null, { headers: { "cache-control": control } })), false, control);
  }
});

test("non-200, Set-Cookie and variation beyond Accept-Encoding are not stored", () => {
  for (const status of [201, 206, 302, 304, 404, 500]) {
    assert.equal(isCacheable(new Response(null, { status, headers: PUBLIC })), false, String(status));
  }
  for (const cookie of ["session=admin", ""]) {
    assert.equal(isCacheable(new Response(null, { headers: { ...PUBLIC, "set-cookie": cookie } })), false);
  }
  for (const vary of ["Cookie", "Accept-Language", "*", "Accept-Encoding, Cookie", ""]) {
    assert.equal(isCacheable(new Response(null, { headers: { ...PUBLIC, vary } })), false, vary);
  }
});

test("a public GET is a MISS then a HIT with origin headers and forwarding preserved", async (t) => {
  const headers = { ...PUBLIC, "content-type": "application/json", vary: "Accept-Encoding", etag: '"news-v1"' };
  const edge = mockEdge(t, () => new Response('{"items":[]}', { headers }));
  const url = `${SITE}/api/site/hot?lang=en&at=100&sig=a%2Bb+%2F&at=101`;
  const request = new Request(url, { headers: { cookie: "session=admin", "cf-connecting-ip": "192.0.2.1", "x-eacc-edge": "untrusted" } });
  const first = await worker.fetch(request, ENV, edge.ctx);
  assert.equal(first.headers.get("x-eacc-edge-cache"), "MISS");
  assert.equal(await first.text(), '{"items":[]}');
  await Promise.all(edge.pending);
  assert.equal(edge.pending.length, 1);
  assert.equal(edge.puts.length, 1);
  for (const key of [edge.matches[0], edge.puts[0].key]) {
    assert.equal(key.url, url);
    assert.equal(key.method, "GET");
    assert.deepEqual([...key.headers], []);
  }
  for (const [name, value] of Object.entries(headers)) {
    assert.equal(first.headers.get(name), value);
    assert.equal(edge.puts[0].response.headers.get(name), value);
  }
  const [target, init] = edge.upstream.mock.calls[0].arguments;
  assert.equal(target.href, url.replace(SITE, ENV.NEWS_ORIGIN));
  assert.equal(init.method, "GET");
  assert.equal(init.redirect, "manual");
  assert.equal(init.body, undefined);
  assert.equal(init.headers.get("x-eacc-edge"), ENV.EDGE_SECRET);
  assert.equal(init.headers.get("x-eacc-client-ip"), "192.0.2.1");
  assert.equal(init.headers.get("x-forwarded-host"), "e-acc.ai");
  assert.equal(init.headers.get("cookie"), "session=admin");

  const second = await worker.fetch(new Request(url, { headers: { cookie: "session=visitor", "accept-language": "zh" } }), ENV, edge.ctx);
  assert.equal(second.headers.get("x-eacc-edge-cache"), "HIT");
  assert.equal(await second.text(), '{"items":[]}');
  for (const [name, value] of Object.entries(headers)) assert.equal(second.headers.get(name), value);
  assert.equal(edge.upstream.mock.callCount(), 1);
  assert.equal(edge.puts.length, 1);
});

test("query values, ordering and escaping keep distinct cache entries", async (t) => {
  const edge = mockEdge(t, (url) => new Response(url.search, { headers: PUBLIC }));
  const paths = [
    "/api/site/hot?lang=en&at=1", "/api/site/hot?lang=zh&at=1", "/api/site/hot?lang=en&at=2", "/api/site/hot?at=1&lang=en",
    "/api/img-proxy?u=%2Favatar&sig=a+b", "/api/img-proxy?u=%2Favatar&sig=a%20b", "/api/img-proxy?u=%2favatar&sig=a+b",
  ];
  for (const path of paths) {
    const response = await worker.fetch(new Request(`${SITE}${path}`), ENV, edge.ctx);
    assert.equal(response.headers.get("x-eacc-edge-cache"), "MISS", path);
    assert.equal(await response.text(), path.slice(path.indexOf("?")));
    await Promise.all(edge.pending);
  }
  assert.equal(edge.upstream.mock.callCount(), paths.length);
  assert.deepEqual(edge.puts.map(({ key }) => key.url), paths.map((path) => `${SITE}${path}`));
  const hit = await worker.fetch(new Request(`${SITE}${paths[0]}`), ENV, edge.ctx);
  assert.equal(hit.headers.get("x-eacc-edge-cache"), "HIT");
  assert.equal(edge.upstream.mock.callCount(), paths.length);
});

test("a cold HEAD stays a HEAD at the origin and cannot poison the shared GET entry", async (t) => {
  const edge = mockEdge(t, (_, init) => new Response(init.method === "HEAD" ? null : "news", { headers: { ...PUBLIC, "content-length": "4" } }));
  const url = `${SITE}/og/site.png`;
  const first = await worker.fetch(new Request(url, { method: "HEAD" }), ENV, edge.ctx);
  assert.equal(first.headers.get("x-eacc-edge-cache"), "MISS");
  assert.equal(first.body, null);
  assert.equal(edge.upstream.mock.calls[0].arguments[1].method, "HEAD");
  assert.equal(edge.puts.length, 0);
  assert.equal(edge.pending.length, 0);

  const get = await worker.fetch(new Request(url), ENV, edge.ctx);
  assert.equal(get.headers.get("x-eacc-edge-cache"), "MISS");
  assert.equal(await get.text(), "news");
  await Promise.all(edge.pending);
  const head = await worker.fetch(new Request(url, { method: "HEAD" }), ENV, edge.ctx);
  assert.equal(head.headers.get("x-eacc-edge-cache"), "HIT");
  assert.equal(head.body, null);
  assert.equal(await head.text(), "");
  assert.equal(head.headers.get("content-length"), "4");
  assert.equal(head.headers.get("cache-control"), PUBLIC["cache-control"]);
  assert.equal(edge.upstream.mock.callCount(), 2);
  assert.equal(edge.puts.length, 1);
  assert.ok(edge.matches.every((key) => key.method === "GET"));
});

test("eligible but uncacheable responses remain MISSes with their original status and headers", async (t) => {
  const edge = mockEdge(t, (url) => {
    const kind = url.searchParams.get("kind");
    if (kind === "redirect") return new Response(null, { status: 302, headers: { ...PUBLIC, location: "/hot" } });
    if (kind === "missing") return new Response("missing", { status: 404, headers: PUBLIC });
    const headers = { ...PUBLIC };
    if (kind === "cookie") headers["set-cookie"] = "session=admin";
    if (kind === "vary") headers.vary = "Accept-Language";
    if (kind === "ttl") headers["cache-control"] = "public, max-age=60";
    if (kind === "private") headers["cache-control"] += ", private";
    return new Response("news", { headers });
  });
  for (const kind of ["redirect", "missing", "cookie", "vary", "ttl", "private"]) {
    for (let i = 0; i < 2; i++) {
      const response = await worker.fetch(new Request(`${SITE}/api/site/hot?kind=${kind}`), ENV, edge.ctx);
      assert.equal(response.headers.get("x-eacc-edge-cache"), "MISS", kind);
      assert.equal(response.status, kind === "redirect" ? 302 : kind === "missing" ? 404 : 200);
      if (kind === "redirect") assert.equal(response.headers.get("location"), "/hot");
      if (kind === "cookie") assert.equal(response.headers.get("set-cookie"), "session=admin");
    }
  }
  assert.equal(edge.upstream.mock.callCount(), 12);
  assert.equal(edge.puts.length, 0);
  assert.equal(edge.pending.length, 0);
});

test("HTML, data, private APIs, POSTs and Authorization never touch the cache", async (t) => {
  const edge = mockEdge(t);
  const requests = [
    ...["/", "/hot", "/hot.data", "/api/admin/x", "/api/ingest/x", "/api/mcp", "/feed/picks.xml"].map((path) => new Request(`${SITE}${path}`)),
    new Request(`${SITE}/api/site/hot`, { method: "POST", body: "payload" }),
    new Request(`${SITE}/api/site/hot`, { headers: { authorization: "Bearer token" } }),
  ];
  for (const request of requests) {
    const response = await worker.fetch(request, ENV, edge.ctx);
    assert.equal(response.headers.has("x-eacc-edge-cache"), false);
    assert.equal(await response.text(), "news");
  }
  assert.equal(edge.upstream.mock.callCount(), requests.length);
  assert.equal(edge.matches.length, 0);
  assert.equal(edge.puts.length, 0);
  assert.equal(edge.pending.length, 0);
  const post = edge.upstream.mock.calls[requests.length - 2].arguments[1];
  assert.equal(post.method, "POST");
  assert.equal(post.body, requests[requests.length - 2].body);
  assert.equal(edge.upstream.mock.calls.at(-1).arguments[1].headers.get("authorization"), "Bearer token");
});

test("Pages and merged files keep their existing routing without cache access", async (t) => {
  const edge = mockEdge(t);
  const pages = new Request(`${SITE}/pricing`);
  assert.equal(await (await worker.fetch(pages, ENV, edge.ctx)).text(), "news");
  assert.equal(edge.upstream.mock.calls[0].arguments[0], pages);
  await worker.fetch(new Request(`${SITE}/sitemap-news.xml?ignored=1`), ENV, edge.ctx);
  assert.equal(edge.upstream.mock.calls[1].arguments[0].href, `${ENV.NEWS_ORIGIN}/sitemap.xml`);
  const sitemap = await worker.fetch(new Request(`${SITE}/sitemap.xml`), ENV, edge.ctx);
  assert.match(await sitemap.text(), /<loc>https:\/\/e-acc\.ai\/sitemap-news\.xml<\/loc>/);
  assert.equal(edge.upstream.mock.callCount(), 2);
  assert.equal(edge.matches.length, 0);
  assert.equal(edge.puts.length, 0);
  assert.equal(edge.pending.length, 0);
});

test("a HIT restores the origin's Cache-Control after the zone rewrites max-age", async (t) => {
  const edge = mockEdge(t, () => new Response("hot", { headers: { "cache-control": "public, max-age=30, s-maxage=30" } }));
  const url = `${SITE}/api/site/hot?lang=en`;
  await worker.fetch(new Request(url), ENV, edge.ctx);
  await Promise.all(edge.pending);
  // Cloudflare's Browser Cache TTL raises max-age on the cached copy.
  const stored = edge.puts[0].response;
  stored.headers.set("cache-control", "public, max-age=14400, s-maxage=30");
  globalThis.caches.default.put(edge.puts[0].key, stored);
  const hit = await worker.fetch(new Request(url), ENV, edge.ctx);
  assert.equal(hit.headers.get("x-eacc-edge-cache"), "HIT");
  assert.equal(hit.headers.get("cache-control"), "public, max-age=30, s-maxage=30");
  assert.equal(hit.headers.get("x-eacc-origin-cache-control"), null);
});
