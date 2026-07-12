#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const {
  DISTRIBUTION_ROOT,
  ROOT,
  readJson,
  resetGeneratedDir,
  run,
  setTreeTimestamp,
  sha256File,
  writeJson
} = require('../common/distribution-utils');
const {
  SECRET_PATTERNS,
  scanStageForSecrets,
  stageRuntimeSource
} = require('../common/source-staging-engine');

const SYSTEM = 'SHEIKHA_LINUX_PACKAGE_NATIVE_VERIFICATION_V5';
const VERSION = '1.0.51';
const REPORT_ROOT = path.join(ROOT, 'runtime', 'distribution', 'v5');
const EVIDENCE_ROOT = path.join(REPORT_ROOT, 'evidence');
const MAIN_REPORT = path.join(REPORT_ROOT, 'sheikha-linux-package-native-verification-v5-report.json');
const V2_REPORT = path.join(ROOT, 'runtime', 'distribution', 'v2', 'sheikha-universal-delivery-v2-report.json');
const V2_TAR = path.join(
  DISTRIBUTION_ROOT,
  'artifacts',
  'v2',
  VERSION,
  'artifacts',
  `sheikha-${VERSION}-linux-x86_64.tar.gz`
);
const V2_DEB = path.join(
  DISTRIBUTION_ROOT,
  'artifacts',
  'v2',
  VERSION,
  'artifacts',
  `sheikha-${VERSION}-linux-amd64.deb`
);
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;
const STARTUP_TIMEOUT_MS = 120_000;
const SHUTDOWN_TIMEOUT_MS = 15_000;
const PORT_CLOSE_TIMEOUT_MS = 10_000;
const CANDIDATE_SOURCE_FILES = Object.freeze([
  'server.js',
  'bin/sheikha',
  'distribution/common/source-staging-engine.js'
]);
const PACKAGED_RUNTIME_FILES = Object.freeze([
  'server.js',
  'bin/sheikha',
  'routes/pr-governance/status.routes.js',
  'routes/runtime/verification/status.routes.js',
  'runtime/distribution/v2/sheikha-universal-delivery-v2-status.js',
  'runtime/distribution/v3/sheikha-native-delivery-v3-status.js',
  'runtime/distribution/v3.1/sheikha-native-desktop-v31-status.js',
  'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
  'runtime/snapshots/sheikha-snapshot-engine.js',
  'tools/activation/sheikha-unified-apex-manifest-v1.json',
  'knowledge/quranic-atlas/sheikha-quranic-architectural-atlas.json',
  'knowledge/quranic-operating-system/sheikha-quranic-operating-system-atlas-omega-v1.json',
  'knowledge/unified-graph/sheikha-unified-graph-fabric-v1.json',
  'sheikha-language/compiler/lexer.js'
]);

function sha256Text(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeTextAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, value, 'utf8');
  fs.renameSync(temporary, filePath);
}

function writeJsonAtomic(filePath, value) {
  writeTextAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function appendBounded(current, chunk) {
  if (Buffer.byteLength(current, 'utf8') >= MAX_OUTPUT_BYTES) return current;
  const next = current + String(chunk || '');
  if (Buffer.byteLength(next, 'utf8') <= MAX_OUTPUT_BYTES) return next;
  return Buffer.from(next, 'utf8').subarray(0, MAX_OUTPUT_BYTES).toString('utf8');
}

function sourceState() {
  const head = run('git', ['rev-parse', 'HEAD']).stdout;
  const scopedDiff = run('git', ['diff', '--', ...CANDIDATE_SOURCE_FILES], {
    allowFailure: true
  }).stdout;
  const sourceFiles = CANDIDATE_SOURCE_FILES.map((relative) => ({
    path: relative,
    sha256: sha256File(path.join(ROOT, relative))
  }));
  const fingerprint = sha256Text([
    head,
    ...sourceFiles.map((item) => `${item.path}:${item.sha256}`),
    scopedDiff
  ].join('\n')).slice(0, 20);
  return {
    head,
    sourceCommitted: scopedDiff.length === 0,
    scopedDiffSha256: sha256Text(scopedDiff),
    sourceFiles,
    fingerprint,
    sourceMode: scopedDiff.length === 0
      ? 'COMMITTED_HEAD'
      : 'HEAD_PLUS_EXPLICIT_SERVER_AND_STAGING_PATCH',
    unrelatedWorktreeChangesIncluded: false
  };
}

function candidatePaths(source) {
  const releaseName = `${VERSION}-candidate-${source.fingerprint}`;
  const releaseRoot = path.join(DISTRIBUTION_ROOT, 'artifacts', 'v5', releaseName);
  const artifactName = `sheikha-${VERSION}-linux-x86_64-v5-${source.fingerprint}.tar.gz`;
  return {
    releaseName,
    releaseRoot,
    artifactName,
    artifactPath: path.join(releaseRoot, 'artifacts', artifactName),
    manifestPath: path.join(releaseRoot, 'candidate-manifest.json'),
    stagingRoot: path.join(DISTRIBUTION_ROOT, 'staging', 'v5', releaseName)
  };
}

function verifyExistingCandidate(paths, source) {
  if (!fs.existsSync(paths.releaseRoot)) return null;
  if (!fs.existsSync(paths.manifestPath) || !fs.existsSync(paths.artifactPath)) {
    throw new Error(`Candidate release exists but is incomplete: ${paths.releaseRoot}`);
  }
  const manifest = readJson(paths.manifestPath);
  const artifactSha256 = sha256File(paths.artifactPath);
  if (manifest.source?.fingerprint !== source.fingerprint || manifest.artifact?.sha256 !== artifactSha256) {
    throw new Error(`Candidate release exists and will not be overwritten: ${paths.releaseRoot}`);
  }
  return { manifest, reused: true };
}

function buildCandidate(source) {
  const paths = candidatePaths(source);
  const existing = verifyExistingCandidate(paths, source);
  if (existing) return { ...paths, ...existing.manifest, reused: true };

  const target = {
    id: 'linux-tar-x86_64',
    artifactName: paths.artifactName,
    version: VERSION
  };
  const context = {
    version: VERSION,
    stagingRoot: paths.stagingRoot
  };
  const stage = stageRuntimeSource(context, target);
  ['server.js', 'bin/sheikha'].forEach((relative) => {
    const targetPath = path.join(stage.root, relative);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(path.join(ROOT, relative), targetPath);
  });
  fs.chmodSync(path.join(stage.root, 'bin', 'sheikha'), 0o755);
  setTreeTimestamp(stage.root, 0);
  const secretScan = scanStageForSecrets(stage.root);
  if (!secretScan.passed) {
    throw new Error(`Candidate secret scan failed: ${JSON.stringify(secretScan.findings)}`);
  }

  fs.mkdirSync(path.join(paths.releaseRoot, 'artifacts'), { recursive: true });
  run('tar', [
    '--sort=name',
    '--mtime=@0',
    '--owner=0',
    '--group=0',
    '--numeric-owner',
    '-czf',
    paths.artifactPath,
    '-C',
    stage.parent,
    stage.rootName
  ], { timeout: 600_000 });
  const artifact = {
    path: path.relative(ROOT, paths.artifactPath),
    bytes: fs.statSync(paths.artifactPath).size,
    sha256: sha256File(paths.artifactPath)
  };
  const manifest = {
    schemaVersion: '5.0.0',
    system: SYSTEM,
    status: 'CANDIDATE_BUILT_NOT_YET_NATIVE_VERIFIED',
    version: VERSION,
    releaseName: paths.releaseName,
    source,
    artifact,
    secretScan,
    silentOverwriteAllowed: false,
    githubRequired: false,
    externalPublishing: false
  };
  writeJson(paths.manifestPath, manifest);
  writeJson(path.join(paths.releaseRoot, 'release-index.json'), {
    schemaVersion: '5.0.0',
    system: 'SHEIKHA_LINUX_PACKAGE_CANDIDATE_INDEX_V5',
    status: manifest.status,
    sourceCommitted: source.sourceCommitted,
    artifactCount: 1,
    artifacts: [{
      id: 'linux-tar-x86_64',
      name: paths.artifactName,
      relativePath: `artifacts/${paths.artifactName}`,
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      nativeVerified: false
    }]
  });
  return { ...paths, ...manifest, reused: false };
}

function processRows() {
  const result = spawnSync('ps', ['-eo', 'pid=,ppid=,comm=,args='], {
    encoding: 'utf8',
    timeout: 5000,
    maxBuffer: 2 * 1024 * 1024
  });
  if (result.status !== 0) return [];
  return String(result.stdout || '').split('\n').flatMap((line) => {
    const match = line.match(/^\s*(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/u);
    return match ? [{
      pid: Number(match[1]),
      ppid: Number(match[2]),
      command: match[3],
      arguments: match[4]
    }] : [];
  });
}

function descendantsOf(rootPid) {
  const rows = processRows();
  const descendants = new Set([rootPid]);
  let changed = true;
  while (changed) {
    changed = false;
    rows.forEach((row) => {
      if (descendants.has(row.ppid) && !descendants.has(row.pid)) {
        descendants.add(row.pid);
        changed = true;
      }
    });
  }
  return rows.filter((row) => row.pid !== rootPid && descendants.has(row.pid));
}

function httpRequest(port, method, requestPath, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body === null ? null : Buffer.from(JSON.stringify(body), 'utf8');
    const request = http.request({
      host: '127.0.0.1',
      port,
      path: requestPath,
      method,
      headers: payload ? {
        'content-type': 'application/json',
        'content-length': payload.length
      } : {},
      timeout: 5000
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        responseBody = appendBounded(responseBody, chunk);
      });
      response.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseBody);
        } catch (_) {
          parsed = null;
        }
        resolve({ statusCode: response.statusCode, body: parsed, rawBody: responseBody });
      });
    });
    request.once('timeout', () => request.destroy(new Error('HTTP_TIMEOUT')));
    request.once('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function findOpenPort() {
  return new Promise((resolve, reject) => {
    const probe = require('node:net').createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close((error) => {
        if (error) reject(error);
        else resolve(address.port);
      });
    });
  });
}

function canConnectToLoopback(port) {
  return new Promise((resolve) => {
    const socket = require('node:net').createConnection({ host: '127.0.0.1', port });
    let settled = false;
    const finish = (open) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function waitForPortClosed(port) {
  const started = Date.now();
  while (Date.now() - started < PORT_CLOSE_TIMEOUT_MS) {
    if (!await canConnectToLoopback(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

function listeningSocketRows(port) {
  const expectedPort = Number(port).toString(16).toUpperCase().padStart(4, '0');
  const rows = [];
  ['/proc/net/tcp', '/proc/net/tcp6'].forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;
    readText(filePath).split('\n').slice(1).forEach((line) => {
      const fields = line.trim().split(/\s+/u);
      if (fields.length < 4 || fields[3] !== '0A') return;
      const [address, socketPort] = fields[1].split(':');
      if (socketPort === expectedPort) rows.push({
        protocol: path.basename(filePath),
        address,
        port,
        state: 'LISTEN'
      });
    });
  });
  return rows;
}

async function waitForHealth(port, childClosed) {
  const started = Date.now();
  while (Date.now() - started < STARTUP_TIMEOUT_MS) {
    if (childClosed()) throw new Error('PACKAGED_SERVER_EXITED_BEFORE_HEALTH');
    try {
      const response = await httpRequest(port, 'GET', '/api/health');
      if (response.statusCode === 200 && response.body?.data?.status === 'ok') return response;
    } catch (_) {
      // Startup is still in progress.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('PACKAGED_SERVER_HEALTH_TIMEOUT');
}

function runNpmInstall(extractedRoot, temporaryRoot) {
  const home = path.join(temporaryRoot, 'home');
  const temp = path.join(temporaryRoot, 'tmp');
  const sourceCache = path.join(os.homedir(), '.npm', '_cacache');
  const isolatedCache = path.join(temporaryRoot, 'npm-cache');
  const cleanPath = [path.dirname(process.execPath), '/usr/local/bin', '/usr/bin', '/bin'].join(':');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(temp, { recursive: true });
  fs.mkdirSync(isolatedCache, { recursive: true });
  if (!fs.existsSync(sourceCache)) throw new Error('OFFLINE_NPM_CACHE_MISSING');
  fs.cpSync(sourceCache, path.join(isolatedCache, '_cacache'), {
    recursive: true,
    preserveTimestamps: true
  });
  const result = spawnSync('npm', [
    'ci',
    '--omit=dev',
    '--offline',
    '--cache',
    isolatedCache,
    '--logs-dir',
    path.join(temporaryRoot, 'npm-logs')
  ], {
    cwd: extractedRoot,
    encoding: 'utf8',
    timeout: 600_000,
    maxBuffer: MAX_OUTPUT_BYTES,
    env: {
      HOME: home,
      PATH: cleanPath,
      TMPDIR: temp,
      TMP: temp,
      TEMP: temp,
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
      NODE_ENV: 'production',
      npm_config_userconfig: '/dev/null',
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_offline: 'true'
    }
  });
  return {
    status: result.status,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error ? String(result.error.message || result.error) : null,
    isolatedCache: true,
    sourceCacheReadOnlyIntent: sourceCache,
    cachePath: isolatedCache
  };
}

function writeRuntimeGuard(temporaryRoot) {
  const guardPath = path.join(temporaryRoot, 'sheikha-v5-runtime-guard.cjs');
  const allowedRoot = path.resolve(temporaryRoot);
  const content = `'use strict';
const fs = require('node:fs');
const net = require('node:net');
const dgram = require('node:dgram');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const allowedRoot = ${JSON.stringify(allowedRoot)};
const allowedHosts = new Set(['127.0.0.1', 'localhost', '::1']);

function denial(kind, value) {
  const error = new Error('[SHEIKHA_V5_GUARD_DENIED] ' + kind + '=' + String(value));
  error.code = 'SHEIKHA_V5_GUARD_DENIED';
  throw error;
}

function pathValue(value) {
  if (typeof value === 'number') return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  if (value && typeof value === 'object' && value.protocol === 'file:') return fileURLToPath(value);
  return String(value);
}

function canonicalTarget(value) {
  const raw = pathValue(value);
  if (raw === null) return null;
  const resolved = path.resolve(raw);
  let ancestor = resolved;
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  const realAncestor = fs.realpathSync.native(ancestor);
  return path.resolve(realAncestor, path.relative(ancestor, resolved));
}

function assertWritePath(value) {
  const target = canonicalTarget(value);
  if (target === null || target === '/dev/null') return;
  if (target !== allowedRoot && !target.startsWith(allowedRoot + path.sep)) denial('write_path', target);
}

function patchPaths(target, name, indexes) {
  const original = target[name];
  if (typeof original !== 'function') return;
  target[name] = function guardedPathOperation(...args) {
    indexes.forEach((index) => assertWritePath(args[index]));
    return original.apply(this, args);
  };
}

const mutations = {
  appendFile: [0], chmod: [0], chown: [0], copyFile: [1], cp: [1],
  createWriteStream: [0], link: [1], lchown: [0], lutimes: [0], mkdir: [0],
  mkdtemp: [0], rename: [0, 1], rm: [0], rmdir: [0], symlink: [1],
  truncate: [0], unlink: [0], utimes: [0], writeFile: [0]
};
for (const [name, indexes] of Object.entries(mutations)) {
  patchPaths(fs, name, indexes);
  patchPaths(fs, name + 'Sync', indexes);
  patchPaths(fs.promises, name, indexes);
}

function writeFlags(flags) {
  if (typeof flags === 'string') return /[wa+]/u.test(flags);
  if (typeof flags !== 'number') return false;
  const c = fs.constants;
  return Boolean(flags & (c.O_WRONLY | c.O_RDWR | c.O_CREAT | c.O_TRUNC | c.O_APPEND));
}

for (const target of [fs, fs.promises]) {
  const original = target.open;
  target.open = function guardedOpen(file, flags, ...rest) {
    if (writeFlags(flags)) assertWritePath(file);
    return original.call(this, file, flags, ...rest);
  };
}
const originalOpenSync = fs.openSync;
fs.openSync = function guardedOpenSync(file, flags, ...rest) {
  if (writeFlags(flags)) assertWritePath(file);
  return originalOpenSync.call(this, file, flags, ...rest);
};

const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function guardedConnect(...args) {
  const options = net._normalizeArgs(args)[0];
  if (options.path) assertWritePath(options.path);
  else {
    const host = options.host || 'localhost';
    if (!allowedHosts.has(host)) denial('network_host', host);
  }
  return originalConnect.apply(this, args);
};

const originalDgramConnect = dgram.Socket.prototype.connect;
dgram.Socket.prototype.connect = function guardedDgramConnect(port, address, ...rest) {
  const host = address || '127.0.0.1';
  if (!allowedHosts.has(host)) denial('udp_host', host);
  return originalDgramConnect.call(this, port, address, ...rest);
};
const originalDgramSend = dgram.Socket.prototype.send;
dgram.Socket.prototype.send = function guardedDgramSend(...args) {
  const strings = args.filter((item) => typeof item === 'string');
  const host = strings.at(-1);
  if (host && !allowedHosts.has(host)) denial('udp_host', host);
  return originalDgramSend.apply(this, args);
};

process.env.SHEIKHA_V5_RUNTIME_GUARD_ACTIVE = '1';
`;
  writeTextAtomic(guardPath, content);
  return guardPath;
}

function runPackagedCli(installedRoot, args, temporaryRoot) {
  const result = spawnSync(process.execPath, [path.join(installedRoot, 'bin', 'sheikha'), ...args], {
    cwd: installedRoot,
    encoding: 'utf8',
    timeout: 30_000,
    maxBuffer: MAX_OUTPUT_BYTES,
    env: {
      HOME: path.join(temporaryRoot, 'home'),
      PATH: [path.dirname(process.execPath), '/usr/local/bin', '/usr/bin', '/bin'].join(':'),
      TMPDIR: path.join(temporaryRoot, 'tmp'),
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8'
    }
  });
  return {
    args,
    status: result.status,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    passed: result.status === 0
  };
}

function collectMissingModules(output) {
  return [...new Set([...output.matchAll(/Cannot find module ['"]([^'"]+)['"]/gu)]
    .map((match) => match[1]))].sort();
}

function waitForClose(child) {
  return new Promise((resolve) => {
    let settled = false;
    let forced = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        forced = true;
        child.kill('SIGKILL');
      }
    }, SHUTDOWN_TIMEOUT_MS);
    child.once('close', (exitCode, signal) => {
      settled = true;
      clearTimeout(timeout);
      resolve({ exitCode, signal, forced });
    });
  });
}

function scanTextForSecrets(value) {
  const findings = SECRET_PATTERNS.flatMap(([pattern, matcher]) => {
    const isolated = new RegExp(matcher.source, matcher.flags);
    return isolated.test(String(value)) ? [pattern] : [];
  });
  return { passed: findings.length === 0, findings };
}

async function launchPackagedServer(options) {
  const {
    functionalChecks,
    guardPath,
    installedRoot,
    signal,
    temporaryRoot
  } = options;
  const port = await findOpenPort();
  const portClosedBefore = !await canConnectToLoopback(port);
  const cleanPath = [path.dirname(process.execPath), '/usr/local/bin', '/usr/bin', '/bin'].join(':');
  const runtimeHome = path.join(temporaryRoot, 'home');
  const runtimeTemp = path.join(temporaryRoot, 'tmp');
  const runtimeConfig = path.join(temporaryRoot, 'xdg', 'config');
  const runtimeCache = path.join(temporaryRoot, 'xdg', 'cache');
  const runtimeData = path.join(temporaryRoot, 'xdg', 'data');
  [runtimeHome, runtimeTemp, runtimeConfig, runtimeCache, runtimeData].forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });

  let stdout = '';
  let stderr = '';
  let processClosed = false;
  const command = [process.execPath, '--require', guardPath, 'server.js'];
  const startedAt = Date.now();
  const child = spawn(command[0], command.slice(1), {
    cwd: installedRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      HOME: runtimeHome,
      PATH: cleanPath,
      TMPDIR: runtimeTemp,
      TMP: runtimeTemp,
      TEMP: runtimeTemp,
      XDG_CONFIG_HOME: runtimeConfig,
      XDG_CACHE_HOME: runtimeCache,
      XDG_DATA_HOME: runtimeData,
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
      NODE_ENV: 'test',
      PORT: String(port),
      HOST: '127.0.0.1',
      NO_PROXY: '127.0.0.1,localhost',
      SHEIKHA_EAGER_SMART_MARKET: '0',
      SHEIKHA_ENABLE_CRON: 'false',
      SHEIKHA_DISABLE_INLINE_CRON: '1',
      SHEIKHA_OFFLINE_MODE: '1',
      SHEIKHA_TEST_LOOPBACK_ONLY: '1',
      SHEIKHA_OFFLINE_CACHE_DIR: path.join(temporaryRoot, 'offline-cache'),
      JWT_SECRET: 'SHEIKHA_V5_NATIVE_TEST_ONLY_JWT_0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      PASSWORD_SALT: 'SHEIKHA_V5_TEST_SALT_ONLY'
    }
  });
  child.stdout.on('data', (chunk) => {
    stdout = appendBounded(stdout, chunk);
  });
  child.stderr.on('data', (chunk) => {
    stderr = appendBounded(stderr, chunk);
  });
  child.once('error', (error) => {
    stderr = appendBounded(stderr, error.stack || error.message);
    processClosed = true;
  });
  child.once('close', () => {
    processClosed = true;
  });

  try {
    const health = await waitForHealth(port, () => processClosed);
    const startupMs = Date.now() - startedAt;
    const portOpenDuringRun = await canConnectToLoopback(port);
    const listeningDuringRun = listeningSocketRows(port);
    const chat = functionalChecks
      ? await httpRequest(port, 'POST', '/api/sheikha/live-chat', {
        message: 'اختبار حزمة شيخة Linux TAR V5'
      })
      : null;
    const conversation = functionalChecks
      ? await httpRequest(port, 'GET', '/api/sheikha/conversation-engine/v1/status')
      : null;
    const processTreeBeforeShutdown = [
      {
        pid: child.pid,
        ppid: process.pid,
        command: path.basename(process.execPath),
        arguments: command.join(' '),
        role: 'packaged-server'
      },
      ...descendantsOf(child.pid)
    ];
    const observedChildren = processTreeBeforeShutdown.filter((item) => item.role !== 'packaged-server');
    child.kill(signal);
    const shutdown = await waitForClose(child);
    const portClosedAfter = await waitForPortClosed(port);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const remainingProcesses = processTreeBeforeShutdown.filter((item) => fs.existsSync(`/proc/${item.pid}`));
    const listeningAfterShutdown = listeningSocketRows(port);
    const combinedOutput = `${stdout}\n${stderr}`;
    const missingModules = collectMissingModules(combinedOutput);
    const fabricErrors = combinedOutput.split('\n')
      .filter((line) => line.includes('[SHEIKHA FABRIC ERROR]'));
    const guardDenials = combinedOutput.split('\n')
      .filter((line) => line.includes('[SHEIKHA_V5_GUARD_DENIED]'));
    const outputSecretScan = scanTextForSecrets(combinedOutput);
    const cleanShutdown = shutdown.exitCode === 0 && !shutdown.forced &&
      combinedOutput.includes(`[SHEIKHA_RUNTIME_SHUTDOWN_REQUESTED] signal=${signal}`) &&
      combinedOutput.includes('[SHEIKHA_RUNTIME_CLEAN_SHUTDOWN_OK]');
    const healthPassed = health.statusCode === 200 && health.body?.data?.status === 'ok';
    const chatPassed = !functionalChecks || (chat.statusCode === 200 && chat.body?.success === true);
    const conversationPassed = !functionalChecks ||
      (conversation.statusCode === 200 && conversation.body?.success === true);
    const loopbackBindingOnly = listeningDuringRun.length > 0 &&
      listeningDuringRun.every((item) => item.protocol === 'tcp' && item.address === '0100007F');
    const noRemainingProcesses = remainingProcesses.length === 0;
    const noRemainingPorts = portClosedAfter && listeningAfterShutdown.length === 0;

    return {
      signal,
      command,
      port,
      startupMs,
      processId: child.pid,
      executableLaunches: true,
      portClosedBefore,
      portOpenDuringRun,
      loopbackBindingOnly,
      listeningDuringRun,
      health,
      healthPassed,
      chat,
      chatPassed,
      conversation,
      conversationEngineStatusPassed: conversationPassed,
      processTreeBeforeShutdown,
      observedChildProcesses: observedChildren,
      remainingProcesses,
      noRemainingProcesses,
      listeningAfterShutdown,
      noRemainingPorts,
      shutdown,
      cleanShutdown,
      missingModules,
      fabricErrors,
      guardDenials,
      writeConfinementPassed: guardDenials.length === 0,
      externalNetworkDenied: guardDenials.length === 0 && loopbackBindingOnly,
      outputSecretScan,
      stdout,
      stderr,
      stdoutSha256: sha256Text(stdout),
      stderrSha256: sha256Text(stderr)
    };
  } catch (error) {
    if (!processClosed) {
      child.kill('SIGKILL');
      await waitForClose(child);
    }
    error.packagedServerOutput = `${stdout}\n${stderr}`;
    throw error;
  }
}

function summarizeLaunch(launch) {
  const {
    chat,
    conversation,
    health,
    stderr,
    stdout,
    ...summary
  } = launch;
  return {
    ...summary,
    healthStatusCode: health.statusCode,
    chatStatusCode: chat?.statusCode ?? null,
    conversationStatusCode: conversation?.statusCode ?? null
  };
}

async function verifyTarLifecycle(candidate) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-linux-native-v5-'));
  const extractRoot = path.join(temporaryRoot, 'installation');
  fs.mkdirSync(extractRoot, { recursive: true });
  let lifecycle = null;
  let cleanup = null;
  try {
    const actualArtifactSha256 = sha256File(candidate.artifactPath);
    const checksumVerified = actualArtifactSha256 === candidate.artifact.sha256;
    if (!checksumVerified) throw new Error('TAR_ARTIFACT_CHECKSUM_MISMATCH');
    run('tar', ['-xzf', candidate.artifactPath, '-C', extractRoot], { timeout: 600_000 });
    const roots = fs.readdirSync(extractRoot);
    if (roots.length !== 1) throw new Error('TAR_INSTALLATION_ROOT_INVALID');
    const installedRoot = path.join(extractRoot, roots[0]);
    const requiredFiles = PACKAGED_RUNTIME_FILES.map((relative) => ({
      path: relative,
      present: fs.existsSync(path.join(installedRoot, relative))
    }));
    if (requiredFiles.some((item) => !item.present)) {
      throw new Error(`PACKAGED_RUNTIME_FILES_MISSING:${requiredFiles.filter((item) => !item.present)
        .map((item) => item.path).join(',')}`);
    }
    const extractedSecretScan = scanStageForSecrets(installedRoot);
    if (!extractedSecretScan.passed) throw new Error('EXTRACTED_TAR_SECRET_SCAN_FAILED');
    const npmInstall = runNpmInstall(installedRoot, temporaryRoot);
    if (npmInstall.status !== 0) {
      throw new Error(`NPM_CI_FAILED:${npmInstall.error || npmInstall.stderr.slice(-500)}`);
    }
    const cliHelp = runPackagedCli(installedRoot, ['--help'], temporaryRoot);
    const cliVersion = runPackagedCli(installedRoot, ['--version'], temporaryRoot);
    const cliVerified = cliHelp.passed && /Sheikha CLI V1/u.test(cliHelp.stdout) &&
      cliVersion.passed && cliVersion.stdout.trim() === VERSION;
    const guardPath = writeRuntimeGuard(temporaryRoot);
    const sigterm = await launchPackagedServer({
      functionalChecks: true,
      guardPath,
      installedRoot,
      signal: 'SIGTERM',
      temporaryRoot
    });
    const sigint = await launchPackagedServer({
      functionalChecks: false,
      guardPath,
      installedRoot,
      signal: 'SIGINT',
      temporaryRoot
    });
    const launches = [sigterm, sigint];
    const missingModules = [...new Set(launches.flatMap((item) => item.missingModules))].sort();
    const fabricErrors = launches.flatMap((item) => item.fabricErrors);
    const nativeVerified = checksumVerified && requiredFiles.every((item) => item.present) &&
      extractedSecretScan.passed && cliVerified && sigterm.healthPassed && sigterm.chatPassed &&
      sigterm.conversationEngineStatusPassed && launches.every((item) => item.cleanShutdown) &&
      launches.every((item) => item.noRemainingProcesses && item.noRemainingPorts) &&
      launches.every((item) => item.loopbackBindingOnly && item.writeConfinementPassed) &&
      launches.every((item) => item.outputSecretScan.passed) &&
      missingModules.length === 0 && fabricErrors.length === 0;

    lifecycle = {
      schemaVersion: '5.0.0',
      system: 'SHEIKHA_LINUX_TAR_NATIVE_LIFECYCLE_V5',
      status: nativeVerified ? 'NATIVE_VERIFIED' : 'NATIVE_VERIFICATION_FAILED',
      candidateOnly: candidate.source.sourceCommitted !== true,
      artifact: candidate.artifact,
      checksumVerified,
      requiredFiles,
      secretScanPassed: extractedSecretScan.passed &&
        launches.every((item) => item.outputSecretScan.passed),
      install: {
        extracted: true,
        npmCiOffline: true,
        npmCiExitCode: npmInstall.status,
        productionDependenciesInstalled: true,
        lifecycleScriptsDisabled: false,
        isolatedCache: npmInstall.isolatedCache,
        inheritedHostSecrets: false,
        nodeVersion: process.version,
        nodeModulesBytes: directoryBytes(path.join(installedRoot, 'node_modules'))
      },
      cli: {
        help: cliHelp,
        version: cliVersion,
        cliVerified
      },
      run: {
        nativeLaunchExecuted: true,
        nativeLaunchVerified: nativeVerified,
        executableLaunches: true,
        healthPassed: sigterm.healthPassed,
        runtimeReadinessPassed: sigterm.conversationEngineStatusPassed,
        chatPassed: sigterm.chatPassed,
        conversationEngineStatusPassed: sigterm.conversationEngineStatusPassed,
        integrationSummary: sigterm.health.body?.data?.integrationSummary || null,
        missingModules,
        fabricErrors,
        sigterm: summarizeLaunch(sigterm),
        sigint: summarizeLaunch(sigint),
        cleanShutdownVerified: launches.every((item) => item.cleanShutdown),
        noRemainingProcesses: launches.every((item) => item.noRemainingProcesses),
        noRemainingPorts: launches.every((item) => item.noRemainingPorts),
        noUnexpectedChildProcesses: launches.every((item) => item.observedChildProcesses.length === 0),
        loopbackOnly: launches.every((item) => item.loopbackBindingOnly),
        externalNetworkDenied: launches.every((item) => item.externalNetworkDenied),
        unrestrictedWriteDenied: launches.every((item) => item.writeConfinementPassed)
      },
      rollback: {
        installationRoot: installedRoot,
        removalAttempted: false,
        verified: false
      },
      nativeVerified
    };
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'native-tar-launch-command.txt'), [
      `SIGTERM: ${sigterm.command.join(' ')}`,
      `SIGINT: ${sigint.command.join(' ')}`
    ].join('\n'));
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'native-tar-launch.log'), [
      `status=${lifecycle.status}`,
      `artifact_sha256=${candidate.artifact.sha256}`,
      '',
      '== npm ci stdout ==',
      npmInstall.stdout.trim(),
      '',
      '== npm ci stderr ==',
      npmInstall.stderr.trim(),
      '',
      '== SIGTERM server stdout ==',
      sigterm.stdout.trim(),
      '',
      '== SIGTERM server stderr ==',
      sigterm.stderr.trim(),
      '',
      '== SIGINT server stdout ==',
      sigint.stdout.trim(),
      '',
      '== SIGINT server stderr ==',
      sigint.stderr.trim()
    ].join('\n'));
    writeJsonAtomic(path.join(EVIDENCE_ROOT, 'native-tar-health-response.json'), {
      statusCode: sigterm.health.statusCode,
      body: sigterm.health.body,
      startupMs: sigterm.startupMs
    });
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'native-tar-process-tree.txt'), launches
      .map((item) => [
        `signal=${item.signal}`,
        `before=${JSON.stringify(item.processTreeBeforeShutdown)}`,
        `after=${JSON.stringify(item.remainingProcesses)}`
      ].join('\n')).join('\n\n'));
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'native-tar-open-ports.txt'), launches
      .map((item) => [
        `signal=${item.signal}`,
        `port=${item.port}`,
        `during=${JSON.stringify(item.listeningDuringRun)}`,
        `after=${JSON.stringify(item.listeningAfterShutdown)}`,
        `closed_after=${item.noRemainingPorts}`
      ].join('\n')).join('\n\n'));
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'native-tar-shutdown.log'), launches
      .map((item) => [
        `signal=${item.signal}`,
        `shutdown=${JSON.stringify(item.shutdown)}`,
        `clean=${item.cleanShutdown}`,
        item.stdout.split('\n').filter((line) => line.includes('SHEIKHA_RUNTIME_')).join('\n')
      ].join('\n')).join('\n\n'));
    writeTextAtomic(path.join(EVIDENCE_ROOT, 'artifact-sha256.txt'),
      `${candidate.artifact.sha256}  ${path.basename(candidate.artifact.path)}\n`);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
    cleanup = {
      schemaVersion: '5.0.0',
      temporaryRoot,
      removalAttempted: true,
      temporaryRootRemoved: !fs.existsSync(temporaryRoot),
      checkedAt: new Date().toISOString()
    };
    writeJsonAtomic(path.join(EVIDENCE_ROOT, 'native-tar-cleanup-verification.json'), cleanup);
    if (lifecycle) {
      lifecycle.rollback.removalAttempted = true;
      lifecycle.rollback.verified = cleanup.temporaryRootRemoved;
    }
  }
  if (!lifecycle) throw new Error('TAR_LIFECYCLE_DID_NOT_COMPLETE');
  lifecycle.cleanup = cleanup;
  writeJsonAtomic(path.join(EVIDENCE_ROOT, 'tar-native-lifecycle.json'), lifecycle);
  writeJsonAtomic(path.join(EVIDENCE_ROOT, 'native-tar-verification.json'), lifecycle);
  writeTextAtomic(path.join(EVIDENCE_ROOT, 'tar-native-launch.txt'),
    readText(path.join(EVIDENCE_ROOT, 'native-tar-launch.log')));
  return lifecycle;
}

function directoryBytes(root) {
  let bytes = 0;
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.isFile()) bytes += fs.statSync(absolute).size;
    }
  }
  return bytes;
}

function inspectDebLifecycle() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-deb-inspection-v5-'));
  const extractedRoot = path.join(temporaryRoot, 'root');
  fs.mkdirSync(extractedRoot, { recursive: true });
  const info = run('dpkg-deb', ['--info', V2_DEB], { timeout: 300_000 });
  const contents = run('dpkg-deb', ['--contents', V2_DEB], { timeout: 300_000 });
  run('dpkg-deb', ['--extract', V2_DEB, extractedRoot], { timeout: 300_000 });
  const hostNodePackage = run('dpkg-query', [
    '-W',
    '-f=${Version}',
    'nodejs'
  ], { allowFailure: true });
  const dependencyCheck = run('dpkg', [
    '--compare-versions',
    hostNodePackage.stdout || '0',
    'ge',
    '20'
  ], { allowFailure: true });
  const cliPath = path.join(extractedRoot, 'usr', 'lib', 'sheikha', 'bin', 'sheikha');
  const serverPath = path.join(extractedRoot, 'usr', 'lib', 'sheikha', 'server.js');
  const cli = run(process.execPath, [cliPath, 'help'], { allowFailure: true });
  const syntax = run(process.execPath, ['--check', serverPath], { allowFailure: true });
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
  const report = {
    schemaVersion: '5.0.0',
    system: 'SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V5',
    status: 'BLOCKED_NATIVE_DPKG_LIFECYCLE',
    artifact: {
      path: path.relative(ROOT, V2_DEB),
      bytes: fs.statSync(V2_DEB).size,
      sha256: sha256File(V2_DEB)
    },
    structuralInspection: {
      packageMetadataPassed: /Package: sheikha/u.test(info.stdout),
      architectureAmd64: /Architecture: amd64/u.test(info.stdout),
      entryCount: contents.stdout.split('\n').filter(Boolean).length,
      extractionPassed: true,
      cliHelpPassed: cli.status === 0,
      serverSyntaxPassed: syntax.status === 0,
      rollbackVerified: !fs.existsSync(temporaryRoot)
    },
    nativePackageManagerLifecycle: {
      dpkgInstallExecuted: false,
      upgradeExecuted: false,
      uninstallExecuted: false,
      purgeExecuted: false,
      reason: 'No inspected Debian or Ubuntu root environment with Node.js >=20 is available without installing or downloading a new base image.'
    },
    dependencyGate: {
      declared: 'nodejs (>= 20), npm',
      hostDpkgNodeVersion: hostNodePackage.stdout || null,
      hostDpkgDependencySatisfied: dependencyCheck.status === 0,
      activeNodeVersion: process.version,
      activeNodeProvidedByDpkg: false
    },
    nativeVerified: false,
    claim: 'dpkg-deb extraction is structural evidence only and must not be counted as native install verification.'
  };
  writeJsonAtomic(path.join(EVIDENCE_ROOT, 'deb-native-lifecycle.json'), report);
  writeTextAtomic(path.join(EVIDENCE_ROOT, 'deb-inspection.txt'), [
    '== dpkg-deb --info ==',
    info.stdout.trimEnd().split('\n').map((line) => line.trimEnd()).join('\n'),
    '',
    '== dependency gate ==',
    `host_dpkg_node_version=${report.dependencyGate.hostDpkgNodeVersion}`,
    `dependency_satisfied=${report.dependencyGate.hostDpkgDependencySatisfied}`,
    `active_node_version=${process.version}`,
    `native_dpkg_install_executed=false`
  ].join('\n'));
  return report;
}

function historicalIntegrity() {
  const paths = [
    'runtime/distribution/v2/sheikha-universal-delivery-v2-report.json',
    'runtime/distribution/v2/sheikha-native-verification-v2.json',
    'runtime/distribution/v3/sheikha-native-delivery-v3-report.json',
    'runtime/desktop-runtime/v4/sheikha-native-desktop-v4-report.json'
  ];
  const modified = run('git', ['diff', '--name-only', '--', ...paths], { allowFailure: true })
    .stdout.split('\n').filter(Boolean);
  return {
    status: modified.length === 0 ? 'VERIFIED_UNMODIFIED' : 'HISTORICAL_REPORTS_MODIFIED',
    modified,
    files: paths.map((relative) => ({
      path: relative,
      sha256: sha256File(path.join(ROOT, relative))
    }))
  };
}

async function execute() {
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const source = sourceState();
  const candidate = buildCandidate(source);
  const tar = await verifyTarLifecycle(candidate);
  const deb = inspectDebLifecycle();
  const v2 = readJson(V2_REPORT);
  const integrity = historicalIntegrity();
  const canonicalPromotionAllowed = source.sourceCommitted && tar.nativeVerified &&
    integrity.status === 'VERIFIED_UNMODIFIED';
  const status = tar.nativeVerified
    ? source.sourceCommitted
      ? 'TAR_NATIVE_VERIFIED_DEB_BLOCKED'
      : 'TAR_NATIVE_VERIFIED_CANDIDATE_UNCOMMITTED_DEB_BLOCKED'
    : 'TAR_AND_DEB_NATIVE_VERIFICATION_INCOMPLETE';
  const report = {
    schemaVersion: '5.0.0',
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    status,
    scope: 'LINUX_X86_64_TAR_AND_DEB_LIFECYCLE_ONLY',
    source,
    historicalIntegrity: integrity,
    candidate: {
      releaseRoot: path.relative(ROOT, candidate.releaseRoot),
      artifact: candidate.artifact,
      reused: candidate.reused,
      secretScanPassed: candidate.secretScan.passed,
      silentOverwriteAllowed: false
    },
    tar,
    deb,
    nativeLaunchExecuted: tar.run.nativeLaunchExecuted,
    nativeLaunchVerified: tar.run.nativeLaunchVerified,
    canonicalPromotionAllowed,
    matrix: {
      targetCount: v2.targetCount,
      canonicalBefore: {
        verified: v2.nativeVerifiedCount,
        builtNotNativeVerified: v2.builtCount - v2.nativeVerifiedCount,
        remaining: v2.targetCount - v2.nativeVerifiedCount
      },
      canonicalAfterThisRun: canonicalPromotionAllowed ? {
        verified: v2.nativeVerifiedCount + 1,
        builtNotNativeVerified: v2.builtCount - v2.nativeVerifiedCount - 1,
        remaining: v2.targetCount - v2.nativeVerifiedCount - 1
      } : {
        verified: v2.nativeVerifiedCount,
        builtNotNativeVerified: v2.builtCount - v2.nativeVerifiedCount,
        remaining: v2.targetCount - v2.nativeVerifiedCount
      },
      candidateEligibleIncrement: tar.nativeVerified ? 1 : 0,
      canonicalCountsMutated: false
    },
    restrictions: {
      sudoUsed: false,
      packagesInstalledOnHost: false,
      githubUsed: false,
      externalPublishing: false,
      signingUsed: false,
      v2HistoricalArtifactsOverwritten: false
    },
    evidence: {
      tarLifecycle: 'runtime/distribution/v5/evidence/tar-native-lifecycle.json',
      tarLaunch: 'runtime/distribution/v5/evidence/tar-native-launch.txt',
      nativeTarLaunchCommand: 'runtime/distribution/v5/evidence/native-tar-launch-command.txt',
      nativeTarLaunchLog: 'runtime/distribution/v5/evidence/native-tar-launch.log',
      nativeTarHealth: 'runtime/distribution/v5/evidence/native-tar-health-response.json',
      nativeTarProcessTree: 'runtime/distribution/v5/evidence/native-tar-process-tree.txt',
      nativeTarOpenPorts: 'runtime/distribution/v5/evidence/native-tar-open-ports.txt',
      nativeTarShutdown: 'runtime/distribution/v5/evidence/native-tar-shutdown.log',
      nativeTarCleanup: 'runtime/distribution/v5/evidence/native-tar-cleanup-verification.json',
      nativeTarVerification: 'runtime/distribution/v5/evidence/native-tar-verification.json',
      artifactSha256: 'runtime/distribution/v5/evidence/artifact-sha256.txt',
      debLifecycle: 'runtime/distribution/v5/evidence/deb-native-lifecycle.json',
      debInspection: 'runtime/distribution/v5/evidence/deb-inspection.txt'
    },
    claimPolicy: 'No target count changes until the artifact is built from committed source and its required native lifecycle passes.'
  };
  writeJsonAtomic(MAIN_REPORT, report);
  return report;
}

function buildOnly() {
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const source = sourceState();
  const candidate = buildCandidate(source);
  const deb = inspectDebLifecycle();
  const integrity = historicalIntegrity();
  const report = {
    schemaVersion: '5.0.0',
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    status: 'CANDIDATE_BUILT_NATIVE_EXECUTION_PENDING_DEB_BLOCKED',
    scope: 'LINUX_X86_64_TAR_AND_DEB_LIFECYCLE_ONLY',
    source,
    historicalIntegrity: integrity,
    candidate: {
      releaseRoot: path.relative(ROOT, candidate.releaseRoot),
      artifact: candidate.artifact,
      reused: candidate.reused,
      secretScanPassed: candidate.secretScan.passed,
      silentOverwriteAllowed: false
    },
    deb,
    nativeLaunchExecuted: false,
    nativeLaunchVerified: false,
    canonicalPromotionAllowed: false,
    blocker: 'Build-only mode does not execute the native loopback lifecycle.',
    restrictions: {
      sudoUsed: false,
      packagesInstalledOnHost: false,
      githubUsed: false,
      externalPublishing: false,
      v2HistoricalArtifactsOverwritten: false
    },
    claimPolicy: 'A built candidate does not change any target count without native lifecycle evidence.'
  };
  writeJsonAtomic(MAIN_REPORT, report);
  return report;
}

async function main() {
  const command = process.argv[2] || 'verify';
  if (command === 'status') {
    process.stdout.write(`${JSON.stringify(readJson(MAIN_REPORT), null, 2)}\n`);
    return;
  }
  if (command === 'build') {
    process.stdout.write(`${JSON.stringify(buildOnly(), null, 2)}\n`);
    return;
  }
  if (command !== 'verify') throw new Error(`Unknown command: ${command}`);
  const report = await execute();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.tar.nativeVerified) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  MAIN_REPORT,
  SYSTEM,
  buildCandidate,
  buildOnly,
  collectMissingModules,
  execute,
  inspectDebLifecycle,
  sourceState,
  verifyTarLifecycle
};
