'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const CAPTURE_ROUTE =
  'SHEIKHA_GOVERNED_READ_ONLY_EVIDENCE_CAPTURE_V1';
const REQUIRED_RECORDS = Object.freeze([
  'diagnosis-result.json',
  'diagnosis-terminal-record.json',
  'current-main-worktree-state.json',
  'tracked-drift-analysis.json',
  'main-head-manifest-comparison.json'
]);
const REQUIRED_MARKERS = Object.freeze([
  'VERIFY_EXISTING_I1_R1_DIGESTS',
  'CURRENT_MAIN_HEAD',
  'CURRENT_MAIN_STATUS',
  'CURRENT_UNSTAGED_NAME_STATUS',
  'CURRENT_STAGED_NAME_STATUS',
  'CURRENT_MANIFEST_SHA256',
  'READ_ONLY_I2_INPUT_CAPTURE_COMPLETE=true'
]);
const PRECONDITION_DRIFT_MARKERS = Object.freeze([
  'VERIFY_I1_R1_PREDECESSOR_DIGESTS',
  'READ_ONLY_PRECONDITION_DRIFT_CAPTURE_COMPLETE=true',
  'I2_OR_I2_R1_EXECUTION_ALLOWED_NOW=false',
  'D6_AUTHORIZATION_ALLOWED_NOW=false'
]);
const DENIED_PATTERNS = Object.freeze([
  ['PRIVILEGE_ESCALATION', /(?:^|[\s;(])(?:sudo|pkexec|doas)\b|\bsu\s+-c\b/im],
  ['NETWORK_COMMAND', /(?:^|[\s;(])(?:curl|wget|ssh|scp|sftp|telnet|ncat|nc)\b/im],
  ['FILESYSTEM_MUTATION', /(?:^|[;\n(])\s*(?:rm|mv|cp|install|mkdir|touch|chmod|chown|truncate|tee)\b/im],
  ['PACKAGE_MUTATION', /\b(?:apt|apt-get|dnf|yum|pacman|zypper)\b|\bnpm\s+(?:ci|install|uninstall|update)\b/im],
  ['GIT_MUTATION', /\bgit\b[^\n]*(?:\s|^)(?:add|commit|push|reset|clean|checkout|switch|merge|rebase|cherry-pick|tag)\b/im],
  ['SHELL_EXECUTION', /(?:^|[;\n(])\s*(?:bash|sh|zsh|fish)\s+[^-\n]/im],
  ['DYNAMIC_EVALUATION', /(?:^|[;\n(])\s*(?:eval|source)\b/im],
  ['OUTPUT_REDIRECTION', /(^|[^<])>{1,2}\s*[^&]/m]
]);

function isGovernedReadOnlyEvidenceCaptureRequest(message = '') {
  const text = String(message || '');
  return REQUIRED_MARKERS.every((marker) => text.includes(marker)) &&
    /(?:^|\n)\s*DIAG=/m.test(text) &&
    /(?:^|\n)\s*MAIN=/m.test(text) &&
    /sha256sum\s+-c\s+diagnosis-files\.sha256/i.test(text) &&
    /git\s+-C\s+["']?\$MAIN["']?\s+(?:rev-parse|status|diff)/i.test(text);
}

function isGovernedPreconditionDriftCaptureRequest(message = '') {
  const text = String(message || '');
  return PRECONDITION_DRIFT_MARKERS.every((marker) => text.includes(marker)) &&
    /(?:^|\n)\s*DIAG=/m.test(text) &&
    /(?:^|\n)\s*MAIN=/m.test(text) &&
    /sha256sum\s+-c\s+diagnosis-files\.sha256/iu.test(text) &&
    /current-main-worktree-state\.json/iu.test(text) &&
    /status_added\s*=|statusAddedLines/iu.test(text) &&
    /current_untracked|currentUntrackedCount/iu.test(text);
}

function isGovernedPublishedEvidenceVerificationRequest(message = '') {
  const text = String(message || '');
  return /(?:^|\n)\s*DIR=/m.test(text) &&
    /READ_ONLY_PUBLISHED_[A-Z0-9_]+_VERIFICATION_COMPLETE=true/u.test(text) &&
    /RERUN_ALLOWED_NOW=false/u.test(text) &&
    /D6_AUTHORIZATION_ALLOWED_NOW=false/u.test(text) &&
    /sha256sum\s+-c\s+[A-Za-z0-9_.-]+\.sha256/iu.test(text) &&
    /python3\s+-m\s+json\.tool\s+["']?\$DIR\/[A-Za-z0-9_.-]+\.json/iu.test(text) &&
    /find\s+["']?\$DIR["']?\s+-maxdepth\s+1\s+-type\s+f/iu.test(text);
}

function inspectReadOnlyCapturePolicy(message = '') {
  const text = String(message || '');
  return DENIED_PATTERNS
    .filter(([, pattern]) => pattern.test(text))
    .map(([id]) => id);
}

function parseAssignment(message, name) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${name}\\s*=\\s*(["'])([^"'\\n]+)\\1`,
    'm'
  );
  const match = String(message || '').match(pattern);
  return match ? match[2] : null;
}

function expandHome(value, homeDir) {
  const raw = String(value || '');
  if (raw === '$HOME') return homeDir;
  if (raw.startsWith('$HOME/')) return path.join(homeDir, raw.slice(6));
  if (raw === '~') return homeDir;
  if (raw.startsWith('~/')) return path.join(homeDir, raw.slice(2));
  return path.resolve(raw);
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative)
  );
}

async function sha256File(file) {
  const data = await fs.readFile(file);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function parseDigestList(content) {
  return String(content || '')
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/iu);
      if (!match) throw new Error('SHEIKHA_EVIDENCE_DIGEST_LINE_INVALID');
      const filename = match[2];
      if (
        path.isAbsolute(filename) ||
        filename.includes('/') ||
        filename.includes('\\') ||
        filename === '.' ||
        filename === '..'
      ) {
        throw new Error('SHEIKHA_EVIDENCE_DIGEST_PATH_DENIED');
      }
      return { expected: match[1].toLowerCase(), filename };
    });
}

async function verifyDigestList(
  evidenceRoot,
  digestFilename = 'diagnosis-files.sha256'
) {
  if (
    path.basename(digestFilename) !== digestFilename ||
    !/^[A-Za-z0-9_.-]+\.sha256$/u.test(digestFilename)
  ) {
    throw new Error('SHEIKHA_EVIDENCE_DIGEST_FILENAME_DENIED');
  }
  const digestFile = path.join(evidenceRoot, digestFilename);
  const entries = parseDigestList(await fs.readFile(digestFile, 'utf8'));
  const results = [];
  for (const entry of entries) {
    const target = await fs.realpath(path.join(evidenceRoot, entry.filename));
    if (!isWithin(evidenceRoot, target)) {
      throw new Error('SHEIKHA_EVIDENCE_FILE_OUTSIDE_ROOT');
    }
    const actual = await sha256File(target);
    results.push({
      filename: entry.filename,
      expected: entry.expected,
      actual,
      valid: actual === entry.expected
    });
  }
  return results;
}

async function readJsonRecord(evidenceRoot, filename) {
  const target = await fs.realpath(path.join(evidenceRoot, filename));
  if (!isWithin(evidenceRoot, target)) {
    throw new Error('SHEIKHA_EVIDENCE_RECORD_OUTSIDE_ROOT');
  }
  const stat = await fs.stat(target);
  if (!stat.isFile() || stat.size > 2 * 1024 * 1024) {
    throw new Error('SHEIKHA_EVIDENCE_RECORD_SIZE_INVALID');
  }
  return JSON.parse(await fs.readFile(target, 'utf8'));
}

async function defaultGitRunner(repository, args, options = {}) {
  const binary = options.binary === true;
  const { stdout } = await execFileAsync(
    'git',
    ['-C', repository, ...args],
    {
      encoding: binary ? null : 'utf8',
      timeout: 15000,
      maxBuffer: 8 * 1024 * 1024,
      env: {
        ...process.env,
        GIT_PAGER: 'cat',
        PAGER: 'cat',
        GIT_TERMINAL_PROMPT: '0'
      }
    }
  );
  if (binary) return Buffer.from(stdout || '');
  return String(stdout || '').trimEnd();
}

function nonEmptyLines(value) {
  const text = String(value || '').trimEnd();
  return text ? text.split(/\r?\n/u) : [];
}

function buildCaptureAnswer(capture) {
  const result = capture.records['diagnosis-result.json'];
  const terminal = capture.records['diagnosis-terminal-record.json'];
  const comparison = capture.records['main-head-manifest-comparison.json'];
  const digestLabel = `${capture.validDigestCount}/${capture.digestCount}`;
  const driftDelta = capture.currentStatusCount - capture.recordedStatusCount;
  const driftLine = driftDelta === 0
    ? 'عدد إدخالات مساحة العمل لم يتغير منذ التشخيص.'
    : `تغير عدد إدخالات مساحة العمل منذ التشخيص بمقدار ${driftDelta > 0 ? '+' : ''}${driftDelta}.`;

  return [
    '## التقاط أدلة I2 للقراءة فقط',
    '',
    'تم تنفيذ الالتقاط عبر محوّل Node محكوم، وليس عبر Shell عام.',
    '',
    '### سلامة أدلة I1-R1',
    `- البصمات الصحيحة: ${digestLabel}.`,
    `- نتيجة التشخيص: ${result.success === true ? 'ناجحة' : 'غير ناجحة'}.`,
    `- السجل نهائي: ${terminal.terminal === true ? 'نعم' : 'لا'}.`,
    `- إعادة التشغيل مسموحة: ${terminal.rerunAllowed === true ? 'نعم' : 'لا'}.`,
    '',
    '### الحالة الحالية',
    `- HEAD: ${capture.currentHead}.`,
    `- إدخالات Git الحالية: ${capture.currentStatusCount}.`,
    `- الملفات المتتبعة المعدلة غير staged: ${capture.unstagedCount}.`,
    `- الملفات staged: ${capture.stagedCount}.`,
    `- ${driftLine}`,
    `- package.json يطابق لقطة التشخيص: ${capture.packageJsonMatchesRecorded ? 'نعم' : 'لا'}.`,
    `- package-lock.json يطابق لقطة التشخيص: ${capture.packageLockMatchesRecorded ? 'نعم' : 'لا'}.`,
    `- package.json كان يطابق HEAD وقت التشخيص: ${comparison.packageJsonMatchesOwnHead === true ? 'نعم' : 'لا'}.`,
    '',
    '### القرار',
    `- ${result.decision || 'غير محدد'}.`,
    `- المرحلة التالية: ${result.nextStage || terminal.nextStage || 'غير محددة'}.`,
    '',
    '### حدود التنفيذ',
    '- لم تُستخدم الشبكة أو sudo أو مدير حزم.',
    '- لم تُكتب ملفات ولم تُنفذ أوامر Git تغييرية.',
    '- لم يُمرر نص المستخدم إلى bash أو shell.'
  ].join('\n');
}

async function runGovernedReadOnlyEvidenceCapture(message, options = {}) {
  if (!isGovernedReadOnlyEvidenceCaptureRequest(message)) {
    throw new Error('SHEIKHA_READ_ONLY_CAPTURE_PROTOCOL_NOT_RECOGNIZED');
  }
  const policyViolations = inspectReadOnlyCapturePolicy(message);
  if (policyViolations.length) {
    throw new Error(
      `SHEIKHA_READ_ONLY_CAPTURE_POLICY_DENIED:${policyViolations.join(',')}`
    );
  }

  const homeDir = path.resolve(options.homeDir || os.homedir());
  const configuredWorkspace = options.workspaceRoot;
  if (!configuredWorkspace) {
    throw new Error('SHEIKHA_READ_ONLY_CAPTURE_WORKSPACE_REQUIRED');
  }
  const requestedEvidence = expandHome(
    parseAssignment(message, 'DIAG'),
    homeDir
  );
  const requestedMain = expandHome(
    parseAssignment(message, 'MAIN'),
    homeDir
  );
  const allowedEvidenceRoot = await fs.realpath(
    path.join(homeDir, 'Backups', 'sheikha')
  );
  const evidenceRoot = await fs.realpath(requestedEvidence);
  const workspaceRoot = await fs.realpath(configuredWorkspace);
  const mainRoot = await fs.realpath(requestedMain);

  if (!isWithin(allowedEvidenceRoot, evidenceRoot)) {
    throw new Error('SHEIKHA_READ_ONLY_CAPTURE_EVIDENCE_ROOT_DENIED');
  }
  if (mainRoot !== workspaceRoot) {
    throw new Error('SHEIKHA_READ_ONLY_CAPTURE_WORKSPACE_MISMATCH');
  }

  const digestResults = await verifyDigestList(evidenceRoot);
  const invalidDigests = digestResults.filter((entry) => !entry.valid);
  if (invalidDigests.length) {
    throw new Error('SHEIKHA_READ_ONLY_CAPTURE_DIGEST_MISMATCH');
  }

  const records = {};
  for (const filename of REQUIRED_RECORDS) {
    records[filename] = await readJsonRecord(evidenceRoot, filename);
  }

  const gitRunner = options.gitRunner || defaultGitRunner;
  const [
    currentHead,
    currentStatus,
    unstaged,
    staged
  ] = await Promise.all([
    gitRunner(mainRoot, ['rev-parse', 'HEAD']),
    gitRunner(mainRoot, ['status', '--porcelain=v1', '--untracked-files=all']),
    gitRunner(mainRoot, ['diff', '--name-status']),
    gitRunner(mainRoot, ['diff', '--cached', '--name-status'])
  ]);

  const packageJsonSha256 = await sha256File(path.join(mainRoot, 'package.json'));
  const packageLockSha256 = await sha256File(path.join(mainRoot, 'package-lock.json'));
  const comparison = records['main-head-manifest-comparison.json'];
  const capture = {
    route: CAPTURE_ROUTE,
    evidenceRoot,
    workspaceRoot: mainRoot,
    digestCount: digestResults.length,
    validDigestCount: digestResults.length - invalidDigests.length,
    currentHead: String(currentHead || '').trim(),
    currentStatusCount: nonEmptyLines(currentStatus).length,
    unstagedCount: nonEmptyLines(unstaged).length,
    stagedCount: nonEmptyLines(staged).length,
    recordedStatusCount: Array.isArray(
      records['current-main-worktree-state.json'].statusPorcelain
    )
      ? records['current-main-worktree-state.json'].statusPorcelain.length
      : 0,
    packageJsonSha256,
    packageLockSha256,
    packageJsonMatchesRecorded:
      packageJsonSha256 === comparison.currentPackageJsonSha256,
    packageLockMatchesRecorded:
      packageLockSha256 === comparison.currentPackageLockSha256,
    statusPreview: nonEmptyLines(currentStatus).slice(0, 20),
    records,
    boundaries: {
      shellUsed: false,
      networkUsed: false,
      filesWritten: false,
      gitMutationExecuted: false,
      arbitraryFilesystemAccess: false
    }
  };

  return {
    success: true,
    route: CAPTURE_ROUTE,
    answer: buildCaptureAnswer(capture),
    capture
  };
}

function canonicalArraySha256(values) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(values))
    .digest('hex');
}

function parseVisibleNumber(text, pattern) {
  const match = String(text || '').match(pattern);
  return match ? Number(match[1]) : null;
}

function parseVisibleSha256(text, pattern) {
  const match = String(text || '').match(pattern);
  return match ? match[1].toLowerCase() : null;
}

function difference(left, right) {
  const rightSet = new Set(right);
  return [...new Set(left)].filter((value) => !rightSet.has(value)).sort();
}

function porcelainPath(line) {
  const value = String(line || '');
  if (/^(?:\?\?|!!)\s/u.test(value)) return value.slice(3);
  if (value.length >= 3 && value[2] === ' ') return value.slice(3);
  if (/^[ MADRCU?!]\s[^\s]/u.test(value)) return value.slice(2);
  return value;
}

function hasLegacyPorcelainFirstLine(statusLines) {
  return statusLines.some((line) => (
    !/^(?:\?\?|!!)\s/u.test(line) &&
    line.length >= 3 &&
    line[1] === ' ' &&
    line[2] !== ' '
  ));
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value || ''));
}

function buildPreconditionDriftAnswer(capture) {
  const semanticPaths = capture.semanticStatusAddedPaths.length
    ? capture.semanticStatusAddedPaths.map((value) => `- \`${value}\``)
    : ['- لا توجد مسارات مضافة دلاليًا.'];
  return [
    '## التقاط انحراف شروط I2-R1 للقراءة فقط',
    '',
    'تم تنفيذ الالتقاط عبر محوّل Node محكوم، وليس عبر كتلة Python أو Shell عامة.',
    '',
    '### سلامة السجل السابق',
    `- بصمات I1-R1 الصحيحة: ${capture.validDigestCount}/${capture.digestCount}.`,
    `- HEAD يطابق I1-R1: ${capture.headMatchesI1R1 ? 'نعم' : 'لا'}.`,
    `- Tree يطابق I1-R1: ${capture.treeMatchesI1R1 ? 'نعم' : 'لا'}.`,
    '',
    '### الحالة الحالية',
    `- Status: ${capture.currentStatusCount}.`,
    `- Tracked: ${capture.currentTrackedCount}.`,
    `- Untracked: ${capture.currentUntrackedCount}.`,
    `- Staged: ${capture.currentStagedCount}.`,
    `- ادعاءات Inspector تطابق الحالة الحية: ${capture.inspectorClaimsMatchLiveState ? 'نعم' : 'لا'}.`,
    '',
    '### تفسير الفرق',
    `- الفرق النصي الخام: ${capture.rawStatusAddedLines.length} إضافة و${capture.rawStatusRemovedLines.length} إزالة.`,
    `- تطبيع سطر Porcelain تاريخي ناقص العمود: ${capture.predecessorStatusNormalizationApplied ? 'طُبق' : 'غير مطلوب'}.`,
    `- الإضافات الدلالية الفعلية: ${capture.semanticStatusAddedPaths.length}.`,
    ...semanticPaths,
    `- المسارات المتتبعة لم تتغير عن I1-R1: ${capture.trackedPathsMatchI1R1 ? 'نعم' : 'لا'}.`,
    '',
    '### القرار',
    `- ${capture.decision}.`,
    '- تشغيل I2 أو I2-R1 الآن: غير مسموح.',
    '- تفويض D6 الآن: غير مسموح.',
    '',
    '### حدود التنفيذ',
    '- لم تُكتب ملفات ولم تُنفذ اختبارات أو npm أو تنظيف.',
    '- لم تُستخدم الشبكة ولم تُحذف node_modules.',
    '- لم يُمرر نص المستخدم إلى Python أو bash أو shell.'
  ].join('\n');
}

async function runGovernedPreconditionDriftCapture(message, options = {}) {
  if (!isGovernedPreconditionDriftCaptureRequest(message)) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_PROTOCOL_NOT_RECOGNIZED');
  }
  const policyViolations = inspectReadOnlyCapturePolicy(message);
  if (policyViolations.length) {
    throw new Error(
      `SHEIKHA_PRECONDITION_DRIFT_POLICY_DENIED:${policyViolations.join(',')}`
    );
  }
  const homeDir = path.resolve(options.homeDir || os.homedir());
  if (!options.workspaceRoot) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_WORKSPACE_REQUIRED');
  }
  const allowedEvidenceRoot = await fs.realpath(
    path.join(homeDir, 'Backups', 'sheikha')
  );
  const evidenceRoot = await fs.realpath(expandHome(
    parseAssignment(message, 'DIAG'),
    homeDir
  ));
  const workspaceRoot = await fs.realpath(options.workspaceRoot);
  const requestedWorkspace = await fs.realpath(expandHome(
    parseAssignment(message, 'MAIN'),
    homeDir
  ));
  if (!isWithin(allowedEvidenceRoot, evidenceRoot)) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_EVIDENCE_ROOT_DENIED');
  }
  if (requestedWorkspace !== workspaceRoot) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_WORKSPACE_MISMATCH');
  }

  const digestResults = await verifyDigestList(evidenceRoot);
  if (digestResults.some((entry) => !entry.valid)) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_DIGEST_MISMATCH');
  }
  const prior = await readJsonRecord(
    evidenceRoot,
    'current-main-worktree-state.json'
  );
  if (!Array.isArray(prior.statusPorcelain) || !Array.isArray(prior.trackedDiffPaths)) {
    throw new Error('SHEIKHA_PRECONDITION_DRIFT_PRIOR_STATE_INVALID');
  }

  const gitRunner = options.gitRunner || defaultGitRunner;
  const [
    currentHead,
    currentTree,
    statusText,
    trackedText,
    untrackedText,
    stagedText,
    headPackageJson,
    headPackageLock
  ] = await Promise.all([
    gitRunner(workspaceRoot, ['rev-parse', 'HEAD']),
    gitRunner(workspaceRoot, ['show', '-s', '--format=%T', 'HEAD']),
    gitRunner(workspaceRoot, ['status', '--porcelain=v1', '--untracked-files=all']),
    gitRunner(workspaceRoot, ['diff', '--name-only', '--']),
    gitRunner(workspaceRoot, ['ls-files', '--others', '--exclude-standard']),
    gitRunner(workspaceRoot, ['diff', '--cached', '--name-only', '--']),
    gitRunner(workspaceRoot, ['show', 'HEAD:package.json'], { binary: true }),
    gitRunner(workspaceRoot, ['show', 'HEAD:package-lock.json'], { binary: true })
  ]);
  const currentStatus = nonEmptyLines(statusText);
  const currentTracked = nonEmptyLines(trackedText);
  const currentUntracked = nonEmptyLines(untrackedText);
  const currentStaged = nonEmptyLines(stagedText);
  const rawStatusAddedLines = difference(currentStatus, prior.statusPorcelain);
  const rawStatusRemovedLines = difference(prior.statusPorcelain, currentStatus);
  const trackedAddedPaths = difference(currentTracked, prior.trackedDiffPaths);
  const trackedRemovedPaths = difference(prior.trackedDiffPaths, currentTracked);
  const priorStatusPaths = prior.statusPorcelain.map(porcelainPath);
  const currentStatusPaths = currentStatus.map(porcelainPath);
  const semanticStatusAddedPaths = difference(currentStatusPaths, priorStatusPaths);
  const semanticStatusRemovedPaths = difference(priorStatusPaths, currentStatusPaths);
  const currentStatusSha256 = canonicalArraySha256(currentStatus);
  const currentTrackedSha256 = canonicalArraySha256(currentTracked);
  const expectedStatusCount = parseVisibleNumber(
    message,
    /len\(current_status\)\s*==\s*(\d+)/u
  );
  const expectedUntrackedCount = parseVisibleNumber(
    message,
    /len\(current_untracked\)\s*==\s*(\d+)/u
  );
  const expectedTrackedCount = parseVisibleNumber(
    message,
    /len\(current_tracked\)\s*==\s*(\d+)/u
  );
  const expectedAddedCount = parseVisibleNumber(
    message,
    /len\(status_added\)\s*==\s*(\d+)/u
  );
  const expectedStatusSha256 = parseVisibleSha256(
    message,
    /current_status_sha[\s\S]{0,160}?==\s*["']([a-f0-9]{64})["']/iu
  );
  const inspectorClaimsMatchLiveState =
    currentStatus.length === expectedStatusCount &&
    currentUntracked.length === expectedUntrackedCount &&
    currentStatusSha256 === expectedStatusSha256;
  const semanticAdditionsAreUntracked = semanticStatusAddedPaths.every((item) => (
    currentStatus.some((line) => line.startsWith('?? ') && porcelainPath(line) === item)
  ));
  const onlyExpectedSemanticUntrackedAdditions =
    semanticStatusAddedPaths.length === expectedAddedCount &&
    semanticAdditionsAreUntracked &&
    semanticStatusRemovedPaths.length === 0 &&
    trackedAddedPaths.length === 0 &&
    trackedRemovedPaths.length === 0 &&
    currentTracked.length === expectedTrackedCount &&
    currentStaged.length === 0;
  const decision = inspectorClaimsMatchLiveState && onlyExpectedSemanticUntrackedAdditions
    ? 'FOUR_NEW_UNTRACKED_PATHS_CONFIRMED_AFTER_PREDECESSOR_NORMALIZATION_REQUIRES_READ_ONLY_CLASSIFICATION_BEFORE_I2_R2'
    : 'CURRENT_STATE_REQUIRES_REVIEW_BEFORE_ANY_I2_CORRECTION';
  const capture = {
    captureId: 'SHEIKHA_PR28_I2_R1_PRECONDITION_DRIFT_READ_ONLY_CAPTURE_V1',
    currentHead: String(currentHead || '').trim(),
    currentTree: String(currentTree || '').trim(),
    priorHead: prior.headCommit,
    priorTree: prior.treeAtHead,
    headMatchesI1R1: String(currentHead || '').trim() === prior.headCommit,
    treeMatchesI1R1: String(currentTree || '').trim() === prior.treeAtHead,
    currentStatusCount: currentStatus.length,
    currentTrackedCount: currentTracked.length,
    currentUntrackedCount: currentUntracked.length,
    currentStagedCount: currentStaged.length,
    currentStatusCanonicalSha256: currentStatusSha256,
    currentTrackedPathsCanonicalSha256: currentTrackedSha256,
    priorStatusCanonicalSha256: canonicalArraySha256(prior.statusPorcelain),
    priorTrackedPathsCanonicalSha256: canonicalArraySha256(prior.trackedDiffPaths),
    rawStatusAddedLines,
    rawStatusRemovedLines,
    semanticStatusAddedPaths,
    semanticStatusRemovedPaths,
    trackedAddedPaths,
    trackedRemovedPaths,
    trackedPathsMatchI1R1:
      trackedAddedPaths.length === 0 && trackedRemovedPaths.length === 0,
    predecessorStatusNormalizationApplied:
      hasLegacyPorcelainFirstLine(prior.statusPorcelain),
    inspectorClaimsMatchLiveState,
    onlyExpectedSemanticUntrackedAdditions,
    manifests: {
      currentPackageJsonSha256: await sha256File(
        path.join(workspaceRoot, 'package.json')
      ),
      currentPackageLockSha256: await sha256File(
        path.join(workspaceRoot, 'package-lock.json')
      ),
      headPackageJsonSha256: crypto
        .createHash('sha256')
        .update(toBuffer(headPackageJson))
        .digest('hex'),
      headPackageLockSha256: crypto
        .createHash('sha256')
        .update(toBuffer(headPackageLock))
        .digest('hex')
    },
    digestCount: digestResults.length,
    validDigestCount: digestResults.filter((entry) => entry.valid).length,
    decision,
    truthBoundaries: {
      worktreeModified: false,
      filesStaged: false,
      npmCommandExecuted: false,
      testsExecuted: false,
      networkAccessed: false,
      nodeModulesDeleted: false,
      cleanupPerformed: false,
      d6Created: false,
      shellUsed: false,
      pythonExecuted: false
    }
  };
  return {
    success: true,
    route: 'SHEIKHA_GOVERNED_PRECONDITION_DRIFT_CAPTURE_V1',
    answer: buildPreconditionDriftAnswer(capture),
    capture
  };
}

function parsePublishedEvidenceFiles(message) {
  const text = String(message || '');
  const digestMatch = text.match(
    /sha256sum\s+-c\s+([A-Za-z0-9_.-]+\.sha256)/iu
  );
  const jsonFiles = [...text.matchAll(
    /python3\s+-m\s+json\.tool\s+["']?\$DIR\/([A-Za-z0-9_.-]+\.json)["']?/giu
  )].map((match) => match[1]);
  return {
    digestFilename: digestMatch ? digestMatch[1] : null,
    jsonFiles: [...new Set(jsonFiles)]
  };
}

function buildPublishedEvidenceAnswer(verification) {
  const result = verification.result || {};
  const terminal = verification.terminal || {};
  return [
    '## تحقق دليل شيخة المنشور للقراءة فقط',
    '',
    `- عدد الملفات: ${verification.fileCount}.`,
    `- البصمات الصحيحة: ${verification.validDigestCount}/${verification.digestCount}.`,
    `- النتيجة ناجحة: ${result.success === true ? 'نعم' : 'لا'}.`,
    `- السجل نهائي: ${terminal.terminal === true ? 'نعم' : 'لا'}.`,
    `- إعادة التشغيل مسموحة: ${terminal.rerunAllowed === true ? 'نعم' : 'لا'}.`,
    `- التصحيح مطبق: ${result.correctionApplied === true || terminal.correctionApplied === true ? 'نعم' : 'غير مثبت'}.`,
    `- عيب Porcelain مصحح: ${result.porcelainLeadingSpaceSerializationDefectCorrected === true ? 'نعم' : 'غير مثبت'}.`,
    `- Status/Tracked/Untracked/Staged: ${result.statusEntryCount ?? 'غير متاح'}/${result.trackedDiffPathCount ?? 'غير متاح'}/${result.untrackedPathCount ?? 'غير متاح'}/${result.stagedPathCount ?? 'غير متاح'}.`,
    `- الملفات الجديدة المحمية: ${result.newProtectedUntrackedFileCount ?? 'غير متاح'}.`,
    '',
    '### القرار',
    `- ${result.decision || terminal.decision || 'غير محدد'}.`,
    `- المرحلة التالية: ${result.nextStage || terminal.nextStage || 'غير محددة'}.`,
    `- تفويض D6 الآن: ${result.d6AuthorizationAllowedNow === true ? 'مسموح' : 'غير مسموح'}.`,
    '',
    '### حدود التنفيذ',
    '- لم تُشغّل كتلة Shell أو Python المرسلة.',
    '- لم تُكتب ملفات ولم تُستخدم الشبكة أو npm أو Git تغييري.',
    '- اقتصر التنفيذ على قراءة الملفات والتحقق من SHA-256 وتحليل JSON.'
  ].join('\n');
}

async function runGovernedPublishedEvidenceVerification(message, options = {}) {
  if (!isGovernedPublishedEvidenceVerificationRequest(message)) {
    throw new Error('SHEIKHA_PUBLISHED_EVIDENCE_PROTOCOL_NOT_RECOGNIZED');
  }
  const policyViolations = inspectReadOnlyCapturePolicy(message);
  if (policyViolations.length) {
    throw new Error(
      `SHEIKHA_PUBLISHED_EVIDENCE_POLICY_DENIED:${policyViolations.join(',')}`
    );
  }
  const homeDir = path.resolve(options.homeDir || os.homedir());
  const allowedEvidenceRoot = await fs.realpath(
    path.join(homeDir, 'Backups', 'sheikha')
  );
  const evidenceRoot = await fs.realpath(expandHome(
    parseAssignment(message, 'DIR'),
    homeDir
  ));
  if (!isWithin(allowedEvidenceRoot, evidenceRoot)) {
    throw new Error('SHEIKHA_PUBLISHED_EVIDENCE_ROOT_DENIED');
  }
  const requested = parsePublishedEvidenceFiles(message);
  if (!requested.digestFilename || requested.jsonFiles.length < 2) {
    throw new Error('SHEIKHA_PUBLISHED_EVIDENCE_FILES_INCOMPLETE');
  }
  const digestResults = await verifyDigestList(
    evidenceRoot,
    requested.digestFilename
  );
  if (digestResults.some((entry) => !entry.valid)) {
    throw new Error('SHEIKHA_PUBLISHED_EVIDENCE_DIGEST_MISMATCH');
  }
  const records = {};
  for (const filename of requested.jsonFiles) {
    records[filename] = await readJsonRecord(evidenceRoot, filename);
  }
  const resultFilename = requested.jsonFiles.find((filename) => (
    /(?:^|-)result\.json$/u.test(filename)
  ));
  const terminalFilename = requested.jsonFiles.find((filename) => (
    /terminal(?:-record)?\.json$/u.test(filename)
  ));
  if (!resultFilename || !terminalFilename) {
    throw new Error('SHEIKHA_PUBLISHED_EVIDENCE_RESULT_OR_TERMINAL_MISSING');
  }
  const entries = await fs.readdir(evidenceRoot, { withFileTypes: true });
  const verification = {
    evidenceRoot,
    fileCount: entries.filter((entry) => entry.isFile()).length,
    digestFilename: requested.digestFilename,
    digestCount: digestResults.length,
    validDigestCount: digestResults.filter((entry) => entry.valid).length,
    resultFilename,
    terminalFilename,
    result: records[resultFilename],
    terminal: records[terminalFilename],
    records,
    boundaries: {
      shellUsed: false,
      pythonExecuted: false,
      filesWritten: false,
      networkUsed: false,
      packageCommandExecuted: false,
      gitMutationExecuted: false
    }
  };
  return {
    success: true,
    route: 'SHEIKHA_GOVERNED_PUBLISHED_EVIDENCE_VERIFICATION_V1',
    answer: buildPublishedEvidenceAnswer(verification),
    verification
  };
}

module.exports = {
  CAPTURE_ROUTE,
  DENIED_PATTERNS,
  REQUIRED_MARKERS,
  REQUIRED_RECORDS,
  PRECONDITION_DRIFT_MARKERS,
  buildCaptureAnswer,
  buildPreconditionDriftAnswer,
  buildPublishedEvidenceAnswer,
  canonicalArraySha256,
  inspectReadOnlyCapturePolicy,
  isGovernedPreconditionDriftCaptureRequest,
  isGovernedPublishedEvidenceVerificationRequest,
  isGovernedReadOnlyEvidenceCaptureRequest,
  parseAssignment,
  parseDigestList,
  parsePublishedEvidenceFiles,
  runGovernedPublishedEvidenceVerification,
  runGovernedReadOnlyEvidenceCapture,
  runGovernedPreconditionDriftCapture,
  sha256File,
  verifyDigestList
};
