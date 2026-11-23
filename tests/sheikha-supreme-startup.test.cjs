'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const begin = '// SHEIKHA_SUPREME_STARTUP_BEGIN';
const end = '// SHEIKHA_SUPREME_STARTUP_END';
const governance = './global-neural-governance-init.js';
const activation = './core/supreme/sheikha-supreme-full-activation.js';
const bootstrap = server.slice(server.indexOf(begin) + begin.length, server.indexOf(end));

function execute({ missing = false, resolveError, loadError, governanceError } = {}) {
  const calls = [];
  const logs = [];
  const warnings = [];
  function requireFixture(name) {
    calls.push(['require', name]);
    if (name === governance) {
      if (governanceError) throw governanceError;
      return () => { throw new Error('ADVISORY_MUST_NOT_BE_EXECUTED'); };
    }
    assert.equal(name, '/fixture/activation.js');
    if (loadError) throw loadError;
    return {};
  }
  requireFixture.resolve = name => {
    calls.push(['resolve', name]);
    assert.equal(name, activation);
    if (resolveError) throw resolveError;
    if (missing) throw Object.assign(new Error('fixture missing'), { code: 'MODULE_NOT_FOUND' });
    return '/fixture/activation.js';
  };
  let error;
  try {
    vm.runInNewContext(bootstrap, {
      require: requireFixture,
      console: { log: value => logs.push(value), warn: value => warnings.push(value) }
    }, { timeout: 1000 });
  } catch (caught) { error = caught; }
  return { calls, logs, warnings, error };
}

test('startup occurs once before the application and keeps governance mandatory', () => {
  assert.equal(server.split(begin).length, 2);
  assert.equal(server.split(end).length, 2);
  assert.ok(server.indexOf(end) < server.indexOf("const express = require('express')"));
  assert.ok(server.indexOf(end) < server.indexOf('const app = express()'));
  assert.equal(server.split("require('./global-neural-governance-init.js')").length, 2);
  assert.ok(fs.existsSync(path.join(root, governance)));
  new vm.Script(bootstrap);
});

test('a missing optional activation module is reported without a success claim', () => {
  const result = execute({ missing: true });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.calls, [['require', governance], ['resolve', activation]]);
  assert.deepEqual(result.logs, []);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /NOT_CONFIGURED/);
});

test('successful import reports module loading, not verified bots or production', () => {
  const result = execute();
  assert.equal(result.error, undefined);
  assert.deepEqual(result.calls, [
    ['require', governance], ['resolve', activation], ['require', '/fixture/activation.js']
  ]);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.logs.length, 1);
  assert.match(result.logs[0], /MODULE_LOADED/);
  assert.match(result.logs[0], /not yet verified/);
  assert.doesNotMatch(result.logs[0], /58|5 FOUNDRIES|8 MINDS|SUPREME ACTIVATION/);
});

test('a transitive missing dependency fails startup instead of being treated as absent configuration', () => {
  const result = execute({ loadError: Object.assign(new Error('private-fixture-value'), { code: 'MODULE_NOT_FOUND' }) });
  assert.equal(result.error.message, 'SHEIKHA_SUPREME_ACTIVATION_LOAD_FAILED');
  assert.deepEqual(result.logs, []);
  assert.deepEqual(result.warnings, []);
  assert.doesNotMatch(result.error.stack, /private-fixture-value/);
});

test('an activation exception never emits a success log or leaks its message', () => {
  const result = execute({ loadError: new Error('private-fixture-value') });
  assert.equal(result.error.message, 'SHEIKHA_SUPREME_ACTIVATION_LOAD_FAILED');
  assert.deepEqual(result.logs, []);
  assert.doesNotMatch(result.error.stack, /private-fixture-value/);
});

test('non-missing resolution errors are not silently ignored', () => {
  const failure = Object.assign(new Error('fixture denied'), { code: 'EACCES' });
  const result = execute({ resolveError: failure });
  assert.equal(result.error, failure);
  assert.deepEqual(result.logs, []);
  assert.deepEqual(result.warnings, []);
});

test('governance failure prevents optional activation from running', () => {
  const failure = new Error('governance unavailable');
  const result = execute({ governanceError: failure });
  assert.equal(result.error, failure);
  assert.deepEqual(result.calls, [['require', governance]]);
  assert.deepEqual(result.logs, []);
});
