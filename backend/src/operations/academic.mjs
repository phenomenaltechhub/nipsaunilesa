import { randomUUID } from 'node:crypto';
import { courseProposal, academicSourceUrl, resourceProposal } from '../../../student-pwa/src/modules/academic/models.js';
import { progressSummary, confidenceOptions, revisionOptions } from '../../../student-pwa/src/modules/progress/model.js';
import { fields, fail, plain, integer, identifier, revision, list } from './common.mjs';
export class AcademicOperations {
    constructor(service) { this.s = service; this.db = service.db; }
    row(id) { const row = this.db.prepare('SELECT * FROM courses WHERE id=?').get(identifier(id)); if (!row)
        fail(404, 'NOT_FOUND'); return row; }
    canRead(user, row) { return user.level === row.level && (row.audience === 'level' || Boolean(this.db.prepare('SELECT 1 FROM course_access WHERE course_id=? AND account_id=?').get(row.id, user.id))); }
    published(session, id) { const user = this.s.requireUser(session), row = this.row(id); if (!row.published_payload || !this.canRead(user, row))
        fail(404, 'NOT_FOUND'); return row; }
    content(row) { return { id: row.id, ...JSON.parse(row.published_payload), revision: row.published_revision, access: row.audience }; }
    catalogue(session) { const user = this.s.requireUser(session); return { level: user.level, courses: this.db.prepare('SELECT * FROM courses WHERE level=? AND published_payload IS NOT NULL ORDER BY session DESC,semester,code').all(user.level).filter(r => this.canRead(user, r)).map(r => this.content(r)) }; }
    manage(session, id) { const row = this.row(id); this.s.requireLevel(session, row.level, true); return row; }
    normalize(value) {
        fields(value, ['code', 'title', 'units', 'level', 'description', 'sourceUrl', 'session', 'semester', 'syllabus', 'topics', 'resources']);
        let proposal;
        try {
            const { syllabus: ignoredSyllabus, topics: ignoredTopics, resources: ignoredResources, ...base } = value;
            void ignoredSyllabus;
            void ignoredTopics;
            void ignoredResources;
            proposal = courseProposal(base);
        }
        catch {
            fail(400, 'INVALID_COURSE');
        }
        if (!proposal.session || !proposal.semester)
            fail(400, 'CONTEXT_REQUIRED');
        const topics = list(value.topics ?? [], 80).map(t => { fields(t, ['id', 'title', 'parentId', 'sourceUrl']); const sourceUrl = academicSourceUrl(t.sourceUrl); if (!sourceUrl)
            fail(400, 'INVALID_SOURCE'); return { id: identifier(t.id), title: plain(t.title), parentId: t.parentId === null ? null : identifier(t.parentId), sourceUrl }; });
        if (new Set(topics.map(t => t.id)).size !== topics.length)
            fail(400, 'DUPLICATE_TOPIC');
        for (const t of topics) {
            let next = t.parentId;
            const seen = new Set([t.id]);
            while (next) {
                if (seen.has(next))
                    fail(400, 'TOPIC_CYCLE');
                seen.add(next);
                const parent = topics.find(p => p.id === next);
                if (!parent)
                    fail(400, 'UNKNOWN_PARENT');
                next = parent.parentId;
            }
        }
        const resources = list(value.resources ?? [], 30).map(r => { try {
            return resourceProposal({ ...r, courseId: 0 });
        }
        catch {
            fail(400, 'INVALID_RESOURCE');
        } });
        return { ...proposal, syllabus: plain(value.syllabus ?? '', 2500, true), topics, resources };
    }
    historyRow(row, actor, action, note = '') { this.db.prepare('INSERT INTO course_versions(course_id,revision,actor,action,payload,created_at,note)VALUES(?,?,?,?,?,?,?)').run(row.id, row.revision, actor, action, row.payload, this.s.now(), note); this.s.audit(actor, 'academic.' + action, row.id, { revision: row.revision, level: row.level }); }
    create(session, input) { const value = this.normalize(input), actor = this.s.requireLevel(session, value.level, true); this.s.rate('course-create:' + actor.id, 20, 3600000); return this.s.tx(() => { this.s.requireLevel(session, value.level, true); if (this.db.prepare('SELECT 1 FROM courses WHERE level=? AND session=? AND semester=? AND code=?').get(value.level, value.session, value.semester, value.code))
        fail(409, 'COURSE_EXISTS'); const id = randomUUID(); this.db.prepare('INSERT INTO courses(id,level,session,semester,code,author,payload,status,updated_at)VALUES(?,?,?,?,?,?,?,\'draft\',?)').run(id, value.level, value.session, value.semester, value.code, actor.id, JSON.stringify(value), this.s.now()); this.db.prepare('UPDATE courses SET last_editor=? WHERE id=?').run(actor.id, id); const row = this.row(id); this.historyRow(row, actor.id, 'draft_created'); return this.managementDetail(session, id); }); }
    edit(session, id, input) { fields(input, ['revision', 'course']); const value = this.normalize(input.course); return this.s.tx(() => { const row = this.manage(session, id); revision(row, input.revision); if (row.level !== value.level || row.session !== value.session || row.semester !== value.semester || row.code !== value.code)
        fail(400, 'IMMUTABLE_CONTEXT'); if (!['draft', 'revisions', 'published', 'withdrawn'].includes(row.status))
        fail(409, 'INVALID_TRANSITION'); const actor = this.s.requireUser(session); if (row.author !== actor.id && session.active_role !== 'administrator')
        fail(403, 'AUTHOR_REQUIRED'); this.db.prepare('UPDATE courses SET payload=?,status=\'draft\',revision=revision+1,updated_at=?,last_editor=? WHERE id=?').run(JSON.stringify(value), this.s.now(), actor.id, id); this.historyRow(this.row(id), actor.id, 'draft_updated'); return this.managementDetail(session, id); }); }
    reviewPermission(session, row) { if (session.active_role === 'administrator')
        return this.s.requireAdmin(session); this.s.requireLevel(session, row.level, true); const grant = this.s.roles(session.user.id).find(r => r.role === session.active_role); if (grant?.role !== 'reviewer' || !grant.permissions.includes('academic.review'))
        fail(403, 'REVIEW_REQUIRED'); return this.s.requireUser(session); }
    decide(session, id, input) { fields(input, ['revision', 'action', 'note']); plain(input.note, 500); return this.s.tx(() => { const row = this.manage(session, id), actor = this.s.requireUser(session); revision(row, input.revision); const action = input.action; if (action === 'submit') {
        if ((row.author !== actor.id && session.active_role !== 'administrator') || !['draft', 'revisions'].includes(row.status))
            fail(403, 'AUTHOR_REQUIRED');
        this.db.prepare('UPDATE courses SET status=\'submitted\',revision=revision+1 WHERE id=?').run(id);
    }
    else {
        this.reviewPermission(session, row);
        if (action !== 'withdraw' && (row.author === actor.id || row.last_editor === actor.id))
            fail(403, 'INDEPENDENT_REVIEW_REQUIRED');
        if (action === 'publish') {
            if (row.status !== 'submitted')
                fail(409, 'INVALID_TRANSITION');
            this.db.prepare('UPDATE courses SET status=\'published\',published_payload=payload,published_revision=revision+1,reviewer=?,revision=revision+1 WHERE id=?').run(actor.id, id);
        }
        else if (action === 'request_revision') {
            if (row.status !== 'submitted')
                fail(409, 'INVALID_TRANSITION');
            this.db.prepare('UPDATE courses SET status=\'revisions\',revision=revision+1 WHERE id=?').run(id);
        }
        else if (action === 'withdraw') {
            this.db.prepare('UPDATE courses SET status=\'withdrawn\',published_payload=NULL,published_revision=NULL,revision=revision+1 WHERE id=?').run(id);
            this.db.prepare('UPDATE cbt_exams SET status=\'held\',revision=revision+1 WHERE course_id=? AND status!=\'cancelled\'').run(id);
        }
        else
            fail(400, 'INVALID_ACTION');
    } this.historyRow(this.row(id), actor.id, action, input.note); return this.managementDetail(session, id); }); }
    managementList(session, level) { this.s.requireLevel(session, level, true); return { courses: this.db.prepare('SELECT id FROM courses WHERE level=? ORDER BY updated_at DESC LIMIT 100').all(level).map(r => this.managementDetail(session, r.id)) }; }
    managementDetail(session, id) { const row = this.manage(session, id); return { id: row.id, course: JSON.parse(row.payload), status: row.status, revision: row.revision, audience: row.audience, ...(session.active_role === 'administrator' ? { selectedIds: this.db.prepare('SELECT account_id FROM course_access WHERE course_id=?').all(id).map(r => r.account_id) } : {}), publishedRevision: row.published_revision, author: row.author, lastEditor: row.last_editor, history: this.db.prepare('SELECT revision,action,note,created_at FROM course_versions WHERE course_id=? ORDER BY id DESC LIMIT 30').all(id) }; }
    access(session, id, input) { fields(input, ['revision', 'audience', 'students']); const actor = this.s.requireAdmin(session); return this.s.tx(() => { this.s.requireAdmin(session); const row = this.row(id); revision(row, input.revision); if (!['level', 'selected'].includes(input.audience))
        fail(400, 'INVALID_AUDIENCE'); const students = list(input.students, 300); if (new Set(students).size !== students.length)
        fail(400, 'DUPLICATE_STUDENT'); for (const id of students) {
        const student = this.s.account(identifier(id));
        if (!student || student.status !== 'active' || student.level !== row.level)
            fail(400, 'INVALID_STUDENT');
    } this.db.prepare('DELETE FROM course_access WHERE course_id=?').run(id); for (const student of students)
        this.db.prepare('INSERT INTO course_access VALUES(?,?)').run(id, student); this.db.prepare('UPDATE courses SET audience=?,revision=revision+1 WHERE id=?').run(input.audience, id); this.s.audit(actor.id, 'academic.access_changed', id, { audience: input.audience, count: students.length }); return { revision: this.row(id).revision }; }); }
    adminCatalogue(session) { this.s.requireAdmin(session); return { courses: this.db.prepare('SELECT * FROM courses WHERE published_payload IS NOT NULL ORDER BY level,session DESC,code LIMIT 1000').all().map(r => ({ ...this.content(r), level: r.level })) }; }
    candidates(session, id, offset = 0) { this.s.requireAdmin(session); integer(offset); const row = this.row(id), students = this.db.prepare('SELECT id,name,level FROM accounts WHERE level=? AND status=\'active\' ORDER BY name,id LIMIT 50 OFFSET ?').all(row.level, offset); return { students: students.map(u => ({ ...u, eligible: this.canRead(u, row) })), nextOffset: students.length === 50 ? offset + 50 : null }; }
    progress(session, id) { const user = this.s.requireUser(session), row = this.published(session, id), course = this.content(row), saved = this.db.prepare('SELECT topic_id,payload,revision FROM topic_progress WHERE account_id=? AND course_id=?').all(user.id, id); const topics = course.topics.map(t => { const p = saved.find(p => p.topic_id === t.id); return { ...t, covered: false, confidence: 'unassessed', revision: 'not-started', difficult: false, priority: 'normal', ...(p ? JSON.parse(p.payload) : {}), version: p?.revision ?? 0 }; }); const summary = progressSummary(topics), priorities = topics.filter(t => t.difficult || t.confidence === 'low' || t.priority === 'high' || !t.covered).map(t => ({ id: t.id, title: t.title, reasons: [!t.covered ? 'Not covered' : null, t.difficult ? 'Difficult' : null, t.confidence === 'low' ? 'Low confidence' : null, t.priority === 'high' ? 'High priority' : null].filter(Boolean) })); return { courseRevision: course.revision, topics, summary, priorities, assessment: 'Self-reported study progress, not demonstrated mastery.' }; }
    progressOverview(session) { const courses = this.catalogue(session).courses, all = [], summaries = []; for (const course of courses) {
        const progress = this.progress(session, course.id);
        all.push(...progress.topics.map(t => ({ ...t, id: course.id + ':' + t.id, parentId: t.parentId ? course.id + ':' + t.parentId : null })));
        summaries.push({ courseId: course.id, code: course.code, title: course.title, summary: progress.summary, priorities: progress.priorities });
    } return { summary: progressSummary(all), courses: summaries }; }
    saveProgress(session, id, input) { fields(input, ['courseRevision', 'topicId', 'version', 'change']); fields(input.change, ['covered', 'confidence', 'revision', 'difficult', 'priority']); for (const key of ['covered', 'difficult'])
        if (key in input.change && typeof input.change[key] !== 'boolean')
            fail(400, 'INVALID_PROGRESS'); if ('confidence' in input.change && !Object.hasOwn(confidenceOptions, input.change.confidence) || 'revision' in input.change && !Object.hasOwn(revisionOptions, input.change.revision) || 'priority' in input.change && !['normal', 'high'].includes(input.change.priority))
        fail(400, 'INVALID_PROGRESS'); return this.s.tx(() => { const user = this.s.requireUser(session), row = this.published(session, id), course = this.content(row); if (course.revision !== input.courseRevision)
        fail(409, 'COURSE_CHANGED'); if (!course.topics.some(t => t.id === input.topicId))
        fail(400, 'UNKNOWN_TOPIC'); integer(input.version); const old = this.db.prepare('SELECT * FROM topic_progress WHERE account_id=? AND course_id=? AND topic_id=?').get(user.id, id, input.topicId); if ((old?.revision ?? 0) !== input.version)
        fail(409, 'REVISION_CONFLICT'); const data = { covered: false, confidence: 'unassessed', revision: 'not-started', difficult: false, priority: 'normal', ...(old ? JSON.parse(old.payload) : {}), ...input.change }; this.db.prepare('INSERT INTO topic_progress VALUES(?,?,?,?,?,?) ON CONFLICT(account_id,course_id,topic_id) DO UPDATE SET payload=excluded.payload,revision=excluded.revision,updated_at=excluded.updated_at').run(user.id, id, input.topicId, JSON.stringify(data), input.version + 1, this.s.now()); return this.progress(session, id); }); }
}
