'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { createFederationStore } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createFederationArchive } = require('../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationReviews } = require('../core/industrial/sheikha-industrial-review-v1.cjs');
const { createFederationImprovements } = require('../core/industrial/sheikha-industrial-improvement-v1.cjs');
const { createFederationComparisons } = require('../core/industrial/sheikha-industrial-comparison-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = { name: 'اختبار مقارنة تجمع شيخة', templateId: 'food', clusters: 2,
  foundriesPerCluster: 2, factoriesPerCluster: 2, linesPerFactory: 2, farmsPerCluster: 2 };
function advance(store, run) {
  if (run.state === 'READY') run = store.act(run.id, { command: 'start', expectedRevision: run.revision });
  while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', expectedRevision: run.revision, steps: 5 });
  return run;
}
function fixture(t, { completeSource = true } = {}) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-compare-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
  const store = createFederationStore(), archive = createFederationArchive({ root: archiveRoot });
  let source = store.create(config); if (completeSource) source = advance(store, source);
  const original = archive.save(source), reviews = createFederationReviews({ archive, root: reviewRoot });
  const review = reviews.append(original.id, { expectedRevision: 0, requestId: randomUUID(), targetId: 'federation',
    decision: 'CHANGES_REQUESTED', note: 'طلب اختبار تكوين أقل خطوطًا دون إثبات كفاءة' });
  const improvements = createFederationImprovements({ store, archive, reviews });
  const child = improvements.derive(original.id, { requestId: randomUUID(), expectedReviewRevision: review.revision,
    expectedReviewChainHead: review.chainHead, requestIds: [review.events[0].requestId],
    config: { ...config, name: 'نسخة اختبار معدلة', linesPerFactory: 1 }, intent: 'مقارنة الأعداد في المحاكاة فقط' });
  return { temp, archiveRoot, reviewRoot, store, archive, reviews, source, original, child, review,
    comparisons: createFederationComparisons({ archive }) };
}
const metric = (report, key) => report.metrics.find(item => item.key === key);

test('completed snapshots produce deterministic neutral deltas without writes, inherited approval or live execution', t => {
  const f = fixture(t), child = advance(f.store, f.child), candidate = f.archive.save(child);
  const beforeFiles = fs.readdirSync(f.archiveRoot).map(file => [file, fs.readFileSync(path.join(f.archiveRoot, file), 'utf8')]);
  const report = f.comparisons.read(candidate.id);
  assert.equal(report.basis.status, 'BOTH_COMPLETE'); assert.equal(report.basis.sameTick, true);
  assert.deepEqual(metric(report, 'steps'), { key: 'steps', source: 30, candidate: 30, delta: 0 });
  assert.deepEqual(metric(report, 'emittedArtifacts'), { key: 'emittedArtifacts', source: 18, candidate: 14, delta: -4 });
  assert.equal(metric(report, 'missingArtifacts').candidate, 0); assert.equal(metric(report, 'lineArtifacts').delta, -4);
  assert.equal(report.configuration.find(r => r.key === 'linesPerFactory').delta, -1);
  assert.equal(report.source.archiveId, f.original.id); assert.equal(report.candidate.archiveId, candidate.id);
  assert.equal(report.policy.improvementVerified, false); assert.equal(report.policy.causalEffectEstablished, false);
  assert.equal(report.policy.approvalGranted, false); assert.equal(report.policy.requestsAutomaticallyResolved, false);
  assert.equal(report.policy.physicalExecutionEnabled, false); assert.equal(report.policy.publicationEnabled, false);
  assert.deepEqual(f.store.read(child.id), child); assert.deepEqual(f.reviews.read(f.original.id), f.review);
  assert.deepEqual(f.archive.read(f.original.id), f.original);
  assert.deepEqual(fs.readdirSync(f.archiveRoot).map(file => [file, fs.readFileSync(path.join(f.archiveRoot, file), 'utf8')]), beforeFiles);
  const reopened = createFederationComparisons({ archive: createFederationArchive({ root: f.archiveRoot }) });
  assert.deepEqual(reopened.read(candidate.id), report);
  report.metrics[0].candidate = 999; report.policy.improvementVerified = true;
  assert.equal(metric(reopened.read(candidate.id), 'steps').candidate, 30);
  assert.equal(reopened.read(candidate.id).policy.improvementVerified, false);
});

test('new, running, paused, stopped and reset snapshots remain explicitly partial', t => {
  const f = fixture(t); let child = f.child;
  const check = () => {
    const report = f.comparisons.read(f.archive.save(child).id);
    assert.equal(report.basis.status, 'PARTIAL'); assert.equal(report.basis.candidateComplete, false);
    assert.equal(report.basis.sourceComplete, true); assert.equal(report.candidate.generation, child.generation);
    assert.equal(metric(report, 'steps').candidate, child.tick); return report;
  };
  assert.equal(metric(check(), 'emittedArtifacts').candidate, 0);
  child = f.store.act(child.id, { command: 'start', expectedRevision: child.revision }); check();
  child = f.store.act(child.id, { command: 'step', expectedRevision: child.revision, steps: 5 }); check();
  child = f.store.act(child.id, { command: 'pause', expectedRevision: child.revision }); check();
  child = f.store.act(child.id, { command: 'stop', expectedRevision: child.revision }); check();
  child = f.store.act(child.id, { command: 'reset', expectedRevision: child.revision });
  assert.equal(metric(check(), 'emittedArtifacts').candidate, 0); assert.equal(child.generation, 1);
});

test('faults and step-budget exhaustion are counted without treating fewer outputs as efficiency', t => {
  const f = fixture(t); let child = f.store.act(f.child.id, { command: 'start', expectedRevision: 0 });
  child = f.store.act(child.id, { command: 'fault', nodeId: 'c1-p1', expectedRevision: child.revision });
  child = f.store.act(child.id, { command: 'fault', nodeId: 'c1-f1', expectedRevision: child.revision });
  child = advance(f.store, child); assert.equal(child.state, 'LIMIT_REACHED');
  const report = f.comparisons.read(f.archive.save(child).id);
  assert.equal(report.basis.status, 'PARTIAL'); assert.equal(metric(report, 'steps').candidate, 200);
  assert.equal(metric(report, 'farmFaults').candidate, 1); assert.equal(metric(report, 'networkFaults').candidate, 1);
  assert.equal(metric(report, 'emittedArtifacts').candidate, 9); assert.equal(metric(report, 'missingArtifacts').candidate, 5);
  assert.equal(report.policy.improvementVerified, false);
});

test('an incomplete original cannot become a completed comparison just because the child finishes', t => {
  const f = fixture(t, { completeSource: false });
  const initial = f.comparisons.read(f.archive.save(f.child).id);
  assert.equal(initial.basis.status, 'PARTIAL'); assert.equal(initial.basis.sameTick, true);
  assert.equal(metric(initial, 'emittedArtifacts').candidate, 0);
  const child = advance(f.store, f.child), report = f.comparisons.read(f.archive.save(child).id);
  assert.equal(report.basis.status, 'PARTIAL'); assert.equal(report.basis.sourceComplete, false);
  assert.equal(report.basis.candidateComplete, true); assert.equal(report.basis.sameTick, false);
  assert.equal(metric(report, 'emittedArtifacts').source, 0); assert.equal(metric(report, 'emittedArtifacts').delta, 14);
});

test('missing, corrupt or mismatched original evidence fails closed, while the child archive stays readable', t => {
  const f = fixture(t), saved = f.archive.save(f.child), file = path.join(f.archiveRoot, `${f.original.id}.json`);
  const bytes = fs.readFileSync(file); fs.unlinkSync(file);
  assert.throws(() => f.comparisons.read(saved.id), /SOURCE_NOT_FOUND/); assert.deepEqual(f.archive.read(saved.id), saved);
  fs.writeFileSync(file, 'PRIVATE_SENTINEL', { mode: 0o600 });
  assert.throws(() => f.comparisons.read(saved.id), /ARCHIVE_RECORD_REJECTED/);
  fs.writeFileSync(file, bytes);
  for (const patch of [{ sourceRunId: randomUUID() }, { sourceRevision: 10 }, { sourceGeneration: 1 },
    { baselineConfig: { ...config, name: 'اسم غير مطابق للأصل' } }, { baselineConfig: { ...config, clusters: 1 } }]) {
    const wrong = f.archive.save({ ...f.child, derivation: { ...f.child.derivation, ...patch } });
    assert.throws(() => f.comparisons.read(wrong.id), /LINEAGE_MISMATCH/);
  }
  assert.throws(() => f.comparisons.read(f.original.id), /SOURCE_REQUIRED/);
  for (const id of [null, '', '../anything', { id: saved.id }, 'A'.repeat(64)]) assert.throws(() => f.comparisons.read(id), /INPUT_REJECTED/);
});

test('the comparison rejects invalid topology, duplicate or forged artifacts and inconsistent completion evidence', t => {
  const f = fixture(t), child = advance(f.store, f.child);
  const mutations = [
    s => { s.clusters[0].foundries = []; }, s => { s.clusters[0].id = 'c2'; },
    s => { s.clusters[0].factories[0].lines[0].id = 'unknown'; },
    s => { s.clusters[0].factories[0].lines.push(s.clusters[0].factories[0].lines[0]); },
    s => { s.clusters[0].foundries[0].completedCells = 8; },
    s => { s.clusters[0].foundries[0].progressPercent = '100'; },
    s => { s.clusters[0].foundries[0].state = 'IDLE'; },
    s => { s.clusters[0].foundries[0].state = 'ESTOP_LATCHED'; s.clusters[0].foundries[0].progressPercent = 90; },
    s => { s.clusters[0].farms[0].state = 'GROWING'; },
    s => { s.artifacts[0].kind = 'REAL_PRODUCTION'; }, s => { s.artifacts[0].id = 'forged'; },
    s => { s.artifacts[0].tick = s.tick + 1; }, s => { s.artifacts[0].sectorId = 'energy'; },
    s => { s.artifacts[0].designMaturity = 'APPROVED'; }, s => { s.artifacts.push(s.artifacts[0]); },
    s => { s.artifacts.pop(); }, s => { s.state = 'READY'; }, s => { s.clusters[0].state = 'INCOMPLETE'; }
  ];
  for (const mutate of mutations) {
    const changed = structuredClone(child); mutate(changed); const saved = f.archive.save(changed);
    assert.throws(() => f.comparisons.read(saved.id), /EVIDENCE_REJECTED/);
    assert.deepEqual(f.archive.read(saved.id), saved);
  }
});

test('maximum valid topology and already-emitted outputs remain countable after a partial stop', t => {
  const f = fixture(t);
  // Increase every bounded count through a new derivation from the same reviewed source.
  const improvements = createFederationImprovements({ store: f.store, archive: f.archive, reviews: f.reviews });
  let child = improvements.derive(f.original.id, { requestId: randomUUID(), expectedReviewRevision: f.review.revision,
    expectedReviewChainHead: f.review.chainHead, requestIds: [f.review.events[0].requestId],
    config: { ...config, clusters: 4, foundriesPerCluster: 3, factoriesPerCluster: 3, linesPerFactory: 3, farmsPerCluster: 3 },
    intent: 'مقارنة الحدود القصوى للمحاكاة' });
  child = advance(f.store, child);
  assert.equal(metric(f.comparisons.read(f.archive.save(child).id), 'emittedArtifacts').candidate, 64);
  let partial = f.store.act(f.child.id, { command: 'start', expectedRevision: 0 });
  partial = f.store.act(partial.id, { command: 'fault', nodeId: 'c1-p1', expectedRevision: partial.revision });
  for (let i = 0; i < 6; i++) partial = f.store.act(partial.id, { command: 'step', steps: 5, expectedRevision: partial.revision });
  assert.ok(partial.artifacts.length > 0); partial = f.store.act(partial.id, { command: 'stop', expectedRevision: partial.revision });
  const report = f.comparisons.read(f.archive.save(partial).id);
  assert.equal(metric(report, 'emittedArtifacts').candidate, partial.artifacts.length); assert.equal(report.basis.status, 'PARTIAL');
});

test('read-only comparison HTTP route enforces gates, redacts failures and is reproducible after restart', async t => {
  const f = fixture(t), saved = f.archive.save(advance(f.store, f.child)), api = '/api/sheikha/workspace/v1';
  let server, base, token;
  const start = async () => {
    server = createWorkspaceServer({ federation: { archive: { root: f.archiveRoot }, reviews: { root: f.reviewRoot } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    token = (await (await fetch(base + api + '/session')).json()).token;
  };
  const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  t.after(async () => { if (server?.listening) await stop(); }); await start();
  const endpoint = `/industry/archives/${saved.id}/comparison`;
  const get = (suffix = '', headers = {}) => fetch(base + api + endpoint + suffix, { headers: { 'X-Sheikha-Session': token, ...headers } });
  assert.equal((await get('', { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await get('', { Origin: 'https://example.invalid' })).status, 403);
  const hostStatus = await new Promise((resolve, reject) => {
    const req = http.get(base + api + endpoint, { headers: { Host: 'example.invalid', 'X-Sheikha-Session': token } }, res => {
      res.resume(); resolve(res.statusCode);
    }); req.on('error', reject);
  });
  assert.equal(hostStatus, 403);
  assert.equal((await get('?source=untrusted')).status, 400);
  assert.equal((await fetch(base + api + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token }, body: '{}' })).status, 404);
  const response = await get(); assert.equal(response.status, 200); const report = await response.json();
  await stop(); await start(); assert.deepEqual(await (await get()).json(), report);
  const before = f.reviews.read(f.original.id); assert.deepEqual(before, f.review);
  fs.writeFileSync(path.join(f.archiveRoot, `${f.original.id}.json`), 'PRIVATE_SENTINEL');
  const bad = await get(); assert.equal(bad.status, 422); assert.equal((await bad.text()).includes('PRIVATE_SENTINEL'), false);
  assert.equal((await fetch(base + api + `/industry/archives/${saved.id}`, { headers: { 'X-Sheikha-Session': token } })).status, 200);
});
