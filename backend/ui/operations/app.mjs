import { api, node, link, heading, notice } from './common.mjs';
import { courseView } from './courses.mjs';
import { notificationView } from './notifications.mjs';
import { communityView } from './community.mjs';
import { cbtView } from './cbt.mjs';
let selectedCourse = null;
export function mount(identity) {
    const main = document.getElementById('main');
    let active = true, generation = 0, cleanup = () => { }, privateRoot = null, restores = [];
    if (!document.getElementById('operations-style')) {
        const style = document.createElement('link');
        style.id = 'operations-style';
        style.rel = 'stylesheet';
        style.href = '/operations/operations.css';
        document.head.append(style);
    }
    async function render() {
        const ticket = ++generation;
        cleanup();
        cleanup = () => { };
        const alive = () => active && ticket === generation && !document.hidden;
        const context = { identity, alive, refresh: render, selectCourse: id => { selectedCourse = id; location.hash = '/course-hub'; }, selectedCourse: () => selectedCourse, setSelected: id => { selectedCourse = id; } };
        const target = location.hash.replace('#/', '') || 'home';
        try {
            if (['courses', 'course-hub', 'community', 'notifications', 'cbt'].includes(target)) {
                privateRoot = node('div', '', 'authenticated-workspace');
                main.replaceChildren(privateRoot);
                const root = privateRoot;
                heading(root, 'Loading your workspace', 'Checking current account permissions…');
                const view = target === 'courses' || target === 'course-hub' ? courseView : target === 'notifications' ? notificationView : target === 'community' ? communityView : cbtView;
                const dispose = await view(root, context, target);
                if (!alive()) {
                    dispose?.();
                    return;
                }
                cleanup = dispose ?? (() => { });
            }
            else if (target === 'home') {
                const [data, inbox, assigned, progress] = await Promise.all([api('/academic/courses'), api('/notifications'), api('/cbt/assignments'), api('/academic/progress-summary')]);
                if (!alive())
                    return;
                const identityLine = node('p', `${identity.user.name} · ${identity.user.level} Level`);
                main.querySelector('.page-heading')?.append(identityLine);
                restores.push(() => identityLine.remove());
                function updateCard(title, records, describe) { const section = Array.from(main.querySelectorAll('.dashboard-grid>section')).find(s => s.querySelector('h2')?.textContent === title); if (!section || !records.length)
                    return; const original = section.cloneNode(true); restores.push(() => { if (section.isConnected)
                    section.replaceWith(original); }); section.querySelector('.empty-state')?.remove(); for (const item of records.slice(0, 3))
                    section.append(node('p', describe(item), 'card-copy')); }
                updateCard('Courses', data.courses, c => `${c.code} · ${c.title}`);
                updateCard('Announcements', inbox.notices, n => `${n.title} · ${n.priority}`);
                updateCard('CBT assessments', assigned.assignments, a => `${a.title} · ${a.state.replaceAll('_', ' ')} · ${a.examStatus}`);
                if (progress.summary.total) {
                    const summary = node('p', `${progress.summary.covered}/${progress.summary.total} reviewed-course topics covered · self-reported`, 'inline-note');
                    main.querySelector('.personal-summary')?.append(summary);
                    restores.push(() => summary.remove());
                }
            }
            else if (target === 'profile') {
                const prefs = await api('/notifications/preferences');
                if (!alive())
                    return;
                const section = Array.from(main.querySelectorAll('details')).find(d => d.querySelector('summary')?.textContent === 'Notification preferences');
                if (section) {
                    section.dataset.accountPreferencesReady = 'true';
                    const note = section.querySelector('.inline-note'), originalNote = note?.textContent;
                    if (note)
                        note.textContent = 'Optional preferences sync to your account. Important administrative notices remain available.';
                    restores.push(() => { delete section.dataset.accountPreferencesReady; if (note)
                        note.textContent = originalNote; });
                    const checks = section.querySelectorAll('input[type=checkbox]');
                    for (const [index, key] of ['announcements', 'resources'].entries()) {
                        checks[index].checked = prefs[key];
                        checks[index].addEventListener('change', async () => { if (!alive())
                            return; try {
                            Object.assign(prefs, await api('/notifications/preferences', 'PUT', { ...prefs, [key]: checks[index].checked }));
                            if (alive())
                                notice(section, 'Notification preferences saved to your account.');
                        }
                        catch (error) {
                            if (alive())
                                notice(section, error.message);
                        } });
                    }
                }
                const privacy = Array.from(main.querySelectorAll('details')).find(d => d.querySelector('summary')?.textContent === 'Privacy & data controls');
                if (privacy) {
                    const info = node('p', 'Course progress and account announcement history sync with your account. Clearing local study data does not delete these account records. Use approved support for data requests.', 'guide-copy');
                    privacy.append(info);
                    restores.push(() => info.remove());
                }
            }
            else if (target === 'help') {
                const feature = await import('./help.mjs');
                if (alive())
                    feature.extendHelp(main, identity);
            }
        }
        catch (error) {
            if (alive()) {
                const root = privateRoot?.isConnected ? privateRoot : main;
                heading(root, 'Workspace unavailable', 'Refresh or sign in again to continue.');
                notice(root, error.message);
                root.append(link('/access/', 'Account access'));
            }
        }
    }
    render();
    return { dispose() { active = false; generation++; cleanup(); for (const restore of restores)
            restore(); restores = []; if (privateRoot?.isConnected) {
            const h=node('h1','Account workspace');h.id='page-title';privateRoot.replaceChildren(h,node('p','Private workspace cleared. Reconnect or open personal study tools from the menu.'),link('/access/','Account access')); } } };
}
