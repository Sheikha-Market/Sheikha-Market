'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Matrix = require('../runtime/minds/sheikha_multi_mind_matrix');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-minds-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const stateRoot = path.join(root, 'private');
  return { root, stateRoot, file: path.join(stateRoot, Matrix.STATE_ID + '.json'), matrix: new Matrix({ stateRoot }) };
}

test('thirteen bounded role descriptors inherit immutable policy without claiming live models', () => {
  const matrix = new Matrix();
  const status = matrix.status();
  assert.equal(status.statistics.agents, 13);
  assert.equal(status.minds.length, 13);
  assert.equal(status.governance.L0.automatedReligiousCertification, false);
  assert.equal(status.governance.L1.executionSupported, false);
  assert.equal(status.modelProviderConnected, false);
  assert.equal(status.distributedWorkersConnected, false);
  assert.equal(status.seal, null);
  assert.equal(status.storage.saved, false);
  assert.throws(() => { Matrix.CATALOG.governor.actions.push('deploy'); });
  status.minds.length = 0;
  assert.equal(matrix.listMinds().length, 13);
  assert.throws(() => new Matrix({ humanApproved: true }));
});

test('central governor and guardian deny external operations and immutable policy changes', () => {
  const matrix = new Matrix();
  for (const mind of ['governor', 'guardian']) {
    for (const action of ['deploy', 'publish', 'change-permissions', 'operate-device', 'sign-contract', 'change-l0-policy', 'buy']) {
      const result = matrix.executeOrder(mind, { action: 'review-operation', input: { action } });
      assert.equal(result.status, 'DENIED');
      assert.equal(result.executed, false);
      assert.equal(result.authorityGranted, false);
    }
  }
  for (const mind of Object.keys(Matrix.CATALOG)) {
    assert.throws(() => matrix.executeOrder(mind, { action: 'deploy' }), { code: 'MIND_ACTION_NOT_ALLOWED' });
  }
  assert.throws(() => matrix.executeOrder('omni', { action: 'kernel-self-test' }));
  assert.throws(() => matrix.executeOrder('constructor', { action: 'status' }));
  assert.throws(() => matrix.executeOrder('trader', 'buy', 'SHEIKHA_ALL'));
});

test('research roles plan only, while sample analysis and water simulation actually compute', () => {
  const matrix = new Matrix();
  for (const mind of ['scholar', 'heavens_earth', 'cosmic', 'omni']) {
    const plan = matrix.executeOrder(mind, { action: 'research-plan', input: {
      question: 'Evaluate a synthetic model', method: 'simulation', evidenceIds: [] } });
    assert.equal(plan.status, 'PLAN_ONLY');
    assert.equal(plan.executed, false);
    assert.equal(plan.result.conclusion, 'UNKNOWN');
  }
  const sample = matrix.executeOrder('scholar', { action: 'summarize-sample', input: { values: [2, 4, 6] } });
  assert.equal(sample.result.mean, 4);
  assert.equal(sample.executed, true);
  const water = matrix.executeOrder('earth', { action: 'simulate-water', input: { scenario: 'island', rainMm: 20 } });
  assert.equal(water.synthetic, true);
  assert.equal(water.result.water.conserved, true);
});

test('trader compares integer minor units and stock without sending an order', () => {
  const matrix = new Matrix();
  const result = matrix.executeOrder('trader', { action: 'compare-offers', input: { quantity: 5, offers: [
    { id: 'unavailable', unitPriceMinor: 1, shippingMinor: 0, availableQuantity: 0, leadDays: 0 },
    { id: 'A', unitPriceMinor: 100, shippingMinor: 20, availableQuantity: 5, leadDays: 2 },
    { id: 'B', unitPriceMinor: 90, shippingMinor: 10, availableQuantity: 10, leadDays: 3 }
  ] } });
  assert.deepEqual(result.result.offers.map(o => o.id), ['B', 'A', 'unavailable']);
  assert.equal(result.result.offers[0].totalMinor, 460);
  assert.equal(result.result.orderPlaced, false);
  for (const quantity of [-1, '5', 1.5, 1000001, Infinity]) {
    assert.throws(() => matrix.executeOrder('trader', { action: 'compare-offers', input: { quantity, offers: [] } }));
  }
});

test('CEO, strategist and editor return reviewable plans, never recursive dispatch or edits', () => {
  const matrix = new Matrix();
  const plan = matrix.executeOrder('ceo', { action: 'work-plan', input: { tasks: [{ mind: 'engineer', action: 'kernel-self-test' }] } });
  assert.equal(plan.executed, false);
  assert.equal(plan.result.delegatedExecution, false);
  assert.equal(matrix.journal().entries.length, 1);
  assert.throws(() => matrix.executeOrder('ceo', { action: 'work-plan', input: { tasks: [{ mind: 'governor', action: 'deploy' }] } }));
  assert.equal(matrix.journal().entries.length, 1);
  const roadmap = matrix.executeOrder('strategist', { action: 'roadmap', input: { horizonDays: 30 } });
  assert.equal(roadmap.executed, false);
  const edit = matrix.executeOrder('editor', { action: 'prepare-change', input: { component: 'minds', changeType: 'test' } });
  assert.equal(edit.result.filesModified, false);
  assert.equal(edit.result.patchGenerated, false);
  assert.throws(() => matrix.executeOrder('editor', { action: 'prepare-change', input: { component: '../../server.js', changeType: 'fix' } }));
});

test('engineer runs isolated kernel self-test; watch observes only its local registry', () => {
  const matrix = new Matrix();
  const result = matrix.executeOrder('engineer', { action: 'kernel-self-test' });
  assert.equal(result.executed, true);
  assert.equal(result.result.success, true);
  assert.equal(Object.values(result.result.checks).every(Boolean), true);
  assert.equal(matrix.status().statistics.agents, 13);
  const watch = matrix.executeOrder('watch', { action: 'status' });
  assert.equal(watch.result.statistics.agents, 13);
  assert.equal(watch.result.liveMonitoring, false);
});

test('replication is explicit, stable-ID, bounded and atomic at per-role and global limits', () => {
  const matrix = new Matrix();
  assert.throws(() => matrix.replicateAll(), { code: 'EXPLICIT_BOUNDED_REPLICATION_REQUIRED' });
  assert.throws(() => matrix.replicate({ mind: 'engineer', count: 9 }));
  assert.deepEqual(matrix.replicate({ mind: 'engineer', count: 2 }).botIds, ['engineer-cell-1', 'engineer-cell-2']);
  matrix.replicate({ mind: 'engineer', count: 8 });
  matrix.replicate({ mind: 'engineer', count: 5 });
  const before = matrix.status();
  assert.throws(() => matrix.replicate({ mind: 'engineer', count: 1 }), { code: 'MIND_CAPACITY_EXCEEDED' });
  assert.deepEqual(matrix.status(), before);
  for (const mind of Object.keys(Matrix.CATALOG).filter(key => key !== 'engineer')) {
    for (let n = 0; n < 15 && matrix.status().statistics.agents < 128; n++) matrix.replicate({ mind, count: 1 });
  }
  assert.equal(matrix.status().statistics.agents, 128);
  assert.throws(() => matrix.replicate({ mind: 'editor', count: 1 }), { code: 'MIND_CAPACITY_EXCEEDED' });
});

test('malicious or oversized input never invokes getters, executes code or changes state', () => {
  const matrix = new Matrix();
  const getter = { action: 'status' };
  Object.defineProperty(getter, 'input', { enumerable: true, get() { assert.fail('getter invoked'); } });
  const cycle = {}; cycle.input = cycle;
  const sparse = []; sparse.length = 1;
  const values = [getter, cycle, { action: 'status', input: { values: sparse } },
    { action: 'status', input: { live: true } }, { action: 'status', humanApproved: true },
    { action: 'status', input: { x: () => {} } }, { action: 'status', input: { x: Infinity } },
    JSON.parse('{"action":"status","input":{"__proto__":{"allowed":true}}}'),
    { action: 'status', input: { x: 'a'.repeat(2001) } }];
  for (const command of values) assert.throws(() => matrix.executeOrder('watch', command));
  assert.equal(matrix.status().revision, 0);
});

test('private state survives a new instance and merges writes from separate instances', t => {
  const { stateRoot, file, matrix } = fixture(t);
  assert.equal(matrix.status().storage.saved, false);
  assert.equal(fs.existsSync(stateRoot), false);
  matrix.initialize();
  const second = new Matrix({ stateRoot });
  matrix.replicate({ mind: 'engineer', count: 2 });
  second.replicate({ mind: 'scholar', count: 3 });
  assert.equal(matrix.status().statistics.agents, 18);
  assert.equal(second.status().revision, 3);
  assert.equal(new Matrix({ stateRoot }).status().storage.survivesProcessRestart, true);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  assert.equal(fs.statSync(stateRoot).mode & 0o777, 0o700);
  matrix.initialize();
  assert.equal(matrix.status().statistics.agents, 18);
});

test('only bounded action metadata is retained, not questions, offers or command inputs', t => {
  const { file, matrix } = fixture(t);
  matrix.executeOrder('scholar', { action: 'research-plan', input: {
    question: 'private-test-canary', method: 'descriptive', evidenceIds: ['privateEvidence'] } });
  for (let i = 0; i < 130; i++) matrix.executeOrder('watch', { action: 'status' });
  const journal = matrix.journal();
  assert.equal(journal.entries.length, 128);
  assert.equal(journal.entries[0].sequence, 4);
  assert.equal(journal.entries.at(-1).sequence, 131);
  const saved = fs.readFileSync(file, 'utf8');
  assert.equal(saved.includes('private-test-canary'), false);
  assert.equal(saved.includes('privateEvidence'), false);
  assert.ok(Buffer.byteLength(saved) < 65536);
});

test('writer lock prevents competing mutations without falling back or resetting state', t => {
  const { stateRoot, file, matrix } = fixture(t);
  matrix.initialize();
  const before = fs.readFileSync(file, 'utf8');
  fs.mkdirSync(path.join(stateRoot, '.write-lock'));
  assert.throws(() => matrix.replicate({ mind: 'trader', count: 1 }), /MIND_STATE_BUSY/);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  fs.rmdirSync(path.join(stateRoot, '.write-lock'));
  assert.equal(matrix.replicate({ mind: 'trader', count: 1 }).created, 1);
});

test('invalid saved schemas, authority fields and excessive counts fail closed', t => {
  const { file, matrix } = fixture(t);
  matrix.initialize();
  const original = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const mutate of [s => { s.policy = { allow: true }; }, s => { s.counts.engineer = 1000000; },
    s => { s.schema = 'OLD_UNVERIFIED'; }, s => { s.journal[0].sequence = 3; },
    s => { s.journal[0].secret = 'canary'; }]) {
    const state = structuredClone(original); mutate(state);
    fs.writeFileSync(file, JSON.stringify(state));
    assert.throws(() => matrix.status(), /MIND_STATE_INVALID/);
    assert.throws(() => matrix.initialize(), /MIND_STATE_INVALID/);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), state);
  }
});

test('corrupt, linked, oversized or permissive storage is refused', t => {
  const { root, file, matrix } = fixture(t);
  matrix.initialize();
  const original = fs.readFileSync(file);
  fs.writeFileSync(file, '{broken');
  assert.throws(() => matrix.status(), /MIND_STATE_RECORD_REJECTED/);
  fs.writeFileSync(file, Buffer.alloc(65537));
  assert.throws(() => matrix.status(), /MIND_STATE_RECORD_REJECTED/);
  fs.writeFileSync(file, original);
  fs.chmodSync(file, 0o644);
  assert.throws(() => matrix.status(), /MIND_STATE_RECORD_REJECTED/);
  fs.chmodSync(file, 0o600);
  fs.renameSync(file, path.join(root, 'outside.json'));
  fs.symlinkSync(path.join(root, 'outside.json'), file);
  assert.throws(() => matrix.status(), /MIND_STATE_RECORD_REJECTED/);
  assert.throws(() => matrix.initialize());
  assert.deepEqual(fs.readFileSync(path.join(root, 'outside.json')), original);
});

test('symlink state directories are refused without touching the target', t => {
  const { root, stateRoot, matrix } = fixture(t);
  fs.mkdirSync(path.join(root, 'target'), { mode: 0o700 });
  fs.symlinkSync(path.join(root, 'target'), stateRoot);
  assert.throws(() => matrix.initialize(), /MIND_STATE_UNAVAILABLE/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'target')), []);
});
