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
const { createFederationLineage } = require('../core/industrial/sheikha-industrial-lineage-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = { name: 'تجربة فهرس شيخة', templateId: 'food', clusters: 1,
  foundriesPerCluster: 1, factoriesPerCluster: 1, linesPerFactory: 1, farmsPerCluster: 1 };
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-lineage-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const archiveRoot = path.join(temp, 'archive'), reviewRoot = path.join(temp, 'reviews');
  const archive = createFederationArchive({ root: archiveRoot }), store = createFederationStore();
  const reviews = createFederationReviews({ archive, root: reviewRoot });
  const improvements = createFederationImprovements({ store, archive, reviews });
  const derive = (parent, patch = {}) => {
    let review = reviews.read(parent.id);
    if (!review.events.length) review = reviews.append(parent.id, { expectedRevision: 0, requestId: randomUUID(),
      targetId: 'federation', decision: 'CHANGES_REQUESTED', note: 'طلب اختباري للترابط دون اعتماد' });
    return improvements.derive(parent.id, { requestId: randomUUID(), expectedReviewRevision: review.revision,
      expectedReviewChainHead: review.chainHead, requestIds: [review.events[0].requestId],
      config: { ...parent.snapshot.config, linesPerFactory: parent.snapshot.config.linesPerFactory === 1 ? 2 : 1, ...patch },
      intent: 'تجربة متفرعة لاختبار السلاسل محليًا' });
  };
  return { temp, archiveRoot, reviewRoot, archive, store, reviews, derive, lineage: createFederationLineage({ archive }) };
}
const experiment = (report, id) => report.experiments.find(e => e.runId === id);
const disk = root => fs.readdirSync(root).sort().map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]);

test('empty lineage reads create no archive or review directories', t => {
  const f = fixture(t), report = f.lineage.read();
  assert.deepEqual(report.records, []); assert.deepEqual(report.families, []); assert.deepEqual(report.experiments, []);
  assert.equal(report.unavailableRecords, 0); assert.equal(fs.existsSync(f.archiveRoot), false); assert.equal(fs.existsSync(f.reviewRoot), false);
});

test('branching lineage groups saves and reset generations as one experiment and remains read-only across restart', t => {
  const f = fixture(t), source = f.archive.save(f.store.create(config));
  let child = f.derive(source), initial = f.archive.save(child);
  child = f.store.act(child.id, { command: 'reset', expectedRevision: 0 }); const reset = f.archive.save(child);
  const sibling = f.archive.save(f.derive(source, { name: 'فرع ثان' }));
  const grandchild = f.archive.save(f.derive(reset));
  const independent = f.archive.save(f.store.create({ ...config, name: 'تجربة مستقلة' }));
  const before = disk(f.archiveRoot), reviews = disk(f.reviewRoot), live = f.store.read(child.id);
  const report = f.lineage.read();
  assert.equal(report.records.length, 6); assert.equal(report.experiments.length, 5); assert.equal(report.families.length, 2);
  assert.deepEqual(experiment(report, child.id).archiveIds, [reset.id, initial.id]);
  assert.equal(experiment(report, child.id).depth, 1); assert.equal(experiment(report, grandchild.snapshot.id).depth, 2);
  for (const r of [source, reset, sibling, grandchild]) assert.equal(experiment(report, r.snapshot.id).familyId, source.snapshot.id);
  assert.equal(experiment(report, independent.snapshot.id).linkStatus, 'ORIGINAL');
  assert.equal(experiment(report, child.id).linkStatus, 'MATCHED');
  assert.equal(experiment(report, grandchild.snapshot.id).source.archiveId, reset.id);
  assert.equal(report.policy.currentReviewVerified, false); assert.equal(report.policy.signatureAuthenticated, false);
  assert.equal(report.policy.atomicSnapshot, false); assert.equal(report.policy.approvalGranted, false);
  assert.equal(report.policy.improvementVerified, false); assert.equal(report.policy.physicalExecutionEnabled, false);
  assert.deepEqual(disk(f.archiveRoot), before); assert.deepEqual(disk(f.reviewRoot), reviews); assert.deepEqual(f.store.read(child.id), live);
  assert.deepEqual(createFederationLineage({ archive: createFederationArchive({ root: f.archiveRoot }) }).read(), report);
  report.experiments[0].archiveIds.length = 0; report.policy.approvalGranted = true;
  assert.equal(f.lineage.read().policy.approvalGranted, false); assert.ok(f.lineage.read().experiments.every(e => e.archiveIds.length));
});

test('missing or corrupt ancestors produce incomplete families without losing readable descendants', t => {
  const f = fixture(t), source = f.archive.save(f.store.create(config));
  const child = f.archive.save(f.derive(source)), grandchild = f.archive.save(f.derive(child));
  const file = path.join(f.archiveRoot, `${source.id}.json`), bytes = fs.readFileSync(file);
  fs.unlinkSync(file);
  let report = f.lineage.read();
  assert.equal(experiment(report, child.snapshot.id).linkStatus, 'SOURCE_UNAVAILABLE');
  assert.equal(experiment(report, grandchild.snapshot.id).linkStatus, 'MATCHED');
  assert.equal(experiment(report, grandchild.snapshot.id).ancestryStatus, 'INCOMPLETE');
  assert.equal(report.families[0].id, child.snapshot.id); assert.equal(report.records.length, 2);
  fs.writeFileSync(file, 'PRIVATE_SENTINEL', { mode: 0o600 }); report = f.lineage.read();
  assert.equal(report.unavailableRecords, 1); assert.equal(JSON.stringify(report).includes('PRIVATE_SENTINEL'), false);
  assert.equal(experiment(report, child.snapshot.id).linkStatus, 'SOURCE_UNAVAILABLE');
  fs.writeFileSync(file, bytes); report = f.lineage.read();
  assert.ok(report.experiments.every(e => e.ancestryStatus === 'COMPLETE')); assert.equal(report.unavailableRecords, 0);
});

test('source identity, revision, generation and configuration mismatches are not linked', t => {
  const f = fixture(t); let run = f.store.create(config);
  run = f.store.act(run.id, { command: 'reset', expectedRevision: 0 });
  const source = f.archive.save(run), child = f.derive(source);
  for (const patch of [{ sourceRunId: randomUUID() }, { sourceRevision: 2 }, { sourceGeneration: 0 },
    { baselineConfig: { ...config, name: 'اسم غير مطابق' } }, { baselineConfig: { ...config, clusters: 2 } }]) {
    const r = f.archive.save({ ...child, id: randomUUID(), derivation: { ...child.derivation, ...patch } });
    const e = experiment(f.lineage.read(), r.snapshot.id);
    assert.equal(e.linkStatus, 'SOURCE_MISMATCH'); assert.equal(e.ancestryStatus, 'INCOMPLETE'); assert.equal(e.familyId, e.runId);
  }
});

test('conflicting saves cannot choose an authoritative lineage or lend authority to descendants', t => {
  for (const mutate of [s => { s.revision++; s.config.name = 'اسم متعارض'; }, s => { s.revision++; s.derivation.intent = 'نية متعارضة'; },
    s => { s.tick = 1; }]) {
    const f = fixture(t), source = f.archive.save(f.store.create(config)), child = f.archive.save(f.derive(source));
    const grandchild = f.archive.save(f.derive(child));
    const changed = structuredClone(child.snapshot); mutate(changed); f.archive.save(changed);
    const report = f.lineage.read();
    assert.equal(experiment(report, child.snapshot.id).linkStatus, 'INCONSISTENT_RUN');
    assert.equal(experiment(report, child.snapshot.id).source, null);
    assert.equal(experiment(report, grandchild.snapshot.id).linkStatus, 'SOURCE_MISMATCH');
    assert.equal(experiment(report, source.snapshot.id).linkStatus, 'ORIGINAL');
  }
});

test('bounded graph traversal rejects cycles and handles a 100-record chain without recursion', t => {
  const f = fixture(t), source = f.archive.save(f.store.create(config));
  const prototype = f.archive.save(f.derive(source));
  // Synthetic archive adapter exercises defensive graph traversal independently of content-addressed storage.
  const records = Array.from({ length: 100 }, (_, i) => ({ ...structuredClone(source), id: (i + 1).toString(16).padStart(64, '0') }));
  records.forEach((r, i) => {
    r.snapshot.id = randomUUID(); r.snapshot.config.linesPerFactory = i % 2 + 1;
    if (i) r.snapshot.derivation = { ...structuredClone(prototype.snapshot.derivation), sourceArchiveId: records[i - 1].id,
      sourceRunId: records[i - 1].snapshot.id, sourceRevision: 0, sourceGeneration: 0, baselineConfig: structuredClone(records[i - 1].snapshot.config) };
  });
  let reads = 0;
  const fake = { list: () => ({ records: records.map(r => ({ id: r.id })), unavailableRecords: 0 }),
    read: id => { reads++; return structuredClone(records.find(r => r.id === id)); } };
  const index = createFederationLineage({ archive: fake }); let report = index.read();
  assert.equal(reads, 100); assert.equal(report.families.length, 1); assert.equal(experiment(report, records[99].snapshot.id).depth, 99);
  records[0].snapshot.derivation = { ...records[1].snapshot.derivation, sourceArchiveId: records[1].id,
    sourceRunId: records[1].snapshot.id, baselineConfig: structuredClone(records[1].snapshot.config) };
  report = index.read();
  assert.equal(report.experiments.filter(e => e.linkStatus === 'CYCLE').length, 2);
  assert.ok(report.experiments.every(e => e.ancestryStatus === 'INCOMPLETE'));
  records.push(structuredClone(source)); reads = 0;
  assert.throws(() => index.read(), /LINEAGE_CAPACITY_LIMIT/); assert.equal(reads, 0);
});

test('a file lost during a bounded read is omitted and unexpected adapter errors are not hidden', t => {
  const f = fixture(t), source = f.archive.save(f.store.create(config)), child = f.archive.save(f.derive(source));
  let reads = 0;
  const adapter = { list: () => f.archive.list(), read: id => {
    reads++; if (id === source.id) throw Error('ARCHIVE_NOT_FOUND'); return f.archive.read(id);
  } };
  const report = createFederationLineage({ archive: adapter }).read();
  assert.equal(reads, 2); assert.equal(report.unavailableRecords, 1); assert.equal(report.records.length, 1);
  assert.equal(experiment(report, child.snapshot.id).linkStatus, 'SOURCE_UNAVAILABLE');
  adapter.read = () => { throw Error('UNEXPECTED_ADAPTER_FAILURE'); };
  assert.throws(() => createFederationLineage({ archive: adapter }).read(), /UNEXPECTED_ADAPTER_FAILURE/);
});

test('lineage HTTP is authenticated read-only, bounded and stable after restart', async t => {
  const f = fixture(t), source = f.archive.save(f.store.create(config)); f.archive.save(f.derive(source));
  const endpoint = '/api/sheikha/workspace/v1/industry/archives/lineage'; let server, base, token;
  const start = async () => {
    server = createWorkspaceServer({ federation: { archive: { root: f.archiveRoot }, reviews: { root: f.reviewRoot } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    token = (await (await fetch(base + '/api/sheikha/workspace/v1/session')).json()).token;
  };
  const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  t.after(async () => { if (server?.listening) await stop(); }); await start();
  const get = (suffix = '', headers = {}) => fetch(base + endpoint + suffix, { headers: { 'X-Sheikha-Session': token, ...headers } });
  assert.equal((await get('', { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await get('', { Origin: 'https://example.invalid' })).status, 403);
  assert.equal(await new Promise((resolve, reject) => {
    http.get(base + endpoint, { headers: { Host: 'example.invalid', 'X-Sheikha-Session': token } }, res => {
      res.resume(); resolve(res.statusCode);
    }).on('error', reject);
  }), 403);
  assert.equal((await get('?root=untrusted')).status, 400);
  assert.equal((await fetch(base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token }, body: '{}' })).status, 404);
  const before = disk(f.archiveRoot), reviews = disk(f.reviewRoot), response = await get();
  assert.equal(response.status, 200); const report = await response.json(); assert.deepEqual(report, f.lineage.read());
  await stop(); await start(); assert.deepEqual(await (await get()).json(), report);
  assert.deepEqual(disk(f.archiveRoot), before); assert.deepEqual(disk(f.reviewRoot), reviews);
  fs.writeFileSync(path.join(f.archiveRoot, `${source.id}.json`), 'PRIVATE_SENTINEL');
  const partial = await (await get()).json(); assert.equal(partial.unavailableRecords, 1);
  assert.equal(JSON.stringify(partial).includes('PRIVATE_SENTINEL'), false);
});
