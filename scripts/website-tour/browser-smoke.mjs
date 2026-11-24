// Requires externally installed Playwright/Chromium and an axe-core script for QA only.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { configureCapture, go, loadReviewImages } from './browser-tools.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.env.TOUR_PREVIEW_URL || 'http://127.0.0.1:3420';
const output = resolve(process.argv[2]);
mkdirSync(output, { recursive: true });
const media = JSON.parse(readFileSync('app/website-tour/media.json'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const results = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width >= 768 ? 960 : 844 }, reducedMotion: width === 320 ? 'reduce' : 'no-preference' });
    await configureCapture(context, base, process.env.TOUR_FONT_DIR);
    const page = await context.newPage();
    const errors = [], videoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (request.url().endsWith('.mp4')) videoRequests.push(request.url()); });
    await go(page, base, '/website-tour');
    assert.equal(await page.locator('h1').innerText(), 'Website Tour');
    assert.equal(await page.locator('video').evaluate(video => video.paused), true);
    assert.equal(videoRequests.length, 0, 'Movie must not load until requested');
    assert.equal(await page.locator('img[src=""], source[src=""]').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    assert.ok((await page.locator('h1').boundingBox()).x >= 16, 'Keep readable side margins on narrow phones');
    const loadedImages = await loadReviewImages(page);
    assert.ok(loadedImages.every(image => image.complete && image.width > 0));
    assert.equal(await page.locator('#tour-destinations img:visible').count(), width <= 760 ? 3 : 11);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    assert.equal(videoRequests.length, 0, 'Scrolling the directory must not request the movie');
    await page.screenshot({ path: resolve(output, `tour-${width}-full.png`), fullPage: true, animations: 'disabled' });
    await page.screenshot({ path: resolve(output, `tour-${width}-hero.png`), animations: 'disabled' });

    if (process.env.TOUR_AXE_PATH) {
      await page.addScriptTag({ path: process.env.TOUR_AXE_PATH });
      const audit = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
      writeFileSync(resolve(output, `axe-${width}.json`), JSON.stringify(audit, null, 2));
      assert.deepEqual(audit.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })), []);
    }
    const search = page.getByRole('searchbox', { name: 'Find a section' });
    await search.fill('GPA'); assert.equal(await page.locator('#tour-destinations article').count(), 1);
    await page.getByLabel('Section category').selectOption('Chapter');
    await page.getByRole('heading', { name: 'No matching sections' }).waitFor();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await search.fill('<img src=x onerror=alert(1)>'); assert.equal(await page.locator('#tour-destinations article').count(), 0);
    assert.equal(await page.locator('img[src=x]').count(), 0);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    assert.equal(await page.locator('#tour-destinations article').count(), 11);

    const pathway = page.getByText('I’m a newly admitted student', { exact: true });
    await pathway.click();
    assert.equal(await page.getByRole('link', { name: 'Open the orientation resources' }).isVisible(), true);
    await pathway.locator('..').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('link', { name: 'Open the orientation resources' }).isVisible(), false);

    await page.getByRole('button', { name: /03 Student Portal and study tools/ }).click();
    const video = page.locator('video');
    await page.waitForFunction(() => { const video = document.querySelector('video'); return video.readyState >= 2 && !video.seeking && !video.paused && video.currentTime > 50; });
    assert.ok(Math.abs(await video.evaluate(video => video.currentTime) - media.chapters[2].start) < 5);
    await video.evaluate(video => video.pause());
    await video.focus(); await page.keyboard.press('Space');
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('video').paused);
    await video.evaluate(video => { video.muted = true; video.volume = .4; video.currentTime = 2; });
    const state = await video.evaluate(video => ({ volume: video.volume, muted: video.muted, duration: video.duration, tracks: video.textTracks.length, controls: video.controls }));
    assert.equal(state.volume, .4); assert.equal(state.muted, true); assert.equal(state.tracks, 1); assert.equal(state.controls, true);
    assert.ok(Math.abs(state.duration - media.durationSeconds) < .5);
    await page.waitForFunction(() => document.querySelector('video').textTracks[0].cues?.length > 0);
    const caption = await video.evaluate(video => { const track = video.textTracks[0]; track.mode = 'showing'; return { count: track.cues.length, first: track.cues[0].text }; });
    assert.equal(caption.count, 30);
    assert.ok(caption.first.includes('Welcome to the NIPSA'));
    await video.evaluate(video => video.play());
    await page.waitForFunction(() => document.querySelector('video').textTracks[0].activeCues?.length > 0);
    await page.screenshot({ path: resolve(output, `tour-${width}-captions.png`), animations: 'disabled' });
    await video.evaluate(video => video.pause());
    // Exercise the browser's own fullscreen control, without adding application handlers.
    await video.hover();
    const box = await video.boundingBox();
    await page.mouse.click(box.x + box.width - 54, box.y + box.height - 28);
    await page.waitForFunction(() => !!document.fullscreenElement);
    await page.evaluate(() => document.exitFullscreen());
    await page.getByRole('link', { name: /Read transcript/ }).click();
    assert.equal(await page.locator('#tour-transcript').evaluate(element => element.open), true);
    await page.locator('#tour-transcript summary').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#tour-transcript').evaluate(element => element.open), false);

    // Seek forward and backward through the encoded file, including each chapter.
    for (const [index, chapter] of media.chapters.entries()) {
      await page.getByRole('group', { name: 'Video chapters' }).getByRole('button').nth(index).click();
      await page.waitForFunction(target => { const video = document.querySelector('video'); return video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - target) < 2; }, chapter.start);
      await video.evaluate(video => video.pause());
      await video.evaluate((video, time) => { video.currentTime = time; }, chapter.start + 1);
      await page.waitForFunction(text => { const video = document.querySelector('video'); return !video.seeking && video.readyState >= 2 && video.textTracks[0].activeCues?.[0]?.text.replace(/\s+/g, ' ') === text; }, chapter.paragraphs[0]);
      if (chapter.id === 'portal' && [390, 1440].includes(width)) {
        // Evidence of the real encoded calculation in the native player. Captions
        // are temporarily off, an ordinary available player option, then restored.
        await video.evaluate((video, time) => { video.textTracks[0].mode = 'hidden'; video.currentTime = time; }, chapter.start + 43);
        await page.waitForFunction(() => { const video = document.querySelector('video'); return !video.seeking && video.readyState >= 2; });
        // Rapid test navigation can leave competing smooth scrolls in flight.
        // Use an ordinary centered scroll for this evidence frame; no UI is hidden.
        await video.evaluate(video => video.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(350);
        const frame = await video.boundingBox();
        const headerBottom = await page.locator('header').evaluate(header => header.getBoundingClientRect().bottom);
        assert.ok(frame.y >= headerBottom - 1 && frame.y + frame.height <= page.viewportSize().height);
        await video.screenshot({ path: resolve(output, `player-${width}-gpa-captions-off.png`), animations: 'disabled' });
        await video.evaluate(video => { video.textTracks[0].mode = 'showing'; });
      }
    }

    await go(page, base, '/');
    assert.equal(await page.locator('dialog:visible').count(), 0);
    assert.equal(await page.getByRole('heading', { name: /Learn boldly/ }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: /New here\? Explore the website/ }).isVisible(), true);
    await loadReviewImages(page);
    await page.screenshot({ path: resolve(output, `home-${width}-entry.png`), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const tourLink = page.locator('#site-navigation-overlay').getByRole('link', { name: 'Tour', exact: true });
    await tourLink.click(); await page.waitForURL(base + '/website-tour');
    await go(page, base, '/gallery');
    assert.equal(await page.locator('dialog:visible').count(), 0);
    await page.getByRole('button', { name: /^View full-screen image:/ }).first().click();
    await page.getByRole('dialog').waitFor({ state: 'visible' }); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Escape');
    await page.waitForTimeout(200); assert.equal(await page.locator('dialog:visible').count(), 0);
    assert.deepEqual(errors, []);
    results.push({ width, passed: true, axe: !!process.env.TOUR_AXE_PATH, physicalDevice: false, reducedMotion: width === 320, pageHeight, loadedImages, chaptersSeeked: media.chapters.length });
    await context.close();
    console.log('PASS browser interactions, media, homepage and Gallery at', width);
  }
  const context = await browser.newContext(); await configureCapture(context, base, process.env.TOUR_FONT_DIR);
  const page = await context.newPage();
  await page.route('**/media/website-tour/walkthrough.mp4', route => route.abort());
  await go(page, base, '/website-tour'); await page.getByRole('button', { name: 'Play the narrated Website Tour', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'video could not load' }).waitFor();
  assert.equal(await page.locator('#tour-destinations article').count(), 11);
  await context.close();
} finally { await browser.close(); }
writeFileSync(resolve(output, 'results.json'), JSON.stringify({ results, mediaErrorFallback: true, generatedAt: new Date().toISOString() }, null, 2) + '\n');
