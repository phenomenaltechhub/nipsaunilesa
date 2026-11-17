import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { operationEnvironment, syntheticCourse, publishedCourse, syntheticRequest, syntheticApplication, approvedApplication } from '../testing/operations-fixtures.mjs';
import { projectAssessment } from '../src/operations/analytics.mjs';
import { seal, unseal } from '../src/security.mjs';
const patch = (c, path, body) => c.request('/api/v1' + path, 'PATCH', body);
test('reviewed academic publication separates working drafts, reviewers and students', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), reviewer = await e.member('reviewer'), student = await e.member(), other = await e.member('student', 100);
    const course = await publishedCourse(e, rep, reviewer);
    assert.equal((await student.c.request('/api/v1/academic/courses')).data.courses.length, 1);
    assert.equal((await other.c.request('/api/v1/academic/courses')).data.courses.length, 0);
    assert.equal((await other.c.request('/api/v1/academic/courses/' + course.id)).status, 404);
    assert.equal((await student.c.request('/api/v1/academic/manage?level=200')).status, 403);
    const edit = await rep.c.request('/api/v1/academic/manage/' + course.id, 'PUT', { revision: course.managementRevision, course: { ...syntheticCourse(), topics: course.topics, title: 'Unreviewed correction' } });
    assert.equal(edit.status, 200);
    assert.equal((await student.c.request('/api/v1/academic/courses/' + course.id)).data.title, course.title);
    const submit = await patch(rep.c, '/academic/manage/' + course.id, { revision: edit.data.revision, action: 'submit', note: 'Review this correction.' });
    assert.equal((await patch(rep.c, '/academic/manage/' + course.id, { revision: submit.data.revision, action: 'publish', note: 'Attempted self approval' })).status, 403);
    assert.equal((await patch(reviewer.c, '/academic/manage/' + course.id, { revision: submit.data.revision, action: 'withdraw', note: 'Withdraw synthetic fixture' })).status, 200);
    assert.equal((await student.c.request('/api/v1/academic/courses/' + course.id)).status, 404);
}
finally {
    await e.cleanup();
} });
test('academic validation and concurrent revisions reject cycles, cross-level submissions and lost updates', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), reviewer = await e.member('reviewer');
    assert.equal((await rep.c.request('/api/v1/academic/manage', 'POST', syntheticCourse(100))).status, 403);
    const cyclic = syntheticCourse();
    cyclic.topics[0].parentId = cyclic.topics[1].id;
    cyclic.topics[1].parentId = cyclic.topics[0].id;
    assert.equal((await rep.c.request('/api/v1/academic/manage', 'POST', cyclic)).status, 400);
    const c = await publishedCourse(e, rep, reviewer);
    const changes = { revision: c.managementRevision, course: { ...syntheticCourse(), topics: c.topics } };
    const results = await Promise.all([rep.c.request('/api/v1/academic/manage/' + c.id, 'PUT', changes), rep.c.request('/api/v1/academic/manage/' + c.id, 'PUT', changes)]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
}
finally {
    await e.cleanup();
} });
test('authenticated course progress persists, synchronizes, reports weak topics and isolates student records', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), reviewer = await e.member('reviewer'), student = await e.member(), peer = await e.member();
    const c = await publishedCourse(e, rep, reviewer), path = '/academic/courses/' + c.id + '/progress', body = { courseRevision: c.revision, topicId: c.topics[0].id, version: 0, change: { covered: true, confidence: 'low', difficult: true, priority: 'high' } };
    const saved = await patch(student.c, path, body);
    assert.equal(saved.status, 200);
    assert.equal(saved.data.summary.coverage, 50);
    assert.ok(saved.data.priorities[0].reasons.includes('Low confidence'));
    assert.equal((await student.c.request('/api/v1' + path)).data.topics[0].covered, true);
    assert.equal((await peer.c.request('/api/v1' + path)).data.summary.coverage, 0);
    assert.equal((await patch(student.c, path, body)).status, 409);
    assert.equal((await patch(student.c, path, { ...body, accountId: peer.user.id })).status, 400);
    assert.equal((await patch(student.c, path, { ...body, topicId: randomUUID() })).status, 400);
}
finally {
    await e.cleanup();
} });
test('course selected access is enforced for catalogue, progress and course notices on every request', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), peer = await e.member();
    const c = await publishedCourse(e, rep, admin);
    assert.equal((await admin.c.request('/api/v1/admin/academic/' + c.id + '/access', 'PUT', { revision: c.managementRevision, audience: 'selected', students: [student.user.id] })).status, 200);
    assert.equal((await peer.c.request('/api/v1/academic/courses/' + c.id)).status, 404);
    assert.equal((await peer.c.request('/api/v1/academic/courses/' + c.id + '/progress')).status, 404);
    assert.equal((await student.c.request('/api/v1/academic/courses/' + c.id)).status, 200);
}
finally {
    await e.cleanup();
} });
test('notifications enforce CR level/course permissions, scoped delivery and duplicate prevention', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), other = await e.member('student', 100);
    const c = await publishedCourse(e, rep, admin), body = { title: 'Synthetic lecture cancellation', message: 'Test fixture, not a real class notice.', kind: 'lecture_cancellation', priority: 'important', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now()).toISOString() };
    assert.equal((await rep.c.request('/api/v1/notifications/manage', 'POST', { ...body, level: 100 })).status, 403);
    assert.equal((await rep.c.request('/api/v1/notifications/manage', 'POST', { ...body, scope: 'all', level: null })).status, 403);
    assert.equal((await student.c.request('/api/v1/notifications/manage', 'POST', body)).status, 403);
    const created = await rep.c.request('/api/v1/notifications/manage', 'POST', body);
    assert.equal(created.status, 200);
    assert.equal((await student.c.request('/api/v1/notifications')).data.notices.length, 1);
    assert.equal((await other.c.request('/api/v1/notifications')).data.notices.length, 0);
    assert.equal((await rep.c.request('/api/v1/notifications/manage', 'POST', body)).status, 409);
    const courseNotice = await rep.c.request('/api/v1/notifications/manage', 'POST', { ...body, title: 'Synthetic course update', scope: 'course', level: null, courseId: c.id });
    assert.equal(courseNotice.status, 200);
    assert.equal((await other.c.request('/api/v1/notifications/read/' + created.data.id, 'PUT', { revision: 1, read: true })).status, 404);
}
finally {
    await e.cleanup();
} });
test('notification receipts, preferences, corrections, withdrawal and scheduled revocation persist safely', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), student = await e.member();
    const body = { title: 'Synthetic optional resource', message: 'Test-only resource message', kind: 'resource', priority: 'normal', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now()).toISOString() };
    let n = (await rep.c.request('/api/v1/notifications/manage', 'POST', body)).data;
    assert.equal((await student.c.request('/api/v1/notifications/read/' + n.id, 'PUT', { revision: n.revision, read: true })).data.read, true);
    n = (await patch(rep.c, '/notifications/manage/' + n.id, { revision: n.revision, action: 'correct', title: body.title, message: 'Corrected synthetic message', priority: 'normal', publishAt: body.publishAt })).data;
    assert.equal((await student.c.request('/api/v1/notifications')).data.notices[0].read, false);
    assert.equal((await student.c.request('/api/v1/notifications/preferences', 'PUT', { revision: 0, announcements: true, resources: false })).status, 200);
    assert.equal((await student.c.request('/api/v1/notifications')).data.notices.length, 0);
    assert.equal((await student.c.request('/api/v1/notifications?includeMuted=true')).data.notices.length, 1);
    assert.equal((await patch(rep.c, '/notifications/manage/' + n.id, { revision: n.revision, action: 'withdraw' })).status, 200);
    assert.equal((await student.c.request('/api/v1/notifications?includeMuted=true')).data.notices.length, 0);
    const scheduled = await rep.c.request('/api/v1/notifications/manage', 'POST', { ...body, title: 'Future synthetic notice', publishAt: new Date(e.now() + 60000).toISOString() });
    e.service.db.prepare('DELETE FROM roles WHERE account_id=? AND role=\'representative\'').run(rep.user.id);
    e.advance(60001);
    assert.equal((await student.c.request('/api/v1/notifications?includeMuted=true')).data.notices.length, 0);
    assert.equal(e.service.db.prepare('SELECT status FROM notices WHERE id=?').get(scheduled.data.id).status, 'held');
}
finally {
    await e.cleanup();
} });
test('community is closed by default and supports actual ordered persistent messaging, replay, replies and reactions', async () => { const e = await operationEnvironment(); try {
    const admin = await e.member('administrator'), student = await e.member(), peer = await e.member();
    const body = { requestId: randomUUID(), body: 'Synthetic <img src=x onerror=alert(1)> text', replyTo: null, mentions: [peer.user.id] };
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', body)).status, 403);
    assert.equal((await patch(student.c, '/admin/community', { isOpen: true, reason: 'policy_change' })).status, 403);
    await patch(admin.c, '/admin/community', { isOpen: true, reason: 'policy_change' });
    const first = await student.c.request('/api/v1/community/messages', 'POST', body);
    assert.equal(first.status, 200);
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', body)).data.id, first.data.id);
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { ...body, body: 'Changed replay' })).status, 409);
    const reply = await peer.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic reply', replyTo: first.data.id, mentions: [] });
    assert.equal(reply.data.replyTo.body, body.body);
    assert.equal((await peer.c.request('/api/v1/community/messages/' + first.data.id + '/reaction', 'PUT', { reaction: 'thanks', active: true })).status, 200);
    const messages = (await student.c.request('/api/v1/community/messages')).data.messages;
    assert.equal(messages.length, 2);
    assert.ok(messages[0].id < messages[1].id);
    assert.equal(messages[0].reactions[0].count, 1);
    assert.ok(!JSON.stringify(messages).includes(student.user.email));
    await patch(admin.c, '/admin/community', { isOpen: false, reason: 'policy_change' });
    assert.equal((await student.c.request('/api/v1/community/messages')).data.messages.length, 2);
    assert.equal((await peer.c.request('/api/v1/community/messages/' + first.data.id + '/reaction', 'PUT', { reaction: 'agree', active: true })).status, 403);
}
finally {
    await e.cleanup();
} });
test('community moderation removes quotes safely, reporting works closed and chat suspension preserves academics', async () => { const e = await operationEnvironment(); try {
    const admin = await e.member('administrator'), student = await e.member(), peer = await e.member();
    await patch(admin.c, '/admin/community', { isOpen: true, reason: 'policy_change' });
    const first = (await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic content to moderate', replyTo: null, mentions: [] })).data;
    await peer.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic reply', replyTo: first.id, mentions: [] });
    assert.equal((await patch(peer.c, '/community/messages/' + first.id, { revision: first.revision, action: 'correct', body: 'Impersonated edit' })).status, 403);
    await patch(admin.c, '/admin/community', { isOpen: false, reason: 'policy_change' });
    const report = await peer.c.request('/api/v1/community/messages/' + first.id + '/report', 'POST', { reason: 'spam', note: 'Synthetic report only' });
    assert.equal(report.status, 200);
    assert.equal((await student.c.request('/api/v1/admin/community/reports')).status, 403);
    assert.equal((await patch(admin.c, '/admin/community/reports/' + report.data.id, { revision: 1, action: 'remove', note: 'Synthetic moderation decision' })).status, 200);
    const rows = (await student.c.request('/api/v1/community/messages')).data.messages;
    assert.equal(rows[1].replyTo.body, 'Message removed');
    assert.ok(!JSON.stringify(rows).includes('Synthetic content to moderate'));
    await patch(admin.c, '/admin/community', { isOpen: true, reason: 'policy_change' });
    await admin.c.request('/api/v1/admin/accounts/' + student.user.id + '/chat-suspension', 'POST', { suspended: true, reason: 'policy_change' });
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Attempted suspended post', replyTo: null, mentions: [] })).status, 403);
    assert.equal((await student.c.request('/api/v1/academic/courses')).status, 200);
}
finally {
    await e.cleanup();
} });
test('community pagination, spam limits and concurrent replay do not duplicate persisted writes', async () => { const e = await operationEnvironment(); try {
    const admin = await e.member('administrator'), student = await e.member();
    await patch(admin.c, '/admin/community', { isOpen: true, reason: 'policy_change' });
    for (let i = 0; i < 8; i++)
        assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic ordered post ' + i, replyTo: null, mentions: [] })).status, 200);
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic rate limited post', replyTo: null, mentions: [] })).status, 429);
    for (let i = 8; i < 33; i++) {
        e.advance(61000);
        await student.c.bootstrap();
        assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic ordered post ' + i, replyTo: null, mentions: [] })).status, 200);
    }
    const page = (await student.c.request('/api/v1/community/messages')).data;
    assert.equal(page.messages.length, 30);
    const older = (await student.c.request('/api/v1/community/messages?before=' + page.olderCursor)).data;
    assert.equal(older.messages.length, 3);
    e.advance(61000);
    const body = { requestId: randomUUID(), body: 'Synthetic concurrent request', replyTo: null, mentions: [] };
    const result = await Promise.all([student.c.request('/api/v1/community/messages', 'POST', body), student.c.request('/api/v1/community/messages', 'POST', body)]);
    assert.equal(result[0].data.id, result[1].data.id);
}
finally {
    await e.cleanup();
} });
test('CBT is closed by default and stage-two access requires specific initial approval and ownership', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), peer = await e.member();
    const c = await publishedCourse(e, rep, admin);
    assert.equal((await student.c.request('/api/v1/cbt/policy')).data.intakeOpen, false);
    assert.equal((await student.c.request('/api/v1/cbt/requests', 'POST', syntheticRequest(e, c))).status, 409);
    await admin.c.request('/api/v1/admin/cbt/policy', 'PUT', { revision: 1, intakeOpen: true, visibilityWarnings: 2 });
    const request = await student.c.request('/api/v1/cbt/requests', 'POST', syntheticRequest(e, c));
    assert.equal(request.status, 200);
    assert.equal((await student.c.request('/api/v1/cbt/requests/' + request.data.id + '/template')).status, 403);
    assert.equal((await peer.c.request('/api/v1/cbt/requests/' + request.data.id)).status, 404);
    assert.equal((await patch(student.c, '/admin/cbt/requests/' + request.data.id + '/decision', { revision: 1, action: 'approve_initial', note: 'Escalation attempt' })).status, 403);
    const decision = await patch(admin.c, '/admin/cbt/requests/' + request.data.id + '/decision', { revision: 1, action: 'approve_initial', note: 'Synthetic initial review' });
    assert.equal(decision.status, 200);
    assert.equal((await student.c.request('/api/v1/cbt/requests/' + request.data.id + '/template')).status, 200);
    assert.equal((await peer.c.request('/api/v1/cbt/requests/' + request.data.id + '/template')).status, 404);
    assert.equal((await student.c.request('/api/v1/cbt/requests', 'POST', { ...syntheticRequest(e, c), level: 100 })).status, 403);
    assert.equal((await student.c.request('/api/v1/cbt/assignments')).data.assignments.length, 0);
}
finally {
    await e.cleanup();
} });
test('CBT applications validate protected JSON documents, encrypt questions and support withdrawal/reopen', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member();
    const c = await publishedCourse(e, rep, admin), approved = await approvedApplication(e, student, admin, c);
    const stored = e.service.db.prepare('SELECT encrypted_payload FROM cbt_applications WHERE request_id=?').get(approved.id).encrypted_payload;
    assert.ok(!stored.includes('Synthetic nonacademic'));
    assert.equal(JSON.parse(unseal(e.service.config.encryptionKey, stored)).courseId, c.id);
    assert.equal((await student.c.request('/api/v1/admin/cbt/requests/' + approved.id + '/questions')).status, 403);
    const withdrawn = await patch(admin.c, '/admin/cbt/requests/' + approved.id + '/decision', { revision: approved.request.revision, action: 'withdraw', note: 'Synthetic authorization withdrawal' });
    assert.equal(withdrawn.status, 200);
    assert.equal((await student.c.request('/api/v1/cbt/requests/' + approved.id + '/application')).status, 403);
    assert.equal((await patch(admin.c, '/admin/cbt/requests/' + approved.id + '/decision', { revision: withdrawn.data.revision, action: 'reopen', note: 'Synthetic review restarted' })).data.status, 'submitted');
    assert.equal((await student.c.request('/api/v1/cbt/requests/' + approved.id + '/document', 'POST', { revision: 1, filename: '../../evil.json', mediaType: 'application/json', content: Buffer.from('{}').toString('base64') })).status, 403);
}
finally {
    await e.cleanup();
} });
test('CBT protected document upload rejects traversal, binary, active types and malformed/schema-abusive data', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member();
    const c = await publishedCourse(e, rep, admin);
    await admin.c.request('/api/v1/admin/cbt/policy', 'PUT', { revision: 1, intakeOpen: true, visibilityWarnings: 3 });
    let r = (await student.c.request('/api/v1/cbt/requests', 'POST', syntheticRequest(e, c))).data;
    r = (await patch(admin.c, '/admin/cbt/requests/' + r.id + '/decision', { revision: r.revision, action: 'approve_initial', note: 'Synthetic approval' })).data;
    const base = { revision: r.revision, filename: 'application.json', mediaType: 'application/json', content: Buffer.from(JSON.stringify(syntheticApplication(e, c))).toString('base64') };
    for (const change of [{ filename: '../application.json' }, { filename: 'application.svg' }, { mediaType: 'image/svg+xml' }, { content: Buffer.from('<script>alert(1)</script>').toString('base64') }, { content: '!!!!' }, { content: Buffer.from(JSON.stringify({ ...syntheticApplication(e, c), accountId: admin.user.id })).toString('base64') }])
        assert.equal((await student.c.request('/api/v1/cbt/requests/' + r.id + '/document', 'POST', { ...base, ...change })).status, 400);
    assert.equal((await student.c.request('/api/v1/cbt/requests/' + r.id + '/document', 'POST', base)).status, 200);
}
finally {
    await e.cleanup();
} });
test('selected CBT batches enforce exact identities, authorization, capacity, uniqueness and assignment isolation', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), peer = await e.member(), other = await e.member('student', 100), c = await publishedCourse(e, rep, admin), application = await approvedApplication(e, student, admin, c);
    const plan = { courseId: c.id, requestId: application.id, title: 'Synthetic selected assessment', kind: 'pre_exam_revision', startsAt: new Date(e.now() + 2 * 86400000).toISOString(), durationMinutes: 30, attemptLimit: 1, capacity: 2, questionIds: application.questions.map(q => q.id) };
    assert.equal((await student.c.request('/api/v1/admin/cbt/exams', 'POST', plan)).status, 403);
    let exam = (await admin.c.request('/api/v1/admin/cbt/exams', 'POST', plan)).data;
    assert.ok(exam.id);
    const batch = { revision: exam.revision, title: 'Synthetic selected batch', startsAt: plan.startsAt, capacity: 2, studentIds: [student.user.id, other.user.id] };
    assert.equal((await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', batch)).status, 400);
    assert.equal((await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', { ...batch, capacity: 1, studentIds: [student.user.id, peer.user.id] })).status, 409);
    const created = await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', { ...batch, studentIds: [student.user.id] });
    assert.equal(created.status, 200);
    const scheduled = await patch(admin.c, '/admin/cbt/exams/' + exam.id, { revision: created.data.revision, action: 'schedule' });
    assert.equal(scheduled.status, 200);
    const assignment = (await student.c.request('/api/v1/cbt/assignments')).data.assignments[0];
    assert.equal(assignment.state, 'not_started');
    assert.equal((await peer.c.request('/api/v1/cbt/assignments')).data.assignments.length, 0);
    assert.equal((await peer.c.request('/api/v1/cbt/assignments/' + assignment.id + '/results')).status, 404);
    assert.equal((await student.c.request('/api/v1/cbt/assignments/' + assignment.id + '/start', 'POST', {})).status, 404);
    assert.equal((await student.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/monitor')).status, 403);
    assert.equal((await student.c.request('/api/v1/notifications')).data.notices.filter(n => n.kind === 'cbt_invitation').length, 1);
    assert.equal((await peer.c.request('/api/v1/notifications')).data.notices.length, 0);
    assert.ok(!JSON.stringify(assignment).includes('correctIndex'));
    assert.equal((await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/monitor')).data.assignments[0].state, 'not_started');
}
finally {
    await e.cleanup();
} });
test('CBT approvals and scheduling reject replay, incomplete blueprints and stale concurrent updates', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), c = await publishedCourse(e, rep, admin), application = await approvedApplication(e, student, admin, c);
    let exam = (await admin.c.request('/api/v1/admin/cbt/exams', 'POST', { courseId: c.id, requestId: application.id, title: 'Synthetic planning only', kind: 'pre_exam_revision', startsAt: new Date(e.now() + 2 * 86400000).toISOString(), durationMinutes: 30, attemptLimit: 1, capacity: 2, questionIds: [] })).data;
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + exam.id, { revision: exam.revision, action: 'schedule' })).status, 409);
    const batch = { revision: exam.revision, title: 'Synthetic one-student batch', startsAt: new Date(exam.starts_at).toISOString(), capacity: 1, studentIds: [student.user.id] };
    const results = await Promise.all([admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', batch), admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', batch)]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    exam = (await admin.c.request('/api/v1/admin/cbt/exams')).data.exams[0];
    exam = (await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/blueprint', 'PUT', { revision: exam.revision, questionIds: application.questions.map(q => q.id) })).data;
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + exam.id, { revision: exam.revision, action: 'schedule' })).status, 200);
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + exam.id, { revision: exam.revision, action: 'schedule' })).status, 409);
    assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM notices WHERE kind=\'cbt_invitation\'').get().n, 1);
}
finally {
    await e.cleanup();
} });
test('assessment analytics use trusted evidence and unpublished or another student results remain protected', async () => {
    const q = [{ id: 'synthetic-a', topicId: 'synthetic-topic-a', category: 'recall', options: ['First', 'Second'], correctIndex: 0, points: 2 }, { id: 'synthetic-b', topicId: 'synthetic-topic-b', category: 'analysis', options: ['First', 'Second'], correctIndex: 1, points: 1 }];
    const analytics = projectAssessment(q, { 'synthetic-a': 0 }, 75);
    assert.equal(analytics.score, 2);
    assert.equal(analytics.maximum, 3);
    assert.equal(analytics.unanswered, 1);
    assert.deepEqual(analytics.revisionTopicIds, ['synthetic-topic-b']);
    assert.ok(!JSON.stringify(analytics).includes('correctIndex'));
    assert.throws(() => projectAssessment(q, { 'unknown-id': 0 }, 20));
    const e = await operationEnvironment();
    try {
        const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), peer = await e.member(), c = await publishedCourse(e, rep, admin);
        const exam = (await admin.c.request('/api/v1/admin/cbt/exams', 'POST', { courseId: c.id, requestId: null, title: 'Synthetic analytics fixture only', kind: 'periodic', startsAt: new Date(e.now() + 2 * 86400000).toISOString(), durationMinutes: 30, attemptLimit: 1, capacity: 2, questionIds: [] })).data;
        await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', { revision: exam.revision, title: 'Synthetic batch', startsAt: new Date(exam.starts_at).toISOString(), capacity: 1, studentIds: [student.user.id] });
        const assignment = (await student.c.request('/api/v1/cbt/assignments')).data.assignments[0];
        assert.equal((await student.c.request('/api/v1/cbt/assignments/' + assignment.id + '/results')).status, 404);
        // Explicit isolated simulation of a future trusted-engine output, not operational exam delivery.
        e.service.db.prepare('UPDATE cbt_assignments SET state=\'submitted\' WHERE id=?').run(assignment.id);
        e.service.db.prepare('INSERT INTO cbt_results(assignment_id,encrypted_payload,status,revision)VALUES(?,?,\'reviewed\',1)').run(assignment.id, seal(e.service.config.encryptionKey, JSON.stringify(analytics)));
        assert.equal((await peer.c.request('/api/v1/cbt/assignments/' + assignment.id + '/results')).status, 404);
        assert.equal((await student.c.request('/api/v1/cbt/assignments/' + assignment.id + '/results')).status, 404);
        assert.equal((await patch(admin.c, '/admin/cbt/results/' + assignment.id, { revision: 1 })).status, 200);
        assert.equal((await student.c.request('/api/v1/cbt/assignments/' + assignment.id + '/results')).data.analytics.score, 2);
        assert.equal((await student.c.request('/api/v1/cbt/results')).data.assessments.length, 1);
        assert.equal((await peer.c.request('/api/v1/cbt/results')).data.assessments.length, 0);
        assert.equal((await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/monitor')).data.assignments[0].state, 'submitted');
        assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM notices').get().n, 0);
    }
    finally {
        await e.cleanup();
    }
});
test('M6 mutations roll back without audit and current grants/sessions are checked after revocation', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member();
    e.service.db.exec("CREATE TRIGGER synthetic_audit_failure BEFORE INSERT ON audit BEGIN SELECT RAISE(ABORT,'Test audit failure');END");
    const created = await rep.c.request('/api/v1/academic/manage', 'POST', syntheticCourse());
    assert.equal(created.status, 503);
    assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM courses').get().n, 0);
    e.service.db.exec('DROP TRIGGER synthetic_audit_failure');
    assert.equal((await admin.c.request('/api/v1/admin/accounts/' + rep.user.id + '/roles', 'POST', { role: 'representative', level: 200, permissions: [], remove: true, reason: 'security_review' })).status, 200);
    assert.equal((await rep.c.request('/api/v1/academic/manage', 'POST', syntheticCourse())).status, 401);
    await student.c.request('/api/v1/auth/logout', 'POST', {});
    assert.equal((await student.c.request('/api/v1/community/messages')).status, 401);
    const response = await admin.c.request('/api/v1/admin/cbt/policy', 'PUT', { revision: 1, intakeOpen: true, visibilityWarnings: 1 });
    assert.equal(response.status, 400);
    assert.equal((await admin.c.request('/api/v1/cbt/policy')).data.intakeOpen, false);
}
finally {
    await e.cleanup();
} });
test('targeted password lockouts do not extend on blocked guesses or revoke owner academic access', async () => { const e = await operationEnvironment(); try {
    const owner = await e.member();
    const { client } = await import('../testing/client.mjs'), attacker = client(e.origin);
    await attacker.bootstrap();
    for (let i = 0; i < 3; i++)
        assert.equal((await attacker.request('/api/v1/auth/login', 'POST', { email: owner.user.email, password: 'Incorrect synthetic password' })).status, 401);
    const subject = e.service.hash('login:' + owner.user.email), deadline = e.service.db.prepare('SELECT locked_until FROM login_failures WHERE subject=?').get(subject).locked_until;
    for (let i = 0; i < 8; i++)
        assert.equal((await attacker.request('/api/v1/auth/login', 'POST', { email: owner.user.email, password: 'Incorrect synthetic password' })).status, 401);
    assert.equal(e.service.db.prepare('SELECT locked_until FROM login_failures WHERE subject=?').get(subject).locked_until, deadline);
    assert.equal((await owner.c.request('/api/v1/academic/courses')).status, 200);
    assert.equal((await owner.c.request('/api/v1/auth/password', 'POST', { currentPassword: owner.user.password, password: randomUUID() + randomUUID() })).status, 200);
    assert.equal(e.service.db.prepare('SELECT count(*) AS n FROM login_failures').get().n, 0);
}
finally {
    await e.cleanup();
} });
test('batch rescheduling rejects student conflicts and cannot reset submitted records', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member(), c = await publishedCourse(e, rep, admin);
    const base = { courseId: c.id, requestId: null, title: 'Synthetic scheduling test', kind: 'periodic', startsAt: new Date(e.now() + 2 * 86400000).toISOString(), durationMinutes: 30, attemptLimit: 1, capacity: 2, questionIds: [] };
    const first = (await admin.c.request('/api/v1/admin/cbt/exams', 'POST', base)).data;
    await admin.c.request('/api/v1/admin/cbt/exams/' + first.id + '/batches', 'POST', { revision: 1, title: 'Synthetic first slot', startsAt: base.startsAt, capacity: 1, studentIds: [student.user.id] });
    const second = (await admin.c.request('/api/v1/admin/cbt/exams', 'POST', { ...base, startsAt: new Date(e.now() + 3 * 86400000).toISOString() })).data;
    let batch = await admin.c.request('/api/v1/admin/cbt/exams/' + second.id + '/batches', 'POST', { revision: 1, title: 'Synthetic second slot', startsAt: new Date(second.starts_at).toISOString(), capacity: 1, studentIds: [student.user.id] });
    assert.equal(batch.status, 200);
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + second.id, { revision: batch.data.revision, action: 'reschedule', startsAt: base.startsAt })).status, 409);
    e.service.db.prepare('UPDATE cbt_assignments SET state=\'submitted\' WHERE exam_id=?').run(second.id);
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + second.id, { revision: batch.data.revision, action: 'reschedule', startsAt: new Date(e.now() + 4 * 86400000).toISOString() })).status, 409);
    assert.equal((await patch(admin.c, '/admin/cbt/exams/' + second.id, { revision: batch.data.revision, action: 'cancel' })).status, 200);
    assert.equal(e.service.db.prepare('SELECT state FROM cbt_assignments WHERE exam_id=?').get(second.id).state, 'submitted');
}
finally {
    await e.cleanup();
} });
test('reviewed result projection cannot expose a proposed answer key or arbitrary engine fields', async () => { const { publicAnalytics } = await import('../src/operations/analytics.mjs'); const value = projectAssessment([{ id: 'synthetic-q', topicId: 'synthetic-topic', category: 'recall', options: ['One', 'Two'], correctIndex: 0, points: 1 }], { 'synthetic-q': 1 }, 30); const safe = publicAnalytics({ ...value, correctIndex: 0, answerKeys: { private: true }, questions: ['Never disclose'] }); assert.ok(!JSON.stringify(safe).includes('correctIndex')); assert.ok(!JSON.stringify(safe).includes('answerKeys')); assert.ok(!JSON.stringify(safe).includes('Never disclose')); assert.throws(() => publicAnalytics({ ...value, score: 99 })); });
test('M6 endpoints reject cross-origin writes, account overrides and unsafe date/application transitions', async () => { const e = await operationEnvironment(); try {
    const admin = await e.member('administrator'), student = await e.member();
    assert.equal((await admin.c.request('/api/v1/admin/cbt/policy', 'PUT', { revision: 1, intakeOpen: true, visibilityWarnings: 3 }, { Origin: 'https://untrusted.example.invalid' })).status, 403);
    assert.equal((await student.c.request('/api/v1/community/messages', 'POST', { requestId: randomUUID(), body: 'Synthetic body', accountId: admin.user.id })).status, 403);
    assert.equal((await student.c.request('/api/v1/notifications/preferences', 'PUT', { revision: 0, announcements: true, resources: true, accountId: admin.user.id })).status, 400);
    const { instant } = await import('../src/operations/common.mjs');
    assert.throws(() => instant('2026-02-30T12:00:00Z'));
    assert.throws(() => instant('2026-11-17T25:00:00Z'));
    assert.equal((await patch(student.c, '/admin/cbt/policy', { revision: 1, intakeOpen: true, visibilityWarnings: 3 })).status, 404);
}
finally {
    await e.cleanup();
} });
test('administrators cannot publish their own corrections to another author course', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), reviewer = await e.member('reviewer'), course = await publishedCourse(e, rep, reviewer);
    let edited = await admin.c.request('/api/v1/academic/manage/' + course.id, 'PUT', { revision: course.managementRevision, course: { ...syntheticCourse(), topics: course.topics, title: 'Synthetic administrator correction' } });
    assert.equal(edited.status, 200);
    let submitted = await patch(admin.c, '/academic/manage/' + course.id, { revision: edited.data.revision, action: 'submit', note: 'Independent review requested.' });
    assert.equal(submitted.status, 200);
    assert.equal((await patch(admin.c, '/academic/manage/' + course.id, { revision: submitted.data.revision, action: 'publish', note: 'Attempted own correction approval.' })).status, 403);
    assert.equal((await patch(reviewer.c, '/academic/manage/' + course.id, { revision: submitted.data.revision, action: 'publish', note: 'Independent synthetic review.' })).status, 200);
}
finally {
    await e.cleanup();
} });
test('administrative scheduled corrections revalidate the actual publisher and preserve sender attribution', async () => { const e = await operationEnvironment(); try {
    const rep = await e.member('representative'), admin = await e.member('administrator'), student = await e.member();
    const n = (await rep.c.request('/api/v1/notifications/manage', 'POST', { title: 'Synthetic future notice', message: 'Synthetic original sender text.', kind: 'announcement', priority: 'normal', scope: 'level', level: 200, courseId: null, publishAt: new Date(e.now() + 60000).toISOString() })).data;
    assert.equal((await patch(admin.c, '/notifications/manage/' + n.id, { revision: n.revision, action: 'correct', title: n.title, message: 'Synthetic administrator correction.', priority: 'important', publishAt: new Date(e.now() + 60000).toISOString() })).status, 200);
    e.service.db.prepare('DELETE FROM roles WHERE account_id=? AND role=\'representative\'').run(rep.user.id);
    e.advance(60001);
    const delivered = (await student.c.request('/api/v1/notifications')).data.notices[0];
    assert.equal(delivered.sender.name, rep.user.name);
    assert.equal(delivered.correctedBy, admin.user.name);
    assert.equal(delivered.status, 'published');
}
finally {
    await e.cleanup();
} });

test('interruption policy counts visibility warnings separately and never applies automatic mobile penalties',async()=>{const {interruptionReview}=await import('../src/operations/integrity.mjs');const events=[{kind:'visibility_hidden',sequence:1},{kind:'disconnected',sequence:2},{kind:'visibility_hidden',sequence:3}];assert.equal(interruptionReview(events,2).requiresAdministrativeReview,true);assert.equal(interruptionReview(events,3).requiresAdministrativeReview,false);assert.equal(interruptionReview(events,2).automaticPenalty,false);assert.equal(interruptionReview(events,2).disconnections,1);assert.throws(()=>interruptionReview(events,1));});
