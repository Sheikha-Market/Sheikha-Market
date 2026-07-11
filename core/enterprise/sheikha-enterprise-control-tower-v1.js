'use strict';

const os = require('os');
const cp = require('child_process');

const GIT_SNAPSHOT_TTL_MS = 10000;
const GIT_SNAPSHOT = {
  branch: 'غير متاح',
  status: '',
  aheadBehind: 'غير متاح',
  refreshedAt: null,
  refreshStatus: 'PENDING'
};
let gitRefreshPromise = null;

function execGit(args, fallback = 'غير متاح') {
  return new Promise((resolve) => {
    cp.execFile('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 2 * 1024 * 1024
    }, (error, stdout) => {
      if (error) {
        resolve(fallback);
        return;
      }
      resolve(String(stdout || '').trim());
    });
  });
}

function refreshGitSnapshot(options = {}) {
  const refreshedAtMs = GIT_SNAPSHOT.refreshedAt
    ? Date.parse(GIT_SNAPSHOT.refreshedAt)
    : 0;
  const fresh = Number.isFinite(refreshedAtMs) &&
    Date.now() - refreshedAtMs < GIT_SNAPSHOT_TTL_MS;
  if (!options.force && fresh) return Promise.resolve({ ...GIT_SNAPSHOT });
  if (gitRefreshPromise) return gitRefreshPromise;

  GIT_SNAPSHOT.refreshStatus = 'REFRESHING';
  gitRefreshPromise = Promise.all([
    execGit(['rev-parse', '--abbrev-ref', 'HEAD']),
    execGit(['status', '--short'], ''),
    execGit(['rev-list', '--left-right', '--count', '@{u}...HEAD'])
  ]).then(([branch, status, aheadBehind]) => {
    Object.assign(GIT_SNAPSHOT, {
      branch,
      status,
      aheadBehind,
      refreshedAt: new Date().toISOString(),
      refreshStatus: 'READY'
    });
    return { ...GIT_SNAPSHOT };
  }).finally(() => {
    gitRefreshPromise = null;
  });
  return gitRefreshPromise;
}

function collectControlTowerStatus() {
  const mem = process.memoryUsage();
  refreshGitSnapshot().catch(() => {
    GIT_SNAPSHOT.refreshStatus = 'DEGRADED';
  });

  return {
    success: true,
    engine: 'SHEIKHA_ENTERPRISE_CONTROL_TOWER_V1',
    status: 'ACTIVE',
    runtime: {
      cpuLoad1m: os.loadavg()[0],
      ramUsedPercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime())
    },
    git: {
      ...GIT_SNAPSHOT,
      stale: !GIT_SNAPSHOT.refreshedAt ||
        Date.now() - Date.parse(GIT_SNAPSHOT.refreshedAt) >= GIT_SNAPSHOT_TTL_MS
    },
    project: {
      workspace: process.cwd()
    },
    governance: {
      policies: 'ACTIVE',
      capabilityTokens: 'ACTIVE',
      executionContracts: 'READ_ONLY_SAFE_BY_DEFAULT'
    },
    ai: {
      provider: 'Sheikha Unified Chat',
      languageEngine: 'ARABIC_EXECUTIVE_LANGUAGE_ENGINE_V1'
    },
    apis: {
      health8080: 'ACTIVE_INTERNAL',
      health9191: 'OPTIONAL_NOT_REQUIRED',
      unifiedChat: 'ACTIVE_INTERNAL',
      note: 'Self-curl disabled to avoid event-loop blocking/timeouts inside request path'
    },
    observability: {
      logs: 'journalctl / pm2 logs',
      metrics: 'runtime snapshot',
      events: 'audit jsonl',
      alerts: 'haproxy/backend status'
    }
  };
}

module.exports = {
  GIT_SNAPSHOT,
  collectControlTowerStatus,
  refreshGitSnapshot
};

refreshGitSnapshot().catch(() => {
  GIT_SNAPSHOT.refreshStatus = 'DEGRADED';
});
