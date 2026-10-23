'use strict';

const os = require('node:os');
const cp = require('node:child_process');

const GIT_EXECUTABLE = process.platform === 'win32'
  ? 'C:\\Program Files\\Git\\cmd\\git.exe'
  : '/usr/bin/git';

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
    cp.execFile(GIT_EXECUTABLE, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 2 * 1024 * 1024
    }, (error, stdout) => {
      if (error) {
        resolve(fallback);
        return;
      }
      // Leading spaces in porcelain encode the index state.
      resolve(String(stdout || '').replace(/\r?\n$/u, ''));
    });
  });
}

function classifyGitStatus(code) {
  if (code === '??') return 'untracked';
  if (code.includes('U') || code === 'AA' || code === 'DD') {
    return 'conflicted';
  }
  if (code[0] !== ' ' && code[1] !== ' ') return 'stagedAndUnstaged';
  if (code[0] !== ' ') return 'staged';
  return 'unstaged';
}

function summarizeGitStatus(status = '') {
  const lines = String(status || '').split('\n').filter(Boolean);
  const byState = {
    untracked: 0,
    conflicted: 0,
    staged: 0,
    unstaged: 0,
    stagedAndUnstaged: 0
  };
  const areaCounts = new Map();

  lines.forEach((line) => {
    const code = line.slice(0, 2);
    const rawPath = line.slice(3);
    const selectedPath = rawPath.includes(' -> ')
      ? rawPath.split(' -> ').at(-1)
      : rawPath;
    const normalizedPath = selectedPath.replace(/^"|"$/gu, '');
    const area = normalizedPath.includes('/')
      ? normalizedPath.split('/')[0]
      : '(root)';
    const state = classifyGitStatus(code);
    byState[state] += 1;
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
  });

  const topAreas = [...areaCounts.entries()]
    .map(([area, count]) => ({area, count}))
    .sort((left, right) =>
      right.count - left.count || left.area.localeCompare(right.area)
    )
    .slice(0, 12);

  return {
    total: lines.length,
    byState,
    topAreas
  };
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
    execGit(['status', '--porcelain=v1'], null),
    execGit(['rev-list', '--left-right', '--count', '@{u}...HEAD'])
  ]).then(([branch, status, aheadBehind]) => {
    if (status === null) {
      GIT_SNAPSHOT.refreshStatus = 'DEGRADED';
      return { ...GIT_SNAPSHOT };
    }
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
      changeSummary: summarizeGitStatus(GIT_SNAPSHOT.status),
      stale: GIT_SNAPSHOT.refreshStatus !== 'READY' || !GIT_SNAPSHOT.refreshedAt ||
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
  refreshGitSnapshot,
  summarizeGitStatus
};

refreshGitSnapshot().catch(() => {
  GIT_SNAPSHOT.refreshStatus = 'DEGRADED';
});
