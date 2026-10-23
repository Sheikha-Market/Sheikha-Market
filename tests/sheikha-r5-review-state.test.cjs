'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseReview, planImport, applyImport, MAX_IMPORT_BYTES } = require('../core/review/r5-review-state.js');
const source = 'a'.repeat(64), ids = ['RFQ-01', 'RFQ-02', 'AUTH-01'];
const item = (note, state = 'NEEDS_CHANGE') => ({ state, note, updatedAt: '2026-10-18T12:00:00.000Z' });
const envelope = items => ({ schema: 'SHEIKHA_R5_HUMAN_REVIEW_V1', sourceSha256: source, exportedAt: '2026-10-18T12:00:00.000Z', items, publicationApproval: false, testResults: 'NOT_EVALUATED', status: 'DRAFT_REQUIRES_REVIEW' });
const parse = value => parseReview(JSON.stringify(value), source, ids);

test('exported reviews round-trip without changing notes or interpreting markup', () => {
  const input = { 'RFQ-01': item('<script>bad()</script>\nمرئيات'), 'RFQ-02': item('', 'NOT_REVIEWED') };
  assert.deepEqual(parse(envelope(input)), input);
});
test('rejects invalid JSON, wrong schema and mismatched source', () => {
  assert.throws(() => parseReview('not json', source, ids), /INVALID_JSON/);
  for (const value of [[], null, {}, { ...envelope({}), schema: 'catalog' }]) assert.throws(() => parse(value), /INVALID_SCHEMA/);
  assert.throws(() => parse({ ...envelope({}), sourceSha256: 'b'.repeat(64) }), /SOURCE_MISMATCH/);
});
test('rejects publication or test-result escalation and unknown top-level fields', () => {
  for (const patch of [{ publicationApproval: true }, { testResults: 'PASS' }, { status: 'APPROVED' }]) assert.throws(() => parse({ ...envelope({}), ...patch }), /UNSAFE_REVIEW_FLAGS/);
  assert.throws(() => parse({ ...envelope({}), execute: 'command' }), /INVALID_REVIEW/);
});
test('rejects invalid items atomically, including unexpected identifiers and properties', () => {
  for (const invalid of [null, [], {}, { ...item('x'), state: 'PASS' }, { ...item('x'), note: 42 }, { ...item('x'), note: 'x'.repeat(2001) }, { ...item('x'), updatedAt: 'bad' }, { ...item('x'), approved: true }]) {
    assert.throws(() => parse(envelope({ 'RFQ-01': item('valid'), 'RFQ-02': invalid })), /INVALID_ITEM/);
  }
  assert.throws(() => parse(envelope({ 'UNKNOWN-01': item('x') })), /UNKNOWN_CRITERION/);
  assert.throws(() => parse(envelope(JSON.parse('{"__proto__":{"state":"NEEDS_CHANGE","note":"x","updatedAt":null}}'))), /UNKNOWN_CRITERION/);
  for (const invalid of [[], null, 'items']) assert.throws(() => parse(envelope(invalid)), /INVALID_REVIEW/);
});
test('limits the UTF-8 file size before parsing', () => {
  assert.throws(() => parseReview(' '.repeat(MAX_IMPORT_BYTES + 1), source, ids), /IMPORT_TOO_LARGE/);
  assert.throws(() => parseReview('م'.repeat(MAX_IMPORT_BYTES), source, ids), /IMPORT_TOO_LARGE/);
});
test('plans merges without changing the inputs and keeps local conflicts by default', () => {
  const local = { 'RFQ-01': item('Local'), 'AUTH-01': item('Untouched') };
  const incoming = { 'RFQ-01': item('Incoming'), 'RFQ-02': item('New') };
  const before = structuredClone({ local, incoming });
  const plan = planImport(local, incoming), merged = applyImport(plan);
  assert.deepEqual(plan.conflicts, ['RFQ-01']); assert.deepEqual(plan.added, ['RFQ-02']);
  assert.deepEqual(merged.changedIds, ['RFQ-02']); assert.deepEqual(merged.items['RFQ-01'], local['RFQ-01']);
  assert.deepEqual(merged.items['AUTH-01'], local['AUTH-01']);
  assert.deepEqual({ local, incoming }, before);
  merged.items['RFQ-02'].note = 'mutated'; assert.equal(plan.incoming['RFQ-02'].note, 'New');
});
test('explicit conflict choice can replace or clear one entry without replacing other notes', () => {
  const local = { 'RFQ-01': item('Old'), 'AUTH-01': item('Keep') };
  const plan = planImport(local, { 'RFQ-01': item('', 'NOT_REVIEWED') });
  assert.deepEqual(plan.conflicts, ['RFQ-01']);
  const result = applyImport(plan, { 'RFQ-01': 'incoming' });
  assert.equal(result.items['RFQ-01'].note, ''); assert.equal(result.items['AUTH-01'].note, 'Keep');
  assert.throws(() => applyImport(plan, { 'RFQ-01': 'replace-everything' }), /INVALID_CONFLICT_CHOICE/);
});
test('timestamps alone are not conflicts and empty placeholders do not displace meaningful notes', () => {
  const original = item('same'), changedTime = { ...original, updatedAt: '2026-10-19T12:00:00.000Z' };
  const plan = planImport({ 'RFQ-01': original }, { 'RFQ-01': changedTime });
  assert.deepEqual(plan.unchanged, ['RFQ-01']); assert.deepEqual(applyImport(plan).changedIds, []);
  const empty = item('', 'NOT_REVIEWED');
  assert.deepEqual(planImport({}, { 'RFQ-02': empty }).unchanged, ['RFQ-02']);
  assert.deepEqual(planImport({ 'RFQ-02': empty }, { 'RFQ-02': item('New') }).added, ['RFQ-02']);
});
