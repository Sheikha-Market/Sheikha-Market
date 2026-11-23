'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const api = require('../../core/scientific-knowledge/index.cjs');
const clone = v => JSON.parse(JSON.stringify(v));
const temp = t => { const p = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-science-test-')); t.after(() => fs.rmSync(p, { recursive: true, force: true })); return p; };

test('primary-source knowledge manifest, dimensions and Planck boundary are valid', () => {
  const k = api.loadKnowledge();
  assert.equal(k.data.topics.length, 15);
  assert.equal(k.data.sources.length, 20);
  assert.equal(k.data.scales.length, 6);
  assert.equal(k.canonicalSha256, k.manifest.artifactCanonicalSha256);
  assert.equal(k.data.boundaries.physicalNanorobotsFabricated, false);
});
test('one proposal per flat record and per explicit category without inferred training', () => {
  const data = { b: { family: 'vision', shk_reward: 9 }, a: { category: 'science' }, c: {} };
  const original = JSON.stringify(data);
  const b = api.buildBlueprint({ data });
  assert.deepEqual(b.records.map(r => r.id), ['a', 'b', 'c']);
  assert.equal(b.categories.length, 3);
  assert.equal(b.registry.recordCount, 3);
  for (const x of [...b.records, ...b.categories]) {
    assert.equal(x.profile.status, api.STATUS);
    assert.equal(x.profile.model.checkpoint, null);
    assert.deepEqual(x.profile.approvedTaskCapabilities, []);
    assert.equal(x.profile.evaluation.passed, false);
    assert.equal(x.profile.deployment.enabled, false);
  }
  assert.equal(JSON.stringify(data), original);
  assert.equal(b.boundaries.shkGenerated, false);
  assert.deepEqual(b.domainBlueprints.map(x => x.domain), ['geological_mining', 'metals_foundry', 'computational_mining']);
  assert.ok(b.domainBlueprints.every(x => x.sourceIds.length && x.profile.status === api.STATUS));
});
test('list and supported wrapper shapes produce stable counts and SHA', () => {
  const rows = [{ id: 'two', category: 'a' }, { id: 'one', category: 'a' }];
  for (const data of [rows, { weights: rows }, { records: rows }, { ledger: rows }]) {
    const b = api.buildBlueprint({ data });
    assert.equal(b.records.length, 2); assert.equal(b.categories.length, 1);
  }
  assert.equal(api.sha256({ z: 1, a: 2 }), api.sha256({ a: 2, z: 1 }));
  assert.equal(api.sha256(api.buildBlueprint({ data: rows })), api.sha256(api.buildBlueprint({ data: rows })));
});
test('duplicate IDs, conflicting IDs, invalid categories and NaN fail closed', () => {
  assert.throws(() => api.normalizeRegistry([{ id: 'a' }, { id: 'a' }]), /DUPLICATE_RECORD_ID/);
  assert.throws(() => api.normalizeRegistry({ a: { id: 'b' } }), /CONFLICTING_RECORD_ID/);
  assert.throws(() => api.normalizeRegistry([{ id: 'a', category: 0 }]), /INVALID_CATEGORY/);
  assert.throws(() => api.normalizeRegistry([{ id: 'a', score: NaN }]), /NON_FINITE_NUMBER/);
  assert.throws(() => api.normalizeRegistry({ weights: [{ id: 'a' }], ledger: [{ id: 'b' }] }), /AMBIGUOUS_REGISTRY_CONTAINER/);
});
test('physical dimensions, cross-unit arithmetic and source references reject corruption', () => {
  const original = api.loadKnowledge().data;
  const dimensional = clone(original); dimensional.relationships[0].to.unit = 's';
  assert.throws(() => api.validateKnowledge(dimensional), /DIMENSION_MISMATCH/);
  const conversion = clone(original); conversion.relationships[0].to.value = 1e-6;
  assert.throws(() => api.validateKnowledge(conversion), /CROSS_UNIT_VALUE/);
  const equation = clone(original); equation.relationships[3].factors[1].unit = 'm';
  assert.throws(() => api.validateKnowledge(equation), /DIMENSION_MISMATCH/);
  const scale = clone(original); scale.scales[0].unit = 'kg';
  assert.throws(() => api.validateKnowledge(scale), /INVALID_LENGTH_SCALE/);
  const source = clone(original); source.topics[0].sourceIds = ['unregistered'];
  assert.throws(() => api.validateKnowledge(source), /SOURCE_REFERENCE/);
  assert.notEqual(api.sha256(source), api.loadKnowledge().manifest.artifactCanonicalSha256);
  const typed = clone(original); typed.scales[0].value = '1';
  assert.throws(() => api.validateKnowledge(typed), /INVALID_LENGTH_SCALE/);
  const tampered = api.loadKnowledge(); tampered.data.topics[0].mechanismAr += ' changed';
  assert.throws(() => api.buildBlueprint({ data: [{ id: 'a' }] }, tampered), /KNOWLEDGE_PROVENANCE_HASH/);
});
test('bounded reads reject symlinks, replacement, size growth and nonfinite JSON', t => {
  const dir = temp(t), file = path.join(dir, 'input.json');
  fs.writeFileSync(file, '{"a":1}');
  const link = path.join(dir, 'link.json'); fs.symlinkSync(file, link);
  assert.throws(() => api.readSnapshot(link), /SOURCE_SYMLINK/);
  assert.throws(() => api.readSnapshot(file, 2), /SOURCE_TYPE_OR_SIZE/);
  assert.throws(() => api.readSnapshot(file, 1024, { afterRead() { fs.renameSync(file, file + '.old'); fs.writeFileSync(file, '{"a":2}'); } }), /SOURCE_CHANGED/);
  assert.throws(() => api.readSnapshot(file, 1024, { afterRead() { fs.appendFileSync(file, ' '); } }), /SOURCE_CHANGED/);
  fs.writeFileSync(file, '{"a":1e999}');
  assert.throws(() => api.readSnapshot(file), /NON_FINITE_NUMBER/);
});
test('exclusive output preserves existing file and rejects symlinked parent', t => {
  const dir = temp(t), output = path.join(dir, 'blueprint.json');
  fs.writeFileSync(output, 'user content');
  assert.throws(() => api.writeExclusive(output, { a: 1 }), { code: 'EEXIST' });
  assert.equal(fs.readFileSync(output, 'utf8'), 'user content');
  const link = path.join(dir, 'linked'); fs.symlinkSync(dir, link);
  assert.throws(() => api.writeExclusive(path.join(link, 'new.json'), { a: 1 }), /OUTPUT_PARENT_SYMLINK/);
});
test('CLI summary is read-only and explicit output is a complete, exclusive proposal', t => {
  const dir = temp(t), registry = path.join(dir, 'registry.json'), output = path.join(dir, 'profiles.json');
  fs.writeFileSync(registry, JSON.stringify([{ id: 'one', category: 'a' }, { id: 'two', category: 'a' }]));
  const initial = fs.readFileSync(registry);
  const cli = path.resolve(__dirname, '../../tools/scientific-knowledge/sheikha-scientific-knowledge-v1.cjs');
  const run = extra => spawnSync(process.execPath, [cli, '--registry', registry, ...extra], { encoding: 'utf8' });
  const summary = run([]); assert.ifError(summary.error); assert.equal(summary.status, 0, summary.stderr);
  assert.equal(JSON.parse(summary.stdout).totalProfiles, 3);
  assert.deepEqual(fs.readdirSync(dir), ['registry.json']);
  const created = run(['--output', output]); assert.equal(created.status, 0, created.stderr);
  const saved = fs.readFileSync(output); assert.equal(JSON.parse(saved).records.length, 2);
  const duplicate = run(['--output', output]); assert.notEqual(duplicate.status, 0);
  assert.deepEqual(fs.readFileSync(output), saved); assert.deepEqual(fs.readFileSync(registry), initial);
});
