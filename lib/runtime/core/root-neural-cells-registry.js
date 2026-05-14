const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeGit(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return null;
  }
}

function readLastSyncTimestamp(rootDir) {
  const auditFile = path.join(rootDir, 'logs', 'sync-audit.ndjson');
  if (!fs.existsSync(auditFile)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(auditFile, 'utf8').trim();
    if (!raw) {
      return null;
    }

    const entries = raw.split('\n').filter(Boolean);
    const lastEntry = JSON.parse(entries[entries.length - 1]);
    return lastEntry.timestamp || null;
  } catch (_) {
    return null;
  }
}

function getNeuralCellsStatus(rootDir = process.cwd()) {
  const originCommit = safeGit('git rev-parse origin/stable/runtime-baseline');
  const enterpriseCommit = safeGit('git rev-parse enterprise/stable/runtime-baseline');

  const hasOrigin = Boolean(safeGit('git remote get-url origin'));
  const hasEnterprise = Boolean(safeGit('git remote get-url enterprise'));

  return {
    network: 'SHEIKHA Root Neural Cells Network',
    status: 'active',
    lastSync: readLastSyncTimestamp(rootDir),
    cells: {
      primary: 'Sheikha-Market/sheikha-main-portal',
      strategic: 'Sheikha-top/sheikha-enterprise-portal'
    },
    origin: {
      branch: 'stable/runtime-baseline',
      commit: originCommit,
      remoteConfigured: hasOrigin,
      status: originCommit ? 'ready' : 'unknown'
    },
    enterprise: {
      branch: 'stable/runtime-baseline',
      commit: enterpriseCommit,
      remoteConfigured: hasEnterprise,
      status: enterpriseCommit ? 'ready' : 'degraded',
      lag: originCommit && enterpriseCommit && originCommit === enterpriseCommit ? 0 : null
    },
    runtime: {
      syncScript: 'scripts/sync-neural-cells.sh',
      policyDoc: 'docs/deployment/MULTI-REPO-SYNC-POLICY.md'
    }
  };
}

module.exports = {
  getNeuralCellsStatus
};
