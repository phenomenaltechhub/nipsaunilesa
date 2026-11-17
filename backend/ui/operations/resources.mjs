import { api, node, button, form, card, link, notice, selectField } from './common.mjs';
import { resourceCategories } from '/src/modules/academic/catalogue.js';
export async function resourceList(root, ctx, courseId) {
    const data = await api('/academic/resources?courseId=' + courseId);
    if (!ctx.alive())
        return;
    if (data.resources.length) {
        for (const h of root.querySelectorAll('h3'))
            if (h.textContent === 'No study materials added') {
                h.nextElementSibling?.remove();
                h.remove();
            }
    }
    for (const r of data.resources) {
        const box = node('article', '', 'operation-tile');
        box.append(node('h3', r.title), node('p', r.description), node('p', resourceCategories[r.category]));
        if (r.driveUrl) {
            const a = link(r.driveUrl, 'Open Google Drive resource (external)');
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            box.append(a, node('p', 'Drive sharing permissions remain controlled by its owner.'));
        }
        if (r.fileId)
            box.append(link('/api/v1/academic/resources/' + r.id + '/download', 'Download protected resource'));
        root.append(box);
    }
    if (['representative', 'reviewer', 'administrator'].includes(ctx.identity.activeRole)) {
        const holder = node('details');
        holder.append(node('summary', 'Submit and review course resources'));
        root.append(holder);
        await resourceManagement(holder, ctx, courseId);
    }
}
export async function resourceManagement(root, ctx, courseId) {
    const data = await api('/academic/resources?courseId=' + courseId + '&manage=true');
    if (!ctx.alive())
        return;
    const specs = [{ id: 'title', label: 'Resource title', maxLength: 120 }, { id: 'description', label: 'Resource description', multiline: true, maxLength: 800, required: false }, selectField('category', 'Resource category', Object.entries(resourceCategories)), { id: 'sourceUrl', label: 'Source attribution URL (HTTPS)', type: 'url', maxLength: 2048 }, { id: 'driveUrl', label: 'Google Drive/Docs destination (optional)', type: 'url', maxLength: 2048, required: false }];
    root.append(form('Submit resource draft', specs, async (resource) => { await api('/academic/resources', 'POST', { courseId, resource }); ctx.refresh(); }));
    for (const r of data.resources) {
        const row = card(r.title + ' · ' + r.status);
        row.append(node('p', r.description));
        if (r.author === ctx.identity.user.id || ctx.identity.activeRole === 'administrator') {
            const editable = specs.map(s => ({ ...s, value: r[s.id] ?? '' }));
            row.append(form('Correct resource ' + r.id, editable, async (resource) => { await api('/academic/resources/' + r.id, 'PATCH', { revision: r.revision, action: 'correct', resource, note: 'Resource correction submitted.' }); ctx.refresh(); }));
            const file = node('input'), label = node('label', 'Protected file (.txt or PDF; maximum 1 MiB; PDF requires verified scanning)');
            file.type = 'file';
            file.accept = '.txt,.pdf,text/plain,application/pdf';
            label.append(file);
            row.append(label, button('Upload protected file', async () => {
                try {
                    const selected = file.files?.[0];
                    if (!selected || selected.size > 1048576)
                        throw new Error('Choose a file no larger than 1 MiB.');
                    const bytes = new Uint8Array(await selected.arrayBuffer());
                    let binary = '';
                    for (let offset = 0; offset < bytes.length; offset += 8192)
                        binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
                    await api('/academic/resources/' + r.id + '/file', 'POST', { revision: r.revision, filename: selected.name, mediaType: selected.type, content: btoa(binary) });
                    ctx.refresh();
                }
                catch (error) {
                    notice(row, error.message);
                }
            }));
        }
        const actions = [];
        if (['draft', 'revisions'].includes(r.status) && (r.author === ctx.identity.user.id || ctx.identity.activeRole === 'administrator'))
            actions.push(['submit', 'Submit for review']);
        if (['reviewer', 'administrator'].includes(ctx.identity.activeRole)) {
            if (r.status === 'submitted')
                actions.push(['publish', 'Publish reviewed resource'], ['request_revision', 'Request revisions']);
            actions.push(['withdraw', 'Withdraw publication']);
        }
        if (actions.length)
            row.append(form('Resource decision ' + r.id, [selectField('action', 'Decision', actions), { id: 'note', label: 'Decision note', maxLength: 500 }], async (v) => { await api('/academic/resources/' + r.id, 'PATCH', { ...v, revision: r.revision }); ctx.refresh(); }));
        if (r.fileId)
            row.append(link('/api/v1/academic/resources/' + r.id + '/download?draft=true', 'Download draft for authorized review'));
        root.append(row);
    }
}
