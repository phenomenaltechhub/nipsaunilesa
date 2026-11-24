// Authentic browser recordings of a pinned, immutable static export. No simulated services.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { configureCapture, go } from './browser-tools.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.env.TOUR_SOURCE_URL || 'http://127.0.0.1:3421';
const work = resolve(process.argv[2]);
const fontDirectory = process.env.TOUR_FONT_DIR;
const timeline = JSON.parse(readFileSync(resolve(work, 'timeline.json')));
const publicRoot = resolve('public/media/website-tour');
mkdirSync(resolve(publicRoot, 'images'), { recursive: true });
mkdirSync(resolve(work, 'raw'), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const log = [];
const only = process.env.TOUR_CHAPTER;
try {
  for (const chapter of timeline.filter(chapter => !only || chapter.id === only)) {
    const size = { width: chapter.id === 'navigator' ? 600 : 1280, height: 720 };
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, acceptDownloads: true, recordVideo: { dir: resolve(work, 'raw'), size } });
    await configureCapture(context, base, fontDirectory);
    await context.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const pointer = document.createElement('div');
        pointer.setAttribute('aria-hidden', 'true');
        pointer.style.cssText = 'position:fixed;left:50%;top:50%;width:26px;height:26px;border:2px solid #0b7961;background:#b8f1d744;border-radius:50%;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%)';
        document.body.append(pointer);
        document.addEventListener('mousemove', event => { pointer.style.left = `${event.clientX}px`; pointer.style.top = `${event.clientY}px`; });
      });
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const captureStart = performance.now();
    await go(page, base, chapter.path);
    if (chapter.id === 'welcome' || chapter.id === 'gallery') assert.equal(await page.locator('dialog:visible').count(), 0);
    const leadIn = (performance.now() - captureStart) / 1000;
    const start = performance.now();
    const actions = [];
    const scroll = async locator => { await locator.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); };
    const image = async name => {
      const buffer = await page.screenshot();
      await sharp(buffer).resize(960, 675, { fit: 'cover', position: 'top' }).webp({ quality: 82 }).toFile(resolve(publicRoot, 'images', name + '.webp'));
    };
    for (const cue of chapter.cues) {
      await page.waitForTimeout(Math.max(0, (cue.start * 1000) - (performance.now() - start)));
      const actual = (performance.now() - start) / 1000;
      switch (cue.action) {
        case 'home': await image('home'); break;
        case 'navigation': await page.getByRole('button', { name: 'Menu', exact: true }).click(); await page.waitForTimeout(2200); await page.keyboard.press('Escape'); break;
        case 'resources': await image('resources'); await page.mouse.wheel(0, 340); break;
        case 'checklist': {
          const card = page.locator('#orientation-checklist'); await scroll(card);
          const popupPromise = page.waitForEvent('popup');
          await card.getByRole('link', { name: 'Open orientation checklist PDF in a new tab' }).click();
          const popup = await popupPromise; await popup.waitForTimeout(1200); await popup.close(); await page.bringToFront();
          const downloadPromise = page.waitForEvent('download'); await card.getByRole('link', { name: 'Download orientation checklist', exact: true }).click();
          const download = await downloadPromise; await download.saveAs(resolve(work, 'checklist-original.pdf'));
          assert.equal(createHash('sha256').update(readFileSync(resolve(work, 'checklist-original.pdf'))).digest('hex'), 'd59adce53568283274aac49b9fc7da88b3b9a97ec45a72c936e9e86f86f26c7b'); break;
        }
        case 'study-guide': await scroll(page.getByRole('heading', { name: 'Study skills guide', exact: true })); await page.getByRole('link', { name: 'Download study guide', exact: true }).hover(); break;
        case 'resource-drive': await scroll(page.locator('#resource-drive')); await page.getByRole('link', { name: /Access Resource Drive/ }).hover(); break;
        case 'portal': await image('portal'); await page.mouse.wheel(0, 450); break;
        case 'tools': await go(page, base, '/portal/tools'); await image('tools'); await scroll(page.locator('#gpa-calculator')); break;
        case 'grading-scale': await page.getByText('Review and edit grading scale', { exact: true }).click(); await page.waitForTimeout(3000); await page.getByText('Review and edit grading scale', { exact: true }).click(); break;
        case 'gpa-example': {
          await page.evaluate(() => { const note = document.createElement('div'); note.id = 'capture-note'; note.textContent = 'Illustrative entries — not official academic records'; note.style.cssText = 'position:fixed;bottom:18px;left:24px;padding:10px 16px;background:#073f2c;color:#fff;z-index:99999;font:14px Arial;border-radius:5px'; document.body.append(note); });
          for (let i = 0; i < 2; i++) {
            await page.getByRole('button', { name: 'Add course', exact: true }).click();
            const row = page.locator('.study-course-row').nth(i); await scroll(row);
            await row.getByRole('textbox').fill(i ? 'DEMO B' : 'DEMO A');
            await row.getByRole('spinbutton').fill(i ? '2' : '3'); await row.getByRole('combobox').selectOption(i ? 'B' : 'A');
          }
          await page.getByRole('button', { name: 'Calculate GPA', exact: true }).click();
          assert.match(await page.locator('.study-tools-message').innerText(), /GPA: 4\.6(?:0)? from 5/);
          await scroll(page.locator('.study-tools-message')); break;
        }
        case 'planning-tools': await page.locator('#capture-note').evaluate(element => element.remove()); await scroll(page.locator('#study-timetable')); await page.waitForTimeout(4500); await scroll(page.locator('#study-planner')); break;
        case 'announcements': await image('announcements'); await page.mouse.wheel(0, 350); break;
        case 'notice': await page.getByRole('link', { name: /Departmental Orientation/ }).first().click(); await page.waitForTimeout(1000); await page.mouse.wheel(0, 400); break;
        case 'events': await go(page, base, '/events'); await image('events'); await page.mouse.wheel(0, 350); break;
        case 'community': await image('community'); await page.mouse.wheel(0, 380); break;
        case 'executives': await go(page, base, '/executives'); await image('executives'); await page.mouse.wheel(0, 450); break;
        case 'community-context': await go(page, base, '/community'); await page.mouse.wheel(0, 450); break;
        case 'gallery': await image('gallery'); await page.getByRole('button', { name: /^View full-screen image:/ }).first().click(); await page.getByRole('dialog').waitFor({ state: 'visible' }); break;
        case 'gallery-navigation': await page.getByRole('button', { name: 'Next image', exact: true }).click(); await page.waitForTimeout(1800); await page.keyboard.press('ArrowLeft'); await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await page.waitForTimeout(1800); await page.getByRole('button', { name: 'Zoom out', exact: true }).click(); break;
        case 'gallery-close': await page.keyboard.press('Escape'); await page.waitForTimeout(300); assert.equal(await page.locator('dialog:visible').count(), 0); break;
        case 'gallery-download': {
          await page.getByRole('button', { name: /^View full-screen image:/ }).first().click();
          const next = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download watermarked copy', exact: true }).click();
          const file = await next; await file.saveAs(resolve(work, 'verified-watermarked-copy.png')); assert.equal((await sharp(resolve(work, 'verified-watermarked-copy.png')).metadata()).format, 'png');
          await page.keyboard.press('Escape'); break;
        }
        case 'ads': await image('ads'); await page.mouse.wheel(0, 350); break;
        case 'ad-contact': await scroll(page.locator('.ads-card').first()); await page.locator('.ads-card').first().locator('a').last().hover(); break;
        case 'ad-guidance': await scroll(page.getByRole('region', { name: 'Advertising guidelines' })); break;
        case 'navigator-search': await image('navigator'); await scroll(page.getByLabel('Search the directory')); await page.getByLabel('Search the directory').pressSequentially('pharmacology', { delay: 100 }); await page.locator('button[aria-controls="navigator-details"]').click(); break;
        case 'navigator-map': await page.setViewportSize({ width: 600, height: 720 }); await scroll(page.getByRole('group', { name: 'Navigator view' })); await page.getByRole('group', { name: 'Navigator view' }).getByRole('button', { name: 'Map', exact: true }).click(); await page.getByRole('heading', { name: 'No verified destinations to map yet', exact: true }).waitFor(); break;
        case 'navigator-limits': await page.getByRole('button', { name: 'Browse directory', exact: true }).click(); await scroll(page.getByRole('heading', { name: 'Department of Pharmacology', exact: true })); break;
        case 'contact': await image('contact'); await page.mouse.wheel(0, 350); break;
        case 'feedback': await scroll(page.getByRole('link', { name: 'info@nipsaunilesa.com.ng', exact: true }).first()); await page.getByRole('link', { name: 'info@nipsaunilesa.com.ng', exact: true }).first().hover(); break;
        case 'finish': await go(page, base, '/'); break;
        default: throw new Error('No genuine action for ' + cue.action);
      }
      actions.push({ action: cue.action, planned: cue.start, actual: +actual.toFixed(3), completed: +((performance.now() - start) / 1000).toFixed(3) });
    }
    await page.waitForTimeout(Math.max(0, chapter.duration * 1000 - (performance.now() - start)));
    assert.deepEqual(pageErrors, []);
    const recording = page.video(); await context.close();
    const videoPath = await recording.path();
    const entry = { chapter: chapter.id, raw: videoPath, leadIn, duration: chapter.duration, actions, pageErrors };
    log.push(entry); writeFileSync(resolve(work, 'recording-' + chapter.id + '.json'), JSON.stringify(entry, null, 2) + '\n');
    console.log('Recorded', chapter.id, chapter.duration, 'seconds');
  }
} finally { await browser.close(); }
writeFileSync(resolve(work, 'recording-log.json'), JSON.stringify(log, null, 2) + '\n');
