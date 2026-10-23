'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const planPath = require.resolve('../runtime/sheikha-infinite-agent/v1/sheikha-agent-integration-plan');
const { planHierarchy, buildIntegrationPlan } = require(planPath);

test('default hierarchy counts exactly without expanding or granting execution', () => {
  const plan = planHierarchy();
  assert.equal(plan.requestedDescriptors, '161');
  assert.deepEqual(plan.levels.map(row => row.descriptors), ['1', '10', '50', '100']);
  assert.equal(plan.fitsLocalDescriptorLimits, true);
  assert.equal(plan.descriptorsCreated, 0);
  assert.equal(plan.resourcesReserved, false);
  assert.equal(plan.executionAuthorized, false);
  assert.equal(plan.productionReady, false);
  assert.equal(planHierarchy([]).requestedDescriptors, '1');
});

test('million-worker request is counted and blocked without a million allocations', () => {
  const plan = planHierarchy([100, 10, 1000]);
  assert.equal(plan.requestedDescriptors, '1001101');
  assert.equal(plan.levels.length, 4);
  assert.equal(plan.status, 'CAPACITY_BLOCKED');
  assert.deepEqual(plan.violations.map(row => row.code), [
    'MAX_CHILDREN_EXCEEDED', 'MAX_AGENTS_EXCEEDED', 'TOTAL_BUDGET_EXCEEDED'
  ]);
  assert.equal(plan.liveWorkers, 0);
});

test('admission includes the root and enforces depth and total budgets at their boundaries', () => {
  assert.equal(planHierarchy([100, 8]).requestedDescriptors, '901');
  assert.equal(planHierarchy([100, 8]).fitsLocalDescriptorLimits, true);
  assert.equal(planHierarchy([100, 9]).requestedDescriptors, '1001');
  assert.equal(planHierarchy([100, 9]).fitsLocalDescriptorLimits, false);
  assert.equal(planHierarchy(Array(8).fill(1)).fitsLocalDescriptorLimits, true);
  assert.deepEqual(planHierarchy(Array(9).fill(1)).violations, [{ code: 'MAX_DEPTH_EXCEEDED', limit: 8 }]);
});

test('large requests use bounded exact arithmetic and retain central depth limits', () => {
  const plan = planHierarchy(Array(64).fill(1000000));
  assert.equal(plan.levels[64].descriptors, '1' + '0'.repeat(384));
  assert.ok(plan.violations.some(row => row.code === 'MAX_DEPTH_EXCEEDED'));
  assert.doesNotThrow(() => JSON.stringify(plan));
  assert.throws(() => planHierarchy(Array(65).fill(1)), { code: 'INVALID_BRANCHING' });
});

test('branching rejects nonfinite, sparse, exotic and executable inputs without evaluating getters', () => {
  for (const values of [null, {}, [0], [-1], [1.2], ['10'], [Infinity], [NaN], [1000001], new Array(2)]) {
    assert.throws(() => planHierarchy(values), { code: 'INVALID_BRANCHING' });
  }
  let called = false;
  const value = [1];
  Object.defineProperty(value, '0', { get() { called = true; return 1; } });
  assert.throws(() => planHierarchy(value), { code: 'INVALID_BRANCHING' });
  assert.equal(called, false);
  assert.throws(() => planHierarchy(Object.assign([1], { command: 'run' })), { code: 'INVALID_BRANCHING' });
});

test('integration reuses bounded kernel, natural model, research plan and industrial simulation', () => {
  const plan = buildIntegrationPlan({ hsCode: '7208', factoryRef: 'urn:factory:example', method: 'simulation' });
  assert.equal(plan.representativeRegistry.count, 5);
  for (const bot of plan.representativeRegistry.descriptors) {
    assert.equal(Object.keys(bot.capabilities).length, 14);
    assert.equal(bot.evidence.physicalExecution, false);
    assert.equal(bot.evidence.neuralModelLive, false);
  }
  assert.equal(plan.garden.example.synthetic, true);
  assert.equal(plan.garden.example.trainingPerformed, false);
  assert.equal(plan.research.plan.method, 'simulation');
  assert.equal(plan.research.plan.authorityGranted, false);
  assert.equal(plan.industrialExample.state, 'COMPLETE');
  assert.equal(plan.industrialExample.cells.length, 7);
  assert.equal(plan.industrialExample.physicalCommandSent, false);
  assert.equal(plan.supplyChain.stages.length, 8);
  assert.equal(plan.supplyChain.logisticsModes.length, 6);
  assert.equal(plan.factory.registrationVerified, false);
  assert.equal(plan.governmentIntegration.status, 'NOT_CONNECTED');
});

test('HS input is a reference format check only, never a customs classification', () => {
  assert.equal(buildIntegrationPlan().product.hsCode, null);
  for (const hsCode of ['0101', '010121', '999999']) {
    const { product } = buildIntegrationPlan({ hsCode });
    assert.equal(product.hsCode, hsCode);
    assert.equal(product.codeCheck, 'FORMAT_ONLY');
    assert.equal(product.classificationVerified, false);
    assert.equal(product.edition, null);
  }
  for (const hsCode of [null, 7208, '123', '12345678', 'ABCD', ' 7208']) {
    assert.throws(() => buildIntegrationPlan({ hsCode }), { code: 'INVALID_HS_CODE_FORMAT' });
  }
});

test('every link resolves and output is deeply immutable and deterministic', () => {
  const plan = buildIntegrationPlan();
  const ids = new Set(plan.representativeRegistry.descriptors.map(row => row.id));
  for (const link of plan.links) { assert.ok(ids.has(link.from)); assert.ok(ids.has(link.to)); }
  assert.throws(() => { plan.hierarchy.limits.maxAgents = Infinity; }, TypeError);
  assert.throws(() => { plan.supplyChain.stages.push('new'); }, TypeError);
  assert.throws(() => { plan.garden.example.targets.runoffMm = 999; }, TypeError);
  assert.deepEqual(buildIntegrationPlan(), plan);
});

test('caller data is neither changed nor retained and missing references remain unverified', () => {
  const input = { branching: [2, 3], factoryRef: 'urn:example:factory', scienceRef: 'urn:example:science' };
  const before = JSON.stringify(input);
  const plan = buildIntegrationPlan(input);
  assert.equal(JSON.stringify(input), before);
  input.branching[0] = 100;
  assert.equal(plan.hierarchy.requestedDescriptors, '9');
  assert.equal(plan.factory.scienceRef, undefined);
  assert.equal(plan.research.scienceRef, 'urn:example:science');
  assert.equal(plan.factory.registrationRef, null);
  assert.equal(plan.factory.physicalConnection, false);
});

test('planning holds even when the descriptor hierarchy fits or caller asserts authorization', () => {
  const plan = buildIntegrationPlan({ branching: [1] });
  assert.equal(plan.productionHold, true);
  assert.equal(plan.productionReady, false);
  assert.equal(plan.externalExecution, false);
  assert.equal(plan.referenceBoundary.unseenWorldClaim, false);
  assert.equal(plan.referenceBoundary.biologicalTwinAvailable, false);
  for (const input of [{ humanApproved: true }, { execute: true }, { limits: { maxAgents: 9999999 } }, { endpoint: 'https://example.invalid' }]) {
    assert.throws(() => buildIntegrationPlan(input), { code: 'INVALID_PLAN_INPUT' });
  }
});

test('references are not credentials, commands, verified registrations or external twins', () => {
  for (const factoryRef of ['https://user:password@example.invalid', 'sk-example-secret', 'rm /tmp/x', null, 'x'.repeat(97)]) {
    assert.throws(() => buildIntegrationPlan({ factoryRef }), { code: 'INVALID_PLAN_REFERENCE' });
  }
  let called = false;
  const input = {};
  Object.defineProperty(input, 'factoryRef', { get() { called = true; return 'factory'; } });
  assert.throws(() => buildIntegrationPlan(input), { code: 'INVALID_PLAN_INPUT' });
  assert.equal(called, false);
  assert.throws(() => buildIntegrationPlan({ method: 'all-science' }), { code: 'INVALID_RESEARCH_METHOD' });
  assert.throws(() => buildIntegrationPlan({ scenario: 'unseen-world' }), { code: 'UNKNOWN_SYNTHETIC_SCENARIO' });
});

test('planning dependency graph runs without network, filesystem, timers or process APIs', () => {
  const cache = new Map();
  const context = vm.createContext({});
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const source = fs.readFileSync(filename, 'utf8');
    if (filename.endsWith('.json')) return JSON.parse(source);
    const module = { exports: {} };
    const localRequire = createRequire(filename);
    function requireLocal(id) {
      assert.ok(id.startsWith('.'), 'Only local source modules may be required');
      return load(localRequire.resolve(id));
    }
    const evaluate = vm.runInContext('(function(require, module) {\n' + source + '\n})', context, { timeout: 1000 });
    evaluate(requireLocal, module);
    cache.set(filename, module.exports);
    return module.exports;
  }
  const model = load(planPath);
  assert.equal(model.buildIntegrationPlan().externalExecution, false);
});

test('CLI creates plans, reports capacity rejection and never echoes invalid input', () => {
  const cli = path.join(__dirname, '../tools/runtime/sheikha-agent-integration-plan.cjs');
  const run = args => {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 5000, maxBuffer: 256 * 1024 });
    assert.ifError(result.error);
    return result;
  };
  const good = run(['--scenario', 'arabia', '--hs-code', '7208']);
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).garden.scenario, 'arabia');
  const blocked = run(['--branching', '100,10,1000']);
  assert.equal(blocked.status, 1);
  assert.equal(JSON.parse(blocked.stdout).hierarchy.status, 'CAPACITY_BLOCKED');
  const invalid = run(['--secret', 'private-test-value']);
  assert.equal(invalid.status, 2);
  assert.equal((invalid.stdout + invalid.stderr).includes('private-test-value'), false);
  for (const args of [['--branching', 'Infinity'], ['--branching', ''], ['--branching', '0'],
    ['--scenario', 'unseen-world'], ['--hs-code', 'not-a-code']]) {
    assert.equal(run(args).status, 2);
  }
});

test('clean build policy follows the planning CLI imports as an explicit entrypoint', () => {
  const policy = require('../config/cloud/sheikha-cloud-build-context-v1.json');
  assert.ok(policy.entrypoints.includes('tools/runtime/sheikha-agent-integration-plan.cjs'));
});
