// Optional local smoke test. Requires independently available Playwright + Chromium; no app dependency.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('out');
const reviewRoot = process.env.CAMPUS_REVIEW_DIR || '/tmp/campus-navigator-directory-first-review';
fs.mkdirSync(reviewRoot, { recursive: true });
const screenshots = [];
async function capture(page, name, description) {
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(reviewRoot, name), fullPage: true, animations: 'disabled' });
  screenshots.push({ name, description });
}

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
      const prefix = viewport.width < 760 ? 'mobile' : 'desktop';
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
      assert.equal(tileRequests, 0, 'No tile requests without verified destinations');
      await capture(page, `${prefix}-main.png`, 'Main directory-first view with verification counts');
      await cards.filter({ hasText: 'Department of Pharmacology' }).click();
      assert.equal(await page.locator('#destination-details-heading').textContent(), 'Department of Pharmacology');
      await page.getByLabel('Search the directory').fill('PHARMACOLOGY');
      await page.waitForFunction(() => document.querySelectorAll('button[aria-controls="navigator-details"]').length === 1);
      assert.equal(await cards.count(), 1);
      await capture(page, `${prefix}-search.png`, 'Search results and matching directory entry');
      await page.getByLabel('Search the directory').fill('<script>no match</script>');
      await page.getByRole('heading', { name: 'No matching records', exact: true }).waitFor();
      assert.equal(await cards.count(), 0);
      assert.equal(await page.locator('#destination-details-heading').count(), 0);
      await capture(page, `${prefix}-no-results.png`, 'Empty search results and reset action');
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
      assert.equal(await cards.count(), 2);
      await page.getByLabel('Category', { exact: true }).selectOption('Department');
      await page.waitForFunction(() => document.querySelectorAll('button[aria-controls="navigator-details"]').length === 1);
      assert.equal(await cards.count(), 1);
      await capture(page, `${prefix}-category-filter.png`, 'Department category filter');
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
      await page.getByLabel('Verification', { exact: true }).selectOption('Verified records');
      await page.getByRole('heading', { name: 'No matching records', exact: true }).waitFor();
      assert.equal(await cards.count(), 0, 'Candidates must not appear under verified records');
      await capture(page, `${prefix}-verified-filter-empty.png`, 'Verified-only filter honestly shows no verified records');
      await page.getByLabel('Verification', { exact: true }).selectOption('Candidates awaiting review');
      await page.waitForFunction(() => document.querySelectorAll('button[aria-controls="navigator-details"]').length === 2);
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
      await page.getByLabel('Department', { exact: true }).selectOption('Department of Pharmacology');
      assert.equal(await cards.count(), 1);
      assert.equal(await page.getByLabel('Faculty', { exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
      await cards.filter({ hasText: 'Department of Pharmacology' }).click();
      await page.getByText('Exact campus location awaiting verification.', { exact: true }).waitFor();
      await capture(page, `${prefix}-selected-details.png`, 'Selected candidate with source notes and missing information disclosed');
      assert.equal(await page.getByRole('link', { name: /External directions/ }).count(), 0);
      for (const link of await page.locator('#navigator-details a').all()) {
        assert.match(await link.getAttribute('href'), /^https:\/\//);
        assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
      }
      if (viewport.width < 760) {
        await page.getByRole('group', { name: 'Navigator view' }).getByRole('button', { name: 'Map', exact: true }).click();
        assert.equal(await page.getByLabel('Search the directory').isVisible(), false);
      }
      await page.getByRole('heading', { name: 'No verified destinations to map yet', exact: true }).waitFor();
      assert.equal(await page.locator('.leaflet-container').count(), 0);
      assert.equal(await page.locator('.leaflet-marker-icon').count(), 0);
      assert.equal(await page.getByRole('button', { name: /Load interactive map/ }).count(), 0);
      assert.equal(await page.getByTitle('Zoom in', { exact: true }).count(), 0);
      assert.equal(tileRequests, 0, 'An empty campus map must not contact tile services');
      await capture(page, `${prefix}-map-empty.png`, 'Informative mapping status without misleading navigation controls');
      if (viewport.width < 760) {
        await page.getByRole('button', { name: 'Browse directory', exact: true }).click();
        assert.equal(await page.getByLabel('Search the directory').isVisible(), true);
        assert.equal(await page.locator('#destination-details-heading').textContent(), 'Department of Pharmacology');
        await page.waitForFunction(() => document.activeElement?.id === 'campus-directory-search');
        assert.equal(await page.getByLabel('Search the directory').evaluate(input => document.activeElement === input), true);
        await capture(page, 'mobile-return-directory.png', 'Return from Map to Directory with selected record preserved');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Horizontal overflow');
      for (const text of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(text);
      assert.deepEqual(errors, [], 'Uncaught runtime errors');

      console.log(`PASS ${viewport.width}x${viewport.height}: search/filter/selection/empty reset, unknown-position disclosure, safe source links, verification filters, no empty-map controls or tile requests, mobile views, zero unverified markers, JSON-LD, no overflow/runtime errors.`);
      await context.close();
    }
    fs.writeFileSync(path.join(reviewRoot, 'manifest.json'), JSON.stringify({ screenshots, verifiedEntries: 0, candidates: 2, markers: 0, thirdPartyRequestsBlocked: true, note: 'Actual production-export screenshots; fonts may fall back because third-party fonts are blocked. No campus location data was fabricated.' }, null, 2) + '\n');
    fs.writeFileSync(path.join(reviewRoot, 'REVIEW.md'), '# Campus Navigator directory-first review\n\nActual production-export screenshots, with third-party fonts and analytics blocked. No development indicator or mock map data.\n\nCurrent dataset: **0 verified records, 2 candidates, 0 map markers**. The directory is interactive; the Map view explains pending verification without exposing empty-map navigation controls.\n\n' + screenshots.map(shot => `- [${shot.description}](${path.join(reviewRoot, shot.name)})`).join('\n') + '\n');
    console.log('Review screenshots saved to', reviewRoot);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
