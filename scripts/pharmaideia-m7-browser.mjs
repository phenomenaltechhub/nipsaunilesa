import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { examinationEnvironment } from '../backend/testing/examination-fixtures.mjs';
import { reviewHeroContrast } from './lib/hero-contrast.mjs';
const require = createRequire(import.meta.url), { chromium } = require('playwright'), directory = process.env.PHARMAIDEIA_REVIEW_DIR || '/workspace/artifacts/pharmaideia-m7';
await fs.mkdir(directory, { recursive: true });
const e = await examinationEnvironment({ questionCount: 2 }), browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }), scans = [], contrasts = [];
async function scan(page, label) { const r = await page.evaluate(async () => { const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return { violations: result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), incomplete: result.incomplete.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) }; }); scans.push({ label, ...r }); assert.deepEqual(r.violations, [], label); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label + ' has no horizontal overflow'); }
async function capture(page, name) { assert.equal(await page.locator('input[type=password]').evaluateAll(items => items.every(i => !i.value)), true); await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({ path: path.join(directory, name + '.png'), fullPage: true, animations: 'disabled' }); }
async function signIn(page, user) { await page.goto(e.origin + '/access/', { waitUntil: 'networkidle' }); const form = page.getByRole('form', { name: 'Sign in', exact: true }); await form.getByLabel('Institutional email').fill(user.email); await form.getByLabel('Password', { exact: true }).fill(user.password); await form.getByRole('button', { name: 'Sign in', exact: true }).click(); await page.getByRole('link', { name: 'Open study space', exact: true }).click(); await page.getByText(user.name + ' · ' + user.level + ' Level', { exact: true }).waitFor(); }
try {
    for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1050 }, reducedMotion: 'reduce' });
        await context.addInitScript({ path: require.resolve('axe-core/axe.min.js') });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await signIn(page, e.student.user);
        await page.getByText('AI-generated illustrative composite', { exact: true }).waitFor();
        for (const theme of ['light', 'dark']) {
            await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
            const measurements = await reviewHeroContrast(page);
            contrasts.push({ width, theme, measurements });
            assert.ok(measurements.every(r => r.passed), JSON.stringify({ width, theme, measurements }));
            await capture(page, `${width}-dashboard-${theme}`);
            await scan(page, `${width}-dashboard-${theme}`);
        }
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        if (width === 390)
            assert.deepEqual(await page.locator('#mobile-nav>*').allTextContents(), ['Home', 'Courses', 'Community', 'Planner', 'More']);
        await page.evaluate(() => location.hash = '/cbt');
        await page.getByRole('button', { name: 'Enter assessment', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Enter assessment', exact: true }).click();
        await page.getByRole('button', { name: 'Start assigned assessment', exact: true }).click();
        await page.getByRole('heading', { name: 'Your assessment', exact: true }).waitFor();
        let droppedAcknowledgement = false;
        await page.route('**/api/v1/cbt/attempts/*/answers', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (!droppedAcknowledgement) {
                droppedAcknowledgement = true;
                await route.fetch();
                await route.abort('failed');
            }
            else
                await route.continue();
        });
        await page.getByRole('radio', { name: 'First synthetic option', exact: true }).check();
        await page.getByRole('checkbox', { name: 'Flag this question for review', exact: true }).check();
        await page.getByText(/Use Retry saving/).waitFor();
        await page.getByRole('button', { name: 'Retry saving', exact: true }).click();
        await page.getByText('Answers saved to your account.', { exact: true }).waitFor();
        assert.equal(await page.getByRole('radio', { name: 'First synthetic option', exact: true }).isChecked(), true);
        await page.getByRole('button', { name: 'Next question', exact: true }).click();
        await page.getByRole('radio', { name: 'First synthetic option', exact: true }).check();
        await page.getByText('Answers saved to your account.', { exact: true }).waitFor();
        await page.getByRole('checkbox', { name: 'Flag this question for review', exact: true }).check();
        await page.getByText('Answers saved to your account.', { exact: true }).waitFor();
        const clock = page.getByLabel('Server-controlled remaining time', { exact: true }), beforeClock = await clock.textContent();
        await page.evaluate(() => { window.savedTestDateNow = Date.now; Date.now = () => 0; });
        await page.waitForTimeout(1100);
        const seconds = text => { const parts = text.match(/(\d+):(\d+)/); return Number(parts[1]) * 60 + Number(parts[2]); };
        const afterClock = await clock.textContent();
        assert.ok(seconds(afterClock) <= seconds(beforeClock) && seconds(beforeClock) - seconds(afterClock) <= 3, 'Changing device Date.now cannot extend server-derived time');
        await page.evaluate(() => { Date.now = window.savedTestDateNow; delete window.savedTestDateNow; });
        await capture(page, `${width}-cbt-active`);
        await scan(page, `${width}-cbt-active`);
        const attempt = e.service.db.prepare('SELECT id FROM cbt_attempts WHERE assignment_id=? ORDER BY number DESC LIMIT 1').get(e.assignment.id);
        assert.ok(attempt);
        const before = (await e.student.c.request('/api/v1/cbt/attempts/' + attempt.id)).status;
        assert.equal(before, 409, 'Browser session owns the active writer lease');
        await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
        await context.setOffline(true);
        await page.getByText('Private workspace cleared. Reconnect or open personal study tools from the menu.', { exact: true }).waitFor();
        assert.equal(await page.getByRole('radio').count(), 0);
        await context.setOffline(false);
        await page.getByRole('button', { name: 'Enter assessment', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Enter assessment', exact: true }).click();
        await page.getByRole('button', { name: 'Resume saved attempt', exact: true }).click();
        await page.getByRole('heading', { name: 'Your assessment', exact: true }).waitFor();
        assert.equal(await page.getByRole('radio', { name: 'First synthetic option', exact: true }).isChecked(), true);
        await page.getByRole('button', { name: 'Review and submit', exact: true }).click();
        await page.getByRole('button', { name: 'Confirm final submission', exact: true }).click();
        await page.getByRole('heading', { name: 'Assessment completed', exact: true }).waitFor();
        await capture(page, `${width}-cbt-submitted`);
        await scan(page, `${width}-cbt-submitted`);
        let result = await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/analytics');
        let review = await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/review', 'PATCH', { revision: result.data.revision, action: 'review', note: 'Synthetic browser result review' });
        assert.equal(review.status, 200);
        let publish = await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/review', 'PATCH', { revision: review.data.status.revision, action: 'publish', releaseReview: false, note: 'Synthetic browser release' });
        assert.equal(publish.status, 200);
        await page.getByRole('button', { name: 'Return to CBT', exact: true }).click();
        await page.getByRole('heading', { name: /Attempt \d · 100%/ }).first().waitFor();
        await capture(page, `${width}-cbt-results`);
        await scan(page, `${width}-cbt-results`);
        await page.evaluate(() => location.hash = '/help');
        await page.getByLabel('Search account guidance', { exact: true }).waitFor();
        await page.getByLabel('Search account guidance', { exact: true }).fill('Examinations');
        await page.getByText('Examinations and results', { exact: true }).click();
        assert.equal(await page.locator('video').evaluate(v => v.autoplay), false);
        await capture(page, `${width}-help`);
        await scan(page, `${width}-help`);
        const keys = await page.evaluate(async () => { const cachesKeys = await caches.keys(); return (await Promise.all(cachesKeys.map(async (key) => (await (await caches.open(key)).keys()).map(r => r.url)))).flat(); });
        assert.ok(!keys.some(url => /\/api\/|\/operations\/|\/admin\/|\/access\//.test(url)));
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`PASS M7 ${width}px: real CBT entry, save/flag, private offline clearing, resume, submit, server marking, protected release, results, Help, contrast and axe.`);
    }
}
finally {
    await fs.writeFile(path.join(directory, 'accessibility.json'), JSON.stringify(scans, null, 2) + '\n');
    await fs.writeFile(path.join(directory, 'hero-contrast.json'), JSON.stringify(contrasts, null, 2) + '\n');
    await browser.close();
    await e.cleanup();
}
