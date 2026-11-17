import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { operationEnvironment, publishedCourse } from '../backend/testing/operations-fixtures.mjs';
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const directory = process.env.PHARMAIDEIA_REVIEW_DIR || '/workspace/artifacts/pharmaideia-m6';
await fs.mkdir(directory, { recursive: true });
const e = await operationEnvironment(), admin = await e.member('administrator'), rep = await e.member('representative'), reviewer = await e.member('reviewer'), student = await e.member(), course = await publishedCourse(e, rep, reviewer);
await rep.c.request('/api/v1/notifications/manage', 'POST', { title: 'Synthetic lecture update · test only', message: 'Isolated workflow fixture; no real class is changed.', kind: 'lecture_change', priority: 'important', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now()).toISOString() });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const scans = [];
async function axe(page, label) { const r = await page.evaluate(async () => { const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return { violations: result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), incomplete: result.incomplete.map(i => i.id) }; }); scans.push({ label, ...r }); assert.deepEqual(r.violations, [], label); }
async function capture(page, name) { assert.equal(await page.locator('input[type=password]').evaluateAll(inputs => inputs.every(i => !i.value)), true, 'Never capture credential values'); assert.equal(await page.locator('code').count(), 0); await page.screenshot({ path: path.join(directory, name + '.png'), fullPage: true, animations: 'disabled' }); }
async function go(page, route) { await page.evaluate(route => { location.hash = '/' + route; }, route); await page.waitForTimeout(150); }
async function signIn(page, account) { await page.goto(e.origin + '/access/', { waitUntil: 'networkidle' }); const form = page.getByRole('form', { name: 'Sign in', exact: true }); await form.getByLabel('Institutional email').fill(account.email); await form.getByLabel('Password', { exact: true }).fill(account.password); await form.getByRole('button', { name: 'Sign in', exact: true }).click(); await page.getByRole('link', { name: 'Open study space', exact: true }).click(); await page.getByText(account.name + ' · ' + account.level + ' Level', { exact: true }).waitFor(); }
try {
    for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1050 }, reducedMotion: 'reduce' });
        await context.addInitScript({ path: require.resolve('axe-core/axe.min.js') });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await signIn(page, student.user);
        if (width === 390)
            assert.deepEqual(await page.locator('#mobile-nav > *').allTextContents(), ['Home', 'Courses', 'Community', 'Planner', 'More']);
        await page.locator('.academic-hero img').evaluate(i => i.decode());
        await capture(page, `${width}-dashboard`);
        await axe(page, `${width}-dashboard`);
        await go(page, 'courses');
        await page.getByLabel('Search courses', { exact: true }).waitFor();
        await page.getByLabel('Search courses', { exact: true }).fill('TEST201');
        await page.getByRole('button', { name: 'Open TEST201', exact: true }).waitFor();
        await capture(page, `${width}-courses`);
        await axe(page, `${width}-courses`);
        await page.getByRole('button', { name: 'Open TEST201', exact: true }).click();
        await page.getByRole('tab', { name: 'Course details', exact: true }).focus();
        await page.keyboard.press('End');
        assert.equal(await page.getByRole('tab', { name: 'Revision', exact: true }).getAttribute('aria-selected'), 'true');
        await page.keyboard.press('Home');
        assert.equal(await page.getByRole('tab', { name: 'Course details', exact: true }).getAttribute('aria-selected'), 'true');
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.getByRole('tab', { name: 'Topics', exact: true }).getAttribute('aria-selected'), 'true');
        if (width === 390) {
            const visibleTabs = await page.getByRole('tab').evaluateAll(tabs => tabs.every(tab => { const rect = tab.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth && tab.scrollWidth <= tab.clientWidth; }));
            assert.equal(visibleTabs, true, 'All seven mobile course labels fit without clipping or a hidden horizontal strip');
        }
        const progress = page.getByRole('form', { name: 'Save progress: Synthetic topic A', exact: true });
        await progress.getByLabel('Topic coverage', { exact: true }).selectOption('true');
        await progress.getByLabel('Understanding', { exact: true }).selectOption('low');
        await progress.getByLabel('Area of difficulty', { exact: true }).selectOption('true');
        await progress.getByRole('button', { name: 'Save progress: Synthetic topic A', exact: true }).click();
        await page.getByText('1/2 leaf topics covered · 1 confidence ratings', { exact: true }).waitFor();
        await page.getByRole('tab', { name: 'Topics', exact: true }).click();
        assert.equal((await student.c.request('/api/v1/academic/courses/' + course.id + '/progress')).data.summary.coverage, 50);
        const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        for (const theme of ['light', 'dark']) {
            await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
            const contrast = await page.getByRole('tab', { name: 'Topics', exact: true }).evaluate(el => {
                const style = getComputedStyle(el);
                const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((v, c, i) => v + c * [.2126, .7152, .0722][i], 0);
                const foreground = luminance(style.color), background = luminance(style.backgroundColor);
                return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
            });
            assert.ok(contrast >= 4.5, `${theme} selected course tab contrast ${contrast}`);
        }
        await page.evaluate(theme => { if (theme === null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', theme); }, initialTheme);
        await page.getByRole('heading', { name: 'Topics and progress', exact: true }).click();
        await capture(page, `${width}-course-progress`);
        await axe(page, `${width}-progress`);
        await go(page, 'notifications');
        await page.getByRole('heading', { name: 'Synthetic lecture update · test only', exact: true }).waitFor();
        const read = page.getByRole('button', { name: 'Mark as read', exact: true });
        if (await read.count())
            await read.click();
        await page.getByLabel('Reading status', { exact: true }).selectOption('read');
        await capture(page, `${width}-notifications`);
        await axe(page, `${width}-notifications`);
        await go(page, 'profile');
        await page.locator('[data-account-preferences-ready=true]').waitFor();
        await page.getByText('Notification preferences', { exact: true }).click();
        const saved = page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/notifications/preferences' && r.request().method() === 'PUT');
        await page.getByRole('checkbox', { name: 'New material preference', exact: true }).click();
        assert.equal((await saved).status(), 200);
        assert.equal(typeof (await student.c.request('/api/v1/notifications/preferences')).data.resources, 'boolean');
        await go(page, 'community');
        await page.getByRole('heading', { name: 'Messaging is restricted', exact: true }).waitFor();
        assert.equal(await page.getByLabel('Your message', { exact: true }).count(), 0);
        await capture(page, `${width}-community-closed`);
        await axe(page, `${width}-community-closed`);
        await admin.c.request('/api/v1/admin/community', 'PATCH', { isOpen: true, reason: 'policy_change' });
        await page.getByRole('button', { name: 'Refresh messages', exact: true }).click();
        await page.getByLabel('Your message', { exact: true }).fill('Synthetic community message ' + width + ' <img src=x onerror=alert(1)>');
        await page.getByRole('button', { name: 'Send message', exact: true }).click();
        await page.getByText('Synthetic community message ' + width + ' <img src=x onerror=alert(1)>', { exact: true }).waitFor();
        assert.equal(await page.locator('.community-history img').count(), 0);
        await page.getByRole('button', { name: 'Reply to ' + student.user.name, exact: true }).first().click();
        await page.getByLabel('Your message', { exact: true }).fill('Synthetic quoted reply ' + width);
        await page.getByRole('button', { name: 'Send message', exact: true }).click();
        await page.getByText('Synthetic quoted reply ' + width, { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Thanks (0)', exact: true }).first().click();
        await page.getByRole('button', { name: 'Thanks (1)', exact: true }).first().waitFor();
        await capture(page, `${width}-community-open`);
        await axe(page, `${width}-community-open`);
        await go(page, 'cbt');
        await page.getByRole('heading', { name: 'Initial requests are closed', exact: true }).waitFor();
        await capture(page, `${width}-cbt-closed`);
        await axe(page, `${width}-cbt-closed`);
        await go(page, 'help');
        await page.getByLabel('Search account guidance', { exact: true }).waitFor();
        await page.getByLabel('Search account guidance', { exact: true }).fill('CBT');
        await page.getByText('Applying for CBT', { exact: true }).click();
        assert.equal(await page.locator('video').getAttribute('preload'), 'none');
        assert.equal(await page.locator('video').evaluate(v => v.autoplay), false);
        await capture(page, `${width}-help`);
        await axe(page, `${width}-help`);
        await go(page, 'planner');
        await page.getByLabel('Study task', { exact: true }).fill('Synthetic M6 personal reminder');
        await page.getByRole('button', { name: 'Add study task', exact: true }).click();
        await page.getByRole('checkbox', { name: 'Synthetic M6 personal reminder', exact: true }).waitFor();
        await go(page, 'community');
        await page.getByRole('heading', { name: 'Messaging is open', exact: true }).waitFor();
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.waitForFunction(() => navigator.serviceWorker.controller);
        const keys = await page.evaluate(async () => { const names = await caches.keys(); return (await Promise.all(names.map(async (n) => (await (await caches.open(n)).keys()).map(r => r.url)))).flat(); });
        assert.ok(!keys.some(u => /\/api\/|\/operations\/|\/access\/|\/admin\//.test(u)));
        await context.setOffline(true);
        await page.getByText('Private workspace cleared. Reconnect or open personal study tools from the menu.', { exact: true }).waitFor();
        assert.equal(await page.getByText('Synthetic quoted reply ' + width, { exact: true }).count(), 0);
        await go(page, 'planner');
        await page.getByRole('checkbox', { name: 'Synthetic M6 personal reminder', exact: true }).waitFor();
        await context.setOffline(false);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
        await admin.c.request('/api/v1/admin/community', 'PATCH', { isOpen: false, reason: 'policy_change' });
        await context.close();
        console.log(`PASS M6 ${width}px: authenticated courses/progress, scoped notices, real community interactions, closed CBT, searchable Help/video, offline privacy and preserved planner.`);
    }
    await fs.writeFile(path.join(directory, 'accessibility.json'), JSON.stringify(scans, null, 2) + '\n');
}
finally {
    await browser.close();
    await e.cleanup();
}
