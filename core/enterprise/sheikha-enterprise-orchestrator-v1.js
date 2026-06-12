'use strict';

const os = require('os');
const cp = require('child_process');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    return 'غير متاح';
  }
}

function getEnterpriseState(base = {}) {
  const mem = process.memoryUsage();
  const baseRuntime = base.runtime || {};
  const baseGit = base.git || {};

  return {
    success: true,
    orchestrator: 'SHEIKHA_ENTERPRISE_ORCHESTRATOR_V1',
    status: 'ACTIVE',
    layers: {
      strategic: 'ACTIVE',
      governance: 'ACTIVE',
      knowledge: 'ACTIVE',
      execution: 'ACTIVE',
      ai: 'ACTIVE',
      controlTower: 'ACTIVE',
      observability: 'ACTIVE',
      extension: 'ACTIVE',
      unifiedChat: 'ACTIVE'
    },
    runtime: {
      cpu: baseRuntime.cpuLoad1m ?? os.loadavg()[0],
      ram: baseRuntime.ramUsedPercent ?? Math.round((1 - os.freemem() / os.totalmem()) * 100),
      heapUsedMb: baseRuntime.heapUsedMb ?? Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: baseRuntime.heapTotalMb ?? Math.round(mem.heapTotal / 1024 / 1024),
      uptime: baseRuntime.uptimeSeconds ?? Math.round(process.uptime())
    },
    git: {
      branch: baseGit.branch ?? sh('git rev-parse --abbrev-ref HEAD'),
      status: baseGit.status ?? sh('git status --short'),
      aheadBehind: baseGit.aheadBehind ?? sh('git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "غير متاح"')
    },
    governance: {
      policies: 'ACTIVE',
      capabilityTokens: 'ACTIVE',
      executionContracts: 'READ_ONLY_SAFE_BY_DEFAULT',
      riskLevel: 'LOW'
    },
    ai: {
      provider: 'Sheikha Unified Chat',
      model: 'Model Executor',
      route: '/api/sheikha/unified-chat'
    },
    apis: {
      controlTower: '/api/sheikha/control-tower/status',
      enterprise: '/api/sheikha/enterprise-orchestrator/status',
      runtime: '/api/sheikha/runtime/status',
      governance: '/api/sheikha/governance/status',
      observability: '/api/sheikha/observability/status'
    }
  };
}

module.exports = { getEnterpriseState };
