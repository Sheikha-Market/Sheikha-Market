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

function status(base = {}) {
  const mem = process.memoryUsage();
  const baseRuntime = base.runtime || {};
  const baseGit = base.git || {};

  return {
    success: true,
    platform: 'SHEIKHA_EXECUTIVE_PLATFORM_V2',
    status: 'ACTIVE',
    layers: {
      executiveControlTower: 'ACTIVE',
      governanceCenter: 'ACTIVE',
      aiOperationsCenter: 'ACTIVE',
      unifiedChatTimeline: 'ACTIVE',
      enterpriseArchitectureGraph: 'ACTIVE',
      arabicExecutiveLanguageEngine: 'ACTIVE',
      enterpriseKnowledgeFabric: 'ACTIVE'
    },
    runtime: {
      cpuLoad: baseRuntime.cpuLoad1m ?? os.loadavg()[0],
      ramUsedPercent: baseRuntime.ramUsedPercent ?? Math.round((1 - os.freemem() / os.totalmem()) * 100),
      heapUsedMb: baseRuntime.heapUsedMb ?? Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: baseRuntime.heapTotalMb ?? Math.round(mem.heapTotal / 1024 / 1024),
      uptimeSeconds: baseRuntime.uptimeSeconds ?? Math.round(process.uptime())
    },
    git: {
      branch: baseGit.branch ?? sh('git rev-parse --abbrev-ref HEAD'),
      status: baseGit.status ?? sh('git status --short'),
      aheadBehind: baseGit.aheadBehind ?? sh('git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "غير متاح"')
    },
    governance: {
      policies: 'ACTIVE',
      capabilityTokens: 'ACTIVE',
      decisionRegistry: 'ACTIVE',
      executionContracts: 'ACTIVE',
      riskLevel: 'LOW'
    },
    ai: {
      provider: 'Sheikha Unified Chat',
      model: 'Model Executor',
      route: '/api/sheikha/unified-chat',
      timeline: [
        'Intent Classification',
        'Governance Review',
        'Capability Resolution',
        'Execution Pipeline',
        'Arabic Executive Response'
      ]
    },
    inspector: {
      dashboard: 'EXECUTIVE_DASHBOARD_V2',
      liveRefreshSeconds: 5,
      panels: [
        'Runtime',
        'Git',
        'Workspace',
        'Diagnostics',
        'Governance',
        'AI',
        'APIs',
        'Observability',
        'Architecture Graph'
      ]
    }
  };
}

module.exports = { status };
