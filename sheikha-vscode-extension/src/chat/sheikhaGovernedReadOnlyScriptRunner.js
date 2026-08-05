'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const READ_ONLY_SCRIPT_ROUTE =
  'SHEIKHA_GOVERNED_READ_ONLY_SCRIPT_SANDBOX_V1';
const MAX_SCRIPT_BYTES = 2 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;
const SCRIPT_TIMEOUT_MS = 90_000;

const SHELL_ENVELOPE_DENIALS = Object.freeze([
  ['PRIVILEGE_ESCALATION', /(?:^|[\s;(])(?:sudo|pkexec|doas)\b|\bsu\s+-c\b/imu],
  ['NETWORK_COMMAND', /(?:^|[\s;(])(?:curl|wget|ssh|scp|sftp|telnet|ncat|nc)\b|\/dev\/tcp/imu],
  ['PACKAGE_MUTATION', /\b(?:apt|apt-get|dnf|yum|pacman|zypper)\b|\bnpm\s+(?:ci|install|uninstall|update)\b/imu],
  ['FILESYSTEM_MUTATION', /(?:^|[;\n(])\s*(?:rm|mv|cp|install|mkdir|touch|chmod|chown|truncate|tee|ln)\b/imu],
  ['GIT_MUTATION', /\bgit\b[^\n]*(?:\s|^)(?:add|commit|push|reset|clean|checkout|switch|merge|rebase|cherry-pick|tag)\b/imu],
  ['PROCESS_MUTATION', /(?:^|[;\n(])\s*(?:kill|pkill|killall)\b/imu],
  ['DEVICE_MUTATION', /(?:^|[;\n(])\s*(?:dd|mkfs(?:\.[a-z0-9]+)?|mount|umount|parted|fdisk)\b/imu],
  ['DYNAMIC_SHELL', /(?:^|[;\n(])\s*(?:eval|source|exec)\b/imu],
  ['OUTPUT_REDIRECTION', /(^|[^<])>{1,2}\s*[^&]/mu]
]);

function parseReadOnlyScriptRequest(message = '') {
  const text = String(message || '');
  const expectedMatch = text.match(
    /(?:^|\n)\s*EXPECTED(?:_SCRIPT)?(?:_SHA256)?\s*=\s*["']([a-f0-9]{64})["']/imu
  );
  const patternMatch = text.match(
    /-iname\s+["'](SHEIKHA_READ_ONLY_[A-Za-z0-9_.*()\\-]+\.sh)["']/imu
  );
  const candidateMatch = text.match(
    /sha256sum\s+["']?\$([A-Za-z_][A-Za-z0-9_]*)["']?/imu
  );
  let filenamePattern = null;
  if (patternMatch) {
    try {
      filenamePattern = normalizeReadOnlyFilenamePattern(patternMatch[1]);
    } catch {
      filenamePattern = null;
    }
  }
  return {
    expectedSha256: expectedMatch ? expectedMatch[1].toLowerCase() : null,
    rawFilenamePattern: patternMatch ? patternMatch[1] : null,
    filenamePattern,
    candidateVariable: candidateMatch ? candidateMatch[1] : null,
    explicitExecutionRequested: /(?:^|[;\n(])\s*bash\s+["']?\$SCRIPT["']?\s*(?:$|[;)])/imu.test(text)
  };
}

function isGovernedReadOnlyScriptRequest(message = '') {
  const parsed = parseReadOnlyScriptRequest(message);
  const text = String(message || '');
  return Boolean(
    parsed.expectedSha256 &&
    parsed.filenamePattern &&
    parsed.candidateVariable &&
    parsed.explicitExecutionRequested &&
    /(?:^|\n)\s*SCRIPT\s*=\s*["']["']/mu.test(text) &&
    /find\s+["']?\$DOWNLOAD_DIR["']?\s+-maxdepth\s+1\s+-type\s+f/imu.test(text)
  );
}

function normalizeReadOnlyFilenamePattern(pattern) {
  const normalized = String(pattern || '').replace(/\\([_.()-])/gu, '$1');
  if (/\\/u.test(normalized)) {
    throw new Error('SHEIKHA_READ_ONLY_SCRIPT_PATTERN_ESCAPE_DENIED');
  }
  return normalized;
}

function globPatternToRegex(pattern) {
  const normalized = normalizeReadOnlyFilenamePattern(pattern);
  const wildcardCount = (normalized.match(/\*/gu) || []).length;
  if (
    !/^SHEIKHA_READ_ONLY_[A-Za-z0-9_.*()-]+\.sh$/u.test(normalized) ||
    normalized.includes('..') ||
    wildcardCount < 1 ||
    wildcardCount > 4
  ) {
    throw new Error('SHEIKHA_READ_ONLY_SCRIPT_PATTERN_DENIED');
  }
  const source = normalized
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('.*');
  return new RegExp(`^${source}$`, 'iu');
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

async function sha256File(filename) {
  const content = await fs.readFile(filename);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function shellEnvelope(script) {
  const output = [];
  let terminator = null;
  for (const line of String(script || '').split(/\r?\n/u)) {
    if (terminator) {
      if (line === terminator || line.replace(/^\t+/u, '') === terminator) {
        terminator = null;
      }
      continue;
    }
    output.push(line);
    const match = line.match(
      /<<-?\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))/u
    );
    if (match) terminator = match[1] || match[2] || match[3];
  }
  return output.join('\n');
}

function inspectShellEnvelope(script) {
  const envelope = shellEnvelope(script);
  return SHELL_ENVELOPE_DENIALS
    .filter(([, pattern]) => pattern.test(envelope))
    .map(([id]) => id);
}

async function resolveDownloadDirectory(homeDir, configuredDirectory) {
  if (configuredDirectory) return fs.realpath(configuredDirectory);
  try {
    const { stdout } = await execFileAsync('xdg-user-dir', ['DOWNLOAD'], {
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 64 * 1024
    });
    const candidate = String(stdout || '').trim();
    if (candidate) return fs.realpath(candidate);
  } catch {
    // Fall through to conventional local directories.
  }
  for (const candidate of [
    path.join(homeDir, 'Downloads'),
    path.join(homeDir, '\u0627\u0644\u062a\u0646\u0632\u064a\u0644\u0627\u062a')
  ]) {
    try {
      return await fs.realpath(candidate);
    } catch {
      // Try the next local convention.
    }
  }
  throw new Error('SHEIKHA_READ_ONLY_SCRIPT_DOWNLOAD_DIRECTORY_MISSING');
}

async function listMatchingScripts(downloadRoot, filenamePattern) {
  const matcher = globPatternToRegex(filenamePattern);
  const entries = await fs.readdir(downloadRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && matcher.test(entry.name))
    .map((entry) => path.join(downloadRoot, entry.name))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

function parentDirectoriesWithinHome(target, homeDir) {
  if (!isWithin(homeDir, target)) return [];
  const relative = path.relative(homeDir, target);
  const parts = relative.split(path.sep).filter(Boolean);
  const directories = [];
  let cursor = homeDir;
  for (const part of parts.slice(0, -1)) {
    cursor = path.join(cursor, part);
    directories.push(cursor);
  }
  return directories;
}

function buildSandboxArguments({
  scriptPath,
  workspaceRoot,
  homeDir,
  backupRoot = null
}) {
  const scriptInsideSandbox = '/run/sheikha-read-only-input.sh';
  const args = [
    '--ro-bind', '/', '/',
    '--dev', '/dev',
    '--proc', '/proc',
    '--tmpfs', '/tmp',
    '--tmpfs', '/run',
    '--tmpfs', homeDir
  ];
  const mounts = [workspaceRoot];
  if (backupRoot) mounts.push(backupRoot);
  const created = new Set();
  for (const mount of mounts) {
    for (const directory of parentDirectoriesWithinHome(mount, homeDir)) {
      if (!created.has(directory)) {
        args.push('--dir', directory);
        created.add(directory);
      }
    }
    args.push('--ro-bind', mount, mount);
  }
  args.push(
    '--ro-bind', scriptPath, scriptInsideSandbox,
    '--remount-ro', '/run',
    '--unshare-net',
    '--unshare-ipc',
    '--unshare-uts',
    '--die-with-parent',
    '--new-session',
    '--clearenv',
    '--setenv', 'HOME', homeDir,
    '--setenv', 'PATH', '/usr/local/bin:/usr/bin:/bin',
    '--setenv', 'LANG', 'C.UTF-8',
    '--setenv', 'LC_ALL', 'C.UTF-8',
    '--setenv', 'GIT_OPTIONAL_LOCKS', '0',
    '--setenv', 'GIT_PAGER', 'cat',
    '--setenv', 'PAGER', 'cat',
    '--setenv', 'GIT_TERMINAL_PROMPT', '0',
    '--setenv', 'PYTHONDONTWRITEBYTECODE', '1',
    '--chdir', workspaceRoot,
    '/usr/bin/bash', '--noprofile', '--norc', scriptInsideSandbox
  );
  return args;
}

async function defaultSyntaxChecker(scriptPath) {
  try {
    await execFileAsync('/usr/bin/bash', ['-n', scriptPath], {
      encoding: 'utf8',
      timeout: 10_000,
      maxBuffer: 256 * 1024
    });
    return { ok: true, error: null };
  } catch (error) {
    return {
      ok: false,
      error: String(error.stderr || error.message || 'bash -n failed').trim()
    };
  }
}

async function defaultSandboxRunner(context) {
  const args = buildSandboxArguments(context);
  try {
    const { stdout, stderr } = await execFileAsync('/usr/bin/bwrap', args, {
      encoding: 'utf8',
      timeout: SCRIPT_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES
    });
    return {
      exitCode: 0,
      signal: null,
      stdout: String(stdout || ''),
      stderr: String(stderr || '')
    };
  } catch (error) {
    const stderr = String(error.stderr || '').trim();
    const internalFailure = !Number.isInteger(error.code)
      ? String(error.message || '').trim()
      : '';
    return {
      exitCode: Number.isInteger(error.code) ? error.code : null,
      signal: error.signal || null,
      stdout: String(error.stdout || ''),
      stderr: stderr || internalFailure
    };
  }
}

function parseOutputMarkers(stdout) {
  const markers = {};
  for (const line of String(stdout || '').split(/\r?\n/u)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/u);
    if (match) markers[match[1]] = match[2];
  }
  return markers;
}

function extractLeadingJsonObject(stdout) {
  const text = String(stdout || '');
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function markerBoolean(markers, matchers) {
  for (const [key, rawValue] of Object.entries(markers || {})) {
    const matched = matchers.some((matcher) => (
      typeof matcher === 'string' ? key === matcher : matcher.test(key)
    ));
    if (!matched) continue;
    const value = String(rawValue || '').trim().toLowerCase();
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return null;
}

function firstBoolean(...values) {
  return values.find((value) => typeof value === 'boolean') ?? null;
}

function arabicBoolean(value) {
  return value === true ? 'نعم' : value === false ? 'لا' : null;
}

function buildGovernedInterpretation({ decision, stable, eligible, markers }) {
  const activeWriterReview = markerBoolean(
    markers,
    ['ACTIVE_WRITER_ATTRIBUTION_REVIEW_REQUIRED']
  );
  const writerStopAuthorized = markerBoolean(
    markers,
    ['WORKTREE_WRITER_STOP_AUTHORIZED']
  );
  const lines = [];
  if (stable === true && eligible === false) {
    lines.push(
      '- الالتقاط ثابت، لكن هذا لا يمنح أهلية إعادة الربط؛ بوابة الأهلية ما زالت مغلقة.'
    );
  }
  if (stable === false) {
    lines.push('- تغيرت مساحة العمل أثناء القياس؛ لا تعتمد هذه اللقطة كأساس لإعادة الربط.');
  }
  if (activeWriterReview === true) {
    lines.push('- يلزم تحديد الكاتب النشط ومراجعة أثره قبل إنشاء تصميم إعادة ربط جديد.');
  }
  if (writerStopAuthorized === false) {
    lines.push('- إيقاف الكاتب غير مصرح به؛ لم يُوقف الشات أي عملية.');
  }
  if (/DRIFT_REQUIRES_(?:FRESH_)?REVIEW/u.test(String(decision || ''))) {
    lines.push('- الإجراء الآمن التالي: مراجعة الانحراف الموثق فقط، دون I3 أو D6 أو تعديل لمساحة العمل.');
  }
  return lines;
}

function buildReadOnlyScriptAnswer(result) {
  if (!result.scriptMatched) {
    return [
      '## تحقق السكربت القرائي المحكوم',
      '',
      '- الحالة: `SCRIPT_NOT_FOUND`.',
      `- النمط المطلوب: \`${result.filenamePattern}\`.`,
      `- SHA-256 المطلوب: \`${result.expectedSha256}\`.`,
      `- الملفات المطابقة للاسم: ${result.candidateCount}.`,
      '- لم يُنفذ أي سكربت ولم يُستخدم Shell.',
      '- نزّل الملف الصحيح إلى مجلد التنزيلات ثم أعد الطلب نفسه.'
    ].join('\n');
  }
  if (result.policyViolations.length || !result.syntaxValid) {
    return [
      '## تحقق السكربت القرائي المحكوم',
      '',
      '- الحالة: `READ_ONLY_POLICY_DENIED`.',
      `- الملف: \`${result.scriptName}\`.`,
      `- SHA-256: \`${result.actualSha256}\` (مطابق).`,
      `- سلامة الصياغة: ${result.syntaxValid ? 'صحيحة' : 'غير صحيحة'}.`,
      `- مخالفات الغلاف: ${result.policyViolations.join(', ') || 'لا توجد'}.`,
      '- لم يُنفذ السكربت.'
    ].join('\n');
  }
  const parsed = result.parsedOutput || {};
  const current = parsed.current || parsed;
  const countsAvailable = [
    current.statusEntryCount,
    current.trackedDiffPathCount,
    current.untrackedPathCount,
    current.stagedPathCount
  ].every((value) => Number.isInteger(value));
  const stable = firstBoolean(
    current.stableDuringCapture,
    current.stableDuringDesign,
    markerBoolean(result.markers, [/^CURRENT_.*_STATE_STABLE$/u])
  );
  const eligible = firstBoolean(
    parsed.eligibleForNewReadOnlyPreI3RebindingDesign,
    parsed.i3ReadOnlyAuthorizationDesignInputEligible,
    markerBoolean(result.markers, [
      /READ_ONLY_REBINDING_DESIGN_ELIGIBLE$/u,
      'I3_READ_ONLY_DESIGN_INPUT_ELIGIBLE',
      'NEW_READ_ONLY_PRE_I3_REBINDING_DESIGN_ELIGIBLE'
    ])
  );
  const summaryFacts = [
    `- القرار: ${parsed.decision || 'لم يُصدر السكربت قرارًا مهيكلًا'}.`
  ];
  if (parsed.nextStage) summaryFacts.push(`- المرحلة التالية: ${parsed.nextStage}.`);
  if (countsAvailable) {
    summaryFacts.push(
      `- Status/Tracked/Untracked/Staged: ${current.statusEntryCount}/${current.trackedDiffPathCount}/${current.untrackedPathCount}/${current.stagedPathCount}.`
    );
  }
  const booleanFacts = [
    ['الحالة ثابتة أثناء الالتقاط', stable],
    ['أهلية تصميم إعادة الربط القرائي', eligible],
    ['HEAD مطابق', firstBoolean(
      current.headMatchesExpected,
      markerBoolean(result.markers, [/^HEAD_.*MATCH(?:ES|ED).*EXPECTED$/u])
    )],
    ['Tree مطابق', firstBoolean(
      current.treeMatchesExpected,
      markerBoolean(result.markers, [/^TREE_.*MATCH(?:ES|ED).*EXPECTED$/u])
    )],
    ['المحتوى المستهدف ثابت', firstBoolean(
      parsed.targetContentMatchesExpectedAttributionCapture,
      markerBoolean(result.markers, ['TARGET_CONTENT_STABLE'])
    )],
    ['سبب الاستبعاد الوظيفي مثبت', firstBoolean(
      parsed.functionalReasonConfirmed,
      markerBoolean(result.markers, ['FUNCTIONAL_REASON_CONFIRMED'])
    )],
    ['مراجعة الكاتب النشط مطلوبة', markerBoolean(
      result.markers,
      ['ACTIVE_WRITER_ATTRIBUTION_REVIEW_REQUIRED']
    )],
    ['إيقاف كاتب مساحة العمل مصرح', markerBoolean(
      result.markers,
      ['WORKTREE_WRITER_STOP_AUTHORIZED']
    )],
    ['تنفيذ معالجة I3 الآن مسموح', markerBoolean(
      result.markers,
      ['I3_REMEDIATION_EXECUTION_ALLOWED_NOW']
    )],
    ['تفويض D6 الآن مسموح', markerBoolean(
      result.markers,
      ['D6_AUTHORIZATION_ALLOWED_NOW']
    )]
  ];
  for (const [label, value] of booleanFacts) {
    const formatted = arabicBoolean(value);
    if (formatted) summaryFacts.push(`- ${label}: ${formatted}.`);
  }
  const interpretation = buildGovernedInterpretation({
    decision: parsed.decision,
    stable,
    eligible,
    markers: result.markers
  });
  const markerLines = Object.entries(result.markers)
    .slice(-20)
    .map(([key, value]) => `- ${key}=\`${value}\``);
  return [
    '## تنفيذ السكربت القرائي المحكوم',
    '',
    `- الحالة: \`${result.status}\`.`,
    `- الملف: \`${result.scriptName}\`.`,
    `- SHA-256: \`${result.actualSha256}\` (مطابق).`,
    `- النسخ المطابقة للبصمة: ${result.matchedCount}.`,
    `- رمز الخروج: ${result.exitCode ?? 'غير متاح'}.`,
    '- العزل: جذر ومساحة مشروع وأدلة للقراءة فقط، منزل المستخدم محجوب، الشبكة مفصولة، و`/tmp` مؤقت.',
    '',
    '### النتيجة',
    ...summaryFacts,
    ...(interpretation.length ? ['', '### التفسير والإجراء التالي', ...interpretation] : []),
    '',
    '### العلامات النهائية',
    ...(markerLines.length ? markerLines : ['- لا توجد علامات نهائية مهيكلة.']),
    '',
    '### حدود التنفيذ',
    '- لم يُمنح السكربت وصول كتابة إلى المشروع أو المنزل أو الأدلة.',
    '- لم تُتح شبكة ولم تُمنح صلاحيات مرتفعة.',
    '- لم تُنفذ أوامر Git تغييرية بواسطة محرك الشات.'
  ].join('\n');
}

async function runGovernedReadOnlyScript(message, options = {}) {
  if (!isGovernedReadOnlyScriptRequest(message)) {
    throw new Error('SHEIKHA_READ_ONLY_SCRIPT_PROTOCOL_NOT_RECOGNIZED');
  }
  if (!options.workspaceRoot) {
    throw new Error('SHEIKHA_READ_ONLY_SCRIPT_WORKSPACE_REQUIRED');
  }
  const parsedRequest = parseReadOnlyScriptRequest(message);
  const homeDir = await fs.realpath(options.homeDir || os.homedir());
  const workspaceRoot = await fs.realpath(options.workspaceRoot);
  if (!isWithin(homeDir, workspaceRoot)) {
    throw new Error('SHEIKHA_READ_ONLY_SCRIPT_WORKSPACE_OUTSIDE_HOME');
  }
  const downloadRoot = await resolveDownloadDirectory(
    homeDir,
    options.downloadDir
  );
  const candidatePaths = await listMatchingScripts(
    downloadRoot,
    parsedRequest.filenamePattern
  );
  const candidates = [];
  for (const candidatePath of candidatePaths) {
    const stat = await fs.stat(candidatePath);
    if (!stat.isFile() || stat.size > MAX_SCRIPT_BYTES) continue;
    candidates.push({
      path: candidatePath,
      name: path.basename(candidatePath),
      sizeBytes: stat.size,
      sha256: await sha256File(candidatePath)
    });
  }
  const matched = candidates.filter((candidate) => (
    candidate.sha256 === parsedRequest.expectedSha256
  ));
  const preferredName = parsedRequest.filenamePattern.replace(/\*/gu, '');
  const selected = matched.find((candidate) => candidate.name === preferredName) ||
    [...matched].sort((left, right) => (
      left.name.length - right.name.length || left.name.localeCompare(right.name, 'en')
    ))[0];
  const baseResult = {
    route: READ_ONLY_SCRIPT_ROUTE,
    expectedSha256: parsedRequest.expectedSha256,
    filenamePattern: parsedRequest.filenamePattern,
    downloadRoot,
    candidateCount: candidates.length,
    matchedCount: matched.length,
    scriptMatched: Boolean(selected),
    scriptName: selected?.name || null,
    scriptPath: selected?.path || null,
    actualSha256: selected?.sha256 || null,
    sizeBytes: selected?.sizeBytes || null,
    explicitExecutionRequested: parsedRequest.explicitExecutionRequested,
    boundaries: {
      bubblewrapRequired: true,
      rootReadOnly: true,
      workspaceReadOnly: true,
      evidenceReadOnly: true,
      homeHidden: true,
      networkUnshared: true,
      sudoUsed: false,
      hostFilesWritten: false,
      gitMutationExecutedByAdapter: false
    }
  };
  if (!selected) {
    const result = {
      ...baseResult,
      success: true,
      status: 'SCRIPT_NOT_FOUND',
      executed: false,
      syntaxValid: null,
      policyViolations: [],
      markers: {},
      parsedOutput: null
    };
    return { ...result, answer: buildReadOnlyScriptAnswer(result) };
  }
  const script = await fs.readFile(selected.path, 'utf8');
  const policyViolations = inspectShellEnvelope(script);
  const syntaxChecker = options.syntaxChecker || defaultSyntaxChecker;
  const syntax = await syntaxChecker(selected.path);
  if (policyViolations.length || syntax.ok !== true) {
    const result = {
      ...baseResult,
      success: false,
      status: 'READ_ONLY_POLICY_DENIED',
      executed: false,
      syntaxValid: syntax.ok === true,
      syntaxError: syntax.error || null,
      policyViolations,
      markers: {},
      parsedOutput: null
    };
    return { ...result, answer: buildReadOnlyScriptAnswer(result) };
  }
  let backupRoot = null;
  try {
    backupRoot = await fs.realpath(path.join(homeDir, 'Backups', 'sheikha'));
  } catch {
    // Evidence mount is optional for scripts that only inspect the workspace.
  }
  const sandboxRunner = options.sandboxRunner || defaultSandboxRunner;
  const execution = await sandboxRunner({
    scriptPath: selected.path,
    workspaceRoot,
    homeDir,
    backupRoot
  });
  const stdout = String(execution.stdout || '');
  const stderr = String(execution.stderr || '');
  const exitCode = execution.exitCode;
  const result = {
    ...baseResult,
    success: exitCode === 0,
    status: exitCode === 0
      ? 'READ_ONLY_SCRIPT_EXECUTED'
      : 'READ_ONLY_SCRIPT_COMPLETED_WITH_NONZERO_EXIT',
    executed: true,
    syntaxValid: true,
    syntaxError: null,
    policyViolations,
    exitCode,
    signal: execution.signal || null,
    stdoutSha256: crypto.createHash('sha256').update(stdout).digest('hex'),
    stderrSha256: crypto.createHash('sha256').update(stderr).digest('hex'),
    stdoutSizeBytes: Buffer.byteLength(stdout),
    stderrSizeBytes: Buffer.byteLength(stderr),
    stderrPreview: stderr.slice(0, 2000),
    markers: parseOutputMarkers(stdout),
    parsedOutput: extractLeadingJsonObject(stdout)
  };
  return { ...result, answer: buildReadOnlyScriptAnswer(result) };
}

module.exports = {
  MAX_SCRIPT_BYTES,
  READ_ONLY_SCRIPT_ROUTE,
  SHELL_ENVELOPE_DENIALS,
  buildReadOnlyScriptAnswer,
  buildGovernedInterpretation,
  buildSandboxArguments,
  defaultSandboxRunner,
  defaultSyntaxChecker,
  extractLeadingJsonObject,
  firstBoolean,
  globPatternToRegex,
  inspectShellEnvelope,
  isGovernedReadOnlyScriptRequest,
  markerBoolean,
  normalizeReadOnlyFilenamePattern,
  parseOutputMarkers,
  parseReadOnlyScriptRequest,
  runGovernedReadOnlyScript,
  shellEnvelope
};
