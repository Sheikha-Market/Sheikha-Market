'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { once } = require('node:events');
const { createFederationStore, LIMITS } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createFederationArchive, ARCHIVE_LIMITS } = require('../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationReviews } = require('../core/industrial/sheikha-industrial-review-v1.cjs');
const { createFederationImprovements, openRequests, IMPROVEMENT_LIMITS } = require('../core/industrial/sheikha-industrial-improvement-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = { name: 'اختبار تجربة تعديل شيخة', templateId: 'food', clusters: 2,
  foundriesPerCluster: 2, factoriesPerCluster: 2, linesPerFactory: 2, farmsPerCluster: 2 };
const finish = (store, run) => {
  run = store.act(run.id, { command: 'start', expectedRevision: run.revision });
  while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', expectedRevision: run.revision, steps: 5 });
  return run;
};
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-derive-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
  let now = Date.now();
  const store = createFederationStore({ now: () => now });
  const archive = createFederationArchive({ root: archiveRoot });
  const source = finish(store, store.create(config)), saved = archive.save(source);
  const reviews = createFederationReviews({ archive, root: reviewRoot });
  const append = (decision = 'CHANGES_REQUESTED', targetId = 'federation', note = 'تجربة تقليل عدد الخطوط للمقارنة فقط') =>
    reviews.append(saved.id, { expectedRevision: reviews.read(saved.id).revision, requestId: randomUUID(), targetId, decision, note });
  append();
  const improvements = createFederationImprovements({ store, archive, reviews, now: () => now });
  const input = (patch = {}) => {
    const r = reviews.read(saved.id);
    return { requestId: randomUUID(), expectedReviewRevision: r.revision, expectedReviewChainHead: r.chainHead,
      requestIds: openRequests(r).map(e => e.requestId), config: { ...config, linesPerFactory: 1 },
      intent: 'مقارنة تكوين أقل خطوطًا دون ادعاء كفاءة مثبتة', ...patch };
  };
  return { store, archive, reviews, improvements, source, saved, append, input, archiveRoot, reviewRoot,
    advance: ms => { now += ms; } };
}

test('derived run is fresh, preserves source evidence, and cannot inherit review or production approval', t => {
  const f = fixture(t), journal = f.reviews.read(f.saved.id), body = f.input();
  const child = f.improvements.derive(f.saved.id, body);
  assert.notEqual(child.id, f.source.id);
  assert.equal(child.state, 'READY'); assert.equal(child.tick, 0); assert.equal(child.revision, 0); assert.equal(child.generation, 0);
  assert.deepEqual(child.artifacts, []); assert.deepEqual(child.events, []);
  assert.equal(child.derivation.sourceArchiveId, f.saved.id); assert.deepEqual(child.derivation.baselineConfig, config);
  assert.equal(child.derivation.requests[0].note, journal.events[0].note);
  assert.equal(child.derivation.approvalInherited, false); assert.equal(child.derivation.improvementVerified, false);
  assert.equal(child.boundaries.physicalCommandSent, false); assert.equal(child.boundaries.productionReady, false);
  assert.deepEqual(f.store.read(f.source.id), f.source); assert.deepEqual(f.archive.read(f.saved.id), f.saved);
  assert.deepEqual(f.reviews.read(f.saved.id), journal);
  child.derivation.requests[0].note = 'MUTATED'; body.config.clusters = 4;
  assert.equal(f.store.read(child.id).derivation.requests[0].note, journal.events[0].note);
  assert.equal(f.store.read(child.id).config.clusters, 2);
});

test('source revision and chain head must match; only latest still-open change requests are selectable', t => {
  const f = fixture(t), stale = f.input(); f.append('COMMENT');
  assert.throws(() => f.improvements.derive(f.saved.id, stale), /REVIEW_CONFLICT/);
  assert.throws(() => f.improvements.derive(f.saved.id, f.input({ expectedReviewChainHead: '0'.repeat(64) })), /REVIEW_CONFLICT/);
  const original = f.input().requestIds[0]; f.append();
  assert.throws(() => f.improvements.derive(f.saved.id, f.input({ requestIds: [original] })), /REQUEST_CLOSED/);
  f.append('CONCEPT_REVIEWED');
  assert.throws(() => f.improvements.derive(f.saved.id, f.input({ requestIds: [original] })), /REQUEST_CLOSED/);
  const other = f.source.artifacts[0].id; f.append('CHANGES_REQUESTED', other); f.append('COMMENT', other);
  const child = f.improvements.derive(f.saved.id, f.input());
  assert.equal(child.derivation.requests.length, 1); assert.equal(child.derivation.requests[0].targetId, other);
});

test('strict inputs reject unbounded changes, sector swaps, unchanged counts, forged evidence and extra permissions', t => {
  const f = fixture(t), base = f.input();
  for (const patch of [{ config }, { config: { ...config, name: 'اسم جديد فقط' } },
    { config: { ...config, templateId: 'energy', clusters: 3 } }, { config: { ...config, clusters: 5 } },
    { config: { ...config, clusters: '3' } }, { approval: true }, { path: '/tmp/target' },
    { sourceNotes: ['forged'] }, { requestId: '../bad' }, { requestIds: [] }, { requestIds: Array(9).fill(base.requestIds[0]) },
    { requestIds: [base.requestIds[0], base.requestIds[0]] }, { requestIds: [null] },
    { intent: '  ' }, { intent: 'x'.repeat(1001) }, { intent: 'abc\u0000' }, { expectedReviewRevision: '1' }]) {
    assert.throws(() => f.improvements.derive(f.saved.id, { ...base, ...patch }), /INPUT_REJECTED/);
  }
  assert.throws(() => f.improvements.derive(f.saved.id, f.input({ requestIds: [randomUUID()] })), /REQUEST_CLOSED/);
  assert.throws(() => f.improvements.read(base.requestId), /NOT_FOUND/);
  assert.throws(() => f.store.createDerived(config, null), /INPUT_REJECTED/);
});

test('same-process retries recover exactly one child and never recreate expired or discarded runs', t => {
  const f = fixture(t), input = f.input(), child = f.improvements.derive(f.saved.id, input);
  const running = f.store.act(child.id, { command: 'start', expectedRevision: 0 });
  f.append('CONCEPT_REVIEWED');
  assert.deepEqual(f.improvements.derive(f.saved.id, input), running);
  assert.deepEqual(f.improvements.read(input.requestId), running);
  assert.throws(() => f.improvements.derive(f.saved.id, { ...input, intent: 'طلب مختلف بنفس المعرف' }), /REQUEST_CONFLICT/);
  f.store.discard(child.id, { expectedRevision: running.revision });
  assert.throws(() => f.improvements.derive(f.saved.id, input), /EXPIRED/);
  f.append(); const body = f.input(); f.improvements.derive(f.saved.id, body); f.advance(LIMITS.ttlMs);
  assert.throws(() => f.improvements.read(body.requestId), /EXPIRED/);
  assert.throws(() => f.improvements.derive(f.saved.id, body), /EXPIRED/);
});

test('process dedup quota is bounded without eviction, and failed run capacity does not consume a request', t => {
  const f = fixture(t), children = [];
  for (let i = 0; i < 7; i++) children.push(f.improvements.derive(f.saved.id, f.input()));
  const body = f.input(); assert.throws(() => f.improvements.derive(f.saved.id, body), /SIMULATION_CAPACITY_LIMIT/);
  assert.throws(() => f.improvements.read(body.requestId), /NOT_FOUND/);
  for (const child of children) f.store.discard(child.id, { expectedRevision: 0 });
  let last, lastInput;
  for (let i = 7; i < IMPROVEMENT_LIMITS.requestsPerProcess; i++) {
    lastInput = i === 7 ? body : f.input(); last = f.improvements.derive(f.saved.id, lastInput);
    if (i < IMPROVEMENT_LIMITS.requestsPerProcess - 1) f.store.discard(last.id, { expectedRevision: 0 });
  }
  assert.deepEqual(f.improvements.derive(f.saved.id, lastInput), last);
  assert.throws(() => f.improvements.derive(f.saved.id, f.input()), /DERIVATION_CAPACITY_LIMIT/);
});

test('largest derived archive fits the existing quota, remains immutable and starts a separate review journal', t => {
  const f = fixture(t);
  for (const artifact of f.source.artifacts.slice(0, 8)) f.append('CHANGES_REQUESTED', artifact.id, '\u4e00'.repeat(1000));
  const base = f.input(), body = { ...base, requestIds: base.requestIds.slice(1), intent: '\u4e00'.repeat(1000),
    config: { ...config, clusters: 4, foundriesPerCluster: 3, factoriesPerCluster: 3, linesPerFactory: 3, farmsPerCluster: 3 } };
  assert.throws(() => f.improvements.derive(f.saved.id, base), /INPUT_REJECTED/);
  const child = finish(f.store, f.improvements.derive(f.saved.id, body));
  assert.equal(child.artifacts.length, 64);
  const saved = f.archive.save(child);
  assert.ok(Buffer.byteLength(JSON.stringify(saved)) < ARCHIVE_LIMITS.bytes);
  assert.equal(f.reviews.read(saved.id).revision, 0);
  assert.ok(f.reviews.read(saved.id).targets.every(target => target.status === 'PENDING'));
  assert.deepEqual(createFederationArchive({ root: f.archiveRoot }).read(saved.id), saved);
  const reset = f.store.act(child.id, { command: 'reset', expectedRevision: child.revision });
  assert.deepEqual(reset.derivation, child.derivation); assert.equal(reset.generation, 1);
  assert.deepEqual(f.archive.read(f.saved.id), f.saved);
  for (const patch of [{ approvalInherited: true }, { improvementVerified: true }, { extra: true }, { requests: [] }, { sourceRunId: child.id }]) {
    assert.throws(() => f.archive.save({ ...child, derivation: { ...child.derivation, ...patch } }), /ARCHIVE_INPUT_REJECTED/);
  }
  const altered = structuredClone(child); altered.derivation.approvalInherited = true;
  const id = createHash('sha256').update(JSON.stringify(altered)).digest('hex');
  fs.writeFileSync(path.join(f.archiveRoot, `${id}.json`), JSON.stringify({ ...saved, id, snapshotSha256: id, snapshot: altered }), { mode: 0o600 });
  assert.throws(() => f.archive.read(id), /ARCHIVE_RECORD_REJECTED/);
});

test('invalid persisted source evidence prevents new experiments, without rewriting the archive or journal', t => {
  const f = fixture(t), body = f.input();
  const file = path.join(f.reviewRoot, `${f.saved.id}.json`), before = fs.readFileSync(file);
  fs.writeFileSync(file, 'broken');
  assert.throws(() => f.improvements.derive(f.saved.id, body), /REVIEW_RECORD_REJECTED/);
  assert.throws(() => f.improvements.read(body.requestId), /NOT_FOUND/);
  assert.deepEqual(f.archive.read(f.saved.id), f.saved);
  fs.writeFileSync(file, before); fs.writeFileSync(path.join(f.archiveRoot, `${f.saved.id}.json`), 'broken');
  assert.throws(() => f.improvements.derive(f.saved.id, body), /ARCHIVE_RECORD_REJECTED/);
  assert.deepEqual(fs.readFileSync(file), before);
});

test('derivation holds the review writer lock and never bypasses an occupied or stale lock', t => {
  const f = fixture(t), body = f.input(), lock = path.join(f.reviewRoot, '.write-lock');
  fs.mkdirSync(lock, { mode: 0o700 });
  assert.throws(() => f.improvements.derive(f.saved.id, body), /REVIEW_BUSY/);
  assert.equal(fs.existsSync(lock), true); assert.throws(() => f.improvements.read(body.requestId), /NOT_FOUND/);
  fs.rmdirSync(lock);
  const original = f.store.createDerived;
  t.mock.method(f.store, 'createDerived', (config, derivation) => {
    assert.equal(fs.existsSync(lock), true);
    assert.throws(() => f.append('CONCEPT_REVIEWED'), /REVIEW_BUSY/);
    return original(config, derivation);
  });
  const child = f.improvements.derive(f.saved.id, body);
  assert.equal(child.state, 'READY'); assert.equal(fs.existsSync(lock), false);
  assert.equal(f.reviews.read(f.saved.id).revision, 1);
});

test('derive and recovery HTTP routes enforce session/origin and do not restart runs after process recreation', async t => {
  const f = fixture(t), api = '/api/sheikha/workspace/v1';
  let server, base, token;
  const start = async () => {
    server = createWorkspaceServer({ federation: { archive: { root: f.archiveRoot }, reviews: { root: f.reviewRoot } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    token = (await (await fetch(base + api + '/session')).json()).token;
  };
  const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  t.after(async () => { if (server?.listening) await stop(); });
  const post = (suffix, body, headers = {}) => fetch(base + api + suffix, { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token, ...headers }, body: JSON.stringify(body) });
  const get = (suffix, headers = {}) => fetch(base + api + suffix, { headers: { 'X-Sheikha-Session': token, ...headers } });
  await start(); const body = f.input(), endpoint = `/industry/archives/${f.saved.id}/derive`, recovery = `/industry/derivations/${body.requestId}`;
  assert.equal((await post(endpoint, body, { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await post(endpoint, body, { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await get(recovery, { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await get(recovery)).status, 404);
  assert.equal((await post(endpoint, { ...body, secret: 'SECRET_SENTINEL' })).status, 400);
  const response = await post(endpoint, body); assert.equal(response.status, 200); const child = await response.json();
  assert.equal(child.state, 'READY'); assert.deepEqual(await (await post(endpoint, body)).json(), child);
  assert.deepEqual(await (await get(recovery)).json(), child);
  const saved = await (await post(`/industry/simulations/${child.id}/archive`, { expectedRevision: 0 })).json();
  await stop(); await start();
  assert.equal((await get(recovery)).status, 404);
  assert.equal((await get(`/industry/simulations/${child.id}`)).status, 404);
  assert.deepEqual((await (await get(`/industry/archives/${saved.id}`)).json()).snapshot, child);
  assert.equal((await (await get(`/industry/archives/${saved.id}/reviews`)).json()).revision, 0);
  assert.equal((await fetch(`${base}/core/industrial/sheikha-industrial-improvement-v1.cjs`)).status, 404);
});
