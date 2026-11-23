'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const bounded = require('../runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
const InfiniteKernel = require('../runtime/infinite/kernel');

test('legacy constructor starts empty and reports explicit unverified evidence', () => {
  const kernel = new InfiniteKernel();
  assert.ok(kernel instanceof bounded.SheikhaInfiniteAgentKernel);
  const result = kernel.status();
  assert.equal(result.status, 'LOCAL_DESCRIPTOR_MODEL');
  assert.equal(result.totalBots, 0);
  assert.equal(kernel.totalBots, 0);
  assert.equal(kernel.seal, null);
  assert.equal(result.seal, null);
  assert.equal(result.sealStatus, 'NOT_VERIFIED');
  assert.equal(result.countScope, 'LOCAL_IN_MEMORY_DESCRIPTORS');
  assert.equal(result.reference, 'QURAN_AND_SUNNAH');
  for (const key of ['bareMetalBootVerified', 'liveNeuralNetwork', 'externalExecution', 'persistent', 'productionReady']) {
    assert.equal(result[key], false);
  }
  assert.equal(JSON.stringify(result).includes('SEALED'), false);
});

test('counts follow actual local registration and cannot be replaced with a fixed count', () => {
  const kernel = new InfiniteKernel({ maxAgents: 2, totalBudget: 2 });
  const before = kernel.status();
  kernel.registerBot().spawnChild();
  assert.equal(kernel.totalBots, 2);
  assert.equal(kernel.status().totalBots, kernel.statistics().agents);
  assert.equal(before.totalBots, 0);
  assert.throws(() => { kernel.totalBots = 58; }, TypeError);
  assert.throws(() => { kernel.seal = 'SEALED'; }, TypeError);
  assert.throws(() => { before.totalBots = 58; }, TypeError);
  assert.throws(() => kernel.registerBot(), error => error.code === 'MAX_AGENTS_EXCEEDED');
  assert.equal(kernel.status().totalBots, 2);
});

test('legacy instances remain independent and deny device execution', () => {
  const first = new InfiniteKernel();
  const second = new InfiniteKernel();
  const bot = first.registerBot();
  assert.equal(second.status().totalBots, 0);
  const decision = bot.evaluateOperation({ action: 'operate-device' });
  assert.equal(decision.status, 'DENIED');
  assert.equal(decision.executed, false);
  assert.equal(decision.executionSupported, false);
  assert.throws(() => new InfiniteKernel({ totalBots: 58 }), error => error.code === 'INVALID_KERNEL_OPTIONS');
});

test('import only delegates to the bounded module without I/O or automatic registration', () => {
  const exported = { exports: {} };
  const source = fs.readFileSync(require.resolve('../runtime/infinite/kernel'), 'utf8');
  const imports = [];
  vm.runInNewContext(source, {
    module: exported,
    require(id) {
      imports.push(id);
      assert.equal(id, '../sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
      return bounded;
    }
  }, { timeout: 1000 });
  assert.equal(imports.length, 1);
  // Supply a host-realm data record to the bounded module's record validator.
  assert.equal(new exported.exports({}).status().totalBots, 0);
});
