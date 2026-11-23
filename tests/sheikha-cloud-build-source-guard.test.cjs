'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { verifyContext, REQUIRED_BUILD_INPUTS } = require('../tools/verification/sheikha-cloud-build-source-guard.cjs');
const yaml = require('js-yaml');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-source-guard-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const code = Buffer.from("'use strict';\n");
  const source_snapshot = ['nested/main.cjs', ...REQUIRED_BUILD_INPUTS].map(relative => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, code);
    return { path: relative, bytes: code.length, sha256: createHash('sha256').update(code).digest('hex') };
  });
  const manifest = { report: { schema: 'SHEIKHA_CLOUD_BUILD_CONTEXT_REPORT_V1', status: 'PASS',
    file_count: source_snapshot.length, total_bytes: code.length * source_snapshot.length }, source_snapshot };
  const save = () => fs.writeFileSync(path.join(root, 'SHEIKHA-CLOUD-CONTEXT-MANIFEST.json'), JSON.stringify(manifest));
  save(); return { root, manifest, save };
}

test('verifies a bounded staged context in either allowed build region without uploading', t => {
  const { root } = fixture(t);
  for (const region of ['me-central2', 'us-central1']) {
    const result = verifyContext(root, region);
    assert.equal(result.status, 'PASS'); assert.equal(result.region, region);
    assert.equal(result.fileCount, REQUIRED_BUILD_INPUTS.length + 1);
    assert.equal(result.requiredInputCount, REQUIRED_BUILD_INPUTS.length);
    assert.equal(result.uploaded, false); assert.equal(result.deploymentAuthorized, false);
  }
});
test('wrong build region is rejected before accessing the filesystem', () => {
  for (const region of ['us-east1', 'global', '', undefined]) {
    assert.throws(() => verifyContext('/does/not/exist', region), /BUILD_REGION_NOT_ALLOWED/);
  }
});
test('requires a passing manifest and exact totals', t => {
  const { root, manifest, save } = fixture(t);
  manifest.report.status = 'BLOCKED'; save(); assert.throws(() => verifyContext(root, 'me-central2'), /PASSING_CONTEXT/);
  manifest.report.status = 'PASS'; manifest.report.total_bytes++; save();
  assert.throws(() => verifyContext(root, 'me-central2'), /TOTALS_MISMATCH/);
});
test('detects content changes after staging', t => {
  const { root } = fixture(t);
  fs.writeFileSync(path.join(root, 'nested/main.cjs'), "'use other!';\n");
  for (const region of ['me-central2', 'us-central1']) {
    assert.throws(() => verifyContext(root, region), /SOURCE_HASH_MISMATCH/);
  }
});
test('missing and additional inputs fail closed', t => {
  const { root } = fixture(t);
  fs.writeFileSync(path.join(root, 'unexpected.txt'), 'extra');
  assert.throws(() => verifyContext(root, 'me-central2'), /UNEXPECTED_CONTEXT_FILE/);
  fs.unlinkSync(path.join(root, 'unexpected.txt')); fs.unlinkSync(path.join(root, 'nested/main.cjs'));
  assert.throws(() => verifyContext(root, 'me-central2'), /MISSING_CONTEXT_FILE/);
});
test('rejects the reported missing kernel even when removed from a consistent manifest', t => {
  const { root, manifest, save } = fixture(t);
  const kernel = 'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js';
  const row = manifest.source_snapshot.find(entry => entry.path === kernel);
  fs.unlinkSync(path.join(root, kernel));
  manifest.source_snapshot = manifest.source_snapshot.filter(entry => entry.path !== kernel);
  manifest.report.file_count--;
  manifest.report.total_bytes -= row.bytes;
  save();
  assert.throws(() => verifyContext(root, 'me-central2'), /MISSING_REQUIRED_BUILD_INPUT/);
});
test('all required inputs must be declared, and declared kernel bytes must exist', t => {
  const { root, manifest, save } = fixture(t);
  for (const required of REQUIRED_BUILD_INPUTS) {
    const index = manifest.source_snapshot.findIndex(entry => entry.path === required);
    const [row] = manifest.source_snapshot.splice(index, 1);
    manifest.report.file_count--;
    manifest.report.total_bytes -= row.bytes;
    save();
    assert.throws(() => verifyContext(root, 'me-central2'), /MISSING_REQUIRED_BUILD_INPUT/, required);
    manifest.source_snapshot.splice(index, 0, row);
    manifest.report.file_count++;
    manifest.report.total_bytes += row.bytes;
  }
  save();
  fs.unlinkSync(path.join(root, 'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js'));
  assert.throws(() => verifyContext(root, 'me-central2'), /MISSING_CONTEXT_FILE/);
});
test('required inputs cover the Dockerfile syntax checks and context policy root files', () => {
  const dockerfile = fs.readFileSync(path.join(__dirname, '../Dockerfile'), 'utf8');
  const syntaxTargets = [...dockerfile.matchAll(/\bnode --check ([\w./-]+)/g)].map(match => match[1]);
  assert.ok(syntaxTargets.length >= 4);
  const policy = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/cloud/sheikha-cloud-build-context-v1.json'), 'utf8'));
  for (const required of [...syntaxTargets, ...policy.root_files]) {
    assert.ok(REQUIRED_BUILD_INPUTS.includes(required), required);
  }
});
test('refuses symlinks and duplicate inventory paths', t => {
  const { root, manifest, save } = fixture(t);
  fs.symlinkSync('nested', path.join(root, 'alias'));
  assert.throws(() => verifyContext(root, 'me-central2'), /SYMLINK_REFUSED/);
  fs.unlinkSync(path.join(root, 'alias'));
  manifest.source_snapshot.push(manifest.source_snapshot[0]); save();
  assert.throws(() => verifyContext(root, 'me-central2'), /INVALID_INVENTORY_PATH/);
});
test('refuses traversal, absolute paths and manifests naming themselves', t => {
  const { root, manifest, save } = fixture(t);
  for (const value of ['../outside', '/outside', 'nested/../main.cjs', 'SHEIKHA-CLOUD-CONTEXT-MANIFEST.json']) {
    manifest.source_snapshot[0].path = value; save();
    assert.throws(() => verifyContext(root, 'me-central2'), /INVALID_INVENTORY_PATH/);
  }
});
test('Cloud Build guards source first, builds both us-central1 tags and pushes only via images', () => {
  const build = yaml.load(fs.readFileSync(path.join(__dirname, '../cloudbuild.yaml'), 'utf8'));
  assert.equal(build.steps.length, 2);
  assert.equal(build.steps[0].name, 'node:20-alpine');
  assert.equal(build.steps[0].entrypoint, 'node');
  assert.deepEqual(build.steps[0].args, ['tools/verification/sheikha-cloud-build-source-guard.cjs', '$LOCATION']);
  const target = 'us-central1-docker.pkg.dev/$PROJECT_ID/sheikha-apps/sheikha-main-portal:${_COMMIT_SHA}';
  const latest = 'us-central1-docker.pkg.dev/$PROJECT_ID/sheikha-apps/sheikha-main-portal:latest';
  assert.deepEqual(build.images, [target, latest]);
  assert.deepEqual(build.steps[1].args, ['build', '-t', target, '-t', latest, '.']);
  assert.equal(build.substitutions._COMMIT_SHA, 'manual');
  assert.equal(build.timeout, '1200s');
  assert.equal(build.options.logging, 'CLOUD_LOGGING_ONLY');
});
