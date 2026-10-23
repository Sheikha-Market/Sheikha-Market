'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { spawnSync } = require('node:child_process');
const { createFederationArchive, ARCHIVE_LIMITS } = require('../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationStore } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = { name: 'تجمع شيخة للمراجعة', templateId: 'food', clusters: 2,
  foundriesPerCluster: 2, factoriesPerCluster: 2, linesPerFactory: 2, farmsPerCluster: 2 };
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-archive-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'records'), store = createFederationStore();
  const snapshot = store.create(config);
  return { root, temp, store, snapshot, archive: createFederationArchive({ root }) };
}

test('archive is lazy, private, idempotent, durable across instances and strictly review-only', t => {
  const { root, archive, snapshot, store } = fixture(t);
  assert.deepEqual(archive.list().records, []); assert.equal(fs.existsSync(root), false);
  const saved = archive.save(snapshot);
  assert.deepEqual(saved.snapshot, snapshot); assert.equal(saved.policy.replaySupported, false);
  assert.equal(saved.policy.signatureAuthenticated, false); assert.equal(saved.policy.approvalGranted, false);
  assert.deepEqual(archive.save(snapshot), saved); assert.equal(archive.list().records.length, 1);
  assert.equal(fs.statSync(root).mode & 0o777, 0o700);
  assert.equal(fs.statSync(path.join(root, `${saved.id}.json`)).mode & 0o777, 0o600);
  const reopened = createFederationArchive({ root });
  assert.deepEqual(reopened.read(saved.id), saved); assert.deepEqual(Object.keys(reopened).sort(), ['list', 'read', 'save']);
  saved.snapshot.config.name = 'changed'; assert.deepEqual(store.read(snapshot.id), snapshot);
  store.discard(snapshot.id, { expectedRevision: 0 });
  assert.deepEqual(reopened.read(saved.id).snapshot, snapshot);
  assert.equal(reopened.list().records[0].runId, snapshot.id);
});

test('each saved revision and generation remains independent after reset', t => {
  const { store, snapshot, archive } = fixture(t);
  let run = store.act(snapshot.id, { command: 'start', expectedRevision: 0 });
  run = store.act(run.id, { command: 'step', expectedRevision: run.revision, steps: 5 });
  const running = archive.save(run);
  run = store.act(run.id, { command: 'pause', expectedRevision: run.revision });
  run = store.act(run.id, { command: 'reset', expectedRevision: run.revision });
  const reset = archive.save(run);
  assert.notEqual(running.id, reset.id); assert.equal(archive.list().records.length, 2);
  assert.equal(archive.read(running.id).snapshot.tick, 5);
  assert.equal(archive.read(running.id).snapshot.state, 'RUNNING');
  assert.equal(reset.snapshot.generation, 1); assert.equal(reset.snapshot.state, 'READY');
});

test('strict inputs reject traversal, unknown fields, physical claims and oversize snapshots', t => {
  const { archive, snapshot } = fixture(t);
  for (const id of ['../secret', 'a'.repeat(63), 'A'.repeat(64), null, [], 'constructor']) {
    assert.throws(() => archive.read(id), /ARCHIVE_INPUT_REJECTED/);
  }
  for (const patch of [{ authorization: 'SECRET_SENTINEL' }, { tick: 201 }, { config: { ...config, endpoint: 'secret' } },
    { boundaries: { ...snapshot.boundaries, productionReady: true } },
    { execution: { ...snapshot.execution, persistentStorage: true } },
    { events: ['x'.repeat(ARCHIVE_LIMITS.bytes)] }]) {
    assert.throws(() => archive.save({ ...snapshot, ...patch }), /ARCHIVE_INPUT_REJECTED/);
  }
  assert.deepEqual(archive.list().records, []);
});

test('corrupt, hash-mismatched and changed-policy files fail closed without replacement', t => {
  const { archive, snapshot, root } = fixture(t);
  const record = archive.save(snapshot), file = path.join(root, `${record.id}.json`);
  for (const bytes of ['not-json', JSON.stringify({ ...record, policy: { ...record.policy, approvalGranted: true } }),
    JSON.stringify({ ...record, snapshot: { ...snapshot, tick: 1 } })]) {
    fs.writeFileSync(file, bytes);
    assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
    assert.throws(() => archive.save(snapshot), /ARCHIVE_RECORD_REJECTED/);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
    assert.equal(archive.list().unavailableRecords, 1);
    assert.deepEqual(archive.list().records, []);
  }
});

test('symlinks, linked files, permissive files, special files and huge files are rejected', t => {
  const { archive, snapshot, root, temp } = fixture(t);
  const record = archive.save(snapshot), file = path.join(root, `${record.id}.json`);
  const other = path.join(temp, 'other.json'); fs.writeFileSync(other, 'SECRET_SENTINEL', { mode: 0o600 });
  fs.unlinkSync(file); fs.symlinkSync(other, file);
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  fs.unlinkSync(file); fs.linkSync(other, file);
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  fs.unlinkSync(file); fs.writeFileSync(file, JSON.stringify(record), { mode: 0o644 });
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  fs.chmodSync(file, 0o600); fs.truncateSync(file, ARCHIVE_LIMITS.bytes + 1);
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  fs.unlinkSync(file); fs.mkdirSync(file);
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  fs.rmdirSync(file);
  assert.equal(spawnSync('mkfifo', ['-m', '600', file]).status, 0);
  assert.throws(() => archive.read(record.id), /ARCHIVE_RECORD_REJECTED/);
  assert.equal(fs.readFileSync(other, 'utf8'), 'SECRET_SENTINEL');
});

test('unsafe roots, symlink ancestors and an occupied writer lock do not get repaired implicitly', t => {
  const { archive, snapshot, root, temp } = fixture(t);
  fs.mkdirSync(root, { mode: 0o755 });
  assert.throws(() => archive.save(snapshot), /ARCHIVE_UNAVAILABLE/);
  assert.equal(fs.statSync(root).mode & 0o777, 0o755);
  fs.chmodSync(root, 0o700); fs.mkdirSync(path.join(root, '.write-lock'));
  assert.throws(() => archive.save(snapshot), /ARCHIVE_BUSY/);
  assert.equal(fs.existsSync(path.join(root, '.write-lock')), true);
  const alias = path.join(temp, 'alias'); fs.symlinkSync(root, alias);
  for (const target of [alias, path.join(alias, 'child')]) {
    assert.throws(() => createFederationArchive({ root: target }).save(snapshot), /ARCHIVE_UNAVAILABLE/);
  }
  assert.equal(fs.existsSync(path.join(root, 'child')), false);
});

test('record and scan limits refuse growth without deleting records; retries still succeed at capacity', t => {
  const { archive, snapshot, root } = fixture(t);
  const first = archive.save(snapshot);
  for (let i = 1; i < ARCHIVE_LIMITS.records; i++) archive.save({ ...snapshot, revision: i });
  assert.equal(archive.list().records.length, ARCHIVE_LIMITS.records);
  assert.deepEqual(archive.save(snapshot), first);
  assert.throws(() => archive.save({ ...snapshot, revision: ARCHIVE_LIMITS.records }), /ARCHIVE_CAPACITY_LIMIT/);
  assert.equal(fs.existsSync(path.join(root, '.write-lock')), false);
  for (let i = 0; i < 5; i++) fs.writeFileSync(path.join(root, `unrecognized-${i}`), '');
  assert.throws(() => archive.list(), /ARCHIVE_CAPACITY_LIMIT/);
  assert.deepEqual(archive.read(first.id), first);
});

test('largest completed federation fits a bounded archive record', t => {
  const { archive, store } = fixture(t);
  let run = store.create({ ...config, clusters: 4, foundriesPerCluster: 3, factoriesPerCluster: 3, linesPerFactory: 3, farmsPerCluster: 3 });
  run = store.act(run.id, { command: 'start', expectedRevision: 0 });
  while (run.state === 'RUNNING') run = store.act(run.id, { command: 'step', steps: 5, expectedRevision: run.revision });
  assert.equal(run.artifacts.length, 64); assert.equal(archive.save(run).snapshot.state, 'COMPLETE');
});

test('failed disk writes leave no published record or lock and do not advance the simulation', t => {
  const { archive, snapshot, root, store } = fixture(t);
  t.mock.method(fs, 'fsyncSync', () => { throw Object.assign(Error('DISK_FAILURE_SENTINEL'), { code: 'ENOSPC' }); });
  assert.throws(() => archive.save(snapshot), /DISK_FAILURE_SENTINEL/);
  assert.deepEqual(fs.readdirSync(root), []);
  assert.deepEqual(store.read(snapshot.id), snapshot);
  t.mock.restoreAll();
  assert.deepEqual(archive.save(snapshot).snapshot, snapshot);
});

test('HTTP archive is session-gated, revision-checked, read-only after restart and never served as static files', async t => {
  const { root } = fixture(t);
  let server, base, token;
  const api = '/api/sheikha/workspace/v1';
  const start = async () => {
    server = createWorkspaceServer({ federation: { archive: { root } } });
    server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
    token = (await (await fetch(base + api + '/session')).json()).token;
  };
  const stop = () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); });
  t.after(async () => { if (server.listening) await stop(); });
  const get = (url, headers = {}) => fetch(base + api + url, { headers: { 'X-Sheikha-Session': token, ...headers } });
  const post = (url, body, headers = {}) => fetch(base + api + url, { method: 'POST',
    headers: { 'X-Sheikha-Session': token, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  await start();
  assert.equal((await get('/industry/archives', { 'X-Sheikha-Session': '' })).status, 403);
  assert.deepEqual((await (await get('/industry/archives')).json()).records, []);
  const run = await (await post('/industry/simulations', config)).json();
  const saveUrl = `/industry/simulations/${run.id}/archive`;
  assert.equal((await post(saveUrl, { expectedRevision: 0 }, { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await post(saveUrl, { expectedRevision: 1 })).status, 409);
  const rejected = await post(saveUrl, { expectedRevision: 0, path: 'SECRET_SENTINEL', approved: true });
  assert.equal(rejected.status, 400); assert.equal((await rejected.text()).includes('SECRET_SENTINEL'), false);
  const saved = await (await post(saveUrl, { expectedRevision: 0 })).json();
  assert.deepEqual(saved.snapshot, run);
  assert.deepEqual(await (await post(saveUrl, { expectedRevision: 0 })).json(), saved);
  assert.deepEqual(await (await get(`/industry/simulations/${run.id}`)).json(), run);
  assert.equal((await get(`/industry/archives/${saved.id}`, { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await fetch(`${base}/runtime/industrial-federation-archive/v1/${saved.id}.json`)).status, 404);
  const oldToken = token; await stop(); await start();
  assert.equal((await get('/industry/archives', { 'X-Sheikha-Session': oldToken })).status, 403);
  assert.equal((await get(`/industry/simulations/${run.id}`)).status, 404);
  assert.deepEqual(await (await get(`/industry/archives/${saved.id}`)).json(), saved);
  assert.equal((await post(`/industry/archives/${saved.id}/actions`, { command: 'resume' })).status, 404);
  assert.equal((await post('/industry/archives', saved)).status, 404);
  assert.equal((await post(`/industry/simulations/${run.id}/actions`, { command: 'start', expectedRevision: 0 })).status, 404);
  fs.writeFileSync(path.join(root, `${saved.id}.json`), 'SECRET_SENTINEL');
  const bad = await get(`/industry/archives/${saved.id}`);
  assert.equal(bad.status, 422); assert.deepEqual(await bad.json(), { error: 'ARCHIVE_RECORD_REJECTED' });
});
