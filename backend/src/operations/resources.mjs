import { randomUUID, createHash } from 'node:crypto';
import { TextDecoder } from 'node:util';
import { seal, unseal } from '../security.mjs';
import { academicSourceUrl, driveResourceUrl, resourceCategories } from '../../../student-pwa/src/modules/academic/models.js';
import { fields, fail, plain, identifier, revision, choices } from './common.mjs';
export class ResourceOperations {
    constructor(service, academic) { this.s = service; this.db = service.db; this.academic = academic; }
    row(id) {
        const r = this.db.prepare('SELECT * FROM academic_resources WHERE id=?').get(identifier(id));
        if (!r)
            fail(404, 'NOT_FOUND');
        return r;
    }
    manage(session, row) { return this.academic.manage(session, row.course_id); }
    normalize(input) {
        fields(input, ['title', 'description', 'category', 'sourceUrl', 'driveUrl']);
        const sourceUrl = academicSourceUrl(input.sourceUrl), driveUrl = input.driveUrl ? driveResourceUrl(input.driveUrl) : null;
        if (!sourceUrl || input.driveUrl && !driveUrl)
            fail(400, 'INVALID_SOURCE');
        return { title: plain(input.title), description: plain(input.description ?? '', 800, true), category: choices(input.category, Object.keys(resourceCategories)), sourceUrl, driveUrl, fileId: null };
    }
    list(session, courseId, manage = false) {
        if (manage)
            this.academic.manage(session, courseId);
        else
            this.academic.published(session, courseId);
        return { resources: this.db.prepare('SELECT * FROM academic_resources WHERE course_id=? ORDER BY created_at DESC LIMIT 100').all(courseId).filter(r => manage || r.published_payload).map(r => ({ id: r.id, revision: r.revision, status: manage ? r.status : 'published', ...(JSON.parse(manage ? r.payload : r.published_payload)), ...(manage ? { author: r.author, lastEditor: r.last_editor, history: this.db.prepare('SELECT revision,action,created_at FROM academic_resource_versions WHERE resource_id=? ORDER BY id DESC LIMIT 20').all(r.id) } : {}) })) };
    }
    snapshot(row, actor, action) { this.db.prepare('INSERT INTO academic_resource_versions(resource_id,revision,payload,actor,action,created_at)VALUES(?,?,?,?,?,?)').run(row.id, row.revision, row.payload, actor, action, this.s.now()); this.s.audit(actor, 'resource.' + action, row.id, { revision: row.revision }); }
    create(session, input) { fields(input, ['courseId', 'resource']); const value = this.normalize(input.resource); return this.s.tx(() => { const actor = this.academic.manage(session, input.courseId) && this.s.requireUser(session), id = randomUUID(); this.db.prepare('INSERT INTO academic_resources(id,course_id,author,last_editor,payload,created_at)VALUES(?,?,?,?,?,?)').run(id, input.courseId, actor.id, actor.id, JSON.stringify(value), this.s.now()); this.snapshot(this.row(id), actor.id, 'draft_created'); return { id, revision: 1 }; }); }
    update(session, id, input) {
        fields(input, ['revision', 'action', 'resource', 'note']);
        return this.s.tx(() => {
            const r = this.row(id), course = this.manage(session, r), actor = this.s.requireUser(session);
            revision(r, input.revision);
            if (input.action === 'correct') {
                if (r.author !== actor.id && session.active_role !== 'administrator')
                    fail(403, 'AUTHOR_REQUIRED');
                if (r.status === 'submitted')
                    fail(409, 'INVALID_TRANSITION');
                const value = this.normalize(input.resource);
                value.fileId = JSON.parse(r.payload).fileId;
                this.db.prepare("UPDATE academic_resources SET payload=?,status='draft',revision=revision+1,last_editor=? WHERE id=?").run(JSON.stringify(value), actor.id, id);
            }
            else if (input.action === 'submit') {
                if (r.author !== actor.id && session.active_role !== 'administrator')
                    fail(403, 'AUTHOR_REQUIRED');
                if (!['draft', 'revisions'].includes(r.status))
                    fail(409, 'INVALID_TRANSITION');
                const value = JSON.parse(r.payload);
                if (!value.fileId && !value.driveUrl)
                    fail(409, 'RESOURCE_REQUIRED');
                this.db.prepare("UPDATE academic_resources SET status='submitted',revision=revision+1 WHERE id=?").run(id);
            }
            else {
                this.academic.reviewPermission(session, course);
                if (input.action !== 'withdraw' && (r.author === actor.id || r.last_editor === actor.id))
                    fail(403, 'INDEPENDENT_REVIEW_REQUIRED');
                if (input.action === 'publish') {
                    if (r.status !== 'submitted')
                        fail(409, 'INVALID_TRANSITION');
                    this.db.prepare("UPDATE academic_resources SET published_payload=payload,status='published',revision=revision+1 WHERE id=?").run(id);
                }
                else if (input.action === 'request_revision') {
                    if (r.status !== 'submitted')
                        fail(409, 'INVALID_TRANSITION');
                    this.db.prepare("UPDATE academic_resources SET status='revisions',revision=revision+1 WHERE id=?").run(id);
                }
                else if (input.action === 'withdraw')
                    this.db.prepare("UPDATE academic_resources SET published_payload=NULL,status='withdrawn',revision=revision+1 WHERE id=?").run(id);
                else
                    fail(400, 'INVALID_ACTION');
            }
            plain(input.note ?? '', 500, true);
            this.snapshot(this.row(id), actor.id, input.action);
            return { id, revision: this.row(id).revision };
        });
    }
    async upload(session, id, input) {
        fields(input, ['revision', 'filename', 'mediaType', 'content']);
        const r = this.row(id);
        this.manage(session, r);
        this.s.rate('upload:' + session.user.id, 10, 3600000);
        if (r.author !== session.user.id && session.active_role !== 'administrator')
            fail(403, 'AUTHOR_REQUIRED');
        if (typeof input.filename !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_ -]{0,90}\.(?:txt|pdf)$/.test(input.filename) || typeof input.content !== 'string' || input.content.length > 1400000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.content))
            fail(400, 'UNSAFE_FILE');
        const bytes = Buffer.from(input.content, 'base64');
        if (!bytes.length || bytes.length > 1048576 || bytes.toString('base64') !== input.content)
            fail(400, 'UNSAFE_FILE');
        let scanner = 'strict-utf8-text';
        if (input.filename.endsWith('.txt') && input.mediaType === 'text/plain') {
            let text;
            try {
                text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
            }
            catch {
                fail(400, 'INVALID_FILE_CONTENT');
            }
            if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text) || /<\s*(?:script|html|svg|iframe)|javascript:/iu.test(text))
                fail(400, 'ACTIVE_FILE_CONTENT');
        }
        else if (input.filename.endsWith('.pdf') && input.mediaType === 'application/pdf') {
            const text = bytes.toString('latin1');
            if (!/^%PDF-1\.[0-7][\r\n]/.test(text) || !text.trimEnd().endsWith('%%EOF') || /\/(?:JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA|RichMedia|XFA)\b/.test(text))
                fail(400, 'UNSAFE_PDF');
            if (!this.s.config.scanFile)
                fail(503, 'SCANNING_UNAVAILABLE', 'Protected PDF submission requires a verified content scanner. Use an approved Drive link for review.');
            let verdict;
            try {
                verdict = await this.s.config.scanFile(bytes, { mediaType: 'application/pdf' });
            }
            catch {
                fail(503, 'SCANNING_UNAVAILABLE');
            }
            if (verdict?.clean !== true || typeof verdict.scanner !== 'string')
                fail(400, 'FILE_REJECTED');
            scanner = plain(verdict.scanner, 80);
        }
        else
            fail(400, 'UNSAFE_FILE');
        return this.s.tx(() => {
            const row = this.row(id);
            this.manage(session, row);
            revision(row, input.revision);
            if (!['draft', 'revisions', 'published'].includes(row.status) || row.author !== session.user.id && session.active_role !== 'administrator')
                fail(403, 'AUTHOR_REQUIRED');
            const used = this.db.prepare('SELECT coalesce(sum(size),0) AS n FROM protected_files').get().n, courseUsed = this.db.prepare('SELECT coalesce(sum(f.size),0) AS n FROM protected_files f JOIN academic_resources r ON r.id=f.resource_id WHERE r.course_id=?').get(row.course_id).n;
            if (used + bytes.length > 100 * 1048576 || courseUsed + bytes.length > 20 * 1048576)
                fail(409, 'STORAGE_QUOTA');
            const fileId = randomUUID(), data = JSON.parse(row.payload);
            data.fileId = fileId;
            data.filename = input.filename.replaceAll(' ', '-');
            this.db.prepare('INSERT INTO protected_files VALUES(?,?,?,?,?,?,?,?)').run(fileId, id, seal(this.s.config.encryptionKey, bytes.toString('base64')), input.mediaType, bytes.length, createHash('sha256').update(bytes).digest('hex'), scanner, this.s.now());
            this.db.prepare("UPDATE academic_resources SET payload=?,status='draft',revision=revision+1,last_editor=? WHERE id=?").run(JSON.stringify(data), session.user.id, id);
            this.snapshot(this.row(id), session.user.id, 'file_submitted');
            return { id, fileId, revision: this.row(id).revision };
        });
    }
    download(session, id, draft = false) {
        const row = this.row(id);
        if (draft)
            this.manage(session, row);
        else
            this.academic.published(session, row.course_id);
        const payload = draft ? row.payload : row.published_payload;
        if (!payload)
            fail(404, 'NOT_FOUND');
        const value = JSON.parse(payload), file = this.db.prepare('SELECT * FROM protected_files WHERE id=? AND resource_id=?').get(value.fileId ?? '', id);
        if (!file)
            fail(404, 'NOT_FOUND');
        const bytes = Buffer.from(unseal(this.s.config.encryptionKey, file.encrypted_content), 'base64');
        if (bytes.length !== file.size || createHash('sha256').update(bytes).digest('hex') !== file.digest)
            fail(503, 'FILE_INTEGRITY');
        return { download: true, bytes, mediaType: file.media_type, filename: value.filename ?? 'academic-resource.txt' };
    }
}
