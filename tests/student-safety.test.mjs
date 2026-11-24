import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync('app/student-safety/content.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { safetyNotice: notice, shouldAutoShow, noticeIsActive, dismissalKey } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const now = Date.parse('2026-11-24T12:00:00+01:00');
test('first visit, matching version and revised versions have distinct eligibility', () => {
  assert.equal(shouldAutoShow(notice, null, now), true);
  assert.equal(shouldAutoShow(notice, `${notice.id}:${notice.version}`, now), false);
  assert.equal(shouldAutoShow(notice, `${notice.id}:previous`, now), true);
  assert.equal(shouldAutoShow({...notice, version:'next'}, `${notice.id}:${notice.version}`, now), true);
  assert.ok(dismissalKey && !dismissalKey.includes('token'));
});
test('unpublished, future, expired and invalid date notices fail closed', () => {
  for (const changes of [{status:'draft'},{status:'archived'},{publishedAt:'2027-01-01'},{expiresAt:'2026-11-23'},{publishedAt:'invalid'},{expiresAt:'invalid'}]) {
    assert.equal(noticeIsActive({...notice,...changes}, now), false);
  }
});
test('content distinguishes owner-confirmed departmental procedures from university fees', () => {
  const text = notice.sections.flatMap(s=>s.paragraphs).join(' ');
  assert.match(text,/handled physically at the department/);
  assert.match(text,/receipt arrangements/);
  assert.match(text,/official portals where applicable/);
  assert.match(text,/membership-dues and Student Ads transactions are distinct/);
  assert.match(text,/Do not publish private information/);
  assert.equal(notice.sections.length,5);
  assert.deepEqual(notice.links.map(l=>l.href),['/contact','https://unilesa.edu.ng/']);
});
