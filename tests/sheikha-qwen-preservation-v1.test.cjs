'use strict';

const {test, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {audit, measure, sourcePath, copyChecked, MODELS, BASE_FILES, ADAPTER_FILES, TRAINING, CACHE, REVISION, RECIPE, POLICY} = require('../tools/training/preserve-sheikha-qwen-adapters-v1.cjs');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
let root;
function write(name, content) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), {recursive: true, mode: 0o700});
  fs.writeFileSync(file, content, {mode: 0o600});
}
function json(name, data) { write(name, JSON.stringify(data)); }
function mutate(name, fn) { const value = JSON.parse(fs.readFileSync(path.join(root, name))); fn(value); json(name, value); }
const adapter = id => `${TRAINING}/qwen2.5-0.5b-lora-${id}/adapter`;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-qwen-audit-test-'));
  for (const name of BASE_FILES) {
    const bytes = `SYNTHETIC_BASE_${name}`;
    write(`${CACHE}/blobs/${sha(bytes)}`, bytes);
    const file = path.join(root, CACHE, 'snapshots', REVISION, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.symlinkSync(`../../blobs/${sha(bytes)}`, file);
  }
  json(POLICY, {defaultAuthorization: 'DENY', invariantControls: ['NO_AUTOMATIC_WEIGHT_MUTATION']});
  write(RECIPE, '# inert training recipe fixture');
  for (const model of MODELS) {
    const hashes = {};
    for (const name of ADAPTER_FILES) {
      const value = name === 'adapter_config.json' ? JSON.stringify({base_model_name_or_path: 'Qwen/Qwen2.5-0.5B-Instruct', revision: null}) : `SYNTHETIC_${model.id}_${name}`;
      write(`${adapter(model.id)}/${name}`, value);
      hashes[name] = sha(value);
    }
    const dataset = `data/sheikha-ai-training/${model.id}.jsonl`;
    write(dataset, 'SYNTHETIC_DATA_NOT_CUSTOMER_CONTENT');
    json(`${TRAINING}/${model.report}`, {artifact: adapter(model.id), baseModel: 'Qwen/Qwen2.5-0.5B-Instruct', productionApproved: false, artifactHashes: hashes, dataset, datasetSha256: sha('SYNTHETIC_DATA_NOT_CUSTOMER_CONTENT'), baseModelLicenseSha256: sha('SYNTHETIC_BASE_LICENSE')});
    json(`${TRAINING}/${model.evaluation}`, {adapterSha256: hashes['adapter_model.safetensors'], commercialProductionApproved: false, qualityGatePassed: false, status: 'QUALITY_GATE_FAILED'});
    if (model.quarantine) json(`${TRAINING}/${model.quarantine}`, {adapterSha256: hashes['adapter_model.safetensors'], datasetSha256: sha('SYNTHETIC_DATA_NOT_CUSTOMER_CONTENT'), commercialProductionApproved: false, automaticRetrainingAllowed: false, status: 'QUALITY_REGRESSION_QUARANTINED'});
  }
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

test('audits bytes and declarations, without granting quality, rights or runtime approval', async () => {
  const r = await audit(root);
  assert.equal(r.models.length, 3);
  assert.equal(r.allDeclaredArtifactHashesMatched, true);
  assert.equal(r.releaseAuthorized, false);
  assert.equal(r.weightsExecuted, false);
  assert.equal(r.independentBackupVerified, false);
  assert.equal(r.models[2].quarantineStatus, 'QUALITY_REGRESSION_QUARANTINED');
  assert.ok(r.models.every(m => m.baseRevisionAtTrainingVerified === false && m.declaredBaseRevision === null && !m.qualityGatePassed));
});
test('detects weight tampering', async () => {
  write(`${adapter('pilot-v1')}/adapter_model.safetensors`, 'CHANGED');
  await assert.rejects(audit(root), /SOURCE_HASH_MISMATCH/);
});
test('requires a declared digest for every selected artifact', async () => {
  mutate(`${TRAINING}/${MODELS[0].report}`, r => delete r.artifactHashes['tokenizer.json']);
  await assert.rejects(audit(root), /EXPECTED_ARTIFACT_HASH_REQUIRED/);
});
test('binds evaluation and quarantine to exact artifacts', async () => {
  mutate(`${TRAINING}/${MODELS[2].quarantine}`, r => r.adapterSha256 = '0'.repeat(64));
  await assert.rejects(audit(root), /QUARANTINE_MISMATCH/);
});
test('does not accept another artifact evaluation', async () => {
  mutate(`${TRAINING}/${MODELS[0].evaluation}`, r => r.adapterSha256 = '0'.repeat(64));
  await assert.rejects(audit(root), /EVALUATION_ARTIFACT_MISMATCH/);
});
test('refuses relaxed governance', async () => {
  mutate(POLICY, r => r.defaultAuthorization = 'ALLOW');
  await assert.rejects(audit(root), /GOVERNANCE_POLICY_CHANGED_REVIEW_REQUIRED/);
});
test('rejects raw dataset references outside declared scope and traversals', async () => {
  mutate(`${TRAINING}/${MODELS[0].report}`, r => r.dataset = '../secret');
  await assert.rejects(audit(root), /DATASET_OUTSIDE_TRAINING_SCOPE/);
  assert.throws(() => sourcePath(root, 'data/../secret'), /INVALID_SOURCE_PATH/);
});
test('rejects source symlinks except bounded cache blob links', async () => {
  const file = `${adapter('pilot-v1')}/README.md`;
  fs.unlinkSync(path.join(root, file));
  fs.symlinkSync(path.join(root, RECIPE), path.join(root, file));
  await assert.rejects(audit(root), /SOURCE_SYMLINK_REJECTED/);
});
test('rejects cache symlink escaping blobs', async () => {
  const file = path.join(root, CACHE, 'snapshots', REVISION, 'LICENSE');
  fs.unlinkSync(file);
  fs.symlinkSync(path.join(root, RECIPE), file);
  await assert.rejects(audit(root), /CACHE_LINK_ESCAPES_BLOBS/);
});
test('does not follow symlinked source parents', async () => {
  fs.renameSync(path.join(root, adapter('pilot-v1')), path.join(root, 'moved'));
  fs.symlinkSync(path.join(root, 'moved'), path.join(root, adapter('pilot-v1')));
  await assert.rejects(audit(root), /SOURCE_PARENT_SYMLINK_REJECTED/);
});
test('copies private bytes once, rejects changes since audit and refuses overwrite', async () => {
  const r = await audit(root);
  const entry = r.models[0].files[0];
  const to = path.join(root, 'new', 'README.md');
  await copyChecked(root, entry, to);
  assert.equal(fs.statSync(to).mode & 0o777, 0o600);
  assert.equal((await measure(to)).sha256, entry.sha256);
  await assert.rejects(copyChecked(root, entry, to), {code: 'EEXIST'});
  write(entry.source, 'CHANGED');
  await assert.rejects(copyChecked(root, entry, path.join(root, 'other', 'README.md')), /SOURCE_CHANGED_SINCE_AUDIT/);
});
