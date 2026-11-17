import { api, node, button, form, card, heading, empty, notice, selectField, jsonDownload, multi, studentPicker } from './common.mjs';
const initialStates = ['initial_approved', 'application_revisions'];
function dateTime(value) { const date = new Date(value); if (!Number.isFinite(date.getTime()))
    throw new Error('Choose a valid date and time.'); return date.toISOString(); }
function questionEditor(container, topics) { const questions = []; const rows = node('div'); container.append(rows, button('Add proposed question', () => { const q = {}; questions.push(q); const row = card('Proposed question ' + questions.length); const specs = [['text', 'Question text', 'textarea'], ['options', 'Options (one per line)', 'textarea'], ['correct', 'Correct option number, starting at 1', 'number'], ['points', 'Points', 'number'], ['sourceUrl', 'HTTPS source/reference', 'url']]; for (const [key, label, tag] of specs) {
    const wrap = node('label', label), input = node(tag === 'textarea' ? 'textarea' : 'input');
    if (tag !== 'textarea')
        input.type = tag;
    input.maxLength = key === 'text' ? 700 : 1000;
    input.required = true;
    input.setAttribute('aria-label', label + ' ' + questions.length);
    q[key] = input;
    wrap.append(input);
    row.append(wrap);
} q.topic = node('select'); q.topic.setAttribute('aria-label', 'Question topic ' + questions.length); for (const t of topics)
    q.topic.add(new Option(t.title, t.id)); q.category = node('select'); q.category.setAttribute('aria-label', 'Question category ' + questions.length); for (const c of ['recall', 'application', 'analysis'])
    q.category.add(new Option(c, c)); row.append(q.topic, q.category, button('Remove proposed question', () => { questions.splice(questions.indexOf(q), 1); row.remove(); })); rows.append(row); })); return () => questions.map(q => ({ text: q.text.value, topicId: q.topic.value, category: q.category.value, options: q.options.value.split('\n').map(s => s.trim()).filter(Boolean), correctIndex: Number(q.correct.value) - 1, points: Number(q.points.value), sourceUrl: q.sourceUrl.value })); }
export async function cbtView(root, ctx) {
    const data = await api('/cbt/requests'), catalogue = await api('/academic/courses'), assigned = await api('/cbt/assignments');
    if (!ctx.alive())
        return;
    heading(root, 'CBT requests and assessments', 'Apply for approved pre-examination revision assessments and review your assigned schedules.');
    const state = card(data.policy.intakeOpen ? 'Initial requests are open' : 'Initial requests are closed');
    state.append(node('p', 'Initial approval is required before a full application. An application does not create an examination.'), node('p', 'Examination delivery is not enabled yet. Request, approval and scheduling operations are available here.'));
    state.append(button('Refresh CBT status', () => ctx.refresh()));
    root.append(state);
    const assignments = card('Your assigned assessments');
    for (const a of assigned.assignments) {
        const row = node('article', '', 'operation-tile');
        row.append(node('h3', a.title), node('p', `${a.batch} · ${new Date(a.startsAt).toLocaleString()} · ${a.durationMinutes} minutes`), node('p', `${a.state.replaceAll('_', ' ')} · ${a.examStatus}`), button('View published results', async () => { try {
            const r = await api('/cbt/assignments/' + a.id + '/results');
            if (ctx.alive())
                showAnalytics(row, r.analytics, catalogue.courses.find(c => c.id === a.courseId)?.topics ?? []);
        }
        catch (error) {
            notice(row, error.code === 'RESULTS_UNAVAILABLE' ? 'No published results available.' : error.message);
        } }));
        assignments.append(row);
    }
    if (!assigned.assignments.length)
        empty(assignments, 'No assessments assigned');
    root.append(assignments);
    if (data.policy.intakeOpen && catalogue.courses.length) {
        const intake = card('Initial CBT request'), choose = node('select'), label = node('label', 'Course');
        choose.id = 'cbt-request-course';
        label.htmlFor = choose.id;
        for (const c of catalogue.courses)
            choose.add(new Option(`${c.code} · ${c.title}`, c.id));
        const holder = node('div');
        intake.append(label, choose, holder);
        root.append(intake);
        const draw = () => { holder.replaceChildren(); const c = catalogue.courses.find(c => c.id === choose.value); if (!c?.topics.length) {
            empty(holder, 'No reviewed topics available');
            return;
        } const topicPicker = multi(c.topics.map(t => [t.id, t.title]), 'request-topics', 'Relevant topics'); const requestForm = form('Submit initial request', [{ id: 'justification', label: 'Brief purpose and justification', multiline: true, maxLength: 1000 }, { id: 'periodStart', label: 'Intended period starts (device time)', type: 'datetime-local' }, { id: 'periodEnd', label: 'Intended period ends (device time)', type: 'datetime-local' }], async (v) => { await api('/cbt/requests', 'POST', { ...v, courseId: c.id, level: ctx.identity.user.level, purpose: 'pre_exam_revision', topicIds: topicPicker.values(), periodStart: dateTime(v.periodStart), periodEnd: dateTime(v.periodEnd) }); ctx.refresh(); }); requestForm.querySelector('form').prepend(topicPicker.node); holder.append(requestForm); };
        choose.addEventListener('change', draw);
        draw();
    }
    const performance = await api('/cbt/results');
    if (!ctx.alive())
        return;
    const past = card('Assessment history');
    for (const r of performance.assessments) {
        past.append(node('h3', r.title));
        showAnalytics(past, r, catalogue.courses.find(c => c.id === r.courseId)?.topics ?? []);
    }
    if (!performance.assessments.length)
        empty(past, 'No published assessment results');
    root.append(past);
    const history = card('Your applications');
    for (const request of data.requests) {
        const course = catalogue.courses.find(c => c.id === request.courseId), row = node('article', '', 'request-item');
        row.append(node('h3', course ? `${course.code} · ${course.title}` : 'Previous course request'), node('p', request.status.replaceAll('_', ' ')), node('p', request.justification));
        for (const event of request.history)
            row.append(node('p', `${event.action.replaceAll('_', ' ')} · ${event.note}`, 'muted'));
        if (request.status === 'clarification')
            row.append(form('Respond to clarification', [{ id: 'justification', label: 'Updated justification', multiline: true, maxLength: 1000, value: request.justification }], async (v) => { await api('/cbt/requests/' + request.id, 'PATCH', { ...v, revision: request.revision }); ctx.refresh(); }));
        if (initialStates.includes(request.status) && course) {
            const topics = course.topics.filter(t => request.topicIds.includes(t.id));
            row.append(button('Download application template', async () => { try {
                jsonDownload(await api('/cbt/requests/' + request.id + '/template'), 'cbt-application-template.json');
            }
            catch (error) {
                notice(row, error.message);
            } }));
            const application = form('Submit full application', [{ id: 'sourceUrls', label: 'HTTPS references (one per line)', multiline: true, maxLength: 2500 }, { id: 'proposedDate', label: 'Proposed date and time (device time)', type: 'datetime-local' }, { id: 'durationMinutes', label: 'Proposed duration in minutes', type: 'number' }, { id: 'participants', label: 'Expected participants', type: 'number' }, { id: 'instructions', label: 'Special instructions (optional)', multiline: true, maxLength: 1000, required: false }], async (v) => { await api('/cbt/requests/' + request.id + '/application', 'POST', { revision: request.revision, document: { schemaVersion: 1, courseId: course.id, topicIds: request.topicIds, sourceUrls: v.sourceUrls.split('\n').map(s => s.trim()).filter(Boolean), proposedDate: dateTime(v.proposedDate), durationMinutes: Number(v.durationMinutes), participants: Number(v.participants), instructions: v.instructions, questions: readQuestions() } }); ctx.refresh(); });
            const questions = node('section');
            questions.append(node('h3', 'Optional proposed questions'), node('p', 'Use reviewed, appropriately licensed content and cite each source. These remain private proposals until approved.'));
            const readQuestions = questionEditor(questions, topics);
            application.querySelector('form').prepend(questions);
            row.append(application);
            const upload = node('form');
            upload.setAttribute('aria-label', 'Upload completed application document');
            const label = node('label', 'Completed JSON template (maximum 10 KB)'), file = node('input');
            file.type = 'file';
            file.accept = '.json,application/json';
            label.append(file);
            const submit = node('button', 'Submit protected document');
            submit.type = 'submit';
            upload.append(label, submit);
            upload.addEventListener('submit', async (event) => { event.preventDefault(); try {
                const selected = file.files?.[0];
                if (!selected || selected.size > 10000)
                    throw new Error('Choose a JSON application of at most 10 KB.');
                const bytes = new Uint8Array(await selected.arrayBuffer()), content = btoa(String.fromCharCode(...bytes));
                await api('/cbt/requests/' + request.id + '/document', 'POST', { revision: request.revision, filename: selected.name, mediaType: selected.type || 'application/json', content });
                ctx.refresh();
            }
            catch (error) {
                notice(row, error.message);
            } });
            row.append(upload);
        }
        if (['application_submitted', 'application_revisions', 'application_approved'].includes(request.status))
            row.append(button('Download my submitted application', async () => { try {
                const r = await api('/cbt/requests/' + request.id + '/application');
                jsonDownload(r.document, 'cbt-submitted-application.json');
            }
            catch (error) {
                notice(row, error.message);
            } }));
        history.append(row);
    }
    if (!data.requests.length)
        empty(history, 'No CBT requests submitted');
    root.append(history);
}
export function showAnalytics(root, data, topics = []) { const section = card('Assessment performance'); section.append(node('p', `${data.score}/${data.maximum} points · ${data.unanswered} unanswered · ${data.elapsedSeconds} seconds`)); for (const [topic, result] of Object.entries(data.topics))
    section.append(node('p', `${topics.find(t => t.id === topic)?.title ?? 'Reviewed topic'}: ${result.score}/${result.maximum}`)); for (const [category, result] of Object.entries(data.categories))
    section.append(node('p', `${category}: ${result.score}/${result.maximum}`)); section.append(node('p', `${data.incorrect.length} questions require review. Revision recommendations use the assessment evidence and do not establish clinical competence.`)); root.append(section); }
export async function cbtAdministration(root, ctx) {
    const data = await api('/cbt/requests'), catalogue = await api('/admin/academic/catalogue'), exams = await api('/admin/cbt/exams');
    if (!ctx.alive())
        return;
    heading(root, 'CBT administration', 'Initial approval, protected applications, selected batches and scheduling.');
    root.append(form('Update CBT intake policy', [{ ...selectField('intakeOpen', 'Initial request intake', [['false', 'Closed'], ['true', 'Open']]), value: String(data.policy.intakeOpen) }, { ...selectField('visibilityWarnings', 'Visibility warning threshold', [['2', 'Two warnings'], ['3', 'Three warnings']]), value: data.policy.visibilityWarnings }], async (v) => { await api('/admin/cbt/policy', 'PUT', { revision: data.policy.revision, intakeOpen: v.intakeOpen === 'true', visibilityWarnings: Number(v.visibilityWarnings) }); ctx.refresh(); }));
    const queue = card('Request and application review');
    const questionChoices = [];
    for (const r of data.requests) {
        const row = node('article', '', 'request-item');
        row.append(node('h3', `${catalogue.courses.find(c => c.id === r.courseId)?.code ?? 'Course request'} · ${r.status.replaceAll('_', ' ')}`), node('p', r.justification));
        for (const event of r.history)
            row.append(node('p', `${event.action} · ${event.note}`, 'muted'));
        const actions = [];
        if (r.status === 'submitted')
            actions.push(['approve_initial', 'Approve initial request'], ['clarify', 'Request clarification']);
        if (r.status === 'application_submitted')
            actions.push(['approve_application', 'Approve application'], ['revise_application', 'Request application revisions']);
        if (['rejected', 'closed', 'withdrawn'].includes(r.status))
            actions.push(['reopen', 'Reopen initial review']);
        else
            actions.push(['reject', 'Reject'], ['close', 'Close'], ['withdraw', 'Withdraw authorization']);
        row.append(form('Record CBT decision ' + r.id, [selectField('action', 'Decision', actions), { id: 'note', label: 'Decision note', multiline: true, maxLength: 1000 }], async (v) => { await api('/admin/cbt/requests/' + r.id + '/decision', 'PATCH', { ...v, revision: r.revision }); ctx.refresh(); }));
        if (['application_submitted', 'application_revisions', 'application_approved'].includes(r.status)) {
            row.append(button('Review protected application', async () => { try {
                const result = await api('/cbt/requests/' + r.id + '/application');
                if (!ctx.alive())
                    return;
                const detail = card('Protected application');
                detail.append(node('p', `${result.document.durationMinutes} minutes · ${result.document.participants} participants proposed`), node('p', result.document.instructions));
                for (const q of result.document.questions) {
                    detail.append(node('h3', q.text), node('p', q.options.map((o, i) => `${i + 1}. ${o}`).join('\n'), 'preserve-lines'), node('p', `Proposed correct option: ${q.correctIndex + 1} · ${q.sourceUrl}`));
                }
                row.append(detail);
            }
            catch (error) {
                notice(row, error.message);
            } }));
        }
        if (r.status === 'application_approved') {
            const questions = await api('/admin/cbt/requests/' + r.id + '/questions');
            if (!ctx.alive())
                return;
            for (const q of questions.questions) {
                const detail = card('Question review');
                detail.append(node('h3', q.text), node('p', q.status), node('p', q.options.map((option, i) => `${i + 1}. ${option}`).join('\n'), 'preserve-lines'), node('p', `Correct option: ${q.correctIndex + 1} · ${q.sourceUrl}`));
                if (q.status === 'candidate')
                    detail.append(button('Authorize question', async () => { try {
                        await api('/admin/cbt/questions/' + q.id, 'PATCH', { revision: q.revision });
                        ctx.refresh();
                    }
                    catch (error) {
                        notice(detail, error.message);
                    } }));
                if (q.status === 'authorized')
                    questionChoices.push([q.id, q.text]);
                row.append(detail);
            }
        }
        queue.append(row);
    }
    if (!data.requests.length)
        empty(queue, 'No CBT requests awaiting decisions');
    root.append(queue);
    const options = catalogue.courses.map(c => [c.id, `${c.code} · ${c.level} Level`]), questionPicker = multi(questionChoices, 'exam-questions', 'Authorized questions for the selected course');
    const planning = form('Create examination plan', [selectField('courseId', 'Reviewed course', options), selectField('kind', 'Assessment purpose', [['pre_exam_revision', 'Pre-examination revision'], ['periodic', 'Administrator-selected periodic test']]), { ...selectField('requestId', 'Approved application (required for pre-exam revision)', [['', 'None for periodic test'], ...data.requests.filter(r => r.status === 'application_approved').map(r => [r.id, catalogue.courses.find(c => c.id === r.courseId)?.code ?? 'Approved application'])]), required: false }, { id: 'title', label: 'Assessment title' }, { id: 'startsAt', label: 'Planned start (device time)', type: 'datetime-local' }, { id: 'durationMinutes', label: 'Duration in minutes', type: 'number' }, { id: 'attemptLimit', label: 'Maximum attempts (1–3)', type: 'number' }, { id: 'capacity', label: 'Maximum students per batch (1–200)', type: 'number' }], async (v) => { await api('/admin/cbt/exams', 'POST', { ...v, requestId: v.requestId || null, startsAt: dateTime(v.startsAt), durationMinutes: Number(v.durationMinutes), attemptLimit: Number(v.attemptLimit), capacity: Number(v.capacity), questionIds: questionPicker.values() }); ctx.refresh(); });
    planning.querySelector('form').prepend(questionPicker.node);
    root.append(planning);
    let timer = null, activeMonitor = null;
    const monitor = card('Examination plans and participation');
    root.append(monitor);
    for (const exam of exams.exams) {
        const row = node('article', '', 'request-item');
        row.append(node('h3', exam.title), node('p', `${exam.status} · ${new Date(exam.starts_at).toLocaleString()} · ${exam.duration_minutes} minutes`));
        if (exam.status === 'planned') {
            const students = await studentPicker(exam.course_id, ctx);
            if (!ctx.alive())
                return;
            const batch = form('Create selected batch ' + exam.id, [{ id: 'title', label: 'Batch title' }, { id: 'startsAt', label: 'Batch start (device time)', type: 'datetime-local' }, { id: 'capacity', label: 'Batch capacity', type: 'number' }], async (v) => { await api('/admin/cbt/exams/' + exam.id + '/batches', 'POST', { ...v, revision: exam.revision, startsAt: dateTime(v.startsAt), capacity: Number(v.capacity), studentIds: students.values() }); ctx.refresh(); });
            batch.querySelector('form').prepend(students.node);
            row.append(batch);
            const blueprint = multi(questionChoices, 'blueprint-' + exam.id, 'Choose authorized questions for this course');
            row.append(blueprint.node, button('Update question selection', async () => { try {
                await api('/admin/cbt/exams/' + exam.id + '/blueprint', 'PUT', { revision: exam.revision, questionIds: blueprint.values() });
                ctx.refresh();
            }
            catch (error) {
                notice(row, error.message);
            } }));
            row.append(button('Schedule selected assessment', async () => { try {
                await api('/admin/cbt/exams/' + exam.id, 'PATCH', { revision: exam.revision, action: 'schedule' });
                ctx.refresh();
            }
            catch (error) {
                notice(row, error.message);
            } }));
        }
        if (exam.status !== 'cancelled')
            row.append(form('Change examination schedule ' + exam.id, [selectField('action', 'Action', [['reschedule', 'Reschedule'], ['cancel', 'Cancel assessment']]), { id: 'startsAt', label: 'New start (device time; only for reschedule)', type: 'datetime-local', required: false }], async (v) => { await api('/admin/cbt/exams/' + exam.id, 'PATCH', { revision: exam.revision, action: v.action, ...(v.action === 'reschedule' ? { startsAt: dateTime(v.startsAt) } : {}) }); ctx.refresh(); }));
        const statuses = node('div');
        row.append(statuses);
        async function update() { if (!ctx.alive())
            return; try {
            const state = await api('/admin/cbt/exams/' + exam.id + '/monitor');
            if (!ctx.alive())
                return;
            statuses.replaceChildren(node('h3', 'Participation status'));
            for (const a of state.assignments)
                statuses.append(node('p', `${a.name} · ${a.level} Level · ${a.state.replaceAll('_', ' ')}`));
            if (!state.assignments.length)
                statuses.append(node('p', 'No students selected.'));
        }
        catch (error) {
            if (ctx.alive()) {
                statuses.replaceChildren();
                notice(statuses, error.message);
                activeMonitor = null;
            }
        } }
        row.append(button('Monitor this assessment', () => { activeMonitor = update; update(); }), button('Refresh participation', update), button('Review assessment analytics', async () => { try {
            const data = await api('/admin/cbt/exams/' + exam.id + '/analytics');
            if (!ctx.alive())
                return;
            if (!data.results.length)
                notice(row, 'No assessment results available.');
            for (const r of data.results) {
                showAnalytics(row, r.analytics, catalogue.courses.find(c => c.id === exam.course_id)?.topics ?? []);
                if (r.status === 'reviewed')
                    row.append(button('Approve result publication', async () => { try {
                        await api('/admin/cbt/results/' + r.assignmentId, 'PATCH', { revision: r.revision });
                        ctx.refresh();
                    }
                    catch (error) {
                        notice(row, error.message);
                    } }));
            }
        }
        catch (error) {
            notice(row, error.message);
        } }));
        await update();
        if (!activeMonitor && exam.status === 'scheduled')
            activeMonitor = update;
        monitor.append(row);
    }
    // Only the actively viewed, visible monitoring panel refreshes; no completion notices.
    if (exams.exams.length)
        timer = setInterval(() => { if (ctx.alive())
            activeMonitor?.(); }, 20000);
    if (!exams.exams.length)
        empty(monitor, 'No examination plans');
    return () => { if (timer)
        clearInterval(timer); };
}
