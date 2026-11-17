import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalendarDate, shiftDate, weekDates, formatCalendarDate } from '../student-pwa/src/modules/academic/calendar.js';
import { createRevisionPlan, planLimit } from '../student-pwa/src/modules/study/revision.js';
import { avatars, avatarKey, validAvatarId, createAvatarPreference } from '../student-pwa/src/modules/account/avatars.js';

test('calendar validates real dates, leap years and exact ISO formatting', () => {
  assert.ok(parseCalendarDate('2024-02-29'));
  for (const value of ['2025-02-29', '2026-02-31', '2026-13-01', '2026-1-01', '2026-01-00', '2026-01-01T00:00Z', 'NaN', 'javascript:alert(1)']) assert.equal(parseCalendarDate(value), null);
});
test('week navigation preserves Monday-to-Sunday dates across month and year boundaries', () => {
  assert.deepEqual(weekDates('2026-01-01'), ['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']);
  assert.equal(shiftDate('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftDate(shiftDate('2026-11-17', 7), -7), '2026-11-17');
  assert.equal(weekDates('2000-01-01')[0], '1999-12-27');
  assert.equal(formatCalendarDate('2026-11-17'), '17 Nov');
});
test('calendar rejects invalid offsets and dates instead of generating fictitious entries', () => {
  for (const offset of [NaN, Infinity, 1.5, '7', 10000]) assert.throws(() => shiftDate('2026-11-17', offset), RangeError);
  assert.throws(() => weekDates('2026-02-30'), RangeError);
  assert.throws(() => formatCalendarDate('invalid'), RangeError);
});
test('personal revision plan starts empty, normalises text and validates optional dates', () => {
  const plan = createRevisionPlan(); assert.deepEqual(plan.list(), []);
  plan.add('  Review   my notes  ', '2026-11-17');
  assert.deepEqual(plan.list(), [{ id: 1, title: 'Review my notes', dueDate: '2026-11-17', done: false }]);
  for (const value of ['', ' ', 'x'.repeat(121), 'line\nbreak', '\u0000']) assert.throws(() => plan.add(value));
  for (const value of ['2026-02-31', '2026-13-01', '2026-1-01', '1999-12-31', '2201-01-01', 'invalid']) assert.throws(() => plan.add('Personal test reminder', value), RangeError);
});
test('personal task snapshots cannot mutate plan state and completion is based on real actions', () => {
  const plan = createRevisionPlan(); plan.add('Review my notes');
  const snapshot = plan.list(); snapshot[0].title = 'Changed externally'; snapshot.push({ id: 100, title: 'Not stored', done: true, dueDate: '' });
  assert.equal(plan.list().length, 1); assert.equal(plan.list()[0].title, 'Review my notes');
  plan.toggle(1); assert.equal(plan.list()[0].done, true);
  plan.toggle(1); assert.equal(plan.list()[0].done, false);
  plan.remove(1); assert.deepEqual(plan.list(), []);
});
test('personal plan is bounded and isolated between application sessions', () => {
  const plan = createRevisionPlan();
  for (let index = 0; index < planLimit; index++) plan.add(`Personal test reminder ${index}`);
  assert.throws(() => plan.add('Excess test reminder'), RangeError);
  assert.equal(plan.list().length, planLimit);
  assert.deepEqual(createRevisionPlan().list(), [], 'A new session never restores private task data');
});
test('personal plan stores markup as inert text for the safe DOM renderer', () => {
  const plan = createRevisionPlan(); const text = '<img src=x onerror=alert(1)>';
  plan.add(text); assert.equal(plan.list()[0].title, text);
});
function storage(initial = null) {
  const values = new Map(initial === null ? [] : [[avatarKey, initial]]); const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem(key, value) { writes.push([key, value]); values.set(key, value); }, removeItem: key => values.delete(key) };
}
test('curated avatars have 20 unique IDs and never accept arbitrary filenames or role objects', () => {
  assert.equal(avatars.length, 20); assert.equal(new Set(avatars.map(avatar => avatar.id)).size, 20);
  for (const id of [null, {}, '__proto__', '../private', 'https://example.org/photo', 'book.svg', '<script>']) assert.equal(validAvatarId(id), false);
});
test('avatar selection stays in memory unless the user explicitly opts into device saving', () => {
  const device = storage(); const preference = createAvatarPreference(device);
  preference.select('capsule'); assert.deepEqual(device.writes, []);
  preference.remember(true); assert.deepEqual(device.writes, [[avatarKey, 'capsule']]);
  preference.select('atom'); assert.equal(device.values.get(avatarKey), 'atom');
  assert.equal(createAvatarPreference(device).snapshot().selected, 'atom');
  preference.remember(false); assert.equal(device.values.has(avatarKey), false);
  assert.equal(createAvatarPreference(device).snapshot().selected, 'book');
});
test('invalid saved avatar data is ignored and never reflected or used as authorization', () => {
  const preference = createAvatarPreference(storage('{"role":"administrator","avatar":"../private"}'));
  assert.equal(preference.snapshot().selected, 'book'); assert.equal(preference.snapshot().remembered, false);
  assert.throws(() => preference.select('../private'), RangeError);
});
test('denied device storage preserves usable in-memory avatar selection and reports failed saving', () => {
  const device = { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); }, removeItem() { throw new Error('Denied'); } };
  const preference = createAvatarPreference(device); preference.select('flask'); preference.remember(true);
  assert.equal(preference.snapshot().selected, 'flask'); assert.equal(preference.snapshot().remembered, false);
  assert.match(preference.snapshot().message, /could not be saved or cleared/);
  const unavailable = createAvatarPreference(null); unavailable.select('atom'); assert.equal(unavailable.snapshot().selected, 'atom');
});
