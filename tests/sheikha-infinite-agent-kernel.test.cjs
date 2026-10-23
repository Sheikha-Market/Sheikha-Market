'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const modulePath = require.resolve('../runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
const { SheikhaBot, SheikhaInfiniteAgentKernel, CAPABILITY_NAMES, POLICY } = require(modulePath);

function rejectsCode(run, code) {
  assert.throws(run, error => error.code === code);
}

test('import needs no I/O, process, timer or adapter APIs', () => {
  const exported = { exports: {} };
  vm.runInNewContext(fs.readFileSync(modulePath, 'utf8'), { module: exported }, { timeout: 1000 });
  assert.equal(typeof exported.exports.SheikhaInfiniteAgentKernel, 'function');
  const kernel = new SheikhaInfiniteAgentKernel();
  assert.equal(kernel.statistics().agents, 0);
  rejectsCode(() => new SheikhaBot(), 'BOT_CREATION_REQUIRES_KERNEL');
});

test('a bot has the full descriptor schema and two reference-only digital twin parties', () => {
  const kernel = new SheikhaInfiniteAgentKernel();
  const bot = kernel.registerBot({
    id: 'ceo', name: 'مدير شيخة',
    capabilities: { factory: { status: 'LOCAL_SIMULATION', adapterRef: 'urn:sheikha:adapter:factory' } },
    digitalTwin: {
      partyA: { physicalRef: 'urn:sheikha:factory:a', digitalRef: 'urn:sheikha:digital:a' },
      partyB: { physicalRef: 'urn:sheikha:factory:b', digitalRef: 'urn:sheikha:digital:b' }
    },
    manifest: { reference: 'urn:sheikha:manifest:ceo' }
  });
  assert.ok(bot instanceof SheikhaBot);
  assert.deepEqual(Object.keys(bot.capabilities), CAPABILITY_NAMES);
  assert.equal(bot.digitalTwin.partyB.digitalRef, 'urn:sheikha:digital:b');
  assert.equal(bot.digitalTwin.verified, false);
  assert.equal(bot.snapshot().evidence.neuralModelLive, false);
  assert.equal(bot.snapshot().evidence.operatingSystemBooted, false);
  assert.equal(bot.capabilities.factory.executionSupported, false);
  assert.equal(bot.snapshot().status, 'LOCAL_SIMULATION');
  const child = bot.spawnChild();
  assert.equal(child.schema, bot.schema);
  assert.equal(child.policy, bot.policy);
  assert.equal(child.parentId, bot.id);
  assert.equal(child.depth, 1);
  assert.deepEqual(Object.keys(child.capabilities), CAPABILITY_NAMES);
  assert.equal(child.capabilities.factory.adapterRef, null);
  assert.equal(child.manifest.reference, null);
  assert.equal(child.digitalTwin.partyA, null);
  rejectsCode(() => bot.spawnChild({ totalBudget: 100000 }), 'INVALID_BOT_DESCRIPTOR');
  rejectsCode(() => bot.spawnChild({ parentId: 'another-parent' }), 'INVALID_BOT_DESCRIPTOR');
});

test('replication is lazy, terminates explicitly, and scales within the central budget', () => {
  const kernel = new SheikhaInfiniteAgentKernel({ maxAgents: 1000, maxChildren: 1000, totalBudget: 1000 });
  const root = kernel.registerBot({ id: 'root' });
  const iterator = root.iterateChildren({ count: 999 });
  assert.equal(kernel.statistics().agents, 1);
  assert.equal(iterator.next().value.parentId, 'root');
  assert.equal(kernel.statistics().agents, 2);
  let children = 1;
  for (const child of iterator) {
    assert.equal(child.depth, 1);
    children += 1;
  }
  assert.equal(children, 999);
  assert.equal(kernel.statistics().budgetRemaining, 0);
  assert.equal(iterator.next().done, true);
  assert.equal(kernel.getChildren('root').length, 999);
  assert.equal(new Set(kernel.getChildren('root').map(bot => bot.id)).size, 999);
  rejectsCode(() => root.spawnChild(), 'MAX_AGENTS_EXCEEDED');
  const small = new SheikhaInfiniteAgentKernel();
  const stopped = small.registerBot().iterateChildren({ count: 10 });
  stopped.next();
  stopped.return();
  assert.equal(stopped.next().done, true);
  assert.equal(small.statistics().agents, 2);
});

test('depth, child count, agent count and total budget are independent admission limits', () => {
  const depth = new SheikhaInfiniteAgentKernel({ maxDepth: 1 });
  const child = depth.registerBot().spawnChild();
  rejectsCode(() => child.spawnChild(), 'MAX_DEPTH_EXCEEDED');
  assert.equal(depth.statistics().budgetSpent, 2);
  const count = new SheikhaInfiniteAgentKernel({ maxChildren: 1 });
  const parent = count.registerBot();
  parent.spawnChild();
  rejectsCode(() => parent.spawnChild(), 'MAX_CHILDREN_EXCEEDED');
  const agents = new SheikhaInfiniteAgentKernel({ maxAgents: 1, totalBudget: 5 });
  agents.registerBot();
  rejectsCode(() => agents.registerBot(), 'MAX_AGENTS_EXCEEDED');
  const budget = new SheikhaInfiniteAgentKernel({ maxAgents: 10, maxChildren: 10, totalBudget: 3 });
  const root = budget.registerBot();
  const first = root.iterateChildren({ count: 2 });
  const second = root.iterateChildren({ count: 2 });
  first.next();
  second.next();
  rejectsCode(() => first.next(), 'TOTAL_BUDGET_EXHAUSTED');
  rejectsCode(() => budget.registerBot(), 'TOTAL_BUDGET_EXHAUSTED');
  assert.equal(budget.statistics().agents, 3);
  assert.equal(budget.statistics().budgetSpent, 3);
});

test('invalid finite limits, oversized inputs, duplicate IDs and forged metadata fail atomically', () => {
  for (const value of [NaN, Infinity, -1, 1.5, '10', 100001]) {
    rejectsCode(() => new SheikhaInfiniteAgentKernel({ totalBudget: value }), 'INVALID_KERNEL_LIMIT');
  }
  rejectsCode(() => new SheikhaInfiniteAgentKernel({ totalBudget: 0 }), 'INVALID_KERNEL_LIMIT');
  const kernel = new SheikhaInfiniteAgentKernel({ maxDepth: 0, maxChildren: 0 });
  const root = kernel.registerBot({ id: 'root' });
  rejectsCode(() => root.spawnChild(), 'MAX_DEPTH_EXCEEDED');
  rejectsCode(() => kernel.registerBot({ id: 'root' }), 'DUPLICATE_BOT_ID');
  rejectsCode(() => kernel.registerBot({ id: 'x'.repeat(97) }), 'INVALID_BOT_ID');
  rejectsCode(() => kernel.registerBot({ name: 'x'.repeat(129) }), 'INVALID_BOT_NAME');
  rejectsCode(() => kernel.registerBot({ depth: 0 }), 'INVALID_BOT_DESCRIPTOR');
  rejectsCode(() => root.iterateChildren({ count: Infinity }), 'INVALID_CHILD_COUNT');
  rejectsCode(() => root.iterateChildren({ count: NaN }), 'INVALID_CHILD_COUNT');
  rejectsCode(() => root.iterateChildren({ count: 1 }), 'INVALID_CHILD_COUNT');
  rejectsCode(() => kernel.spawnChild('missing'), 'BOT_NOT_FOUND');
  assert.equal(kernel.statistics().agents, 1);
  assert.equal(kernel.statistics().budgetSpent, 1);
});

test('L0, limits, bot descriptors, registry views and iterator templates cannot mutate admission state', () => {
  const kernel = new SheikhaInfiniteAgentKernel();
  const root = kernel.registerBot();
  assert.equal(Object.isFrozen(POLICY.L0.rules), true);
  assert.throws(() => { root.policy.L0.immutable = false; }, TypeError);
  assert.throws(() => { kernel.limits.totalBudget = 100000; }, TypeError);
  assert.throws(() => { root.snapshot().depth = -100; }, TypeError);
  assert.throws(() => { root.capabilities.machine.status = 'LIVE'; }, TypeError);
  assert.throws(() => { kernel.getChildren(root.id).push(root); }, TypeError);
  const template = { name: 'Original', digitalTwin: { partyA: { digitalRef: 'urn:test:original' } } };
  const lazy = root.iterateChildren({ count: 1, template });
  template.name = 'Changed';
  template.digitalTwin.partyA.digitalRef = 'urn:test:changed';
  const child = lazy.next().value;
  assert.equal(child.snapshot().name, 'Original');
  assert.equal(child.digitalTwin.partyA.digitalRef, 'urn:test:original');
  assert.equal(kernel.statistics().agents, 2);
});

test('twin and manifest inputs admit references, reject credential payloads and never evaluate getters', () => {
  const kernel = new SheikhaInfiniteAgentKernel();
  rejectsCode(() => kernel.registerBot({ digitalTwin: { partyA: { digitalRef: 'urn:test:a', secrets: {} } } }), 'INVALID_DIGITAL_TWIN_PARTY');
  rejectsCode(() => kernel.registerBot({ manifest: { reference: 'urn:test:a', token: 'test' } }), 'INVALID_MANIFEST');
  rejectsCode(() => kernel.registerBot({ digitalTwin: { partyA: { digitalRef: 'https://user:password@example.invalid' } } }), 'INVALID_REFERENCE');
  rejectsCode(() => kernel.registerBot({ manifest: { reference: 'sk-example-secret' } }), 'INVALID_REFERENCE');
  rejectsCode(() => kernel.registerBot({ capabilities: { machine: { status: 'LIVE' } } }), 'INVALID_CAPABILITY_STATUS');
  let getterCalled = false;
  const input = {};
  Object.defineProperty(input, 'digitalTwin', { get() { getterCalled = true; return {}; } });
  rejectsCode(() => kernel.registerBot(input), 'INVALID_BOT_DESCRIPTOR');
  assert.equal(getterCalled, false);
  assert.equal(kernel.statistics().agents, 0);
});

test('L1 remains denied, L0 cannot change, unknown operations fail closed, and L2 only plans', () => {
  const bot = new SheikhaInfiniteAgentKernel().registerBot();
  for (const action of ['deploy', 'publish', 'change-dns', 'change-firewall', 'sign-contract', 'change-model-weights', 'change-permissions', 'operate-device']) {
    const result = bot.evaluateOperation({ action });
    assert.equal(result.level, 'L1');
    assert.equal(result.status, 'DENIED');
    assert.equal(result.reason, 'EXTERNAL_AUTHORIZATION_REQUIRED');
    assert.equal(result.executed, false);
  }
  rejectsCode(() => bot.evaluateOperation({ action: 'deploy', level: 'L2' }), 'OPERATION_LEVEL_MISMATCH');
  rejectsCode(() => bot.evaluateOperation({ action: 'deploy', humanApproved: true }), 'INVALID_OPERATION');
  assert.equal(bot.evaluateOperation({ action: 'change-l0-policy' }).reason, 'IMMUTABLE_L0_POLICY');
  assert.equal(bot.evaluateOperation({ action: 'run-shell' }).reason, 'UNKNOWN_OPERATION');
  const plan = bot.planLocalRepair({ action: 'inspect-module-resolution', targetRef: 'urn:module:missing' });
  assert.equal(plan.status, 'PLANNED');
  assert.equal(plan.executionSupported, false);
  assert.equal(plan.executed, false);
  rejectsCode(() => bot.planLocalRepair({ action: 'deploy' }), 'LOCAL_REPAIR_ACTION_NOT_ALLOWED');
  rejectsCode(() => bot.planLocalRepair({ action: 'prepare-cleanup-plan', command: 'rm -rf /tmp' }), 'INVALID_LOCAL_REPAIR_PLAN');
});
