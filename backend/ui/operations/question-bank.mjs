import { api, node, form, card, button, notice, selectField, jsonDownload } from './common.mjs';
export async function questionBankView(root, ctx, courses) {
    const box = node('details', '', 'card');
    box.append(node('summary', 'Question bank and structured imports'));
    const choose = node('select'), label = node('label', 'Question-bank course'), content = node('div');
    label.append(choose);
    for (const c of courses)
        choose.add(new Option(c.code + ' · ' + c.level + ' Level', c.id));
    box.append(label, content);
    root.append(box);
    async function draw() {
        if (!choose.value)
            return;
        const data = await api('/admin/cbt/question-bank?courseId=' + choose.value);
        if (!ctx.alive())
            return;
        content.replaceChildren();
        const course = courses.find(c => c.id === choose.value);
        content.append(form('Save question draft', [selectField('topicId', 'Reviewed topic', course.topics.map(t => [t.id, t.title])), { id: 'text', label: 'Question text', multiline: true, maxLength: 700 }, { id: 'options', label: 'Answer options (one per line, 2–6)', multiline: true, maxLength: 1500 }, { id: 'correctIndex', label: 'Correct option number (1–6)', type: 'number' }, selectField('category', 'Question category', [['recall', 'Recall'], ['application', 'Application'], ['analysis', 'Analysis']]), selectField('difficulty', 'Reviewed difficulty', [['unclassified', 'Not classified'], ['introductory', 'Introductory'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']]), { id: 'points', label: 'Marks (1–20)', type: 'number' }, { id: 'sourceUrl', label: 'Question source (HTTPS)', type: 'url', maxLength: 2048 }, { id: 'explanation', label: 'Reviewed explanation (optional)', multiline: true, maxLength: 1000, required: false }], async (v) => { await api('/admin/cbt/question-bank', 'POST', { courseId: course.id, question: { ...v, options: v.options.split('\n').map(s => s.trim()).filter(Boolean), correctIndex: Number(v.correctIndex) - 1, points: Number(v.points) } }); ctx.refresh(); }));
        content.append(button('Download question template', async () => {
            try {
                jsonDownload(await api('/admin/cbt/question-template?courseId=' + course.id), 'cbt-question-template.json');
            }
            catch (error) {
                notice(content, error.message);
            }
        }), form('Import structured question draft', [{ id: 'document', label: 'Completed question template JSON (maximum 14 KB)', multiline: true, maxLength: 14000 }], async (v) => {
            let document;
            try {
                document = JSON.parse(v.document);
            }
            catch {
                throw new Error('Use valid JSON from the approved template.');
            }
            await api('/admin/cbt/question-import', 'POST', document);
            ctx.refresh();
        }));
        for (const q of data.questions) {
            const row = card('Bank question · ' + q.status);
            row.append(node('h3', q.text), node('p', q.options.map((text, i) => `${i + 1}. ${text}`).join('\n'), 'preserve-lines'), node('p', `Correct option ${q.correctIndex + 1} · ${q.points} marks · ${q.difficulty ?? 'unclassified'}`), node('p', q.sourceUrl));
            const current = { text: q.text, topicId: q.topicId, category: q.category, difficulty: q.difficulty ?? 'unclassified', options: q.options, correctIndex: q.correctIndex, points: q.points, sourceUrl: q.sourceUrl, explanation: q.explanation ?? '' };
            row.append(form('Review bank question ' + q.id, [selectField('action', 'Question decision', [...(q.status === 'candidate' ? [['approve', 'Approve reviewed question']] : []), ['withdraw', 'Withdraw question']]), { id: 'reason', label: 'Review reason', multiline: true, maxLength: 500 }], async (v) => { await api('/admin/cbt/questions/' + q.id, 'PATCH', { ...v, revision: q.revision }); ctx.refresh(); }), form('Correct question ' + q.id, [{ id: 'question', label: 'Question correction JSON', multiline: true, maxLength: 8000, value: JSON.stringify(current, null, 2) }, { id: 'reason', label: 'Correction reason', maxLength: 500 }], async (v) => {
                let question;
                try {
                    question = JSON.parse(v.question);
                }
                catch {
                    throw new Error('Use valid question JSON.');
                }
                await api('/admin/cbt/questions/' + q.id, 'PATCH', { revision: q.revision, action: 'correct', question, reason: v.reason });
                ctx.refresh();
            }));
            for (const h of q.history)
                row.append(node('p', `Revision ${h.revision} · ${h.status} · ${h.reason}`, 'muted'));
            content.append(row);
        }
    }
    choose.addEventListener('change', () => draw().catch(error => notice(content, error.message)));
    if (courses.length)
        await draw();
}
