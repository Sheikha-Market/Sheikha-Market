'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { once } = require('node:events');
const { listSupplierLab, LIMITS } = require('../core/ownership/sheikha-supplier-lab-v1.cjs');
const { digest } = require('../core/ownership/sheikha-owned-asset-registry.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const collections = ['suppliers', 'materials', 'documents'];
const list = (collection, query = '') => listSupplierLab(collection, new URLSearchParams(query));
async function fixture(t) {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (await (await fetch(base + '/api/sheikha/workspace/v1/session')).json()).token;
  const headers = { 'X-Sheikha-Session': token };
  return { base, headers, get: (url, extra = {}) => fetch(base + url, { headers: { ...headers, ...extra } }) };
}

test('three contracts return bounded synthetic pages with independent requirement references and no production authority', () => {
  for (const [i, collection] of collections.entries()) {
    const report = list(collection), { integrity, ...body } = report;
    assert.equal(report.contract.path, '/api/' + collection); assert.equal(report.contract.method, 'GET');
    assert.equal(report.contract.requirementId, `supplier-package--acceptance-${i + 1}`);
    assert.equal(report.items.length, LIMITS.defaultLimit); assert.ok(report.items.every(item => item.synthetic === true));
    assert.equal(report.datasetId, 'SHEIKHA_SUPPLIER_SYNTHETIC_V1'); assert.equal(report.policy.mode, 'SYNTHETIC_READ_ONLY');
    for (const [key, value] of Object.entries(report.policy)) if (!['mode', 'syntheticData'].includes(key)) assert.equal(value, false, key);
    assert.equal(integrity.digest, digest(body)); assert.equal(integrity.signature, false);
    assert.ok(Buffer.byteLength(JSON.stringify(report)) < 16384);
  }
});

test('stable pagination returns all records exactly once and empty pages have no synthetic completion claims', () => {
  for (const [collection, count] of [['suppliers', 6], ['materials', 9], ['documents', 8]]) {
    const ids = [];
    for (let offset = 0; offset < count; offset += 2) {
      const report = list(collection, `limit=2&offset=${offset}`);
      assert.equal(report.pagination.total, count); assert.equal(report.pagination.hasMore, offset + report.items.length < count);
      ids.push(...report.items.map(item => item.id));
    }
    assert.equal(new Set(ids).size, count); assert.deepEqual(ids, [...ids].sort());
    assert.equal(list(collection, 'offset=1000').pagination.returned, 0); assert.equal(list(collection, 'offset=1000').pagination.hasMore, false);
    assert.equal(list(collection, 'q=NO_MATCH').pagination.total, 0); assert.equal(list(collection, 'limit=25').items.length, count);
  }
});

test('filters compose, supplier relationships and units are explicit, and documents have no private content or paths', () => {
  const suppliers = list('suppliers', 'limit=25').items, materials = list('materials', 'limit=25').items;
  assert.equal(list('suppliers', 'category=METALS').items.length, 2); assert.equal(list('materials', 'supplierId=SUP-SYN-001').items.length, 2);
  assert.equal(list('materials', 'supplierId=SUP-SYN-001&category=AUTOMATION').items.length, 0);
  assert.equal(list('documents', 'supplierId=SUP-SYN-003&kind=LICENSE_SAMPLE').items.length, 1);
  assert.equal(list('suppliers', 'q=sup-syn-001').items.length, 1);
  assert.equal(list('documents', 'supplierId=SUP-SYN-999').items.length, 0);
  assert.equal(list('suppliers', new URLSearchParams({ q: ' تجريبي 01 ' }).toString()).items.length, 1);
  for (const material of materials) { assert.ok(suppliers.some(s => s.id === material.supplierId)); assert.ok(['kg', 'piece', 'm'].includes(material.unit)); }
  for (const doc of list('documents', 'limit=25').items) {
    assert.ok(suppliers.some(s => s.id === doc.supplierId)); assert.equal(doc.contentAvailable, false); assert.equal(doc.verification, 'SAMPLE_NOT_EVIDENCE');
    assert.ok(doc.materialId === null || materials.some(m => m.id === doc.materialId && m.supplierId === doc.supplierId));
    for (const field of ['path', 'url', 'content', 'email', 'phone', 'secret', 'licenseNumber']) assert.equal(Object.hasOwn(doc, field), false);
  }
});

test('query contract rejects coercion, duplicate keys, extra permissions and caller-selected paths', () => {
  const bad = ['limit=0', 'limit=26', 'limit=-1', 'limit=1.0', 'limit=01', 'limit=1e1', 'limit=', 'offset=-1', 'offset=1001', 'offset=Infinity',
    'q=a&q=b', 'limit=1&limit=2', 'q[x]=foo', '__proto__[limit]=25', 'constructor=1', 'q=' + 'a'.repeat(81),
    'q=%00', 'q=%E2%80%AE', 'source=/etc/passwd', 'path=/tmp/file', 'url=https://example.invalid', 'productionEnabled=true',
    'category=UNKNOWN', 'supplierId=SUP-SYN-001', 'kind=SPECIFICATION', 'x=' + 'a'.repeat(1025)];
  for (const query of bad) assert.throws(() => list('suppliers', query), /SUPPLIER_LAB_INPUT_REJECTED/, query);
  for (const query of ['supplierId=../file', 'supplierId=SUP-SYN-01', 'category=METALS', 'kind=UNKNOWN']) assert.throws(() => list('documents', query), /SUPPLIER_LAB_INPUT_REJECTED/);
  for (const collection of ['__proto__', 'constructor', 'unknown', '/etc/passwd', ['suppliers'], null, 0, {}]) assert.throws(() => list(collection), /SUPPLIER_LAB_INPUT_REJECTED/);
  assert.throws(() => listSupplierLab('suppliers', {}), /SUPPLIER_LAB_INPUT_REJECTED/);
  assert.deepEqual(list('documents', 'q=/etc/passwd').items, []);
});

test('returned records and policies cannot mutate the fixture dataset, and reports are reproducible', () => {
  const before = list('suppliers'), changed = list('suppliers'); changed.items[0].name = 'changed'; changed.policy.productionEnabled = true;
  changed.contract.path = '/api/run'; changed.pagination.total = 999;
  assert.deepEqual(list('suppliers'), before); assert.deepEqual(list('documents'), list('documents'));
});

test('HTTP contracts require exact host, origin and session and expose no mutation, content or arbitrary file routes', async t => {
  const f = await fixture(t);
  for (const collection of collections) {
    const endpoint = '/api/' + collection;
    assert.equal((await fetch(f.base + endpoint)).status, 403);
    assert.equal((await f.get(endpoint, { 'X-Sheikha-Session': 'bad' })).status, 403);
    assert.equal((await f.get(endpoint, { Origin: 'https://example.invalid' })).status, 403);
    assert.equal((await f.get(endpoint, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
    const hostStatus = await new Promise((resolve, reject) => http.get(f.base + endpoint, { headers: { ...f.headers, Host: 'example.invalid' } }, r => {
      r.resume(); resolve(r.statusCode);
    }).on('error', reject)); assert.equal(hostStatus, 403);
    assert.equal((await fetch(f.base + endpoint, { method: 'POST', headers: { ...f.headers, 'Content-Type': 'application/json' }, body: '{"approved":true}' })).status, 404);
    for (const method of ['PUT', 'DELETE', 'PATCH']) assert.equal((await fetch(f.base + endpoint, { method, headers: f.headers })).status, 405);
    const head = await fetch(f.base + endpoint, { method: 'HEAD', headers: f.headers }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  }
  for (const url of ['/api/documents/DOC-SYN-001/content', '/api/documents/download', '/api/suppliers/SUP-SYN-001', '/core/ownership/sheikha-supplier-lab-v1.cjs', '/runtime/supplier-lab-verification']) assert.equal((await f.get(url)).status, 404);
});

test('HTTP rejects raw duplicate and nested query keys without reflecting data, and handles empty and filtered lists', async t => {
  const f = await fixture(t);
  for (const query of ['path=PRIVATE_SENTINEL', 'q=x&q=y', '__proto__[q]=PRIVATE_SENTINEL', 'q[0]=PRIVATE_SENTINEL', 'limit=26', 'offset=-1', 'url=PRIVATE_SENTINEL', 'q=' + 'x'.repeat(1025)]) {
    const r = await f.get('/api/documents?' + query); assert.equal(r.status, 400, query); const body = await r.json();
    assert.deepEqual(body, { error: 'SUPPLIER_LAB_INPUT_REJECTED' });
  }
  const empty = await f.get('/api/suppliers?q=NO_MATCH'); assert.equal(empty.status, 200); assert.equal((await empty.json()).items.length, 0);
  const filtered = await f.get('/api/materials?supplierId=SUP-SYN-003&limit=1');
  const result = await filtered.json(); assert.equal(result.items.length, 1); assert.equal(result.pagination.total, 2); assert.equal(result.pagination.hasMore, true);
});

test('live local contract checks emit scoped acceptance evidence for the prototype only', async t => {
  const f = await fixture(t), checks = [];
  for (const collection of collections) {
    const response = await f.get(`/api/${collection}?limit=25`); assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store'); assert.ok(response.headers.get('content-security-policy').includes("connect-src 'self'"));
    const report = await response.json(); assert.deepEqual(report, list(collection, 'limit=25'));
    const empty = await f.get(`/api/${collection}?q=NO_MATCH`); assert.equal(empty.status, 200); assert.deepEqual((await empty.json()).items, []);
    const denied = await fetch(f.base + `/api/${collection}`); assert.equal(denied.status, 403);
    const invalid = await f.get(`/api/${collection}?path=/etc/passwd`); assert.equal(invalid.status, 400);
    checks.push({ requirementId: report.contract.requirementId, path: report.contract.path, collection,
      fullList: 'PASS', emptyList: 'PASS', sessionDenied: 'PASS', arbitraryPathDenied: 'PASS', responseDigest: report.integrity.digest });
  }
  const sourceFiles = ['core/ownership/sheikha-supplier-lab-v1.cjs', 'tools/preview/sheikha-supplier-lab-routes.cjs', 'tools/preview/sheikha-workspace-preview.cjs'];
  const sourceHashes = Object.fromEntries(sourceFiles.map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', file))).digest('hex')]));
  const output = path.join(__dirname, '../runtime/supplier-lab-verification'); fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'http-verification.json'), JSON.stringify({ schemaVersion: 1, checkedAt: new Date().toISOString(),
    scope: 'LOCAL_SYNTHETIC_PROTOTYPE_ONLY', checks, sourceHashes, productionApproved: false, assetAcceptanceGranted: false,
    sourcePackageModified: false, externalCallsMade: false }, null, 2));
});
