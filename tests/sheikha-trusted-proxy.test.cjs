'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createHash } = require('node:crypto');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { configureTrustedProxy } = require('../lib/runtime/sheikha-trusted-proxy.cjs');

async function fixture(t, env, probeLogs = []) {
  const app = express();
  const options = configureTrustedProxy(app, env, { log: line => probeLogs.push(line) });
  const warnings = [];
  app.use(rateLimit({ ...options, windowMs: 60000, limit: 1,
    logger: { error: error => warnings.push(error.code), warn: error => warnings.push(error.code) }
  }));
  app.get('/', (req, res) => res.json({ ip: req.ip }));
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.once('error', reject);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const request = headers => new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: server.address().port,
      path: '/', headers, agent: false }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
  return { app, options, warnings, request };
}

test('proxy trust defaults to false and rejects unbounded or malformed settings', () => {
  for (const env of [{}, { SHEIKHA_TRUST_PROXY_HOPS: '' }, { SHEIKHA_TRUST_PROXY_HOPS: '0' }]) {
    const app = express();
    assert.deepEqual(configureTrustedProxy(app, env), {});
    assert.equal(app.get('trust proxy'), false);
  }
  for (const value of ['true', '2', '-1', '1.0', '01', ' 1', 1]) {
    assert.throws(() => configureTrustedProxy(express(), { SHEIKHA_TRUST_PROXY_HOPS: value }),
      /SHEIKHA_TRUST_PROXY_HOPS_MUST_BE_0_OR_1/);
  }
});

test('one trusted hop ignores spoofed leftmost addresses and separates client buckets', async t => {
  const { app, options, request, warnings } = await fixture(t, { SHEIKHA_TRUST_PROXY_HOPS: '1' });
  assert.equal(app.get('trust proxy'), 1);
  assert.deepEqual(options, { validate: { forwardedHeader: false } });
  const first = await request({ 'X-Forwarded-For': '203.0.113.1, 198.51.100.10',
    Forwarded: 'for=192.0.2.1' });
  assert.equal(first.status, 200);
  assert.equal(JSON.parse(first.body).ip, '198.51.100.10');
  assert.equal((await request({ 'X-Forwarded-For': '203.0.113.99, 198.51.100.10',
    Forwarded: 'for=192.0.2.99' })).status, 429);
  assert.equal((await request({ 'X-Forwarded-For': '203.0.113.1, 198.51.100.11' })).status, 200);
  assert.deepEqual(warnings, []);
});

test('default IPv6 subnet keying prevents same-subnet address rotation', async t => {
  const { request, warnings } = await fixture(t, { SHEIKHA_TRUST_PROXY_HOPS: '1' });
  assert.equal((await request({ 'X-Forwarded-For': '2001:db8:abcd:1200::1' })).status, 200);
  assert.equal((await request({ 'X-Forwarded-For': '2001:db8:abcd:12ff::2' })).status, 429);
  assert.equal((await request({ 'X-Forwarded-For': '2001:db8:abcd:1300::1' })).status, 200);
  assert.deepEqual(warnings, []);
});

test('local default ignores both forwarded headers and cannot rotate buckets', async t => {
  const { app, request, warnings } = await fixture(t, {});
  assert.equal(app.get('trust proxy'), false);
  const first = await request({ 'X-Forwarded-For': '198.51.100.10', Forwarded: 'for=192.0.2.1' });
  assert.equal(first.status, 200);
  assert.equal(JSON.parse(first.body).ip, '127.0.0.1');
  assert.equal((await request({ 'X-Forwarded-For': '198.51.100.11',
    Forwarded: 'for=192.0.2.2' })).status, 429);
  // Local unexpected-header diagnostics remain enabled rather than suppressed.
  assert.ok(warnings.includes('ERR_ERL_UNEXPECTED_X_FORWARDED_FOR'));
  assert.ok(warnings.includes('ERR_ERL_FORWARDED_HEADER'));
});

test('Forwarded alone never identifies a client in the explicitly trusted mode', async t => {
  const { request, warnings } = await fixture(t, { SHEIKHA_TRUST_PROXY_HOPS: '1' });
  const first = await request({ Forwarded: 'for=192.0.2.1' });
  assert.equal(first.status, 200);
  assert.equal(JSON.parse(first.body).ip, '127.0.0.1');
  assert.equal((await request({ Forwarded: 'for=192.0.2.2' })).status, 429);
  assert.deepEqual(warnings, []);
});

test('topology diagnostic is absent unless explicitly configured and rejects malformed IDs', async t => {
  for (const id of ['short', 'A'.repeat(16), 'a'.repeat(65), 'a'.repeat(16) + '/x', 'a'.repeat(16) + '\n']) {
    assert.throws(() => configureTrustedProxy(express(), { SHEIKHA_PROXY_PROBE_ID: id }),
      /SHEIKHA_PROXY_PROBE_ID_INVALID/);
  }
  const logs = [];
  const { request } = await fixture(t, {}, logs);
  assert.equal((await request({ 'x-sheikha-proxy-probe': 'proxy-probe-20261025' })).status, 200);
  assert.deepEqual(logs, []);
});

test('matching opt-in probe logs once with hashes only and never enables proxy trust', async t => {
  const id = 'proxy-probe-20261025', logs = [];
  const { app, request } = await fixture(t, { SHEIKHA_TRUST_PROXY_HOPS: '0',
    SHEIKHA_PROXY_PROBE_ID: id }, logs);
  assert.equal(app.get('trust proxy'), false);
  assert.equal((await request({ 'x-sheikha-proxy-probe': 'different-probe-id' })).status, 200);
  assert.deepEqual(logs, []);
  const headers = { 'x-sheikha-proxy-probe': id,
    'X-Forwarded-For': '203.0.113.1, ::FFFF:198.51.100.10', Forwarded: 'for=192.0.2.1' };
  assert.equal((await request(headers)).status, 429);
  assert.equal((await request(headers)).status, 429);
  assert.equal(logs.length, 1);
  const hash = value => createHash('sha256').update(value).digest('hex');
  assert.deepEqual(JSON.parse(logs[0]), {
    event: 'SHEIKHA_PROXY_TOPOLOGY_PROBE', id, xffEntryCount: 2,
    rightmostSha256: hash('198.51.100.10'),
    selectedIpSha256: hash('127.0.0.1'), socketSha256: hash('127.0.0.1')
  });
  for (const raw of ['203.0.113.1', '198.51.100.10', '127.0.0.1', '192.0.2.1', '::FFFF:', 'Forwarded']) {
    assert.equal(logs[0].includes(raw), false);
  }
});
