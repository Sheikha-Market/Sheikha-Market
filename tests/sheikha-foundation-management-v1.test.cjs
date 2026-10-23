'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const f = require('../core/foundation/sheikha-foundation-management-v1.cjs');
test('seven components have distinct responsibility and acyclic dependencies', () => {
  const components = f.status().components;
  assert.equal(components.length, 7);
  const map = new Map(components.map(c => [c.component, c]));
  function visit(id, ancestors = []) {
    assert.ok(map.has(id)); assert.equal(ancestors.includes(id), false);
    for (const dependency of map.get(id).dependencies) visit(dependency, [...ancestors, id]);
  }
  for (const c of components) visit(c.component);
});
for (const component of ['utf', 'core', 'studio', 'lab', 'visual', 'firmware']) test(component + ' runs bounded local verification', () => {
  assert.equal(f.inspect(component).evidence.passed, true);
  assert.equal(f.inspect(component).productionActivation, 'UNKNOWN');
});
test('hardware admission never implies firmware flashing or physical boot', () => {
  for (const component of ['firmware', 'bare-metal']) {
    const result = f.activationPlan(component, { mode: 'local-foundation' });
    assert.equal(result.executionPerformed, false);
    assert.equal(result.firmwareWritten, false);
    assert.ok(result.blockers.includes('PHYSICAL_ACTIVATION_NOT_ADMITTED'));
  }
});
test('client flags cannot authorize services or hardware operations', () => {
  for (const input of [{ mode: 'production' }, { humanApproved: true }, { mode: 'local-foundation', flash: true }, { deploy: true }])
    assert.equal(f.activationPlan('core', input).decision, 'DENY');
  assert.throws(() => f.inspect('../secrets'), /UNKNOWN_COMPONENT/);
});
test('bare-metal inspection reports fresh digest comparison without new boot claims', () => {
  const result = f.inspect('bare-metal');
  assert.equal(result.evidence.bootExecutedThisSession, false);
  assert.equal(result.evidence.physicalHardwareVerified, 'UNKNOWN');
  assert.equal(result.evidence.artifacts.length, 2);
  assert.equal(result.evidence.passed, result.evidence.artifacts.every(a => a.matchesRecordedDigest));
});
test('SDK foundation management preserves bounded admission contract', async () => {
  const calls = [];
  const client = require('../sdk/sheikha-api').createSheikhaApiClient({ fetchImpl: async (url, options) => {
    calls.push({ url, options }); return { ok: true, json: async () => ({ success: true }) };
  } });
  await client.foundation.status(); await client.foundation.activationPlan('firmware');
  assert.equal(calls[0].url.endsWith('/foundation/managed/v1/status'), true);
  assert.deepEqual(JSON.parse(calls[1].options.body), { mode: 'local-foundation' });
});

test('foundation HTTP management rejects unauthenticated requests and live activation flags', () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  const middleware = []; const routes = new Map();
  const router = { use(fn) { middleware.push(fn); }, get(p, fn) { routes.set('GET ' + p, fn); }, post(p, fn) { routes.set('POST ' + p, fn); } };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../routes/sheikha-foundation-management-v1.cjs'), 'utf8'), {
    require(name) {
      if (name === 'express') return { Router: () => router, json: () => (_req, _res, next) => next() };
      if (name.includes('foundation-management')) return f;
      if (name.includes('sdk-mcp-governance')) return { redact: v => v, authenticateRequest: req => req.headers.authorization === 'test-key' ? {} : null };
      throw new Error('Unexpected dependency');
    }, module: { exports: {} }
  });
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
  let next = false; const denied = response(); middleware[1]({ headers: {} }, denied, () => { next = true; });
  assert.equal(denied.code, 401); assert.equal(next, false);
  middleware[1]({ headers: { authorization: 'test-key' } }, response(), () => { next = true; });
  assert.equal(next, true);
  const blocked = response(); routes.get('POST /components/:component/activation-plan')({ params: { component: 'firmware' }, body: { humanApproved: true, mode: 'production' } }, blocked);
  assert.equal(blocked.code, 403); assert.equal(blocked.body.executionPerformed, false);
  const unknown = response(); routes.get('GET /components/:component')({ params: { component: 'unknown' } }, unknown);
  assert.equal(unknown.code, 404);
});
