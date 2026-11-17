import { QuestionBank } from './question-bank.mjs';
import { ExaminationEngine } from './examination.mjs';
import { ResourceOperations } from './resources.mjs';
import { PaymentOperations } from '../providers/paystack.mjs';
import { m7Route } from './m7-routes.mjs';
import { AcademicOperations } from './academic.mjs';
import { NotificationOperations } from './notifications.mjs';
import { CommunityOperations } from './community.mjs';
import { CbtOperations } from './cbt.mjs';
import { fail } from './common.mjs';
export function createOperations(service) { const academic = new AcademicOperations(service), notifications = new NotificationOperations(service, academic), community = new CommunityOperations(service), cbt = new CbtOperations(service, academic, notifications); service.academicOperations = academic; const bank=new QuestionBank(service,academic),engine=new ExaminationEngine(service,cbt,bank),resources=new ResourceOperations(service,academic),payments=new PaymentOperations(service);
cbt.bank=bank;const ops={academic,notifications,community,cbt,bank,engine,resources,payments,
 communityVersion:()=>service.db.prepare('SELECT revision FROM community_stream WHERE id=1').get().revision,
 maintenance:()=>{notifications.activateDue();const expired=engine.maintain();service.db.prepare("INSERT INTO maintenance_runs VALUES('delivery',?,'ok') ON CONFLICT(name) DO UPDATE SET last_at=excluded.last_at,status=excluded.status").run(service.now());return {...expired,notificationScheduler:'checked',production:false};}}; return ops; }
export function operationRoute(ops, service, session, method, url, body) {
    const extended=m7Route(ops,service,session,method,url,body);if(extended!==undefined)return extended;
    const route = url.pathname.replace('/api/v1', ''), parts = route.split('/'), id = parts[3];
    if (route === '/admin/academic/catalogue' && method === 'GET')
        return ops.academic.adminCatalogue(session);
    if (/^\/admin\/academic\/[a-f0-9-]{36}\/candidates$/.test(route) && method === 'GET')
        return ops.academic.candidates(session, id, Number(url.searchParams.get('offset') ?? 0));
    if (route === '/academic/progress-summary' && method === 'GET')
        return ops.academic.progressOverview(session);
    if (route === '/academic/courses' && method === 'GET')
        return ops.academic.catalogue(session);
    if (route === '/academic/manage' && method === 'GET')
        return ops.academic.managementList(session, Number(url.searchParams.get('level')));
    if (route === '/academic/manage' && method === 'POST')
        return ops.academic.create(session, body);
    if (/^\/academic\/manage\/[a-f0-9-]{36}$/.test(route)) {
        if (method === 'GET')
            return ops.academic.managementDetail(session, id);
        if (method === 'PUT')
            return ops.academic.edit(session, id, body);
        if (method === 'PATCH')
            return ops.academic.decide(session, id, body);
    }
    if (/^\/academic\/courses\/[a-f0-9-]{36}$/.test(route) && method === 'GET')
        return ops.academic.content(ops.academic.published(session, id));
    if (/^\/academic\/courses\/[a-f0-9-]{36}\/progress$/.test(route)) {
        if (method === 'GET')
            return ops.academic.progress(session, id);
        if (method === 'PATCH')
            return ops.academic.saveProgress(session, id, body);
    }
    if (/^\/admin\/academic\/[a-f0-9-]{36}\/access$/.test(route) && method === 'PUT')
        return ops.academic.access(session, id, body);
    if (route === '/notifications' && method === 'GET')
        return ops.notifications.feed(session, url.searchParams.get('includeMuted') === 'true',url.searchParams.get('cursor'));
    if (route === '/notifications/preferences') {
        if (method === 'GET')
            return ops.notifications.preferences(session);
        if (method === 'PUT')
            return ops.notifications.savePreferences(session, body);
    }
    if (route === '/notifications/manage') {
        if (method === 'GET')
            return ops.notifications.history(session);
        if (method === 'POST')
            return ops.notifications.create(session, body);
    }
    if (/^\/notifications\/manage\/[a-f0-9-]{36}$/.test(route) && method === 'PATCH')
        return ops.notifications.update(session, id, body);
    if (/^\/notifications\/read\/[a-f0-9-]{36}$/.test(route) && method === 'PUT')
        return ops.notifications.mark(session, id, body);
    if (route === '/community/status' && method === 'GET')
        return { ...service.community(session), messagingImplemented: true };
    if (route === '/community/messages') {
        if (method === 'GET')
            return ops.community.page(session, url.searchParams.has('before') ? Number(url.searchParams.get('before')) : Number.MAX_SAFE_INTEGER);
        if (method === 'POST')
            return ops.community.create(session, body);
    }
    if (route === '/community/members' && method === 'GET')
        return ops.community.members(session, Number(url.searchParams.get('offset') ?? 0));
    if (/^\/community\/messages\/\d+$/.test(route) && method === 'PATCH')
        return ops.community.edit(session, Number(id), body);
    if (/^\/community\/messages\/\d+\/reaction$/.test(route) && method === 'PUT')
        return ops.community.react(session, Number(id), body);
    if (/^\/community\/messages\/\d+\/report$/.test(route) && method === 'POST')
        return ops.community.report(session, Number(id), body);
    if (route === '/admin/community/reports' && method === 'GET')
        return ops.community.reports(session);
    if (/^\/admin\/community\/reports\/[a-f0-9-]{36}$/.test(route) && method === 'PATCH')
        return ops.community.moderate(session, parts[4], body);
    if (route === '/cbt/policy' && method === 'GET')
        return ops.cbt.policy(session);
    if (route === '/admin/cbt/policy' && method === 'PUT')
        return ops.cbt.setPolicy(session, body);
    if (route === '/cbt/requests') {
        if (method === 'GET')
            return ops.cbt.list(session);
        if (method === 'POST')
            return ops.cbt.request(session, body);
    }
    if (/^\/cbt\/requests\/[a-f0-9-]{36}$/.test(route)) {
        if (method === 'GET')
            return ops.cbt.dto(ops.cbt.owned(session, id));
        if (method === 'PATCH')
            return ops.cbt.clarify(session, id, body);
    }
    if (/^\/admin\/cbt\/requests\/[a-f0-9-]{36}\/decision$/.test(route) && method === 'PATCH')
        return ops.cbt.decide(session, parts[4], body);
    if (/^\/cbt\/requests\/[a-f0-9-]{36}\/template$/.test(route) && method === 'GET')
        return ops.cbt.template(session, id);
    if (/^\/cbt\/requests\/[a-f0-9-]{36}\/application$/.test(route)) {
        if (method === 'GET')
            return ops.cbt.application(session, id);
        if (method === 'POST')
            return ops.cbt.submit(session, id, body);
    }
    if (/^\/cbt\/requests\/[a-f0-9-]{36}\/document$/.test(route) && method === 'POST')
        return ops.cbt.upload(session, id, body);
    if (/^\/admin\/cbt\/requests\/[a-f0-9-]{36}\/questions$/.test(route) && method === 'GET')
        return ops.cbt.questions(session, parts[4]);
    if (/^\/admin\/cbt\/questions\/[a-f0-9-]{36}$/.test(route) && method === 'PATCH')
        return ops.cbt.authorize(session, parts[4], body);
    if (route === '/admin/cbt/exams') {
        if (method === 'GET')
            return ops.cbt.exams(session);
        if (method === 'POST')
            return ops.cbt.createExam(session, body);
    }
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}$/.test(route) && method === 'PATCH')
        return ops.cbt.schedule(session, parts[4], body);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/blueprint$/.test(route) && method === 'PUT')
        return ops.cbt.setQuestions(session, parts[4], body);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/batches$/.test(route) && method === 'POST')
        return ops.cbt.batch(session, parts[4], body);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/monitor$/.test(route) && method === 'GET')
        return ops.cbt.monitor(session, parts[4]);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/analytics$/.test(route) && method === 'GET')
        return ops.cbt.analytics(session, parts[4]);
    if (/^\/admin\/cbt\/results\/[a-f0-9-]{36}$/.test(route) && method === 'PATCH')
        return ops.cbt.publishResult(session, parts[4], body);
    if (route === '/cbt/results' && method === 'GET')
        return ops.cbt.resultHistory(session);
    if (route === '/cbt/assignments' && method === 'GET')
        return ops.cbt.assignments(session);
    if (/^\/cbt\/assignments\/[a-f0-9-]{36}\/results$/.test(route) && method === 'GET')
        return ops.cbt.results(session, id);
    if (route.startsWith('/cbt/') || route.startsWith('/admin/cbt/')) {
        service.requireUser(session);
        fail(404, 'NOT_FOUND', 'Examination delivery is not enabled in M6.');
    }
    return undefined;
}
