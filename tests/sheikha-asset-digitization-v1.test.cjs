'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { once } = require('node:events');
const { createAssetDigitization, SOURCE_DEFINITIONS, LIMITS } = require('../core/ownership/sheikha-asset-digitization-v1.cjs');
const { digest } = require('../core/ownership/sheikha-owned-asset-registry.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-assets-')); t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const sourcePaths = Object.fromEntries(SOURCE_DEFINITIONS.map(([id]) => [id, path.join(temp, id)]));
  for (const [id, , , kind] of SOURCE_DEFINITIONS) fs.writeFileSync(sourcePaths[id], kind === 'json' ? '{}' : 'PRIVATE_SENTINEL; process.exit(99);', { mode: 0o600 });
  const write = (id, value) => fs.writeFileSync(sourcePaths[id], JSON.stringify(value));
  write('mvp-requirements', { scope: 'DESIGN_ONLY' }); write('mvp-architecture', { pattern: 'modular_monolith' });
  write('mvp-tests', { execution: 'LAB_ONLY' }); write('mvp-interfaces', { contracts: [
    { implementation: 'NOT_IMPLEMENTED', path: '/api/suppliers' }, { implementation: 'NOT_IMPLEMENTED', path: '/api/materials' },
    { implementation: 'NOT_IMPLEMENTED', path: '/api/documents' }
  ] });
  const hashes = () => Object.fromEntries(['requirements', 'architecture', 'tests', 'interfaces'].map(n => [n + '.json', sha(fs.readFileSync(sourcePaths['mvp-' + n]))]));
  write('mvp-manifest', { files_sha256: hashes(), authority_granted: false, payments_authorized: false,
    production_enabled: false, physical_actuation: false, decision: 'DESIGN_ONLY_HOLD' });
  const options = { sourcePaths, now: () => 1792548000000, root: path.join(temp, 'snapshots') };
  return { temp, options, sourcePaths, write, hashes, service: createAssetDigitization(options) };
}

test('digitization is bounded, deterministic, redacted and read-only with no inherited authority', t => {
  const f = fixture(t), before = Object.values(f.sourcePaths).map(p => fs.readFileSync(p, 'utf8'));
  const report = f.service.inspect(), { integrity, ...body } = report;
  assert.equal(report.assets.length, 6); assert.equal(report.sources.length, 11); assert.equal(integrity.digest, digest(body));
  assert.equal(report.packageAudit.decision, 'DESIGN_ONLY_HOLD'); assert.equal(report.packageAudit.unimplementedContracts, 3);
  assert.equal(report.packageAudit.executionTested, false); assert.equal(report.attachmentCopies, 2); assert.equal(report.uniqueAttachmentContents, 1);
  assert.ok(report.assets.every(a => a.recordStatus === 'DIGITIZED_DRAFT' && a.productionEnabled === false && a.ownershipVerified === false));
  assert.ok(report.assets.every(a => a.gates.every(g => g.status === 'REVIEW_REQUIRED')));
  assert.equal(report.purchaseDeclaration.perAssetAllocationConfirmed, false);
  for (const [key, value] of Object.entries(report.policy)) if (key !== 'mode') assert.equal(value, false, key);
  assert.equal(JSON.stringify(report).includes('PRIVATE_SENTINEL'), false); assert.equal(JSON.stringify(report).includes(f.temp), false);
  assert.deepEqual(Object.values(f.sourcePaths).map(p => fs.readFileSync(p, 'utf8')), before); assert.equal(fs.existsSync(f.options.root), false);
  assert.deepEqual(f.service.inspect(), report); report.assets[0].name = 'changed'; report.policy.productionEnabled = true;
  assert.notEqual(f.service.inspect().assets[0].name, 'changed'); assert.equal(f.service.inspect().policy.productionEnabled, false);
});

test('full requested inventory scope records the reply without inventing purchases, assets or approvals', t => {
  const f = fixture(t), report = f.service.inspect(), scope = report.inventoryScope;
  assert.equal(scope.status, 'FULL_SCOPE_REQUESTED_NOT_ITEMIZED');
  assert.deepEqual(scope.request, { source: 'USER_SCOPE_REPLY', text: 'الافضل الكل', receivedOn: '2026-10-22', timezone: 'Asia/Riyadh' });
  for (const key of ['inventoryComplete', 'itemizedPurchaseListProvided', 'purchaseEvidenceProvided', 'executionAuthorized']) assert.equal(scope[key], false);
  assert.deepEqual(scope.categories.map(c => c.id), ['domains', 'hosting', 'software', 'licenses', 'equipment', 'visuals']);
  const ids = scope.categories.flatMap(c => c.knownAssetIds);
  assert.equal(new Set(ids).size, 6); assert.deepEqual([...ids].sort(), report.assets.map(a => a.id).sort());
  for (const category of scope.categories) {
    assert.equal(category.purchaseVerified, false); assert.equal(category.productionEnabled, false);
    assert.ok(category.requiredDetails.length > 0 && category.requiredEvidence.length > 0);
    assert.equal(category.itemizationStatus, category.knownAssetIds.length ? 'KNOWN_RECORDS_ONLY' : 'ITEMIZED_LIST_REQUIRED');
  }
  for (const id of ['licenses', 'equipment', 'visuals']) assert.deepEqual(scope.categories.find(c => c.id === id).knownAssetIds, []);
  assert.equal(report.assets.length, 6); assert.equal(report.sources.length, 11); assert.equal(report.executionPlan.requirements.length, 66);
  assert.equal(report.purchaseDeclaration.perAssetAllocationConfirmed, false);
  scope.categories[0].knownAssetIds.push('INVENTED'); scope.categories[0].requiredEvidence[0] = 'changed'; scope.executionAuthorized = true;
  const fresh = f.service.inspect(); assert.equal(fresh.inventoryScope.executionAuthorized, false);
  assert.equal(JSON.stringify(fresh).includes('INVENTED'), false); assert.equal(JSON.stringify(fresh).includes('changed'), false);
});

test('duplicate attachments are counted by bytes, and source mismatch is never ownership proof', t => {
  const f = fixture(t); let report = f.service.inspect();
  assert.equal(report.uniqueAttachmentContents, 1); assert.ok(report.sources.filter(s => s.recordedDigest).every(s => s.matchesRecordedDigest === false));
  assert.equal(report.assets.find(a => a.id === 'domain-core').evidenceStatus, 'DIGEST_MISMATCH');
  fs.writeFileSync(f.sourcePaths['attachment-2'], 'different'); report = f.service.inspect(); assert.equal(report.uniqueAttachmentContents, 2);
  fs.unlinkSync(f.sourcePaths['attachment-1']); report = f.service.inspect(); assert.equal(report.attachmentCopies, 1);
  assert.equal(report.policy.purchaseVerified, false);
});

test('package hash checks and declared hold do not accept incomplete or self-approved declarations', t => {
  const f = fixture(t); f.write('mvp-requirements', { scope: 'DESIGN_ONLY', changed: true });
  let report = f.service.inspect(); assert.equal(report.packageAudit.declaredHashesMatch, false); assert.equal(report.packageAudit.decision, 'REVIEW_REQUIRED');
  f.write('mvp-manifest', { files_sha256: f.hashes(), authority_granted: true, payments_authorized: true,
    physical_actuation: true, production_enabled: true, decision: 'FULLY_SEALED' });
  report = f.service.inspect(); assert.equal(report.packageAudit.declaredHashesMatch, true); assert.equal(report.packageAudit.declaredHold, false);
  assert.equal(report.policy.productionEnabled, false); assert.equal(report.packageAudit.decision, 'REVIEW_REQUIRED');
  f.write('mvp-interfaces', { contracts: Array(101).fill({ implementation: 'NOT_IMPLEMENTED' }) });
  assert.equal(f.service.inspect().packageAudit.contractsCount, null);
  f.write('mvp-interfaces', []); report = f.service.inspect();
  assert.equal(report.sources.find(s => s.id === 'mvp-interfaces').status, 'INVALID_JSON');
  assert.equal(report.assets.find(a => a.id === 'supplier-package').evidenceStatus, 'INCOMPLETE');
  fs.writeFileSync(f.sourcePaths['mvp-manifest'], 'SECRET_INVALID_JSON');
  assert.equal(JSON.stringify(f.service.inspect()).includes('SECRET_INVALID_JSON'), false);
});

test('source reader refuses oversized, linked, special and symlinked files without traversing directories', t => {
  const f = fixture(t), p = f.sourcePaths['domain-source'];
  const status = () => f.service.inspect().sources.find(s => s.id === 'domain-source').status;
  fs.writeFileSync(p, Buffer.alloc(LIMITS.sourceBytes + 1)); assert.equal(status(), 'UNREADABLE'); fs.unlinkSync(p);
  fs.symlinkSync(f.sourcePaths['host-source'], p); assert.equal(status(), 'UNREADABLE'); fs.unlinkSync(p);
  fs.linkSync(f.sourcePaths['host-source'], p); assert.equal(status(), 'UNREADABLE'); fs.unlinkSync(p);
  fs.mkdirSync(p); assert.equal(status(), 'UNREADABLE'); fs.rmdirSync(p);
  fs.symlinkSync(f.temp, p);
  const service = createAssetDigitization({ ...f.options, sourcePaths: { ...f.sourcePaths, 'domain-source': path.join(p, 'host-source') } });
  assert.equal(service.inspect().sources.find(s => s.id === 'domain-source').status, 'UNREADABLE');
  const special = createAssetDigitization({ ...f.options, sourcePaths: { ...f.sourcePaths, 'domain-source': '/dev/zero' } });
  assert.equal(special.inspect().sources.find(s => s.id === 'domain-source').status, 'UNREADABLE');
});

test('source configuration is server-only and rejects unknown or relative overrides', () => {
  assert.throws(() => createAssetDigitization({ sourcePaths: { arbitrary: '/tmp/file' } }), /ASSET_INPUT_REJECTED/);
  assert.throws(() => createAssetDigitization({ sourcePaths: { 'host-source': '../file' } }), /ASSET_INPUT_REJECTED/);
});

test('changes during source reads are rejected rather than recorded as a stable observation', t => {
  const f = fixture(t), originalRead = fs.readSync;
  let changed = false;
  fs.readSync = function(...args) {
    const n = originalRead.apply(this, args);
    if (!changed) { changed = true; fs.appendFileSync(f.sourcePaths['attachment-1'], 'changed'); }
    return n;
  };
  try { assert.equal(f.service.inspect().sources.find(s => s.id === 'attachment-1').status, 'UNREADABLE'); }
  finally { fs.readSync = originalRead; }
});

test('explicit snapshots are private, content addressed, idempotent and reject changed records', t => {
  const f = fixture(t), saved = f.service.snapshot(), file = path.join(f.options.root, saved.id + '.json');
  assert.equal(saved.id, saved.report.integrity.digest); assert.deepEqual(JSON.parse(fs.readFileSync(file)), saved.report);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600); assert.equal(fs.statSync(f.options.root).mode & 0o777, 0o700);
  assert.deepEqual(f.service.snapshot(), saved); assert.equal(fs.readdirSync(f.options.root).length, 1);
  fs.writeFileSync(file, '{}'); assert.throws(() => f.service.snapshot(), /ASSET_RECORD_REJECTED/);
  assert.equal(fs.readFileSync(file, 'utf8'), '{}');
});

test('snapshot locks and bounded capacity never delete existing records or grant production', t => {
  const f = fixture(t); fs.mkdirSync(f.options.root, { mode: 0o700 });
  fs.mkdirSync(path.join(f.options.root, '.write-lock'));
  assert.throws(() => f.service.snapshot(), /ASSET_BUSY/); fs.rmdirSync(path.join(f.options.root, '.write-lock'));
  for (let i = 0; i < 100; i++) fs.writeFileSync(path.join(f.options.root, `preserved-${i}`), 'unchanged');
  assert.throws(() => f.service.snapshot(), /ASSET_CAPACITY_LIMIT/); assert.equal(fs.readdirSync(f.options.root).length, 100);
});

test('architecture references only declared passports and assigns no people or executable routes', t => {
  const report = fixture(t).service.inspect(), ids = new Set(report.assets.map(a => a.id));
  assert.equal(report.architecture.status, 'PROPOSED_NOT_DEPLOYED');
  for (const link of report.architecture.links) { assert.ok(ids.has(link.source)); assert.ok(ids.has(link.target)); assert.equal(link.deployed, false); }
  assert.ok(report.governance.gates.every(g => g.assignedPerson === null)); assert.equal(report.governance.certificationGranted, false);
  assert.deepEqual(report.assets.find(a => a.id === 'domain-core').aliases, ['www.sheikha.top']);
});

test('asset HTTP report uses exact local gates and exposes no execute, upload, save or caller-selected path', async t => {
  const f = fixture(t), server = createWorkspaceServer({ assets: f.options });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`, api = base + '/api/sheikha/workspace/v1';
  const token = (await (await fetch(api + '/session')).json()).token, headers = { 'X-Sheikha-Session': token };
  const endpoint = api + '/assets/report';
  assert.equal((await fetch(endpoint)).status, 403);
  assert.equal((await fetch(endpoint, { headers: { ...headers, Origin: 'https://example.invalid' } })).status, 403);
  assert.equal(await new Promise((resolve, reject) => http.get(endpoint, { headers: { ...headers, Host: 'example.invalid' } }, r => {
    r.resume(); resolve(r.statusCode);
  }).on('error', reject)), 403);
  assert.equal((await fetch(endpoint + '?path=/etc/passwd', { headers })).status, 400);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}' })).status, 404);
  const response = await fetch(endpoint, { headers }); assert.equal(response.status, 200); assert.deepEqual(await response.json(), f.service.inspect());
  assert.equal(fs.existsSync(f.options.root), false);
  assert.equal((await fetch(base + '/runtime/asset-digitization/v1')).status, 404);
});
