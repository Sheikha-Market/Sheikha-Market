#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const { ROOT } = require('../common/distribution-utils');
const {
  EVIDENCE_ROOT,
  generateV4Inspection,
  inspectBuiltArtifact,
  securityVerification
} = require('./sheikha-native-desktop-v4');

const MAX_LOG_BYTES = 4 * 1024 * 1024;
const SMOKE_TIMEOUT_MS = 45_000;
const PROCESS_SAMPLE_INTERVAL_MS = 100;
const PROCESS_SETTLE_MS = 500;
const EXPECTED_HELPER_PATTERN = /(?:WebKit(?:Web|Network|GPU|Storage)Process|\bbwrap\b|xdg-dbus-proxy|dbus-launch|dbus-daemon|at-spi-bus-launcher)/u;
const SECRET_PATTERN = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*[^\s]+)/iu;

function writeFileAtomic(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, contents, 'utf8');
  fs.renameSync(temporary, filePath);
}

function writeJsonAtomic(filePath, value) {
  writeFileAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256Text(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
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
    if (!match) return [];
    return [{
      pid: Number(match[1]),
      ppid: Number(match[2]),
      command: match[3],
      arguments: match[4]
    }];
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

function appendBounded(current, chunk) {
  if (Buffer.byteLength(current, 'utf8') >= MAX_LOG_BYTES) return current;
  const next = current + String(chunk || '');
  if (Buffer.byteLength(next, 'utf8') <= MAX_LOG_BYTES) return next;
  return Buffer.from(next, 'utf8').subarray(0, MAX_LOG_BYTES).toString('utf8');
}

function markerMap(output) {
  return {
    launch: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_LAUNCH_OK'),
    window: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_WINDOW_OK'),
    health: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_HEALTH_OK'),
    chat: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_CHAT_OK'),
    inspector: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_INSPECTOR_OK'),
    smoke: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_OK'),
    cleanShutdown: output.includes('SHEIKHA_NATIVE_DESKTOP_V4_CLEAN_SHUTDOWN_OK')
  };
}

function runProcess(binaryPath) {
  return new Promise((resolve, reject) => {
    const startedAt = new Date();
    const startedNs = process.hrtime.bigint();
    const child = spawn(binaryPath, ['--smoke'], {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const observedChildren = new Map();
    const sample = () => {
      descendantsOf(child.pid).forEach((row) => observedChildren.set(row.pid, row));
    };
    const sampler = setInterval(sample, PROCESS_SAMPLE_INTERVAL_MS);
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, SMOKE_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout = appendBounded(stdout, chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr = appendBounded(stderr, chunk);
    });
    child.once('error', (error) => {
      clearInterval(sampler);
      clearTimeout(timeout);
      reject(error);
    });
    child.once('close', (exitCode, signal) => {
      sample();
      clearInterval(sampler);
      clearTimeout(timeout);
      setTimeout(() => {
        const children = [...observedChildren.values()];
        const remainingChildren = children.filter((row) => fs.existsSync(`/proc/${row.pid}`));
        resolve({
          startedAt: startedAt.toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: Number((process.hrtime.bigint() - startedNs) / 1_000_000n),
          rootPid: child.pid,
          exitCode,
          signal,
          timedOut,
          stdout,
          stderr,
          observedChildren: children,
          remainingChildren
        });
      }, PROCESS_SETTLE_MS);
    });
  });
}

async function runNativeSmoke() {
  const artifact = inspectBuiltArtifact();
  if (!artifact.built || !artifact.inspected || !artifact.path) {
    throw new Error('V4_TAURI_ARTIFACT_NOT_READY');
  }
  if (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
    throw new Error('NATIVE_DISPLAY_NOT_AVAILABLE');
  }
  const security = securityVerification(artifact);
  if (!security.implementationVerified) {
    throw new Error('V4_SECURITY_GATE_FAILED');
  }

  const binaryPath = path.join(ROOT, artifact.path);
  const execution = await runProcess(binaryPath);
  const markers = markerMap(execution.stdout);
  const unexpectedChildren = execution.observedChildren.filter((row) => (
    !EXPECTED_HELPER_PATTERN.test(`${row.command} ${row.arguments}`)
  ));
  const combinedOutput = `${execution.stdout}\n${execution.stderr}`;
  const outputSecretMatches = combinedOutput.match(SECRET_PATTERN)?.[0] || null;
  const noUnexpectedChildProcesses = !execution.timedOut &&
    unexpectedChildren.length === 0 && execution.remainingChildren.length === 0;
  const requiredMarkersPassed = Object.values(markers).every(Boolean);
  const nativeVerified = execution.exitCode === 0 &&
    execution.signal === null &&
    requiredMarkersPassed &&
    noUnexpectedChildProcesses &&
    outputSecretMatches === null &&
    security.defaultDeny.shell === true &&
    security.defaultDeny.arbitraryFilesystem === true;

  const smoke = {
    schemaVersion: '4.0.0',
    system: 'SHEIKHA_NATIVE_DESKTOP_V4_SMOKE_VERIFICATION',
    generatedAt: new Date().toISOString(),
    status: nativeVerified ? 'NATIVE_VERIFIED' : 'NATIVE_VERIFICATION_FAILED',
    framework: 'tauri-2',
    platform: process.platform,
    architecture: process.arch === 'x64' ? 'x86_64' : process.arch,
    display: process.env.DISPLAY || null,
    waylandDisplay: process.env.WAYLAND_DISPLAY || null,
    command: `${artifact.path} --smoke`,
    artifactSha256: artifact.sha256,
    startedAt: execution.startedAt,
    finishedAt: execution.finishedAt,
    durationMs: execution.durationMs,
    exitCode: execution.exitCode,
    signal: execution.signal,
    timedOut: execution.timedOut,
    markers,
    executableLaunches: markers.launch,
    mainWindowOpens: markers.window,
    mainWindowVisibilityCheckedByRust: markers.window,
    localHealthEndpointWorks: markers.health,
    chatViewLoads: markers.chat,
    inspectorLoads: markers.inspector,
    cleanShutdown: markers.cleanShutdown && execution.exitCode === 0,
    observedExpectedChildProcesses: execution.observedChildren.filter((row) => (
      EXPECTED_HELPER_PATTERN.test(`${row.command} ${row.arguments}`)
    )),
    unexpectedChildProcesses: unexpectedChildren,
    childProcessesRemainingAfterShutdown: execution.remainingChildren,
    noUnexpectedChildProcesses,
    noSecretExposure: outputSecretMatches === null,
    noUnrestrictedShellAccess: security.defaultDeny.shell === true,
    noUnrestrictedFilesystemAccess: security.defaultDeny.arbitraryFilesystem === true,
    noUnrestrictedNetworkAccess: security.defaultDeny.arbitraryNetwork === true,
    stdoutSha256: sha256Text(execution.stdout),
    stderrSha256: sha256Text(execution.stderr),
    v4NativeLaunchExecuted: true,
    v4NativeLaunchVerified: nativeVerified
  };

  const launchLog = [
    `status=${smoke.status}`,
    `command=${smoke.command}`,
    `started_at=${execution.startedAt}`,
    `finished_at=${execution.finishedAt}`,
    `duration_ms=${execution.durationMs}`,
    `root_pid=${execution.rootPid}`,
    `exit_code=${execution.exitCode}`,
    `signal=${execution.signal || 'none'}`,
    `timed_out=${execution.timedOut}`,
    `display=${smoke.display || 'none'}`,
    `wayland_display=${smoke.waylandDisplay || 'none'}`,
    `observed_child_processes=${JSON.stringify(execution.observedChildren)}`,
    `unexpected_child_processes=${JSON.stringify(unexpectedChildren)}`,
    `remaining_child_processes=${JSON.stringify(execution.remainingChildren)}`,
    '',
    '== stdout ==',
    execution.stdout.trim(),
    '',
    '== stderr ==',
    execution.stderr.trim()
  ].join('\n');
  writeFileAtomic(path.join(EVIDENCE_ROOT, 'native-launch.log'), launchLog);
  writeJsonAtomic(path.join(EVIDENCE_ROOT, 'native-smoke-verification.json'), smoke);
  const report = generateV4Inspection();
  return { smoke, report };
}

async function main() {
  const result = await runNativeSmoke();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.smoke.v4NativeLaunchVerified) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  EXPECTED_HELPER_PATTERN,
  markerMap,
  runNativeSmoke
};
