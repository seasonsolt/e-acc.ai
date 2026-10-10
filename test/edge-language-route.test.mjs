import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routeOf } from '../edge/src/route.mjs';

test('Chinese news editions preserve English news and Pages ownership', () => {
  for (const path of ['/zh', '/zh/', '/zh/all', '/zh/items/example', '/zh/story/example', '/zh/daily/2026-10-10', '/zh/topics/openai/page/2', '/zh/leaderboard', '/zh/subscribe']) {
    assert.equal(routeOf(path), 'news', path);
  }
  for (const path of ['/_.data', '/zh.data', '/zh/_.data', '/zh/all.data', '/zh/items/example.data', '/what-is-eacc.data']) {
    assert.equal(routeOf(path), 'news', path);
  }
  for (const path of ['/pricing', '/calculator', '/coding-plan', '/terminal', '/zh/pricing', '/zh/what-is-eacc', '/zh/assets/file.js', '/zh/api/site/timeline']) {
    assert.equal(routeOf(path), 'pages', path);
  }
});
