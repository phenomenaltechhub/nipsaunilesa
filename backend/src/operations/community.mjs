import { randomUUID } from 'node:crypto';
import { fields, fail, plain, integer, revision, list, choices, actorLabel } from './common.mjs';
export class CommunityOperations {
    constructor(service) { this.s = service; this.db = service.db; }
    row(id) { const row = this.db.prepare('SELECT * FROM community_messages WHERE id=?').get(integer(id, 1)); if (!row)
        fail(404, 'NOT_FOUND'); return row; }
    dto(row, user) { let quote = null; if (row.reply_to) {
        const parent = this.row(row.reply_to);
        quote = { id: parent.id, sender: actorLabel(this.s, parent.author).name, body: parent.removed ? 'Message removed' : parent.body };
    } return { id: row.id, sender: actorLabel(this.s, row.author), body: row.removed ? 'Message removed' : row.body, removed: Boolean(row.removed), revision: row.revision, replyTo: quote, mentions: row.removed ? [] : JSON.parse(row.mentions).map(id => actorLabel(this.s, id)), createdAt: new Date(row.created_at).toISOString(), edited: row.updated_at !== row.created_at, reactions: row.removed ? [] : this.db.prepare('SELECT reaction,count(*) AS count,max(CASE WHEN account_id=? THEN 1 ELSE 0 END) AS mine FROM community_reactions WHERE message_id=? GROUP BY reaction').all(user.id, row.id).map(r => ({ ...r, mine: Boolean(r.mine) })) }; }
    page(session, before = Number.MAX_SAFE_INTEGER) { const user = this.s.requireUser(session); integer(before, 1, Number.MAX_SAFE_INTEGER); const rows = this.db.prepare('SELECT * FROM community_messages WHERE id<? ORDER BY id DESC LIMIT 31').all(before), more = rows.length > 30, page = rows.slice(0, 30).reverse(); return { streamVersion:this.db.prepare('SELECT revision FROM community_stream WHERE id=1').get().revision, isOpen: Boolean(this.db.prepare('SELECT is_open FROM community_state').get().is_open), suspended: Boolean(this.db.prepare('SELECT 1 FROM chat_suspensions WHERE account_id=?').get(user.id)), messagingImplemented: true, messages: page.map(r => this.dto(r, user)), olderCursor: more ? page[0].id : null }; }
    members(session, offset = 0) { this.s.requireUser(session); integer(offset); return { members: this.db.prepare('SELECT id FROM accounts WHERE status=\'active\' ORDER BY name,id LIMIT 50 OFFSET ?').all(offset).map(u => actorLabel(this.s, u.id)), nextOffset: offset + 50 }; }
    create(session, input) { this.s.checkChatWrite(session); fields(input, ['requestId', 'body', 'replyTo', 'mentions']); const body = plain(input.body, 2000); if (!/^[a-f0-9-]{36}$/.test(input.requestId))
        fail(400, 'INVALID_REQUEST_ID'); const mentions = list(input.mentions ?? [], 5); if (new Set(mentions).size !== mentions.length)
        fail(400, 'INVALID_MENTIONS'); return this.s.tx(() => { const user = this.s.checkChatWrite(session), fingerprint = this.s.hash(JSON.stringify([body, input.replyTo ?? null, mentions])); const replay = this.db.prepare('SELECT * FROM community_messages WHERE author=? AND request_id=?').get(user.id, input.requestId); if (replay) {
        if (replay.fingerprint !== fingerprint)
            fail(409, 'REPLAY_CONFLICT');
        return this.dto(replay, user);
    } for (const id of mentions) {
        const member = this.s.account(id);
        if (!member || member.status !== 'active')
            fail(400, 'INVALID_MENTION');
    } if (input.replyTo !== null && input.replyTo !== undefined && this.row(input.replyTo).removed)
        fail(400, 'REMOVED_REPLY'); if (this.db.prepare('SELECT 1 FROM community_messages WHERE author=? AND fingerprint=? AND created_at>?').get(user.id, fingerprint, this.s.now() - 300000))
        fail(409, 'DUPLICATE_MESSAGE'); this.checkPostingRate(user.id); const row = this.db.prepare('INSERT INTO community_messages(author,body,reply_to,mentions,request_id,fingerprint,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?) RETURNING *').get(user.id, body, input.replyTo ?? null, JSON.stringify(mentions), input.requestId, fingerprint, this.s.now(), this.s.now()); this.s.audit(user.id, 'community.message_created', String(row.id)); return this.dto(row, user); }); }
    checkPostingRate(id) { const count = this.db.prepare('SELECT count(*) AS n FROM community_messages WHERE author=? AND created_at>?').get(id, this.s.now() - 60000).n; if (count >= 8)
        fail(429, 'POST_RATE_LIMIT', 'Please pause before posting again.'); const hourly = this.db.prepare('SELECT count(*) AS n FROM community_messages WHERE author=? AND created_at>?').get(id, this.s.now() - 3600000).n; if (hourly >= 60)
        fail(429, 'POST_RATE_LIMIT'); }
    edit(session, id, input) { fields(input, ['revision', 'action', 'body']); return this.s.tx(() => { const user = this.s.checkChatWrite(session), row = this.row(id); revision(row, input.revision); if (row.author !== user.id || row.removed || row.created_at + 15 * 60000 < this.s.now())
        fail(403, 'EDIT_FORBIDDEN'); this.db.prepare('INSERT INTO community_versions(message_id,actor,body,revision,created_at)VALUES(?,?,?,?,?)').run(id, user.id, row.body, row.revision, this.s.now()); if (input.action === 'remove')
        this.db.prepare('UPDATE community_messages SET body=\'Message removed\',removed=1,revision=revision+1,updated_at=? WHERE id=?').run(this.s.now(), id);
    else if (input.action === 'correct')
        this.db.prepare('UPDATE community_messages SET body=?,revision=revision+1,updated_at=? WHERE id=?').run(plain(input.body, 2000), this.s.now(), id);
    else
        fail(400, 'INVALID_ACTION'); this.s.audit(user.id, 'community.message_' + input.action, String(id)); return this.dto(this.row(id), user); }); }
    react(session, id, input) { fields(input, ['reaction', 'active']); choices(input.reaction, ['thanks', 'agree', 'question']); if (typeof input.active !== 'boolean')
        fail(400, 'INVALID_INPUT'); this.s.rate('reaction:' + this.s.checkChatWrite(session).id, 30); return this.s.tx(() => { const user = this.s.checkChatWrite(session), row = this.row(id); if (row.removed)
        fail(409, 'REMOVED_MESSAGE'); if (input.active)
        this.db.prepare('INSERT OR IGNORE INTO community_reactions VALUES(?,?,?)').run(id, user.id, input.reaction);
    else
        this.db.prepare('DELETE FROM community_reactions WHERE message_id=? AND account_id=? AND reaction=?').run(id, user.id, input.reaction); return this.dto(row, user); }); }
    report(session, id, input) { fields(input, ['reason', 'note']); choices(input.reason, ['spam', 'abuse', 'privacy', 'other']); const note = plain(input.note ?? '', 300, true); const user = this.s.requireUser(session); this.s.rate('report:' + user.id, 10, 3600000); return this.s.tx(() => { this.s.requireUser(session); this.row(id); const old = this.db.prepare('SELECT id FROM community_reports WHERE message_id=? AND reporter=?').get(id, user.id); if (old)
        return { id: old.id, status: 'received' }; const report = randomUUID(); this.db.prepare('INSERT INTO community_reports(id,message_id,reporter,reason,note,created_at)VALUES(?,?,?,?,?,?)').run(report, id, user.id, input.reason, note, this.s.now()); this.s.audit(user.id, 'community.report_created', report, { messageId: id }); return { id: report, status: 'received' }; }); }
    reports(session) { this.s.requireAdmin(session); return { reports: this.db.prepare('SELECT * FROM community_reports ORDER BY created_at DESC LIMIT 100').all().map(r => ({ ...r, message: this.dto(this.row(r.message_id), session.user) })) }; }
    moderate(session, id, input) { fields(input, ['revision', 'action', 'note']); plain(input.note, 500); return this.s.tx(() => { const actor = this.s.requireAdmin(session), row = this.db.prepare('SELECT * FROM community_reports WHERE id=?').get(id); if (!row)
        fail(404, 'NOT_FOUND'); revision(row, input.revision); if (row.status !== 'open')
        fail(409, 'REPORT_CLOSED'); choices(input.action, ['dismiss', 'resolve', 'remove']); if (input.action === 'remove') {
        const message = this.row(row.message_id);
        this.db.prepare('INSERT INTO community_versions(message_id,actor,body,revision,created_at)VALUES(?,?,?,?,?)').run(message.id, actor.id, message.body, message.revision, this.s.now());
        this.db.prepare('UPDATE community_messages SET removed=1,body=\'Message removed\',revision=revision+1,updated_at=? WHERE id=?').run(this.s.now(), message.id);
    } this.db.prepare('UPDATE community_reports SET status=?,revision=revision+1,decision_note=? WHERE id=?').run(input.action === 'dismiss' ? 'dismissed' : 'resolved', input.note, id); this.s.audit(actor.id, 'community.report_' + input.action, id, { messageId: row.message_id }); return { updated: true }; }); }
}
