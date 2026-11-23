'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const previousSecret = process.env.JWT_SECRET;
const previousNodeEnv = process.env.NODE_ENV;
const testSecret = 'infinite-agent-test-only-admin-secret-2026';
process.env.JWT_SECRET = testSecret;
process.env.NODE_ENV = 'test';
const routePath = require.resolve('../routes/sheikha-infinite-agent/sheikha-infinite-agent-routes');
after(() => {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
});

function token(role) {
  return jwt.sign({ id: 'route-test-operator', role }, testSecret, { expiresIn: '1m' });
}

function adminGet(api, endpoint) {
  return api.get(endpoint).set('Authorization', 'Bearer ' + token('admin'));
}

function adminPost(api, endpoint) {
  return api.post(endpoint).set('Authorization', 'Bearer ' + token('admin'));
}

function design(api) { return adminGet(api, '/api/infinite-agent/design'); }

async function application(t, preparse = false, localKernelOverride) {
  delete require.cache[routePath];
  const app = express();
  if (preparse) app.use(express.json({ limit: '1mb' }));
  let router;
  if (localKernelOverride) {
    const module = { exports: {} };
    const routeRequire = createRequire(routePath);
    const load = id => id === '../../runtime/kernel/sheikha-kernel' ? localKernelOverride : routeRequire(id);
    vm.runInThisContext('(function(require,module){' + fs.readFileSync(routePath, 'utf8') + '\n})')(load, module);
    router = module.exports;
  } else {
    router = require(routePath);
  }
  app.use('/api/infinite-agent', router);
  app.use('/api/sheikha-kernel', router);
  app.use('/api/cosmic-engineering', router.createNaturalRouter());
  delete require.cache[require.resolve('../routes/cosmic')];
  app.use('/api/cosmic', localKernelOverride ? router.createNaturalRouter() : require('../routes/cosmic'));
  app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  return request(server);
}

test('the complete server parses without executing startup and keeps one listener', () => {
  const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'server.js' }));
  assert.equal((source.match(/app\.listen\(/g) || []).length, 1);
  assert.ok(source.includes('server = app.listen(PORT, HOST,'));
});

test('mount occurs once before the API catch-all and preserves the Cloud Run host', () => {
  const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  const marker = source.indexOf('// SHEIKHA_INFINITE_AGENT_BEFORE_404');
  assert.ok(marker > 0);
  assert.ok(marker < source.indexOf('app.use((req, res) => {', marker));
  for (const prefix of ['/api/infinite-agent', '/api/sheikha-kernel', '/api/cosmic-engineering', '/api/cosmic']) {
    assert.equal(source.split("app.use('" + prefix + "',").length, 2);
  }
  assert.ok(source.indexOf("app.use('/api/cosmic-engineering'") < source.indexOf('app.use((req, res) => {', marker));
  assert.ok(source.indexOf("app.use('/api/cosmic'") < source.indexOf('app.use((req, res) => {', marker));
  assert.ok(source.includes("process.env.HOST || (process.env.K_SERVICE ? '0.0.0.0' : '127.0.0.1')"));
  assert.equal(source.includes('Infinite Agent V43.80 OMNI ACTIVE'), false);
  assert.ok(marker < source.indexOf('app.use(express.json());'));
  assert.ok(source.includes("app.use(['/api/infinite-agent', '/api/sheikha-kernel', '/api/cosmic-engineering', '/api/cosmic'], generalLimiter)"));
  assert.ok(source.includes("app.use('/api/cosmic', require('./routes/cosmic'));"));
});

test('legacy infinite route imports the canonical router without a separate public registry', async t => {
  const api = await application(t);
  delete require.cache[require.resolve('../routes/infinite')];
  assert.equal(require('../routes/infinite'), require(routePath));
  const initial = await design(api);
  assert.equal(initial.body.totalBots, 0);
  assert.equal(initial.body.sealStatus, 'NOT_VERIFIED');
  assert.equal(initial.body.countScope, 'LOCAL_IN_MEMORY_DESCRIPTORS');
  assert.equal((await adminPost(api, '/api/infinite-agent/spawn').send({})).status, 201);
  const current = await adminGet(api, '/api/sheikha-kernel/full');
  assert.equal(current.body.totalBots, 1);
  assert.equal(current.body.totalBots, current.body.statistics.agents);
  assert.equal(current.body.seal, null);
  assert.equal((await api.get('/api/infinite-agent/status')).body.totalBots, undefined);
});

test('public status allowlist contains service flags without disclosing design or state', async t => {
  const api = await application(t);
  const expected = ['bounded', 'liveNeuralNetwork', 'localSimulation', 'schema', 'status', 'success'];
  for (const prefix of ['/api/infinite-agent', '/api/sheikha-kernel']) {
    for (const endpoint of ['', '/status']) {
      const result = await api.get(prefix + endpoint);
      assert.equal(result.status, 200);
      assert.equal(result.headers['cache-control'], 'no-store');
      assert.deepEqual(Object.keys(result.body).sort(), expected);
      assert.equal(result.body.liveNeuralNetwork, false);
      assert.equal(result.body.bounded, true);
      assert.equal(result.body.localSimulation, true);
      assert.equal(typeof result.body.schema, 'string');
      assert.equal(JSON.stringify(result.body).includes(testSecret), false);
    }
  }
  assert.equal((await api.head('/api/infinite-agent/status')).status, 200);
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('every design and scenario path requires an authenticated admin independently of cloud IAM', async t => {
  const api = await application(t);
  const paths = ['/api/infinite-agent/design', '/api/infinite-agent/jannah', '/api/infinite-agent/arabia',
    '/api/cosmic-engineering', '/api/cosmic-engineering/metadata', '/api/cosmic-engineering/scenarios',
    '/api/cosmic-engineering/island', '/api/cosmic-engineering/rasul', '/api/cosmic/rasul'];
  for (const endpoint of paths) {
    const anonymous = await api.get(endpoint).set('X-Role', 'admin').set('X-Human-Approved', 'true');
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers['cache-control'], 'no-store');
    assert.equal(anonymous.body.model, undefined);
    assert.equal(anonymous.body.policy, undefined);
    const customer = await api.get(endpoint).set('Authorization', 'Bearer ' + token('customer'));
    assert.equal(customer.status, 403);
    const admin = await adminGet(api, endpoint);
    assert.equal(admin.status, 200);
    assert.equal(JSON.stringify(admin.body).includes(testSecret), false);
  }
  for (const endpoint of ['/api/infinite-agent/simulate', '/api/cosmic-engineering/simulate']) {
    assert.equal((await api.post(endpoint).send({ humanApproved: true })).status, 401);
    assert.equal((await api.post(endpoint).set('Authorization', 'Bearer ' + token('customer')).send({})).status, 403);
    assert.equal((await adminPost(api, endpoint).send({})).status, 200);
  }
  assert.equal((await adminGet(api, '/api/infinite-agent/jannah')).body.unseenWorldClaim, false);
  assert.equal((await adminGet(api, '/api/infinite-agent/arabia')).body.realWorldForecast, false);
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('simulation conserves synthetic water and rejects unbounded or unknown inputs', async t => {
  const api = await application(t);
  const result = await adminPost(api, '/api/infinite-agent/simulate').send({ scenario: 'arabia', rainMm: 10 });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.synthetic, true);
  assert.equal(result.body.data.water.conserved, true);
  assert.equal(result.body.externalExecution, false);
  for (const payload of [{ rainMm: -1 }, { rainMm: 1e20 }, { rainMm: '10' },
    { scenario: 'jannah' }, { humanApproved: true }, { endpoint: 'https://example.invalid' }]) {
    assert.equal((await adminPost(api, '/api/infinite-agent/simulate').send(payload)).status, 400);
  }
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('cosmic engineering alias serves the same pure model without changing kernel state', async t => {
  const api = await application(t);
  for (const endpoint of ['', '/metadata', '/scenarios', '/island']) {
    const result = await adminGet(api, '/api/cosmic-engineering' + endpoint);
    assert.equal(result.status, 200);
    assert.equal(result.body.synthetic, true);
    if (endpoint === '/island') assert.equal(result.body.scenario.id, 'island');
  }
  const simulation = await adminPost(api, '/api/cosmic-engineering/simulate').send({ scenario: 'meadow' });
  assert.equal(simulation.status, 200);
  assert.equal(simulation.body.data.water.conserved, true);
  assert.equal((await adminPost(api, '/api/cosmic-engineering/spawn').send({})).status, 404);
  for (const endpoint of ['/api/cosmic-engineering/rasul', '/api/cosmic/rasul']) {
    const frame = await adminGet(api, endpoint);
    assert.equal(frame.status, 200);
    assert.equal(frame.body.status, 'REFERENCE_FRAME_ONLY');
    assert.equal(frame.body.bodyDigitalTwinAvailable, false);
    assert.equal(frame.body.dnaDataAvailable, false);
    assert.equal(frame.body.prophetAsSoftwareEntity, false);
  }
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('spawn GET is read-only 405 and caller assertions cannot replace admin authentication', async t => {
  const api = await application(t);
  assert.equal((await api.get('/api/infinite-agent/spawn')).status, 401);
  const get = await adminGet(api, '/api/infinite-agent/spawn');
  assert.equal(get.status, 405);
  assert.equal(get.headers.allow, 'POST');
  const unauthenticated = await api.post('/api/infinite-agent/spawn')
    .set('X-Role', 'admin').send({ humanApproved: true });
  assert.equal(unauthenticated.status, 401);
  assert.equal((await api.post('/api/infinite-agent/spawn')
    .set('Authorization', 'Bearer invalid').send({})).status, 401);
  assert.equal((await api.post('/api/infinite-agent/spawn')
    .set('Authorization', 'Bearer ' + token('customer')).send({})).status, 403);
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('configured admin creates bounded local descriptors with atomic quota rejection', async t => {
  const api = await application(t);
  const admin = payload => api.post('/api/infinite-agent/spawn')
    .set('Authorization', 'Bearer ' + token('admin')).send(payload);
  const root = await admin({ descriptor: { id: 'root' } });
  assert.equal(root.status, 201);
  assert.equal(root.body.externalExecution, false);
  assert.equal(root.body.persistent, false);
  for (const payload of [{ count: 101 }, { count: 1.5 }, { humanApproved: true },
    { descriptor: { humanApproved: true } }, { parentId: 'root', count: 2, descriptor: { id: 'duplicate' } }]) {
    assert.equal((await admin(payload)).status, 400);
  }
  assert.equal((await design(api)).body.statistics.agents, 1);
  assert.equal((await admin({ parentId: 'missing' })).status, 404);
  const children = await admin({ parentId: 'root', count: 100 });
  assert.equal(children.status, 201);
  assert.equal(children.body.created, 100);
  assert.equal((await admin({ parentId: 'root' })).status, 409);
  assert.equal((await design(api)).body.statistics.agents, 101);
});

test('central limit stays at 1000 descriptors across multiple roots', async t => {
  const api = await application(t);
  const admin = payload => api.post('/api/infinite-agent/spawn')
    .set('Authorization', 'Bearer ' + token('admin')).send(payload);
  for (let index = 0; index < 9; index += 1) {
    const id = 'root-' + index;
    assert.equal((await admin({ descriptor: { id } })).status, 201);
    assert.equal((await admin({ parentId: id, count: 100 })).status, 201);
  }
  assert.equal((await admin({ descriptor: { id: 'last-root' } })).status, 201);
  assert.equal((await admin({ parentId: 'last-root', count: 91 })).status, 409);
  assert.equal((await admin({ parentId: 'last-root', count: 90 })).status, 201);
  assert.equal((await admin({})).status, 409);
  const status = await design(api);
  assert.equal(status.body.statistics.agents, 1000);
  assert.equal(status.body.statistics.budgetRemaining, 0);
});

test('spawn remains forbidden when an explicit JWT key is unavailable', async t => {
  process.env.JWT_SECRET = '';
  let api;
  try { api = await application(t); } finally { process.env.JWT_SECRET = testSecret; }
  const result = await api.post('/api/infinite-agent/spawn')
    .set('Authorization', 'Bearer ' + token('admin')).send({});
  assert.equal(result.status, 403);
  assert.equal(result.body.error, 'ADMIN_AUTH_NOT_CONFIGURED');
  for (const endpoint of ['/api/infinite-agent/design', '/api/infinite-agent/full',
    '/api/sheikha-kernel/full', '/api/cosmic-engineering', '/api/cosmic/rasul',
    '/api/cosmic/full', '/api/cosmic/water', '/api/cosmic/atoms',
    '/api/sheikha-kernel/manifest', '/api/sheikha-kernel/self-test']) {
    assert.equal((await adminGet(api, endpoint)).status, 403);
  }
  assert.equal((await adminPost(api, '/api/sheikha-kernel/self-test').send({})).status, 403);
  assert.equal((await api.get('/api/infinite-agent/status')).status, 200);
});

test('malformed JSON, excess body size and query overrides are rejected', async t => {
  const api = await application(t, true);
  assert.equal((await api.get('/api/infinite-agent/status?humanApproved=true')).status, 400);
  assert.equal((await adminPost(api, '/api/infinite-agent/simulate')
    .send({ scenario: 'x'.repeat(17000) })).status, 413);
  const standalone = await application(t);
  const malformed = await adminPost(standalone, '/api/infinite-agent/simulate')
    .set('Content-Type', 'application/json').send('{');
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error, 'INVALID_JSON');
});

test('compatibility full and water routes retain admin protection and truthful model labels', async t => {
  const api = await application(t);
  const endpoints = ['/api/infinite-agent/full', '/api/sheikha-kernel/full',
    '/api/cosmic/full', '/api/cosmic/water', '/api/cosmic-engineering/full',
    '/api/cosmic-engineering/water'];
  for (const endpoint of endpoints) {
    const anonymous = await api.get(endpoint).set('X-Role', 'admin');
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers['cache-control'], 'no-store');
    assert.equal((await api.get(endpoint)
      .set('Authorization', 'Bearer ' + token('customer'))).status, 403);
    const admin = await adminGet(api, endpoint);
    assert.equal(admin.status, 200);
    assert.equal(admin.headers['cache-control'], 'no-store');
    assert.equal(JSON.stringify(admin.body).includes(testSecret), false);
  }
  const full = await adminGet(api, '/api/sheikha-kernel/full');
  assert.equal(full.body.liveNeuralNetwork, false);
  assert.equal(full.body.externalExecution, false);
  assert.equal(full.body.seal, null);
  assert.equal(full.body.statistics.agents, 0);
  const water = await adminGet(api, '/api/cosmic/water');
  assert.equal(water.body.synthetic, true);
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('atomic compatibility endpoint denies anonymous callers and reports no atomic simulation', async t => {
  const api = await application(t);
  for (const endpoint of ['/api/cosmic/atoms', '/api/cosmic-engineering/atoms']) {
    assert.equal((await api.get(endpoint)).status, 401);
    assert.equal((await api.get(endpoint).set('Authorization', 'Bearer ' + token('customer'))).status, 403);
    const admin = await adminGet(api, endpoint);
    assert.equal(admin.status, 501);
    assert.equal(admin.body.success, false);
    assert.equal(admin.body.error, 'ATOMIC_SIMULATION_NOT_IMPLEMENTED');
    assert.equal(admin.body.executed, false);
    assert.equal(admin.headers['cache-control'], 'no-store');
  }
  assert.equal((await design(api)).body.statistics.agents, 0);
});

test('kernel manifest requires admin and does not imply hardware or AI activation', async t => {
  const api = await application(t);
  for (const prefix of ['/api/infinite-agent', '/api/sheikha-kernel']) {
    assert.equal((await api.get(prefix + '/manifest')).status, 401);
    assert.equal((await api.get(prefix + '/manifest')
      .set('Authorization', 'Bearer ' + token('customer'))).status, 403);
    const result = await adminGet(api, prefix + '/manifest');
    assert.equal(result.status, 200);
    assert.equal(result.headers['cache-control'], 'no-store');
    assert.equal(result.body.data.schema, 'SHEIKHA_LOCAL_KERNEL_COMPOSITION_V1');
    assert.equal(result.body.data.platform.evidence.bareMetalBootVerified, false);
    assert.equal(result.body.data.platform.ai.providerConnected, false);
    assert.equal(result.body.data.productionReady, false);
    assert.equal((await adminGet(api, prefix + '/manifest?live=true')).status, 400);
  }
});

test('fixed kernel self-test requires admin POST and cannot mutate the shared registry', async t => {
  const api = await application(t);
  assert.equal((await adminPost(api, '/api/infinite-agent/spawn').send({})).status, 201);
  for (const prefix of ['/api/infinite-agent', '/api/sheikha-kernel']) {
    assert.equal((await api.get(prefix + '/self-test')).status, 401);
    assert.equal((await api.post(prefix + '/self-test').send({})).status, 401);
    assert.equal((await api.post(prefix + '/self-test')
      .set('Authorization', 'Bearer ' + token('customer')).send({})).status, 403);
    const get = await adminGet(api, prefix + '/self-test');
    assert.equal(get.status, 405);
    assert.equal(get.headers.allow, 'POST');
    const result = await adminPost(api, prefix + '/self-test').send({});
    assert.equal(result.status, 200);
    assert.equal(result.headers['cache-control'], 'no-store');
    assert.equal(result.body.success, true);
    assert.equal(result.body.status, 'LOCAL_SELF_TEST_PASSED');
    assert.equal(Object.values(result.body.checks).every(value => value === true), true);
    assert.equal(result.body.descriptors.created, 3);
    assert.equal(result.body.descriptors.persistent, false);
    assert.equal(result.body.bootExecuted, false);
    assert.equal(result.body.externalExecution, false);
    assert.equal(result.body.productionReady, false);
    assert.equal((await design(api)).body.statistics.agents, 1);
  }
});

test('kernel self-test accepts only an empty JSON object with no query overrides', async t => {
  for (const preparse of [false, true]) {
    const api = await application(t, preparse);
    assert.equal((await adminPost(api, '/api/sheikha-kernel/self-test').send('{}')).status, 415);
    for (const input of [[], { source: 'untrusted' }, { live: true }, { humanApproved: true },
      { maxAgents: 1000000 }, JSON.parse('{"__proto__":{"live":true}}')]) {
      const result = await adminPost(api, '/api/sheikha-kernel/self-test')
        .set('Content-Type', 'application/json').send(JSON.stringify(input));
      assert.equal(result.status, 400);
      assert.equal(result.body.success, false);
    }
    assert.equal((await adminPost(api, '/api/sheikha-kernel/self-test?live=true').send({})).status, 400);
    assert.equal((await adminPost(api, '/api/sheikha-kernel/self-test').send({ source: 'x'.repeat(17000) })).status, 413);
    assert.equal((await design(api)).body.statistics.agents, 0);
  }
});

test('kernel self-test failure is HTTP 503 without exposing internal exceptions', async t => {
  for (const implementation of [
    { verifyLocal: () => ({ success: false, status: 'LOCAL_SELF_TEST_FAILED' }) },
    { verifyLocal: () => { throw new Error('private-test-marker'); } }
  ]) {
    const api = await application(t, false, implementation);
    const result = await adminPost(api, '/api/sheikha-kernel/self-test').send({});
    assert.equal(result.status, 503);
    assert.equal(result.body.success, false);
    assert.equal(JSON.stringify(result.body).includes('private-test-marker'), false);
    assert.equal((await design(api)).body.statistics.agents, 0);
  }
});
