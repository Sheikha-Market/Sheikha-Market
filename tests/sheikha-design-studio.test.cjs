'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const studio = require('../core/robotics/sheikha-design-studio.cjs');
const { createStudio } = require('../tools/preview/sheikha-robot-studio-routes.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const defaults = studio.catalog().defaultDesign;

test('four robot families have compatible tools, deterministic designs and explicit hardware gaps', () => {
  const catalog = studio.catalog(); assert.equal(catalog.families.length, 4);
  for (const family of catalog.families) for (const tool of family.tools) {
    const design = studio.buildDesign({ ...defaults, family: family.id, tool });
    assert.equal(design.id, studio.buildDesign(design.parameters).id);
    assert.equal(design.simulation.success, true);
    assert.equal(design.boundaries.physicalCommandSent, false);
    assert.equal(design.controller.firmware, 'NOT_IMPLEMENTED');
    assert.equal(design.geometry.physicallyCalibrated, false);
    assert.ok(design.controller.requirements.includes('INDEPENDENT_SAFETY_REVIEW'));
    assert.ok(design.assembly.every(p => p.quantity === null));
  }
  catalog.families[0].name = 'changed'; assert.notEqual(studio.catalog().families[0].name, 'changed');
});
test('design admission rejects extra authorities, endpoints, incompatible tools and nonfinite scale', () => {
  for (const input of [{ ...defaults, endpoint: 'http://device' }, { ...defaults, approved: true }, { ...defaults, tool: 'laser' }, { ...defaults, family: 'arm', tool: 'tray' }, ...[NaN, Infinity, '1', 0, 100].map(scale => ({ ...defaults, scale }))]) assert.throws(() => studio.buildDesign(input));
  const getter = { ...defaults }; Object.defineProperty(getter, 'family', { get() { throw Error('GETTER_RAN'); } });
  assert.throws(() => studio.buildDesign(getter), /FIELDS_REJECTED/);
});
test('producer exchange validates a contract without claiming authentication or fetching content', () => {
  const request = studio.exchange(defaults); assert.equal(request.status, 'NOT_SENT');
  const receipt = { schema: 'SHEIKHA_PRODUCER_RECEIPT_V1', designId: request.designId, producer: 'local-test-fixture', reference: 'concept-01', artifactSha256: 'a'.repeat(64) };
  const result = studio.checkReceipt(receipt, request.designId);
  assert.equal(result.artifactFetched, false); assert.equal(result.producerAuthenticated, false); assert.equal(result.artifactHashVerified, false);
  assert.throws(() => studio.checkReceipt({ ...receipt, endpoint: 'https://example.invalid' }, request.designId));
  assert.throws(() => studio.checkReceipt({ ...receipt, designId: 'b'.repeat(64) }, request.designId));
  assert.throws(() => studio.checkReceipt({ ...receipt, producer: '<script>' }, request.designId));
});
test('render manager admits one job and records failed workers without serving partial artifacts', async t => {
  const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-studio-unit-')); t.after(() => fs.rmSync(storage, { recursive: true, force: true }));
  let fail; const manager = createStudio({ storage, renderWorker: () => new Promise((_, reject) => { fail = reject; }) });
  const job = manager.submit(defaults, 'http://127.0.0.1:1');
  assert.equal(job.status, 'RENDERING'); assert.throws(() => manager.submit(defaults, ''), /RENDER_BUSY/);
  assert.equal(createStudio({ storage }).read(job.id).status, 'WORKER_UNVERIFIED');
  fail(Error('test failure')); await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(manager.read(job.id).status, 'FAILED'); assert.equal(manager.busy(), false);
  assert.equal(fs.existsSync(path.join(storage, '.render.lock')), false);
  assert.throws(() => manager.read('../private'));
});
test('studio HTTP uses existing session/origin gates and never sends hardware commands', async t => {
  const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-studio-http-'));
  const server = createWorkspaceServer({ studio: { storage } }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }); fs.rmSync(storage, { recursive: true, force: true }); });
  const origin = `http://127.0.0.1:${server.address().port}`, base = origin + '/api/sheikha/workspace/v1';
  const token = (await (await fetch(base + '/session')).json()).token;
  const headers = { 'content-type': 'application/json', 'x-sheikha-session': token };
  const post = (route, body, extra = {}) => fetch(base + '/studio/' + route, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(body) });
  assert.equal((await post('design', defaults, { 'x-sheikha-session': '' })).status, 403);
  assert.equal((await post('design', defaults, { origin: 'http://example.invalid' })).status, 403);
  const response = await post('design', defaults); assert.equal(response.status, 200); assert.equal((await response.json()).parameters.family, 'mobile');
  assert.equal((await post('render', { ...defaults, outputPath: '/tmp/no' })).status, 400);
  const blocked = await post('physical-command', { approved: true }); assert.equal(blocked.status, 403); assert.equal((await blocked.json()).physicalCommandSent, false);
  assert.equal((await fetch(base + '/studio/jobs/no-id/video.mp4')).status, 404);
  assert.equal((await fetch(origin + '/architecture-explorer/vendor/three/three.module.min.js')).status, 200);
});

test('retained locks, symlinked storage and the job quota cannot be bypassed', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-studio-bounds-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const options = { storage: root, renderWorker: async () => {} };
  fs.writeFileSync(path.join(root, '.render.lock'), 'existing-worker');
  assert.throws(() => createStudio(options).submit(defaults, ''), /RENDER_LOCKED/);
  fs.unlinkSync(path.join(root, '.render.lock'));
  for (let i = 0; i < 24; i++) fs.mkdirSync(path.join(root, `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`));
  assert.throws(() => createStudio(options).submit(defaults, ''), /LOCAL_JOB_QUOTA_REACHED/);
  const link = root + '-link'; fs.symlinkSync(root, link); t.after(() => fs.unlinkSync(link));
  assert.throws(() => createStudio({ ...options, storage: link }).submit(defaults, ''), /STORAGE_REJECTED/);
});

test('a successful worker exit without verified output is still a failed job', async t => {
  const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-studio-evidence-')); t.after(() => fs.rmSync(storage, { recursive: true, force: true }));
  const manager = createStudio({ storage, renderWorker: async () => {} });
  const job = manager.submit(defaults, 'http://127.0.0.1:1');
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(manager.read(job.id).status, 'FAILED'); assert.equal(manager.read(job.id).reviewApproved, false);
});
