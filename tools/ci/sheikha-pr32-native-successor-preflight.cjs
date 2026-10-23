'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const REPOSITORY = 'Sheikha-Market/sheikha-main-portal';
const SUBJECT = '1ee23139a868effc75ebfb8f4714985619230aaf';
const BRANCH = 'feature/sheikha-universal-infrastructure-machine-value-fabric-v1';
const INPUTS = Object.freeze({
  'package.json': '96a5984de71ecbb97ade486bbe166d21f2a386d0bcc41b9488667eb15e714ff0',
  'package-lock.json': '3e75c894dc711b456a74ef1f6e0fe41f5a5f460b2e5fb26975ebef8e10793f77'
});
const REQUIRED_SOURCES = Object.freeze([
  ...Object.keys(INPUTS), '.github/workflows/ci.yml',
  '.github/workflows/sheikha-pr32-hydration-artifact-producer.yml',
  'desktop/shell/native-linux/sheikha_native_desktop.c',
  'desktop/shell/tauri-v4/src-tauri/Cargo.lock',
  'distribution/pipeline/sheikha-native-desktop-completion-v31.js',
  'distribution/pipeline/sheikha-native-desktop-v4.js',
  'distribution/pipeline/sheikha-linux-package-native-verification-v5.js',
  'tests/sheikha-native-desktop-completion-v31.test.js'
]);
const hash = (data, algorithm = 'sha256') => crypto.createHash(algorithm).update(data).digest('hex');

function assertSubject(pr) {
  if (pr?.number !== 32 || pr.state !== 'open' || pr.merged !== false || pr.base?.repo?.full_name !== REPOSITORY ||
      pr.head?.repo?.full_name !== REPOSITORY || pr.head?.ref !== BRANCH || pr.head?.sha !== SUBJECT) throw Error('PR32_SUBJECT_CHANGED_OR_INVALID');
}
function decodeBoundFile(response, entry) {
  if (response?.type !== 'file' || response.encoding !== 'base64' || typeof response.content !== 'string' ||
      response.path !== entry?.path || response.sha !== entry?.sha || entry.mode !== '100644') throw Error('REMOTE_FILE_BINDING_INVALID');
  const bytes = Buffer.from(response.content, 'base64');
  if (bytes.length !== response.size || bytes.length > 4 * 1024 * 1024 ||
      hash(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes]), 'sha1') !== entry.sha) throw Error('REMOTE_BLOB_INTEGRITY_FAILED');
  return { path: response.path, gitBlobSha: entry.sha, sha256: hash(bytes), size: bytes.length };
}
function assess(snapshot) {
  assertSubject(snapshot?.pr);
  if (snapshot.commit?.sha !== SUBJECT || snapshot.commit.tree?.sha !== snapshot.tree?.sha || snapshot.tree.truncated !== false ||
      !/^[a-f0-9]{40}$/.test(snapshot.tree.sha) || !Array.isArray(snapshot.tree.tree)) throw Error('COMPLETE_SUBJECT_TREE_REQUIRED');
  const entries = new Map(snapshot.tree.tree.map(entry => [entry.path, entry]));
  if (entries.size !== snapshot.tree.tree.length) throw Error('DUPLICATE_TREE_PATH');
  const bindings = REQUIRED_SOURCES.map(name => {
    const entry = entries.get(name);
    if (!entry || entry.type !== 'blob' || entry.mode !== '100644' || !/^[a-f0-9]{40}$/.test(entry.sha)) throw Error('NATIVE_SOURCE_MISSING_OR_UNSAFE');
    return { path: name, gitBlobSha: entry.sha };
  });
  const inputs = Object.entries(INPUTS).map(([name, expected]) => {
    const result = decodeBoundFile(snapshot.files?.[name], entries.get(name));
    if (result.sha256 !== expected) throw Error('KH60_DEPENDENCY_BINDING_CHANGED');
    return result;
  });
  const run = snapshot.run;
  if (!Number.isSafeInteger(run?.id) || run.id <= 0 || run.head_sha !== SUBJECT || run.head_branch !== BRANCH ||
      run.repository?.full_name !== REPOSITORY || run.status !== 'completed' || run.conclusion !== 'failure') throw Error('CURRENT_CI_FAILURE_BINDING_REQUIRED');
  const jobs = snapshot.jobs;
  if (!Array.isArray(jobs?.jobs) || jobs.total_count !== jobs.jobs.length) throw Error('COMPLETE_CI_JOBS_REQUIRED');
  const gate = jobs.jobs.find(job => job.name === '🧾 Distribution / Native Evidence Reuse Gate');
  if (!gate || gate.run_id !== run.id || gate.status !== 'completed' || gate.conclusion !== 'failure') throw Error('NATIVE_GATE_FAILURE_NOT_OBSERVED');
  return { schema: 'SHEIKHA_PR32_NATIVE_SUCCESSOR_PREFLIGHT_V1', checkedAt: snapshot.checkedAt,
    classification: 'NEW_NATIVE_EVIDENCE_REQUIRED_NOT_EXECUTED', repository: REPOSITORY, pr: 32, subjectSha: SUBJECT,
    subjectTreeSha: snapshot.tree.sha, branch: BRANCH, inputs, sourceBindings: bindings,
    currentCi: { runId: run.id, attempt: run.run_attempt, nativeJobId: gate.id, nativeConclusion: gate.conclusion },
    nativeReady: false, mergeAuthorized: false, remoteMutationExecuted: false, nativeCommandsExecuted: false,
    oldAuthorizationReusable: false, oldArtifactsAcceptedForNewInputs: false,
    requiredSuccessorScope: {
      environment: 'DISPOSABLE_NON_PRODUCTION_LINUX_X86_64_RUNNER',
      legacyRuntimeProfile: 'UBUNTU_22_04_GTK3_WEBKIT2GTK_4_0', nodeVersion: '22.22.2',
      stages: ['Verify head and full source tree', 'Install locked dependencies in disposable workspace only',
        'Build fresh dependency-bearing distribution packages and native targets',
        'Measure binary probe, URL rejection, GUI page load and installer lifecycle in disposable HOME',
        'Record artifact digests, toolchains, commands, exit codes and logs for this subject',
        'Independent evidence review before proposing a Native-gate change'],
      invariants: ['No historical reruns', 'No old artifact relabeling', 'No baseline advancement without evidence',
        'No production/user-HOME installation', 'No Firmware/TPM/Secure Boot', 'No second commit under KH60 authority'],
      mustNotClaim: ['Historical actual-user activation proves current activation', 'Linux proof covers Windows/macOS/ARM',
        'A successful preflight is a successful native build'],
      authorization: 'SEPARATE_SCOPED_APPROVAL_REQUIRED', automaticRetries: 0
    } };
}

function api(route) {
  return JSON.parse(execFileSync('gh', ['api', 'repos/' + REPOSITORY + '/' + route],
    { encoding: 'utf8', timeout: 45000, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
}
function capture() {
  const pr = api('pulls/32'); assertSubject(pr);
  const commit = api('git/commits/' + SUBJECT);
  if (commit.sha !== SUBJECT || !/^[a-f0-9]{40}$/.test(commit.tree?.sha || '')) throw Error('SUBJECT_COMMIT_BINDING_INVALID');
  const tree = api('git/trees/' + commit.tree.sha + '?recursive=1');
  const files = Object.fromEntries(Object.keys(INPUTS).map(name => [name, api('contents/' + name + '?ref=' + SUBJECT)]));
  const run = api('actions/runs/36467067523');
  const jobs = api('actions/runs/' + run.id + '/jobs?filter=latest&per_page=100');
  assertSubject(api('pulls/32'));
  const report = assess({ pr, commit, tree, files, run, jobs, checkedAt: new Date().toISOString() });
  return report;
}

if (require.main === module) {
  try {
    if (process.argv.length !== 3 || process.argv[2] !== '--capture') throw Error('ONLY_READ_ONLY_CAPTURE_SUPPORTED');
    const report = capture();
    const base = path.join(__dirname, '../../reports/private');
    fs.mkdirSync(base, { recursive: true, mode: 0o700 });
    const directory = fs.mkdtempSync(path.join(base, 'pr32-native-successor-'));
    const file = path.join(directory, 'preflight.json'); const text = JSON.stringify(report, null, 2);
    fs.writeFileSync(file, text, { flag: 'wx', mode: 0o600 });
    console.log(JSON.stringify({ file, sha256: hash(text), classification: report.classification, nativeReady: false }));
  } catch (error) { console.error(error.code === 'ETIMEDOUT' ? 'READ_ONLY_GITHUB_TIMEOUT' : String(error.message).split('\n')[0]); process.exitCode = 1; }
}

module.exports = { SUBJECT, REPOSITORY, BRANCH, INPUTS, REQUIRED_SOURCES, assertSubject, decodeBoundFile, assess };
