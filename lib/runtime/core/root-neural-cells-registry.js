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

function resolveRemoteRef(remote, preferredBranches) {
  for (const branch of preferredBranches) {
    const commit = safeGit(`git rev-parse ${remote}/${branch}`);
    if (commit) {
      return { branch, commit };
    }
  }

  return {
    branch: preferredBranches[0] || null,
    commit: null
  };
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
  const originRef = resolveRemoteRef('origin', [
    'stable/runtime-baseline',
    'main',
    'master',
    'feature/targeted-improvement'
  ]);
  const enterpriseRef = resolveRemoteRef('enterprise', [
    'stable/runtime-baseline',
    'main',
    'master'
  ]);

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
      branch: originRef.branch,
      commit: originRef.commit,
      remoteConfigured: hasOrigin,
      status: originRef.commit ? 'ready' : 'unknown'
    },
    enterprise: {
      branch: enterpriseRef.branch,
      commit: enterpriseRef.commit,
      remoteConfigured: hasEnterprise,
      status: enterpriseRef.commit ? 'ready' : 'degraded',
      lag: originRef.commit && enterpriseRef.commit && originRef.commit === enterpriseRef.commit ? 0 : null
    },
    runtime: {
      syncScript: 'tools/neural/sync-neural-cells.sh',
      policyDoc: 'docs/deployment/MULTI-REPO-SYNC-POLICY.md'
    }
  };
}

module.exports = {
  getNeuralCellsStatus
};
