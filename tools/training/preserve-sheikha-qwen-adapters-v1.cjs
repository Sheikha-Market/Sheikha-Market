#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {Transform} = require('node:stream');
const {pipeline} = require('node:stream/promises');
const custody = require('./sheikha-artifact-custody-v1');

const ROOT = path.resolve(__dirname, '../..');
const TRAINING = 'runtime/sheikha-ai-governor/v1/llm-training';
const BASE_ID = 'Qwen/Qwen2.5-0.5B-Instruct';
const REVISION = '7ae557604adf67be50417f59c2c2f167def9a775';
const CACHE = `${TRAINING}/cache/models--Qwen--Qwen2.5-0.5B-Instruct`;
const ADAPTER_FILES = ['README.md', 'adapter_config.json', 'adapter_model.safetensors', 'chat_template.jinja', 'tokenizer.json', 'tokenizer_config.json'];
const BASE_FILES = ['LICENSE', 'config.json', 'generation_config.json', 'merges.txt', 'model.safetensors', 'tokenizer.json', 'tokenizer_config.json', 'vocab.json'];
const MODELS = [
  {id: 'pilot-v1', report: 'sheikha-qwen-lora-pilot-v1-report.json', evaluation: 'sheikha-qwen-lora-pilot-v1-evaluation.json'},
  {id: 'cidar-v1', report: 'sheikha-qwen-lora-cidar-v1-report.json', evaluation: 'qwen2.5-0.5b-lora-cidar-v1-evaluation.json'},
  {id: 'curriculum-v2', report: 'sheikha-qwen-lora-curriculum-v2-report.json', evaluation: 'sheikha-qwen-lora-curriculum-v2-evaluation.json', quarantine: 'sheikha-qwen-lora-curriculum-v2-quarantine.json'},
];
const POLICY = `${TRAINING}/sheikha-learning-production-policy-v1.json`;
const RECIPE = 'tools/training/train-sheikha-qwen-lora-pilot-v1.py';
const MAX_FILE = 2 * 1024 ** 3;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function fail(code) { throw new Error(code); }
function sameStat(a, b) { return ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs'].every(k => a[k] === b[k]); }

function sourcePath(root, relative, cacheLink = false) {
  if (typeof relative !== 'string' || !/^[A-Za-z0-9_./-]+$/.test(relative) || relative.split('/').some(p => !p || p === '.' || p === '..')) fail('INVALID_SOURCE_PATH');
  const file = path.join(root, relative);
  if (fs.realpathSync(path.dirname(file)) !== path.dirname(file)) fail('SOURCE_PARENT_SYMLINK_REJECTED');
  const stat = fs.lstatSync(file);
  if (!stat.isSymbolicLink()) return file;
  if (!cacheLink || !relative.startsWith(`${CACHE}/snapshots/${REVISION}/`)) fail('SOURCE_SYMLINK_REJECTED');
  const target = fs.realpathSync(file);
  const blobs = path.join(root, CACHE, 'blobs');
  if (path.dirname(target) !== blobs || fs.realpathSync(blobs) !== blobs) fail('CACHE_LINK_ESCAPES_BLOBS');
  return target;
}

async function measure(file, destination) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  let out;
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.nlink !== 1 || before.uid !== process.getuid() || before.size < 1 || before.size > MAX_FILE) fail('INVALID_SOURCE_FILE');
    const hash = crypto.createHash('sha256');
    let bytes = 0;
    if (destination) out = fs.openSync(destination, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
    const meter = new Transform({transform(chunk, _, done) {
      bytes += chunk.length;
      if (bytes > before.size) return done(new Error('SOURCE_CHANGED'));
      hash.update(chunk); done(null, chunk);
    }});
    const input = fs.createReadStream(null, {fd, autoClose: false, highWaterMark: 1024 * 1024});
    if (out !== undefined) await pipeline(input, meter, fs.createWriteStream(null, {fd: out, autoClose: false}));
    else { for await (const chunk of input) { bytes += chunk.length; if (bytes > before.size) fail('SOURCE_CHANGED'); hash.update(chunk); } }
    if (bytes !== before.size || !sameStat(before, fs.fstatSync(fd))) fail('SOURCE_CHANGED');
    if (out !== undefined) fs.fsyncSync(out);
    return {bytes, sha256: hash.digest('hex')};
  } finally { fs.closeSync(fd); if (out !== undefined) fs.closeSync(out); }
}

async function checked(root, relative, expected, cacheLink = false) {
  const source = sourcePath(root, relative, cacheLink);
  const info = await measure(source);
  if (expected !== undefined && (!/^[a-f0-9]{64}$/.test(expected) || info.sha256 !== expected)) fail('SOURCE_HASH_MISMATCH');
  return {source: relative, resolvedSource: path.relative(root, source), ...info};
}

async function readJson(root, relative) {
  const info = await checked(root, relative);
  if (info.bytes > 2 * 1024 * 1024) fail('METADATA_TOO_LARGE');
  const bytes = fs.readFileSync(sourcePath(root, relative));
  if (digest(bytes) !== info.sha256) fail('SOURCE_CHANGED');
  return {info, value: JSON.parse(bytes)};
}

async function audit(root = ROOT) {
  const base = [];
  for (const name of BASE_FILES) base.push({...await checked(root, `${CACHE}/snapshots/${REVISION}/${name}`, undefined, true), path: `base/${name}`});
  const policy = await readJson(root, POLICY);
  if (policy.value.defaultAuthorization !== 'DENY' || !policy.value.invariantControls?.includes('NO_AUTOMATIC_WEIGHT_MUTATION')) fail('GOVERNANCE_POLICY_CHANGED_REVIEW_REQUIRED');
  const recipe = await checked(root, RECIPE);
  const models = [];
  for (const spec of MODELS) {
    const report = await readJson(root, `${TRAINING}/${spec.report}`);
    const evaluation = await readJson(root, `${TRAINING}/${spec.evaluation}`);
    const adapterDir = `${TRAINING}/qwen2.5-0.5b-lora-${spec.id}/adapter`;
    if (report.value.artifact !== adapterDir || report.value.baseModel !== BASE_ID || report.value.productionApproved !== false || evaluation.value.commercialProductionApproved !== false) fail('MODEL_DECLARATIONS_CHANGED_REVIEW_REQUIRED');
    const files = [];
    for (const name of ADAPTER_FILES) {
      const expected = report.value.artifactHashes?.[name];
      if (typeof expected !== 'string') fail('EXPECTED_ARTIFACT_HASH_REQUIRED');
      files.push({...await checked(root, `${adapterDir}/${name}`, expected), path: `adapter/${name}`});
    }
    const weight = files.find(f => f.path === 'adapter/adapter_model.safetensors');
    if (evaluation.value.adapterSha256 !== weight.sha256) fail('EVALUATION_ARTIFACT_MISMATCH');
    const config = await readJson(root, `${adapterDir}/adapter_config.json`);
    if (config.value.base_model_name_or_path !== BASE_ID) fail('BASE_MODEL_MISMATCH');
    const datasetPath = report.value.dataset;
    if (typeof datasetPath !== 'string' || !datasetPath.startsWith('data/sheikha-ai-training/')) fail('DATASET_OUTSIDE_TRAINING_SCOPE');
    const dataset = await checked(root, datasetPath, report.value.datasetSha256);
    const license = base.find(f => f.path === 'base/LICENSE');
    if (license.sha256 !== report.value.baseModelLicenseSha256) fail('DECLARED_LICENSE_HASH_MISMATCH');
    let quarantine;
    if (spec.quarantine) {
      quarantine = await readJson(root, `${TRAINING}/${spec.quarantine}`);
      if (quarantine.value.adapterSha256 !== weight.sha256 || quarantine.value.datasetSha256 !== dataset.sha256 || quarantine.value.commercialProductionApproved !== false || quarantine.value.automaticRetrainingAllowed !== false || quarantine.value.status !== 'QUALITY_REGRESSION_QUARANTINED') fail('QUARANTINE_MISMATCH');
    }
    models.push({
      id: spec.id, files, report: report.info, evaluation: evaluation.info, dataset,
      evaluationStatus: evaluation.value.status, qualityGatePassed: evaluation.value.qualityGatePassed === true,
      quarantine: quarantine?.info || null, quarantineStatus: quarantine?.value.status || null,
      adapterSha256: weight.sha256, declaredBaseRevision: config.value.revision ?? null,
      baseRevisionAtTrainingVerified: false, cachedBaseRevisionObserved: REVISION,
      approvedForPromotion: false, rightsVerified: false,
    });
  }
  return {
    system: 'SHEIKHA_QWEN_PRESERVATION_AUDIT_V1', checkedAt: new Date().toISOString(),
    scope: 'THREE_LOCAL_QWEN_ADAPTERS_AND_OBSERVED_CACHED_BASE_ONLY', baseModel: BASE_ID,
    base, policy: policy.info, observedTrainingScript: recipe, models,
    allDeclaredArtifactHashesMatched: true, datasetHashesMatched: true,
    sourceContentChanged: false, weightsExecuted: false, trainingExecuted: false,
    externalRequests: 0, evaluationRerun: false, releaseAuthorized: false,
    independentBackupVerified: false, resumableTrainingBackup: false,
    limitations: ['BASE_REVISION_AT_TRAINING_NOT_VERIFIED', 'QUALITY_REPORTS_NOT_RERUN', 'NO_OPTIMIZER_OR_PICKLE_CHECKPOINT_BACKUP', 'OTHER_MODELS_OUTSIDE_SCOPE', 'RIGHTS_NOT_INDEPENDENTLY_VERIFIED'],
  };
}

function privateDir(dir) {
  fs.mkdirSync(dir, {mode: 0o700});
  return dir;
}
function privateParent(dir) {
  if (fs.realpathSync(dir) !== dir) fail('PRIVATE_PARENT_SYMLINK_REJECTED');
  const stat = fs.statSync(dir);
  if (!stat.isDirectory() || stat.uid !== process.getuid() || stat.mode & 0o077) fail('PRIVATE_PARENT_PERMISSIONS_REQUIRED');
}
function writeJson(file, value) {
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const fd = fs.openSync(file, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  return digest(bytes);
}
async function copyChecked(root, entry, destination) {
  fs.mkdirSync(path.dirname(destination), {recursive: true, mode: 0o700});
  const source = sourcePath(root, entry.source, entry.source.startsWith(`${CACHE}/snapshots/`));
  if (path.relative(root, source) !== entry.resolvedSource) fail('SOURCE_TARGET_CHANGED');
  const copied = await measure(source, destination);
  if (copied.bytes !== entry.bytes || copied.sha256 !== entry.sha256) fail('SOURCE_CHANGED_SINCE_AUDIT');
}

async function preserve() {
  const evidence = await audit();
  const parent = path.join(ROOT, 'reports/private');
  privateParent(parent);
  const run = fs.mkdtempSync(path.join(parent, 'qwen-weight-custody-'));
  fs.chmodSync(run, 0o700);
  const keyDir = privateDir(`${run}-keys`);
  const keyFile = path.join(keyDir, 'custody.key');
  custody.initKey(keyFile);
  writeJson(path.join(run, 'audit-before.json'), evidence);
  const results = [];
  for (const model of evidence.models) {
    const dir = privateDir(path.join(run, model.id));
    const sourceDir = privateDir(path.join(dir, 'source'));
    const storeDir = privateDir(path.join(dir, 'vault'));
    const entries = [
      ...evidence.base, ...model.files,
      {...model.report, path: 'training/result.json'},
      {...model.evaluation, path: 'evaluation/result.json'},
      {...evidence.policy, path: 'policy/result.json'},
      ...(model.quarantine ? [{...model.quarantine, path: 'quarantine/result.json'}] : []),
    ];
    for (const entry of entries) await copyChecked(ROOT, entry, path.join(sourceDir, entry.path));
    const recipeSha256 = writeJson(path.join(sourceDir, 'recipe.json'), {
      purpose: 'PRESERVATION_NOT_TRAINING_RECIPE_ATTESTATION',
      observedTrainingScript: evidence.observedTrainingScript,
      trainingReport: model.report, evaluation: model.evaluation,
      cachedBaseRevisionObserved: REVISION, declaredBaseRevision: model.declaredBaseRevision,
      baseRevisionAtTrainingVerified: false, environmentReconstructed: false,
      checkpointStateIncluded: false, approvedForPromotion: false,
    });
    const datasetManifestSha256 = writeJson(path.join(sourceDir, 'training-index.json'), {
      purpose: 'HASH_REFERENCE_ONLY_NO_RAW_TRAINING_DATA', dataset: model.dataset,
      currentBytesMatchTrainingReport: true, rightsVerified: false, trainingReuseAuthorized: false,
    });
    const index = {
      runId: path.basename(run), tenantRef: 'SHEIKHA_LOCAL_OWNER', modelRef: `qwen2.5-0.5b-lora-${model.id}`,
      objective: 'LOCAL_PRESERVATION_ONLY', contractRef: 'USER_REQUEST_2026_10_19_LOCAL_CUSTODY',
      licenseRef: 'DECLARED_APACHE_2_0_PENDING_RIGHTS_REVIEW', artifactSha256: model.adapterSha256,
      baseSha256: evidence.base.find(f => f.path === 'base/model.safetensors').sha256,
      tokenizerSha256: model.files.find(f => f.path === 'adapter/tokenizer.json').sha256,
      recipeSha256, datasetManifestSha256, evaluationSha256: model.evaluation.sha256,
    };
    const input = {sourceDir, storeDir, files: [...entries.map(e => e.path), 'recipe.json', 'training-index.json'], index};
    writeJson(path.join(dir, 'seal-input.json'), input);
    const sealed = await custody.seal(input, keyFile);
    const restored = await custody.inspect(sealed.bundleDir, keyFile, path.join(dir, 'restore-test'));
    for (const entry of entries) {
      const actual = await measure(path.join(restored.restoredTo, entry.path));
      if (actual.sha256 !== entry.sha256 || actual.bytes !== entry.bytes) fail('RESTORE_COMPARISON_FAILED');
    }
    // Delete only temporary plaintext directories created by this run, after verified recovery.
    fs.rmSync(sourceDir, {recursive: true});
    fs.rmSync(restored.restoredTo, {recursive: true});
    const receipt = {modelId: model.id, sealed, restored, temporaryPlaintextRemoved: true, releaseAuthorized: false};
    writeJson(path.join(dir, 'receipt.json'), receipt);
    results.push(receipt);
  }
  const after = await audit();
  const beforeStable = {...evidence, checkedAt: null};
  if (JSON.stringify(beforeStable) !== JSON.stringify({...after, checkedAt: null})) fail('SOURCES_CHANGED_DURING_PRESERVATION');
  writeJson(path.join(run, 'audit-after.json'), after);
  const receipt = {
    system: 'SHEIKHA_QWEN_LOCAL_CUSTODY_RECEIPT_V1', completedAt: new Date().toISOString(),
    runDirectory: run, keyFile, keyPrinted: false, keyBackedUpIndependently: false,
    modelCount: results.length, encryptedBytes: results.reduce((n, r) => n + r.sealed.bytes, 0),
    allRestoresVerified: true, sourcesUnchanged: true,
    independentBackupVerified: false, sameDiskOnly: true, runtimeCompatibilityVerified: false,
    weightsExecuted: false, trainingExecuted: false, externalRequests: 0, releaseAuthorized: false,
    results,
  };
  writeJson(path.join(run, 'receipt.json'), receipt);
  return {receipt: path.join(run, 'receipt.json'), modelCount: receipt.modelCount, allRestoresVerified: true, sourcesUnchanged: true, sameDiskOnly: true, releaseAuthorized: false};
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const work = args.length === 1 && command === 'audit' ? () => audit()
    : args.length === 1 && command === 'preserve' ? preserve
    : () => { throw new Error('USAGE_AUDIT_OR_PRESERVE_NO_NETWORK_NO_TRAINING'); };
  Promise.resolve().then(work).then(r => process.stdout.write(JSON.stringify(r, null, 2) + '\n')).catch(e => {
    process.stderr.write(JSON.stringify({success: false, error: /^[A-Z0-9_]+$/.test(e.message) ? e.message : 'LOCAL_PRESERVATION_FILE_OR_INPUT_ERROR'}) + '\n');
    process.exitCode = 1;
  });
}

module.exports = {audit, measure, sourcePath, copyChecked, MODELS, BASE_FILES, ADAPTER_FILES, TRAINING, CACHE, REVISION, RECIPE, POLICY};
