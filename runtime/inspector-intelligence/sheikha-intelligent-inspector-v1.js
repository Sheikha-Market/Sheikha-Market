'use strict';

const fs = require('fs');
const path = require('path');
const { summarize } = require('../log-intelligence/sheikha-smart-log-governance-v1');
const { collectEnterpriseInspector } = require('../../core/enterprise/sheikha-enterprise-inspector-v3');

const ROOT = process.env.SHEIKHA_ROOT || process.cwd();
const REPORT = path.join(ROOT, 'runtime/audit/sheikha-intelligent-inspector-latest.json');

function safeWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function collectIntelligentInspector(logLines = []) {
  const inspector = collectEnterpriseInspector();
  const logs = summarize(logLines);

  const risks = [];

  if (logs.counts.HAPROXY_HEALTH_CHECK > 0) {
    risks.push({
      id: 'HAPROXY_HEALTH_FLAP',
      severity: 'WARNING',
      safeRepair: true,
      action: 'Verify timeout check >= 10s and reload HAProxy only after config validation.'
    });
  }

  if (inspector.health?.diagnostics?.errors > 0) {
    risks.push({
      id: 'VSCODE_DIAGNOSTIC_ERRORS',
      severity: 'ERROR',
      safeRepair: false,
      action: 'Require human review before code changes.'
    });
  }

  if (inspector.git && inspector.git.clean === false) {
    risks.push({
      id: 'GIT_WORKSPACE_NOT_CLEAN',
      severity: 'WARNING',
      safeRepair: false,
      action: 'Review modified/untracked files before deployment.'
    });
  }

  const report = {
    success: true,
    engine: 'SHEIKHA_INTELLIGENT_INSPECTOR_V1',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    inspector,
    logGovernance: {
      engine: logs.engine,
      status: logs.status,
      counts: logs.counts,
      repairPlan: logs.repairPlan || []
    },
    risks,
    decision: risks.some((r) => r.severity === 'ERROR') ? 'ATTENTION' : 'HEALTHY',
    governance: {
      noDestructiveAutoRepair: true,
      noSecretAutoGeneration: true,
      configChangesRequireBackup: true,
      highImpactRequiresHumanReview: true
    }
  };

  safeWrite(REPORT, report);
  return report;
}

module.exports = { collectIntelligentInspector };
