'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const kernelPath = require.resolve('../runtime/kernel/sheikha-kernel');
const kernel = require(kernelPath);
const bare = require('../runtime/bare-metal/manifest');
const cli = fs.readFileSync(path.join(__dirname, '../tools/runtime/sheikha-kernel-verify.cjs'), 'utf8');

function frozenTree(value) {
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') frozenTree(child);
  }
}

function runCli(args, implementation = kernel) {
  let stdout = '', stderr = '', loads = 0;
  const process = {
    argv: ['node', 'sheikha-kernel-verify.cjs', ...args], exitCode: 0,
    stdout: { write: text => { stdout += text; } },
    stderr: { write: text => { stderr += text; } }
  };
  vm.runInNewContext(cli, { process, require: id => {
    assert.equal(id, '../../runtime/kernel/sheikha-kernel');
    loads += 1;
    return implementation;
  } });
  return { stdout, stderr, loads, exitCode: process.exitCode };
}

test('manifest loads as deeply frozen metadata, not proof of OS support or hardware boot', () => {
  frozenTree(kernel.getManifest());
  assert.equal(kernel.manifest.platform, bare);
  assert.deepEqual(Object.keys(bare.layers), ['pop_os', 'microsoft', 'linux', 'apple', 'ubuntu', 'bare_metal']);
  for (const target of Object.values(bare.layers)) {
    assert.equal(target.status, 'TARGET_NOT_QUALIFIED');
    assert.equal(target.fullOsSupportVerified, false);
    assert.equal(target.systemModificationAllowed, false);
  }
  assert.equal(bare.seal, null);
  assert.equal(bare.evidence.bareMetalBootVerified, false);
  assert.equal(bare.evidence.universalCompatibility, false);
  assert.equal(bare.evidence.allSciencesIntegrated, false);
  assert.equal(bare.programming.shellExecution, false);
  assert.equal(bare.programming.liveAdapters, false);
  assert.throws(() => { bare.layers.apple.fullOsSupportVerified = true; }, TypeError);
});

test('creed and scientific methods remain references without automated certification or inference claims', () => {
  assert.equal(kernel.base, bare.base);
  assert.equal(bare.governance.reference, 'QURAN_AND_SUNNAH');
  assert.equal(bare.governance.automatedReligiousCertification, false);
  assert.equal(bare.governance.qualifiedHumanReviewRequired, true);
  assert.equal(bare.ai.providerConnected, false);
  assert.equal(bare.ai.modelInferenceExecuted, false);
  assert.equal(bare.ai.trainingExecuted, false);
  assert.equal(bare.ai.agiOrAsiVerified, false);
  assert.equal(kernel.manifest.science.methods.length, 11);
  assert.equal(kernel.manifest.science.evidenceRequired, true);
  assert.equal(kernel.manifest.science.conclusionsVerified, false);
});

test('health can be called detached and reports loading rather than live activation', () => {
  const { health } = kernel;
  const result = health();
  assert.equal(result.success, true);
  assert.equal(result.status, 'LOCAL_COMPONENTS_LOADED');
  for (const flag of ['live', 'bootExecuted', 'externalExecution', 'productionReady']) assert.equal(result[flag], false);
  assert.equal(result.seal, null);
});

test('fixed self-test exercises real local components without persistent registry mutations', () => {
  const first = kernel.verifyLocal();
  assert.equal(first.success, true);
  assert.equal(first.status, 'LOCAL_SELF_TEST_PASSED');
  assert.equal(Object.values(first.checks).every(value => value === true), true);
  assert.deepEqual(first.descriptors, { created: 3, persistent: false, quotaEnforced: true });
  assert.equal(first.programming.evidence.strictIsolation, true);
  assert.equal(first.programming.evidence.adapterDryRun, true);
  assert.deepEqual(first.programming.evidence.adapterCalls, []);
  assert.equal(first.research.conclusion, 'UNKNOWN');
  assert.equal(first.research.evidenceCount, 0);
  assert.equal(first.observedHost.platform, process.platform);
  for (const flag of ['bootExecuted', 'deviceCommandsSent', 'externalExecution', 'physicalHardwareQualified', 'productionReady']) {
    assert.equal(first[flag], false);
  }
  assert.deepEqual(kernel.verifyLocal(), first);
  first.programming.success = false;
  assert.equal(kernel.verifyLocal().programming.success, true);
});

test('all exported operations reject arbitrary options, prototypes, symbols and getters', () => {
  let getterCalled = false;
  const getter = Object.defineProperty({}, 'source', { get() { getterCalled = true; return 'ignored'; } });
  for (const operation of [kernel.getManifest, kernel.health, kernel.verifyLocal]) {
    for (const input of [null, [], '', 1, true, new Date(), Object.create({ live: true }),
      { live: true }, { source: 'untrusted' }, { humanApproved: true }, { [Symbol('approval')]: true }, getter]) {
      assert.throws(() => operation(input), /KERNEL_OPTIONS_NOT_ADMITTED/);
    }
    assert.ok(operation(Object.create(null)));
  }
  assert.equal(getterCalled, false);
});

test('failed component probes cannot produce a passed verification report', () => {
  const realRequire = createRequire(kernelPath);
  const module = { exports: {} };
  const load = id => id === '../../core/language/sheikha-managed-language-v1.cjs'
    ? { status: () => ({ success: false }) } : realRequire(id);
  vm.runInThisContext('(function(require,module){' + fs.readFileSync(kernelPath, 'utf8') + '\n})')(load, module);
  const result = module.exports.verifyLocal();
  assert.equal(result.success, false);
  assert.equal(result.status, 'LOCAL_SELF_TEST_FAILED');
  assert.equal(result.checks.programmingProbe, false);
  assert.equal(result.productionReady, false);
});

test('CLI emits the same structured manifest and fixed self-test as the module', () => {
  for (const [args, expected] of [[[], kernel.verifyLocal()], [['--manifest'], kernel.getManifest()]]) {
    const result = runCli(args);
    assert.equal(result.exitCode, 0);
    assert.equal(result.loads, 1);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), JSON.parse(JSON.stringify(expected)));
  }
});

test('CLI rejects flags before loading the kernel and never reflects their values', () => {
  for (const args of [['--live'], ['private-test-marker'], ['--manifest', '--manifest']]) {
    const result = runCli(args);
    assert.equal(result.exitCode, 2);
    assert.equal(result.loads, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'Usage: node tools/runtime/sheikha-kernel-verify.cjs [--manifest]\n');
  }
});

test('CLI failures are nonzero and internal exceptions are redacted', () => {
  const failed = runCli([], { verifyLocal: () => ({ success: false }) });
  assert.equal(failed.exitCode, 1);
  const thrown = runCli([], { verifyLocal: () => { throw new Error('private-test-marker'); } });
  assert.equal(thrown.exitCode, 1);
  assert.equal(thrown.stdout, '');
  assert.equal(thrown.stderr, 'LOCAL_KERNEL_VERIFICATION_FAILED\n');
});
