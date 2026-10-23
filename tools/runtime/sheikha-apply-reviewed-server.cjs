#!/usr/bin/env node
'use strict';

// Review or replace repo/server.js only. Never executes the application.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

process.umask(0o077);
const MAX_BYTES = 32 * 1024 * 1024;
const repoRoot = path.resolve(__dirname, '../..');
const targetPath = path.join(repoRoot, 'server.js');
const descriptors = new Set();
let receiptDirectory = null;
let receiptFd = null;
let stagePath = null;
let stageInfo = null;
let parentFd = null;
const report = {
  schema: 'SHEIKHA_REVIEWED_SERVER_APPLY_V1', timestamp: new Date().toISOString(),
  validatorNodeVersion: process.version,
  target: targetPath, success: false, applied: false, dryRun: true,
  applicationExecuted: false, networkUsed: false, containerEngineUsed: false,
  externalDeployment: false,
  concurrencyBoundary: 'Hash, inode and no-symlink path rechecked immediately before atomic rename; external writers must still coordinate.'
};

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
function track(fd) { descriptors.add(fd); return fd; }
function close(fd) { if (descriptors.delete(fd)) fs.closeSync(fd); }
function anchor(fd, leaf) { return '/proc/self/fd/' + fd + '/' + leaf; }
function signature(info) {
  return ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs', 'mode', 'uid', 'gid', 'nlink']
    .map(key => String(info[key])).join(':');
}
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }

function openPath(filename, directory = false) {
  // Each component is opened relative to a previously opened directory. On
  // Linux /proc/self/fd anchors prevent a substituted ancestor from redirecting
  // the operation between lstat and open. Final symlinks and FIFOs are refused.
  const absolute = path.resolve(filename);
  const components = absolute.split('/').filter(Boolean);
  if (components.length > 128 || absolute.length > 4096) fail('PATH_TOO_DEEP');
  let fd = track(fs.openSync('/', fs.constants.O_RDONLY | fs.constants.O_DIRECTORY));
  try {
    for (let index = 0; index < components.length; index++) {
      const isDirectory = index < components.length - 1 || directory;
      const flags = fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK |
        (isDirectory ? fs.constants.O_DIRECTORY : 0);
      const next = track(fs.openSync(anchor(fd, components[index]), flags));
      close(fd);
      fd = next;
    }
    const info = fs.fstatSync(fd, { bigint: true });
    if (directory ? !info.isDirectory() : !info.isFile()) fail('NON_REGULAR_PATH');
    return { fd, absolute, info };
  } catch (error) { close(fd); throw error; }
}
function readSnapshot(filename) {
  const opened = openPath(filename);
  try {
    if (opened.info.size > BigInt(MAX_BYTES)) fail('SOURCE_TOO_LARGE');
    if (opened.info.nlink !== 1n) fail('HARDLINK_REFUSED');
    if (typeof process.getuid === 'function' && opened.info.uid !== BigInt(process.getuid())) {
      fail('FILE_OWNER_MISMATCH');
    }
    const bytes = fs.readFileSync(opened.fd);
    const after = fs.fstatSync(opened.fd, { bigint: true });
    if (signature(after) !== signature(opened.info) || bytes.length !== Number(after.size)) fail('FILE_CHANGED_DURING_READ');
    return { ...opened, bytes, hash: sha256(bytes) };
  } catch (error) { close(opened.fd); throw error; }
}
function recheck(snapshot, code) {
  if (signature(fs.fstatSync(snapshot.fd, { bigint: true })) !== signature(snapshot.info)) fail(code);
  let current;
  try {
    current = readSnapshot(snapshot.absolute);
    if (signature(current.info) !== signature(snapshot.info) || current.hash !== snapshot.hash) fail(code);
  } catch (error) {
    if (error.code === code) throw error;
    fail(code);
  } finally { if (current) close(current.fd); }
}
function checkParent(original) {
  let fresh;
  try {
    fresh = openPath(repoRoot, true);
    if (fresh.info.dev !== original.info.dev || fresh.info.ino !== original.info.ino) fail('TARGET_PARENT_CHANGED');
  } finally { if (fresh) close(fresh.fd); }
}
function createFile(directoryFd, name, bytes, mode = 0o600) {
  const fd = track(fs.openSync(anchor(directoryFd, name),
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, mode));
  try {
    fs.writeFileSync(fd, bytes);
    fs.fchmodSync(fd, mode);
    fs.fsyncSync(fd);
  } finally { close(fd); }
}
function privateDirectory() {
  let current = openPath(repoRoot, true);
  try {
    for (const name of ['private', 'operations']) {
      try { fs.mkdirSync(anchor(current.fd, name), { mode: 0o700 }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      const next = track(fs.openSync(anchor(current.fd, name),
        fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW));
      const info = fs.fstatSync(next, { bigint: true });
      if (info.uid !== BigInt(process.getuid())) { close(next); fail('PRIVATE_DIRECTORY_OWNER_MISMATCH'); }
      close(current.fd);
      current = { fd: next };
    }
    const name = 'reviewed-server-' + new Date().toISOString().replace(/[-:.]/g, '') + '-' + crypto.randomBytes(6).toString('hex');
    fs.mkdirSync(anchor(current.fd, name), { mode: 0o700 });
    const fd = track(fs.openSync(anchor(current.fd, name),
      fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW));
    return { fd, absolute: path.join(repoRoot, 'private/operations', name) };
  } finally { close(current.fd); }
}
function reviewDiff(beforePath, afterPath) {
  // A pure text comparison tool, not either application's code. The output is
  // written only to a private file; no source lines appear in stdout.
  const compared = spawnSync('/usr/bin/diff', ['--unified=3', '--label', 'server.js (reviewed source)',
    '--label', 'server.js (candidate)', beforePath, afterPath], {
    env: { PATH: '/usr/bin:/bin', LANG: 'C', NODE_OPTIONS: '' }, encoding: 'utf8',
    timeout: 10000, killSignal: 'SIGKILL', maxBuffer: MAX_BYTES * 2 + 65536
  });
  if (compared.error || ![0, 1].includes(compared.status)) fail('REVIEW_DIFF_FAILED');
  const text = compared.stdout || '# No content changes.\n';
  const lines = text.split('\n');
  return { text, changedSourceLines: lines.filter(line => line.startsWith('-') && !line.startsWith('---')).length,
    changedCandidateLines: lines.filter(line => line.startsWith('+') && !line.startsWith('+++')).length,
    hunks: lines.filter(line => /^@@ /.test(line)) };
}
function parseArgs() {
  const options = { apply: false };
  for (let i = 2; i < process.argv.length; i++) {
    const flag = process.argv[i];
    if (flag === '--apply' && !options.apply) options.apply = true;
    else if ((flag === '--candidate' || flag === '--expected-current-sha256') && !Object.hasOwn(options, flag)) {
      const value = process.argv[++i];
      if (!value || value.startsWith('--')) fail('MISSING_ARGUMENT');
      options[flag] = value;
    } else fail('UNKNOWN_OR_DUPLICATE_ARGUMENT');
  }
  if (!options['--candidate'] || !/^[0-9a-fA-F]{64}$/.test(options['--expected-current-sha256'] || '')) fail('EXPLICIT_CANDIDATE_AND_SHA256_REQUIRED');
  options.expected = options['--expected-current-sha256'].toLowerCase();
  options.candidate = path.resolve(options['--candidate']);
  return options;
}
function main() {
  if (process.platform !== 'linux') fail('LINUX_FD_ANCHORS_REQUIRED');
  const options = parseArgs();
  report.dryRun = !options.apply;
  report.expectedCurrentSha256 = options.expected;
  report.candidate = options.candidate;
  const parent = openPath(repoRoot, true);
  parentFd = parent.fd;
  const source = readSnapshot(targetPath);
  const candidate = readSnapshot(options.candidate);
  Object.assign(report, { sourceSha256: source.hash, candidateSha256: candidate.hash,
    sourceBytes: source.bytes.length, candidateBytes: candidate.bytes.length,
    preservedMode: '0' + Number(source.info.mode & 0o7777n).toString(8) });
  if (source.hash !== options.expected) fail('EXPECTED_SOURCE_HASH_MISMATCH');
  const review = privateDirectory();
  receiptDirectory = review.absolute;
  receiptFd = review.fd;
  const backupName = 'server-source-' + source.hash + '.js';
  const candidateName = 'server-candidate-' + candidate.hash + '.js';
  createFile(review.fd, backupName, source.bytes);
  createFile(review.fd, candidateName, candidate.bytes);
  report.backup = path.join(review.absolute, backupName);
  report.reviewedCandidate = path.join(review.absolute, candidateName);
  const diff = reviewDiff(report.backup, report.reviewedCandidate);
  createFile(review.fd, 'review.diff', diff.text);
  Object.assign(report, { diff: path.join(review.absolute, 'review.diff'),
    changedSourceLines: diff.changedSourceLines, changedCandidateLines: diff.changedCandidateLines });
  report.diffHunks = diff.hunks;

  // Syntax-check a unique .js file beside the real target, so package/module
  // interpretation matches server.js; never run either application's code.
  const stageName = '.sheikha-reviewed-server-' + crypto.randomBytes(12).toString('hex') + '.tmp.js';
  stagePath = anchor(parent.fd, stageName);
  const stageFd = track(fs.openSync(stagePath,
    fs.constants.O_RDWR | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600));
  stageInfo = fs.fstatSync(stageFd, { bigint: true });
  fs.writeFileSync(stageFd, candidate.bytes);
  fs.fsyncSync(stageFd);
  stageInfo = fs.fstatSync(stageFd, { bigint: true });
  const stageSnapshot = { fd: stageFd, absolute: path.join(repoRoot, stageName), info: stageInfo, hash: candidate.hash };
  // NODE_OPTIONS/preloads/coverage are not inherited by this syntax-only child.
  const syntax = spawnSync(process.execPath, ['--check', stageSnapshot.absolute], {
    cwd: repoRoot, env: { PATH: process.env.PATH || '/usr/bin:/bin', LANG: 'C', NODE_OPTIONS: '' },
    timeout: 30000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 65536,
    windowsHide: true
  });
  report.syntax = { passed: syntax.status === 0 && !syntax.error, exitCode: syntax.status,
    nodeOptionsCleared: true, applicationExecuted: false };
  if (!report.syntax.passed) fail('CANDIDATE_SYNTAX_CHECK_FAILED');
  recheck(stageSnapshot, 'STAGED_CANDIDATE_CHANGED_DURING_SYNTAX');
  recheck(candidate, 'CANDIDATE_CHANGED_DURING_REVIEW');
  checkParent(parent);
  recheck(source, 'SOURCE_CHANGED_DURING_REVIEW');
  if (source.hash === candidate.hash) {
    report.success = true;
    report.result = 'ALREADY_CURRENT';
    return;
  }
  if (!options.apply) {
    report.success = true;
    report.result = 'REVIEW_READY_NO_SOURCE_CHANGE';
    return;
  }

  fs.fchownSync(stageFd, Number(source.info.uid), Number(source.info.gid));
  fs.fchmodSync(stageFd, Number(source.info.mode & 0o7777n));
  fs.fsyncSync(stageFd);
  stageInfo = fs.fstatSync(stageFd, { bigint: true });
  // Fail closed on a replaced directory, path, candidate, inode or source bytes.
  recheck(candidate, 'CANDIDATE_CHANGED_BEFORE_RENAME');
  recheck({ ...stageSnapshot, info: stageInfo }, 'STAGED_CANDIDATE_CHANGED_BEFORE_RENAME');
  checkParent(parent);
  recheck(source, 'SOURCE_CHANGED_BEFORE_RENAME');
  report.recheckedBeforeRenameAt = new Date().toISOString();
  fs.renameSync(stagePath, anchor(parent.fd, 'server.js'));
  report.applied = true;
  stagePath = null;
  fs.fsyncSync(parent.fd);
  const after = readSnapshot(targetPath);
  try {
    if (after.hash !== candidate.hash || after.info.ino !== stageInfo.ino || after.info.dev !== stageInfo.dev) fail('POST_APPLY_VERIFICATION_FAILED');
    report.appliedSha256 = after.hash;
    report.success = true;
    report.result = 'APPLIED_AND_VERIFIED';
  } finally { close(after.fd); }
}

if (process.argv.length === 3 && process.argv[2] === '--help') {
  process.stdout.write('Usage: node tools/runtime/sheikha-apply-reviewed-server.cjs --candidate FILE --expected-current-sha256 HEX64 [--apply]\nDry-run is the default. Only repo/server.js can be replaced. Review artifacts and backups are private.\n');
  process.exit(0);
}
try { main(); }
catch (error) {
  report.errorCode = typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : 'REVIEWED_SERVER_OPERATION_FAILED';
  report.result = report.applied ? 'APPLIED_BUT_VERIFICATION_FAILED' : 'REFUSED_NO_SOURCE_REPLACEMENT';
  process.exitCode = 1;
} finally {
  if (stagePath && stageInfo) {
    try {
      const info = fs.lstatSync(stagePath, { bigint: true });
      if (info.ino === stageInfo.ino && info.dev === stageInfo.dev) fs.unlinkSync(stagePath);
    } catch (error) { if (error.code !== 'ENOENT') report.temporaryCleanupFailed = true; }
  }
  report.completedAt = new Date().toISOString();
  if (receiptDirectory && receiptFd !== null) {
    report.receipt = path.join(receiptDirectory, 'receipt.json');
    try { createFile(receiptFd, 'receipt.json', JSON.stringify(report, null, 2) + '\n'); }
    catch { report.receiptWriteFailed = true; process.exitCode = 1; }
  }
  for (const fd of [...descriptors]) { try { close(fd); } catch {} }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}
