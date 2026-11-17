import {synchronize} from './sync.mjs';
import { api, node, button, form, card, heading, empty, notice, selectField } from './common.mjs';
export async function communityView(root, ctx) {
    const page = await api('/community/messages');
    if (!ctx.alive())
        return;
    heading(root, 'Community', 'One general departmental community. Respect others and protect personal information.');
    const state = card(page.isOpen && !page.suspended ? 'Messaging is open' : 'Messaging is restricted');
    state.append(node('p', page.suspended ? 'Your posting access is suspended. You can read history, report concerns and continue using academic tools.' : page.isOpen ? 'Post responsibly using your verified account.' : 'Administrators have restricted posting. Read-only history and reporting remain available.'));
    root.append(state);
    const syncStatus=node('p','','status');syncStatus.setAttribute('role','status');root.append(syncStatus);let lastVersion=page.streamVersion;
    const controls = node('div', '', 'choices'), messages = node('section', '', 'community-history');
    messages.setAttribute('aria-label', 'Community message history');
    const compose = card('Message the department');
    let replyTo = null;
    const mentions = new Map();
    const refresh = button('Refresh messages', () => ctx.refresh()), membersButton = button('Members and mentions', async () => { const dialog = node('dialog'), h = node('h2', 'Community members'), list = node('div'); h.id = 'community-members-title'; dialog.setAttribute('aria-labelledby', h.id); let offset = 0; const more = button('Load more members', load); async function load() { try {
        const result = await api('/community/members?offset=' + offset);
        if (!ctx.alive())
            return;
        for (const member of result.members) {
            const roles = member.roles.map(role => ({ representative: 'Class representative', administrator: 'Administrator', reviewer: 'Academic reviewer', student: 'Student', executive: 'Executive' })[role] ?? role);
            list.append(node('p', `${member.name} · ${member.level} Level · ${roles.join(', ')}`));
            if (page.isOpen && !page.suspended)
                list.append(button('Mention ' + member.name, () => { if (mentions.size >= 5 && !mentions.has(member.id)) {
                    notice(dialog, 'Choose at most five mentions.');
                    return;
                } mentions.set(member.id, member.name); replyStatus.textContent = 'Mentions: ' + Array.from(mentions.values()).join(', '); dialog.close(); dialog.remove(); compose.querySelector('textarea')?.focus(); }));
        }
        offset = result.nextOffset;
        more.hidden = result.members.length < 50;
    }
    catch (error) {
        notice(dialog, error.message);
    } } dialog.append(h, list, more, button('Close members', () => { dialog.close(); dialog.remove(); })); root.append(dialog); dialog.showModal(); await load(); });
    controls.append(refresh, membersButton);
    root.append(controls, messages);
    const replyStatus = node('p', 'No reply selected.', 'muted');
    compose.append(replyStatus);
    const rows = [];
    function draw(records, prepend = false) {
        for (const message of records) {
            const row = node('article', '', 'community-message');
            row.setAttribute('aria-label', 'Message from ' + message.sender.name);
            row.append(node('h3', `${message.sender.name} · ${message.sender.level ?? 'Former'} Level`), node('p', message.sender.roles.join(' · '), 'muted'));
            if (message.replyTo)
                row.append(node('blockquote', `${message.replyTo.sender}: ${message.replyTo.body}`));
            row.append(node('p', message.body, 'preserve-lines'), node('p', `${new Date(message.createdAt).toLocaleString()}${message.edited ? ' · corrected' : ''}`, 'muted'));
            const actions = node('div', '', 'choices');
            const reply = () => { replyTo = message.id; replyStatus.textContent = 'Replying to ' + message.sender.name; compose.querySelector('textarea')?.focus(); };
            if (page.isOpen && !page.suspended && !message.removed) {
                actions.append(button('Reply to ' + message.sender.name, reply));
                let start = null;
                row.addEventListener('pointerdown', e => { start = { x: e.clientX, y: e.clientY }; });
                row.addEventListener('pointerup', e => { if (start && e.clientX - start.x > 60 && Math.abs(e.clientY - start.y) < 40)
                    reply(); start = null; });
                for (const [value, label] of [['thanks', 'Thanks'], ['agree', 'Agree'], ['question', 'Question']]) {
                    const reaction = message.reactions.find(r => r.reaction === value);
                    actions.append(button(`${label} (${reaction?.count ?? 0})`, async () => { try {
                        await api('/community/messages/' + message.id + '/reaction', 'PUT', { reaction: value, active: !reaction?.mine });
                        ctx.refresh();
                    }
                    catch (error) {
                        notice(row, error.message);
                    } }));
                }
                if (message.sender.id === ctx.identity.user.id) {
                    const edit = node('details');
                    edit.append(node('summary', 'Correct or remove my message'), form('Update my message ' + message.id, [selectField('action', 'Action', [['correct', 'Correct message'], ['remove', 'Remove message']]), { id: 'body', label: 'Corrected message', value: message.body, multiline: true, maxLength: 2000 }], async (v) => { await api('/community/messages/' + message.id, 'PATCH', { ...v, revision: message.revision }); ctx.refresh(); }));
                    row.append(edit);
                }
            }
            if (!message.removed) {
                const report = node('details');
                report.append(node('summary', 'Report this message'), form('Send report ' + message.id, [selectField('reason', 'Reason', [['spam', 'Spam'], ['abuse', 'Abuse'], ['privacy', 'Privacy'], ['other', 'Other']]), { id: 'note', label: 'Brief report note (optional)', required: false, maxLength: 300 }], async (v, status) => { await api('/community/messages/' + message.id + '/report', 'POST', v); status.textContent = 'Report received for administrator review.'; }));
                row.append(report);
            }
            row.append(actions);
            rows.push(row);
            if (prepend)
                messages.prepend(row);
            else
                messages.append(row);
        }
    }
    draw(page.messages);
    if (!page.messages.length)
        empty(messages, 'No messages yet', 'Messages will appear here once members can post.');
    if (page.olderCursor) {
        let cursor = page.olderCursor;
        const older = button('Load older messages', async () => { try {
            const data = await api('/community/messages?before=' + cursor);
            if (!ctx.alive())
                return;
            draw([...data.messages].reverse(), true);
            cursor = data.olderCursor;
            older.hidden = !cursor;
        }
        catch (error) {
            notice(state, error.message);
        } });
        controls.prepend(older);
    }
    if (page.isOpen && !page.suspended) {
        const composer = form('Send message', [{ id: 'body', label: 'Your message', multiline: true, maxLength: 2000 }], async (v, status) => { await api('/community/messages', 'POST', { ...v, requestId: crypto.randomUUID(), replyTo, mentions: Array.from(mentions.keys()) }); status.textContent = 'Message sent.'; ctx.refresh(); });
        compose.append(composer, button('Clear reply and mention', () => { replyTo = null; mentions.clear(); replyStatus.textContent = 'No reply selected.'; }));
        root.append(compose);
    }
    const stopSync=synchronize(()=>api('/community/changes'),async data=>{if(!ctx.alive())return;if(lastVersion!==data.version||data.suspended!==page.suspended||data.isOpen!==page.isOpen){const busy=Boolean(compose.querySelector('textarea')?.value.trim())||replyTo!==null||root.querySelector('dialog[open],details[open]');if(busy)syncStatus.textContent='Community updates are available. Finish or copy your draft, then refresh messages.';else ctx.refresh();}lastVersion=data.version;},{interval:12000,onError:error=>{if(ctx.alive())syncStatus.textContent=error.message;}});
    return () => {stopSync(); for (const dialog of root.querySelectorAll('dialog')) {
        dialog.close();
        dialog.remove();
    } rows.length = 0; };
}
export async function moderationView(root, ctx) { const data = await api('/admin/community/reports'); if (!ctx.alive())
    return; heading(root, 'Community moderation', 'Reports and removal decisions are authorized and audited.'); for (const report of data.reports) {
    const row = card('Report: ' + report.reason);
    row.append(node('p', `${report.message.sender.name} · ${report.status}`), node('p', report.message.body, 'preserve-lines'), node('p', report.note));
    if (report.status === 'open')
        row.append(form('Record moderation decision ' + report.id, [selectField('action', 'Decision', [['resolve', 'Resolve report'], ['dismiss', 'Dismiss report'], ['remove', 'Remove message']]), { id: 'note', label: 'Decision note', multiline: true, maxLength: 500 }], async (v) => { await api('/admin/community/reports/' + report.id, 'PATCH', { ...v, revision: report.revision }); ctx.refresh(); }));
    root.append(row);
} if (!data.reports.length)
    empty(root, 'No reports awaiting review'); }
