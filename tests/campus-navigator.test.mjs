import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

async function load(relative) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { campusRecords, campusSources } = await load('../app/campus-navigator/data.ts');
const { validateCampusData, filterCampusRecords, emptyFilters, selectionForResults, validCoordinates, isMappable, getDirectionsUrl, safeSourceUrl, missingPositionMessage } = await load('../app/campus-navigator/model.ts');

// Synthetic unit fixtures only: these are not campus locations and never ship in the directory.
const sources = [
  { id: 'official-test', title: 'Official test source', url: 'https://example.org/institution', kind: 'official-university', lastChecked: '2026-10-30', access: 'reviewed', evidence: 'Synthetic institutional evidence.' },
  { id: 'geographic-test', title: 'Geographic test source', url: 'https://example.org/geographic', kind: 'geographic-record', lastChecked: '2026-10-30', access: 'reviewed', evidence: 'Synthetic position evidence.' },
];
const record = {
  id: 'test-fixture', name: 'Test fixture', category: 'Campus facility', kind: 'physical-destination', verification: 'verified',
  description: 'Not a real destination. Unit tests only.', faculty: 'Test faculty', department: 'Test department',
  sourceIds: ['official-test'], position: { latitude: 0, longitude: 0, precision: 'entrance', sourceIds: ['geographic-test'], independentlyVerified: true, verifiedOn: '2026-10-30', usableForDirections: true },
  photographs: [], landmarks: [], accessibility: null,
};

test('published data validates without claiming inaccessible sources were reviewed', () => {
  assert.deepEqual(validateCampusData(campusRecords, campusSources), []);
  for (const source of campusSources) {
    assert.ok(source.title && source.url && source.lastChecked);
    if (source.access === 'reviewed') assert.ok(source.evidence);
    if (source.access === 'blocked') assert.equal(source.evidence, null);
  }
});
test('unverified production records never yield markers or directions', () => {
  for (const item of campusRecords.filter(item => item.verification !== 'verified')) {
    assert.equal(isMappable(item, campusSources), false);
    assert.equal(getDirectionsUrl(item, campusSources), null);
  }
  assert.equal(missingPositionMessage, 'Exact campus location awaiting verification.');
});
test('search is case-insensitive and category/department filters compose', () => {
  const data = [record, { ...record, id: 'other', name: 'Other', category: 'University', faculty: null, department: null }];
  assert.deepEqual(filterCampusRecords(data, { ...emptyFilters, query: ' TEST FIXTURE ' }).map(item => item.id), ['test-fixture']);
  assert.equal(filterCampusRecords(data, { ...emptyFilters, faculty: 'Test faculty', department: 'Test department', category: 'Campus facility' }).length, 1);
  assert.equal(filterCampusRecords(data, { ...emptyFilters, category: 'University', department: 'Test department' }).length, 0);
  assert.equal(filterCampusRecords(data, { ...emptyFilters, query: '<script>' }).length, 0);
  assert.equal(filterCampusRecords(data, emptyFilters).length, 2);
});
test('selection remains synchronized across directory/marker selection and empty results', () => {
  assert.equal(selectionForResults(record.id, [record]), record.id);
  assert.equal(selectionForResults('filtered-out', [record]), record.id);
  assert.equal(selectionForResults(record.id, []), null);
  assert.equal(selectionForResults(null, [record]), record.id);
});
for (const [latitude, longitude, expected] of [[0, 0, true], [-90, -180, true], [90, 180, true], [91, 0, false], [0, -181, false], [NaN, 0, false], [Infinity, 0, false], ['0', 0, false], [null, 0, false]]) {
  test(`coordinate validation: ${String(latitude)}, ${longitude}`, () => assert.equal(validCoordinates(latitude, longitude), expected));
}
test('only geographically evidenced, independently verified records are mappable', () => {
  assert.equal(isMappable(record, sources), true);
  for (const item of [
    { ...record, verification: 'candidate' },
    { ...record, position: null },
    { ...record, position: { ...record.position, independentlyVerified: false } },
    { ...record, position: { ...record.position, sourceIds: [] } },
    { ...record, position: { ...record.position, sourceIds: ['official-test'] } },
    { ...record, position: { ...record.position, latitude: 1000 } },
  ]) assert.equal(isMappable(item, sources), false);
  assert.equal(isMappable(record, sources.map(source => ({ ...source, access: 'blocked' }))), false);
});
test('directions are generated from verified numbers on a fixed HTTPS provider', () => {
  const url = new URL(getDirectionsUrl(record, sources));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps/dir/');
  assert.equal(url.searchParams.get('destination'), '0,0');
  assert.equal(getDirectionsUrl({ ...record, position: { ...record.position, precision: 'university' } }, sources), null);
  assert.equal(getDirectionsUrl({ ...record, position: { ...record.position, usableForDirections: false } }, sources), null);
  assert.equal(getDirectionsUrl({ ...record, position: { ...record.position, latitude: 'javascript:alert(1)' } }, sources), null);
});
test('source links reject executable schemes and credential-bearing destinations', () => {
  for (const value of ['javascript:alert(1)', '//example.org', 'http://example.org', 'https://user:password@example.org', 'https://example.org/\npath', 'https://example.org\\path']) assert.equal(safeSourceUrl(value), null);
});
test('data validator detects duplicate IDs, missing citations and unsupported claims', () => {
  assert.ok(validateCampusData([record, record], sources).length);
  assert.ok(validateCampusData([{ ...record, sourceIds: ['absent'] }], sources).length);
  assert.ok(validateCampusData([record], sources.map(source => ({ ...source, access: 'blocked' }))).length);
  assert.ok(validateCampusData([record], sources.map(source => ({ ...source, evidence: null }))).length);
  assert.ok(validateCampusData([{ ...record, position: { ...record.position, precision: 'university' } }], sources).length);
  assert.ok(validateCampusData([{ ...record, landmarks: [{ name: 'Invented', sourceIds: [] }] }], sources).length);
  assert.ok(validateCampusData([{ ...record, photographs: [{ src: 'https://example.org/track.svg', alt: 'Test', sourceId: 'official-test', credit: '', license: '' }] }], sources).length);
});

test('invalid calendar dates and unsupported coordinate precision cannot be verified', () => {
  assert.ok(validateCampusData([record], sources.map(source => ({ ...source, lastChecked: '2026-02-31' }))).length);
  assert.equal(isMappable({ ...record, position: { ...record.position, verifiedOn: '2026-02-31' } }, sources), false);
  assert.equal(isMappable({ ...record, position: { ...record.position, precision: 'guessed' } }, sources), false);
});
test('photographs require a reviewed rights source, not only a plausible local filename', () => {
  const photo = { src: '/campus-navigator/test.jpg', alt: 'Synthetic test', credit: 'Test author', license: 'Test permission', sourceId: 'official-test' };
  assert.deepEqual(validateCampusData([{ ...record, photographs: [photo] }], sources), []);
  assert.ok(validateCampusData([{ ...record, photographs: [photo] }], sources.map(source => ({ ...source, access: 'blocked' }))).length);
});
test('source metadata rejects duplicate identities and non-HTTPS links', () => {
  assert.ok(validateCampusData([record], [...sources, sources[0]]).length);
  assert.ok(validateCampusData([record], sources.map(source => ({ ...source, url: 'javascript:alert(1)' }))).length);
  assert.equal(safeSourceUrl('https:example.org'), null);
});
