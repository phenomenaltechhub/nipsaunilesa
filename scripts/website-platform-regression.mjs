import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { startStaticServer } from './lib/static-server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('out');
const directory = process.env.PHARMAIDEIA_REVIEW_DIR || '/workspace/artifacts/pharmaideia-m1/website-regression';
await fs.mkdir(directory, { recursive: true });
const { server, base } = await startStaticServer(root);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const checksum = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  for (const viewport of [{ width: 1440, height: 1050 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    await context.addInitScript(() => localStorage.setItem('nipsa-guided-tour-dismissed', 'true'));
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/portal', '/resources', '/ads', '/gallery', '/campus-navigator']) {
      assert.equal((await page.goto(base + route, { waitUntil: 'networkidle' })).status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow: ${route}`);
    }
    const feed = await (await page.request.get(base + '/pharmaideia-content.json')).json();
    assert.equal(feed.schemaVersion, 1);
    assert.ok(feed.items.length > 0);
    const destination = feed.items.filter(item => item.kind === 'directory-record').at(-1);
    assert.ok(destination);
    await page.goto(base + new URL(destination.url).pathname + new URL(destination.url).search, {waitUntil:'networkidle'});
    await page.locator('#destination-details-heading').filter({hasText:destination.title}).waitFor();
    if(destination.verification==='candidate') await page.getByText('Candidate · source review pending',{exact:true}).first().waitFor();
    await page.screenshot({path:path.join(directory,viewport.width+'-navigator-reference.png'),fullPage:true,animations:'disabled'});
    console.log(`PASS ${viewport.width}px public reference feed: actual metadata and directory deep link, candidate status retained.`);
    for (const slug of ['100-level-physics-practical-01', '100-level-biology-practical']) {
      await page.goto(base + '/gallery/' + slug, { waitUntil: 'networkidle' });
      const dialog = page.getByRole('dialog'); await dialog.waitFor();
      const image = dialog.locator('img');
      await image.evaluate(async node => { await node.decode(); });
      const source = await image.getAttribute('src');
      const original = path.join(root, new URL(source, base).pathname);
      const originalBytes = await fs.readFile(original); const before = checksum(originalBytes);
      const meta = await sharp(originalBytes).metadata();
      const control = await image.evaluate(async node => {
        const canvas = document.createElement('canvas'); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
        canvas.getContext('2d').drawImage(node, 0, 0);
        const value = canvas.toDataURL('image/jpeg', .92); canvas.width = 0; canvas.height = 0; return value.split(',')[1];
      });
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download image', exact: true }).click()]);
      assert.match(download.suggestedFilename(), /^[a-z0-9-]+-nipsa\.jpg$/i);
      const file = path.join(directory, `${viewport.width}-${slug}-nipsa.jpg`); await download.saveAs(file);
      const outputMeta = await sharp(file).metadata();
      assert.equal(outputMeta.format, 'jpeg'); assert.equal(outputMeta.width, meta.width); assert.equal(outputMeta.height, meta.height);
      const decoded = await sharp(file).removeAlpha().raw().toBuffer();
      const baseline = await sharp(Buffer.from(control, 'base64')).removeAlpha().raw().toBuffer();
      const unchangedTop = Math.floor(meta.height * .55) * meta.width * 3;
      assert.ok(decoded.subarray(0, unchangedTop).equals(baseline.subarray(0, unchangedTop)), 'Original top pixels preserved against identical unwatermarked Canvas JPEG control');
      let changedChannels = 0;
      for (let offset = Math.floor(meta.height * .65) * meta.width * 3; offset < decoded.length; offset++) if (Math.abs(decoded[offset] - baseline[offset]) > 10) changedChannels++;
      assert.ok(changedChannels > 100, 'Downloaded image contains actual bottom watermark changes');
      assert.equal(checksum(await fs.readFile(original)), before, 'Original source file byte-for-byte unchanged');
      assert.equal(await image.getAttribute('src'), source, 'Displayed source unchanged');
      assert.equal(await page.locator('.gallery-download-error').count(), 0);
      console.log(`PASS ${viewport.width}px gallery ${slug}: ${meta.width}x${meta.height} valid JPEG, watermark pixels differ from Canvas control, original bytes/top content preserved.`);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS website ${viewport.width}px: home, Portal, resources, Ads, gallery and Navigator; no overflow or uncaught runtime errors.`);
    await context.close();
  }
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
