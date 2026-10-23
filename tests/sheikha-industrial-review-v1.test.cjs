'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { createFederationStore } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createFederationArchive } = require('../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationReviews, REVIEW_LIMITS } = require('../core/industrial/sheikha-industrial-review-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = { name: 'مراجعة تجمع شيخة', templateId: 'food', clusters: 1,
  foundriesPerCluster: 1, factoriesPerCluster: 1, linesPerFactory: 1, farmsPerCluster: 1 };
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-review-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const archiveRoot = path.join(temp, 'archive'), root = path.join(temp, 'review');
  const store = createFederationStore(), archive = createFederationArchive({ root: archiveRoot });
  let run = store.create(config); run = store.act(run.id, { command: 'start', expectedRevision: 0 });
  while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', steps: 5, expectedRevision: run.revision });
  const record = archive.save(run), reviews = createFederationReviews({ archive, root });
  return { temp, root, archiveRoot, store, archive, record, reviews };
}
const input = (expectedRevision = 0, patch = {}) => ({ expectedRevision, requestId: randomUUID(),
  targetId: 'federation', decision: 'COMMENT', note: 'ملاحظة اختبار محلية فقط', ...patch });

test('review starts lazily, stays separate from immutable archive, and restores after service recreation', t => {
  const { root, archive, record, reviews } = fixture(t);
  const initial = reviews.read(record.id);
  assert.equal(initial.revision, 0); assert.equal(initial.targets.length, 5);
  assert.equal(fs.existsSync(root), false);
  const result = reviews.append(record.id, input());
  assert.equal(result.revision, 1); assert.equal(result.targets[0].status, 'PENDING');
  assert.equal(result.policy.reviewerIdentityVerified, false); assert.equal(result.policy.approvalGranted, false);
  assert.deepEqual(archive.read(record.id), record);
  assert.deepEqual(createFederationReviews({ archive, root }).read(record.id), result);
  assert.equal(fs.statSync(root).mode & 0o777, 0o700);
  assert.equal(fs.statSync(path.join(root, `${record.id}.json`)).mode & 0o777, 0o600);
});

test('artifact review decisions, comments and reopening never approve production or other targets', t => {
  const { reviews, record, archive, store } = fixture(t), id = record.id;
  const targetId = record.snapshot.artifacts[0].id;
  reviews.append(id, input(0, { targetId, decision: 'CHANGES_REQUESTED' }));
  reviews.append(id, input(1, { targetId, decision: 'COMMENT' }));
  assert.equal(reviews.read(id).targets.find(t => t.id === targetId).status, 'CHANGES_REQUESTED');
  reviews.append(id, input(2, { targetId, decision: 'CONCEPT_REVIEWED' }));
  let view = reviews.append(id, input(3, { decision: 'CONCEPT_REVIEWED' }));
  assert.equal(view.targets.filter(t => t.status === 'CONCEPT_REVIEWED').length, 2);
  view = reviews.append(id, input(4, { targetId, decision: 'REOPENED' }));
  assert.equal(view.targets.find(t => t.id === targetId).status, 'PENDING');
  assert.throws(() => reviews.append(id, input(5, { targetId, decision: 'REOPENED' })), /STATE_CONFLICT/);
  assert.equal(reviews.read(id).revision, 5);
  assert.deepEqual(archive.read(id), record); assert.equal(store.read(record.snapshot.id).boundaries.productionReady, false);
  assert.equal(view.policy.physicalExecutionEnabled, false); assert.equal(view.policy.publicationEnabled, false);
});

test('revision checks and stable request identifiers avoid lost updates and duplicate comments', t => {
  const { reviews, record, archive, root } = fixture(t);
  const other = createFederationReviews({ archive, root }), body = input();
  const first = reviews.append(record.id, body);
  assert.deepEqual(other.append(record.id, body), first);
  assert.throws(() => other.append(record.id, input()), /REVISION_CONFLICT/);
  assert.throws(() => other.append(record.id, { ...body, note: 'different note' }), /REQUEST_CONFLICT/);
  other.append(record.id, input(1));
  assert.equal(reviews.append(record.id, body).revision, 2);
  assert.equal(reviews.read(record.id).events.length, 2);
});

test('invalid targets, input shape, notes and approval claims cannot enter the review journal', t => {
  const { reviews, record, root } = fixture(t);
  for (const patch of [{ targetId: '../secret' }, { targetId: 'constructor' }, { decision: 'APPROVED' },
    { humanApproved: true }, { reviewer: 'Codex' }, { expectedRevision: '0' }, { expectedRevision: -1 },
    { note: '  ' }, { note: 'x'.repeat(1001) }, { note: 'abc\u0000' }, { requestId: '../not-a-uuid' }, { path: 'secret' }]) {
    assert.throws(() => reviews.append(record.id, input(0, patch)), /INPUT_REJECTED/);
  }
  assert.equal(fs.existsSync(root), false);
  assert.throws(() => reviews.read('a'.repeat(64)), /ARCHIVE_NOT_FOUND/);
});

test('corrupt chains and policy changes fail closed without rewriting the journal', t => {
  const { reviews, record, root } = fixture(t);
  reviews.append(record.id, input()); reviews.append(record.id, input(1));
  const file = path.join(root, `${record.id}.json`), good = fs.readFileSync(file, 'utf8');
  for (const mutate of [j => j.events.reverse(), j => { j.events[0].note = 'changed'; },
    j => { j.policy.approvalGranted = true; }, j => { j.events[1].previousHash = null; },
    j => { j.archiveId = 'f'.repeat(64); }, j => { j.events = []; }]) {
    const changed = JSON.parse(good); mutate(changed); const bytes = JSON.stringify(changed);
    fs.writeFileSync(file, bytes);
    assert.throws(() => reviews.read(record.id), /RECORD_REJECTED/);
    assert.throws(() => reviews.append(record.id, input(2)), /RECORD_REJECTED/);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
  }
});

test('untrusted filesystem objects and a corrupted source archive prevent review reads and writes', t => {
  const { reviews, record, root, archiveRoot, temp } = fixture(t);
  reviews.append(record.id, input()); const file = path.join(root, `${record.id}.json`);
  fs.chmodSync(file, 0o644); assert.throws(() => reviews.read(record.id), /RECORD_REJECTED/);
  fs.chmodSync(file, 0o600); const original = fs.readFileSync(file);
  const other = path.join(temp, 'other'); fs.writeFileSync(other, original, { mode: 0o600 });
  fs.unlinkSync(file); fs.symlinkSync(other, file);
  assert.throws(() => reviews.append(record.id, input(1)), /RECORD_REJECTED/);
  fs.unlinkSync(file); fs.linkSync(other, file);
  assert.throws(() => reviews.read(record.id), /RECORD_REJECTED/);
  fs.unlinkSync(file); fs.writeFileSync(file, original, { mode: 0o600 });
  fs.writeFileSync(path.join(archiveRoot, `${record.id}.json`), 'BROKEN_ARCHIVE');
  assert.throws(() => reviews.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  assert.throws(() => reviews.append(record.id, input(1)), /ARCHIVE_RECORD_REJECTED/);
  assert.deepEqual(fs.readFileSync(file), original);
});

test('failed disk writes preserve previous history and release the lock', t => {
  const { reviews, record, root } = fixture(t);
  const before = reviews.append(record.id, input());
  t.mock.method(fs, 'fsyncSync', () => { throw Error('DISK_FAILURE_SENTINEL'); });
  assert.throws(() => reviews.append(record.id, input(1)), /DISK_FAILURE_SENTINEL/);
  t.mock.restoreAll();
  assert.deepEqual(reviews.read(record.id), before);
  assert.deepEqual(fs.readdirSync(root), [`${record.id}.json`]);
  assert.equal(reviews.append(record.id, input(1)).revision, 2);
});

test('journal limit preserves all events and still permits an exact retry at capacity', t => {
  const { reviews, record } = fixture(t);
  let last;
  for (let i = 0; i < REVIEW_LIMITS.events; i++) {
    last = input(i, { note: '\u4e00'.repeat(REVIEW_LIMITS.noteChars) }); reviews.append(record.id, last);
  }
  const full = reviews.read(record.id);
  assert.equal(full.revision, REVIEW_LIMITS.events);
  assert.deepEqual(reviews.append(record.id, last), full);
  assert.throws(() => reviews.append(record.id, input(REVIEW_LIMITS.events)), /CAPACITY_LIMIT/);
});

test('no review or approval is inherited by a different saved revision or generation', t => {
  const { store, archive, reviews, record } = fixture(t);
  reviews.append(record.id, input(0, { decision: 'CONCEPT_REVIEWED' }));
  const reset = store.act(record.snapshot.id, { command: 'reset', expectedRevision: record.snapshot.revision });
  const newRecord = archive.save(reset);
  assert.equal(reviews.read(newRecord.id).revision, 0);
  assert.equal(reviews.read(newRecord.id).targets[0].status, 'PENDING');
});

test('HTTP review routes require session and origin, reject stale requests and survive a server restart', async t => {
  const { root, archiveRoot, record } = fixture(t);
  let server, base, token;
  const api = '/api/sheikha/workspace/v1';
  const start = async () => {
    server = createWorkspaceServer({ federation: { archive: { root: archiveRoot }, reviews: { root } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    token = (await (await fetch(base + api + '/session')).json()).token;
  };
  const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  t.after(async () => { if (server.listening) await stop(); });
  const url = `/industry/archives/${record.id}/reviews`;
  const get = (headers = {}) => fetch(base + api + url, { headers: { 'X-Sheikha-Session': token, ...headers } });
  const post = (body, headers = {}) => fetch(base + api + url, { method: 'POST',
    headers: { 'X-Sheikha-Session': token, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  await start();
  assert.equal((await get({ 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await post(input(), { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await post(input(), { 'X-Sheikha-Session': '' })).status, 403);
  const rejected = await post(input(0, { secret: 'SECRET_SENTINEL' }));
  assert.equal(rejected.status, 400); assert.equal((await rejected.text()).includes('SECRET_SENTINEL'), false);
  const body = input(), saved = await (await post(body)).json();
  assert.equal(saved.revision, 1); assert.deepEqual(await (await post(body)).json(), saved);
  assert.equal((await post(input())).status, 409);
  await stop(); await start(); assert.deepEqual(await (await get()).json(), saved);
  assert.equal((await fetch(`${base}/runtime/industrial-federation-reviews/v1/${record.id}.json`)).status, 404);
  const raw = fs.readFileSync(path.join(root, `${record.id}.json`));
  fs.writeFileSync(path.join(root, `${record.id}.json`), 'SECRET_SENTINEL');
  const bad = await get(); assert.equal(bad.status, 422); assert.equal((await bad.text()).includes('SECRET_SENTINEL'), false);
  fs.writeFileSync(path.join(root, `${record.id}.json`), raw);
  assert.equal((await get()).status, 200);
});
