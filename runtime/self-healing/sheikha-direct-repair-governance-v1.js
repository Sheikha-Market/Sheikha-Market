'use strict';

const fs = require('fs');
const cp = require('child_process');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', timeout: 15000 }).trim();
  } catch (e) {
    return String(e.stderr || e.stdout || e.message || e).trim();
  }
}

function gitReport() {
  return {
    branch: sh('git branch --show-current'),
    status: sh('git status --short'),
    lastCommit: sh('git log -1 --oneline'),
    aheadBehind: sh('git rev-list --left-right --count HEAD...@{u} 2>/dev/null || true')
  };
}

function evaluateAlert(alert = {}) {
  const severity = String(alert.severity || 'info').toLowerCase();
  const kind = String(alert.kind || 'general');

  const blocked = severity === 'critical' || severity === 'high';

  return {
    success: true,
    engine: 'SHEIKHA_DIRECT_REPAIR_GOVERNANCE_V1',
    decision: blocked ? 'BLOCK_DIRECT_FIX_REQUIRE_REVIEW' : 'ALLOW_SAFE_DIRECT_FIX',
    kind,
    severity,
    rules: {
      noForce: true,
      noBreakingUpgradeWithoutReview: true,
      noSecretExposure: true,
      requireGitReport: true,
      requireRegistryRecord: true,
      requireLintAndTests: true,
      highImpactNeedsHumanReview: true
    },
    git: gitReport()
  };
}

function registerRepair(record = {}) {
  const file = 'registry/security/sheikha-direct-repair-registry-v1.json';
  let list = [];
  if (fs.existsSync(file)) {
    try { list = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  }

  const item = {
    id: `repair-${Date.now()}`,
    at: new Date().toISOString(),
    engine: 'SHEIKHA_DIRECT_REPAIR_GOVERNANCE_V1',
    ...record,
    git: gitReport()
  };

  list.push(item);
  fs.writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
  return item;
}

module.exports = { evaluateAlert, registerRepair, gitReport };
