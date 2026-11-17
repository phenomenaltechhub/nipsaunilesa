import { api, node, heading, notice } from './common.mjs';
import { courseManagement } from './courses.mjs';
import { notificationManagement } from './notifications.mjs';
import { moderationView } from './community.mjs';
import { cbtAdministration } from './cbt.mjs';
let generation = 0, dispose = () => { }, level = null;
export async function renderOperations(root, identity, section) { const ticket = ++generation; dispose(); dispose = () => { }; const ctx = { identity, alive: () => ticket === generation && !document.hidden, refresh: () => renderOperations(root, identity, section), manageLevel: level ?? identity.user.level }; heading(root, section === 'academics' ? 'Academic operations' : section === 'notices' ? 'Announcement management' : section === 'moderation' ? 'Community moderation' : 'CBT administration', 'Current server permissions apply to every operation.'); try {
    await api('/admin/config');
    if (!ctx.alive())
        return;
    if (section === 'academics') {
        const label = node('label', 'Manage academic level'), select = node('select');
        select.id = 'managed-level';
        label.htmlFor = select.id;
        for (const n of [100, 200, 300])
            select.add(new Option(n + ' Level', String(n)));
        select.value = String(ctx.manageLevel);
        select.addEventListener('change', () => { level = Number(select.value); ctx.refresh(); });
        root.append(label, select);
        await courseManagement(root, ctx);
    }
    else if (section === 'notices')
        await notificationManagement(root, ctx);
    else if (section === 'moderation')
        await moderationView(root, ctx);
    else
        dispose = await cbtAdministration(root, ctx) ?? (() => { });
}
catch (error) {
    if (ctx.alive())
        notice(root, error.message);
} }
export function disposeOperations() { generation++; dispose(); dispose = () => { }; }
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    disposeOperations();
    const main = document.getElementById('main');
    main?.replaceChildren(node('p', 'Return to an administration section to recheck access.'));
} });
