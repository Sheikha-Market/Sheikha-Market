'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const http = require('node:http');
const https = require('node:https');
const supervisor = require('../tools/health/sheikha-sovereign-supervisor-v1.cjs');
const NOW = '2026-10-22T10:00:00.000Z';
const HEAD = 'a'.repeat(40);
const missingGit = () => ({ status: 128, stdout: '', stderr: 'PRIVATE_SYNTHETIC_STDERR' });
function snapshot(changes = {}) {
  return { schema: supervisor.EXTERNAL_SCHEMA, observedAt: '2026-10-22T09:00:00.000Z', importedAt: '2026-10-22T09:01:00.000Z',
    assets: [{ assetId: 'hostinger:vps:949321', source: 'HOSTINGER_SNAPSHOT', state: 'سليم', verified: true,
      summaryCode: 'OBSERVED_RUNNING', impactCode: 'SERVICE_AVAILABILITY', actionCode: 'OBSERVE_ONLY',
      commit: null, hash: 'b'.repeat(64), classification: 'CONFIDENTIAL' }], ...changes };
}
function fixture(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-supervisor-test-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const deps = { home, now: NOW, git: missingGit };
  return { home, deps, directory: path.join(home, 'sheikha-supervisor', 'reports') };
}

test('default preview makes no writes and probes exactly four specified repos using bounded no-shell git', t => {
  const f = fixture(t), calls = [];
  const git = (executable, args, options) => {
    calls.push({ executable, args, options });
    return { status: calls.length === 1 ? 0 : 128, stdout: calls.length === 1 ? HEAD + '\n' : '', stderr: 'PRIVATE_SYNTHETIC_STDERR' };
  };
  const result = supervisor.run([], { ...f.deps, git });
  assert.equal(result.status, 'READ_ONLY_PREVIEW');
  assert.equal(result.writeExecuted, false);
  assert.equal(fs.existsSync(f.directory), false);
  assert.equal(calls.length, 4);
  assert.deepEqual(calls.map(call => call.args[2]), supervisor.REPOS.map(name => '/home/sheikha/Projects/sheikha/' + name));
  for (const call of calls) {
    assert.equal(call.executable, '/usr/bin/git'); assert.equal(call.options.shell, false);
    assert.equal(call.options.timeout, 1500); assert.equal(call.options.maxBuffer, 4096);
    assert.equal(call.options.env.GIT_TERMINAL_PROMPT, '0');
    assert.equal(Object.hasOwn(call.options.env, 'HOSTINGER_API_TOKEN'), false);
  }
  assert.equal(result.report.assets[0].commit, HEAD);
  assert.equal(result.report.assets[0].verified, true);
  assert.equal(result.report.assets[1].verified, false);
  assert.equal(result.report.productionReady, false);
  assert.equal(JSON.stringify(result).includes('PRIVATE_SYNTHETIC'), false);
});
test('sanitized snapshot preserves original observation and import dates without promoting archived verification', () => {
  const report = supervisor.buildReport({ now: NOW, snapshot: snapshot(), git: missingGit });
  assert.equal(report.snapshot.observedAt, '2026-10-22T09:00:00.000Z');
  assert.equal(report.snapshot.importedAt, '2026-10-22T09:01:00.000Z');
  assert.equal(report.snapshot.currentReadAt, NOW);
  assert.equal(report.snapshot.rechecked, false);
  const asset = report.assets.find(value => value.assetId === 'hostinger:vps:949321');
  assert.equal(asset.reportedVerified, true); assert.equal(asset.verified, false);
  assert.equal(asset.reportedState, 'سليم'); assert.equal(asset.state, 'تحذير');
  assert.equal(asset.evidenceScope, 'IMPORTED_NOT_RECHECKED');
  assert.equal(report.assets.find(value => value.assetId === 'connector:meta').evidenceScope, 'UNKNOWN_NOT_CHECKED');
  assert.equal(report.productionReady, false);
  assert.match(report.generatedAtRiyadh, /13:00:00 \+03:00$/);
});
test('evidence becomes stale only after 24 hours and changing report time never refreshes it', () => {
  const input = snapshot({ observedAt: '2026-10-21T10:00:00.000Z', importedAt: '2026-10-21T10:01:00.000Z' });
  const fresh = supervisor.buildReport({ now: NOW, snapshot: input, git: missingGit });
  const stale = supervisor.buildReport({ now: '2026-10-22T10:00:00.001Z', snapshot: input, git: missingGit });
  assert.equal(fresh.snapshot.stale, false); assert.equal(stale.snapshot.stale, true);
  assert.equal(stale.snapshot.observedAt, input.observedAt);
  assert.equal(stale.snapshot.importedAt, input.importedAt);
  assert.notEqual(fresh.changeFingerprint, stale.changeFingerprint);
  assert.match(supervisor.markdown(stale), /تجاوز 24 ساعة/);
});
test('strict snapshot whitelist rejects arbitrary text, URLs, unknown assets, duplicates and inconsistent severity', () => {
  const invalid = [];
  const mutate = change => { const value = snapshot(); change(value); invalid.push(value); };
  mutate(value => { value.secret = 'PRIVATE_SYNTHETIC_VALUE'; });
  mutate(value => { value.assets[0].summary = 'https://example.invalid/?token=PRIVATE_SYNTHETIC_VALUE'; });
  mutate(value => { value.assets[0].assetId = 'unknown:asset'; });
  mutate(value => { value.assets.push({ ...value.assets[0] }); });
  mutate(value => { value.assets[0].summaryCode = 'PRIVATE_SYNTHETIC_VALUE'; });
  mutate(value => { value.assets[0].source = 'https://example.invalid/?token=PRIVATE_SYNTHETIC_VALUE'; });
  mutate(value => { value.assets[0].hash = 'PRIVATE_SYNTHETIC_VALUE'; });
  mutate(value => { value.assets[0].summaryCode = 'CRITICAL_SECURITY_FINDING'; });
  mutate(value => { value.assets[0].summaryCode = 'UNKNOWN_NOT_CHECKED'; });
  mutate(value => { value.observedAt = '2026-10-23T00:00:00.000Z'; });
  mutate(value => { value.importedAt = '2026-10-21T00:00:00.000Z'; });
  for (const value of invalid) {
    assert.throws(() => supervisor.parseExternalSnapshot(value, NOW));
    const report = supervisor.buildReport({ now: NOW, snapshot: value, git: missingGit });
    assert.equal(report.snapshot.status, 'REJECTED_INVALID_SNAPSHOT');
    assert.equal(JSON.stringify(report).includes('PRIVATE_SYNTHETIC_VALUE'), false);
  }
});
test('critical archived evidence stays critical while unknown connectors always prevent production readiness', () => {
  const value = snapshot(); value.assets[0].state = 'حرج'; value.assets[0].summaryCode = 'CRITICAL_RESOURCE_STOPPED';
  const report = supervisor.buildReport({ now: NOW, snapshot: value, git: () => ({ status: 0, stdout: HEAD }) });
  assert.equal(report.assets.find(asset => asset.assetId === value.assets[0].assetId).state, 'حرج');
  assert.equal(report.productionReady, false);
  assert.ok(report.readinessReasons.includes('CONNECTORS_NOT_CURRENTLY_VERIFIED'));
});
test('reordering equivalent snapshot fields does not invent a meaningful change', () => {
  const first = snapshot(), second = snapshot();
  second.assets[0] = Object.fromEntries(Object.entries(second.assets[0]).reverse());
  const reportA = supervisor.buildReport({ now: NOW, snapshot: first, git: missingGit });
  const reportB = supervisor.buildReport({ now: '2026-10-22T11:00:00.000Z', snapshot: second, git: missingGit });
  assert.equal(reportA.changeFingerprint, reportB.changeFingerprint);
});
test('report classification inherits the most restricted imported asset', () => {
  const value = snapshot(); value.assets[0].classification = 'RESTRICTED_TRADE_SECRET';
  const report = supervisor.buildReport({ now: NOW, snapshot: value, git: missingGit });
  assert.equal(report.classification, 'RESTRICTED_TRADE_SECRET');
  assert.match(supervisor.markdown(report), /التصنيف: RESTRICTED_TRADE_SECRET/);
});
test('research output is proposed baseline work with no fabricated observations or achieved improvement', () => {
  const report = supervisor.buildReport({ now: NOW, git: missingGit });
  assert.equal(report.research.coverage.requestedDomains, 14);
  assert.equal(report.research.coverage.measuredDomains, 0);
  assert.deepEqual(report.research.comparisons, []);
  assert.equal(report.research.governance.agiAsiAchieved, false);
  assert.equal(report.boundaries.universalMetaOrGptControlClaimed, false);
});
test('--write creates unique exclusive private report pairs and preserves every existing original', t => {
  const f = fixture(t);
  const first = supervisor.run(['--write'], f.deps);
  const original = fs.readFileSync(first.jsonPath);
  const second = supervisor.run(['--write'], f.deps);
  assert.notEqual(first.jsonPath, second.jsonPath);
  assert.equal(fs.readdirSync(f.directory).length, 4);
  assert.deepEqual(fs.readFileSync(first.jsonPath), original);
  for (const file of [first.jsonPath, first.markdownPath, second.jsonPath, second.markdownPath])
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  assert.equal(fs.statSync(f.directory).mode & 0o777, 0o700);
  assert.equal(fs.statSync(path.dirname(f.directory)).mode & 0o777, 0o700);
  assert.match(fs.readFileSync(first.markdownPath, 'utf8'), /تقرير المشرف المحلي لشيخة/);
});
test('hourly first run writes baseline; unchanged time-only runs skip; Git change appends a new pair', t => {
  const f = fixture(t);
  const first = supervisor.run(['--write', '--hourly'], f.deps);
  const original = fs.readFileSync(first.jsonPath);
  const skipped = supervisor.run(['--write', '--hourly'], { ...f.deps, now: '2026-10-22T11:00:00.000Z' });
  assert.equal(skipped.status, 'NO_MEANINGFUL_CHANGE'); assert.equal(skipped.writeExecuted, false);
  assert.equal(fs.readdirSync(f.directory).length, 2);
  const changed = supervisor.run(['--write', '--hourly'], { ...f.deps, now: '2026-10-22T12:00:00.000Z',
    git: () => ({ status: 0, stdout: HEAD }) });
  assert.equal(changed.writeExecuted, true); assert.equal(fs.readdirSync(f.directory).length, 4);
  assert.deepEqual(fs.readFileSync(first.jsonPath), original);
});
test('snapshot files remain untouched and stale imported evidence triggers one meaningful hourly report', t => {
  const f = fixture(t), source = path.join(f.home, 'external.json');
  const bytes = JSON.stringify(snapshot({ observedAt: '2026-10-21T11:00:00.000Z', importedAt: '2026-10-21T11:01:00.000Z' }));
  fs.writeFileSync(source, bytes);
  supervisor.run(['--write', '--hourly', '--snapshot', source], f.deps);
  const stale = supervisor.run(['--write', '--hourly', '--snapshot', source], { ...f.deps, now: '2026-10-22T12:00:00.000Z' });
  assert.equal(stale.writeExecuted, true); assert.equal(fs.readFileSync(source, 'utf8'), bytes);
  assert.equal(supervisor.run(['--write', '--hourly', '--snapshot', source], { ...f.deps, now: '2026-10-22T13:00:00.000Z' }).writeExecuted, false);
});
test('exclusive-name collision never overwrites reports or removes existing files', t => {
  const f = fixture(t); t.mock.method(crypto, 'randomBytes', () => Buffer.alloc(8, 1));
  const first = supervisor.run(['--write'], f.deps), before = fs.readFileSync(first.jsonPath);
  assert.throws(() => supervisor.run(['--write'], f.deps), /EEXIST/);
  assert.deepEqual(fs.readFileSync(first.jsonPath), before);
  assert.equal(fs.readdirSync(f.directory).length, 2);
});
test('symlinked input or output directories are rejected and target content is preserved', t => {
  const f = fixture(t), source = path.join(f.home, 'source.json'), alias = path.join(f.home, 'alias.json');
  fs.writeFileSync(source, JSON.stringify(snapshot())); fs.symlinkSync(source, alias);
  const preview = supervisor.run(['--snapshot', alias], f.deps);
  assert.equal(preview.report.snapshot.status, 'REJECTED_UNREADABLE_SNAPSHOT');
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'supervisor-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(f.home, 'sheikha-supervisor'));
  assert.throws(() => supervisor.run(['--write'], f.deps), /SYMLINK_DENIED/);
  assert.deepEqual(fs.readdirSync(outside), []);
});
test('existing permissive output directory is refused without chmod or replacement', t => {
  const f = fixture(t), root = path.dirname(f.directory); fs.mkdirSync(root, { mode: 0o755 });
  assert.throws(() => supervisor.run(['--write'], f.deps), /PRIVATE_REPORT_DIRECTORY_REQUIRED/);
  assert.equal(fs.statSync(root).mode & 0o777, 0o755);
  assert.deepEqual(fs.readdirSync(root), []);
});
test('invalid previous report is preserved and cannot suppress a new hourly report', t => {
  const f = fixture(t), first = supervisor.run(['--write'], f.deps);
  fs.writeFileSync(first.jsonPath, '{"private":"PRIVATE_SYNTHETIC_VALUE"}');
  const next = supervisor.run(['--write', '--hourly'], { ...f.deps, now: '2026-10-22T11:00:00.000Z' });
  assert.equal(next.writeExecuted, true);
  assert.match(fs.readFileSync(first.jsonPath, 'utf8'), /PRIVATE_SYNTHETIC_VALUE/);
  assert.equal(JSON.stringify(next).includes('PRIVATE_SYNTHETIC_VALUE'), false);
});
test('incomplete previous report pair cannot suppress recovery and its JSON remains unchanged', t => {
  const f = fixture(t), first = supervisor.run(['--write'], f.deps);
  const original = fs.readFileSync(first.jsonPath);
  fs.unlinkSync(first.markdownPath); // Simulated interrupted/external loss in this temporary fixture only.
  const next = supervisor.run(['--write', '--hourly'], { ...f.deps, now: '2026-10-22T11:00:00.000Z' });
  assert.equal(next.writeExecuted, true);
  assert.deepEqual(fs.readFileSync(first.jsonPath), original);
  assert.ok(fs.existsSync(next.markdownPath));
});
test('arbitrary output paths, duplicate flags and oversized snapshot input fail closed', t => {
  const f = fixture(t), source = path.join(f.home, 'large.json'); fs.writeFileSync(source, 'x'.repeat(256 * 1024 + 1));
  for (const args of [['--output', '/tmp/elsewhere'], ['--write', '--write'], ['--snapshot'], ['--run-model']])
    assert.throws(() => supervisor.run(args, f.deps), /SUPERVISOR_ARGUMENT_DENIED/);
  assert.equal(supervisor.run(['--snapshot', source], f.deps).report.snapshot.status, 'REJECTED_UNREADABLE_SNAPSHOT');
  assert.equal(fs.existsSync(f.directory), false);
});
test('default preview performs no network calls or filesystem mutation', t => {
  const f = fixture(t), deny = () => { throw Error('UNEXPECTED_SIDE_EFFECT'); };
  for (const name of ['writeFileSync', 'appendFileSync', 'mkdirSync', 'renameSync', 'unlinkSync', 'chmodSync']) t.mock.method(fs, name, deny);
  for (const target of [http, https]) for (const name of ['request', 'get']) t.mock.method(target, name, deny);
  assert.equal(supervisor.run([], f.deps).writeExecuted, false);
});
test('systemd templates schedule local reports only with network and write boundaries', () => {
  const root = path.resolve(__dirname, '../config/systemd');
  for (const name of ['sheikha-sovereign-supervisor', 'sheikha-sovereign-supervisor-hourly']) {
    const service = fs.readFileSync(path.join(root, name + '.service'), 'utf8');
    const timer = fs.readFileSync(path.join(root, name + '.timer'), 'utf8');
    assert.match(service, /NoNewPrivileges=true/); assert.match(service, /PrivateNetwork=true/);
    assert.match(service, /RestrictAddressFamilies=AF_UNIX/); assert.match(service, /IPAddressDeny=any/);
    assert.match(service, /ProtectSystem=strict/); assert.match(service, /ProtectHome=read-only/);
    assert.match(service, /ReadWritePaths=\/home\/sheikha\/sheikha-supervisor/);
    assert.match(service, /--write/); assert.doesNotMatch(service, /API_KEY|API_TOKEN|password|curl|sudo/);
    assert.match(timer, /Asia\/Riyadh/);
  }
  assert.match(fs.readFileSync(path.join(root, 'sheikha-sovereign-supervisor.timer'), 'utf8'), /08:00:00/);
  assert.match(fs.readFileSync(path.join(root, 'sheikha-sovereign-supervisor-hourly.service'), 'utf8'), /--hourly/);
});
