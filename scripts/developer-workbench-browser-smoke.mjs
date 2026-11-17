import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startStaticServer } from './lib/static-server.mjs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const directory = process.env.PHARMAIDEIA_REVIEW_DIR || '/workspace/artifacts/pharmaideia-m3'; await fs.mkdir(directory, { recursive: true });
const { server, base } = await startStaticServer(path.resolve('.'), 0, ['/developer-tools/', '/student-pwa/src/', '/student-pwa/styles/', '/student-pwa/assets/']);
for (const file of ['/package.json', '/.git/config', '/student-pwa/src/.env', '/design-review/milestone-3/comparison.html']) assert.equal((await fetch(base + file)).status, 403, 'Developer server enforces its file boundary');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); const accessibility = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport }); const page = await context.newPage(); const errors = []; const external = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('request', request => { if (!request.url().startsWith(base)) external.push(request.url()); });
    await page.goto(base + '/developer-tools/index.html', { waitUntil: 'networkidle' });
    assert.equal(await page.getByRole('cell', { name: 'AUTH-001', exact: true }).count(), 1);
    await page.screenshot({ path: path.join(directory, `developer-diagnostics-${viewport.width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'Open academic content workbench' }).click();
    await page.getByLabel('Proposed course code', { exact: true }).fill('TEST101');
    await page.getByLabel('Proposed course title', { exact: true }).fill('Local browser test proposal');
    await page.getByLabel('Proposed units', { exact: true }).fill('2');
    await page.getByLabel('Proposed academic session',{exact:true}).fill('2026/2027');
    await page.getByLabel('Proposed semester',{exact:true}).selectOption('first');
    await page.getByLabel('Source reference (HTTPS)', { exact: true }).fill('https://example.invalid/evidence');
    await page.getByRole('button', { name: 'Prepare local proposal', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Not reviewed, saved remotely or published.' }).waitFor();
    const tabs = page.getByRole('tablist', { name: 'Academic preparation sections' });
    await tabs.getByRole('tab', { name: 'Resource', exact: true }).click();
    await page.getByLabel('Prepared course', { exact: true }).selectOption('1');
    await page.getByLabel('Resource title', { exact: true }).fill('<img src=x onerror=alert(1)>');
    await page.getByLabel('Google Drive or Docs link', { exact: true }).fill('https://drive.google.com/file/d/test_resource_identifier_01/view?usp=sharing');
    await page.getByRole('button', { name: 'Prepare local proposal', exact: true }).click();
    await tabs.getByRole('tab', { name: 'Schedule & deadlines', exact: true }).click();
    for (const [start, end] of [['09:00', '10:00'], ['09:30', '10:30']]) {
      for (const [label, value] of [['Proposed event title', 'Local browser test event'], ['Proposed date', '2026-11-17'], ['Start or deadline time', start], ['End time (required for classes/exams)', end], ['Source reference (HTTPS)', 'https://example.invalid/evidence']]) await page.getByLabel(label, { exact: true }).fill(value);
      await page.getByLabel('Prepared course', { exact: true }).selectOption('1'); await page.getByRole('button', { name: 'Prepare local proposal', exact: true }).click();
    }
    await page.getByRole('alert').filter({ hasText: 'Conflicting' }).waitFor();
    await page.evaluate(await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8'));
    const result = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] } }); return { violations: r.violations.map(item => item.id), incomplete: r.incomplete.map(item => item.id) }; }); accessibility.push({ viewport, ...result }); assert.deepEqual(result.violations, []);
    await tabs.getByRole('tab', { name: 'Prepared items', exact: true }).click(); await page.getByRole('link', { name: 'Inspect prepared course hub →' }).click();
    await page.getByRole('tab', { name: 'Schedule', exact: true }).click();
    assert.equal(await page.getByRole('heading', { name: 'Local browser test event', exact: true }).count(), 1);
    assert.equal(await page.getByRole('heading', { name: 'No timetable entries', exact: true }).count(), 0, 'Prepared events replace the empty state');
    await page.getByRole('tab', { name: 'Materials', exact: true }).click(); assert.equal(await page.locator('.prepared-course img').count(), 0);
    const link = page.getByRole('link', { name: 'Google Drive resource (external)', exact: true }); assert.equal(await link.getAttribute('rel'), 'noopener noreferrer'); assert.equal(await link.getAttribute('href'), 'https://drive.google.com/file/d/test_resource_identifier_01/view');
    await page.getByLabel('Course resource category', { exact: true }).selectOption('practical'); await page.getByRole('status').filter({ hasText: '0 local resource proposals' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller), null);
    await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('heading', { name: 'No course selected', exact: true }).first().waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log(`PASS developer workbench ${viewport.width}px: metadata preparation, same-level conflict feedback, safe resource filtering, no persistence/service worker, server file boundaries and axe checks.`); await context.close();
  }
  await fs.writeFile(path.join(directory, 'developer-accessibility.json'), JSON.stringify(accessibility, null, 2) + '\n');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
