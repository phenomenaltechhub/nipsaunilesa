import {resourceList} from './resources.mjs';
import { resourceCategories } from '/src/modules/academic/catalogue.js';
import { tabs } from '/src/components/academic.js';
import { api, node, button, form, link, card, heading, empty, selectField, studentPicker } from './common.mjs';
let activeCourse = null, activeTab = 'details';
const manageRoles = ['representative', 'reviewer', 'administrator'];
function sourceLink(url, text) { const a = link(url, text + ' (external)'); a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
export async function courseView(root, ctx, target) {
    const result = await api('/academic/courses');
    if (!ctx.alive())
        return;
    heading(root, target === 'course-hub' ? 'Course study hub' : 'Courses', `${ctx.identity.user.level} Level · reviewed academic information`);
    if (target === 'courses') {
        const section = card('Your courses'), label = node('label', 'Search courses'), search = node('input'), rows = node('div', '', 'operation-grid');
        search.id = 'connected-course-search';
        search.type = 'search';
        search.maxLength = 120;
        label.htmlFor = search.id;
        section.append(label, search, rows);
        root.append(section);
        const render = () => { const q = search.value.toLowerCase(); rows.replaceChildren(); for (const c of result.courses.filter(c => `${c.code} ${c.title} ${c.session} ${c.semester}`.toLowerCase().includes(q))) {
            const row = node('article', '', 'operation-tile');
            row.append(node('h3', `${c.code} · ${c.title}`), node('p', `${c.session} · ${c.semester} semester · ${c.units} units`), button('Open ' + c.code, () => ctx.selectCourse(c.id)));
            rows.append(row);
        } if (!rows.childNodes.length)
            empty(rows, 'No courses available', 'Reviewed courses will appear here.'); };
        search.addEventListener('input', render);
        render();
        root.append(link('#/progress', 'Open personal study outlines'), link('#/timetable', 'Open Timetable'));
        const study=await import('./study.mjs');await study.savedStudyLinks(root,ctx);if(!ctx.alive())return;
        if (manageRoles.includes(ctx.identity.activeRole)) {
            const tools = node('details', '', 'card');
            tools.className = 'card';
            tools.append(node('summary', 'Academic submissions and review'));
            root.append(tools);
            await courseManagement(tools, ctx);
        }
        return;
    }
    const choices = node('select'), label = node('label', 'Choose a course');
    choices.id = 'connected-course';
    label.htmlFor = choices.id;
    for (const c of result.courses)
        choices.add(new Option(`${c.code} · ${c.title}`, c.id));
    if (result.courses.some(c => c.id === ctx.selectedCourse()))
        choices.value = ctx.selectedCourse();
    choices.addEventListener('change', () => { ctx.setSelected(choices.value); ctx.refresh(); });
    root.append(label, choices);
    const course = result.courses.find(c => c.id === choices.value);
    if (!course) {
        empty(root, 'No course selected', 'Choose an available reviewed course.');
        return;
    }
    ctx.setSelected(course.id);
    if (activeCourse !== course.id) {
        activeCourse = course.id;
        activeTab = 'details';
    }
    const detail = card(`${course.code} · ${course.title}`);
    detail.append(node('p', `${course.session} · ${course.semester} semester · ${course.units} units`), node('p', course.description), sourceLink(course.sourceUrl, 'Course source'));
    root.append(detail);
    const progress = await api('/academic/courses/' + course.id + '/progress');
    if (!ctx.alive())
        return;
    const summary = card('Your course preparation');
    summary.append(node('p', `${progress.summary.covered}/${progress.summary.total} leaf topics covered · ${progress.summary.confidence.rated} confidence ratings`), node('p', 'Coverage and confidence are self-reported; they do not demonstrate mastery.'));
    const bar = node('progress');
    bar.max = 100;
    bar.value = progress.summary.coverage ?? 0;
    bar.setAttribute('aria-label', 'Course topic coverage');
    summary.append(bar);
    root.append(summary);
    const topics = card('Topics and progress');
    if (!progress.topics.length)
        empty(topics, 'No topics available');
    for (const t of progress.topics) {
        const row = node('details', '', 'topic-row');
        row.open = t === progress.topics[0] || t.difficult;
        row.append(node('summary', t.title + ' · ' + (t.covered ? 'Covered' : 'Not covered')));
        const tools=await import('./study.mjs');await tools.bookmarkButton(row,ctx,'topic',t.id,course.id);if(!ctx.alive())return;
        if (t.parentId)
            row.append(node('p', 'Subtopic', 'muted'));
        row.append(form('Save progress: ' + t.title, [selectField('covered', 'Topic coverage', [['false', 'Not covered'], ['true', 'Covered']]), selectField('confidence', 'Understanding', [['unassessed', 'Not assessed'], ['low', 'Low'], ['developing', 'Developing'], ['confident', 'Confident']]), selectField('revision', 'Revision status', [['not-started', 'Not started'], ['planned', 'Planned'], ['reviewed', 'Reviewed']]), selectField('difficult', 'Area of difficulty', [['false', 'No'], ['true', 'Yes']]), selectField('priority', 'Study priority', [['normal', 'Normal'], ['high', 'High']])].map(f => ({ ...f, value: t[f.id] })), async (v, status) => { await api('/academic/courses/' + course.id + '/progress', 'PATCH', { courseRevision: progress.courseRevision, topicId: t.id, version: t.version, change: { ...v, covered: v.covered === 'true', difficult: v.difficult === 'true' } }); status.textContent = 'Progress saved to your account.'; ctx.refresh(); }));
        const editor = row.querySelector('form');
        editor.classList.add('progress-controls');
        row.querySelector('h2')?.remove();
        for (const label of editor.querySelectorAll(':scope > label')) {
            const control = label.nextElementSibling, field = node('div');
            label.before(field);
            field.append(label, control);
        }
        topics.append(row);
    }
    root.append(topics);
    const priorities = card('Revision priorities');
    for (const p of progress.priorities)
        priorities.append(node('p', `${p.title} · ${p.reasons.join(' · ')}`));
    if (!progress.priorities.length)
        empty(priorities, 'No revision priorities identified', 'Review your confidence and coverage as you study.');
    root.append(priorities);
    const materials = card('Study materials');
    for (const r of course.resources)
        materials.append(node('h3', r.title), node('p', r.description), sourceLink(r.url, 'Google Drive resource'));
    if (!course.resources.length)
        empty(materials, 'No study materials added');
    await resourceList(materials,ctx,course.id);if(!ctx.alive())return;
    const inbox = await api('/notifications');
    if (!ctx.alive())
        return;
    const announcements = card('Course announcements');
    const courseNotices = inbox.notices.filter(n => n.courseId === course.id);
    for (const n of courseNotices)
        announcements.append(node('h3', n.title), node('p', n.message, 'preserve-lines'));
    if (!courseNotices.length)
        empty(announcements, 'No announcements');
    const syllabus = card('Reviewed syllabus');
    if (course.syllabus)
        syllabus.append(node('p', course.syllabus, 'preserve-lines'));
    else
        empty(syllabus, 'No syllabus added');
    const schedule = card('Course schedule');
    const study = await import('./study.mjs');
    await study.courseSchedule(schedule,ctx,course);
    if(!ctx.alive())return;
    const aids=card('Reviewed study aids');
    await study.courseStudyTools(aids,ctx,course);
    if(!ctx.alive())return;
    priorities.append(aids);
    priorities.append(link('#/planner', 'Open Study planner'), link('#/progress', 'Open personal study outlines'));
    for (const section of [detail, topics, priorities, materials])
        section.remove();
    const hub = tabs('connected-course', 'Course hub sections', [{ id: 'details', title: 'Course details', render: () => detail }, { id: 'topics', title: 'Topics', render: () => topics }, { id: 'materials', title: 'Materials', render: () => materials }, { id: 'schedule', title: 'Schedule', render: () => schedule }, { id: 'notices', title: 'Announcements', render: () => announcements }, { id: 'syllabus', title: 'Syllabus', render: () => syllabus }, { id: 'revision', title: 'Revision', render: () => priorities }]);
    root.append(hub, link('#/courses', 'Back to Courses'));
    hub.querySelector('#connected-course-' + activeTab)?.click();
    for (const event of ['click', 'keydown'])
        hub.addEventListener(event, () => { activeTab = hub.querySelector('[role=tab][aria-selected=true]')?.id.replace('connected-course-', '') ?? 'details'; });
}
export async function courseManagement(root, ctx) {
    const level = ctx.manageLevel ?? ctx.identity.user.level, managed = await api('/academic/manage?level=' + level);
    if (!ctx.alive())
        return;
    root.append(node('p', 'Submissions stay unreviewed until an independent authorized reviewer publishes them.'));
    let editing = null, topics = [], resources = [];
    const editor = form('Save course draft', [{ id: 'code', label: 'Course code' }, { id: 'title', label: 'Course title' }, { id: 'units', label: 'Course units', type: 'number' }, { id: 'session', label: 'Academic session (YYYY/YYYY)' }, selectField('semester', 'Semester', [['first', 'First'], ['second', 'Second']]), { id: 'description', label: 'Verified course description', multiline: true, maxLength: 1200, required: false }, { id: 'sourceUrl', label: 'HTTPS course source', type: 'url', maxLength: 2048 }, { id: 'syllabus', label: 'Reviewed syllabus text', multiline: true, maxLength: 2500, required: false }], async (v, status) => { const data = { ...v, level, units: Number(v.units), topics, resources }; if (editing)
        await api('/academic/manage/' + editing.id, 'PUT', { revision: editing.revision, course: data });
    else
        await api('/academic/manage', 'POST', data); status.textContent = 'Draft saved; not published.'; ctx.refresh(); });
    const topicEditor = node('section', '', 'topic-editor');
    topicEditor.append(node('h3', 'Topics and subtopics'));
    const topicList = node('div');
    topicEditor.append(topicList);
    function drawTopics() { topicList.replaceChildren(); for (const t of topics) {
        const row = node('div', '', 'operation-tile');
        const title = node('input'), source = node('input'), parent = node('select');
        title.value = t.title;
        title.maxLength = 120;
        source.value = t.sourceUrl;
        source.type = 'url';
        source.maxLength = 2048;
        title.setAttribute('aria-label', 'Topic title ' + t.id);
        source.setAttribute('aria-label', 'Topic source ' + t.id);
        parent.setAttribute('aria-label', 'Parent topic ' + t.id);
        parent.add(new Option('No parent', ''));
        for (const p of topics.filter(p => p.id !== t.id))
            parent.add(new Option(p.title || 'Untitled topic', p.id));
        parent.value = t.parentId ?? '';
        title.addEventListener('input', () => t.title = title.value);
        source.addEventListener('input', () => t.sourceUrl = source.value);
        parent.addEventListener('change', () => t.parentId = parent.value || null);
        const titleLabel = node('label', 'Topic title'), sourceLabel = node('label', 'HTTPS topic source'), parentLabel = node('label', 'Parent topic');
        titleLabel.append(title);
        sourceLabel.append(source);
        parentLabel.append(parent);
        row.append(titleLabel, sourceLabel, parentLabel, button('Remove topic', () => { topics = topics.filter(p => p.id !== t.id && p.parentId !== t.id); drawTopics(); }));
        topicList.append(row);
    } }
    topicEditor.append(button('Add topic', () => { topics.push({ id: crypto.randomUUID(), title: '', sourceUrl: '', parentId: null }); drawTopics(); }));
    editor.querySelector('form').prepend(topicEditor);
    const resourceEditor = node('section');
    resourceEditor.append(node('h3', 'Course resources'), node('p', 'Google Drive links are external. Sharing permissions must also be set in Drive.'));
    const resourceRows = node('div');
    resourceEditor.append(resourceRows);
    function drawResources() { resourceRows.replaceChildren(); for (const r of resources) {
        const row = node('fieldset');
        row.append(node('legend', 'Resource metadata'));
        for (const [key, label] of [['title', 'Resource title'], ['url', 'Google Drive URL'], ['description', 'Resource description']]) {
            const wrap = node('label', label), input = node('input');
            input.value = r[key];
            input.maxLength = key === 'description' ? 800 : 2048;
            input.type = key === 'url' ? 'url' : 'text';
            input.required = key !== 'description';
            input.addEventListener('input', () => r[key] = input.value);
            wrap.append(input);
            row.append(wrap);
        }
        const category = node('select');
        category.setAttribute('aria-label', 'Resource category');
        for (const [id, title] of Object.entries(resourceCategories))
            category.add(new Option(title, id));
        category.value = r.category;
        category.addEventListener('change', () => r.category = category.value);
        row.append(category, button('Remove resource', () => { resources = resources.filter(item => item !== r); drawResources(); }));
        resourceRows.append(row);
    } }
    resourceEditor.append(button('Add Google Drive resource', () => { resources.push({ title: '', url: '', description: '', category: Object.keys(resourceCategories)[0] }); drawResources(); }));
    editor.querySelector('form').prepend(resourceEditor);
    root.append(editor);
    for (const item of managed.courses) {
        const row = card(`${item.course.code} · ${item.status}`);
        row.append(node('p', item.course.title), node('p', `Revision ${item.revision} · ${item.course.session} · ${item.course.semester}`));
        if (['draft', 'revisions', 'published', 'withdrawn'].includes(item.status) && (item.author === ctx.identity.user.id || ctx.identity.activeRole === 'administrator'))
            row.append(button('Edit draft ' + item.course.code, () => { editing = item; topics = structuredClone(item.course.topics); resources = structuredClone(item.course.resources); const fields = editor.querySelectorAll('form > input,form > textarea,form > select'); for (const f of fields) {
                const key = f.id.split('-').at(-1);
                if (key in item.course)
                    f.value = String(item.course[key]);
            } drawTopics(); drawResources(); editor.scrollIntoView({ block: 'start' }); }));
        const actions = (item.author === ctx.identity.user.id || ctx.identity.activeRole === 'administrator') && ['draft', 'revisions'].includes(item.status) ? [['submit', 'Submit for review']] : [];
        if (['reviewer', 'administrator'].includes(ctx.identity.activeRole)) {
            if (item.status === 'submitted' && item.author !== ctx.identity.user.id && item.lastEditor !== ctx.identity.user.id)
                actions.push(['publish', 'Approve and publish'], ['request_revision', 'Request revisions']);
            if (item.publishedRevision)
                actions.push(['withdraw', 'Withdraw publication']);
        }
        if (actions.length)
            row.append(form('Record course decision ' + item.course.code, [selectField('action', 'Decision', actions), { id: 'note', label: 'Review note', multiline: true, maxLength: 500 }], async (v) => { await api('/academic/manage/' + item.id, 'PATCH', { ...v, revision: item.revision }); ctx.refresh(); }));
        if (ctx.identity.activeRole === 'administrator') {
            const access = node('details');
            access.append(node('summary', 'Course access permissions'));
            const picker = await studentPicker(item.id, ctx, { accessEditor: true, selectedIds: item.selectedIds ?? [] });
            if (!ctx.alive())
                return;
            const accessForm = form('Save course access ' + item.course.code, [{ ...selectField('audience', 'Access audience', [['level', 'This academic level'], ['selected', 'Selected students only']]), value: item.audience }], async (v) => { await api('/admin/academic/' + item.id + '/access', 'PUT', { revision: item.revision, audience: v.audience, students: v.audience === 'selected' ? picker.values() : [] }); ctx.refresh(); });
            accessForm.querySelector('form').prepend(picker.node);
            access.append(accessForm);
            row.append(access);
        }
        for (const h of item.history.slice(0, 5))
            row.append(node('p', `${h.action} · revision ${h.revision}${h.note ? ' · ' + h.note : ''}`, 'muted'));
        if(item.publishedRevision){const tools=await import('./study.mjs'),section=node('details');section.append(node('summary','Schedule and reviewed study aids'));row.append(section);await tools.courseSchedule(section,ctx,{id:item.id});await tools.studyManagement(section,ctx,item.id);if(!ctx.alive())return;}
        root.append(row);
    }
}
