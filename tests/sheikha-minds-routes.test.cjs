'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const Matrix = require('../runtime/minds/sheikha_multi_mind_matrix');
const before = { secret: process.env.JWT_SECRET, env: process.env.NODE_ENV };
const secret = 'minds-test-only-configured-secret-2026';
process.env.JWT_SECRET = secret;
process.env.NODE_ENV = 'test';
const routePath = require.resolve('../routes/minds');
const kernelRoutePath = require.resolve('../routes/sheikha-infinite-agent/sheikha-infinite-agent-routes');
after(() => {
  if (before.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = before.secret;
  if (before.env === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = before.env;
});

async function fixture(t, { configured = true, preparse = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-minds-http-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const stateRoot = path.join(root, 'private');
  const matrix = new Matrix({ stateRoot });
  delete require.cache[routePath];
  delete require.cache[kernelRoutePath];
  if (configured) process.env.JWT_SECRET = secret; else delete process.env.JWT_SECRET;
  const app = express();
  if (preparse) app.use(express.json({ limit: '1mb' }));
  app.use('/api/minds', require(routePath).createRouter(matrix));
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const api = request(server);
  const token = role => jwt.sign({ id: 'test-minds-operator', role }, secret, { expiresIn: '1m' });
  const get = endpoint => api.get('/api/minds' + endpoint).set('Authorization', 'Bearer ' + token('admin'));
  const post = endpoint => api.post('/api/minds' + endpoint).set('Authorization', 'Bearer ' + token('admin'));
  return { api, get, post, token, matrix, stateRoot };
}

test('all minds routes require configured JWT and admin; no public command aliases', async t => {
  const { api, token, stateRoot } = await fixture(t);
  for (const endpoint of ['', '/status', '/journal', '/governor/status', '/initialize', '/replicate', '/trader/command']) {
    const anonymous = await api.get('/api/minds' + endpoint).set('X-Human-Approved', 'true').set('X-Role', 'admin');
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers['cache-control'], 'no-store');
    const customer = await api.get('/api/minds' + endpoint).set('Authorization', 'Bearer ' + token('customer'));
    assert.equal(customer.status, 403);
  }
  for (const endpoint of ['/initialize', '/replicate', '/governor/command']) {
    assert.equal((await api.post('/api/minds' + endpoint).send({ humanApproved: true })).status, 401);
  }
  assert.equal(fs.existsSync(stateRoot), false);
});

test('unconfigured authentication fails closed even with a formerly valid token', async t => {
  const { get, post, stateRoot } = await fixture(t, { configured: false });
  assert.equal((await get('/status')).status, 403);
  assert.equal((await post('/initialize').send({})).body.error, 'ADMIN_AUTH_NOT_CONFIGURED');
  assert.equal(fs.existsSync(stateRoot), false);
});

test('read requests never initialize storage or mutate the registry', async t => {
  const { get, stateRoot } = await fixture(t);
  const status = await get('');
  assert.equal(status.status, 200);
  assert.equal(status.body.data.statistics.agents, 13);
  assert.equal(status.body.data.storage.saved, false);
  assert.equal((await get('/governor/status')).body.data.modelProviderConnected, false);
  for (const endpoint of ['/initialize', '/replicate', '/watch/command']) {
    const response = await get(endpoint);
    assert.equal(response.status, 405);
    assert.equal(response.headers.allow, 'POST');
  }
  assert.equal((await get('/journal')).body.data.entries.length, 0);
  assert.equal(fs.existsSync(stateRoot), false);
});

test('admin can initialize, replicate and dispatch allowed local computations', async t => {
  const { get, post } = await fixture(t);
  assert.equal((await post('/initialize').send({})).body.data.persisted, true);
  const replicated = await post('/replicate').send({ mind: 'engineer', count: 2 });
  assert.equal(replicated.body.data.created, 2);
  assert.equal((await get('/status')).body.data.statistics.agents, 15);
  const result = await post('/scholar/command').send({ action: 'summarize-sample', input: { values: [1, 2, 3] } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.result.mean, 2);
  assert.equal(result.body.data.externalExecution, false);
  const denied = await post('/governor/command').send({ action: 'review-operation', input: { action: 'deploy' } });
  assert.equal(denied.body.data.status, 'DENIED');
  assert.equal(denied.body.data.executed, false);
  assert.equal((await get('/journal')).body.data.entries.length, 4);
  assert.equal((await post('/trader/command').send({ action: 'operate-device' })).status, 403);
  assert.equal((await post('/omni/command').send({ action: 'kernel-self-test' })).status, 403);
  assert.equal((await post('/constructor/command').send({ action: 'status' })).status, 404);
});

test('reject malformed, oversized, prototype and authorization payloads even after upstream JSON parsing', async t => {
  const { get, post } = await fixture(t, { preparse: true });
  for (const body of [{ count: 1e10, mind: 'engineer' }, { count: 2, mind: 'engineer', humanApproved: true },
    JSON.parse('{"mind":"engineer","count":1,"__proto__":{"admin":true}}')]) {
    assert.equal((await post('/replicate').type('json').send(JSON.stringify(body))).status, 400);
  }
  assert.equal((await post('/initialize').send({ stateRoot: '/tmp/elsewhere' })).status, 400);
  assert.equal((await post('/initialize').send([])).status, 400);
  assert.equal((await post('/initialize').type('text/plain').send('{}')).status, 415);
  assert.equal((await post('/initialize').type('json').send('{broken')).status, 400);
  assert.equal((await post('/watch/command').send({ action: 'status', input: 'x'.repeat(20000) })).status, 413);
  assert.equal((await post('/initialize?live=true').send({})).status, 400);
  assert.equal((await get('/watch/command?cmd=deploy&system=SHEIKHA_ALL')).status, 400);
  assert.equal((await get('/status')).body.data.revision, 0);
});

test('capacity and storage failures are explicit and do not disclose paths or content', async t => {
  const { get, post, matrix, stateRoot } = await fixture(t);
  matrix.replicate({ mind: 'engineer', count: 8 });
  matrix.replicate({ mind: 'engineer', count: 7 });
  assert.equal((await post('/replicate').send({ mind: 'engineer', count: 1 })).status, 409);
  fs.mkdirSync(path.join(stateRoot, '.write-lock'));
  assert.equal((await post('/initialize').send({})).status, 409);
  fs.rmdirSync(path.join(stateRoot, '.write-lock'));
  fs.writeFileSync(path.join(stateRoot, Matrix.STATE_ID + '.json'), 'private-canary-broken-json');
  const result = await get('/status');
  assert.equal(result.status, 503);
  assert.equal(result.text.includes(stateRoot), false);
  assert.equal(result.text.includes('private-canary'), false);
});

test('server mounts minds once, rate-limited before the generic parser and sanitizer', () => {
  const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  const mount = "app.use('/api/minds', require('./routes/minds'));";
  assert.equal(source.split(mount).length, 2);
  assert.ok(source.indexOf(mount) < source.indexOf('app.use(express.json());'));
  assert.ok(source.includes("if (generalLimiter) app.use('/api/minds', generalLimiter);"));
});
