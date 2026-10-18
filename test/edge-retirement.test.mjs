import assert from "node:assert/strict";
import { test } from "node:test";
import { routeOf } from "../edge/src/route.mjs";
import worker from "../edge/src/index.mjs";

const RETIRED = ["/coding-plan", "/coding-plan.html", "/coding-plan.js", "/lib/codingplan.mjs", "/data/coding-plans.json", "/guard.js"];

test("deleted tool pages and assets are retired without taking other tools offline", () => {
  for (const path of RETIRED) {
    assert.equal(routeOf(path), "gone", path);
    assert.equal(routeOf(`${path}/`), "gone", `${path}/`);
  }
  for (const path of ["/pricing", "/calculator", "/benchmark", "/coding-plan-other", "/lib/tokenmath.mjs"]) {
    assert.equal(routeOf(path), "pages", path);
  }
  assert.equal(routeOf("/subscribe"), "news");
});

test("the Worker returns uncached noindex 410s without fetching a stale origin or cache", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("must not reach an origin"); });
  // No environment or cache binding: retirement must complete before either is consulted.
  for (const path of RETIRED) {
    for (const suffix of ["", "/", "?retired=97d54e3", "/?retired=97d54e3"]) {
      for (const method of ["GET", "HEAD", "POST"]) {
        const request = new Request(`https://e-acc.ai${path}${suffix}`, { method });
        const response = await worker.fetch(request);
        assert.equal(response.status, 410, `${method} ${path}${suffix}`);
        assert.equal(response.headers.get("cache-control"), "no-store");
        assert.equal(response.headers.get("x-robots-tag"), "noindex");
        assert.match(response.headers.get("content-type"), /text\/plain/);
        assert.equal(await response.text(), method === "HEAD" ? "" : "This tool has been retired.\n");
      }
    }
  }
  assert.equal(fetch.mock.callCount(), 0);
});
