// Records real local controls; no injected app state, fake course or student data.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { startStaticServer } from './lib/static-server.mjs';
const require = createRequire(import.meta.url);
let temporaryTools = null;
// Linux cloud fallback: use the existing system encoder through Playwright's
// supported per-process browser-cache path. No download/global install needed.
if (process.platform === 'linux' && !process.env.PLAYWRIGHT_BROWSERS_PATH) {
  const packageRoot = path.dirname(require.resolve('playwright-core/package.json'));
  const metadata = JSON.parse(await fs.readFile(path.join(packageRoot, 'browsers.json'), 'utf8'));
  const revision = metadata.browsers.find(item => item.name === 'ffmpeg').revision;
  const bundled = path.join(os.homedir(), '.cache/ms-playwright', `ffmpeg-${revision}`, 'ffmpeg-linux');
  const exists = async file => fs.access(file).then(() => true, () => false);
  if (!await exists(bundled) && await exists('/usr/bin/ffmpeg')) {
    temporaryTools = await fs.mkdtemp(path.join(os.tmpdir(), 'pharmaideia-recorder-'));
    const encoderDirectory = path.join(temporaryTools, `ffmpeg-${revision}`);
    await fs.mkdir(encoderDirectory); await fs.symlink('/usr/bin/ffmpeg', path.join(encoderDirectory, 'ffmpeg-linux'));
    process.env.PLAYWRIGHT_BROWSERS_PATH = temporaryTools;
    console.log('Using the existing system FFmpeg encoder in a temporary recorder directory.');
  }
}
const { chromium } = require('playwright');
const directory = process.env.PHARMAIDEIA_REVIEW_DIR || '/workspace/artifacts/pharmaideia-m2';
await fs.mkdir(directory, { recursive: true });
const { server, base } = await startStaticServer(path.resolve('student-pwa'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'], slowMo: 180 });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', recordVideo: { dir: directory, size: { width: 390, height: 844 } } });
  const page = await context.newPage(); const video = page.video();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Open your study planner →', exact: true }).click();
  await page.getByLabel('Study task', { exact: true }).fill('Review my approved notes');
  await page.getByLabel('Target date (optional)', { exact: true }).fill('2026-12-01');
  await page.getByRole('button', { name: 'Add study task', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Review my approved notes', exact: true }).check();
  await page.waitForTimeout(1000);
  const switcher = page.getByRole('group', { name: 'Planner view' });
  await switcher.getByRole('button', { name: 'Focus session', exact: true }).click();
  await page.getByLabel('Session length').selectOption('15');
  await page.getByRole('button', { name: 'Start session', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Pause session', exact: true }).click();
  await page.waitForTimeout(800);
  await switcher.getByRole('button', { name: 'Personal plan', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Review my approved notes', exact: true }).waitFor();
  await page.waitForTimeout(1000);
  await context.close();
  const file = path.join(directory, 'planner-walkthrough.webm'); await video.saveAs(file);
  const original = await video.path(); if (original !== file) await fs.unlink(original);
  console.log('Recorded actual mobile planner interactions:', file);
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  if (temporaryTools) { await fs.rm(temporaryTools, { recursive: true, force: true }); delete process.env.PLAYWRIGHT_BROWSERS_PATH; }
}
