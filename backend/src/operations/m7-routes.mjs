import { fields } from './common.mjs';
export function m7Route(ops, s, session, method, url, body) {
    const p = url.pathname.replace('/api/v1', ''), parts = p.split('/'), id = parts[3];
    if (p === '/admin/cbt/question-bank' && method === 'GET')
        return ops.bank.catalogue(session, url.searchParams.get('courseId'));
    if (p === '/admin/cbt/question-bank' && method === 'POST')
        return ops.bank.create(session, body);
    if (p === '/admin/cbt/question-template' && method === 'GET')
        return ops.bank.template(session, url.searchParams.get('courseId'));
    if (p === '/admin/cbt/question-import' && method === 'POST')
        return ops.bank.import(session, body);
    if (/^\/admin\/cbt\/questions\/[a-f0-9-]{36}$/.test(p) && method === 'PATCH' && body?.action)
        return ops.bank.update(session, parts[4], body);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/delivery$/.test(p)) {
        if (method === 'GET') {
            s.requireAdmin(session);
            return ops.engine.delivery(ops.cbt.exam(parts[4]));
        }
        if (method === 'PUT')
            return ops.engine.configure(session, parts[4], body);
    }
    if (/^\/admin\/cbt\/batches\/[a-f0-9-]{36}\/window$/.test(p) && method === 'PUT')
        return ops.engine.batchWindow(session, parts[4], body);
    if (/^\/cbt\/assignments\/[a-f0-9-]{36}\/entry$/.test(p) && method === 'GET')
        return ops.engine.entry(session, id);
    if (/^\/cbt\/assignments\/[a-f0-9-]{36}\/attempts$/.test(p) && method === 'POST')
        return ops.engine.start(session, id, body);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}$/.test(p) && method === 'GET')
        return ops.engine.read(session, id);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}\/resume$/.test(p) && method === 'POST')
        return ops.engine.resume(session, id, body);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}\/answers$/.test(p) && method === 'PATCH')
        return ops.engine.save(session, id, body);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}\/submit$/.test(p) && method === 'POST')
        return ops.engine.submit(session, id, body);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}\/events$/.test(p) && method === 'POST')
        return ops.engine.event(session, id, body);
    if (/^\/cbt\/attempts\/[a-f0-9-]{36}\/results$/.test(p) && method === 'GET')
        return ops.engine.results(session, id);
    if (p === '/cbt/attempt-history' && method === 'GET')
        return ops.engine.history(session);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/summary$/.test(p) && method === 'GET')
        return ops.engine.summary(session, parts[4]);
    if (/^\/admin\/cbt\/exams\/[a-f0-9-]{36}\/monitor$/.test(p) && method === 'GET')
        return ops.engine.monitor(session, parts[4]);
    if (/^\/admin\/cbt\/attempts\/[a-f0-9-]{36}\/review$/.test(p) && method === 'PATCH')
        return ops.engine.review(session, parts[4], body);
    if (/^\/admin\/cbt\/attempts\/[a-f0-9-]{36}\/analytics$/.test(p) && method === 'GET') {
        s.requireAdmin(session);
        return ops.engine.adminResult(session, parts[4]);
    }
    if (p === '/academic/resources' && method === 'GET')
        return ops.resources.list(session, url.searchParams.get('courseId'), url.searchParams.get('manage') === 'true');
    if (p === '/academic/resources' && method === 'POST')
        return ops.resources.create(session, body);
    if (/^\/academic\/resources\/[a-f0-9-]{36}$/.test(p) && method === 'PATCH')
        return ops.resources.update(session, id, body);
    if (/^\/academic\/resources\/[a-f0-9-]{36}\/file$/.test(p) && method === 'POST')
        return ops.resources.upload(session, id, body);
    if (/^\/academic\/resources\/[a-f0-9-]{36}\/download$/.test(p) && method === 'GET')
        return ops.resources.download(session, id, url.searchParams.get('draft') === 'true');
    if (/^\/notifications\/manage\/[a-f0-9-]{36}\/expiry$/.test(p) && method === 'PUT')
        return ops.notifications.expiry(session, id, body);
    if (p === '/community/changes' && method === 'GET') {
        s.requireUser(session);
        return { version: ops.communityVersion(), ...s.community(session), suspended: Boolean(s.db.prepare('SELECT 1 FROM chat_suspensions WHERE account_id=?').get(session.user.id)) };
    }
    if (p === '/admin/payments/status' && method === 'GET')
        return ops.payments.status(session);
    if (p === '/admin/payments/orders' && method === 'POST')
        return ops.payments.create(session, body);
    if (/^\/admin\/payments\/orders\/[a-f0-9-]{36}\/verify$/.test(p) && method === 'POST') {
        fields(body, []);
        return ops.payments.verify(session, parts[4]);
    }
    if (p === '/admin/operations/maintenance' && method === 'POST') {
        s.requireAdmin(session);
        fields(body, []);
        return ops.maintenance();
    }
    return undefined;
}
