import{websiteStyles,websiteComposer,renderWebsiteText,referenceCards}from'./website-references.mjs';
import {synchronize} from './sync.mjs';
import { api, node, button, form, card, heading, empty, notice, selectField } from './common.mjs';
export async function notificationView(root, ctx) {
    await websiteStyles();const data = await api('/notifications?includeMuted=true');
    if (!ctx.alive())
        return;
    heading(root, 'Announcements', 'Departmental, level and course updates for your account.');
    const section = card('Your updates'), tools = node('div', '', 'operation-grid');
    const search = node('input'), label = node('label', 'Search announcements');
    search.id = 'account-notice-search';
    search.type = 'search';
    search.maxLength = 120;
    label.htmlFor = search.id;
    const filter = node('select'), fLabel = node('label', 'Reading status');
    filter.id = 'account-notice-filter';
    fLabel.htmlFor = filter.id;
    for (const [v, t] of [['all', 'All updates'], ['unread', 'Unread'], ['read', 'Read']])
        filter.add(new Option(t, v));
    const priority = node('select'), pLabel = node('label', 'Priority');
    priority.id = 'account-notice-priority';
    pLabel.htmlFor = priority.id;
    for (const [v, t] of [['all', 'All priorities'], ['normal', 'Normal'], ['important', 'Important'], ['urgent', 'Urgent']])
        priority.add(new Option(t, v));
    const mutedLabel = node('label', 'Show muted optional updates', 'choice'), muted = node('input');
    muted.type = 'checkbox';
    mutedLabel.prepend(muted);
    tools.append(label, search, fLabel, filter, pLabel, priority, mutedLabel);
    const rows = node('div');
    section.append(tools, rows);
    root.append(section);let cursor=data.nextCursor,historyExpanded=false;const syncStatus=node('p','','status');section.append(syncStatus);const older=button('Load older updates',async()=>{try{const page=await api('/notifications?includeMuted=true&cursor='+encodeURIComponent(cursor));if(!ctx.alive())return;historyExpanded=true;data.notices.push(...page.notices);cursor=page.nextCursor;older.hidden=!cursor;draw();}catch(error){notice(section,error.message);}});older.hidden=!cursor;section.append(older,button('Refresh announcements',()=>ctx.refresh()));
    const draw = () => { rows.replaceChildren(); const visible = data.notices.filter(n => `${n.title} ${n.message}`.toLowerCase().includes(search.value.toLowerCase()) && (filter.value === 'all' || (filter.value === 'read') === n.read) && (priority.value === 'all' || priority.value === n.priority)).filter(n => muted.checked || n.priority !== 'normal' || ['administrative', 'cbt_invitation'].includes(n.kind) || (n.kind === 'resource' ? data.preferences.resources : data.preferences.announcements)); for (const n of visible) {
        const row = node('article', '', 'notice-item');const message=node('p','','preserve-lines');message.append(renderWebsiteText(n.message,n.references));
        row.append(node('h3', n.title), node('p', `${n.sender.name} · ${n.sender.position} · ${n.priority} · ${n.read ? 'Read' : 'Unread'}`, 'muted'), referenceCards(n.references),message, node('p', new Date(n.publishAt).toLocaleString()));
        if (n.correctedBy)
            row.append(node('p', 'Correction recorded by ' + n.correctedBy, 'muted'));
        row.append(button(n.read ? 'Mark as unread' : 'Mark as read', async () => { try {
            Object.assign(n, await api('/notifications/read/' + n.id, 'PUT', { revision: n.revision, read: !n.read }));
            if (ctx.alive())
                draw();
        }
        catch (error) {
            if (ctx.alive())
                notice(row, error.message);
        } }));
        rows.append(row);
    } if (!visible.length)
        empty(rows, 'No announcements', 'Try another filter or check back later.'); };
    for (const input of [search, filter, priority, muted])
        input.addEventListener('input', draw);
    draw();
    if (['representative', 'executive', 'administrator'].includes(ctx.identity.activeRole)) {
        const manage = node('details');
        manage.className = 'card';
        manage.append(node('summary', 'Compose and manage authorized announcements'));
        root.append(manage);
        await notificationManagement(manage, ctx);
    }
    return synchronize(()=>api('/notifications?includeMuted=true'),latest=>{if(!ctx.alive())return;if(historyExpanded){syncStatus.textContent='Refresh announcements to synchronize the latest reading status and corrections.';return;}data.notices=latest.notices;data.preferences=latest.preferences;cursor=latest.nextCursor;older.hidden=!cursor;draw();},{interval:20000,onError:error=>{if(ctx.alive())notice(section,error.message);}});
}
export async function notificationManagement(root, ctx) {
    const history = await api('/notifications/manage'), catalogue = ctx.identity.activeRole === 'administrator' ? await api('/admin/academic/catalogue') : await api('/academic/courses');
    if (!ctx.alive())
        return;
    const courses = catalogue.courses;await websiteStyles();let publishReferences;
    root.append(form('Publish announcement', [{ id: 'title', label: 'Announcement title', maxLength: 120 }, { id: 'message', label: 'Message', multiline: true, maxLength: 2000 }, selectField('kind', 'Update type', [['announcement', 'Academic announcement'], ['lecture_change', 'Lecture change'], ['lecture_cancellation', 'Lecture cancellation'], ['rescheduled_class', 'Rescheduled class'], ['deadline', 'Academic deadline'], ['resource', 'New resource'], ...(ctx.identity.activeRole === 'administrator' ? [['administrative', 'Administrative announcement']] : [])]), selectField('priority', 'Priority', [['normal', 'Normal'], ['important', 'Important'], ['urgent', 'Urgent']]), selectField('scope', 'Audience', ctx.identity.activeRole === 'representative' ? [['level', 'My academic level'], ['course', 'A course in my level']] : [['all', 'Department-wide'], ['level', 'Academic level'], ['course', 'Course']]), { ...selectField('level', 'Academic level', ctx.identity.activeRole === 'representative' ? [[String(ctx.identity.user.level), ctx.identity.user.level + ' Level']] : [['100', '100 Level'], ['200', '200 Level'], ['300', '300 Level']]), value: ctx.identity.user.level }, { ...selectField('courseId', 'Course (for course audience)', [['', 'Choose only for course audience'], ...courses.map(c => [c.id, c.code + ' · ' + c.title])]), required: false }, { id: 'publishAt', label: 'Publication time (UTC ISO; leave blank to publish now)', required: false, maxLength: 30 }], async (v, status) => { await api('/notifications/manage', 'POST', { ...v,...publishReferences.payload(), level: v.scope === 'level' ? Number(v.level) : null, courseId: v.scope === 'course' ? v.courseId : null, publishAt: v.publishAt || new Date().toISOString() }); status.textContent = 'Announcement saved.'; ctx.refresh(); }));
    const publishMessage=root.querySelector('form[aria-label="Publish announcement"] textarea'),referenceHost=node('div'),referenceButton=button('Website content',()=>publishReferences.picker());publishMessage.after(referenceButton,referenceHost);publishReferences=websiteComposer(root,publishMessage,{host:referenceHost,alive:ctx.alive});
    const recent = card('Announcement history');
    for (const n of history.notices) {
        const row = node('article', '', 'notice-item');const message=node('p','','preserve-lines');message.append(renderWebsiteText(n.message,n.references));
        row.append(node('h3', n.title), node('p', `${n.status} · revision ${n.revision}`), referenceCards(n.references), message);
        row.append(node('p',`${n.deliveredCount??0} recipient fetches recorded${n.expiresAt?' · expires '+new Date(n.expiresAt).toLocaleString():''}`,'muted'));
        if (n.kind !== 'cbt_invitation') {
            row.append(form('Set announcement expiry '+n.id,[{id:'expiresAt',label:'Expiry (UTC ISO; blank removes expiry)',maxLength:30,required:false,value:n.expiresAt??''}],async v=>{await api('/notifications/manage/'+n.id+'/expiry','PUT',{revision:n.revision,expiresAt:v.expiresAt||null});ctx.refresh();}));
            let correctionReferences;const correction=form('Correct announcement ' + n.title, [{ id: 'title', label: 'Corrected title', value: n.title, maxLength: 120 }, { id: 'message', label: 'Corrected message', value: n.message, multiline: true, maxLength: 2000 }, { ...selectField('priority', 'Priority', [['normal', 'Normal'], ['important', 'Important'], ['urgent', 'Urgent']]), value: n.priority }], async (v) => { await api('/notifications/manage/' + n.id, 'PATCH', { ...v,...correctionReferences.payload(), revision: n.revision, action: 'correct', publishAt: new Date().toISOString() }); ctx.refresh(); });const correctionMessage=correction.querySelector('textarea'),correctionHost=node('div');correctionMessage.after(button('Website content',()=>correctionReferences.picker()),correctionHost);correctionReferences=websiteComposer(root,correctionMessage,{host:correctionHost,alive:ctx.alive,initial:{references:(n.references??[]).filter(r=>r.available).map(r=>r.id)}});row.append(correction, button('Withdraw ' + n.title, async () => { try {
                await api('/notifications/manage/' + n.id, 'PATCH', { revision: n.revision, action: 'withdraw' });
                ctx.refresh();
            }
            catch (error) {
                notice(row, error.message);
            } }));
        }
        recent.append(row);
    }
    if (!history.notices.length)
        empty(recent, 'No announcement history');
    root.append(recent);
}
