import { ApiError, fields } from '../service.mjs';
export { fields };
const messages = { INVALID_DATE: 'Choose a valid date and time.', INVALID_PERIOD: 'The period must end after it starts.', INVALID_TOPICS: 'Choose reviewed topics from this course.', APPLICATION_NOT_AUTHORIZED: 'Initial approval is required for this application stage.', CBT_INTAKE_CLOSED: 'Initial CBT requests are closed.', PLAN_INCOMPLETE: 'Select eligible students and authorized questions before scheduling.', BATCH_CONFLICT: 'A selected student already has an overlapping assessment.', INVALID_BATCH: 'Check the batch date, capacity and selected students.', PUBLISH_FORBIDDEN: 'Your appointment does not authorize this audience.' };
export const fail = (status, code, message) => { throw new ApiError(status, code, message ?? messages[code]); };
export function plain(value, max = 120, optional = false) { if (typeof value !== 'string' || !value.isWellFormed() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value) || value.length > max || (!optional && !value.trim()))
    fail(400, 'INVALID_INPUT', 'Use bounded plain text.'); return value.trim().normalize('NFC'); }
export function integer(value, min = 0, max = 100000) { if (!Number.isSafeInteger(value) || value < min || value > max)
    fail(400, 'INVALID_NUMBER'); return value; }
export function identifier(value) { if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value))
    fail(404, 'NOT_FOUND'); return value; }
export function revision(row, expected) { integer(expected); if (row.revision !== expected)
    fail(409, 'REVISION_CONFLICT', 'This record changed. Refresh before saving again.'); }
export function instant(value) { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value)))
    fail(400, 'INVALID_DATE'); const parsed = Date.parse(value), canonical = value.includes('.') ? value : value.replace('Z', '.000Z'); if (new Date(parsed).toISOString() !== canonical)
    fail(400, 'INVALID_DATE'); return parsed; }
export function future(value, now) { const time = instant(value); if (time < now || time > now + 366 * 86400000)
    fail(400, 'INVALID_DATE'); return time; }
export function choices(value, allowed) { if (!allowed.includes(value))
    fail(400, 'INVALID_CHOICE'); return value; }
export function list(value, max = 100) { if (!Array.isArray(value) || value.length > max)
    fail(400, 'INVALID_LIST'); return value; }
export function fresh(service, session) { const user = service.requireUser(session); if (!session.mfa_at || session.mfa_at + 600000 <= service.now())
    fail(403, 'MFA_REQUIRED'); return user; }
export function actorLabel(service, id) { if (!id)
    return { name: 'Former member', level: null, roles: [] }; const user = service.account(id); return user ? { id: user.id, name: user.name, level: user.level, roles: service.roles(id).map(r => r.role) } : { name: 'Former member', level: null, roles: [] }; }
