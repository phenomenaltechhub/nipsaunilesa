import { tlsConfiguration } from '../src/tls-configuration.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import https from 'node:https';
import { DatabaseSync } from 'node:sqlite';
import { openStore } from '../src/store.mjs';
import { seal } from '../src/security.mjs';
import { client } from '../testing/client.mjs';
import { testConfig } from '../testing/fixtures.mjs';
import { startBackend } from '../src/http.mjs';
import { examinationEnvironment } from '../testing/examination-fixtures.mjs';
import { PaymentOperations } from '../src/providers/paystack.mjs';
const base = '/api/v1';
test('M7 migration preserves actual M6 question/blueprint rows and never publishes legacy drafts', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pharmaideia-m7-upgrade-')), file = path.join(dir, 'upgrade.sqlite');
    let db = new DatabaseSync(file);
    try {
        db.exec('PRAGMA foreign_keys=ON;CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY,applied_at INTEGER NOT NULL)');
        for (const name of ['001_accounts.sql', '002_academic.sql', '003_recovery.sql', '004_operations.sql']) {
            db.exec(await fs.readFile(new URL('../migrations/' + name, import.meta.url), 'utf8'));
            db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run(Number(name.slice(0, 3)), Date.now());
        }
        const account = randomUUID(), course = randomUUID(), request = randomUUID(), question = randomUUID(), exam = randomUUID(), key = randomBytes(32);
        db.prepare("INSERT INTO accounts(id,email,name,level,status,created_at)VALUES(?,?,?,200,'active',?)").run(account, 'synthetic-upgrade@students.example.invalid', 'Synthetic upgrade fixture', Date.now());
        db.prepare("INSERT INTO courses(id,level,session,semester,code,author,payload,status,updated_at)VALUES(?,200,'2026/2027','first','TEST201',?,?,'draft',?)").run(course, account, '{}', Date.now());
        db.prepare('INSERT INTO cbt_requests(id,requester,course_id,payload,created_at,updated_at)VALUES(?,?,?,?,?,?)').run(request, account, course, '{}', Date.now(), Date.now());
        const encrypted = seal(key, JSON.stringify({ text: 'Synthetic preserved question' }));
        db.prepare('INSERT INTO cbt_questions(id,request_id,course_id,encrypted_payload)VALUES(?,?,?,?)').run(question, request, course, encrypted);
        db.prepare("INSERT INTO cbt_exams(id,course_id,title,kind,starts_at,duration_minutes,attempt_limit,capacity,created_at)VALUES(?,?,?,'periodic',?,5,1,1,?)").run(exam, course, 'Synthetic preserved plan', Date.now(), Date.now());
        db.prepare('INSERT INTO cbt_blueprints VALUES(?,?)').run(exam, question);
        db.close();
        db = openStore(file);
        assert.equal(db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n, 7);
        assert.equal(db.prepare('SELECT encrypted_payload FROM cbt_questions WHERE id=?').get(question).encrypted_payload, encrypted);
        assert.equal(db.prepare('SELECT question_id FROM cbt_blueprints WHERE exam_id=?').get(exam).question_id, question);
        assert.equal(db.prepare('SELECT published_payload FROM courses WHERE id=?').get(course).published_payload, null);
        assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    }
    finally {
        db.close();
        await fs.rm(dir, { recursive: true, force: true });
    }
});
test('M7 controlled HTTPS actually sets Secure/HttpOnly/SameSite cookies with certificate verification enabled', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pharmaideia-m7-tls-'));
    let app;
    try {
        const key = path.join(dir, 'ephemeral.key'), cert = path.join(dir, 'ephemeral.crt');
        execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-keyout', key, '-out', cert, '-subj', '/CN=localhost', '-addext', 'subjectAltName=IP:127.0.0.1'], { stdio: 'ignore' });
        const ca = await fs.readFile(cert);
        app = await startBackend(testConfig(path.join(dir, 'tls.sqlite'), { tls: tlsConfiguration({ keyFile: key, certificateFile: cert }) }));
        const response = await new Promise((resolve, reject) => { https.get(app.origin + '/api/v1/session', { ca }, res => { const parts = []; res.on('data', p => parts.push(p)); res.on('end', () => resolve({ headers: res.headers, body: JSON.parse(Buffer.concat(parts)), status: res.statusCode })); }).on('error', reject); });
        assert.equal(response.status, 200);
        await fs.chmod(key, 0o644);
        assert.throws(() => tlsConfiguration({ keyFile: key, certificateFile: cert }));
        await fs.chmod(key, 0o600);
        const cookie = response.headers['set-cookie'][0];
        assert.match(cookie, /; Secure/);
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Strict/);
        assert.equal(response.body.stage, 'anonymous');
        assert.equal(response.headers['cache-control'], 'private, no-store');
    }
    finally {
        if (app)
            await app.close();
        await fs.rm(dir, { recursive: true, force: true });
    }
});
test('M7 alternate sessions require explicit resume takeover; stale writer and expired sessions cannot expose questions', async () => {
    const e = await examinationEnvironment();
    try {
        const a = (await e.student.c.request(base + '/cbt/assignments/' + e.assignment.id + '/attempts', 'POST', {})).data, second = client(e.origin);
        assert.equal((await second.login(e.student.user)).status, 200);
        assert.equal((await second.request(base + '/cbt/attempts/' + a.id)).status, 409);
        const resumed = await second.request(base + '/cbt/attempts/' + a.id + '/resume', 'POST', {});
        assert.equal(resumed.status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 409);
        assert.equal((await second.request(base + '/cbt/attempts/' + a.id + '/answers', 'PATCH', { revision: resumed.data.revision, requestId: randomUUID(), changes: [{ questionId: a.questions[0].id, selectedIndex: 0, flagged: false }] })).status, 200);
        await second.request(base + '/auth/logout', 'POST', {});
        assert.equal((await second.request(base + '/cbt/attempts/' + a.id)).status, 401);
        assert.equal((await e.admin.c.request(base + '/admin/accounts/' + e.student.user.id + '/roles', 'POST', { role: 'representative', level: 200, permissions: [], remove: false, reason: 'policy_change' })).status, 200);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 401, 'Mid-exam appointment changes revoke stale sessions immediately');
        e.advance(21 * 60000);
        assert.equal((await e.student.c.request(base + '/cbt/attempts/' + a.id)).status, 401);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 scoped delivery receipts, expiry, current CR grants and community changes synchronize safely', async () => {
    const e = await examinationEnvironment();
    try {
        const body = { title: 'Synthetic M7 level notice', message: 'Synthetic notification test only.', kind: 'lecture_change', priority: 'normal', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now()).toISOString() };
        assert.equal((await e.rep.c.request(base + '/notifications/manage', 'POST', { ...body, level: 100 })).status, 403);
        let r = await e.rep.c.request(base + '/notifications/manage', 'POST', body);
        assert.equal(r.status, 200);
        const id = r.data.id;
        assert.equal((await e.outsider.c.request(base + '/notifications')).data.notices.some(n => n.id === id), false);
        const delivered = await e.student.c.request(base + '/notifications');
        assert.equal(delivered.data.notices.find(n => n.id === id).deliveryStatus, 'delivered');
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM notice_deliveries WHERE notice_id=?').get(id).n, 1);
        assert.equal((await e.student.c.request(base + '/notifications/read/' + id, 'PUT', { revision: r.data.revision, read: true })).status, 200);
        assert.equal((await e.student.c.request(base + '/notifications')).data.notices.find(n => n.id === id).read, true);
        r = await e.rep.c.request(base + '/notifications/manage/' + id + '/expiry', 'PUT', { revision: r.data.revision, expiresAt: new Date(e.now() + 1000).toISOString() });
        assert.equal(r.status, 200);
        e.advance(1001);
        assert.equal((await e.student.c.request(base + '/notifications')).data.notices.some(n => n.id === id), false);
        const before = (await e.student.c.request(base + '/community/changes')).data.version;
        assert.equal((await e.student.c.request(base + '/community/messages', 'POST', { requestId: randomUUID(), body: 'Forbidden closed post', replyTo: null, mentions: [] })).status, 403);
        await e.admin.c.request(base + '/admin/community', 'PATCH', { isOpen: true, reason: 'policy_change' });
        assert.equal((await e.student.c.request(base + '/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic synchronized message', replyTo: null, mentions: [] })).status, 200);
        assert.ok((await e.peer.c.request(base + '/community/changes')).data.version > before);
        await e.admin.c.request(base + '/admin/accounts/' + e.student.user.id + '/chat-suspension', 'POST', { suspended: true, reason: 'policy_change' });
        assert.equal((await e.student.c.request(base + '/community/changes')).data.suspended, true);
        assert.equal((await e.student.c.request(base + '/community/messages', 'POST', { requestId: randomUUID(), body: 'Suspension bypass attempt', replyTo: null, mentions: [] })).status, 403);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 reviewed question import validates schema, sources, corrections and history; student bank access fails', async () => {
    const e = await examinationEnvironment();
    try {
        assert.equal((await e.student.c.request(base + '/admin/cbt/question-bank?courseId=' + e.course.id)).status, 403);
        const template = await e.admin.c.request(base + '/admin/cbt/question-template?courseId=' + e.course.id);
        assert.equal(template.data.schemaVersion, 1);
        const q = { text: 'Synthetic import validation question', topicId: e.course.topics[0].id, category: 'analysis', difficulty: 'intermediate', options: ['First', 'Second'], correctIndex: 1, points: 3, sourceUrl: 'https://example.invalid/review-source', explanation: 'Synthetic only' };
        assert.equal((await e.admin.c.request(base + '/admin/cbt/question-import', 'POST', { schemaVersion: 1, courseId: e.course.id, questions: [{ ...q, correctIndex: 99 }] })).status, 400);
        const imported = await e.admin.c.request(base + '/admin/cbt/question-import', 'POST', { schemaVersion: 1, courseId: e.course.id, questions: [q] });
        assert.equal(imported.status, 200);
        const id = imported.data.ids[0];
        let row = (await e.admin.c.request(base + '/admin/cbt/question-bank?courseId=' + e.course.id)).data.questions.find(q => q.id === id);
        assert.equal(row.status, 'candidate');
        row = (await e.admin.c.request(base + '/admin/cbt/questions/' + id, 'PATCH', { revision: row.revision, action: 'correct', question: { ...q, text: 'Corrected synthetic question' }, reason: 'Synthetic correction review' })).data;
        assert.equal(row.status, 'candidate');
        assert.equal((await e.admin.c.request(base + '/admin/cbt/questions/' + id, 'PATCH', { revision: row.revision, action: 'approve', reason: 'Synthetic approval' })).status, 200);
        const history = (await e.admin.c.request(base + '/admin/cbt/question-bank?courseId=' + e.course.id)).data.questions.find(q => q.id === id).history;
        assert.equal(history.length, 3);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 webhook HTTP route verifies raw signatures, deduplicates and retains refund holds without activating eligibility', async () => {
    const e = await examinationEnvironment();
    try {
        const secret = ['sk', 'test', randomBytes(24).toString('hex')].join('_');
        let reference;
        const transport = async (url, options) => {
            if (url.endsWith('/initialize')) {
                reference = JSON.parse(options.body).reference;
                return new Response(JSON.stringify({ status: true, data: { reference, authorization_url: 'https://checkout.paystack.com/synthetic-only' } }));
            }
            return new Response(JSON.stringify({ status: true, data: { reference, id: 712345, amount: 1000, currency: 'NGN', status: 'success', domain: 'test' } }));
        };
        e.service.config.paystack = { secret, transport };
        e.service.config.paymentPackages = { synthetic: { purpose: 'dues', amount: 1000, currency: 'NGN' } };
        e.operations.payments = new PaymentOperations(e.service);
        const order = await e.admin.c.request(base + '/admin/payments/orders', 'POST', { packageId: 'synthetic' });
        assert.equal(order.status, 200);
        const send = async (event, valid = true) => { const raw = JSON.stringify(event), signature = createHmac('sha512', secret).update(raw).digest('hex'); return fetch(e.origin + base + '/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Paystack-Signature': valid ? signature : '0'.repeat(128) }, body: raw }); };
        const charge = { event: 'charge.success', data: { reference } };
        assert.equal((await send(charge, false)).status, 403);
        const deliveries = await Promise.all([send(charge), send(charge)]);
        assert.ok(deliveries.every(r => r.status === 200));
        assert.equal((await (await send(charge)).json()).duplicate, true);
        const refund = { event: 'refund.processed', data: { amount: 500, transaction: { reference } } };
        assert.equal((await send(refund)).status, 200);
        await send(charge);
        assert.equal(e.service.db.prepare('SELECT status FROM payment_orders WHERE reference=?').get(reference).status, 'refunded');
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM payment_events').get().n, 2);
    }
    finally {
        await e.cleanup();
    }
});
test('M7 unavailable/scanner-rejected PDF remains private and unpersisted', async () => {
    const e = await examinationEnvironment();
    try {
        const draft = await e.rep.c.request(base + '/academic/resources', 'POST', { courseId: e.course.id, resource: { title: 'Synthetic PDF scanning fixture', description: '', category: 'lecture-note', sourceUrl: 'https://example.invalid/source', driveUrl: '' } });
        const body = { revision: 1, filename: 'synthetic.pdf', mediaType: 'application/pdf', content: Buffer.from('%PDF-1.7\nSynthetic scanner-boundary fixture\n%%EOF').toString('base64') };
        e.service.config.scanFile = async () => { throw new Error('Synthetic scanner outage'); };
        assert.equal((await e.rep.c.request(base + '/academic/resources/' + draft.data.id + '/file', 'POST', body)).status, 503);
        e.service.config.scanFile = async () => ({ clean: false, scanner: 'synthetic-test-verdict' });
        assert.equal((await e.rep.c.request(base + '/academic/resources/' + draft.data.id + '/file', 'POST', body)).status, 400);
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM protected_files').get().n, 0);
    }
    finally {
        await e.cleanup();
    }
});
