'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const http = require('node:http');
const { createWorkspaceServer, validRequest } = require('../tools/preview/sheikha-workspace-preview.cjs');
const API = '/api/sheikha/workspace/v1';

async function fixture(t) {
  const server = createWorkspaceServer();
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (await (await fetch(base + API + '/session')).json()).token;
  return { base, token, request: (url, options) => fetch(base + url, options),
    post: (url, body, headers = {}) => fetch(base + API + url, { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': token, ...headers }, body: JSON.stringify(body) }) };
}

test('workspace serves scoped assets, evidence catalog and honest recorded state', async t => {
  const f = await fixture(t);
  for (const path of ['/workspace/', '/workspace/workspace.js', '/workspace/workspace.css', '/workspace/assets/campus.png', '/workspace/assets/architecture.jpg']) {
    const r = await f.request(path); assert.equal(r.status, 200); assert.ok(r.headers.get('content-security-policy').includes("frame-ancestors 'none'")); await r.arrayBuffer();
  }
  const status = await (await f.request(API + '/status')).json();
  assert.equal(status.realDevicesConnected, false);
  assert.equal(status.visualFoundry.watch.processVerified, false);
  assert.equal(status.visualFoundry.paidGenerationEnabled, false);
  const catalog = await (await f.request(API + '/catalog')).json();
  assert.ok(catalog.products.length > 0); assert.equal(catalog.claimBoundary.paymentExecutionEnabled, false);
  for (const path of ['/runtime/', '/.env', '/sdk/sheikha-js/index.js', '/api/sheikha/status', '/workspace/%2e%2e/%2e%2e/.env']) assert.equal((await f.request(path)).status, 404);
});

test('exact host, origin, session and JSON gates reject unsolicited calls', async t => {
  const f = await fixture(t), body = { operation: 'foundry', transport: 'sdk', arguments: {} };
  const hostStatus = await new Promise((resolve, reject) => {
    const req = http.get(f.base + API + '/status', { headers: { Host: 'attacker.invalid' } }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject);
  });
  assert.equal(hostStatus, 403);
  assert.equal((await f.post('/run', body, { Origin: 'https://attacker.invalid' })).status, 403);
  assert.equal((await f.post('/run', body, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await f.post('/run', body, { 'X-Sheikha-Session': 'bad' })).status, 403);
  assert.equal((await f.post('/run', body, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await f.request(API + '/run', { method: 'DELETE' })).status, 405);
  assert.equal((await f.request(API + '/run', { method: 'OPTIONS' })).status, 405);
});

test('the broker has only three functions and no caller-selected URLs, paths or tools', async t => {
  const f = await fixture(t);
  for (const body of [{}, null, [], { operation: '__proto__', transport: 'sdk', arguments: {} },
    { operation: 'foundry', transport: 'http', arguments: {} },
    { operation: 'foundry', transport: 'sdk', arguments: {}, endpoint: '/etc/passwd' },
    { operation: 'sheikha_runtime_status', transport: 'mcp', arguments: {} }]) {
    assert.equal(Boolean(validRequest(body)), false); assert.equal((await f.post('/run', body)).status, 400);
  }
  for (const transport of ['sdk', 'mcp']) {
    const r = await f.post('/run', { operation: 'foundry', transport, arguments: { secret: 'SECRET_SENTINEL' } });
    assert.equal(r.status, 422); assert.equal((await r.text()).includes('SECRET_SENTINEL'), false);
  }
});

test('all three SDK and real MCP round trips return evidence with production disabled', { timeout: 40000 }, async t => {
  const f = await fixture(t);
  for (const operation of ['foundry', 'natural', 'sensory']) {
    const args = await (await f.request(API + '/examples/' + operation)).json();
    for (const transport of ['sdk', 'mcp']) {
      const r = await f.post('/run', { operation, transport, arguments: args });
      const body = await r.json(); assert.equal(r.status, 200, JSON.stringify(body));
      assert.equal(body.transport, transport); assert.equal(body.operation, operation);
      assert.match(body.argumentsSha256, /^[a-f0-9]{64}$/);
      assert.equal(body.result.boundaries.productionReady, false);
      assert.equal(body.result.boundaries.physicalCommandSent, false);
      if (operation === 'sensory') assert.equal(body.result.snapshot.sources[0].status, 'STALE');
    }
  }
});

test('RFQ uses existing planning core, never sends or stores orders, and rejects oversized intent', async t => {
  const f = await fixture(t);
  const { products } = await (await f.request(API + '/catalog')).json();
  const product = products[0], input = { productId: product.id, sector: product.primarySector, intent: '<script>example</script> مراجعة نطاق المنتج فقط' };
  const r = await f.post('/plan', input); const plan = await r.json();
  assert.equal(r.status, 200); assert.equal(plan.sentToSupplier, false); assert.equal(plan.storedOnServer, false);
  assert.equal(plan.reviewStatus, 'DRAFT_REQUIRES_HUMAN_REVIEW'); assert.equal(plan.execution.performed, false);
  assert.equal(plan.intent, input.intent);
  for (const update of [{ intent: 'a'.repeat(501) }, { productId: 'UNKNOWN' }, { approved: true }, { sector: 'unknown' }]) assert.equal((await f.post('/plan', { ...input, ...update })).status, 400);
});

test('body size and rate bounds are enforced with redacted errors', async t => {
  const f = await fixture(t);
  assert.equal((await f.post('/run', { payload: 'x'.repeat(524289) })).status, 413);
  for (let i = 0; i < 19; i++) assert.equal((await f.post('/run', {})).status, 400);
  assert.equal((await f.post('/run', {})).status, 429);
});
