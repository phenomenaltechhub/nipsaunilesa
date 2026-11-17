import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startStaticServer } from './lib/static-server.mjs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const root = path.resolve('design-review/milestone-3'); const exports = path.join(root, 'exports');
await fs.mkdir(exports, { recursive: true });
const { server, base } = await startStaticServer(path.resolve('.'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const reports = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' }); const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [name, url] of [['pharmaideia', '/student-pwa/'], ['editorial-proposal', '/design-review/milestone-3/editorial/proposal.html']]) {
      assert.equal((await page.goto(base + url, { waitUntil: 'networkidle' })).status(), 200);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('h1').count(), 1);
      await page.screenshot({ path: path.join(exports, `${name}-${viewport.width === 390 ? 'mobile' : 'desktop'}.png`), fullPage: true, animations: 'disabled' });
      if (name === 'editorial-proposal') {
        assert.equal(await page.locator('form,script,button').count(), 0, 'Read-only specification is not a duplicate publishing system');
        if (viewport.width === 390) { await page.getByText('Proposed navigation', { exact: true }).click(); await page.getByRole('navigation', { name: 'Mobile proposal sections' }).getByRole('link', { name: 'Review Queue', exact: true }).click(); }
        await page.evaluate(await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8'));
        const result = await page.evaluate(async () => { const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return { violations: result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })), incomplete: result.incomplete.map(item => item.id) }; });
        reports.push({ viewport, ...result }); assert.deepEqual(result.violations, []);
      }
    }
    assert.deepEqual(errors, []); await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1200 } });
  await page.goto(base + '/design-review/milestone-3/comparison.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(exports, 'editorial-layout-comparison.png'), fullPage: true });
  await fs.writeFile(path.join(root, 'editorial-accessibility.json'), JSON.stringify(reports, null, 2) + '\n');
  const artifact = '/workspace/artifacts/pharmaideia-m3/design-review'; await fs.mkdir(artifact, { recursive: true });
  await fs.cp(exports, artifact, { recursive: true });
  await fs.writeFile(path.join(artifact, 'REVIEW.md'), '# M3 logo and editorial review\n\nAll logo variants are unselected original artwork. Context screens are explicitly branding mockups. Editorial images are a read-only proposal; existing source is unavailable and no real before screenshot is fabricated. Pharmaideia desktop/mobile images show the actual running app. No production publication occurred.\n\n' + (await fs.readdir(exports)).filter(name => name.endsWith('.png')).map(name => `- [${name}](${path.join(artifact, name)})`).join('\n') + '\n');
  console.log('Captured real PWA and labelled editorial proposals on desktop/mobile; proposal accessibility passed. Review exports:', artifact);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
