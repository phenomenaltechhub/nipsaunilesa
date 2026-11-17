import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { examinationEnvironment } from '../backend/testing/examination-fixtures.mjs';
const require = createRequire(import.meta.url), { chromium } = require('playwright'), dir = '/workspace/artifacts/pharmaideia-m7';
await fs.mkdir(dir, { recursive: true });
const e = await examinationEnvironment(), browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }), contexts = [], scans = [];
async function pageFor(member, width, url) { const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1050 }, reducedMotion: 'reduce', acceptDownloads: true }); contexts.push(context); await context.addInitScript({ path: require.resolve('axe-core/axe.min.js') }); await context.addCookies([{ name: 'pharmaideia_session', value: member.c.cookie.slice(member.c.cookie.indexOf('=') + 1), url: e.origin, httpOnly: true, sameSite: 'Strict' }]); const page = await context.newPage(); page.setDefaultTimeout(30000); await page.goto(e.origin + url, { waitUntil: 'networkidle' }); return page; }
async function capture(page, label) { await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({ path: path.join(dir, label + '.png'), fullPage: true, animations: 'disabled' }); const result = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return { violations: r.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), incomplete: r.incomplete.map(v => v.id), incompleteDetails: r.incomplete.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) }; }); scans.push({ label, ...result }); assert.deepEqual(result.violations, [], label); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); }
async function adminSection(page) { await page.bringToFront(); await page.getByRole('button', { name: 'CBT administration', exact: true }).click(); await page.getByRole('form', { name: 'Update CBT intake policy', exact: true }).waitFor(); }
async function materials(page) { await page.bringToFront(); await page.goto(e.origin + '/#/courses', { waitUntil: 'networkidle' }); await page.getByRole('button', { name: 'Open TEST201', exact: true }).click(); await page.getByRole('tab', { name: 'Materials', exact: true }).click(); await page.getByText('Submit and review course resources', { exact: true }).click(); }
try {
    const student = await pageFor(e.student, 390, '/#/cbt');
    await student.getByRole('button', { name: 'Enter assessment', exact: true }).click();
    await student.getByRole('button', { name: 'Start assigned assessment', exact: true }).click();
    await student.getByRole('radio', { name: 'First synthetic option', exact: true }).check();
    await student.getByText('Answers saved to your account.', { exact: true }).waitFor();
    await student.getByRole('button', { name: 'Review and submit', exact: true }).click();
    await student.getByRole('button', { name: 'Confirm final submission', exact: true }).click();
    await student.getByRole('heading', { name: 'Assessment completed', exact: true }).waitFor();
    const attempt = e.service.db.prepare('SELECT id FROM cbt_attempts WHERE assignment_id=?').get(e.assignment.id);
    const admin = await pageFor(e.admin, 1440, '/admin/');
    await adminSection(admin);
    let review = admin.getByRole('form', { name: 'Review attempt ' + attempt.id, exact: true });
    await review.getByLabel('Review and incident note', { exact: true }).fill('Synthetic UI review accepted; no penalty.');
    await review.getByRole('button', { name: 'Review attempt ' + attempt.id, exact: true }).click();
    await admin.getByRole('form', { name: 'Review attempt ' + attempt.id, exact: true }).getByLabel('Result decision', { exact: true }).getByRole('option', { name: 'Release result', exact: true }).waitFor({ state: 'attached' });
    review = admin.getByRole('form', { name: 'Review attempt ' + attempt.id, exact: true });
    await review.getByLabel('Review and incident note', { exact: true }).fill('Synthetic UI result release.');
    await review.getByRole('button', { name: 'Review attempt ' + attempt.id, exact: true }).click();
    await admin.getByRole('button', { name: 'Refresh participation', exact: true }).click();
    await capture(admin, '1440-admin-attempts');
    await admin.setViewportSize({ width: 390, height: 844 });
    await capture(admin, '390-admin-attempts');
    await student.bringToFront();
    if (await student.getByRole('button', { name: 'Return to CBT', exact: true }).count())
        await student.getByRole('button', { name: 'Return to CBT', exact: true }).click();
    await student.getByRole('button', { name: 'Refresh CBT status', exact: true }).waitFor();
    await student.getByRole('button', { name: 'Refresh CBT status', exact: true }).click();
    await student.getByRole('heading', { name: 'Attempt 1 · 100%', exact: true }).waitFor();
    const rep = await pageFor(e.rep, 390, '/#/courses');
    await materials(rep);
    const form = rep.getByRole('form', { name: 'Submit resource draft', exact: true });
    await form.getByLabel('Resource title', { exact: true }).fill('Synthetic reviewed Drive resource');
    await form.getByLabel('Resource description', { exact: true }).fill('Isolated test fixture, not academic content.');
    await form.getByLabel('Source attribution URL (HTTPS)', { exact: true }).fill('https://example.invalid/reviewed-source');
    await form.getByLabel('Google Drive/Docs destination (optional)', { exact: true }).fill('https://drive.google.com/file/d/SYNTHETIC_FIXTURE_123/view');
    const created = rep.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/academic/resources' && r.request().method() === 'POST');
    await form.getByRole('button', { name: 'Submit resource draft', exact: true }).click();
    assert.equal((await created).status(), 200);
    const resource = e.service.db.prepare('SELECT id FROM academic_resources ORDER BY created_at DESC LIMIT 1').get();
    assert.ok(resource);
    await rep.getByText('Submit and review course resources', { exact: true }).click();
    let decision = rep.getByRole('form', { name: 'Resource decision ' + resource.id, exact: true });
    await decision.getByLabel('Decision note', { exact: true }).fill('Synthetic resource for review.');
    await decision.getByRole('button', { name: 'Resource decision ' + resource.id, exact: true }).click();
    const reviewer = await pageFor(e.reviewer, 1440, '/#/courses');
    await materials(reviewer);
    decision = reviewer.getByRole('form', { name: 'Resource decision ' + resource.id, exact: true });
    await decision.getByLabel('Decision', { exact: true }).selectOption('publish');
    await decision.getByLabel('Decision note', { exact: true }).fill('Synthetic source reviewed.');
    await decision.getByRole('button', { name: 'Resource decision ' + resource.id, exact: true }).click();
    await student.bringToFront();
    await student.goto(e.origin + '/#/courses', { waitUntil: 'networkidle' });
    await student.getByRole('button', { name: 'Open TEST201', exact: true }).click();
    await student.getByRole('tab', { name: 'Materials', exact: true }).click();
    await student.getByRole('heading', { name: 'Synthetic reviewed Drive resource', exact: true }).waitFor();
    await capture(student, '390-reviewed-resource');
    await e.admin.c.request('/api/v1/admin/community', 'PATCH', { isOpen: true, reason: 'policy_change' });
    await student.evaluate(() => location.hash = '/community');
    await student.getByRole('heading', { name: 'Messaging is open', exact: true }).waitFor();
    await e.peer.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic cross-client synchronized community message', replyTo: null, mentions: [] });
    await student.getByText('Synthetic cross-client synchronized community message', { exact: true }).waitFor();
    await capture(student, '390-community-synchronized');
    await e.admin.c.request('/api/v1/admin/community', 'PATCH', { isOpen: false, reason: 'policy_change' });
    await student.getByRole('heading', { name: 'Messaging is restricted', exact: true }).waitFor();
    await student.evaluate(() => location.hash = '/notifications');
    await student.getByRole('heading', { name: 'Your updates', exact: true }).waitFor();
    await e.rep.c.request('/api/v1/notifications/manage', 'POST', { title: 'Synthetic automatically delivered level update', message: 'Synthetic polling integration evidence.', kind: 'lecture_change', priority: 'important', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now()).toISOString() });
    await student.getByRole('heading', { name: 'Synthetic automatically delivered level update', exact: true }).waitFor();
    await capture(student, '390-notifications-synchronized');
    e.advance(60001);
    const started = performance.now(), responses = await Promise.all(Array.from({ length: 50 }, () => e.peer.c.request('/api/v1/academic/courses')));
    assert.ok(responses.every(r => r.status === 200));
    await fs.writeFile(path.join(dir, 'performance.json'), JSON.stringify({ controlledOnly: true, requests: 50, concurrent: true, totalMilliseconds: Math.round(performance.now() - started), productionCapacityVerified: false }, null, 2) + '\n');
    await student.context().setOffline(true);
    await student.getByText('Private workspace cleared. Reconnect or open personal study tools from the menu.', { exact: true }).waitFor();
    e.advance(21 * 60000);
    await student.context().setOffline(false);
    await student.waitForTimeout(500);
    assert.equal(await student.getByRole('heading', { name: 'Synthetic automatically delivered level update', exact: true }).count(), 0);
    await capture(student, '390-expired-session');
    console.log('PASS M7 admin UI result review/release, reviewed resource workflow, real cross-client community and notification polling, 50-request local concurrency, offline session expiry.');
}
finally {
    await fs.writeFile(path.join(dir, 'workflow-accessibility.json'), JSON.stringify(scans, null, 2) + '\n');
    for (const context of contexts)
        await context.close();
    await browser.close();
    await e.cleanup();
}
