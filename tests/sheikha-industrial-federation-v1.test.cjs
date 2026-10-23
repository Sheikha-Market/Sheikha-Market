'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { IndustrialFederation, createFederationStore, LIMITS } = require('../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const config = () => ({ name: 'تجمع شيخة التجريبي', templateId: 'food', clusters: 2,
  foundriesPerCluster: 2, factoriesPerCluster: 2, linesPerFactory: 2, farmsPerCluster: 2 });
const command = (run, name, fields = {}) => run.act({ command: name, expectedRevision: run.revision, ...fields });
const finish = run => { for (let i = 0; i < 40 && run.state === 'RUNNING'; i++) command(run, 'step', { steps: 5 }); };

test('federation creates a finite hierarchy without execution at construction or read', () => {
  const run = new IndustrialFederation(config()), s = run.snapshot();
  assert.equal(s.state, 'READY'); assert.equal(s.tick, 0);
  assert.equal(s.clusters.length, 2); assert.equal(s.clusters[0].foundries.length, 2);
  assert.equal(s.clusters[0].factories.length, 2); assert.equal(s.clusters[0].factories[0].lines.length, 2);
  assert.equal(s.clusters[0].farms.length, 2); assert.deepEqual(s.artifacts, []);
  assert.deepEqual(run.snapshot(), s);
  assert.equal(s.execution.automaticServerScheduler, false);
});

test('existing network completes foundries before lines and emits unique review-only artifacts', () => {
  const run = new IndustrialFederation(config()); command(run, 'start');
  command(run, 'step', { steps: 5 });
  assert.ok(run.snapshot().clusters.every(c => c.factories.every(f => f.lines.every(l => l.state === 'IDLE'))));
  finish(run); const s = run.snapshot();
  assert.equal(s.state, 'COMPLETE'); assert.equal(s.tick, 30);
  assert.equal(s.artifacts.length, 18); assert.equal(new Set(s.artifacts.map(a => a.id)).size, 18);
  for (const a of s.artifacts) {
    assert.equal(a.physicalOutput, false); assert.equal(a.reviewStatus, 'DRAFT_REQUIRES_HUMAN_REVIEW');
  }
  for (const c of s.clusters) {
    const starts = s.events.filter(e => e.event === 'NETWORK_STARTED' && e.nodeId.startsWith(`${c.id}-m`));
    const inputTicks = s.artifacts.filter(a => a.nodeId.startsWith(c.id) && ['FACTORY_AND_LINE_BLUEPRINT_DRAFT', 'SIMULATED_HARVEST_DRAFT'].includes(a.kind)).map(a => a.tick);
    assert.ok(starts.every(e => e.tick > Math.max(...inputTicks)));
  }
  assert.equal(s.boundaries.realFactoriesBuilt, 0); assert.equal(s.boundaries.physicalCommandSent, false);
  assert.equal(s.boundaries.productionReady, false); assert.equal(s.boundaries.superiorityClaimVerified, false);
});

test('symbolic cultivation reuses all eight stages without granting real harvest or propagation', () => {
  const run = new IndustrialFederation(config()); command(run, 'start'); finish(run);
  for (const farm of run.snapshot().clusters.flatMap(c => c.farms)) {
    assert.equal(farm.state, 'COMPLETE'); assert.equal(farm.progressPercent, 100);
    assert.equal(farm.domain, 'CONCEPTUAL_CROP_CULTIVATION');
    assert.equal(farm.realReadiness.nursery.ready, false);
    assert.equal(farm.realReadiness.harvest.ready, false);
    assert.equal(farm.realReadiness.propagation.allowed, false);
    assert.ok(farm.realReadiness.harvest.blockers.includes('QUALITY_EVIDENCE_REQUIRED'));
    const events = run.snapshot().events.filter(e => e.nodeId === farm.id && e.event.startsWith('SIMULATED_') && e.event !== 'SIMULATED_HARVEST_DRAFT');
    assert.equal(events.length, 8);
  }
  const digital = new IndustrialFederation({ ...config(), templateId: 'digital' });
  assert.equal(digital.snapshot().clusters[0].farms[0].domain, 'INDUSTRIAL_RESOURCE_METAPHOR');
});

test('fault in one farm blocks its cluster while another completes; budget prevents endless progress', () => {
  const run = new IndustrialFederation(config()); command(run, 'start');
  command(run, 'fault', { nodeId: 'c1-p1' }); finish(run);
  const s = run.snapshot(); assert.equal(s.state, 'LIMIT_REACHED'); assert.equal(s.tick, 200);
  assert.equal(s.clusters[0].state, 'INCOMPLETE'); assert.equal(s.clusters[1].state, 'COMPLETE');
  assert.equal(s.clusters[0].factories[0].lines[0].state, 'IDLE');
  assert.throws(() => command(run, 'step', { steps: 1 }), /STATE_CONFLICT/);
  assert.equal(s.events.length <= 160, true);
});

test('network faults work after source cells complete and are latched until reset', () => {
  const run = new IndustrialFederation(config()); command(run, 'start'); command(run, 'step', { steps: 5 });
  command(run, 'fault', { nodeId: 'c1-f1' }); finish(run);
  assert.equal(run.snapshot().clusters[0].foundries[0].state, 'FAULT_LATCHED');
  assert.equal(run.snapshot().clusters[1].state, 'COMPLETE');
  assert.throws(() => command(run, 'resume'), /STATE_CONFLICT/);
  command(run, 'reset'); assert.equal(run.snapshot().state, 'READY');
  assert.equal(run.snapshot().clusters[0].foundries[0].state, 'IDLE');
});

test('pause, optimistic revisions, stop latch and generation reset preserve deterministic states', () => {
  const run = new IndustrialFederation(config()); command(run, 'start'); command(run, 'step', { steps: 5 });
  command(run, 'pause'); const paused = run.snapshot();
  assert.throws(() => command(run, 'step', { steps: 1 }), /STATE_CONFLICT/);
  assert.deepEqual(run.snapshot(), paused);
  assert.throws(() => run.act({ command: 'resume', expectedRevision: 0 }), /REVISION_CONFLICT/);
  command(run, 'resume'); command(run, 'stop');
  assert.equal(run.snapshot().state, 'STOPPED');
  assert.throws(() => command(run, 'start'), /STATE_CONFLICT/);
  assert.throws(() => command(run, 'resume'), /STATE_CONFLICT/);
  command(run, 'reset'); assert.equal(run.generation, 1); assert.equal(run.tick, 0);
  assert.equal(run.snapshot().artifacts.length, 0);
  command(run, 'start'); finish(run);
  assert.ok(run.snapshot().artifacts.every(a => a.id.includes(':1:')));
});

test('strict shape and bounds reject approval, endpoint, unlimited replication and research execution inputs', () => {
  for (const patch of [{ approved: true }, { endpoint: 'http://example.invalid' }, { templateId: 'space' },
    { name: 'x\nname' }, { name: 'x'.repeat(121) }, { templateId: '__proto__' }]) {
    assert.throws(() => new IndustrialFederation({ ...config(), ...patch }), /INPUT_REJECTED/);
  }
  for (const key of ['clusters', 'foundriesPerCluster', 'factoriesPerCluster', 'linesPerFactory', 'farmsPerCluster']) {
    for (const n of [0, -1, 1.5, '2', null, Infinity, NaN, LIMITS[key] + 1]) {
      assert.throws(() => new IndustrialFederation({ ...config(), [key]: n }), /INPUT_REJECTED/);
    }
  }
  const run = new IndustrialFederation(config()); command(run, 'start'); const before = run.snapshot();
  for (const body of [{ command: 'physical-start' }, { command: 'step', steps: 6 }, { command: 'step', steps: '1' },
    { command: 'fault', nodeId: '../not-a-node' }, { command: 'pause', approved: true }, { command: 'recover', nodeId: 'c1-p1' }]) {
    assert.throws(() => run.act({ expectedRevision: run.revision, ...body }), /INPUT_REJECTED/);
    assert.deepEqual(run.snapshot(), before);
  }
});

test('maximal federation is bounded and snapshots cannot mutate the engine', () => {
  const run = new IndustrialFederation({ ...config(), clusters: 4, foundriesPerCluster: 3, factoriesPerCluster: 3, linesPerFactory: 3, farmsPerCluster: 3 });
  command(run, 'start'); finish(run); const s = run.snapshot();
  assert.equal(s.state, 'COMPLETE'); assert.equal(s.artifacts.length, 64);
  assert.ok(Buffer.byteLength(JSON.stringify(s)) < 200000);
  s.boundaries.productionReady = true; s.clusters[0].farms[0].realReadiness.harvest.ready = true;
  assert.equal(run.snapshot().boundaries.productionReady, false);
  assert.equal(run.snapshot().clusters[0].farms[0].realReadiness.harvest.ready, false);
});

test('store expires active runs, caps memory and supports revision-checked discard', () => {
  let now = 1000000; const store = createFederationStore({ now: () => now });
  const jobs = Array.from({ length: LIMITS.jobs }, () => store.create(config()));
  assert.throws(() => store.create(config()), /CAPACITY_LIMIT/);
  store.act(jobs[0].id, { command: 'start', expectedRevision: 0 });
  assert.throws(() => store.discard(jobs[0].id, { expectedRevision: 0 }), /REVISION_CONFLICT/);
  assert.throws(() => store.discard(jobs[0].id, { expectedRevision: 1, force: true }), /INPUT_REJECTED/);
  store.discard(jobs[0].id, { expectedRevision: 1 });
  assert.throws(() => store.read(jobs[0].id), /NOT_FOUND/);
  store.create(config()); now += LIMITS.ttlMs;
  assert.throws(() => store.read(jobs[1].id), /NOT_FOUND/);
  assert.equal(store.create(config()).state, 'READY');
});

test('HTTP simulations inherit local gates, expose no unauthenticated run and reject stale writers', async t => {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`, api = '/api/sheikha/workspace/v1';
  const token = (await (await fetch(base + api + '/session')).json()).token;
  const post = (path, body, headers = {}) => fetch(base + api + path, { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token, ...headers }, body: JSON.stringify(body) });
  const root = '/industry/simulations';
  assert.equal((await post(root, config(), { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await post(root, config(), { 'X-Sheikha-Session': '' })).status, 403);
  assert.equal((await post(root, { ...config(), authorization: 'SECRET_SENTINEL' })).status, 400);
  const response = await post(root, config()); assert.equal(response.status, 200); const job = await response.json();
  assert.equal((await fetch(base + api + root + '/' + job.id)).status, 403);
  const read = await fetch(base + api + root + '/' + job.id, { headers: { 'X-Sheikha-Session': token } });
  assert.equal((await read.json()).tick, 0);
  assert.equal((await post(`${root}/${job.id}/actions`, { command: 'start', expectedRevision: 0 })).status, 200);
  assert.equal((await post(`${root}/${job.id}/actions`, { command: 'stop', expectedRevision: 0 })).status, 409);
  const error = await post(`${root}/${job.id}/actions`, { command: 'fault', expectedRevision: 1, nodeId: 'SECRET_SENTINEL' });
  assert.equal(error.status, 400); assert.equal((await error.text()).includes('SECRET_SENTINEL'), false);
  assert.equal((await post(`${root}/${job.id}/discard`, { expectedRevision: 1 })).status, 200);
  assert.equal((await post(`${root}/${job.id}/actions`, { command: 'start', expectedRevision: 1 })).status, 404);
});
