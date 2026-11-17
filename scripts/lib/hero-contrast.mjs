import sharp from 'sharp';
const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((n, c, i) => n + c * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
// Measurement of real composited image/text backdrops, supplementing (not certifying) visual review.
export async function reviewHeroContrast(page) {
    const selectors = ['.hero-kicker', '.hero-copy h2', '.hero-copy>p:last-of-type', '.hero-copy .button:not(.hero-secondary)', '.hero-copy .hero-secondary', '.hero-attribution'];
    await page.locator('.academic-hero img').evaluate(i => i.decode());
    const regions = await page.evaluate(selectors => selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)).filter(el => getComputedStyle(el).display !== 'none').map(el => { const rect = el.getBoundingClientRect(), style = getComputedStyle(el), fontSize = parseFloat(style.fontSize), bold = parseInt(style.fontWeight) >= 700; return { selector, x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.ceil(rect.width), height: Math.ceil(rect.height), color: style.color.match(/[\d.]+/g).slice(0, 3).map(Number), threshold: fontSize >= 24 || bold && fontSize >= 18.66 ? 3 : 4.5 }; })), selectors);
    const first = await sharp(await page.screenshot()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const styleUrl = new URL('/m7-contrast-measure.css', page.url()).href;
    const handler = route => route.fulfill({ status: 200, contentType: 'text/css', body: selectors.join(',') + '{color:transparent!important;text-shadow:none!important}' });
    await page.route(styleUrl, handler);
    const hidden = await page.addStyleTag({ url: styleUrl });
    const backdrop = await sharp(await page.screenshot()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    await hidden.evaluate(el => el.remove());
    await page.unroute(styleUrl, handler);
    const results = [];
    for (const r of regions) {
        let minimum = 21, pixels = 0;
        for (let y = Math.max(0, r.y); y < Math.min(first.info.height, r.y + r.height); y++)
            for (let x = Math.max(0, r.x); x < Math.min(first.info.width, r.x + r.width); x++) {
                const i = (y * first.info.width + x) * 4, a = Array.from(first.data.subarray(i, i + 3)), b = Array.from(backdrop.data.subarray(i, i + 3));
                if (a.some((c, j) => Math.abs(c - b[j]) > 12)) {
                    minimum = Math.min(minimum, contrast(r.color, b));
                    pixels++;
                }
            }
        results.push({ selector: r.selector, minimumContrast: Number(minimum.toFixed(2)), required: r.threshold, sampledGlyphBackdropPixels: pixels, passed: pixels > 0 && minimum >= r.threshold });
    }
    return results;
}
