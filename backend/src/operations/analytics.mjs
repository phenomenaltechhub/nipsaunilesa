import { fail, integer, list, choices } from './common.mjs';
// Trusted-engine projection contract. Never accepts a student's asserted score.
export function projectAssessment(questions, answers, elapsedSeconds) {
    integer(elapsedSeconds, 0, 86400);
    list(questions, 200);
    if (!questions.length)
        fail(400, 'EMPTY_ASSESSMENT');
    const ids = new Set(questions.map(q => q.id));
    if (ids.size !== questions.length || !answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).some(id => !ids.has(id)))
        fail(400, 'INVALID_ANSWERS');
    let score = 0, maximum = 0, unanswered = 0;
    const topics = Object.create(null), categories = Object.create(null), review = [];
    for (const q of questions) {
        const points = integer(q.points, 1, 20);
        choices(q.category, ['recall', 'application', 'analysis']);
        list(q.options, 6);
        integer(q.correctIndex, 0, q.options.length - 1);
        const selected = answers[q.id];
        if (selected !== undefined)
            integer(selected, 0, q.options.length - 1);
        const earned = selected === q.correctIndex ? points : 0;
        score += earned;
        maximum += points;
        if (selected === undefined)
            unanswered++;
        for (const [collection, key] of [[topics, q.topicId], [categories, q.category]]) {
            collection[key] ??= { score: 0, maximum: 0, questions: 0 };
            collection[key].score += earned;
            collection[key].maximum += points;
            collection[key].questions++;
        }
        if (!earned)
            review.push({ questionId: q.id, topicId: q.topicId, category: q.category, unanswered: selected === undefined });
    }
    return { score, maximum, elapsedSeconds, unanswered, topics, categories, incorrect: review, revisionTopicIds: Object.entries(topics).filter(([, v]) => v.score / v.maximum < 0.7).map(([id]) => id) };
}
// Explicit output schema prevents an engine payload from accidentally exposing keys.
export function publicAnalytics(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        fail(503, 'INVALID_RESULT_RECORD');
    const maximum = integer(value.maximum, 1, 4000), score = integer(value.score, 0, maximum), elapsedSeconds = integer(value.elapsedSeconds, 0, 86400), unanswered = integer(value.unanswered, 0, 200);
    function groups(input) { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length > 200)
        fail(503, 'INVALID_RESULT_RECORD'); const output = Object.create(null); for (const [key, entry] of Object.entries(input)) {
        if (typeof key !== 'string' || key.length > 80)
            fail(503, 'INVALID_RESULT_RECORD');
        output[key] = { score: integer(entry.score, 0, 4000), maximum: integer(entry.maximum, 1, 4000), questions: integer(entry.questions, 1, 200) };
        if (output[key].score > output[key].maximum)
            fail(503, 'INVALID_RESULT_RECORD');
    } return output; }
    const topics = groups(value.topics), categories = groups(value.categories), incorrect = list(value.incorrect, 200).map(q => ({ questionId: String(q.questionId).slice(0, 80), topicId: String(q.topicId).slice(0, 80), category: choices(q.category, ['recall', 'application', 'analysis']), unanswered: q.unanswered === true })), revisionTopicIds = list(value.revisionTopicIds, 200).filter(id => Object.hasOwn(topics, id));
    return { score, maximum, elapsedSeconds, unanswered, topics, categories, incorrect, revisionTopicIds };
}
