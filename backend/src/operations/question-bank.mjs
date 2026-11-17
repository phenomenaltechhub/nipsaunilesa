import { randomUUID } from 'node:crypto';
import { seal, unseal } from '../security.mjs';
import { academicSourceUrl } from '../../../student-pwa/src/modules/academic/models.js';
import { fields, fail, plain, integer, identifier, revision, list, choices } from './common.mjs';
export class QuestionBank {
    constructor(service, academic) { this.s = service; this.db = service.db; this.academic = academic; }
    row(id) {
        const row = this.db.prepare('SELECT * FROM cbt_questions WHERE id=?').get(identifier(id));
        if (!row)
            fail(404, 'NOT_FOUND');
        return row;
    }
    validate(courseId, input) {
        fields(input, ['text', 'topicId', 'category', 'difficulty', 'options', 'correctIndex', 'points', 'sourceUrl', 'explanation']);
        const course = this.academic.row(courseId);
        if (!course.published_payload)
            fail(409, 'COURSE_UNAVAILABLE');
        const topics = JSON.parse(course.published_payload).topics;
        if (!topics.some(t => t.id === input.topicId))
            fail(400, 'INVALID_TOPICS');
        const options = list(input.options, 6).map(o => plain(o, 250));
        if (options.length < 2 || new Set(options).size !== options.length)
            fail(400, 'INVALID_OPTIONS');
        const sourceUrl = academicSourceUrl(input.sourceUrl);
        if (!sourceUrl)
            fail(400, 'INVALID_SOURCE');
        return { text: plain(input.text, 700), topicId: input.topicId, category: choices(input.category, ['recall', 'application', 'analysis']), difficulty: choices(input.difficulty ?? 'unclassified', ['unclassified', 'introductory', 'intermediate', 'advanced']), options, correctIndex: integer(input.correctIndex, 0, options.length - 1), points: integer(input.points, 1, 20), sourceUrl, explanation: plain(input.explanation ?? '', 1000, true) };
    }
    dto(row) { return { id: row.id, courseId: row.course_id, status: row.status, revision: row.revision, ...JSON.parse(unseal(this.s.config.encryptionKey, row.encrypted_payload)) }; }
    history(row, actor, reason) { this.db.prepare('INSERT INTO cbt_question_versions(question_id,revision,encrypted_payload,status,actor,created_at,reason)VALUES(?,?,?,?,?,?,?)').run(row.id, row.revision, row.encrypted_payload, row.status, actor, this.s.now(), reason); this.s.audit(actor, 'cbt.question_' + row.status, row.id, { revision: row.revision }); }
    catalogue(session, courseId) {
        this.s.requireAdmin(session);
        if (courseId)
            this.academic.row(courseId);
        return { questions: (courseId ? this.db.prepare('SELECT * FROM cbt_questions WHERE course_id=? ORDER BY id LIMIT 300').all(courseId) : this.db.prepare('SELECT * FROM cbt_questions ORDER BY id LIMIT 500').all()).map(r => ({ ...this.dto(r), history: this.db.prepare('SELECT revision,status,reason,created_at FROM cbt_question_versions WHERE question_id=? ORDER BY id DESC LIMIT 30').all(r.id) })) };
    }
    create(session, input) { fields(input, ['courseId', 'question']); const value = this.validate(input.courseId, input.question); return this.s.tx(() => { const actor = this.s.requireAdmin(session), id = randomUUID(); this.db.prepare('INSERT INTO cbt_questions(id,request_id,course_id,encrypted_payload)VALUES(?,NULL,?,?)').run(id, input.courseId, seal(this.s.config.encryptionKey, JSON.stringify(value))); const row = this.row(id); this.history(row, actor.id, 'Question drafted for review'); return this.dto(row); }); }
    update(session, id, input) {
        fields(input, ['revision', 'action', 'question', 'reason']);
        const reason = plain(input.reason, 500);
        return this.s.tx(() => {
            const actor = this.s.requireAdmin(session), row = this.row(id);
            revision(row, input.revision);
            if (row.request_id && input.action !== 'withdraw' && this.db.prepare('SELECT status FROM cbt_requests WHERE id=?').get(row.request_id)?.status !== 'application_approved')
                fail(403, 'APPLICATION_NOT_AUTHORIZED');
            if (input.action === 'correct') {
                const value = this.validate(row.course_id, input.question);
                this.db.prepare("UPDATE cbt_questions SET encrypted_payload=?,status='candidate',revision=revision+1 WHERE id=?").run(seal(this.s.config.encryptionKey, JSON.stringify(value)), id);
            }
            else if (input.action === 'approve') {
                this.validate(row.course_id, JSON.parse(unseal(this.s.config.encryptionKey, row.encrypted_payload)));
                if (row.status !== 'candidate')
                    fail(409, 'INVALID_TRANSITION');
                this.db.prepare("UPDATE cbt_questions SET status='authorized',revision=revision+1 WHERE id=?").run(id);
            }
            else if (input.action === 'withdraw')
                this.db.prepare("UPDATE cbt_questions SET status='withdrawn',revision=revision+1 WHERE id=?").run(id);
            else
                fail(400, 'INVALID_ACTION');
            // Stop new/ongoing delivery until an administrator reviews affected schedules.
            this.db.prepare("UPDATE cbt_exams SET status='held',revision=revision+1 WHERE id IN(SELECT exam_id FROM cbt_blueprints WHERE question_id=?) AND status='scheduled'").run(id);
            this.history(this.row(id), actor.id, reason);
            return this.dto(this.row(id));
        });
    }
    template(session, courseId) { this.s.requireAdmin(session); const course = this.academic.row(courseId); return { schemaVersion: 1, courseId: course.id, questions: [] }; }
    import(session, input) {
        fields(input, ['schemaVersion', 'courseId', 'questions']);
        this.s.requireAdmin(session);
        if (input.schemaVersion !== 1)
            fail(400, 'INVALID_TEMPLATE');
        const questions = list(input.questions, 10);
        if (!questions.length)
            fail(400, 'INVALID_TEMPLATE');
        const values = questions.map(q => this.validate(input.courseId, q));
        return this.s.tx(() => {
            const actor = this.s.requireAdmin(session), ids = [];
            for (const value of values) {
                const id = randomUUID();
                this.db.prepare('INSERT INTO cbt_questions(id,request_id,course_id,encrypted_payload)VALUES(?,NULL,?,?)').run(id, input.courseId, seal(this.s.config.encryptionKey, JSON.stringify(value)));
                this.history(this.row(id), actor.id, 'Structured import; approval required before delivery');
                ids.push(id);
            }
            return { ids, status: 'candidate' };
        });
    }
}
