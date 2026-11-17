import { publicAnalytics } from './analytics.mjs';
import { randomUUID } from 'node:crypto';
import { TextDecoder } from 'node:util';
import { seal, unseal } from '../security.mjs';
import { academicSourceUrl } from '../../../student-pwa/src/modules/academic/models.js';
import { fields, fail, plain, integer, identifier, revision, list, choices, future } from './common.mjs';
const applicationStates = ['initial_approved', 'application_submitted', 'application_revisions', 'application_approved'];
export class CbtOperations {
    constructor(service, academic, notifications) { this.s = service; this.db = service.db; this.academic = academic; this.notifications = notifications; }
    policy(session) { this.s.requireUser(session); const row = this.db.prepare('SELECT * FROM cbt_policy WHERE id=1').get(); return { intakeOpen: Boolean(row.intake_open), visibilityWarnings: row.visibility_warnings, revision: row.revision, deliveryOperational: false }; }
    setPolicy(session, input) { fields(input, ['revision', 'intakeOpen', 'visibilityWarnings']); if (typeof input.intakeOpen !== 'boolean' || ![2, 3].includes(input.visibilityWarnings))
        fail(400, 'INVALID_POLICY'); return this.s.tx(() => { const actor = this.s.requireAdmin(session), old = this.policy(session); revision(old, input.revision); this.db.prepare('UPDATE cbt_policy SET intake_open=?,visibility_warnings=?,revision=revision+1 WHERE id=1').run(input.intakeOpen ? 1 : 0, input.visibilityWarnings); this.s.audit(actor.id, 'cbt.policy_changed', null, { intakeOpen: input.intakeOpen, visibilityWarnings: input.visibilityWarnings }); return this.policy(session); }); }
    row(id) { const row = this.db.prepare('SELECT * FROM cbt_requests WHERE id=?').get(identifier(id)); if (!row)
        fail(404, 'NOT_FOUND'); return row; }
    owned(session, id, application = false) { const user = this.s.requireUser(session), row = this.row(id); if (session.active_role === 'administrator')
        this.s.requireAdmin(session);
    else {
        if (row.requester !== user.id)
            fail(404, 'NOT_FOUND');
        this.academic.published(session, row.course_id);
        if (application && !applicationStates.includes(row.status))
            fail(403, 'APPLICATION_NOT_AUTHORIZED');
    } return row; }
    dto(row) { return { id: row.id, courseId: row.course_id, requester: row.requester, ...JSON.parse(row.payload), status: row.status, revision: row.revision, history: this.db.prepare('SELECT action,note,created_at FROM cbt_decisions WHERE request_id=? ORDER BY id').all(row.id) }; }
    list(session) { const user = this.s.requireUser(session); if (session.active_role === 'administrator')
        this.s.requireAdmin(session); return { policy: this.policy(session), requests: this.db.prepare('SELECT * FROM cbt_requests ORDER BY created_at DESC LIMIT 100').all().filter(r => session.active_role === 'administrator' || r.requester === user.id).map(r => this.dto(r)) }; }
    request(session, input) { fields(input, ['courseId', 'level', 'purpose', 'topicIds', 'periodStart', 'periodEnd', 'justification']); const user = this.s.requireUser(session); if (input.level !== user.level)
        fail(403, 'LEVEL_FORBIDDEN'); const course = this.academic.content(this.academic.published(session, input.courseId)); choices(input.purpose, ['pre_exam_revision']); const topicIds = list(input.topicIds, 80); if (!topicIds.length || new Set(topicIds).size !== topicIds.length || topicIds.some(id => !course.topics.some(t => t.id === id)))
        fail(400, 'INVALID_TOPICS'); const start = future(input.periodStart, this.s.now()), end = future(input.periodEnd, this.s.now()); if (end <= start)
        fail(400, 'INVALID_PERIOD'); const justification = plain(input.justification, 1000); this.s.rate('cbt-request:' + user.id, 3, 86400000); return this.s.tx(() => { this.s.requireUser(session); this.academic.published(session, input.courseId); if (!this.policy(session).intakeOpen)
        fail(409, 'CBT_INTAKE_CLOSED'); if (this.db.prepare('SELECT 1 FROM cbt_requests WHERE requester=? AND course_id=? AND status NOT IN(\'rejected\',\'closed\',\'withdrawn\')').get(user.id, input.courseId))
        fail(409, 'REQUEST_EXISTS'); const id = randomUUID(), payload = { level: user.level, purpose: input.purpose, topicIds, periodStart: input.periodStart, periodEnd: input.periodEnd, justification }; this.db.prepare('INSERT INTO cbt_requests(id,requester,course_id,payload,created_at,updated_at)VALUES(?,?,?,?,?,?)').run(id, user.id, input.courseId, JSON.stringify(payload), this.s.now(), this.s.now()); this.s.audit(user.id, 'cbt.request_created', id, { courseId: input.courseId }); return this.dto(this.row(id)); }); }
    clarify(session, id, input) { fields(input, ['revision', 'justification']); return this.s.tx(() => { const row = this.owned(session, id); revision(row, input.revision); if (row.requester !== session.user.id || row.status !== 'clarification')
        fail(409, 'INVALID_TRANSITION'); const payload = { ...JSON.parse(row.payload), justification: plain(input.justification, 1000) }; this.db.prepare('UPDATE cbt_requests SET payload=?,status=\'submitted\',revision=revision+1,updated_at=? WHERE id=?').run(JSON.stringify(payload), this.s.now(), id); this.s.audit(session.user.id, 'cbt.clarification_submitted', id); return this.dto(this.row(id)); }); }
    decide(session, id, input) { fields(input, ['revision', 'action', 'note']); const note = plain(input.note, 1000); return this.s.tx(() => { const actor = this.s.requireAdmin(session), row = this.row(id); revision(row, input.revision); const transitions = { approve_initial: ['submitted', 'initial_approved'], clarify: ['submitted', 'clarification'], approve_application: ['application_submitted', 'application_approved'], revise_application: ['application_submitted', 'application_revisions'] }; let next; if (Object.hasOwn(transitions, input.action)) {
        const [from, to] = transitions[input.action];
        if (row.status !== from)
            fail(409, 'INVALID_TRANSITION');
        next = to;
    }
    else if (['reject', 'close', 'withdraw'].includes(input.action)) {
        next = { reject: 'rejected', close: 'closed', withdraw: 'withdrawn' }[input.action];
        if (['rejected', 'closed', 'withdrawn'].includes(row.status))
            fail(409, 'INVALID_TRANSITION');
    }
    else if (input.action === 'reopen') {
        if (!['rejected', 'closed', 'withdrawn'].includes(row.status))
            fail(409, 'INVALID_TRANSITION');
        next = 'submitted';
    }
    else
        fail(400, 'INVALID_ACTION'); if (input.action === 'approve_application') {
        const document = this.db.prepare('SELECT * FROM cbt_applications WHERE request_id=?').get(id);
        if (!document)
            fail(409, 'APPLICATION_REQUIRED');
        const application = JSON.parse(unseal(this.s.config.encryptionKey, document.encrypted_payload));
        for (const question of application.questions)
            this.db.prepare('INSERT INTO cbt_questions(id,request_id,course_id,encrypted_payload)VALUES(?,?,?,?)').run(randomUUID(), id, row.course_id, seal(this.s.config.encryptionKey, JSON.stringify(question)));
    } if (['withdraw', 'close', 'reject', 'reopen'].includes(input.action)) {
        for (const exam of this.db.prepare('SELECT id FROM cbt_exams WHERE request_id=? UNION SELECT b.exam_id AS id FROM cbt_blueprints b JOIN cbt_questions q ON q.id=b.question_id WHERE q.request_id=?').all(id, id))
            this.cancel(session, exam.id);
        this.db.prepare('UPDATE cbt_questions SET status=\'withdrawn\',revision=revision+1 WHERE request_id=?').run(id);
    } this.db.prepare('UPDATE cbt_requests SET status=?,revision=revision+1,updated_at=? WHERE id=?').run(next, this.s.now(), id); this.db.prepare('INSERT INTO cbt_decisions(request_id,actor,action,note,revision,created_at)VALUES(?,?,?,?,?,?)').run(id, actor.id, input.action, note, row.revision + 1, this.s.now()); this.s.audit(actor.id, 'cbt.' + input.action, id, { revision: row.revision + 1 }); return this.dto(this.row(id)); }); }
    template(session, id) { const row = this.owned(session, id, true), course = this.academic.content(this.academic.row(row.course_id)); return { schemaVersion: 1, courseId: course.id, topicIds: JSON.parse(row.payload).topicIds, sourceUrls: [], proposedDate: '', durationMinutes: 30, participants: 1, instructions: '', questions: [] }; }
    validateApplication(session, row, input) { fields(input, ['schemaVersion', 'courseId', 'topicIds', 'sourceUrls', 'proposedDate', 'durationMinutes', 'participants', 'instructions', 'questions']); if (input.schemaVersion !== 1 || input.courseId !== row.course_id)
        fail(400, 'INVALID_APPLICATION'); const course = this.academic.content(this.academic.row(row.course_id)), requested = JSON.parse(row.payload); const topics = list(input.topicIds, 80); if (!topics.length || new Set(topics).size !== topics.length || topics.some(id => !requested.topicIds.includes(id) || !course.topics.some(t => t.id === id)))
        fail(400, 'INVALID_TOPICS'); const sources = list(input.sourceUrls, 20).map(url => { const safe = academicSourceUrl(url); if (!safe)
        fail(400, 'INVALID_SOURCE'); return safe; }); if (!sources.length)
        fail(400, 'SOURCE_REQUIRED'); const date = future(input.proposedDate, this.s.now()); if (date < Date.parse(requested.periodStart) || date > Date.parse(requested.periodEnd))
        fail(400, 'OUTSIDE_PERIOD'); integer(input.durationMinutes, 5, 240); integer(input.participants, 1, 1000); const questions = list(input.questions, 20).map(q => { fields(q, ['text', 'topicId', 'category', 'options', 'correctIndex', 'points', 'sourceUrl']); if (!topics.includes(q.topicId))
        fail(400, 'INVALID_TOPICS'); const options = list(q.options, 6).map(o => plain(o, 250)); if (options.length < 2 || new Set(options).size !== options.length)
        fail(400, 'INVALID_OPTIONS'); integer(q.correctIndex, 0, options.length - 1); const sourceUrl = academicSourceUrl(q.sourceUrl); if (!sourceUrl)
        fail(400, 'INVALID_SOURCE'); return { text: plain(q.text, 700), topicId: q.topicId, category: choices(q.category, ['recall', 'application', 'analysis']), options, correctIndex: q.correctIndex, points: integer(q.points, 1, 20), sourceUrl }; }); return { schemaVersion: 1, courseId: row.course_id, topicIds: topics, sourceUrls: sources, proposedDate: input.proposedDate, durationMinutes: input.durationMinutes, participants: input.participants, instructions: plain(input.instructions ?? '', 1000, true), questions }; }
    submit(session, id, input) { fields(input, ['revision', 'document']); return this.s.tx(() => { const row = this.owned(session, id, true); if (row.requester !== session.user.id || !['initial_approved', 'application_revisions'].includes(row.status))
        fail(403, 'APPLICATION_NOT_AUTHORIZED'); revision(row, input.revision); const data = this.validateApplication(session, row, input.document); this.db.prepare('INSERT INTO cbt_applications VALUES(?,?,?,?,?) ON CONFLICT(request_id) DO UPDATE SET encrypted_payload=excluded.encrypted_payload,filename=excluded.filename,revision=excluded.revision,created_at=excluded.created_at').run(id, seal(this.s.config.encryptionKey, JSON.stringify(data)), 'cbt-application.json', row.revision + 1, this.s.now()); this.db.prepare('UPDATE cbt_requests SET status=\'application_submitted\',revision=revision+1,updated_at=? WHERE id=?').run(this.s.now(), id); this.s.audit(session.user.id, 'cbt.application_submitted', id, { revision: row.revision + 1 }); return this.dto(this.row(id)); }); }
    upload(session, id, input) { fields(input, ['revision', 'filename', 'mediaType', 'content']); this.owned(session, id, true); if (typeof input.filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,70}\.json$/.test(input.filename) || input.mediaType !== 'application/json' || typeof input.content !== 'string' || input.content.length > 14000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.content))
        fail(400, 'UNSAFE_DOCUMENT'); const bytes = Buffer.from(input.content, 'base64'); if (!bytes.length || bytes.length > 10000 || bytes.toString('base64') !== input.content)
        fail(400, 'UNSAFE_DOCUMENT'); let document; try {
        document = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    }
    catch {
        fail(400, 'INVALID_DOCUMENT');
    } return this.submit(session, id, { revision: input.revision, document }); }
    application(session, id) { const row = this.owned(session, id, true), document = this.db.prepare('SELECT * FROM cbt_applications WHERE request_id=?').get(id); if (!document)
        fail(404, 'NOT_FOUND'); return { requestId: row.id, document: JSON.parse(unseal(this.s.config.encryptionKey, document.encrypted_payload)), revision: document.revision }; }
    questions(session, requestId) { this.s.requireAdmin(session); this.row(requestId); return { questions: this.db.prepare('SELECT * FROM cbt_questions WHERE request_id=? ORDER BY id').all(requestId).map(r => ({ id: r.id, revision: r.revision, status: r.status, ...JSON.parse(unseal(this.s.config.encryptionKey, r.encrypted_payload)) })) }; }
    authorize(session, id, input) { fields(input, ['revision']); return this.s.tx(() => { const actor = this.s.requireAdmin(session), row = this.db.prepare('SELECT * FROM cbt_questions WHERE id=?').get(identifier(id)); if (!row)
        fail(404, 'NOT_FOUND'); revision(row, input.revision); if (this.row(row.request_id).status !== 'application_approved' || row.status !== 'candidate')
        fail(409, 'INVALID_TRANSITION'); this.db.prepare('UPDATE cbt_questions SET status=\'authorized\',revision=revision+1 WHERE id=?').run(id); this.s.audit(actor.id, 'cbt.question_authorized', id); return { authorized: true }; }); }
    exam(id) { const row = this.db.prepare('SELECT * FROM cbt_exams WHERE id=?').get(identifier(id)); if (!row)
        fail(404, 'NOT_FOUND'); return row; }
    createExam(session, input) { fields(input, ['courseId', 'requestId', 'title', 'kind', 'startsAt', 'durationMinutes', 'attemptLimit', 'capacity', 'questionIds']); const actor = this.s.requireAdmin(session), course = this.academic.row(input.courseId); if (!course.published_payload)
        fail(409, 'COURSE_UNAVAILABLE'); choices(input.kind, ['pre_exam_revision', 'periodic']); const startsAt = future(input.startsAt, this.s.now()), duration = integer(input.durationMinutes, 5, 240), attempts = integer(input.attemptLimit, 1, 3), capacity = integer(input.capacity, 1, 200), questions = list(input.questionIds, 100); if (new Set(questions).size !== questions.length)
        fail(400, 'DUPLICATE_QUESTION'); return this.s.tx(() => { this.s.requireAdmin(session); if (input.kind === 'pre_exam_revision') {
        const request = this.row(input.requestId);
        if (request.status !== 'application_approved' || request.course_id !== course.id)
            fail(403, 'APPROVED_APPLICATION_REQUIRED');
        const period = JSON.parse(request.payload);
        if (startsAt < Date.parse(period.periodStart) || startsAt > Date.parse(period.periodEnd))
            fail(400, 'OUTSIDE_PERIOD');
    }
    else if (input.requestId !== null)
        fail(400, 'INVALID_REQUEST'); for (const id of questions) {
        const q = this.db.prepare('SELECT * FROM cbt_questions WHERE id=?').get(identifier(id));
        if (!q || q.course_id !== course.id || q.status !== 'authorized')
            fail(403, 'QUESTION_NOT_AUTHORIZED');
    } const id = randomUUID(); this.db.prepare('INSERT INTO cbt_exams(id,request_id,course_id,title,kind,starts_at,duration_minutes,attempt_limit,capacity,created_at)VALUES(?,?,?,?,?,?,?,?,?,?)').run(id, input.requestId, course.id, plain(input.title), input.kind, startsAt, duration, attempts, capacity, this.s.now()); this.db.prepare('UPDATE cbt_exams SET course_snapshot=? WHERE id=?').run(course.published_payload, id); for (const question of questions)
        this.db.prepare('INSERT INTO cbt_blueprints VALUES(?,?)').run(id, question); this.s.audit(actor.id, 'cbt.exam_planned', id); return this.exam(id); }); }
    setQuestions(session, id, input) { fields(input, ['revision', 'questionIds']); const ids = list(input.questionIds, 100); if (new Set(ids).size !== ids.length)
        fail(400, 'DUPLICATE_QUESTION'); return this.s.tx(() => { const actor = this.s.requireAdmin(session), exam = this.exam(id); revision(exam, input.revision); if (exam.status !== 'planned')
        fail(409, 'INVALID_TRANSITION'); this.assertNotStarted(id); for (const question of ids) {
        const row = this.db.prepare('SELECT * FROM cbt_questions WHERE id=?').get(identifier(question));
        if (!row || row.course_id !== exam.course_id || row.status !== 'authorized')
            fail(403, 'QUESTION_NOT_AUTHORIZED');
    } this.db.prepare('DELETE FROM cbt_blueprints WHERE exam_id=?').run(id); for (const question of ids)
        this.db.prepare('INSERT INTO cbt_blueprints VALUES(?,?)').run(id, question); this.db.prepare('UPDATE cbt_exams SET revision=revision+1 WHERE id=?').run(id); this.s.audit(actor.id, 'cbt.blueprint_updated', id, { count: ids.length }); return this.exam(id); }); }
    assertNotStarted(id) { if (this.db.prepare("SELECT 1 FROM cbt_assignments WHERE exam_id=? AND state NOT IN('assigned','not_started')").get(id))
        fail(409, 'ASSESSMENT_STARTED', 'Started or submitted assessments cannot be reset or rescheduled.'); }
    checkSlots(exam, delta = 0) { const slots = this.db.prepare('SELECT a.account_id,b.starts_at FROM cbt_assignments a JOIN cbt_batches b ON b.id=a.batch_id WHERE a.exam_id=?').all(exam.id); for (const slot of slots) {
        const start = slot.starts_at + delta;
        const conflict = this.db.prepare('SELECT b.starts_at,e.duration_minutes FROM cbt_assignments a JOIN cbt_batches b ON b.id=a.batch_id JOIN cbt_exams e ON e.id=a.exam_id WHERE a.account_id=? AND e.id!=? AND e.status!=\'cancelled\'').all(slot.account_id, exam.id).some(other => start < other.starts_at + other.duration_minutes * 60000 && other.starts_at < start + exam.duration_minutes * 60000);
        if (conflict)
            fail(409, 'BATCH_CONFLICT');
    } }
    batch(session, id, input) { fields(input, ['revision', 'title', 'startsAt', 'capacity', 'studentIds']); const students = list(input.studentIds, 200); if (!students.length || new Set(students).size !== students.length)
        fail(400, 'INVALID_STUDENTS'); const time = future(input.startsAt, this.s.now()), capacity = integer(input.capacity, 1, 200); return this.s.tx(() => { const actor = this.s.requireAdmin(session), exam = this.exam(id); revision(exam, input.revision); if (exam.status !== 'planned' || capacity > exam.capacity || students.length > capacity || time < exam.starts_at)
        fail(409, 'INVALID_BATCH'); const course = this.academic.row(exam.course_id); for (const studentId of students) {
        const student = this.s.account(identifier(studentId));
        if (!student || student.status !== 'active' || !this.academic.canRead(student, course) || this.db.prepare('SELECT 1 FROM cbt_assignments WHERE exam_id=? AND account_id=?').get(id, studentId))
            fail(400, 'INVALID_STUDENT');
        const overlaps = this.db.prepare('SELECT b.starts_at,e.duration_minutes FROM cbt_assignments a JOIN cbt_batches b ON b.id=a.batch_id JOIN cbt_exams e ON e.id=a.exam_id WHERE a.account_id=? AND e.status!=\'cancelled\'').all(studentId).some(other => time < other.starts_at + other.duration_minutes * 60000 && other.starts_at < time + exam.duration_minutes * 60000);
        if (overlaps)
            fail(409, 'BATCH_CONFLICT');
    } const batch = randomUUID(); this.db.prepare('INSERT INTO cbt_batches VALUES(?,?,?,?,?)').run(batch, id, plain(input.title), time, capacity); for (const student of students)
        this.db.prepare('INSERT INTO cbt_assignments(id,exam_id,batch_id,account_id,updated_at)VALUES(?,?,?,?,?)').run(randomUUID(), id, batch, student, this.s.now()); this.db.prepare('UPDATE cbt_exams SET revision=revision+1 WHERE id=?').run(id); this.s.audit(actor.id, 'cbt.batch_created', batch, { count: students.length, examId: id }); return { batchId: batch, revision: this.exam(id).revision }; }); }
    cancel(session, id) { const actor = this.s.requireAdmin(session); this.db.prepare('UPDATE cbt_exams SET status=\'cancelled\',revision=revision+1 WHERE id=?').run(id); this.db.prepare('UPDATE notices SET status=\'withdrawn\',revision=revision+1 WHERE exam_id=?').run(id); this.s.audit(actor.id, 'cbt.exam_cancelled', id); }
    schedule(session, id, input) { fields(input, ['revision', 'action', 'startsAt']); return this.s.tx(() => { const actor = this.s.requireAdmin(session), exam = this.exam(id); revision(exam, input.revision); if (input.action === 'cancel') {
        this.cancel(session, id);
        return this.exam(id);
    } if (input.action === 'reschedule') {
        this.assertNotStarted(id);
        if (exam.status === 'cancelled')
            fail(409, 'INVALID_TRANSITION');
        const time = future(input.startsAt, this.s.now()), delta = time - exam.starts_at;
        this.checkSlots(exam, delta);
        if (exam.kind === 'pre_exam_revision') {
            const request = this.row(exam.request_id), period = JSON.parse(request.payload);
            if (request.status !== 'application_approved' || time < Date.parse(period.periodStart) || time > Date.parse(period.periodEnd))
                fail(400, 'OUTSIDE_PERIOD');
        }
        this.db.prepare('UPDATE cbt_batches SET starts_at=starts_at+? WHERE exam_id=?').run(delta, id);
        this.db.prepare('UPDATE cbt_exams SET starts_at=?,status=\'planned\',revision=revision+1 WHERE id=?').run(time, id);
        this.db.prepare('UPDATE notices SET status=\'withdrawn\',revision=revision+1 WHERE exam_id=?').run(id);
        this.s.audit(actor.id, 'cbt.exam_rescheduled', id);
        return this.exam(id);
    } this.assertNotStarted(id); if (input.action !== 'schedule' || exam.status !== 'planned' || exam.starts_at < this.s.now())
        fail(409, 'INVALID_TRANSITION'); if (!this.academic.row(exam.course_id).published_payload)
        fail(409, 'COURSE_UNAVAILABLE'); const questions = this.db.prepare('SELECT q.status FROM cbt_blueprints b JOIN cbt_questions q ON q.id=b.question_id WHERE b.exam_id=?').all(id); const students = this.db.prepare('SELECT account_id FROM cbt_assignments WHERE exam_id=?').all(id).map(a => a.account_id); this.checkSlots(exam); if (!questions.length || questions.some(q => q.status !== 'authorized') || !students.length)
        fail(409, 'PLAN_INCOMPLETE'); for (const studentId of students) {
        const user = this.s.account(studentId);
        if (!user || user.status !== 'active' || !this.academic.canRead(user, this.academic.row(exam.course_id)))
            fail(409, 'ASSIGNMENT_INVALID');
    } this.db.prepare('UPDATE cbt_exams SET status=\'scheduled\',revision=revision+1 WHERE id=?').run(id); this.db.prepare('UPDATE cbt_assignments SET state=\'not_started\',updated_at=? WHERE exam_id=?').run(this.s.now(), id); this.notifications.invite(session, exam, students); this.s.audit(actor.id, 'cbt.exam_scheduled', id, { selectedCount: students.length }); return this.exam(id); }); }
    exams(session) { this.s.requireAdmin(session); return { exams: this.db.prepare('SELECT * FROM cbt_exams ORDER BY starts_at DESC LIMIT 100').all() }; }
    monitor(session, id) { this.s.requireAdmin(session); const exam = this.exam(id); return { exam, deliveryOperational: false, batches: this.db.prepare('SELECT * FROM cbt_batches WHERE exam_id=? ORDER BY starts_at').all(id), assignments: this.db.prepare('SELECT a.id,a.account_id,a.batch_id,a.state,a.updated_at,u.name,u.level FROM cbt_assignments a JOIN accounts u ON u.id=a.account_id WHERE a.exam_id=? ORDER BY u.name').all(id), results: this.db.prepare('SELECT r.assignment_id,r.status,r.revision FROM cbt_results r JOIN cbt_assignments a ON a.id=r.assignment_id WHERE a.exam_id=?').all(id) }; }
    assignment(session, id) { const user = this.s.requireUser(session), row = this.db.prepare('SELECT a.*,b.starts_at,b.title AS batch_title,e.title,e.course_id,e.duration_minutes,e.status AS exam_status FROM cbt_assignments a JOIN cbt_batches b ON b.id=a.batch_id JOIN cbt_exams e ON e.id=a.exam_id WHERE a.id=? AND a.account_id=?').get(identifier(id), user.id); if (!row)
        fail(404, 'NOT_FOUND'); this.academic.published(session, row.course_id); return row; }
    assignments(session) { const user = this.s.requireUser(session); return { deliveryOperational: false, assignments: this.db.prepare('SELECT id FROM cbt_assignments WHERE account_id=? ORDER BY updated_at DESC LIMIT 100').all(user.id).map(r => { try {
            const a = this.assignment(session, r.id);
            return { id: a.id, title: a.title, courseId: a.course_id, batch: a.batch_title, startsAt: new Date(a.starts_at).toISOString(), durationMinutes: a.duration_minutes, state: a.state, examStatus: a.exam_status };
        }
        catch {
            return null;
        } }).filter(Boolean) }; }
    results(session, id) { const assignment = this.assignment(session, id), row = this.db.prepare('SELECT * FROM cbt_results WHERE assignment_id=? AND status=\'published\'').get(id); if (!row || assignment.state !== 'submitted' || assignment.exam_status === 'cancelled')
        fail(404, 'RESULTS_UNAVAILABLE'); return { assignmentId: id, analytics: publicAnalytics(JSON.parse(unseal(this.s.config.encryptionKey, row.encrypted_payload))) }; }
    resultHistory(session) { const user = this.s.requireUser(session); return { assessments: this.db.prepare('SELECT r.*,a.course_id,e.title FROM cbt_results r JOIN (SELECT a.*,e.course_id FROM cbt_assignments a JOIN cbt_exams e ON e.id=a.exam_id) a ON a.id=r.assignment_id JOIN cbt_exams e ON e.id=a.exam_id WHERE a.account_id=? AND r.status=\'published\' ORDER BY r.published_at LIMIT 100').all(user.id).map(row => { try {
            const result = this.results(session, row.assignment_id);
            return { assignmentId: row.assignment_id, courseId: row.course_id, title: row.title, publishedAt: new Date(row.published_at).toISOString(), ...result.analytics };
        }
        catch {
            return null;
        } }).filter(Boolean) }; }
    analytics(session, id) { this.s.requireAdmin(session); this.exam(id); return { results: this.db.prepare('SELECT r.*,a.account_id FROM cbt_results r JOIN cbt_assignments a ON a.id=r.assignment_id WHERE a.exam_id=?').all(id).map(r => ({ assignmentId: r.assignment_id, status: r.status, revision: r.revision, analytics: publicAnalytics(JSON.parse(unseal(this.s.config.encryptionKey, r.encrypted_payload))) })), source: 'Results require the trusted M7 examination engine; no scores are generated by this view.' }; }
    publishResult(session, id, input) { fields(input, ['revision']); return this.s.tx(() => { const actor = this.s.requireAdmin(session), row = this.db.prepare('SELECT r.*,a.state FROM cbt_results r JOIN cbt_assignments a ON a.id=r.assignment_id WHERE r.assignment_id=?').get(identifier(id)); if (!row || row.state !== 'submitted' || row.status !== 'reviewed')
        fail(409, 'RESULTS_NOT_READY'); revision(row, input.revision); publicAnalytics(JSON.parse(unseal(this.s.config.encryptionKey, row.encrypted_payload))); this.db.prepare('UPDATE cbt_results SET status=\'published\',revision=revision+1,published_at=? WHERE assignment_id=?').run(this.s.now(), id); this.s.audit(actor.id, 'cbt.results_published', id); return { published: true }; }); }
}
