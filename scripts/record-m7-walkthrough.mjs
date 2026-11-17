import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { examinationEnvironment } from '../backend/testing/examination-fixtures.mjs';
const require = createRequire(import.meta.url), { chromium } = require('playwright'), run = promisify(execFile), dir = '/workspace/artifacts/pharmaideia-m7';
await fs.mkdir(dir, { recursive: true });
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'pharmaideia-m7-video-')), e = await examinationEnvironment({ questionCount: 2 }), browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }), context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await context.addCookies([{ name: 'pharmaideia_session', value: e.student.c.cookie.slice(e.student.c.cookie.indexOf('=') + 1), url: e.origin, httpOnly: true, sameSite: 'Strict' }]);
const page = await context.newPage(), started = Date.now(), cues = [];
const wallClock=setInterval(()=>e.advance(1000),1000);
let prior = 0;
const cdp = await context.newCDPSession(page), frames = [];
let writing = Promise.resolve();
cdp.on('Page.screencastFrame', data => { const name = String(frames.length).padStart(6, '0') + '.jpg'; frames.push({ name, time: (Date.now() - started) / 1000 }); writing = writing.then(() => fs.writeFile(path.join(temp, name), Buffer.from(data.data, 'base64'))); cdp.send('Page.screencastFrameAck', { sessionId: data.sessionId }).catch(() => { }); });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 74, maxWidth: 390, maxHeight: 844, everyNthFrame: 2 });
async function step(text, action) { await action(); const now = (Date.now() - started) / 1000; cues.push({ start: prior, end: now + 1.5, text }); prior = now + 1.5; await page.waitForTimeout(1500); }
try {
    await step('Controlled synthetic demonstration. These are not university records.', async () => { await page.goto(e.origin, { waitUntil: 'networkidle' }); await page.getByText(e.student.user.name + ' · 200 Level', { exact: true }).waitFor(); });
    await step('Open only an assessment assigned to your account.', async () => { await page.evaluate(() => location.hash = '/cbt'); await page.getByRole('button', { name: 'Enter assessment', exact: true }).click(); });
    await step('Read instructions. The server controls the examination window and deadline.', async () => { await page.getByRole('button', { name: 'Start assigned assessment', exact: true }).click(); await page.getByRole('heading', { name: 'Your assessment', exact: true }).waitFor(); });
    await step('Choose an answer and wait for the saved confirmation.', async () => { await page.getByRole('radio', { name: 'First synthetic option', exact: true }).check(); await page.getByText('Answers saved to your account.', { exact: true }).waitFor(); });
    await step('Move between questions. Flags help identify items to revisit.', async () => { await page.getByRole('button', { name: 'Next question', exact: true }).click(); await page.getByRole('radio', { name: 'Second synthetic option', exact: true }).check(); await page.getByText('Answers saved to your account.', { exact: true }).waitFor(); await page.getByRole('checkbox', { name: 'Flag this question for review', exact: true }).check(); await page.getByText('Answers saved to your account.', { exact: true }).waitFor(); });
    await step('Review unanswered items, then explicitly confirm final submission.', async () => { await page.getByRole('button', { name: 'Review and submit', exact: true }).click(); });
    await step('Submission is recorded on the server. Results remain withheld.', async () => { await page.getByRole('button', { name: 'Confirm final submission', exact: true }).click(); await page.getByRole('heading', { name: 'Assessment completed', exact: true }).waitFor(); });
    const attempt = e.service.db.prepare('SELECT id FROM cbt_attempts WHERE assignment_id=?').get(e.assignment.id);
    let result = await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/analytics');
    let review = await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/review', 'PATCH', { revision: result.data.revision, action: 'review', note: 'Synthetic recording review' });
    assert.equal(review.status, 200);
    assert.equal((await e.admin.c.request('/api/v1/admin/cbt/attempts/' + attempt.id + '/review', 'PATCH', { revision: review.data.status.revision, action: 'publish', releaseReview: false, note: 'Synthetic recording release' })).status, 200);
    await step('After administrator review and release, see your own server-marked feedback. This is preparation, not an official grade.', async () => { await page.getByRole('button', { name: 'Return to CBT', exact: true }).click(); await page.getByRole('heading', { name: 'Attempt 1 · 50%', exact: true }).waitFor(); await page.getByRole('heading', { name: 'Your CBT attempt results', exact: true }).scrollIntoViewIfNeeded(); });
    await cdp.send('Page.stopScreencast');
    await writing;
    assert.ok(frames.length > 5);
    const end = (Date.now() - started) / 1000;
    const concat = frames.map((frame, i) => `file '${path.join(temp, frame.name)}'\nduration ${Math.max(.04, (frames[i + 1]?.time ?? end) - frame.time).toFixed(3)}`).join('\n') + `\nfile '${path.join(temp, frames.at(-1).name)}'\n`;
    const source = path.join(temp, 'frames.txt');
    await fs.writeFile(source, concat);
    await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', source, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-r', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(dir, 'm7-cbt-walkthrough.mp4')], { maxBuffer: 1024 * 1024 });
    const stamp = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
    await fs.writeFile(path.join(dir, 'm7-cbt-walkthrough.vtt'), 'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));
    await fs.writeFile(path.join(dir, 'm7-cbt-walkthrough-transcript.txt'), 'Actual controlled synthetic CBT walkthrough. No credentials or real student records are displayed.\n\n' + cues.map(c => c.text).join('\n\n') + '\n');
    console.log('PASS original actual-flow mobile MP4, captions and transcript created; no real records or external services.');
}
finally {
    clearInterval(wallClock);await context.close();
    await browser.close();
    await e.cleanup();
    await fs.rm(temp, { recursive: true, force: true });
}
