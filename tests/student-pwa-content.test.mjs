import test from 'node:test';
import assert from 'node:assert/strict';
import { academicSourceUrl, driveResourceUrl, courseProposal, resourceProposal, eventProposal, academicFileDescriptor, createAcademicPreparation } from '../student-pwa/src/modules/academic/models.js';

// Abstract test metadata only. Never imported by the app or shipped as records.
const course = { code: 'TEST101', title: 'Unit fixture — not an institutional course', units: 2, level: 100, description: '', sourceUrl: 'https://example.invalid/evidence' };
const drive = 'https://drive.google.com/file/d/test_resource_identifier_01/view';
const resource = { courseId: 1, title: 'Unit fixture resource', category: 'lecture-note', url: drive, description: '' };
const event = { courseId: 1, title: 'Unit fixture event', kind: 'class', date: '2026-11-17', start: '09:00', end: '10:00', sourceUrl: course.sourceUrl };

test('academic source references reject executable/credential/port/control URL tricks', () => {
  for (const value of ['javascript:alert(1)', '//example.invalid', 'http://example.invalid', 'https://user:pass@example.invalid', 'https://example.invalid:8443', 'https://example.invalid/\n', 'https://example.invalid/%0a', 'https://example.invalid/%250d', 'https://example.invalid/%25250a', 'https://example.invalid/%252525250a', 'https://example.invalid/\\evil']) assert.equal(academicSourceUrl(value), null);
  assert.equal(academicSourceUrl('https://example.invalid/notes%20reference'), 'https://example.invalid/notes%20reference');
});
test('Drive resources require precise provider host and direct resource paths', () => {
  assert.equal(driveResourceUrl(drive + '?usp=sharing&continue=https://example.invalid/#track'), drive);
  assert.equal(driveResourceUrl('https://docs.google.com/presentation/d/test_resource_identifier_01/edit'), 'https://docs.google.com/presentation/d/test_resource_identifier_01/edit');
  assert.equal(driveResourceUrl(drive + '?resourcekey=example_key'), drive + '?resourcekey=example_key');
  for (const value of [drive.replace('drive.google.com', 'drive.google.com.evil.invalid'), 'https://drive.google.com/redirect?url=evil', 'https://docs.google.com/unknown/d/test_resource_identifier_01/edit', drive + '?resourcekey=%22bad', drive.replace('test_resource_identifier_01', '../private')]) assert.equal(driveResourceUrl(value), null);
});
test('course proposal validates bounded metadata and rejects caller review/role claims', () => {
  assert.equal(courseProposal({ ...course, code: 'test101' }).code, 'TEST101');
  for (const changes of [{ units: 1.5 }, { units: 11 }, { level: 400 }, { level: '100' }, { title: '' }, { description: 'x'.repeat(1201) }, { sourceUrl: 'javascript:alert(1)' }, { approved: true }, { role: 'administrator' }]) assert.throws(() => courseProposal({ ...course, ...changes }));
});
test('resources validate known categories and require safe external destinations', () => {
  assert.equal(resourceProposal(resource).url, drive);
  for (const changes of [{ category: '__proto__' }, { category: 'unknown' }, { url: 'data:text/html,bad' }, { title: '' }, { description: 'x'.repeat(801) }, { verification: 'approved' }]) assert.throws(() => resourceProposal({ ...resource, ...changes }));
});
test('schedule validates actual dates, times and same-day end ordering', () => {
  assert.equal(eventProposal(event).end, '10:00');
  for (const changes of [{ date: '2026-02-30' }, { date: '2300-01-01' }, { start: '24:00' }, { start: '9:00' }, { end: '08:59' }, { end: '' }, { kind: 'unapproved-kind' }, { published: true }]) assert.throws(() => eventProposal({ ...event, ...changes }));
  assert.equal(eventProposal({ ...event, kind: 'assignment', end: '' }).end, '');
});
test('proposed file descriptors reject spoofed types, macros, paths and oversized declarations', () => {
  assert.equal(academicFileDescriptor({ name: 'unit fixture.pdf', type: 'application/pdf', size: 100 }).name, 'unit-fixture.pdf');
  for (const name of ['../fixture.pdf', '/fixture.pdf', 'C:\\fixture.pdf', '.fixture.pdf', 'fixture..pdf', 'fixture.svg', 'fixture.html', 'fixture.docm']) assert.throws(() => academicFileDescriptor({ name, type: 'application/pdf', size: 100 }));
  for (const changes of [{ size: 0 }, { size: NaN }, { size: 10 * 1024 * 1024 + 1 }, { size: '100' }, { type: 'text/html' }]) assert.throws(() => academicFileDescriptor({ name: 'fixture.pdf', type: 'application/pdf', size: 100, ...changes }));
});
test('academic preparation starts empty and cannot promote data to verified publication', () => {
  const store = createAcademicPreparation(); assert.deepEqual(store.list(), { courses: [], resources: [], events: [], topics: [], selected: 0 });
  store.addCourse(course); store.addResource(resource); store.addEvent(event);
  for (const item of [...store.list().courses, ...store.list().resources, ...store.list().events]) assert.equal(item.status, 'local-unreviewed');
});
test('preparation rejects orphan resources and duplicate course-level proposals', () => {
  const store = createAcademicPreparation(); assert.throws(() => store.addResource(resource)); store.addCourse(course);
  assert.throws(() => store.addCourse(course)); assert.throws(() => store.addResource({ ...resource, courseId: 999 })); assert.throws(() => store.addEvent({ ...event, courseId: 999 }));
});
test('class/examination conflicts are checked across courses in the same proposed level', () => {
  const store = createAcademicPreparation(); const first = store.addCourse(course); const second = store.addCourse({ ...course, code: 'TEST102' });
  store.addEvent({ ...event, courseId: first });
  assert.throws(() => store.addEvent({ ...event, courseId: second, start: '09:30', end: '10:30', kind: 'examination' }), /Conflicting/);
  store.addEvent({ ...event, courseId: second, start: '10:00', end: '11:00' });
  store.addEvent({ ...event, courseId: second, kind: 'assignment', end: '' });
  const otherLevel = store.addCourse({ ...course, level: 200 }); store.addEvent({ ...event, courseId: otherLevel });
  assert.equal(store.list().events.length, 4);
});
test('snapshots cannot mutate proposals and new application sessions restore no records', () => {
  const store = createAcademicPreparation(); store.addCourse(course); store.list().courses[0].status = 'verified';
  assert.equal(store.list().courses[0].status, 'local-unreviewed'); assert.equal(createAcademicPreparation().list().courses.length, 0);
});
test('removing a local course removes only its dependent local metadata', () => {
  const store = createAcademicPreparation(); const first = store.addCourse(course); store.addResource({ ...resource, courseId: first }); store.addEvent({ ...event, courseId: first });
  const other = store.addCourse({ ...course, code: 'TEST102' }); store.select(first); store.remove('course', first);
  assert.deepEqual(store.list().resources, []); assert.deepEqual(store.list().events, []); assert.equal(store.list().selected, 0); assert.equal(store.list().courses[0].id, other);
});
test('metadata input is inert text rather than parsed HTML', () => {
  const title = '<img src=x onerror=alert(1)>'; assert.equal(courseProposal({ ...course, title }).title, title);
});
