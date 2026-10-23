'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');
const { createHandler, buildWorkforceScenarios, CACHE_MS, HOST, DEFAULT_PORT } = require('../tools/health/sheikha-operations-studio-v1.cjs');
function fixture(options = {}) {
  const calls = [];
  const handler = createHandler({ dashboardBuffer: Buffer.from('<html>local</html>'),
    sources: { getManagerStatus: () => { calls.push('manager'); return { report: { productionReady: false } }; },
      getOrganizationStatus: () => { calls.push('organization'); return { departments: [], roles: [] }; },
      getJobDescriptionReview: () => { calls.push('review'); return { status: 'EVIDENCE_REQUIRED' }; },
      getWorkforcePlans: () => { calls.push('workforce'); return buildWorkforceScenarios(); } }, ...options });
  const request = (url, method = 'GET', headers = {}) => {
    let code, out, resultHeaders;
    handler({ url, method, headers: { host: '127.0.0.1:8137', ...headers } }, {
      writeHead(status, values) { code = status; resultHeaders = values; }, end(value) { out = value.toString(); }
    });
    return { code, headers: resultHeaders, text: out, json: () => JSON.parse(out) };
  };
  return { calls, request };
}
test('requiring studio starts no listener and health establishes local liveness only', () => {
  assert.equal(HOST, '127.0.0.1'); assert.equal(DEFAULT_PORT, 8137);
  const f = fixture(), response = f.request('/health');
  assert.equal(response.code, 200); assert.equal(response.json().productionReady, false);
  assert.match(response.json().scope, /LIVENESS_ONLY/); assert.deepEqual(f.calls, []);
});
test('fixed read routes invoke only local manager and organization sources', () => {
  const f = fixture();
  assert.equal(f.request('/').code, 200); assert.equal(f.request('/operations-studio.html').code, 200);
  assert.equal(f.request('/api/status').code, 200);
  const org = f.request('/api/organization').json();
  assert.equal(org.productionReady, false); assert.equal(org.externalExecutionAllowed, false);
  assert.deepEqual(f.calls, ['manager', 'organization', 'review']);
});
test('mutations and arbitrary paths are denied without source calls', () => {
  const f = fixture();
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    const response = f.request('/api/status', method);
    assert.equal(response.code, 405); assert.equal(response.headers.allow, 'GET');
  }
  for (const url of ['/api/status?path=/etc/passwd', '/../../.env', '/api/repair', '/api/organization/../status'])
    assert.equal(f.request(url).code, 404);
  assert.equal(f.request('//evil.example').code, 400); assert.deepEqual(f.calls, []);
});
test('host and origin defenses reject cross-site reads without CORS', () => {
  const f = fixture();
  assert.equal(f.request('/api/status', 'GET', { host: 'evil.example:8137' }).code, 403);
  assert.equal(f.request('/api/status', 'GET', { origin: 'https://evil.example' }).code, 403);
  const good = f.request('/health', 'GET', { host: 'localhost:8137', origin: 'http://localhost:8137' });
  assert.equal(good.code, 200); assert.equal(good.headers['access-control-allow-origin'], undefined);
  assert.deepEqual(f.calls, []);
});
test('status cache is bounded in time and backward clocks invalidate it', () => {
  let time = 10000; const f = fixture({ clock: () => time });
  f.request('/api/status'); f.request('/api/status'); assert.equal(f.calls.length, 1);
  time += CACHE_MS; f.request('/api/status'); assert.equal(f.calls.length, 2);
  time = 1; f.request('/api/status'); assert.equal(f.calls.length, 3);
});
test('source errors and oversized output never reveal exception text', () => {
  for (const getManagerStatus of [() => { throw Error('PRIVATE_TOKEN_SENTINEL'); },
    () => ({ text: 'x'.repeat(1024 * 1024 + 1) }), () => Promise.resolve({})]) {
    const f = fixture({ sources: { getManagerStatus } }), response = f.request('/api/status');
    assert.equal(response.code, 503); assert.doesNotMatch(response.text, /PRIVATE_TOKEN_SENTINEL/);
    assert.equal(response.json().productionReady, false);
  }
});
test('handler performs no writes or subprocess calls', t => {
  const deny = () => { throw Error('SIDE_EFFECT_DENIED'); };
  for (const key of ['writeFileSync', 'appendFileSync', 'mkdirSync', 'unlinkSync', 'renameSync']) t.mock.method(fs, key, deny);
  for (const key of ['exec', 'execSync', 'execFileSync', 'spawn', 'spawnSync']) t.mock.method(childProcess, key, deny);
  const f = fixture(); assert.equal(f.request('/api/status').code, 200); assert.equal(f.request('/api/organization').code, 200);
});
test('responses deny framing and sniffing and dashboard renders untrusted text as text', () => {
  const f = fixture(), r = f.request('/');
  assert.equal(r.headers['x-frame-options'], 'DENY'); assert.equal(r.headers['x-content-type-options'], 'nosniff');
  assert.equal(r.headers['cache-control'], 'no-store'); assert.match(r.headers['content-security-policy'], /frame-ancestors 'none'/);
  const html = fs.readFileSync(path.join(__dirname, '../public/workspace/operations-studio.html'), 'utf8');
  assert.match(html, /dir="rtl"/); assert.match(html, /بصريات/); assert.match(html, /PRODUCTION HOLD/);
  assert.match(html, /textContent/); assert.doesNotMatch(html, /innerHTML|https?:\/\/[^'" ]+\.(?:js|css)/);
});
test('ports outside explicit local service range are rejected', () => {
  for (const port of [0, 80, -1, 65536, '8137']) assert.throws(() => fixture({ port }), /PORT_DENIED/);
});
test('workforce endpoint exposes four finite fixed plans and accepts no requested scale or mutation', () => {
  const f = fixture(), response = f.request('/api/workforce');
  assert.equal(response.code, 200); const body = response.json();
  assert.equal(body.productionReady, false); assert.equal(body.production, 'HOLD');
  assert.deepEqual(body.scenarios.map(row => row.requestedLogicalAgents), ['1', '100', '1000000', '100000000']);
  for (const plan of body.scenarios) {
    assert.equal(plan.status, 'SCALE_PLAN_ONLY'); assert.equal(plan.workersStarted, 0);
    assert.equal(plan.logicalIdentitiesMaterialized, 0); assert.ok(plan.plannedConcurrentSlots <= 4);
    assert.equal(plan.queue.capacity, 1000); assert.equal(plan.queue.tasksExecuted, 0);
    assert.equal(plan.constraints.automaticReplicationAllowed, false);
    assert.equal(plan.constraints.unboundedGrowthAllowed, false);
    assert.equal(plan.neuralIntegration.distributedClusterConnected, false);
  }
  assert.ok(response.text.length < 16000);
  assert.equal(f.request('/api/workforce?requestedAgents=999999999999').code, 404);
  assert.equal(f.request('/api/workforce', 'POST').code, 405);
  assert.deepEqual(f.calls, ['workforce']);
});
