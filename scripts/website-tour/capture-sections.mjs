import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { configureCapture, go } from './browser-tools.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.TOUR_SOURCE_URL || 'http://127.0.0.1:3421';
const output = resolve('public/media/website-tour/images');
mkdirSync(output, { recursive: true });
const routes = { home: '/', resources: '/resources', portal: '/portal', tools: '/portal/tools', announcements: '/announcements', events: '/events', community: '/community', executives: '/executives', gallery: '/gallery', ads: '/ads', navigator: '/campus-navigator', contact: '/contact' };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await configureCapture(context, base, process.env.TOUR_FONT_DIR);
  const page = await context.newPage();
  for (const [name, route] of Object.entries(routes)) {
    await go(page, base, route);
    if (await page.locator('dialog:visible').count()) throw new Error('Unexpected open dialog: ' + route);
    await sharp(await page.screenshot()).resize(960, 675).webp({ quality: 82 }).toFile(resolve(output, name + '.webp'));
  }
} finally { await browser.close(); }
writeFileSync(resolve(output, 'provenance.json'), JSON.stringify({ sourceCommit: 'f7a851aeab4295e002e989db639cf8ec4efc6340', capturedAt: new Date().toISOString(), basis: 'Fresh Chromium captures of the corrected static export, not Stage 1 footage', viewport: { width: 1280, height: 900 }, imageSize: { width: 960, height: 675 }, fontDelivery: 'Existing font families locally fulfilled during private capture; no website styles or content changed', routes }, null, 2) + '\n');
console.log('Captured', Object.keys(routes).length, 'fresh website previews');
