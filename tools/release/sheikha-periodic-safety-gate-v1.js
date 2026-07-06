'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'runtime/operational-verification');
const BACKUP_DIR = path.join(ROOT, 'backups/verification');
const BACKUP_FILE = path.join(BACKUP_DIR, 'sheikha-periodic-source-backup-latest.tar.gz');
const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_MIN_FREE_BYTES = 5 * 1024 * 1024 * 1024;

function sanitizeEnv() {
  const env = { ...process.env };
  delete env.npm_config_prefix;
  return env;
}

function isoTimestamp() {
  return new Date().toISOString();
}

function safeTimestamp() {
  return isoTimestamp().replace(/[-:.TZ]/g, '').slice(0, 14);
}

function parseInterval(value = process.env.SHEIKHA_SAFETY_GATE_INTERVAL_MS) {
  const parsed = Number(value || DEFAULT_INTERVAL_MS);
  return Number.isFinite(parsed) && parsed >= 60000 ? parsed : DEFAULT_INTERVAL_MS;
}

function runCommand(command, args, options = {}) {
  const startedAt = isoTimestamp();
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: sanitizeEnv(),
    maxBuffer: options.maxBuffer || 20 * 1024 * 1024
  });

  return {
    command: [command, ...args].join(' '),
    success: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: (result.stdout || '').trim().slice(-4000),
    stderr: (result.stderr || '').trim().slice(-4000),
    startedAt,
    finishedAt: isoTimestamp()
  };
}

function getFreeBytes() {
  try {
    const stats = fs.statfsSync(ROOT);
    return stats.bavail * stats.bsize;
  } catch {
    return null;
  }
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function parseJsonFromOutput(output) {
  const text = String(output || '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function checkHealth(url = 'http://127.0.0.1:8080/api/health') {
  return new Promise((resolve) => {
    const startedAt = isoTimestamp();
    const request = http.get(url, { timeout: 5000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = null;
        }

        resolve({
          url,
          success: response.statusCode >= 200 && response.statusCode < 300 && parsed?.success === true,
          statusCode: response.statusCode,
          status: parsed?.data?.status || null,
          message: parsed?.message || null,
          startedAt,
          finishedAt: isoTimestamp()
        });
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error('HEALTH_TIMEOUT'));
    });

    request.on('error', (error) => {
      resolve({
        url,
        success: false,
        error: error.message,
        startedAt,
        finishedAt: isoTimestamp()
      });
    });
  });
}

function buildDecision(checks) {
  const failed = Object.entries(checks)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);

  return {
    status: failed.length === 0 ? 'PASSED' : 'REVIEW',
    decision: failed.length === 0
      ? 'PERIODIC_NO_HARM_GATE_PASSED'
      : 'PERIODIC_NO_HARM_GATE_REVIEW_REQUIRED',
    failed
  };
}

async function runSafetyGate(options = {}) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const intervalMs = parseInterval(options.intervalMs);
  const minFreeBytes = Number(process.env.SHEIKHA_SAFETY_GATE_MIN_FREE_BYTES || DEFAULT_MIN_FREE_BYTES);
  const freeBytesBefore = getFreeBytes();
  const diskReady = freeBytesBefore === null || freeBytesBefore >= minFreeBytes;

  const productionGateCommand = runCommand('node', [
    'tools/activation/activate-sheikha-production-hardening-closure-v1.js'
  ]);
  const productionGate = parseJsonFromOutput(productionGateCommand.stdout);

  let backup = {
    skipped: !diskReady,
    reason: diskReady ? null : 'LOW_DISK_SPACE_GUARD',
    backupFile: BACKUP_FILE,
    backupSizeBytes: 0,
    gitArchive: null,
    gzipValid: null,
    archiveValid: null,
    restore: null
  };

  if (diskReady) {
    const restoreDir = path.join(os.tmpdir(), `sheikha-periodic-restore-${Date.now()}`);
    fs.mkdirSync(restoreDir, { recursive: true });

    const gitArchive = runCommand('git', [
      'archive',
      '--format=tar.gz',
      `--output=${BACKUP_FILE}`,
      'HEAD'
    ]);
    const gzipValid = runCommand('gzip', ['-t', BACKUP_FILE]);
    const archiveValid = runCommand('tar', ['-tzf', BACKUP_FILE], { maxBuffer: 30 * 1024 * 1024 });
    const restore = runCommand('tar', [
      '-xzf',
      BACKUP_FILE,
      '-C',
      restoreDir,
      'package.json',
      'server.js'
    ]);

    backup = {
      skipped: false,
      backupFile: BACKUP_FILE,
      backupSizeBytes: getFileSize(BACKUP_FILE),
      restoreDir,
      gitArchive,
      gzipValid,
      archiveValid,
      restore,
      packageRestored: fs.existsSync(path.join(restoreDir, 'package.json')),
      serverRestored: fs.existsSync(path.join(restoreDir, 'server.js'))
    };
  }

  const health = await checkHealth();
  const pm2Save = runCommand('pm2', ['save']);

  const checks = {
    productionGateReady: productionGate?.decision === 'PRODUCTION_CANDIDATE_READY' &&
      productionGate?.productionGate?.status === 'PASSED',
    diskReady,
    sourceBackupReady: backup.skipped === false &&
      backup.gitArchive?.success === true &&
      backup.gzipValid?.success === true &&
      backup.archiveValid?.success === true,
    restoreSampleReady: backup.packageRestored === true && backup.serverRestored === true,
    pm2Saved: pm2Save.success === true,
    healthOk: health.success === true
  };

  const decision = buildDecision(checks);
  const now = isoTimestamp();
  const nextRunAt = new Date(Date.now() + intervalMs).toISOString();
  const report = {
    system: 'SHEIKHA_PERIODIC_SAFETY_GATE_V1',
    status: decision.status,
    decision: decision.decision,
    failedChecks: decision.failed,
    mode: options.watch ? 'PERIODIC_WATCH' : 'ONCE',
    schedule: {
      intervalMs,
      intervalMinutes: Math.round(intervalMs / 60000),
      nextRunAt
    },
    checks,
    productionGate: {
      command: productionGateCommand,
      decision: productionGate?.decision || null,
      status: productionGate?.productionGate?.status || null
    },
    backup,
    health,
    pm2Save,
    disk: {
      freeBytesBefore,
      minFreeBytes,
      guarded: true
    },
    governance: {
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      sourceArchiveOnly: true,
      restoreToTmpOnly: true,
      noKernelModification: true,
      noExternalMutation: true,
      noPrivilegeEscalation: true,
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: now
  };

  const latestFile = path.join(REPORT_DIR, 'sheikha-periodic-safety-gate-v1-latest.json');
  const historyFile = path.join(REPORT_DIR, `sheikha-periodic-safety-gate-v1-${safeTimestamp()}.json`);
  fs.writeFileSync(latestFile, JSON.stringify(report, null, 2));
  fs.writeFileSync(historyFile, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    decision: report.decision,
    intervalMinutes: report.schedule.intervalMinutes,
    nextRunAt: report.schedule.nextRunAt,
    backupFile: report.backup.backupFile,
    backupSizeBytes: report.backup.backupSizeBytes,
    reportFile: latestFile
  }, null, 2));

  return report;
}

async function watch() {
  const intervalMs = parseInterval();
  let running = false;

  const runOnce = async () => {
    if (running) {
      return;
    }

    running = true;
    try {
      await runSafetyGate({ watch: true, intervalMs });
    } catch (error) {
      console.error(JSON.stringify({
        system: 'SHEIKHA_PERIODIC_SAFETY_GATE_V1',
        status: 'ERROR',
        error: error.message,
        timestamp: isoTimestamp()
      }));
    } finally {
      running = false;
    }
  };

  await runOnce();
  setInterval(runOnce, intervalMs);
}

async function main() {
  if (
    process.argv.includes('--watch') ||
    process.argv.includes('watch') ||
    process.env.SHEIKHA_SAFETY_GATE_MODE === 'watch'
  ) {
    await watch();
    return;
  }

  await runSafetyGate({ watch: false });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_INTERVAL_MS,
  parseInterval,
  buildDecision,
  runSafetyGate
};
