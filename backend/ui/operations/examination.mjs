import { api, node, button, card, notice } from './common.mjs';
export async function examinationEntry(parent, ctx, assignment) {
    const entry = await api('/cbt/assignments/' + assignment.id + '/entry');
    if (!ctx.alive())
        return;
    const root = card('Assessment entry');
    root.classList.add('examination-workspace');
    root.append(node('h3', entry.title), node('p', entry.instructions), node('p', `${new Date(entry.opensAt).toLocaleString()} – ${new Date(entry.closesAt).toLocaleString()} · ${entry.durationMinutes} minutes · maximum ${entry.attemptLimit} attempts`));
    const title = node('h1', 'Assigned assessment');title.id='page-title';
    parent.replaceChildren(title, root);
    parent.closest('main')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    let dispose = () => { };
    const active = entry.attempts.find(a => ['in_progress', 'interrupted', 'requires_review'].includes(a.status));
    const begin = async () => {
        try {
            const attempt = active ? await api('/cbt/attempts/' + active.id + '/resume', 'POST', {}) : await api('/cbt/assignments/' + assignment.id + '/attempts', 'POST', {});
            if (ctx.alive())
                dispose = runExamination(root, ctx, attempt);
        }
        catch (error) {
            notice(root, error.message);
        }
    };
    root.append(button(active ? 'Resume saved attempt' : 'Start assigned assessment', begin));
    if (!entry.available)
        root.append(node('p', 'Entry is available only during your administrator-released batch window.'));
    return () => dispose();
}
export function runExamination(root, ctx, initial) {
    let attempt = initial, index = 0, stopped = false, pending = new Map(), busy = false, savedAt = performance.now(), timer = null, queuedWrite = null;
    const events = [];
    let flushing = false;
    root.replaceChildren(node('h2', 'Your assessment'));
    const clock = node('p', '', 'exam-clock'), status = node('p', 'All loaded answers are saved.', 'status'), warnings = node('p', '', 'status'), navigation = node('nav'), question = node('section'), summary = node('p'), actions = node('div', '', 'choices');
    status.setAttribute('role', 'status');
    warnings.setAttribute('role', 'status');
    clock.setAttribute('role','timer');clock.setAttribute('aria-label', 'Server-controlled remaining time');
    navigation.setAttribute('aria-label', 'Question navigation');
    root.append(clock, status, warnings, navigation, question, summary, actions);
    function active() { return !stopped && ctx.alive(); }
    async function event(kind) { const item = { requestId: crypto.randomUUID(), kind }; events.push(item); await flushEvents(); }
    async function flushEvents() {
        if (flushing || !navigator.onLine)
            return;
        flushing = true;
        try {
            while (events.length && !stopped) {
                const result = await api('/cbt/attempts/' + attempt.id + '/events', 'POST', events[0]);
                events.shift();
                if (active())
                    warnings.textContent = result.message + ` Warning ${result.warnings} of ${result.threshold}.`;
            }
        }
        catch { /* Kept in this view's memory only; reconnect/resume is independently server logged. */ }
        finally {
            flushing = false;
        }
    }
    function draw() {
        if (!active())
            return;
        navigation.replaceChildren();
        for (const [i, q] of attempt.questions.entries()) {
            const answer = pending.get(q.id) ?? attempt.answers[q.id], b = button(`${i + 1}${answer?.flagged ? ' · flagged' : ''}${answer?.selectedIndex !== null && answer?.selectedIndex !== undefined ? ' · answered' : ''}`, () => { index = i; draw(); });
            b.setAttribute('aria-label', 'Question ' + (i + 1));
            if (i === index)
                b.setAttribute('aria-current', 'step');
            navigation.append(b);
        }
        const q = attempt.questions[index];
        if (!q)
            return;
        question.replaceChildren(node('h3', `Question ${index + 1} of ${attempt.questions.length}`), node('p', q.text), node('p', `${q.points} ${q.points === 1 ? 'mark' : 'marks'}`, 'muted'));
        const options = node('fieldset');
        options.append(node('legend', 'Select one answer'));
        const answer = pending.get(q.id) ?? attempt.answers[q.id] ?? { selectedIndex: null, flagged: false };
        for (const [i, text] of q.options.entries()) {
            const label = node('label', '', 'choice'), input = node('input');
            input.type = 'radio';
            input.name = 'exam-answer-' + q.id;
            input.checked = answer.selectedIndex === i;
            input.addEventListener('change', () => { pending.set(q.id, { selectedIndex: i, flagged: (pending.get(q.id) ?? attempt.answers[q.id])?.flagged ?? false }); status.textContent = 'Unsaved answer. Saving…'; save(); });
            label.append(input, node('span', text));
            options.append(label);
        }
        question.append(options);
        const flag = node('label', '', 'choice'), check = node('input');
        check.type = 'checkbox';
        check.checked = answer.flagged;
        check.addEventListener('change', () => { pending.set(q.id, { selectedIndex: (pending.get(q.id) ?? attempt.answers[q.id])?.selectedIndex ?? null, flagged: check.checked }); save(); });
        flag.append(check, node('span', 'Flag this question for review'));
        question.append(flag, button('Clear selected answer', () => { pending.set(q.id, { selectedIndex: null, flagged: (pending.get(q.id) ?? attempt.answers[q.id])?.flagged ?? false }); save(); }));
        const unanswered = attempt.questions.filter(q => { const a = pending.get(q.id) ?? attempt.answers[q.id]; return a?.selectedIndex == null; }).length;
        summary.textContent = `${attempt.questions.length - unanswered} answered · ${unanswered} unanswered · ${pending.size} pending saves`;
    }
    async function save() {
        if (busy || !pending.size || !active())
            return;
        if (!navigator.onLine) {
            status.textContent = 'Connection lost. Unsaved changes remain in memory; reconnect to save before the server deadline.';
            return;
        }
        busy = true;
        status.textContent = 'Saving answers…';
        if (!queuedWrite) {
            const batch = new Map(pending);
            queuedWrite = { batch, body: { revision: attempt.revision, requestId: crypto.randomUUID(), changes: Array.from(batch, ([questionId, value]) => ({ questionId, ...value })) } };
        }
        const batch = queuedWrite.batch;
        try {
            const result = await api('/cbt/attempts/' + attempt.id + '/answers', 'PATCH', queuedWrite.body);
            if (!active())
                return;
            for (const [id, value] of batch)
                if (pending.get(id) === value)
                    pending.delete(id);
            attempt = result;
            queuedWrite = null;
            savedAt = performance.now();
            status.textContent = 'Answers saved to your account.';
            draw();
        }
        catch (error) {
            if (active())
                status.textContent = error.message + ' Your unsaved changes remain in this view. Use Retry saving.';
        }
        finally {
            busy = false;
            if (active() && pending.size && navigator.onLine && status.textContent === 'Answers saved to your account.')
                save();
        }
    }
    async function refresh() {
        if (!active() || !navigator.onLine || busy || pending.size)
            return;
        try {
            const result = await api('/cbt/attempts/' + attempt.id);
            if (!active())
                return;
            if (!['in_progress', 'interrupted', 'requires_review'].includes(result.status)) {
                finish(result.status === 'expired' ? 'Time expired. Saved answers were submitted for marking.' : 'Attempt finished. Results require administrator release.');
                return;
            }
            attempt = result;
            savedAt = performance.now();
            draw();
        }
        catch (error) {
            if (active()) {
                question.replaceChildren();
                status.textContent = error.message + ' Open CBT to resume when permitted.';
            }
        }
    }
    function tick() {
        if (!active())
            return;
        const seconds = Math.max(0, Math.ceil((attempt.deadline - attempt.serverNow - (performance.now() - savedAt)) / 1000));
        clock.textContent = `Time remaining: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        if (seconds === 0) {
            question.replaceChildren();
            status.textContent = 'Checking server expiry…';
            refresh();
        }
    }
    function finish(message) { dispose(); root.replaceChildren(node('h2', 'Assessment completed'), node('p', message), node('p', 'Results are withheld until authorized review and release.'), button('Return to CBT', () => ctx.refresh())); }
    const submit = button('Review and submit', () => {
        const dialog = node('dialog'), title = node('h2', 'Submit this attempt?');
        title.id = 'exam-submit-title';
        dialog.setAttribute('aria-labelledby', title.id);
        const unanswered = attempt.questions.filter(q => (pending.get(q.id) ?? attempt.answers[q.id])?.selectedIndex == null).length;
        dialog.append(title, node('p', `${unanswered} unanswered questions. Submission is final for this attempt.`), button('Continue assessment', () => { dialog.close(); dialog.remove(); }), button('Confirm final submission', async () => {
            try {
                await save();
                if (busy || pending.size)
                    throw new Error('Wait for all answers to be saved before submitting.');
                await api('/cbt/attempts/' + attempt.id + '/submit', 'POST', { revision: attempt.revision });
                dialog.close();
                dialog.remove();
                finish('Your saved responses have been submitted.');
            }
            catch (error) {
                if (error.code === 'ALREADY_FINALIZED') {
                    try {
                        const state = await api('/cbt/attempts/' + attempt.id);
                        if (['submitted', 'expired'].includes(state.status)) {
                            dialog.close();
                            dialog.remove();
                            finish('The server has already finalized your saved attempt.');
                            return;
                        }
                    }
                    catch { /* Keep the current error visible until a verified response is available. */ }
                }
                notice(dialog, error.message);
            }
        }));
        root.append(dialog);
        dialog.showModal();
    });
    actions.append(button('Previous question', () => { index = Math.max(0, index - 1); draw(); }), button('Next question', () => { index = Math.min(attempt.questions.length - 1, index + 1); draw(); }), button('Retry saving', save), submit);
    const onHidden = () => {
        if (document.hidden)
            event('visibility_hidden');
    }, onOffline = () => { status.textContent = 'Connection lost. Saved answers remain on the server.'; events.push({ requestId: crypto.randomUUID(), kind: 'disconnected' }); }, onOnline = () => { event('reconnected'); save(); refresh(); }, onNavigation = () => event('navigation_attempt'), onUnload = e => {
        if (active()) {
            event('navigation_attempt');
            e.preventDefault();
            e.returnValue = '';
        }
    };
    document.addEventListener('visibilitychange', onHidden, true);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    window.addEventListener('hashchange', onNavigation, true);
    window.addEventListener('beforeunload', onUnload);
    timer = setInterval(tick, 1000);
    const sync = setInterval(refresh, 15000);
    draw();
    tick();
    function dispose() {
        if (stopped)
            return;
        stopped = true;
        clearInterval(timer);
        clearInterval(sync);
        document.removeEventListener('visibilitychange', onHidden, true);
        window.removeEventListener('offline', onOffline);
        window.removeEventListener('online', onOnline);
        window.removeEventListener('hashchange', onNavigation, true);
        window.removeEventListener('beforeunload', onUnload);
        for (const d of root.querySelectorAll('dialog')) {
            d.close();
            d.remove();
        }
        pending.clear();
        events.length = 0;
        question.replaceChildren();
    }
    return dispose;
}
