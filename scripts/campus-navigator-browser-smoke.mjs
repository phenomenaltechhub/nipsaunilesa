// Optional local smoke test. Requires independently available Playwright + Chromium; no app dependency.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('out');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const candidates = req.headers.rsc === '1' ? [target + '.txt', target] : [target, target + '.html', path.join(target, 'index.html')];
  const file = candidates.find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  if (!file) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    for (const viewport of [{ width: 1440, height: 1100 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport });
      let tileRequests = 0;
      await context.route('**/*', route => {
        if (route.request().url().startsWith('https://tile.openstreetmap.org/')) tileRequests++;
        return route.request().url().startsWith(base) ? route.continue() : route.abort();
      });
      await context.addInitScript(() => localStorage.setItem('nipsa-guided-tour-dismissed', 'true'));
      const page = await context.newPage();
      const errors = [];page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(base + '/campus-navigator', { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.match(await page.title(), /Campus Navigator/);
      const cards = page.locator('button[aria-controls="navigator-details"]');
      assert.equal(await cards.count(), 2);
      assert.equal(tileRequests, 0, 'Tile service must not be contacted before consent');
      await cards.filter({ hasText: 'Department of Pharmacology' }).click();
      assert.equal(await page.locator('#destination-details-heading').textContent(), 'Department of Pharmacology');
      await page.getByLabel('Search the directory').fill('PHARMACOLOGY');
      assert.equal(await cards.count(), 1);
      await page.getByLabel('Search the directory').fill('<script>no match</script>');
      await page.getByRole('heading', { name: 'No matching records', exact: true }).waitFor();
      assert.equal(await cards.count(), 0);
      assert.equal(await page.locator('#destination-details-heading').count(), 0);
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
      assert.equal(await cards.count(), 2);
      await page.getByLabel('Category', { exact: true }).selectOption('Department');
      assert.equal(await cards.count(), 1);
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
      await page.getByLabel('Department', { exact: true }).selectOption('Department of Pharmacology');
      assert.equal(await cards.count(), 1);
      assert.equal(await page.getByLabel('Faculty', { exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
      await page.getByText('Exact campus location awaiting verification.', { exact: true }).waitFor();
      assert.equal(await page.getByRole('link', { name: /External directions/ }).count(), 0);
      for (const link of await page.locator('#navigator-details a').all()) {
        assert.match(await link.getAttribute('href'), /^https:\/\//);
        assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
      }
      if (viewport.width < 760) {
        await page.getByRole('group', { name: 'Navigator view' }).getByRole('button', { name: 'Map', exact: true }).click();
        assert.equal(await page.getByLabel('Search the directory').isVisible(), false);
      }
      await page.getByRole('button', { name: 'Load interactive map', exact: false }).click();
      await page.locator('.leaflet-container').waitFor();
      await page.getByText(/Some map tiles could not load/).waitFor();
      assert.ok(tileRequests > 0);
      assert.equal(await page.locator('.leaflet-marker-icon').count(), 0, 'Unverified positions must not yield markers');
      await page.getByTitle('Zoom in', { exact: true }).click();
      await page.getByRole('button', { name: 'Retry map', exact: true }).click();
      await page.getByText(/Some map tiles could not load/).waitFor();
      await page.getByText(/World reference map/).waitFor();
      assert.ok(await page.locator('a[href="https://www.openstreetmap.org/copyright"]').count());
      if (viewport.width < 760) {
        await page.getByRole('group', { name: 'Navigator view' }).getByRole('button', { name: 'Directory', exact: true }).click();
        assert.equal(await page.getByLabel('Search the directory').isVisible(), true);
        await cards.filter({ hasText: 'Department of Pharmacology' }).click();
        assert.equal(await page.locator('#destination-details-heading').textContent(), 'Department of Pharmacology');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow');
      for (const text of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(text);
      assert.deepEqual(errors, [], 'Uncaught runtime errors');
      await page.screenshot({ path: `/tmp/campus-preview-${viewport.width}.png`, fullPage: true });
      console.log(`PASS ${viewport.width}x${viewport.height}: search/filter/selection/empty reset, unknown-position disclosure, safe source links, map consent/zoom, tile failure/retry, mobile views, zero unverified markers, JSON-LD, no overflow/runtime errors.`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
