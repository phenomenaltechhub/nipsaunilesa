// Optional production/QA tooling; Playwright is installed outside application dependencies.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export async function configureCapture(context, base, fontDirectory) {
  let fonts = '';
  if (fontDirectory) {
    fonts = readFileSync(resolve(fontDirectory, 'fonts.css'), 'utf8').replace(/url\("([^"]+)"\)/g,
      (_, file) => `url("data:font/woff2;base64,${readFileSync(resolve(fontDirectory, file)).toString('base64')}")`);
  }
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(base + '/')) return route.continue();
    if (fonts && url.startsWith('https://fonts.googleapis.com/')) return route.fulfill({ contentType: 'text/css', body: fonts });
    if (url.includes('googletagmanager.com')) return route.fulfill({ contentType: 'application/javascript', body: '/* Analytics disabled in private QA only. */' });
    return route.abort();
  });
}

export async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

export async function go(page, base, path) {
  const response = await page.goto(base + path, { waitUntil: 'networkidle' });
  if (response.status() !== 200) throw new Error(`Unexpected HTTP ${response.status()}: ${path}`);
  await settle(page);
}
