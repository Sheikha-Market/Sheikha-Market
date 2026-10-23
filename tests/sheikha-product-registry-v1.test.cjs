'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { validateScope, verifyRequest, buildRegistry, probeGoogleServices, readBounded } = require('../core/cloud-fabric/sheikha-product-registry-v1.cjs');
const { renderConsole, saveSnapshot, run } = require('../tools/sheikha-cloud/build-product-console-v1.cjs');
const scope = require('../config/sheikha-cloud-products.v1.json');
const root = path.resolve(__dirname, '..');
const fixture = fn => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-products-test-')); try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); } };
const requestText = () => ['Find and deploy over 4,500 products in Marketplace', ...scope.categories.flatMap(group => [group.referenceHeading, 'Name Description', ...group.products.flatMap(([name]) => [name, 'Source description'])]), 'شغل كل التطبيقات والادوات تكون باسم شيخة'].join('\n\n');
const entry = (name, number = scope.projectNumber) => ({ name: `projects/${number}/services/${name}`, config: { name, title: 'Not exported', secret: 'must-not-be-retained' }, state: 'ENABLED' });
const response = data => new Response(JSON.stringify(data), { status: 200 });
const token = 'fixture-token-not-a-real-credential';

test('scope has 129 distinct independently named proposals in 18 groups', () => {
  assert.equal(validateScope(scope), scope);
  assert.equal(scope.categories.length, 18); assert.equal(scope.categories.flatMap(group => group.products).length, 129);
  const dirty = structuredClone(scope); dirty.categories[0].products.push(dirty.categories[0].products[0]); assert.throws(() => validateScope(dirty), /DUPLICATE/);
  const branded = structuredClone(scope); branded.categories[0].products[0][1] = 'شيخة Google'; assert.throws(() => validateScope(branded), /INDEPENDENT_BRAND/);
});

test('scope rejects traversal, secret locations, unknown bindings and nonstring project IDs', () => {
  for (const file of ['../.env', 'core/../../.env', '.aws/credentials', '/tmp/x', 'core//x']) {
    const dirty = structuredClone(scope); dirty.candidates['Cloud Storage'] = [file]; assert.throws(() => validateScope(dirty), /INVALID_CANDIDATE_PATH/);
  }
  const bad = structuredClone(scope); bad.serviceBindings.unknown = 'x.googleapis.com'; assert.throws(() => validateScope(bad), /INVALID_SERVICE_BINDING/);
  bad.projectNumber = 123; assert.throws(() => validateScope(bad), /INVALID_PROJECT/);
});

test('request matching consumes all listed entries without copying or executing the transcript', () => {
  const result = verifyRequest(Buffer.from(requestText()), scope);
  assert.equal(result.matchedProducts, 129); assert.equal(result.matchedCategories, 18); assert.equal(result.contentCopied, false); assert.equal(result.commandsExecuted, false);
  assert.equal(result.sha256.length, 64);
  assert.throws(() => verifyRequest(Buffer.from(requestText().replace('BigQuery', 'Wrong')), scope), /MISMATCH/);
  assert.throws(() => verifyRequest(Buffer.from(requestText().replace('شغل كل', 'Unexpected entry\nشغل كل')), scope), /UNMAPPED/);
  assert.throws(() => verifyRequest(Buffer.from(requestText() + '\nFind and deploy over 4,500 products in Marketplace'), scope), /AMBIGUOUS/);
});

test('source reads are bounded and deny file and ancestor symlinks', () => fixture(dir => {
  fs.writeFileSync(path.join(dir, 'source'), '12345'); fs.symlinkSync(path.join(dir, 'source'), path.join(dir, 'link'));
  fs.symlinkSync(dir, path.join(dir, 'alias'));
  assert.throws(() => readBounded(path.join(dir, 'source'), 4), /SOURCE_SIZE/);
  assert.throws(() => readBounded(path.join(dir, 'link')), /SYMLINK/);
  assert.throws(() => readBounded(path.join(dir, 'alias/source')), /SYMLINK/);
  assert.equal(readBounded(path.join(dir, 'source')).toString(), '12345');
}));

test('local code is evidence of files only and never upgrades proposals to accepted or cloud live', () => fixture(dir => {
  fs.mkdirSync(path.join(dir, 'core'), { recursive: true }); fs.writeFileSync(path.join(dir, 'core/candidate.js'), 'throw Error("must not execute");');
  const config = structuredClone(scope); config.candidates = { 'Cloud Storage': ['core/candidate.js'] };
  const report = buildRegistry(config, { root: dir });
  assert.equal(report.counts.localCandidates, 1); assert.equal(report.counts.acceptedProducts, 0); assert.equal(report.counts.verifiedCloudConnections, 0);
  assert.ok(report.products.every(product => !product.productionEnabled && !product.productAccepted));
  assert.equal(report.partnership.signedAgreementVerified, false);
  assert.equal(report.generation.externalCallsAllowed, false);
}));

test('missing or unsafe credentials/project produce no requests', async () => {
  const fetchImpl = () => { throw Error('must not call'); };
  assert.equal((await probeGoogleServices({ projectNumber: scope.projectNumber, fetchImpl })).status, 'BLOCKED_AUTH_NOT_CONFIGURED');
  for (const projectNumber of ['../secret', 'https://example.org', '123?x=1', 123]) assert.equal((await probeGoogleServices({ projectNumber, accessToken: token, fetchImpl })).status, 'INVALID_PROJECT_NUMBER');
  const bad = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: 'bearer\nsecret', fetchImpl });
  assert.equal(bad.status, 'BLOCKED_INVALID_AUTH_INPUT'); assert.equal(bad.requestCount, 0);
});

test('read-only inventory paginates on one fixed origin and exports only validated service names', async () => {
  const calls = [];
  const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return response(calls.length === 1 ? { services: [entry('bigquery.googleapis.com')], nextPageToken: 'opaque&next=https://evil.invalid' } : { services: [entry('storage.googleapis.com')] });
  } });
  assert.equal(calls.length, 2);
  for (const { url, options } of calls) {
    assert.equal(url.origin, 'https://serviceusage.googleapis.com'); assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error'); assert.equal(options.body, undefined);
    assert.equal(options.headers.Authorization, `Bearer ${token}`); assert.equal(url.searchParams.get('filter'), 'state:ENABLED'); assert.equal(url.searchParams.get('pageSize'), '200');
  }
  assert.equal(calls[1].url.searchParams.get('pageToken'), 'opaque&next=https://evil.invalid');
  assert.deepEqual(result.services, ['bigquery.googleapis.com', 'storage.googleapis.com']); assert.equal(result.complete, true);
  assert.equal(result.workloadVerified, false); assert.equal(result.productionEnabled, false); assert.equal(result.servicesEnabledByTool, 0);
  assert.doesNotMatch(JSON.stringify(result), /fixture-token|must-not-be-retained|opaque&next/);
});

test('authorization and permission errors do not retain response bodies or imply disabled services', async () => {
  for (const [code, status] of [[401, 'AUTH_REJECTED'], [403, 'PERMISSION_DENIED'], [500, 'REMOTE_HTTP_ERROR']]) {
    const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => new Response('secret-body-token', { status: code }) });
    assert.equal(result.status, status); assert.equal(result.complete, false); assert.deepEqual(result.services, []); assert.doesNotMatch(JSON.stringify(result), /secret-body-token/);
  }
});

test('inventory rejects wrong projects, non-enabled states, malformed names and duplicated entries', async () => {
  for (const bad of [entry('bigquery.googleapis.com', '123'), { ...entry('storage.googleapis.com'), state: 'DISABLED' }, entry('evil.invalid'), { state: 'ENABLED' }]) {
    const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => response({ services: [bad] }) });
    assert.equal(result.status, 'INVALID_REMOTE_SERVICE'); assert.equal(result.complete, false);
  }
  const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => response({ services: [entry('storage.googleapis.com'), entry('storage.googleapis.com')] }) });
  assert.equal(result.status, 'INVALID_REMOTE_SERVICE');
});

test('pagination cycles, page limits and invalid page tokens never expose partial inventory as complete', async () => {
  for (const nextPageToken of ['repeat', null, 'x'.repeat(4097)]) {
    const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => response({ nextPageToken }) });
    assert.equal(result.status, 'INVALID_PAGINATION'); assert.equal(result.complete, false); assert.deepEqual(result.services, []);
  }
  let page = 0;
  const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => response({ nextPageToken: `page-${++page}` }) });
  assert.equal(result.status, 'PAGINATION_LIMIT_REACHED'); assert.equal(result.requestCount, 10);
});

test('bounded response parser rejects oversized and invalid JSON without leaking remote errors', async () => {
  const huge = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => new Response('x'.repeat(1024 * 1024 + 1)) });
  assert.equal(huge.status, 'RESPONSE_TOO_LARGE');
  for (const data of [null, { services: 'wrong' }, { services: Array(201).fill(entry('storage.googleapis.com')) }]) {
    const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => response(data) });
    assert.equal(result.status, 'INVALID_REMOTE_RESPONSE');
  }
  const error = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, fetchImpl: async () => { throw Error('secret-token-in-error'); } });
  assert.equal(error.status, 'NETWORK_OR_RESPONSE_ERROR'); assert.doesNotMatch(JSON.stringify(error), /secret-token/);
});

test('the request and body share one finite timeout', async () => {
  const result = await probeGoogleServices({ projectNumber: scope.projectNumber, accessToken: token, timeoutMs: 10,
    fetchImpl: async (_, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })) });
  assert.equal(result.status, 'TIMEOUT'); assert.equal(result.complete, false);
});

test('render escapes script boundaries and uses exact CSP hashes with no external assets', () => {
  const registry = buildRegistry(scope, { root }); registry.products[0].nameAr = '</script><script>window.injected=1</script> __PROBE__';
  const html = renderConsole(registry, { status: 'NOT_REQUESTED', requestCount: 0, services: [] }, { root, visual: Buffer.from('fixture') });
  assert.equal((html.match(/<script>/g) || []).length, 1); assert.equal((html.match(/<\/script>/g) || []).length, 1);
  assert.match(html, /\\u003c\/script\\u003e/); assert.doesNotMatch(html, /@@[A-Z_]+@@/);
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new (require('node:vm').Script)(script));
  assert.match(script, /__PROBE__/);
  assert.ok(html.includes(`'sha256-${createHash('sha256').update(script).digest('base64')}'`));
  assert.match(html, /connect-src 'none'/); assert.doesNotMatch(html, /(?:src|href)="https?:/);
});

test('private snapshots are complete before latest publication and refuse symlink targets', () => fixture(dir => {
  const output = path.join(dir, 'output');
  const saved = saveSnapshot(output, { 'index.html': 'hello' }, { builtAt: 'fixture' });
  assert.equal(fs.readFileSync(path.join(saved.snapshot, 'index.html'), 'utf8'), 'hello');
  assert.equal(fs.statSync(output).mode & 0o777, 0o700); assert.equal(fs.statSync(path.join(saved.snapshot, 'index.html')).mode & 0o777, 0o600);
  fs.unlinkSync(path.join(output, 'index.html')); fs.writeFileSync(path.join(dir, 'original'), 'untouched'); fs.symlinkSync(path.join(dir, 'original'), path.join(output, 'index.html'));
  assert.throws(() => saveSnapshot(output, { 'index.html': 'changed' }, { builtAt: 'next' }), /SYMLINK_DENIED/);
  assert.equal(fs.readFileSync(path.join(dir, 'original'), 'utf8'), 'untouched');
}));

test('CLI requires explicit known operations and an authenticated probe is not an activation operation', async () => {
  for (const args of [['enable'], ['build', '--activate'], ['probe', '--url', 'https://evil.invalid'], ['build', '--request']]) await assert.rejects(run(args), /USAGE|UNSUPPORTED/);
  const result = await run(['probe'], { env: {}, fetchImpl: () => { throw Error('network must not run'); } });
  assert.equal(result.status, 'BLOCKED_AUTH_NOT_CONFIGURED'); assert.equal(result.requestCount, 0);
});
