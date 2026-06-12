'use strict';

const os = require('os');
const cp = require('child_process');

function sh(cmd) {
  try {
    return cp.execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000
    }).trim();
  } catch (e) {
    return String(e.stderr || e.message || 'غير متاح').trim();
  }
}

function collectControlTowerStatus() {
  const mem = process.memoryUsage();

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
      branch: sh('git rev-parse --abbrev-ref HEAD'),
      status: sh('git status --short'),
      aheadBehind: sh('git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "غير متاح"')
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
      health8080: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/health || true'),
      health9191: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9191/api/health || true'),
      unifiedChat: sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/sheikha/unified-chat/status || true')
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
  collectControlTowerStatus
};
