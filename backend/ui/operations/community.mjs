import { synchronize } from './sync.mjs';
import { icon } from '/src/components/dom.js';
import { api, node, button, form, card, heading, empty, notice, selectField } from './common.mjs';

export async function communityView(root, ctx) {
  let page = await api('/community/messages');
  if (!ctx.alive()) return;
  if (!document.getElementById('community-chat-style')) {
    const style = node('link'); style.id = 'community-chat-style'; style.rel = 'stylesheet'; style.href = '/operations/community.css';style.addEventListener('load',()=>{if(ctx.alive()){layout();toBottom();}},{once:true}); document.head.append(style);
  }
  const main = root.closest('main');
  main?.classList.add('community-main'); document.body.classList.add('community-layout');
  root.replaceChildren();
  const screen = node('section', '', 'community-screen'), header = node('header', '', 'chat-header');
  const mark = node('div', '', 'chat-mark'); mark.append(icon('community')); mark.setAttribute('aria-hidden', 'true');
  const identity = node('div', '', 'chat-group-identity'), title = node('h1', 'Community'); title.id = 'page-title';
  identity.append(node('p', 'NIPSA UNILESA', 'chat-affiliation'), title);
  const tools = node('div', '', 'chat-header-tools');
  const refresh = button('Refresh messages', () => refreshLatest(true)), members = button('Members and mentions', () => openMembers());
  const refreshIcon=document.createElementNS('http://www.w3.org/2000/svg','svg');refreshIcon.setAttribute('viewBox','0 0 24 24');refreshIcon.setAttribute('fill','none');refreshIcon.setAttribute('stroke','currentColor');refreshIcon.setAttribute('stroke-width','1.8');refreshIcon.setAttribute('aria-hidden','true');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M20 5v6h-6M19 11a7 7 0 1 0-1.5 6');refreshIcon.append(path);refresh.replaceChildren(refreshIcon); refresh.setAttribute('aria-label', 'Refresh messages'); refresh.title = 'Refresh messages';
  members.replaceChildren(icon('community')); members.setAttribute('aria-label', 'Members and mentions'); members.title = 'Members and group information';
  tools.append(refresh, members); header.append(mark, identity, tools);
  const policy = node('div', '', 'chat-policy'), state = node('h2'), policyCopy = node('p'); policyCopy.id = 'chat-policy-note'; policyCopy.setAttribute('role', 'status'); policy.append(state, policyCopy);
  const timeline = node('div', '', 'chat-timeline'); timeline.tabIndex = 0; timeline.setAttribute('role', 'region'); timeline.setAttribute('aria-label', 'Conversation timeline');
  const older = button('Load older messages', loadOlder), messages = node('section', '', 'community-history chat-history');
  messages.setAttribute('role', 'log'); messages.setAttribute('aria-label', 'Community message history'); messages.setAttribute('aria-live', 'off'); messages.setAttribute('aria-relevant', 'additions text');
  timeline.append(older, messages);
  const composer = node('form', '', 'chat-composer'); composer.setAttribute('aria-label', 'Send message');
  const replyBox = node('div', '', 'chat-compose-context'), replyStatus = node('p'), clearReply = button('Clear reply and mention', () => { replyTo = null; mentions.clear(); showContext(); text.focus(); });
  clearReply.replaceChildren(node('span', '×')); clearReply.setAttribute('aria-label', 'Clear reply and mention'); replyBox.append(replyStatus, clearReply); replyBox.hidden = true;
  const composeRow = node('div', '', 'chat-compose-row'), label = node('label', 'Your message', 'chat-visually-hidden'), text = node('textarea');
  text.id = 'community-draft'; label.htmlFor = text.id; text.rows = 2; text.maxLength = 2000; text.placeholder = 'Message the group'; text.setAttribute('enterkeyhint', 'send'); text.setAttribute('aria-describedby', 'chat-policy-note chat-keyboard-help');
  const send = node('button', 'Send message', 'chat-send'); send.type = 'submit';
  composeRow.append(label, text, send);
  const helper = node('p', 'Enter to send · Shift+Enter for a new line', 'chat-keyboard-help'); helper.id = 'chat-keyboard-help';
  const status = node('p', '', 'chat-feedback'); status.setAttribute('role', 'status');
  const restrictedFeedback = 'Posting is restricted. Your unsent draft stays in this view until you leave or sign out.';
  composer.append(replyBox, composeRow, helper, status);
  const update = button('New messages · go to latest', () => refreshLatest(true)); update.className = 'chat-updates'; update.hidden = true;
  screen.append(header, policy, timeline, update, composer); root.append(screen);
  const records = new Map(page.messages.map(m => [m.id, m])), rendered = new Map(), mentions = new Map();
  let replyTo = null, cursor = page.olderCursor, disposed = false, sending = false, queuedPost = null, loading = false;
  let lastVersion = page.streamVersion;
  const posting = () => page.isOpen && !page.suspended;
  const alive = () => !disposed && ctx.alive();
  function layout() {
    if (!alive()) return;
    const top = (document.querySelector('.topbar')?.getBoundingClientRect().height ?? 0)+(document.getElementById('update-notice')?.getBoundingClientRect().height??0), nav = document.getElementById('mobile-nav');
    const bottom = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().height : 0;
    const viewport = window.visualViewport;
    update.style.bottom=composer.getBoundingClientRect().height+12+'px';
    screen.style.height = Math.max(180, (viewport?.height ?? innerHeight) - top - bottom) + 'px';
  }
  function showPolicy() {
    state.textContent = posting() ? 'Messaging is open' : 'Messaging is restricted';
    policyCopy.textContent = page.suspended ? 'Your posting access is suspended. Read history or report a concern; academic access remains available.' : page.isOpen ? 'One departmental group. Share responsibly and protect personal information.' : 'Administrators have restricted posting. You can read the conversation and report concerns.';
    text.disabled = !posting(); send.disabled = !posting() || sending;
    text.placeholder = posting() ? 'Message the group' : 'Messaging is restricted';
    helper.textContent = posting() ? 'Enter to send · Shift+Enter for a new line' : 'Posting will be available when an administrator enables it.';
    if (posting() && status.textContent === restrictedFeedback) status.textContent = '';
  }
  function showContext() {
    const reply = replyTo ? records.get(replyTo) : null;
    replyStatus.textContent = [reply ? 'Replying to ' + reply.sender.name + ': ' + reply.body.slice(0, 140) : '', mentions.size ? 'Mentioning ' + Array.from(mentions.values()).join(', ') : ''].filter(Boolean).join(' · ');
    replyBox.hidden = !reply && !mentions.size; layout();
  }
  function closeDialog(dialog) { dialog.close(); dialog.remove(); }
  function dialog(titleText) {
    const d = node('dialog', '', 'chat-dialog'), h = node('h2', titleText); h.id = 'community-dialog-title'; d.setAttribute('aria-labelledby', h.id);
    d.append(h); root.append(d); d.addEventListener('close', () => { if (d.isConnected) d.remove(); }); return d;
  }
  async function openMembers() {
    const d = dialog('Community members'), list = node('div'); let offset = 0;
    d.append(node('p', 'One general departmental group. Respect others, protect personal information and use reporting for moderation concerns.'));
    const more = button('Load more members', load);
    async function load() { try {
      const data = await api('/community/members?offset=' + offset); if (!alive() || !d.isConnected) return;
      for (const member of data.members) {
        const row = node('div', '', 'chat-member'); row.append(node('h3', member.name), node('p', `${member.level} Level · ${member.roles.map(roleLabel).join(' · ')}`));
        if (posting()) row.append(button('Mention ' + member.name, () => { if (mentions.size >= 5 && !mentions.has(member.id)) { notice(d, 'Choose at most five mentions.'); return; } mentions.set(member.id, member.name); showContext(); closeDialog(d); text.focus(); }));
        list.append(row);
      }
      offset = data.nextOffset; more.hidden = data.members.length < 50;
    } catch (error) { if (d.isConnected) notice(d, error.message); } }
    d.append(list, more, button('Close members', () => closeDialog(d))); d.showModal(); await load();
  }
  function roleLabel(role) { return ({ representative: 'Class representative', administrator: 'Administrator', reviewer: 'Academic reviewer', student: 'Student', executive: 'Executive' })[role] ?? role; }
  function chooseReply(message) { if (!posting() || message.removed) return; replyTo = message.id; showContext(); text.focus(); }
  function showProfile(message) {
    const d = dialog('Member profile'); d.append(node('h3', message.sender.name), node('p', `${message.sender.level ?? 'Former member'} Level`), node('p', message.sender.roles.map(roleLabel).join(' · ')), button('Close profile', () => closeDialog(d))); d.showModal();
  }
  function showReactions(message) {
    const d = dialog('Message reactions');
    for (const [value, label] of [['thanks', 'Thanks'], ['agree', 'Agree'], ['question', 'Question']]) {
      const reaction = message.reactions.find(r => r.reaction === value), b = button(`${label} (${reaction?.count ?? 0})`, async () => { try {
        const saved = await api('/community/messages/' + message.id + '/reaction', 'PUT', { reaction: value, active: !reaction?.mine });
        if (!alive()) return; records.set(saved.id, saved); closeDialog(d); draw();rendered.get(message.id)?.row.querySelector('.chat-react-trigger')?.focus({preventScroll:true}); status.textContent = 'Reaction updated.';
      } catch (error) { if (d.isConnected) notice(d, error.message); } });
      b.disabled = !posting(); b.setAttribute('aria-pressed', String(Boolean(reaction?.mine))); d.append(b);
    }
    d.append(button('Close reactions', () => closeDialog(d))); d.showModal();
  }
  function showActions(message) {
    const d = dialog('Message actions');
    d.append(node('p', message.sender.name), node('p', message.body, 'preserve-lines'));
    if (posting() && message.sender.id === ctx.identity.user.id && !message.removed) d.append(form('Update my message ' + message.id, [selectField('action', 'Action', [['correct', 'Correct message'], ['remove', 'Remove message']]), { id: 'body', label: 'Corrected message', value: message.body, multiline: true, maxLength: 2000 }], async v => {
      const saved = await api('/community/messages/' + message.id, 'PATCH', { ...v, revision: message.revision }); if (!alive()) return; records.set(saved.id, saved); closeDialog(d); await refreshLatest(false); draw(); status.textContent = 'Message updated.';
    }));
    if (!message.removed) d.append(form('Send report ' + message.id, [selectField('reason', 'Reason', [['spam', 'Spam'], ['abuse', 'Abuse'], ['privacy', 'Privacy'], ['other', 'Other']]), { id: 'note', label: 'Brief report note (optional)', required: false, maxLength: 300 }], async (v, feedback) => { await api('/community/messages/' + message.id + '/report', 'POST', v); feedback.textContent = 'Report received for administrator review.'; }));
    d.append(button('Close actions', () => closeDialog(d))); d.showModal();
  }
  function messageNode(message) {
    const own = message.sender.id === ctx.identity.user.id, row = node('article', '', 'community-message chat-message ' + (own ? 'chat-own' : 'chat-other'));
    row.dataset.messageId = String(message.id); row.setAttribute('aria-label', 'Message from ' + message.sender.name);
    const bubble = node('div', '', 'chat-bubble'), by = button(message.sender.name, () => showProfile(message)); by.className = 'chat-sender';
    const identity = node('div', '', 'chat-message-identity'); identity.append(by, node('span', message.sender.level?`${message.sender.level} Level`:'Former member', 'chat-level'));
    for (const role of message.sender.roles.filter(role => role !== 'student')) identity.append(node('span', roleLabel(role), 'chat-role'));
    bubble.append(identity);
    if (message.replyTo) bubble.append(node('blockquote', message.replyTo.sender + '\n' + message.replyTo.body, 'chat-quote'));
    bubble.append(node('p', message.body, 'chat-text'));
    if (message.mentions.length) bubble.append(node('p', message.mentions.map(member => '@' + member.name).join(' '), 'chat-mentions'));
    const time = node('time', new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); time.dateTime = message.createdAt; time.title = new Date(message.createdAt).toLocaleString();
    const footer = node('div', '', 'chat-message-footer'); if (message.edited) footer.append(node('span', 'Corrected')); footer.append(time); bubble.append(footer);
    const actions = node('div', '', 'chat-message-actions');
    if (!message.removed) {
      const reply = button('Reply', () => chooseReply(message)); reply.setAttribute('aria-label', 'Reply to ' + message.sender.name); reply.disabled = !posting();
      const react = button('React', () => showReactions(message)); react.className='chat-react-trigger'; react.setAttribute('aria-label', 'React to ' + message.sender.name); react.disabled = !posting();
      const more = button('More', () => showActions(message)); more.setAttribute('aria-label', 'Message actions for ' + message.sender.name);
      actions.append(reply, react, more);
      for (const [value, label] of [['thanks', 'Thanks'], ['agree', 'Agree'], ['question', 'Question']]) {
        const reaction = message.reactions.find(r => r.reaction === value); if (!reaction?.count) continue;
        const chip = button(`${label} (${reaction.count})`, () => showReactions(message)); chip.className = 'chat-reaction'; chip.disabled = !posting(); chip.setAttribute('aria-pressed', String(reaction.mine)); actions.append(chip);
      }
    }
    bubble.append(actions); row.append(bubble);
    let pointer = null;
    row.addEventListener('pointerdown', event => { if (event.pointerType === 'touch' && !event.target.closest('button,a,input,textarea')) pointer = { x: event.clientX, y: event.clientY }; });
    row.addEventListener('pointerup', event => { if (pointer && event.clientX - pointer.x > 60 && Math.abs(event.clientY - pointer.y) < 40) chooseReply(message); pointer = null; });
    return row;
  }
  function draw() {
    const ordered = Array.from(records.values()).sort((a, b) => a.id - b.id); const changed = posting() !== (messages.dataset.posting === 'true');
    messages.dataset.posting = String(posting());
    for (const message of ordered) {
      const fingerprint = JSON.stringify(message), old = rendered.get(message.id);
      if (!old || old.fingerprint !== fingerprint || changed) {
        const row = messageNode(message); if (old) old.row.replaceWith(row); rendered.set(message.id, { row, fingerprint });
      }
    }
    messages.querySelector('.chat-empty')?.remove();
    for (let i = 0; i < ordered.length; i++) { const row = rendered.get(ordered[i].id).row; if (messages.children[i] !== row) messages.insertBefore(row, messages.children[i] ?? null); }
    if (!ordered.length) { const blank = node('div', '', 'chat-empty'); blank.append(node('h3', 'No messages yet'), node('p', 'This is the general departmental conversation. Messages will appear here.')); messages.append(blank); }
    older.hidden = !cursor;
  }
  const nearBottom = () => timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight < 100;
  function toBottom() { timeline.scrollTop = timeline.scrollHeight; update.hidden = true; }
  async function loadOlder() {
    if (loading || !cursor) return; loading = true; older.disabled = true;
    const height = timeline.scrollHeight, top = timeline.scrollTop;
    try { const data = await api('/community/messages?before=' + cursor); if (!alive()) return; for (const message of data.messages) records.set(message.id, message); cursor = data.olderCursor; messages.setAttribute('aria-live', 'off'); draw(); timeline.scrollTop = top + timeline.scrollHeight - height; requestAnimationFrame(() => { if (alive()) messages.setAttribute('aria-live', 'polite'); }); }
    catch (error) { if (alive()) status.textContent = error.message; }
    finally { loading = false; older.disabled = false; }
  }
  async function refreshLatest(force = false) {
    if (loading || !alive()) return; loading = true;
    const atBottom = nearBottom(), previousTop = timeline.scrollTop;
    try { const data = await api('/community/messages'); if (!alive()) return; const changedPolicy = data.isOpen !== page.isOpen || data.suspended !== page.suspended; page = data; lastVersion = data.streamVersion;
      if (force) { records.clear(); rendered.clear(); messages.replaceChildren(); cursor = data.olderCursor; }
      for (const message of data.messages) records.set(message.id, message);
      showPolicy(); draw(); if (force || atBottom) toBottom(); else { timeline.scrollTop = previousTop; update.hidden = false; }
      if (changedPolicy && !posting()) status.textContent = restrictedFeedback;
    } catch (error) { if (alive()) status.textContent = error.message; }
    finally { loading = false; }
  }
  async function submit(event) {
    event.preventDefault(); if (sending || !posting() || !alive()) return;
    if (!queuedPost) { if (!text.value.trim()) { status.textContent = 'Write a message before sending.'; text.focus(); return; } queuedPost = { requestId: crypto.randomUUID(), body: text.value, replyTo, mentions: Array.from(mentions.keys()) }; }
    const payload = queuedPost; sending = true; send.disabled = true; status.textContent = 'Sending…';
    try { const saved = await api('/community/messages', 'POST', payload); if (!alive()) return; records.set(saved.id, saved); if (text.value === payload.body) text.value = ''; if (replyTo === payload.replyTo) replyTo = null; for (const id of payload.mentions) mentions.delete(id); queuedPost = null; showContext(); draw(); toBottom(); status.textContent = 'Message sent.'; text.focus(); }
    catch (error) { if (alive()) { status.textContent = error.message + ' Your draft has not been cleared.'; try { const data = await api('/community/changes'); if (alive()) { page.isOpen = data.isOpen; page.suspended = data.suspended; showPolicy(); draw(); } } catch { /* Existing session middleware clears revoked/expired views. */ } } }
    finally { sending = false; if (alive()) send.disabled = !posting(); }
  }
  composer.addEventListener('submit', submit);
  text.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); composer.requestSubmit(); } });
  text.addEventListener('input', () => { const bottom = nearBottom(); text.style.height = 'auto'; text.style.height = Math.min(120, text.scrollHeight) + 'px';layout(); if (bottom) toBottom(); });
  timeline.addEventListener('scroll', () => { if (nearBottom()) update.hidden = true; });
  showPolicy(); draw(); layout(); toBottom();
  requestAnimationFrame(() => { if (alive()) { layout(); toBottom(); messages.setAttribute('aria-live', 'polite'); } });
  const resize = () => { const bottom = nearBottom(); layout(); if (bottom) toBottom(); };
  window.addEventListener('resize', resize); window.visualViewport?.addEventListener('resize', resize);
  const stopSync = synchronize(() => api('/community/changes'), async data => { if (!alive()) return;
    if (data.isOpen !== page.isOpen || data.suspended !== page.suspended) { page.isOpen = data.isOpen; page.suspended = data.suspended; showPolicy(); draw(); }
    if (lastVersion !== data.version) { if (nearBottom() && !root.querySelector('dialog[open]')) await refreshLatest(false); else { update.hidden = false; status.textContent = 'Conversation updates are available.'; } }
  }, { interval: 12000, onError: error => { if (alive()) status.textContent = error.message; } });
  return () => { disposed = true; stopSync(); window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize); main?.classList.remove('community-main'); document.body.classList.remove('community-layout'); for (const d of root.querySelectorAll('dialog')) { d.close(); d.remove(); } text.value = ''; queuedPost = null; records.clear(); rendered.clear(); mentions.clear(); };
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
