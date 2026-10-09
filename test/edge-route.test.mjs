// The edge router must keep every file this site serves on Pages (ADR-0006): indexed pages, their .html
// spellings, assets, data and feeds. Only the root, the news site's routes and the merged files leave.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { routeOf } from "../edge/src/route.mjs";

const SITE_DIR = join(import.meta.dirname, "..", "site");
const MERGED = ["/sitemap.xml", "/robots.txt", "/llms.txt"];
/** Generated here still (the rollback copy), served by the news site. */
const MOVED = ["/what-is-eacc", "/eacc-vs-dacc", "/eacc-glossary"];

test("every file of the static site is still served by Pages", () => {
  const files = readdirSync(SITE_DIR, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => `/${join(d.parentPath ?? d.path, d.name).slice(SITE_DIR.length + 1).split("\\").join("/")}`)
    .filter((p) => !MERGED.includes(p));
  assert.ok(files.length > 40, `walked the site (${files.length} files)`);
  for (const path of files) {
    assert.equal(routeOf(path), "pages", path);
    // Pages serves page.html as /page too (and redirects page.html there).
    if (path.endsWith(".html") && !MOVED.includes(path.slice(0, -5))) assert.equal(routeOf(path.slice(0, -5)), "pages", path.slice(0, -5));
  }
});

test("every sitemap URL is still served by Pages", () => {
  const locs = [...readFileSync(join(SITE_DIR, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/e-acc\.ai([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.includes("/terminal"), "the former homepage moved to /terminal");
  for (const path of locs) assert.equal(routeOf(path), "pages", path);
  for (const path of MOVED) assert.ok(!locs.includes(path), `${path} is listed by the news site's sitemap`);
});

test("the e/acc concept pages go to the news site at their original addresses", () => {
  for (const path of [...MOVED, "/what-is-eacc/", "/what-is-eacc.data"]) assert.equal(routeOf(path), "news", path);
});

test("the root and the news site's own paths go to the news site", () => {
  for (const path of [
    "/", "/daily", "/daily/2026-10-01", "/items/abc123", "/hot", "/topics/openai", "/subscribe", "/admin/login",
    "/chronicle", "/chronicle.data", "/products", "/products/", "/products.data",
    "/assets/entry-123.js", "/media/hero-16x9.mp4", "/media/fonts/InstrumentSerif-Italic.woff2",
    "/_root.data", "/daily.data", "/__manifest", "/api/site/timeline", "/api/v1/items", "/api/mcp",
    "/api/site/newsletter/subscribe", "/feed/picks.xml", "/feed/all.xml", "/og/pages/about.png", "/favicon.ico",
  ]) {
    assert.equal(routeOf(path), "news", path);
  }
});

test("shared names stay with this site or are merged", () => {
  assert.equal(routeOf("/feed.xml"), "pages", "the acceleration-log feed keeps its address");
  assert.equal(routeOf("/api"), "pages");
  assert.equal(routeOf("/api/timeline.json"), "pages");
  assert.equal(routeOf("/fonts/x.woff2"), "pages");
  for (const path of MERGED) assert.equal(routeOf(path), "merged", path);
  assert.equal(routeOf("/some-future-product"), "pages", "unknown paths default to this site");
});
