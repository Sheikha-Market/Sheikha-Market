'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const supervisor = require('../tools/health/sheikha-sovereign-supervisor-v1.cjs');
const operations = require('../tools/health/sheikha-operations-manager-v1.cjs');
const now = '2026-10-22T09:00:00.000Z';
const git = () => ({ status: 0, stdout: 'a'.repeat(40) + '\n' });
const source = () => supervisor.buildReport({ now, git });
function resign(report) {
  delete report.reportDigest;
  report.reportDigest = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  return report;
}
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-operations-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
test('pipeline records executed local roles, unknown counts and production HOLD', () => {
  const report = operations.buildOperations(source());
  assert.equal(report.schema, operations.SCHEMA);
  assert.equal(report.productionReady, false);
  assert.equal(report.production, 'HOLD');
  assert.equal(report.counts.unknown, 20);
  assert.equal(report.counts.healthy, 4);
  assert.equal(report.raha.assetCount, 24);
  assert.equal(report.raha.duplicateCount, 0);
  assert.equal(Object.keys(report.roles).length, 8);
  assert.deepEqual(report.roles.coordinator.steps, ['worker', 'raha', 'executive', 'manager', 'supervisor', 'monitor', 'engineer', 'coordinator', 'producer']);
  assert.equal(report.roles.engineer.repairExecuted, false);
  assert.equal(report.roles.monitor.comparisonPerformed, false);
  assert.ok(report.proposals.every(item => item.execution === 'PROPOSED_ONLY'));
  assert.equal(report.workforce.status, 'SCALE_PLAN_ONLY');
  assert.equal(report.workforce.workersStarted, 0);
  assert.equal(report.roles.executive.independentAgentsStarted, 0);
  assert.ok(report.organization.digitalRoles.every(role => role.assignedHuman === null && role.executionAllowed === false));
  assert.ok(report.organization.departments.some(department => department.status === 'PLANNED'));
  assert.equal(report.priorities.find(item => item.assetId === 'hostinger:firewall:949321').assignedDigitalRoleId, 'security-manager');
  assert.equal(report.priorities.find(item => item.assetId === 'repo:sheikha-main-portal').assignedDigitalRoleId, 'project-manager');
  const { reportDigest, ...body } = report;
  assert.equal(reportDigest, crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex'));
});
test('manager puts critical imported evidence before currently unverified evidence', () => {
  const snapshot = { schema: supervisor.EXTERNAL_SCHEMA, observedAt: now, assets: [{
    assetId: 'hostinger:ai:949321', source: 'OWNER_SANITIZED_RECORD', state: 'حرج', verified: true,
    summaryCode: 'CRITICAL_RESOURCE_STOPPED', impactCode: 'SERVICE_AVAILABILITY', actionCode: 'REVIEW_CONFIGURATION',
    commit: null, hash: 'b'.repeat(64), classification: 'CONFIDENTIAL'
  }] };
  const report = operations.buildOperations(supervisor.buildReport({ now, git, snapshot }));
  assert.equal(report.counts.critical, 1);
  assert.equal(report.priorities[0].assetId, 'hostinger:ai:949321');
  assert.equal(report.priorities[0].verified, false);
  assert.equal(report.proposals[0].separateAuthorizationRequired, true);
});
test('shared organization review requires measurements and creates no staff or description changes', () => {
  const report = operations.buildOperations(source());
  assert.equal(report.organization.departments.length, 13);
  assert.equal(report.organization.digitalRoles.length, 36);
  const review = report.organization.jobDescriptionReview;
  assert.equal(review.status, 'EVIDENCE_REQUIRED');
  assert.equal(review.reviews.length, report.organization.digitalRoles.length);
  assert.ok(review.reviews.every(item => item.status === 'EVIDENCE_REQUIRED' && item.metrics.length === 0 &&
    item.descriptionChanged === false && item.authoritiesChanged === false && item.improvementVerified === false));
});
test('worker calls only fixed read-only git supervisor probes and never writes on preview', t => {
  const home = temporary(t), calls = [];
  const result = operations.run([], { now, home, git(command, args, options) {
    calls.push({ command, args, options }); return git();
  } });
  assert.equal(result.writeExecuted, false);
  assert.equal(calls.length, 4);
  assert.ok(calls.every(call => call.command === '/usr/bin/git' && call.options.shell === false &&
    call.args.includes('HEAD^{commit}') && call.options.timeout === 1500));
  assert.deepEqual(fs.readdirSync(home), []);
});
test('CLI rejects unknown, duplicate and free-path arguments before executing worker', () => {
  for (const args of [['--restart'], ['--write', '--write'], ['--snapshot', '/tmp/private'], ['--hourly'], ['--home', '/tmp/other']]) {
    assert.throws(() => operations.run(args, { now, git() { assert.fail('worker must not start'); } }), /OPERATIONS_ARGUMENT_DENIED/);
  }
});
test('Raha rejects modified metadata, digest and fingerprint', () => {
  const badDigest = source(); badDigest.assets[0].commit = 'b'.repeat(40);
  assert.throws(() => operations.buildOperations(badDigest), /RAHA_DIGEST_DENIED/);
  const badFingerprint = source(); badFingerprint.changeFingerprint = 'b'.repeat(64); resign(badFingerprint);
  assert.throws(() => operations.buildOperations(badFingerprint), /RAHA_FINGERPRINT_MISMATCH/);
  const badHash = source(); badHash.assets[0].hash = 'not-a-hash'; resign(badHash);
  assert.throws(() => operations.buildOperations(badHash), /RAHA_HASH_DENIED/);
});
test('Raha rejects duplicate IDs even when report digest has been recomputed', () => {
  const report = source(); report.assets[1] = { ...report.assets[0] }; resign(report);
  assert.throws(() => operations.buildOperations(report), /RAHA_DUPLICATE_OR_UNKNOWN_ASSET/);
});
test('extra secret-shaped metadata is rejected and never included in an output', () => {
  const report = source(); report.assets[0].apiKey = 'synthetic-secret'; resign(report);
  assert.throws(() => operations.buildOperations(report), /RAHA_ASSET_SHAPE_DENIED/);
  const rootExtra = source(); rootExtra.password = 'synthetic-secret'; resign(rootExtra);
  assert.throws(() => operations.buildOperations(rootExtra), /RAHA_REPORT_SHAPE_DENIED/);
  assert.equal(JSON.stringify(operations.buildOperations(source())).includes('synthetic-secret'), false);
});
test('unsafe source boundary or ready-for-production claims are rejected', () => {
  const boundary = source(); boundary.boundaries.externalNetworkUsed = true; resign(boundary);
  assert.throws(() => operations.buildOperations(boundary), /RAHA_BOUNDARY_DENIED/);
  const production = source(); production.productionReady = true; resign(production);
  assert.throws(() => operations.buildOperations(production), /RAHA_SOURCE_DENIED/);
});
test('producer creates private exclusive report pairs and retains older versions', t => {
  const home = temporary(t);
  const first = operations.run(['--write'], { now, home, git });
  const original = fs.readFileSync(first.jsonPath);
  const second = operations.run(['--write'], { now, home, git });
  assert.notEqual(first.jsonPath, second.jsonPath);
  assert.deepEqual(fs.readFileSync(first.jsonPath), original);
  assert.equal(first.writeExecuted, true);
  assert.equal(fs.readdirSync(path.dirname(first.jsonPath)).length, 4);
  for (const file of [first.jsonPath, first.markdownPath, second.jsonPath, second.markdownPath]) {
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  }
  for (const directory of [path.dirname(first.jsonPath), path.dirname(path.dirname(first.jsonPath))]) {
    assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
  }
  const report = JSON.parse(original);
  assert.equal(report.roles.producer.archiveWriteClaimed, false);
  assert.match(fs.readFileSync(first.markdownPath, 'utf8'), /ليست شهادة شرعية أو تشغيل عتاد/);
});
test('producer refuses symbolic-link and public output directories without altering them', t => {
  const home = temporary(t), elsewhere = temporary(t);
  fs.symlinkSync(elsewhere, path.join(home, 'sheikha-supervisor'));
  assert.throws(() => operations.run(['--write'], { now, home, git }), /OPERATIONS_SYMLINK_DENIED/);
  assert.deepEqual(fs.readdirSync(elsewhere), []);
  const publicHome = temporary(t);
  fs.mkdirSync(path.join(publicHome, 'sheikha-supervisor'), { mode: 0o755 });
  assert.throws(() => operations.run(['--write'], { now, home: publicHome, git }), /OPERATIONS_PRIVATE_DIRECTORY_REQUIRED/);
  assert.equal(fs.statSync(path.join(publicHome, 'sheikha-supervisor')).mode & 0o777, 0o755);
});
