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

function getRemoteHeadCommit(remote, branch) {
  const line = safeGit(`git ls-remote --heads ${remote} ${branch}`);
  if (!line) {
    return null;
  }

  return line.split(/\s+/)[0] || null;
}

function listRemoteBranches(remote) {
  const branches = new Set();

  const localRefs = safeGit(`git for-each-ref --format='%(refname:short)' refs/remotes/${remote}`);
  if (localRefs) {
    for (const ref of localRefs.split('\n').map((line) => line.trim()).filter(Boolean)) {
      if (!ref.startsWith(`${remote}/`) || ref.endsWith('/HEAD')) {
        continue;
      }

      branches.add(ref.slice(remote.length + 1));
    }
  }

  const remoteRefs = safeGit(`git ls-remote --heads ${remote}`);
  if (remoteRefs) {
    for (const line of remoteRefs.split('\n').map((value) => value.trim()).filter(Boolean)) {
      const parts = line.split(/\s+/);
      const headRef = parts[1] || '';
      if (!headRef.startsWith('refs/heads/')) {
        continue;
      }

      branches.add(headRef.replace('refs/heads/', ''));
    }
  }

  return [...branches];
}

function resolveRemoteRef(remote, preferredBranches) {
  const allBranches = [...preferredBranches, ...listRemoteBranches(remote)];
  const visited = new Set();

  for (const branch of allBranches) {
    if (!branch || visited.has(branch)) {
      continue;
    }
    visited.add(branch);

    const commit = safeGit(`git rev-parse ${remote}/${branch}`) || getRemoteHeadCommit(remote, branch);
    if (commit) {
      return { branch, commit };
    }
  }

  return {
    branch: allBranches.find(Boolean) || null,
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
