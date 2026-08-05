'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const PREFLIGHT_ROUTE = 'SHEIKHA_GOVERNED_LOCAL_LAUNCHER_PREFLIGHT_V1';
const MAX_ARTIFACT_BYTES = 2 * 1024 * 1024;
const MAX_CANDIDATES = 500;

function parseAssignment(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(text || '').match(new RegExp(
    `(?:^|\\n)\\s*${escaped}\\s*=\\s*(["'])([^"'\\n]+)\\1`,
    'm'
  ));
  return match ? match[2] : null;
}

function extractInamePatterns(text) {
  return [...String(text || '').matchAll(/-iname\s+(["'])([^"'\n]+)\1/giu)]
    .map((match) => match[2]);
}

function isGovernedLauncherPreflightRequest(message = '') {
  const text = String(message || '');
  const expected = parseAssignment(text, 'EXPECTED_SHA256');
  const patterns = extractInamePatterns(text);
  return /^[a-f0-9]{64}$/iu.test(String(expected || '')) &&
    patterns.some((pattern) => /SHEIKHA_LAUNCH_.*\.sh$/iu.test(pattern)) &&
    /sha256sum\s+["']?\$FILE["']?/iu.test(text) &&
    /bash\s+["']?\$LAUNCHER["']?/iu.test(text);
}

function expandHome(value, homeDir) {
  const raw = String(value || '');
  if (raw === '$HOME') return homeDir;
  if (raw.startsWith('$HOME/')) return path.join(homeDir, raw.slice(6));
  return raw.replace(/^~(?=\/|$)/u, homeDir);
}

async function resolveDownloadDirectory(homeDir, explicitDirectory) {
  if (explicitDirectory) return fs.realpath(explicitDirectory);
  try {
    const config = await fs.readFile(
      path.join(homeDir, '.config', 'user-dirs.dirs'),
      'utf8'
    );
    const match = config.match(/^XDG_DOWNLOAD_DIR="([^"]+)"/mu);
    if (match) return fs.realpath(expandHome(match[1], homeDir));
  } catch {}
  return fs.realpath(path.join(homeDir, 'Downloads'));
}

function globPatternToRegex(pattern) {
  const value = String(pattern || '');
  if (
    !value ||
    value.length > 255 ||
    value.includes('/') ||
    value.includes('\\') ||
    value.includes('..') ||
    !/^[A-Za-z0-9_.()*-]+$/u.test(value)
  ) {
    throw new Error('SHEIKHA_LAUNCHER_PATTERN_DENIED');
  }
  const escaped = value
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'iu');
}

async function sha256File(file) {
  const value = await fs.readFile(file);
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function readBoundedRegularFile(file) {
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_ARTIFACT_BYTES) {
    throw new Error('SHEIKHA_LAUNCHER_ARTIFACT_TYPE_OR_SIZE_DENIED');
  }
  return fs.readFile(file, 'utf8');
}

async function findArtifactsByHash(directory, artifactPattern, expectedSha256) {
  const pattern = globPatternToRegex(artifactPattern);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .slice(0, MAX_CANDIDATES);
  const matches = [];
  for (const entry of candidates) {
    const file = path.join(directory, entry.name);
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_ARTIFACT_BYTES) {
      continue;
    }
    if (await sha256File(file) === expectedSha256.toLowerCase()) {
      matches.push(file);
    }
  }
  return { candidateCount: candidates.length, matches };
}

async function defaultGitRunner(repository, args) {
  const { stdout } = await execFileAsync(
    'git',
    ['-C', repository, ...args],
    {
      encoding: 'utf8',
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
  return String(stdout || '').trimEnd();
}

function nonEmptyLines(value) {
  const text = String(value || '').trimEnd();
  return text ? text.split(/\r?\n/u) : [];
}

function canonicalArraySha256(values) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(values))
    .digest('hex');
}

function parseExpectedNumber(script, name) {
  const value = parseAssignment(script, name);
  return /^\d+$/u.test(String(value || '')) ? Number(value) : null;
}

function hasExecutableLine(content, pattern) {
  return String(content || '').split(/\r?\n/u).some((line) => {
    const value = line.trim();
    if (!value || value.startsWith('#') || value.startsWith('echo ')) {
      return false;
    }
    return pattern.test(value);
  });
}

function inspectEffects(launcher, script) {
  return {
    launcherWritesDownloads:
      /\bunzip\s+-o\b/u.test(launcher) || /\btee\s+["']?\$LOG/u.test(launcher),
    launcherChangesMode: /\bchmod\s+700\s+["']?\$SCRIPT/u.test(launcher),
    nestedBashExecution: /\bbash\s+["']?\$SCRIPT/u.test(launcher),
    evidenceWritesUnderBackupRoot:
      /DESIGN_ROOT=.*Backups|BACKUP_ROOT=.*Backups|mkdir\s+-p\s+["']?\$DESIGN_ROOT/u.test(script),
    temporaryCleanupDetected:
      /rm\s+-rf\s+--\s+["']?\$(?:RUN_TMP|PUBLISH_TMP)/u.test(script),
    networkCommandDetected: hasExecutableLine(
      `${launcher}\n${script}`,
      /^(?:sudo\s+)?(?:curl|wget|ssh|scp|sftp|nc|ncat)\b/u
    ),
    privilegeEscalationDetected: hasExecutableLine(
      `${launcher}\n${script}`,
      /^(?:sudo|pkexec|doas)\b/u
    ),
    packageMutationDetected: hasExecutableLine(
      script,
      /^(?:npm\s+(?:ci|install|uninstall|update)|apt(?:-get)?|dnf|yum)\b/u
    ),
    gitMutationDetected: hasExecutableLine(
      script,
      /^git(?:\s+-C\s+\S+)?\s+(?:add|commit|push|reset|restore|clean|checkout|switch|merge|rebase|tag)\b/u
    )
  };
}

function addCheck(checks, id, expected, actual) {
  if (expected === null || expected === undefined) return;
  checks.push({
    id,
    expected,
    actual,
    matches: String(actual) === String(expected)
  });
}

async function collectPreconditions(script, workspaceRoot, gitRunner) {
  const [
    head,
    tree,
    statusText,
    trackedText,
    untrackedText,
    stagedText
  ] = await Promise.all([
    gitRunner(workspaceRoot, ['rev-parse', 'HEAD']),
    gitRunner(workspaceRoot, ['show', '-s', '--format=%T', 'HEAD']),
    gitRunner(workspaceRoot, ['status', '--porcelain=v1', '--untracked-files=all']),
    gitRunner(workspaceRoot, ['diff', '--name-only', '--']),
    gitRunner(workspaceRoot, ['ls-files', '--others', '--exclude-standard']),
    gitRunner(workspaceRoot, ['diff', '--cached', '--name-only'])
  ]);
  const status = nonEmptyLines(statusText);
  const tracked = nonEmptyLines(trackedText);
  const untracked = nonEmptyLines(untrackedText);
  const staged = nonEmptyLines(stagedText);
  const packageJsonSha256 = await sha256File(path.join(workspaceRoot, 'package.json'));
  const packageLockSha256 = await sha256File(
    path.join(workspaceRoot, 'package-lock.json')
  );
  const actual = {
    head: String(head || '').trim(),
    tree: String(tree || '').trim(),
    statusCount: status.length,
    trackedCount: tracked.length,
    untrackedCount: untracked.length,
    stagedCount: staged.length,
    statusCanonicalSha256: canonicalArraySha256(status),
    trackedCanonicalSha256: canonicalArraySha256(tracked),
    packageJsonSha256,
    packageLockSha256
  };
  const checks = [];
  addCheck(checks, 'MAIN_HEAD', parseAssignment(script, 'EXPECTED_MAIN_HEAD'), actual.head);
  addCheck(checks, 'MAIN_TREE', parseAssignment(script, 'EXPECTED_MAIN_TREE'), actual.tree);
  addCheck(
    checks,
    'STATUS_COUNT',
    parseExpectedNumber(script, 'EXPECTED_STATUS_COUNT'),
    actual.statusCount
  );
  addCheck(
    checks,
    'TRACKED_COUNT',
    parseExpectedNumber(script, 'EXPECTED_TRACKED_COUNT'),
    actual.trackedCount
  );
  addCheck(
    checks,
    'UNTRACKED_COUNT',
    parseExpectedNumber(script, 'EXPECTED_UNTRACKED_COUNT'),
    actual.untrackedCount
  );
  if (/diff\s+--cached\s+--quiet/u.test(script)) {
    addCheck(checks, 'STAGED_COUNT', 0, actual.stagedCount);
  }
  addCheck(
    checks,
    'STATUS_PATHS_SHA256',
    parseAssignment(script, 'EXPECTED_STATUS_PATHS_CANONICAL_SHA256'),
    actual.statusCanonicalSha256
  );
  addCheck(
    checks,
    'TRACKED_PATHS_SHA256',
    parseAssignment(script, 'EXPECTED_TRACKED_PATHS_CANONICAL_SHA256'),
    actual.trackedCanonicalSha256
  );
  addCheck(
    checks,
    'PACKAGE_JSON_SHA256',
    parseAssignment(script, 'EXPECTED_CURRENT_PACKAGE_SHA'),
    actual.packageJsonSha256
  );
  addCheck(
    checks,
    'PACKAGE_LOCK_SHA256',
    parseAssignment(script, 'EXPECTED_CURRENT_LOCK_SHA'),
    actual.packageLockSha256
  );
  return { actual, checks, drift: checks.filter((check) => !check.matches) };
}

function buildPreflightAnswer(result) {
  const mismatchLines = result.preconditions.drift.length
    ? result.preconditions.drift.map((check) => (
        `- ${check.id}: المتوقع ${check.expected}، الحالي ${check.actual}.`
      ))
    : ['- لم يظهر انحراف في الشروط السريعة المقروءة.'];
  return [
    '## فحص مشغّل شيخة المحكوم',
    '',
    `- القرار: ${result.decision}.`,
    `- بصمة المشغّل مطابقة في ${result.launcher.matchCount} نسخة من ${result.launcher.candidateCount} مرشحة.`,
    `- الحزمة الداخلية المطابقة: ${result.bundle.matchCount}.`,
    `- السكربت الداخلي المطابق: ${result.script.matchCount}.`,
    '',
    '### شروط الحالة الحالية',
    ...mismatchLines,
    '',
    '### الآثار المثبتة من المحتوى',
    `- فك حزمة أو كتابة سجل في التنزيلات: ${result.effects.launcherWritesDownloads ? 'نعم' : 'لا'}.`,
    `- كتابة أدلة محلية تحت Backups: ${result.effects.evidenceWritesUnderBackupRoot ? 'نعم' : 'لا'}.`,
    `- شبكة أو رفع صلاحيات: ${result.effects.networkCommandDetected || result.effects.privilegeEscalationDetected ? 'موجود' : 'غير ظاهر'}.`,
    `- npm أو أمر Git تغييري: ${result.effects.packageMutationDetected || result.effects.gitMutationDetected ? 'موجود' : 'غير ظاهر'}.`,
    '',
    '### حدود التنفيذ',
    '- لم أشغّل المشغّل أو السكربت الداخلي.',
    '- لم أفك الحزمة ولم أكتب ملفًا ولم أستخدم الشبكة.',
    result.decision === 'BLOCKED_PRECONDITION_DRIFT'
      ? '- يلزم إصدار عقد جديد مبني على الحالة الحالية؛ لا تُعدّل البصمات التاريخية ولا تُخفّض الأعداد يدويًا.'
      : '- التنفيذ ينتظر بوابة موافقة بشرية منفصلة بعد اكتمال جميع الشروط.'
  ].join('\n');
}

async function runGovernedLauncherPreflight(message, options = {}) {
  if (!isGovernedLauncherPreflightRequest(message)) {
    throw new Error('SHEIKHA_LAUNCHER_PREFLIGHT_PROTOCOL_NOT_RECOGNIZED');
  }
  if (!options.workspaceRoot) {
    throw new Error('SHEIKHA_LAUNCHER_PREFLIGHT_WORKSPACE_REQUIRED');
  }
  const homeDir = path.resolve(options.homeDir || os.homedir());
  const downloadDirectory = await resolveDownloadDirectory(
    homeDir,
    options.downloadDirectory
  );
  const launcherPattern = extractInamePatterns(message)
    .find((pattern) => /SHEIKHA_LAUNCH_.*\.sh$/iu.test(pattern));
  const launcherSha256 = parseAssignment(message, 'EXPECTED_SHA256');
  const launcherLookup = await findArtifactsByHash(
    downloadDirectory,
    launcherPattern,
    launcherSha256
  );
  if (!launcherLookup.matches.length) {
    throw new Error('SHEIKHA_LAUNCHER_NOT_FOUND_WITH_EXPECTED_SHA256');
  }
  const launcherContent = await readBoundedRegularFile(launcherLookup.matches[0]);
  const nestedPatterns = extractInamePatterns(launcherContent);
  const bundlePattern = nestedPatterns.find((pattern) => /\.zip$/iu.test(pattern));
  const scriptPattern = nestedPatterns.find((pattern) => /\.sh$/iu.test(pattern));
  const bundleSha256 = parseAssignment(launcherContent, 'EXPECTED_BUNDLE_SHA256');
  const scriptSha256 = parseAssignment(launcherContent, 'EXPECTED_SCRIPT_SHA256');
  const emptyLookup = { candidateCount: 0, matches: [] };
  const bundleLookup = bundlePattern && /^[a-f0-9]{64}$/iu.test(bundleSha256 || '')
    ? await findArtifactsByHash(downloadDirectory, bundlePattern, bundleSha256)
    : emptyLookup;
  const scriptLookup = scriptPattern && /^[a-f0-9]{64}$/iu.test(scriptSha256 || '')
    ? await findArtifactsByHash(downloadDirectory, scriptPattern, scriptSha256)
    : emptyLookup;
  const scriptContent = scriptLookup.matches.length
    ? await readBoundedRegularFile(scriptLookup.matches[0])
    : '';
  const workspaceRoot = await fs.realpath(options.workspaceRoot);
  const requestedWorkspace = parseAssignment(scriptContent, 'MAIN_CHECKOUT');
  if (requestedWorkspace) {
    const requestedWorkspaceRoot = await fs.realpath(
      expandHome(requestedWorkspace, homeDir)
    );
    if (requestedWorkspaceRoot !== workspaceRoot) {
      throw new Error('SHEIKHA_LAUNCHER_PREFLIGHT_WORKSPACE_MISMATCH');
    }
  }
  const preconditions = scriptContent
    ? await collectPreconditions(
        scriptContent,
        workspaceRoot,
        options.gitRunner || defaultGitRunner
      )
    : { actual: {}, checks: [], drift: [] };
  const effects = inspectEffects(launcherContent, scriptContent);
  const securityGateFailed = effects.networkCommandDetected ||
    effects.privilegeEscalationDetected ||
    effects.packageMutationDetected ||
    effects.gitMutationDetected;
  const decision = securityGateFailed
    ? 'SECURITY_GATE_FAILED'
    : !bundleLookup.matches.length || !scriptLookup.matches.length
      ? 'NESTED_ARTIFACT_MISSING'
      : preconditions.drift.length
        ? 'BLOCKED_PRECONDITION_DRIFT'
        : 'PREFLIGHT_VERIFIED_AWAITING_HUMAN_EXECUTION_GATE';
  const result = {
    success: true,
    route: PREFLIGHT_ROUTE,
    decision,
    launcher: {
      sha256: launcherSha256,
      candidateCount: launcherLookup.candidateCount,
      matchCount: launcherLookup.matches.length,
      selectedName: path.basename(launcherLookup.matches[0])
    },
    bundle: {
      sha256: bundleSha256 || null,
      candidateCount: bundleLookup.candidateCount,
      matchCount: bundleLookup.matches.length
    },
    script: {
      sha256: scriptSha256 || null,
      candidateCount: scriptLookup.candidateCount,
      matchCount: scriptLookup.matches.length
    },
    effects,
    preconditions,
    boundaries: {
      launcherExecuted: false,
      shellUsed: false,
      archiveExtracted: false,
      filesWritten: false,
      networkUsed: false,
      gitMutationExecuted: false,
      automaticExecutionAllowed: false
    }
  };
  return { ...result, answer: buildPreflightAnswer(result) };
}

module.exports = {
  PREFLIGHT_ROUTE,
  buildPreflightAnswer,
  canonicalArraySha256,
  extractInamePatterns,
  findArtifactsByHash,
  globPatternToRegex,
  inspectEffects,
  isGovernedLauncherPreflightRequest,
  parseAssignment,
  resolveDownloadDirectory,
  runGovernedLauncherPreflight
};
