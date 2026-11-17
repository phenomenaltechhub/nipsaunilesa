import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHmac } from 'node:crypto';
import { examinationEnvironment } from '../testing/examination-fixtures.mjs';
import { operationEnvironment } from '../testing/operations-fixtures.mjs';
import { PaystackAdapter, PaymentOperations } from '../src/providers/paystack.mjs';
import { startBackend } from '../src/http.mjs';
import { publicAnalytics } from '../src/operations/analytics.mjs';
const base = '/api/v1';
async function start(e, who = e.student) { const assignment = (await who.c.request(base + '/cbt/assignments')).data.assignments[0]; const r = await who.c.request(base + '/cbt/assignments/' + assignment.id + '/attempts', 'POST', {}); assert.equal(r.status, 200, JSON.stringify(r.data)); return r.data; }
async function save(e, a, selectedIndex = 0, requestId = randomUUID()) { return e.student.c.request(base + '/cbt/attempts/' + a.id + '/answers', 'PATCH', { revision: a.revision, requestId, changes: [{ questionId: a.questions[0].id, selectedIndex, flagged: true }] }); }
test('M7 actual end-to-end: selected entry, persisted answers, interruption/resume, server marking, monitoring and authorized release', async () => {
    const e = await examinationEnvironment();
    try {
        assert.equal((await e.outsider.c.request(base + '/cbt/assignments/' + e.assignment.id + '/entry')).status, 404);
        const a = await start(e);
        assert.equal(a.questions.length, 1);
        assert.ok(!JSON.stringify(a).includes('correctIndex'));
        assert.ok(!JSON.stringify(a).includes('explanation'));
        const write = await save(e, a);
        assert.equal(write.status, 200);
        assert.equal(write.data.answers[a.questions[0].id].selectedIndex, 0);
        const event = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/events', 'POST', { requestId: randomUUID(), kind: 'interrupted' });
        assert.equal(event.data.automaticPenalty, false);
        const resumed = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/resume', 'POST', {});
        assert.equal(resumed.status, 200);
        assert.equal(resumed.data.deadline, a.deadline);
        assert.equal(resumed.data.answers[a.questions[0].id].selectedIndex, 0);
        const submit = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/submit', 'POST', { revision: resumed.data.revision });
        assert.equal(submit.status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/submit', 'POST', { revision: resumed.data.revision })).status, 409);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/results')).status, 404);
        const monitor = await e.admin.c.request(base + '/admin/cbt/exams/' + e.exam.id + '/monitor');
        assert.equal(monitor.status, 200);
        assert.equal(monitor.data.assignments.find(r => r.id === e.assignment.id).state, 'submitted');
        let result = await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/analytics');
        assert.equal(result.data.analytics.score, 2);
        assert.equal(result.data.analytics.maximum, 2);
        let review = await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/review', 'PATCH', { revision: result.data.revision, action: 'review', note: 'Synthetic review accepted.' });
        assert.equal(review.status, 200);
        assert.equal((await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/review', 'PATCH', { revision: review.data.status.revision, action: 'publish', releaseReview: true, note: 'Premature key release attempt.' })).status, 409);
        let publish = await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/review', 'PATCH', { revision: review.data.status.revision, action: 'publish', releaseReview: false, note: 'Synthetic result release.' });
        assert.equal(publish.status, 200);
        result = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/results');
        assert.equal(result.data.percentage, 100);
        assert.equal(result.data.review.length, 0);
        assert.ok(!JSON.stringify(result.data).includes('correctIndex'));
        const summary = await e.admin.c.request(base + '/admin/cbt/exams/' + e.exam.id + '/summary');
        assert.equal(summary.data.marked, 1);
        assert.equal(summary.data.averagePercentage, 100);
        assert.equal((await e.student.c.request(base + '/admin/cbt/exams/' + e.exam.id + '/summary')).status, 403);
        let withholding = await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/review', 'PATCH', { revision: publish.data.status.revision, action: 'withhold', note: 'Synthetic result temporarily withheld.' });
        assert.equal(withholding.status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/results')).status, 404);
        assert.equal((await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/review', 'PATCH', { revision: withholding.data.status.revision, action: 'publish', releaseReview: false, note: 'Synthetic reviewed result released again.' })).status, 200);
        assert.equal((await e.peer.c.request(base + '/cbt/attempts/' + a.id + '/results')).status, 404);
        assert.equal((await e.student.c.request(base + '/cbt/attempt-history')).data.attempts.length, 1);
        assert.equal(e.service.db.prepare("SELECT count(*) AS n FROM notices WHERE kind!='cbt_invitation'").get().n, 0, 'No completion notification');
    }
    finally {
        await e.cleanup();
    }
});
test('M7 server deadlines reject device-time/score overrides, expire safely and enforce attempts', async () => {
    const e = await examinationEnvironment();
    try {
        const batchId = e.service.db.prepare('SELECT batch_id FROM cbt_assignments WHERE id=?').get(e.assignment.id).batch_id;
        assert.equal((await e.admin.c.request(base + '/admin/cbt/batches/' + batchId + '/window', 'PUT', { closesAt: new Date(e.now() + 600000).toISOString(), durationMinutes: 10, attemptLimit: 1 })).status, 200);
        const entry = (await e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/entry')).data;
        assert.equal(entry.durationMinutes, 10);
        assert.equal(entry.attemptLimit, 1);
        const a = await start(e);
        assert.equal((await e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', { now: 0 })).status, 400);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/answers', 'PATCH', { revision: a.revision, requestId: randomUUID(), changes: [], score: 100 })).status, 400);
        e.advance(300001);
        const read = await e.student.c.request(base + '/cbt/attempts/' + a.id);
        assert.equal(read.status, 200);
        assert.equal(read.data.status, 'expired');
        assert.deepEqual(read.data.questions, []);
        assert.equal((await save(e, a)).status, 409);
        assert.equal((await e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', {})).status, 409);
        const result = await e.admin.c.request(base + '/admin/cbt/attempts/' + a.id + '/analytics');
        assert.equal(result.data.analytics.unanswered, 1);
        assert.equal(result.data.analytics.score, 0);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 concurrent writes/submits and replay cannot create extra attempts, lose updates or cross assignments', async () => {
    const e = await examinationEnvironment();
    try {
        const responses = await Promise.all([e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', {}), e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', {})]);
        assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
        const a = responses.find(r => r.status === 200).data;
        const requestId = randomUUID(), writes = await Promise.all([save(e, a, 0, requestId), save(e, a, 0, requestId)]);
        assert.ok(writes.every(r => r.status === 200));
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM cbt_answer_writes').get().n, 1);
        assert.equal((await save(e, a, 1, requestId)).status, 409);
        assert.equal((await e.peer.c.request(base + '/cbt/attempts/' + a.id)).status, 404);
        const current = writes[0].data, submissions = await Promise.all([e.student.c.request(base + '/cbt/attempts/' + a.id + '/submit', 'POST', { revision: current.revision }), e.student.c.request(base + '/cbt/attempts/' + a.id + '/submit', 'POST', { revision: current.revision })]);
        assert.deepEqual(submissions.map(r => r.status).sort(), [200, 409]);
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM cbt_attempt_results').get().n, 1);
        const second = await start(e);
        assert.equal(second.number, 2);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + second.id + '/submit', 'POST', { revision: second.revision })).status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', {})).status, 409);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 interruption observations are replay-safe, fair and administratively reviewed without automatic invalidation', async () => {
    const e = await examinationEnvironment();
    try {
        const a = await start(e), requestId = randomUUID();
        let r = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/events', 'POST', { requestId, kind: 'visibility_hidden' });
        assert.equal(r.data.warnings, 1);
        r = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/events', 'POST', { requestId, kind: 'visibility_hidden' });
        assert.equal(r.data.warnings, 1);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/events', 'POST', { requestId, kind: 'disconnected' })).status, 409);
        for (let i = 0; i < 2; i++)
            r = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/events', 'POST', { requestId: randomUUID(), kind: 'navigation_attempt' });
        assert.equal(r.data.requiresReview, true);
        assert.equal(r.data.automaticPenalty, false);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id + '/submit', 'POST', { revision: a.revision })).status, 200);
        const m = (await e.admin.c.request(base + '/admin/cbt/exams/' + e.exam.id + '/monitor')).data;
        assert.equal(m.assignments.find(r => r.id === e.assignment.id).state, 'requires_review');
        assert.equal(m.events.length, 3);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 cancellation, question withdrawal and current-session revocation stop protected delivery', async () => {
    const e = await examinationEnvironment();
    try {
        const a = await start(e);
        const q = await e.admin.c.request(base + '/admin/cbt/questions/' + e.question.id, 'PATCH', { revision: e.question.revision, action: 'withdraw', reason: 'Synthetic safety hold.' });
        assert.equal(q.status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 409);
        const plan = (await e.admin.c.request(base + '/admin/cbt/exams')).data.exams[0];
        assert.equal((await e.admin.c.request(base + '/admin/cbt/exams/' + plan.id, 'PATCH', { revision: plan.revision, action: 'cancel' })).status, 200);
        const cancelled = await e.student.c.request(base + '/cbt/attempts/' + a.id);
        assert.equal(cancelled.data.status, 'cancelled');
        assert.deepEqual(cancelled.data.questions, []);
        await e.student.c.request(base + '/auth/logout', 'POST', {});
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 401);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 saved answers survive actual backend restart and retain their original deadline', async () => {
    const e = await examinationEnvironment();
    let restarted;
    try {
        const a = await start(e);
        assert.equal((await save(e, a)).status, 200);
        const config = e.service.config, port = Number(new URL(e.origin).port);
        await e.close();
        restarted = await startBackend(config, { port });
        const r = await e.student.c.request(base + '/cbt/attempts/' + a.id + '/resume', 'POST', {});
        assert.equal(r.status, 200);
        assert.equal(r.data.deadline, a.deadline);
        assert.equal(r.data.answers[a.questions[0].id].selectedIndex, 0);
        assert.equal(restarted.service.db.prepare('SELECT count(*) AS n FROM cbt_attempts').get().n, 1);
    }
    finally {
        if (restarted) {
            await restarted.close();
            const fs = await import('node:fs/promises');
            await fs.rm(e.directory, { recursive: true, force: true });
        }
        else
            await e.cleanup();
    }
});
test('M7 resource workflow validates actual text, keeps drafts private and enforces independent publication and levels', async () => {
    const e = await examinationEnvironment();
    try {
        const metadata = { title: 'Synthetic resource only', description: 'No academic claim', category: 'lecture-note', sourceUrl: 'https://example.invalid/source', driveUrl: '' };
        let r = await e.rep.c.request(base + '/academic/resources', 'POST', { courseId: e.course.id, resource: metadata });
        assert.equal(r.status, 200, JSON.stringify(r.data));
        const id = r.data.id;
        let upload = await e.rep.c.request(base + '/academic/resources/' + id + '/file', 'POST', { revision: r.data.revision, filename: 'synthetic-notes.txt', mediaType: 'text/plain', content: Buffer.from('Isolated content fixture only.').toString('base64') });
        assert.equal(upload.status, 200);
        assert.equal((await e.student.c.request(base + '/academic/resources/' + id + '/download')).status, 404);
        r = await e.rep.c.request(base + '/academic/resources/' + id, 'PATCH', { revision: upload.data.revision, action: 'submit', note: 'Synthetic submission' });
        assert.equal(r.status, 200);
        assert.equal((await e.rep.c.request(base + '/academic/resources/' + id, 'PATCH', { revision: r.data.revision, action: 'publish', note: 'Self approval attempt' })).status, 403);
        r = await e.reviewer.c.request(base + '/academic/resources/' + id, 'PATCH', { revision: r.data.revision, action: 'publish', note: 'Synthetic independent review' });
        assert.equal(r.status, 200);
        const list = await e.student.c.request(base + '/academic/resources?courseId=' + e.course.id);
        assert.equal(list.data.resources.length, 1);
        assert.equal((await e.outsider.c.request(base + '/academic/resources?courseId=' + e.course.id)).status, 404);
        // Raw authorized download is verified without treating a browser-controlled callback as success.
        const response = await fetch(e.origin + base + '/academic/resources/' + id + '/download', { headers: { Cookie: e.student.c.cookie } });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'private, no-store');
        assert.equal(await response.text(), 'Isolated content fixture only.');
    }
    finally {
        await e.cleanup();
    }
});
test('M7 upload abuse and absent scanner fail closed without persistence', async () => {
    const e = await examinationEnvironment();
    try {
        const r = await e.rep.c.request(base + '/academic/resources', 'POST', { courseId: e.course.id, resource: { title: 'Synthetic scan test', description: '', category: 'lecture-note', sourceUrl: 'https://example.invalid/source', driveUrl: '' } });
        const id = r.data.id, body = { revision: 1, filename: 'synthetic.pdf', mediaType: 'application/pdf', content: Buffer.from('%PDF-1.7\nSynthetic validation fixture\n%%EOF').toString('base64') };
        assert.equal((await e.rep.c.request(base + '/academic/resources/' + id + '/file', 'POST', body)).status, 503);
        for (const change of [{ filename: '../bad.pdf' }, { filename: 'bad.txt', mediaType: 'text/plain', content: Buffer.from('<script>alert(1)</script>').toString('base64') }, { content: Buffer.from('MZ executable').toString('base64') }, { filename: 'bad.svg', mediaType: 'image/svg+xml' }])
            assert.equal((await e.rep.c.request(base + '/academic/resources/' + id + '/file', 'POST', { ...body, ...change })).status, 400);
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM protected_files').get().n, 0);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 sandbox payment verification rejects callback forgery, bad signatures, mismatched amounts and replay', async () => {
    const e = await operationEnvironment();
    try {
        const admin = await e.member('administrator'), secret = ['sk', 'test', randomBytes(24).toString('hex')].join('_');
        let reference = '', amount = 1200, status = 'success';
        const transport = async (url, options) => {
            if (url.endsWith('/initialize')) {
                const input = JSON.parse(options.body);
                reference = input.reference;
                return new Response(JSON.stringify({ status: true, data: { reference, authorization_url: 'https://checkout.paystack.com/synthetic-test-only' } }));
            }
            return new Response(JSON.stringify({ status: true, data: { id: 123456, reference, amount, currency: 'NGN', status, domain: 'test' } }));
        };
        e.service.config.paystack = { secret, transport };
        e.service.config.paymentPackages = { synthetic: { purpose: 'dues', amount: 1200, currency: 'NGN' } };
        const ops = new PaymentOperations(e.service);
        const session = e.service.session(admin.c.cookie.slice('pharmaideia_session='.length));
        const order = await ops.create(session, { packageId: 'synthetic' });
        await assert.rejects(() => ops.create(session, { packageId: 'synthetic', paid: true }));
        const raw = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference } })), signature = createHmac('sha512', secret).update(raw).digest('hex');
        await assert.rejects(() => ops.webhook(raw, '0'.repeat(128)));
        assert.equal((await ops.webhook(raw, signature)).received, true);
        assert.equal((await ops.webhook(raw, signature)).duplicate, true);
        assert.equal(e.service.db.prepare('SELECT status FROM payment_orders WHERE id=?').get(order.id).status, 'paid');
        amount = 1;
        await assert.rejects(() => ops.verify(session, order.id));
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM accounts WHERE dues_verified=1').get().n, 1, 'Provider state cannot create a student record');
        assert.equal(new PaystackAdapter().ready(), false);
        assert.throws(() => new PaystackAdapter({ secret: ['sk', 'live', 'x'.repeat(30)].join('_') }));
        publicAnalytics({ score: 0, maximum: 1, elapsedSeconds: 1, unanswered: 1, topics: {}, categories: {}, incorrect: [], revisionTopicIds: [] });
    }
    finally {
        await e.cleanup();
    }
});
