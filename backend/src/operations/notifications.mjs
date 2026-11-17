import { randomUUID } from 'node:crypto';
import { fields, fail, plain, revision, choices, fresh, actorLabel, instant } from './common.mjs';
export const noticeKinds = ['announcement', 'lecture_change', 'lecture_cancellation', 'rescheduled_class', 'deadline', 'resource', 'administrative'];
export class NotificationOperations {
    constructor(service, academic) { this.s = service; this.db = service.db; this.academic = academic; }
    permitted(user, role, scope, level) { if (!user || user.status !== 'active')
        return false; const grant = this.s.roles(user.id).find(g => g.role === role); return Boolean(grant && (role === 'administrator' || role === 'executive' && grant.permissions.includes('notices.publish.all') || role === 'representative' && grant.level === user.level && level === user.level && scope !== 'all' && grant.permissions.includes('notices.publish.level'))); }
    authority(session, scope, level) { const user = fresh(this.s, session); if (!this.permitted(user, session.active_role, scope, level))
        fail(403, 'PUBLISH_FORBIDDEN'); if (session.active_role === 'administrator')
        this.s.requireAdmin(session); return user; }
    target(input) { const scope = choices(input.scope, ['all', 'level', 'course']); let level = null, courseId = null; if (scope === 'level')
        level = choices(input.level, [100, 200, 300]); if (scope === 'course') {
        const row = this.academic.row(input.courseId);
        if (!row.published_payload)
            fail(400, 'COURSE_UNAVAILABLE');
        level = row.level;
        courseId = row.id;
    } if (scope === 'all' && (input.level !== null || input.courseId !== null) || scope === 'level' && input.courseId !== null)
        fail(400, 'INVALID_AUDIENCE'); return { scope, level, courseId }; }
    normalize(input) { const title = plain(input.title), message = plain(input.message, 2000), kind = choices(input.kind, noticeKinds), priority = choices(input.priority, ['normal', 'important', 'urgent']); const at = instant(input.publishAt); if (at > this.s.now() + 366 * 86400000 || at < this.s.now() - 60000)
        fail(400, 'INVALID_DATE'); return { title, message, kind, priority, at }; }
    snapshot(row, actor) { this.db.prepare('INSERT INTO notice_versions(notice_id,revision,actor,payload,created_at)VALUES(?,?,?,?,?)').run(row.id, row.revision, actor, JSON.stringify({ title: row.title, message: row.message, status: row.status, publishAt: row.publish_at }), this.s.now()); this.s.audit(actor, 'notice.' + row.status, row.id, { revision: row.revision, scope: row.scope, level: row.level }); }
    create(session, input) { fields(input, ['title', 'message', 'kind', 'priority', 'scope', 'level', 'courseId', 'publishAt']); const target = this.target(input), data = this.normalize(input), user = this.authority(session, target.scope, target.level); if (data.kind === 'administrative' && session.active_role !== 'administrator')
        fail(403, 'PUBLISH_FORBIDDEN'); this.s.rate('notice-compose:' + user.id, 10, 3600000); return this.s.tx(() => { this.authority(session, target.scope, target.level); if (this.db.prepare('SELECT 1 FROM notices WHERE author=? AND title=? AND message=? AND created_at>?').get(user.id, data.title, data.message, this.s.now() - 300000))
        fail(409, 'DUPLICATE_NOTICE'); const id = randomUUID(), scheduled = data.at > this.s.now(); this.db.prepare('INSERT INTO notices(id,author,author_role,title,message,kind,scope,level,course_id,priority,publish_at,delivered_at,status,created_at)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id, user.id, session.active_role, data.title, data.message, data.kind, target.scope, target.level, target.courseId, data.priority, data.at, scheduled ? null : this.s.now(), scheduled ? 'scheduled' : 'published', this.s.now()); this.db.prepare('UPDATE notices SET publisher=?,publisher_role=? WHERE id=?').run(user.id, session.active_role, id); const row = this.row(id); this.snapshot(row, user.id); return this.dto(row, null); }); }
    row(id) { const row = this.db.prepare('SELECT * FROM notices WHERE id=?').get(id); if (!row)
        fail(404, 'NOT_FOUND'); return row; }
    activateDue() { if (!this.db.prepare('SELECT 1 FROM notices WHERE status=\'scheduled\' AND publish_at<=? LIMIT 1').get(this.s.now()))
        return; this.s.tx(() => { for (const row of this.db.prepare('SELECT * FROM notices WHERE status=\'scheduled\' AND publish_at<=? LIMIT 100').all(this.s.now())) {
        const allowed = (!row.course_id||Boolean(this.academic.row(row.course_id).published_payload)) && this.permitted(this.s.account(row.publisher ?? row.author), row.publisher_role ?? row.author_role, row.scope, row.level);
        this.db.prepare('UPDATE notices SET status=?,delivered_at=? WHERE id=?').run(allowed ? 'published' : 'held', allowed ? this.s.now() : null, row.id);
        this.s.audit(null, allowed ? 'notice.scheduled_published' : 'notice.scheduled_held', row.id, { revision: row.revision });
    } }); }
    eligible(user, row) { if (row.status !== 'published' || row.publish_at > this.s.now() || row.expires_at&&row.expires_at<=this.s.now())
        return false; if (row.kind === 'cbt_invitation' && !this.db.prepare('SELECT 1 FROM cbt_exams e JOIN cbt_assignments a ON a.exam_id=e.id WHERE e.id=? AND e.status=\'scheduled\' AND a.account_id=?').get(row.exam_id, user.id))
        return false; if (row.kind === 'cbt_invitation' && !this.db.prepare('SELECT 1 FROM notice_recipients WHERE notice_id=? AND account_id=?').get(row.id, user.id))
        return false; if (row.scope === 'all')
        return true; if (user.level !== row.level)
        return false; return row.scope === 'level' || Boolean(this.academic.row(row.course_id).published_payload && this.academic.canRead(user, this.academic.row(row.course_id))); }
    dto(row, user) { const sender = actorLabel(this.s, row.author); return { id: row.id, title: row.title, message: row.message, kind: row.kind, scope: row.scope, level: row.level, courseId: row.course_id, priority: row.priority, publishAt: new Date(row.publish_at).toISOString(), status: row.status, expiresAt:row.expires_at?new Date(row.expires_at).toISOString():null, revision: row.revision, sender: { name: sender.name, position: row.author_role }, correctedBy: row.revision > 1 ? actorLabel(this.s, row.publisher ?? row.author).name : null, read: user ? this.db.prepare('SELECT revision FROM notice_reads WHERE account_id=? AND notice_id=?').get(user.id, row.id)?.revision === row.revision : false }; }
    preferences(session) { const user = this.s.requireUser(session), row = this.db.prepare('SELECT * FROM notification_preferences WHERE account_id=?').get(user.id); return { revision: row?.revision ?? 0, announcements: row ? Boolean(row.announcements) : true, resources: row ? Boolean(row.resources) : true }; }
    savePreferences(session, input) { fields(input, ['revision', 'announcements', 'resources']); if (typeof input.announcements !== 'boolean' || typeof input.resources !== 'boolean')
        fail(400, 'INVALID_PREFERENCE'); return this.s.tx(() => { const user = this.s.requireUser(session), old = this.preferences(session); revision(old, input.revision); this.db.prepare('INSERT INTO notification_preferences VALUES(?,?,?,?) ON CONFLICT(account_id) DO UPDATE SET announcements=excluded.announcements,resources=excluded.resources,revision=excluded.revision').run(user.id, input.announcements ? 1 : 0, input.resources ? 1 : 0, old.revision + 1); return this.preferences(session); }); }
    feed(session, includeMuted = false, cursor = null) {
      const user=this.s.requireUser(session);this.activateDue();const prefs=this.preferences(session);let edge={at:Number.MAX_SAFE_INTEGER,id:'ffffffff-ffff-ffff-ffff-ffffffffffff'};
      if(cursor){try{if(cursor.length>200)throw new Error();edge=JSON.parse(Buffer.from(cursor,'base64url').toString());if(!Number.isSafeInteger(edge.at)||typeof edge.id!=='string'||!/^[a-f0-9-]{36}$/.test(edge.id))throw new Error();}catch{fail(400,'INVALID_CURSOR');}}
      const candidates=this.db.prepare("SELECT * FROM notices WHERE status='published' AND (scope='all' OR level=?) AND (expires_at IS NULL OR expires_at>?) AND (publish_at<? OR (publish_at=? AND id<?)) ORDER BY publish_at DESC,id DESC LIMIT 51").all(user.level,this.s.now(),edge.at,edge.at,edge.id),page=candidates.slice(0,50),rows=page.filter(r=>this.eligible(user,r)).filter(r=>includeMuted||r.priority!=='normal'||['administrative','cbt_invitation'].includes(r.kind)||(r.kind==='resource'?prefs.resources:prefs.announcements));
      this.s.tx(()=>{for(const row of rows)this.db.prepare('INSERT INTO notice_deliveries VALUES(?,?,?,?) ON CONFLICT(notice_id,account_id) DO UPDATE SET revision=excluded.revision,delivered_at=excluded.delivered_at WHERE notice_deliveries.revision!=excluded.revision').run(row.id,user.id,row.revision,this.s.now());});
      return {preferences:prefs,notices:rows.map(r=>({...this.dto(r,user),deliveryStatus:'delivered'})),nextCursor:candidates.length>50?Buffer.from(JSON.stringify({at:page.at(-1).publish_at,id:page.at(-1).id})).toString('base64url'):null};
    }
    mark(session, id, input) { fields(input, ['revision', 'read']); if (typeof input.read !== 'boolean')
        fail(400, 'INVALID_INPUT'); return this.s.tx(() => { const user = this.s.requireUser(session), row = this.row(id); if (!this.eligible(user, row))
        fail(404, 'NOT_FOUND'); revision(row, input.revision); if (input.read)
        this.db.prepare('INSERT INTO notice_reads VALUES(?,?,?) ON CONFLICT(account_id,notice_id) DO UPDATE SET revision=excluded.revision').run(user.id, id, row.revision);
    else
        this.db.prepare('DELETE FROM notice_reads WHERE account_id=? AND notice_id=?').run(user.id, id); return this.dto(row, user); }); }
    history(session) { const user = fresh(this.s, session); if (session.active_role === 'administrator')
        this.s.requireAdmin(session);
    else
        this.authority(session, session.active_role === 'executive' ? 'all' : 'level', user.level); this.activateDue(); return { notices: this.db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 100').all().filter(r => session.active_role === 'administrator' || r.author === user.id).map(r => ({ ...this.dto(r, null), deliveredCount:this.db.prepare('SELECT count(*) AS n FROM notice_deliveries WHERE notice_id=? AND revision=?').get(r.id,r.revision).n, history: this.db.prepare('SELECT revision,created_at FROM notice_versions WHERE notice_id=? ORDER BY id DESC LIMIT 20').all(r.id) })) }; }
    update(session, id, input) { fields(input, ['revision', 'action', 'title', 'message', 'priority', 'publishAt']); return this.s.tx(() => { const row = this.row(id), user = this.authority(session, row.scope, row.level); if (row.author !== user.id && session.active_role !== 'administrator')
        fail(403, 'AUTHOR_REQUIRED'); if (row.kind === 'cbt_invitation')
        fail(403, 'USE_EXAM_WORKFLOW'); revision(row, input.revision); if (input.action === 'withdraw')
        this.db.prepare('UPDATE notices SET status=\'withdrawn\',revision=revision+1 WHERE id=?').run(id);
    else if (input.action === 'correct') {
        const data = this.normalize({ ...input, kind: row.kind });
        const future = data.at > this.s.now();
        this.db.prepare('UPDATE notices SET title=?,message=?,priority=?,publish_at=?,status=?,delivered_at=?,revision=revision+1 WHERE id=?').run(data.title, data.message, data.priority, data.at, future ? 'scheduled' : 'published', future ? null : this.s.now(), id);
    }
    else
        fail(400, 'INVALID_ACTION'); this.db.prepare('UPDATE notices SET publisher=?,publisher_role=? WHERE id=?').run(user.id, session.active_role, id); this.snapshot(this.row(id), user.id); return this.dto(this.row(id), user); }); }
    expiry(session,id,input){fields(input,['revision','expiresAt']);return this.s.tx(()=>{const row=this.row(id),actor=this.authority(session,row.scope,row.level);if(row.author!==actor.id&&session.active_role!=='administrator')fail(403,'AUTHOR_REQUIRED');if(row.kind==='cbt_invitation')fail(403,'USE_EXAM_WORKFLOW');revision(row,input.revision);const at=input.expiresAt===null?null:instant(input.expiresAt);if(at!==null&&at<=row.publish_at)fail(400,'INVALID_DATE');this.db.prepare('UPDATE notices SET expires_at=?,revision=revision+1 WHERE id=?').run(at,id);this.snapshot(this.row(id),actor.id);return this.dto(this.row(id),actor);});}
    invite(session, exam, students) { const actor = this.s.requireAdmin(session), id = randomUUID(), course = this.academic.row(exam.course_id); this.db.prepare('INSERT INTO notices(id,author,author_role,title,message,kind,scope,level,course_id,priority,publish_at,delivered_at,status,created_at,exam_id)VALUES(?,?,\'administrator\',?,?,\'cbt_invitation\',\'course\',?,?,\'important\',?,?,\'published\',?,?)').run(id, actor.id, 'CBT invitation: ' + exam.title, 'View your assigned batch and instructions in CBT. Entry requires the administrator-released schedule.', course.level, course.id, this.s.now(), this.s.now(), this.s.now(), exam.id); for (const student of students)
        this.db.prepare('INSERT INTO notice_recipients VALUES(?,?)').run(id, student); this.snapshot(this.row(id), actor.id); }
}
