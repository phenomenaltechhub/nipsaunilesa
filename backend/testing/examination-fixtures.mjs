// Synthetic controlled-engine fixture; never imported by operational startup.
import assert from 'node:assert/strict';
import { operationEnvironment, publishedCourse } from './operations-fixtures.mjs';
export async function examinationEnvironment({ questionCount = 1 } = {}) {
    const e = await operationEnvironment();
    try {
        const admin = await e.member('administrator'), rep = await e.member('representative'), reviewer = await e.member('reviewer'), student = await e.member(), peer = await e.member(), outsider = await e.member('student', 100), course = await publishedCourse(e, rep, reviewer);
        const question = { text: 'Synthetic CBT fixture: select the first labelled option.', topicId: course.topics[0].id, category: 'recall', difficulty: 'introductory', options: ['First synthetic option', 'Second synthetic option'], correctIndex: 0, points: 2, sourceUrl: 'https://example.invalid/synthetic-test-source', explanation: 'Isolated test explanation, not academic content.' };
        let q = await admin.c.request('/api/v1/admin/cbt/question-bank', 'POST', { courseId: course.id, question });
        assert.equal(q.status, 200);
        q = await admin.c.request('/api/v1/admin/cbt/questions/' + q.data.id, 'PATCH', { revision: q.data.revision, action: 'approve', reason: 'Synthetic question review.' });
        assert.equal(q.status, 200);
        const questionIds = [q.data.id];
        for (let i = 1; i < questionCount; i++) {
            let extra = await admin.c.request('/api/v1/admin/cbt/question-bank', 'POST', { courseId: course.id, question: { ...question, text: 'Synthetic CBT fixture ' + (i + 1) + ': select the first labelled option.', topicId: course.topics[i % course.topics.length].id } });
            assert.equal(extra.status, 200);
            extra = await admin.c.request('/api/v1/admin/cbt/questions/' + extra.data.id, 'PATCH', { revision: extra.data.revision, action: 'approve', reason: 'Synthetic extra question review.' });
            assert.equal(extra.status, 200);
            questionIds.push(extra.data.id);
        }
        let plan = await admin.c.request('/api/v1/admin/cbt/exams', 'POST', { courseId: course.id, requestId: null, title: 'Synthetic M7 controlled assessment — not an institutional examination', kind: 'periodic', startsAt: new Date(e.now() + 1000).toISOString(), durationMinutes: 5, attemptLimit: 2, capacity: 2, questionIds });
        assert.equal(plan.status, 200);
        const exam = plan.data;
        const batch = await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/batches', 'POST', { revision: exam.revision, title: 'Synthetic selected test batch', startsAt: new Date(e.now() + 1000).toISOString(), capacity: 2, studentIds: [student.user.id, peer.user.id] });
        assert.equal(batch.status, 200);
        plan = await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id, 'PATCH', { revision: batch.data.revision, action: 'schedule' });
        assert.equal(plan.status, 200);
        assert.equal((await admin.c.request('/api/v1/admin/cbt/exams/' + exam.id + '/delivery', 'PUT', { revision: 0, opensAt: new Date(e.now() + 1000).toISOString(), closesAt: new Date(e.now() + 301000).toISOString(), releaseQuestions: true, instructions: 'Synthetic test only. Saved answers can resume within the server deadline. Interruptions receive fair administrative review.' })).status, 200);
        e.advance(1001);
        const assignment = (await student.c.request('/api/v1/cbt/assignments')).data.assignments[0];
        return { ...e, admin, rep, reviewer, student, peer, outsider, course, question: q.data, exam: plan.data, assignment };
    }
    catch (error) {
        await e.cleanup();
        throw error;
    }
}
