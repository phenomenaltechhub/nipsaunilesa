import { createHmac, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { fields, fail, plain, choices, integer } from '../operations/common.mjs';
// Native adapter. Only server-configured test credentials are accepted in this controlled service.
export class PaystackAdapter {
    constructor({ secret, transport = fetch } = {}) {
        if (secret && (!secret.startsWith('sk_test_') || secret.length < 20))
            throw new Error('Only private sandbox Paystack configuration is authorized.');
        this.secret = secret;
        this.transport = transport;
    }
    ready() { return Boolean(this.secret); }
    async call(path, body) {
        if (!this.ready())
            fail(503, 'PAYMENT_PROVIDER_UNAVAILABLE');
        let response, data;
        try {
            response = await this.transport('https://api.paystack.co' + path, { method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(10000), headers: { Authorization: 'Bearer ' + this.secret, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
            if (Number(response.headers.get('content-length')) > 65536)
                throw new Error();
            const reader = response.body.getReader(), chunks = [];
            let size = 0;
            while (true) {
                const part = await reader.read();
                if (part.done)
                    break;
                size += part.value.length;
                if (size > 65536) {
                    await reader.cancel();
                    throw new Error();
                }
                chunks.push(Buffer.from(part.value));
            }
            data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        }
        catch {
            fail(503, 'PAYMENT_PROVIDER_UNAVAILABLE');
        }
        if (!response.ok || data.status !== true || !data.data)
            fail(503, 'PAYMENT_PROVIDER_UNAVAILABLE');
        return data.data;
    }
    initialize(reference, amount, currency, email) { return this.call('/transaction/initialize', { reference, amount, currency, email }); }
    verify(reference) { return this.call('/transaction/verify/' + encodeURIComponent(reference)); }
    signature(raw, signature) {
        if (!this.ready() || typeof signature !== 'string' || !/^\w{128}$/.test(signature) || !/^[a-f0-9]+$/i.test(signature))
            return false;
        const expected = createHmac('sha512', this.secret).update(raw).digest(), supplied = Buffer.from(signature, 'hex');
        return supplied.length === expected.length && timingSafeEqual(supplied, expected);
    }
}
export class PaymentOperations {
    constructor(service) { this.s = service; this.db = service.db; this.provider = new PaystackAdapter(service.config.paystack); }
    status(session) { this.s.requireAdmin(session); return { sandboxOnly: true, configured: this.provider.ready(), liveChargesEnabled: false, eligibilityImportEnabled: false }; }
    async create(session, input) {
        fields(input, ['packageId']);
        const actor = this.s.requireAdmin(session), pack = this.s.config.paymentPackages?.[plain(input.packageId, 60)];
        if (!pack)
            fail(503, 'APPROVED_PACKAGE_UNAVAILABLE');
        if (!this.provider.ready())
            fail(503, 'PAYMENT_PROVIDER_UNAVAILABLE');
        const amount = integer(pack.amount, 1, 100000000), currency = choices(pack.currency, ['NGN']), purpose = choices(pack.purpose, ['dues', 'student_ads']), reference = 'pharmaideia_test_' + randomUUID(), id = randomUUID();
        this.s.tx(() => { this.s.requireAdmin(session); this.db.prepare('INSERT INTO payment_orders(id,purpose,reference,amount,currency,created_at)VALUES(?,?,?,?,?,?)').run(id, purpose, reference, amount, currency, this.s.now()); this.s.audit(actor.id, 'payment.sandbox_created', id); });
        const data = await this.provider.initialize(reference, amount, currency, actor.email);
        this.s.requireAdmin(session);
        if (data.reference !== reference || typeof data.authorization_url !== 'string')
            fail(503, 'PAYMENT_PROVIDER_MISMATCH');
        const url = new URL(data.authorization_url);
        if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com' || url.username || url.password || url.port)
            fail(503, 'PAYMENT_PROVIDER_MISMATCH');
        return { id, reference, checkoutUrl: url.href, sandbox: true };
    }
    async reconcile(reference) {
        const order = this.db.prepare('SELECT * FROM payment_orders WHERE reference=?').get(reference);
        if (!order)
            fail(404, 'NOT_FOUND');
        const data = await this.provider.verify(reference);
        if (data.reference !== order.reference || data.amount !== order.amount || data.currency !== order.currency || data.domain !== 'test' || !Number.isSafeInteger(data.id))
            fail(409, 'PAYMENT_PROVIDER_MISMATCH');
        const status = ({ success: 'paid', pending: 'pending', ongoing: 'pending', processing: 'pending', failed: 'failed', abandoned: 'failed', reversed: 'reversed' })[data.status];
        if (!status)
            fail(409, 'PAYMENT_STATUS_UNVERIFIED');
        return this.s.tx(() => {
            const current = this.db.prepare('SELECT * FROM payment_orders WHERE id=?').get(order.id);
            if (['refunded', 'reversed', 'disputed'].includes(current.status) && status === 'paid')
                return { status: current.status };
            if (current.provider_id && current.provider_id !== String(data.id))
                fail(409, 'PAYMENT_REFERENCE_CONFLICT');
            const other = this.db.prepare('SELECT id FROM payment_orders WHERE provider_id=? AND id!=?').get(String(data.id), order.id);
            if (other)
                fail(409, 'PAYMENT_REFERENCE_CONFLICT');
            if (current.status !== status) {
                this.db.prepare('UPDATE payment_orders SET status=?,provider_id=?,verified_at=? WHERE id=?').run(status, String(data.id), this.s.now(), order.id);
                this.s.audit(null, 'payment.server_' + status, order.id);
            }
            return { status, orderId: order.id };
        });
    }
    async verify(session, id) {
        this.s.requireAdmin(session);
        const order = this.db.prepare('SELECT * FROM payment_orders WHERE id=?').get(id);
        if (!order)
            fail(404, 'NOT_FOUND');
        const result = await this.reconcile(order.reference);
        this.s.requireAdmin(session);
        return result;
    }
    async webhook(raw, signature) {
        if (!this.provider.ready())
            fail(503, 'PAYMENT_PROVIDER_UNAVAILABLE');
        if (!Buffer.isBuffer(raw) || raw.length > 20000 || !this.provider.signature(raw, signature))
            fail(403, 'WEBHOOK_SIGNATURE');
        let event;
        try {
            event = JSON.parse(raw.toString('utf8'));
        }
        catch {
            fail(400, 'INVALID_WEBHOOK');
        }
        const hash = createHash('sha256').update(raw).digest('hex');
        if (this.db.prepare('SELECT 1 FROM payment_events WHERE event_id=?').get(hash))
            return { received: true, duplicate: true };
        const kind = choices(event.event, ['charge.success', 'refund.processed', 'charge.dispute.create']), reference = kind === 'charge.success' ? event.data?.reference : event.data?.transaction?.reference;
        if (typeof reference !== 'string' || reference.length > 100)
            fail(400, 'INVALID_WEBHOOK');
        const order = this.db.prepare('SELECT * FROM payment_orders WHERE reference=?').get(reference);
        if (!order)
            fail(404, 'NOT_FOUND');
        const verified = await this.reconcile(reference);
        return this.s.tx(() => {
            if (this.db.prepare('SELECT 1 FROM payment_events WHERE event_id=?').get(hash))
                return { received: true, duplicate: true };
            let status = verified.status;
            if (kind === 'refund.processed' || kind === 'charge.dispute.create') {
                if (!Number.isSafeInteger(event.data?.amount) || event.data.amount < 1 || event.data.amount > order.amount)
                    fail(400, 'INVALID_WEBHOOK');
                status = kind === 'refund.processed' ? 'refunded' : 'disputed';
                this.db.prepare('UPDATE payment_orders SET status=? WHERE id=?').run(status, order.id);
                this.s.audit(null, 'payment.' + status, order.id);
            }
            this.db.prepare('INSERT INTO payment_events VALUES(?,?,?,?)').run(hash, order.id, status, this.s.now());
            return { received: true };
        });
    }
}
