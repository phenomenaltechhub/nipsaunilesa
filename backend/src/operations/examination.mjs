import { randomUUID } from 'node:crypto';
import { seal, unseal } from '../security.mjs';
import { fields, fail, plain, integer, identifier, revision, choices, instant, list } from './common.mjs';
import { projectAssessment, publicAnalytics } from './analytics.mjs';
export class ExaminationEngine {
    constructor(service, cbt, bank) { this.s = service; this.db = service.db; this.cbt = cbt; this.bank = bank; }
    decode(value) { return JSON.parse(unseal(this.s.config.encryptionKey, value)); }
    encode(value) { return seal(this.s.config.encryptionKey, JSON.stringify(value)); }
    delivery(exam) { const row = this.db.prepare('SELECT * FROM cbt_delivery WHERE exam_id=?').get(exam.id); const last = this.db.prepare('SELECT max(coalesce(closes_at,starts_at+coalesce(duration_minutes,?)*60000)) AS end FROM cbt_batches WHERE exam_id=?').get(exam.duration_minutes, exam.id).end; return row ?? { exam_id: exam.id, opens_at: exam.starts_at, closes_at: last ?? exam.starts_at + exam.duration_minutes * 60000, released: 0, instructions: 'Read every question carefully. Saved responses can be resumed within the server-controlled deadline.', revision: 0 }; }
    configure(session, id, input) {
        fields(input, ['revision', 'opensAt', 'closesAt', 'releaseQuestions', 'instructions']);
        const opens = instant(input.opensAt), closes = instant(input.closesAt);
        if (typeof input.releaseQuestions !== 'boolean' || closes <= opens || closes - opens > 7 * 86400000)
            fail(400, 'INVALID_WINDOW');
        return this.s.tx(() => {
            const actor = this.s.requireAdmin(session), exam = this.cbt.exam(id), old = this.delivery(exam);
            revision(old, input.revision);
            if (exam.status === 'cancelled')
                fail(409, 'EXAM_CANCELLED');
            const started = this.db.prepare('SELECT 1 FROM cbt_attempts a JOIN cbt_assignments s ON s.id=a.assignment_id WHERE s.exam_id=?').get(id);
            if (started && (opens !== old.opens_at || closes !== old.closes_at))
                fail(409, 'ASSESSMENT_STARTED');
            if (opens < exam.starts_at)
                fail(400, 'INVALID_WINDOW');
            for (const batch of this.db.prepare('SELECT * FROM cbt_batches WHERE exam_id=?').all(id))
                if (Math.max(opens, batch.starts_at) >= Math.min(closes, batch.closes_at ?? batch.starts_at + (batch.duration_minutes ?? exam.duration_minutes) * 60000))
                    fail(400, 'INVALID_WINDOW');
            this.db.prepare('INSERT INTO cbt_delivery VALUES(?,?,?,?,?,?) ON CONFLICT(exam_id) DO UPDATE SET opens_at=excluded.opens_at,closes_at=excluded.closes_at,released=excluded.released,instructions=excluded.instructions,revision=excluded.revision').run(id, opens, closes, input.releaseQuestions ? 1 : 0, plain(input.instructions, 2000), old.revision + 1);
            this.s.audit(actor.id, 'cbt.delivery_configured', id, { released: input.releaseQuestions });
            return this.delivery(exam);
        });
    }
    batchWindow(session, id, input) {
        fields(input, ['closesAt', 'durationMinutes', 'attemptLimit']);
        if (input.durationMinutes !== undefined)
            integer(input.durationMinutes, 5, 240);
        if (input.attemptLimit !== undefined)
            integer(input.attemptLimit, 1, 3);
        const end = instant(input.closesAt);
        return this.s.tx(() => {
            const actor = this.s.requireAdmin(session), batch = this.db.prepare('SELECT * FROM cbt_batches WHERE id=?').get(identifier(id));
            if (!batch)
                fail(404, 'NOT_FOUND');
            this.cbt.assertNotStarted(batch.exam_id);
            if (end <= batch.starts_at || end > batch.starts_at + 86400000)
                fail(400, 'INVALID_WINDOW');
            for (const student of this.db.prepare('SELECT account_id FROM cbt_assignments WHERE batch_id=?').all(id)) {
                const conflict = this.db.prepare("SELECT b.starts_at,b.closes_at,coalesce(b.duration_minutes,e.duration_minutes) AS duration_minutes FROM cbt_assignments a JOIN cbt_batches b ON b.id=a.batch_id JOIN cbt_exams e ON e.id=a.exam_id WHERE a.account_id=? AND e.id!=? AND e.status!='cancelled'").all(student.account_id, batch.exam_id).some(other => batch.starts_at < (other.closes_at ?? other.starts_at + other.duration_minutes * 60000) && other.starts_at < end);
                if (conflict)
                    fail(409, 'BATCH_CONFLICT');
            }
            this.db.prepare('UPDATE cbt_batches SET closes_at=?,duration_minutes=?,attempt_limit=? WHERE id=?').run(end, input.durationMinutes ?? batch.duration_minutes, input.attemptLimit ?? batch.attempt_limit, id);
            this.s.audit(actor.id, 'cbt.batch_window_changed', id);
            return { closesAt: new Date(end).toISOString() };
        });
    }
    own(session, id) {
        const user = this.s.requireUser(session);
        if (session.active_role !== 'student')
            fail(403, 'STUDENT_ROLE_REQUIRED', 'Switch to your Student role to enter an assigned assessment.');
        const a = this.cbt.assignment(session, id);
        if (a.account_id !== user.id)
            fail(404, 'NOT_FOUND');
        return a;
    }
    attempt(session, id, writer = false) {
        const user = this.s.requireUser(session);
        const row = this.db.prepare('SELECT t.*,a.account_id,a.exam_id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id WHERE t.id=? AND a.account_id=?').get(identifier(id), user.id);
        if (!row)
            fail(404, 'NOT_FOUND');
        this.own(session, row.assignment_id);
        if (writer && row.writer_session !== session.id_hash)
            fail(409, 'ATTEMPT_ACTIVE_ELSEWHERE', 'This attempt is active in another session. Use Resume to continue here.');
        return row;
    }
    entry(session, id) { const assignment = this.own(session, id), exam = this.cbt.exam(assignment.exam_id), delivery = this.delivery(exam), batch = this.db.prepare('SELECT * FROM cbt_batches WHERE id=?').get(assignment.batch_id); const opens = Math.max(batch.starts_at, delivery.opens_at), closes = Math.min(batch.closes_at ?? batch.starts_at + (batch.duration_minutes ?? exam.duration_minutes) * 60000, delivery.closes_at); return { assignmentId: id, title: exam.title, instructions: delivery.instructions, serverNow: this.s.now(), opensAt: opens, closesAt: closes, durationMinutes: batch.duration_minutes ?? exam.duration_minutes, attemptLimit: batch.attempt_limit ?? exam.attempt_limit, released: Boolean(delivery.released), available: exam.status === 'scheduled' && Boolean(delivery.released) && this.s.now() >= opens && this.s.now() < closes, attempts: this.db.prepare('SELECT id,number,status,started_at,finished_at FROM cbt_attempts WHERE assignment_id=? ORDER BY number').all(id) }; }
    start(session, id, input) {
        fields(input, []);
        this.maintain();
        this.s.rate('cbt-start:' + session.user?.id, 10);
        return this.s.tx(() => {
            const a = this.own(session, id), entry = this.entry(session, id), exam = this.cbt.exam(a.exam_id);
            if (!entry.available)
                fail(409, 'EXAM_NOT_OPEN');
            if (this.db.prepare("SELECT 1 FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id WHERE a.account_id=? AND t.status IN('in_progress','interrupted','requires_review') AND a.id!=?").get(a.account_id, id))
                fail(409, 'ANOTHER_ASSESSMENT_ACTIVE');
            if (this.db.prepare("SELECT 1 FROM cbt_attempts WHERE assignment_id=? AND status IN('in_progress','interrupted','requires_review')").get(id))
                fail(409, 'ATTEMPT_EXISTS', 'Resume your existing attempt.');
            const n = this.db.prepare('SELECT count(*) AS n FROM cbt_attempts WHERE assignment_id=?').get(id).n + 1;
            if (n > entry.attemptLimit)
                fail(409, 'ATTEMPTS_EXHAUSTED');
            const questions = this.db.prepare('SELECT q.* FROM cbt_blueprints b JOIN cbt_questions q ON q.id=b.question_id WHERE b.exam_id=? ORDER BY q.id').all(exam.id);
            if (!questions.length || questions.some(q => q.status !== 'authorized'))
                fail(409, 'QUESTION_NOT_AUTHORIZED');
            const snapshot = questions.map(row => { const value = this.bank.validate(exam.course_id, this.decode(row.encrypted_payload)); return { id: row.id, questionRevision: row.revision, ...value }; });
            const attemptId = randomUUID(), now = this.s.now(), deadline = Math.min(now + entry.durationMinutes * 60000, entry.closesAt);
            this.db.prepare('INSERT INTO cbt_attempts(id,assignment_id,number,writer_session,started_at,deadline,status,encrypted_questions,encrypted_answers,last_seen)VALUES(?,?,?,?,?,?,\'in_progress\',?,?,?)').run(attemptId, id, n, session.id_hash, now, deadline, this.encode(snapshot), this.encode({}), now);
            this.db.prepare("UPDATE cbt_assignments SET state='in_progress',updated_at=? WHERE id=?").run(now, id);
            this.s.audit(session.user.id, 'cbt.attempt_started', attemptId, { number: n });
            return this.view(session, attemptId);
        });
    }
    active(row) { return ['in_progress', 'interrupted', 'requires_review'].includes(row.status); }
    available(row) { const exam = this.cbt.exam(row.exam_id); return exam.status === 'scheduled' && Boolean(this.delivery(exam).released); }
    warnings(id) { const events = this.db.prepare('SELECT kind FROM cbt_attempt_events WHERE attempt_id=? ORDER BY id').all(id); return events.filter(e => ['visibility_hidden', 'navigation_attempt'].includes(e.kind)).length; }
    finalize(row, status, actor = null) { const now = this.s.now(), questions = this.decode(row.encrypted_questions), answers = this.decode(row.encrypted_answers), selected = Object.fromEntries(Object.entries(answers).filter(([, v]) => v.selectedIndex !== null).map(([id, v]) => [id, v.selectedIndex])); const analytics = projectAssessment(questions, selected, Math.floor((Math.min(now, row.deadline) - row.started_at) / 1000)); this.db.prepare('UPDATE cbt_attempts SET status=?,finished_at=?,revision=revision+1 WHERE id=?').run(status, Math.min(now, row.deadline), row.id); this.db.prepare('INSERT INTO cbt_attempt_results(attempt_id,encrypted_payload)VALUES(?,?)').run(row.id, this.encode(analytics)); const threshold = this.db.prepare('SELECT visibility_warnings FROM cbt_policy WHERE id=1').get().visibility_warnings, state = this.warnings(row.id) >= threshold ? 'requires_review' : status; this.db.prepare('UPDATE cbt_assignments SET state=?,updated_at=? WHERE id=?').run(state, now, row.assignment_id); this.db.prepare("INSERT INTO cbt_results(assignment_id,encrypted_payload,status)VALUES(?,?,'pending_review') ON CONFLICT(assignment_id) DO UPDATE SET encrypted_payload=excluded.encrypted_payload,status='pending_review',revision=revision+1,published_at=NULL").run(row.assignment_id, this.encode(analytics)); this.s.audit(actor, 'cbt.attempt_' + status, row.id); }
    state(row) {
        if (this.active(row) && row.deadline <= this.s.now()) {
            this.finalize(row, 'expired');
            return this.db.prepare('SELECT t.*,a.exam_id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id WHERE t.id=?').get(row.id);
        }
        return row;
    }
    view(session, id) {
        let row = this.attempt(session, id, true);
        row = this.state(row);
        if (!this.active(row))
            return { id: row.id, number: row.number, status: row.status, revision: row.revision, serverNow: this.s.now(), deadline: row.deadline, questions: [], answers: {} };
        if (!this.available(row))
            fail(409, 'ASSESSMENT_HELD', 'The administrator has restricted this assessment. Your saved answers are retained.');
        this.db.prepare('UPDATE cbt_attempts SET last_seen=? WHERE id=?').run(this.s.now(), id);
        const questions = this.decode(row.encrypted_questions).map(({ id, text, options, points, topicId, difficulty }) => ({ id, text, options, points, topicId, difficulty }));
        return { id: row.id, number: row.number, status: row.status, revision: row.revision, serverNow: this.s.now(), deadline: row.deadline, remainingSeconds: Math.max(0, Math.ceil((row.deadline - this.s.now()) / 1000)), questions, answers: this.decode(row.encrypted_answers), warnings: this.warnings(id), warningThreshold: this.db.prepare('SELECT visibility_warnings FROM cbt_policy WHERE id=1').get().visibility_warnings };
    }
    read(session, id) { this.maintain(); return this.s.tx(() => this.view(session, id)); }
    resume(session, id, input) {
        fields(input, []);
        this.maintain();
        return this.s.tx(() => {
            let row = this.state(this.attempt(session, id));
            if (!this.active(row))
                fail(409, 'ATTEMPT_FINISHED');
            if (!this.available(row))
                fail(409, 'ASSESSMENT_HELD');
            this.db.prepare("UPDATE cbt_attempts SET writer_session=?,status='in_progress',revision=revision+1,last_seen=? WHERE id=?").run(session.id_hash, this.s.now(), id);
            this.db.prepare("UPDATE cbt_assignments SET state='in_progress',updated_at=? WHERE id=?").run(this.s.now(), row.assignment_id);
            this.db.prepare('INSERT INTO cbt_attempt_events(attempt_id,request_id,kind,received_at)VALUES(?,?,?,?)').run(id, randomUUID(), 'reconnected', this.s.now());
            this.s.audit(session.user.id, 'cbt.attempt_resumed', id);
            return this.view(session, id);
        });
    }
    save(session, id, input) {
        this.maintain();
        fields(input, ['revision', 'requestId', 'changes']);
        identifier(input.requestId);
        const changes = list(input.changes, 100);
        if (!changes.length)
            fail(400, 'EMPTY_CHANGE');
        this.s.rate('cbt-save:' + session.user?.id, 120);
        return this.s.tx(() => {
            const row = this.state(this.attempt(session, id, true));
            if (!this.active(row))
                fail(409, 'ATTEMPT_FINISHED');
            if (!this.available(row))
                fail(409, 'ASSESSMENT_HELD');
            const fingerprint = this.s.hash(JSON.stringify(changes)), old = this.db.prepare('SELECT * FROM cbt_answer_writes WHERE attempt_id=? AND request_id=?').get(id, input.requestId);
            if (old) {
                if (old.fingerprint !== fingerprint)
                    fail(409, 'REPLAY_CONFLICT');
                return this.view(session, id);
            }
            revision(row, input.revision);
            const questions = this.decode(row.encrypted_questions), answers = this.decode(row.encrypted_answers), seen = new Set();
            for (const c of changes) {
                fields(c, ['questionId', 'selectedIndex', 'flagged']);
                const q = questions.find(q => q.id === c.questionId);
                if (!q || seen.has(c.questionId) || typeof c.flagged !== 'boolean')
                    fail(400, 'INVALID_ANSWER');
                seen.add(c.questionId);
                if (c.selectedIndex !== null)
                    integer(c.selectedIndex, 0, q.options.length - 1);
                answers[q.id] = { selectedIndex: c.selectedIndex, flagged: c.flagged };
            }
            this.db.prepare('UPDATE cbt_attempts SET encrypted_answers=?,revision=revision+1,last_seen=? WHERE id=?').run(this.encode(answers), this.s.now(), id);
            this.db.prepare('INSERT INTO cbt_answer_writes VALUES(?,?,?,?)').run(id, input.requestId, fingerprint, row.revision + 1);
            return this.view(session, id);
        });
    }
    submit(session, id, input) {
        fields(input, ['revision']);
        this.maintain();
        return this.s.tx(() => {
            const row = this.state(this.attempt(session, id, true));
            if (!this.active(row))
                fail(409, 'ALREADY_FINALIZED');
            if (!this.available(row))
                fail(409, 'ASSESSMENT_HELD');
            revision(row, input.revision);
            this.finalize(row, 'submitted', session.user.id);
            return { submitted: true, attemptId: id, status: 'submitted', results: 'Withheld pending administrator review and release.' };
        });
    }
    event(session, id, input) {
        fields(input, ['requestId', 'kind']);
        identifier(input.requestId);
        choices(input.kind, ['visibility_hidden', 'navigation_attempt', 'disconnected', 'reconnected', 'interrupted']);
        this.s.rate('cbt-event:' + session.user?.id, 40);
        return this.s.tx(() => {
            const row = this.state(this.attempt(session, id, true));
            if (!this.active(row))
                fail(409, 'ATTEMPT_FINISHED');
            const old = this.db.prepare('SELECT kind FROM cbt_attempt_events WHERE attempt_id=? AND request_id=?').get(id, input.requestId);
            if (old && old.kind !== input.kind)
                fail(409, 'REPLAY_CONFLICT');
            if (!old)
                this.db.prepare('INSERT INTO cbt_attempt_events(attempt_id,request_id,kind,received_at)VALUES(?,?,?,?)').run(id, input.requestId, input.kind, this.s.now());
            if (['disconnected', 'interrupted'].includes(input.kind)) {
                this.db.prepare("UPDATE cbt_attempts SET status='interrupted' WHERE id=?").run(id);
                this.db.prepare("UPDATE cbt_assignments SET state='interrupted',updated_at=? WHERE id=?").run(this.s.now(), row.assignment_id);
            }
            const count = this.warnings(id), threshold = this.db.prepare('SELECT visibility_warnings FROM cbt_policy WHERE id=1').get().visibility_warnings;
            if (count >= threshold) {
                this.db.prepare("UPDATE cbt_assignments SET state='requires_review',updated_at=? WHERE id=?").run(this.s.now(), row.assignment_id);
            }
            return { warnings: count, threshold, requiresReview: count >= threshold, automaticPenalty: false, message: 'Remain on the assessment page. Interruptions are recorded for fair administrative review; they do not automatically invalidate your attempt.' };
        });
    }
    maintain() {
        return this.s.tx(() => {
            let finalized = 0;
            for (const gap of this.db.prepare("SELECT t.id,t.assignment_id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id JOIN cbt_exams e ON e.id=a.exam_id WHERE t.status='in_progress' AND e.status='scheduled' AND t.deadline>? AND t.last_seen<? LIMIT 200").all(this.s.now(), this.s.now() - 45000)) {
                this.db.prepare("UPDATE cbt_attempts SET status='interrupted' WHERE id=?").run(gap.id);
                this.db.prepare("UPDATE cbt_assignments SET state='interrupted',updated_at=? WHERE id=?").run(this.s.now(), gap.assignment_id);
                this.db.prepare('INSERT INTO cbt_attempt_events(attempt_id,request_id,kind,received_at)VALUES(?,?,?,?)').run(gap.id, randomUUID(), 'interrupted', this.s.now());
            }
            for (const row of this.db.prepare("SELECT t.id,t.assignment_id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id JOIN cbt_exams e ON e.id=a.exam_id WHERE e.status='cancelled' AND t.status IN('in_progress','interrupted','requires_review') LIMIT 200").all()) {
                this.db.prepare("UPDATE cbt_attempts SET status='cancelled',finished_at=?,revision=revision+1 WHERE id=?").run(this.s.now(), row.id);
                this.db.prepare("UPDATE cbt_assignments SET state='requires_review',updated_at=? WHERE id=?").run(this.s.now(), row.assignment_id);
                this.s.audit(null, 'cbt.attempt_cancelled', row.id);
            }
            for (const row of this.db.prepare("SELECT t.*,a.exam_id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id WHERE t.status IN('in_progress','interrupted','requires_review') AND t.deadline<=? LIMIT 200").all(this.s.now())) {
                this.finalize(row, 'expired');
                finalized++;
            }
            return { finalized };
        });
    }
    monitor(session, id) { this.s.requireAdmin(session); this.maintain(); const data = this.cbt.monitor(session, id); return { ...data, deliveryOperational: true, delivery: this.delivery(data.exam), attempts: this.db.prepare('SELECT t.id,t.assignment_id,t.number,t.status,t.started_at,t.deadline,t.finished_at,r.status AS result_status,r.revision AS result_revision FROM cbt_attempts t LEFT JOIN cbt_attempt_results r ON r.attempt_id=t.id JOIN cbt_assignments a ON a.id=t.assignment_id WHERE a.exam_id=? ORDER BY t.started_at').all(id), events: this.db.prepare('SELECT e.attempt_id,e.kind,e.received_at FROM cbt_attempt_events e JOIN cbt_attempts t ON t.id=e.attempt_id JOIN cbt_assignments a ON a.id=t.assignment_id WHERE a.exam_id=? ORDER BY e.id LIMIT 1000').all(id) }; }
    review(session, id, input) {
        fields(input, ['revision', 'action', 'note', 'releaseReview']);
        const note = plain(input.note, 1000);
        return this.s.tx(() => {
            const actor = this.s.requireAdmin(session), row = this.db.prepare('SELECT r.*,t.assignment_id,t.status AS attempt_status,a.exam_id FROM cbt_attempt_results r JOIN cbt_attempts t ON t.id=r.attempt_id JOIN cbt_assignments a ON a.id=t.assignment_id WHERE r.attempt_id=?').get(identifier(id));
            if (!row)
                fail(404, 'NOT_FOUND');
            revision(row, input.revision);
            if (input.action === 'review') {
                if (row.status !== 'pending_review')
                    fail(409, 'INVALID_TRANSITION');
                this.db.prepare("UPDATE cbt_attempt_results SET status='reviewed',revision=revision+1 WHERE attempt_id=?").run(id);
                this.db.prepare('INSERT INTO cbt_incident_reviews VALUES(?,?,?,?) ON CONFLICT(attempt_id) DO UPDATE SET actor=excluded.actor,note=excluded.note,reviewed_at=excluded.reviewed_at').run(id, actor.id, note, this.s.now());
            }
            else if (input.action === 'publish') {
                if (row.status !== 'reviewed' || typeof input.releaseReview !== 'boolean')
                    fail(409, 'RESULTS_NOT_READY');
                const delivery = this.delivery(this.cbt.exam(row.exam_id));
                if (input.releaseReview && this.s.now() < delivery.closes_at)
                    fail(409, 'REVIEW_EMBARGO');
                this.db.prepare("UPDATE cbt_attempt_results SET status='published',revision=revision+1,published_at=?,release_review=? WHERE attempt_id=?").run(this.s.now(), input.releaseReview ? 1 : 0, id);
            }
            else if (input.action === 'withhold') {
                if (row.status !== 'published')
                    fail(409, 'INVALID_TRANSITION');
                this.db.prepare("UPDATE cbt_attempt_results SET status='reviewed',revision=revision+1,published_at=NULL,release_review=0 WHERE attempt_id=?").run(id);
            }
            else
                fail(400, 'INVALID_ACTION');
            this.s.audit(actor.id, 'cbt.result_' + input.action, id);
            return { status: this.db.prepare('SELECT status,revision FROM cbt_attempt_results WHERE attempt_id=?').get(id) };
        });
    }
    results(session, id) {
        const row = this.attempt(session, id), result = this.db.prepare("SELECT * FROM cbt_attempt_results WHERE attempt_id=? AND status='published'").get(id);
        if (!result || this.cbt.exam(row.exam_id).status === 'cancelled')
            fail(404, 'RESULTS_UNAVAILABLE');
        const analytics = publicAnalytics(this.decode(result.encrypted_payload)), review = [];
        if (result.release_review) {
            const answers = this.decode(row.encrypted_answers);
            for (const q of this.decode(row.encrypted_questions))
                review.push({ questionId: q.id, text: q.text, selectedIndex: answers[q.id]?.selectedIndex ?? null, correctIndex: q.correctIndex, explanation: q.explanation ?? '', sourceUrl: q.sourceUrl, options: q.options });
        }
        const exam = this.cbt.exam(row.exam_id), course = JSON.parse(exam.course_snapshot);
        const recommendations = analytics.revisionTopicIds.map(topicId => ({ topicId, title: course.topics.find(t => t.id === topicId)?.title ?? 'Reviewed topic', action: 'Revisit reviewed course materials and your confidence rating.' }));
        return { attemptId: id, title: exam.title, courseId: exam.course_id, number: row.number, recommendations, analytics, percentage: Math.round(100 * analytics.score / analytics.maximum), review, academicStatus: 'Preparation assessment, not an official university grade.' };
    }
    summary(session, id) { this.s.requireAdmin(session); this.maintain(); const monitor = this.cbt.monitor(session, id), counts = {}; for (const a of monitor.assignments)
        counts[a.state] = (counts[a.state] ?? 0) + 1; const latest = this.db.prepare("SELECT r.encrypted_payload,a.batch_id FROM cbt_attempt_results r JOIN cbt_attempts t ON t.id=r.attempt_id JOIN cbt_assignments a ON a.id=t.assignment_id WHERE a.exam_id=? AND t.number=(SELECT max(t2.number) FROM cbt_attempts t2 JOIN cbt_attempt_results r2 ON r2.attempt_id=t2.id WHERE t2.assignment_id=t.assignment_id)").all(id); const topics = Object.create(null); for (const row of latest) {
        const data = publicAnalytics(this.decode(row.encrypted_payload));
        for (const [topic, value] of Object.entries(data.topics)) {
            topics[topic] ??= { score: 0, maximum: 0 };
            topics[topic].score += value.score;
            topics[topic].maximum += value.maximum;
        }
    } return { selected: monitor.assignments.length, states: counts, marked: latest.length, averagePercentage: latest.length ? Math.round(latest.reduce((n, row) => { const value = publicAnalytics(this.decode(row.encrypted_payload)); return n + 100 * value.score / value.maximum; }, 0) / latest.length) : null, topics, batches: monitor.batches.map(b => ({ id: b.id, title: b.title, capacity: b.capacity, selected: monitor.assignments.filter(a => a.batch_id === b.id).length })), interpretation: 'Latest marked attempt per selected student; preparation feedback, not university grades.' }; }
    adminResult(session, id) {
        this.s.requireAdmin(session);
        const r = this.db.prepare('SELECT * FROM cbt_attempt_results WHERE attempt_id=?').get(identifier(id));
        if (!r)
            fail(404, 'RESULTS_UNAVAILABLE');
        return { attemptId: id, status: r.status, revision: r.revision, analytics: publicAnalytics(this.decode(r.encrypted_payload)) };
    }
    history(session) {
        const user = this.s.requireUser(session);
        return { attempts: this.db.prepare("SELECT t.id FROM cbt_attempts t JOIN cbt_assignments a ON a.id=t.assignment_id JOIN cbt_attempt_results r ON r.attempt_id=t.id WHERE a.account_id=? AND r.status='published' ORDER BY t.started_at DESC LIMIT 100").all(user.id).map(r => {
                try {
                    return this.results(session, r.id);
                }
                catch {
                    return null;
                }
            }).filter(Boolean) };
    }
}
