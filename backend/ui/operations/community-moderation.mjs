import {api,node,form,card,heading,empty,selectField}from'./common.mjs';
export async function moderationView(root, ctx) { const data = await api('/admin/community/reports'); if (!ctx.alive())
    return; heading(root, 'Community moderation', 'Reports and removal decisions are authorized and audited.'); for (const report of data.reports) {
    const row = card('Report: ' + report.reason);
    row.append(node('p', `${report.message.sender.name} · ${report.status}`), node('p', report.message.body, 'preserve-lines'), node('p', report.note));
    if (report.status === 'open')
        row.append(form('Record moderation decision ' + report.id, [selectField('action', 'Decision', [['resolve', 'Resolve report'], ['dismiss', 'Dismiss report'], ['remove', 'Remove message']]), { id: 'note', label: 'Decision note', multiline: true, maxLength: 500 }], async (v) => { await api('/admin/community/reports/' + report.id, 'PATCH', { ...v, revision: report.revision }); ctx.refresh(); }));
    root.append(row);
} if (!data.reports.length)
    empty(root, 'No reports awaiting review'); }
