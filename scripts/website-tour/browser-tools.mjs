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

// A full-page screenshot does not scroll the browser and therefore does not load
// below-the-fold lazy images. Exercise real scrolling, then verify decoded pixels.
// Keep the product's lazy-loading behavior unchanged.
export async function loadReviewImages(page) {
  const images = page.locator('img:visible');
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async element => {
      await element.decode();
      if (!element.complete || element.naturalWidth === 0) throw new Error(`Image failed: ${element.currentSrc}`);
    });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await settle(page);
  return page.locator('img:visible').evaluateAll(elements => elements.map(image => ({
    src: image.getAttribute('src'), complete: image.complete, width: image.naturalWidth, height: image.naturalHeight,
  })));
}
