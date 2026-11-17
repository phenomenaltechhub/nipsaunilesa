import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../student-pwa/src/state/routes.js';
import { InfrastructureUnavailableError, requestStudentServices, availability } from '../student-pwa/src/api/services.js';
import { createFocus, startFocus, pauseFocus, remainingTime, formatTime } from '../student-pwa/src/modules/study/focus.js';
import { publicAssets, publicCacheKey } from '../student-pwa/src/pwa/cache-policy.js';

test('PWA local navigation rejects external URLs, encoded module paths and unknown roles', () => {
  assert.equal(resolveRoute('')?.id, 'home');
  assert.equal(resolveRoute('#/courses')?.id, 'courses');
  for (const value of ['#/admin', '#/academic-preparation', '#/diagnostics', '#/300', '#/../../secrets', '#/https://example.org', 'javascript:alert(1)', '#/%63ourses', '#/home?role=administrator']) assert.equal(resolveRoute(value), null);
});
test('student service boundary fails closed without any network request or simulated login', async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Unexpected network request'); };
  try { await assert.rejects(requestStudentServices(), InfrastructureUnavailableError); assert.equal(requests, 0); }
  finally { globalThis.fetch = original; }
  assert.equal(availability.roleManagement, 'infrastructure-blocked');
  assert.equal(availability.community, 'infrastructure-blocked-pre-launch-required');
});
test('offline cache excludes sensitive, foreign, query, mutation and credential-bearing requests', () => {
  const scope = 'https://example.org/student-pwa/';
  const request = (url, extra = {}) => ({ url: new URL(url, scope).href, method: 'GET', headers: new Headers(), ...extra });
  assert.equal(publicCacheKey(request('./'), scope), scope);
  assert.equal(publicCacheKey(request('./styles/app.css'), scope), scope + 'styles/app.css');
  for (const url of ['./api/me', './api/payments', './exports/records.csv', './materials/course.pdf', './messages', '../index.html', 'https://example.net/student-pwa/', './?token=test', './index.html?level=300']) assert.equal(publicCacheKey(request(url), scope), null);
  for (const extra of [{ method: 'POST' }, { method: 'HEAD' }, { credentials: 'include' }, { headers: new Headers({ authorization: 'test-fixture-only' }) }, { headers: new Headers({ range: 'bytes=0-10' }) }]) assert.equal(publicCacheKey(request('./', extra), scope), null);
  assert.equal(new Set(publicAssets).size, publicAssets.length);
});
test('offline scope is portable when served on its own host or a nested directory', () => {
  for (const scope of ['https://example.org/', 'https://example.org/student-pwa/']) assert.equal(publicCacheKey({ url: scope + 'index.html', method: 'GET', headers: new Headers() }, scope), scope + 'index.html');
});
test('browser credential-capable navigation receives only the credential-free public shell', () => {
  const scope = 'https://example.org/student-pwa/';
  const request = { url: scope, method: 'GET', credentials: 'include', mode: 'navigate', headers: new Headers() };
  assert.equal(publicCacheKey(request, scope), scope);
  assert.equal(publicCacheKey({ ...request, url: scope + 'index.html' }, scope), scope + 'index.html');
  assert.equal(publicCacheKey({ ...request, url: scope + '#/home' }, scope), scope);
  assert.equal(publicCacheKey({ ...request, url: scope + 'index.html#/planner' }, scope), scope + 'index.html');
  for (const suffix of ['api/me', 'index.html?session=test', 'src/app.js', 'materials/private.pdf']) assert.equal(publicCacheKey({ ...request, url: scope + suffix }, scope), null);
  assert.equal(publicCacheKey({ ...request, headers: new Headers({ authorization: 'test-fixture-only' }) }, scope), null);
});
test('focus timer measures elapsed time across throttled background ticks', () => {
  const initial = createFocus(15);
  const running = startFocus(initial, 1000);
  assert.equal(remainingTime(running, 61_000), 14 * 60_000);
  assert.equal(startFocus(running, 30_000), running, 'Repeated start does not extend a session');
  assert.equal(remainingTime(running, 2_000_000), 0);
});
test('focus pause and resume retain remaining time without counting paused intervals', () => {
  const paused = pauseFocus(startFocus(createFocus(25), 0), 60_000);
  assert.equal(paused.remaining, 24 * 60_000);
  assert.equal(remainingTime(paused, 2_000_000), 24 * 60_000);
  const resumed = startFocus(paused, 2_000_000);
  assert.equal(remainingTime(resumed, 2_060_000), 23 * 60_000);
  assert.equal(formatTime(remainingTime(resumed, 2_060_000)), '23:00');
});
test('focus timer validates durations and formats expiry without negative output', () => {
  for (const value of [0, -5, 24, Infinity, NaN, '25']) assert.throws(() => createFocus(value), RangeError);
  assert.equal(formatTime(-500), '00:00');
  assert.equal(formatTime(1001), '00:02');
  const finished = pauseFocus(startFocus(createFocus(15), 0), 900_001);
  assert.equal(startFocus(finished, 1_000_000).deadline, null);
});
