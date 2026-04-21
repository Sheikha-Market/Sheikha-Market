const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeExec(command, cwd) {
  try {
    return execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 8000,
    }).trim();
  } catch (error) {
    return null;
  }
}

function parseRemotes(output) {
  if (!output) return [];
  const lines = output.split('\n').filter(Boolean);
  return lines.map((line) => {
    const parts = line.split(/\s+/);
    return {
      name: parts[0] || 'unknown',
      url: parts[1] || '',
      direction: (parts[2] || '').replace(/[()]/g, ''),
    };
  });
}

function getBranchHealth(repoPath) {
  const branch = safeExec('git branch --show-current', repoPath) || 'unknown';
  const status = safeExec('git status --short', repoPath) || '';
  const aheadBehind = safeExec('git status -sb', repoPath) || '';
  const dirtyCount = status ? status.split('\n').filter(Boolean).length : 0;

  return {
    branch,
    dirty: dirtyCount > 0,
    dirtyCount,
    summary: aheadBehind.split('\n')[0] || '',
  };
}

function getLastCommit(repoPath) {
  const sha = safeExec('git rev-parse HEAD', repoPath);
  const subject = safeExec('git log -1 --pretty=%s', repoPath);
  const author = safeExec('git log -1 --pretty=%an', repoPath);
  const when = safeExec('git log -1 --pretty=%cI', repoPath);

  return {
    sha,
    shortSha: sha ? sha.slice(0, 8) : null,
    subject,
    author,
    when,
  };
}

function getRemoteStatus(repoPath) {
  const remotes = parseRemotes(safeExec('git remote -v', repoPath));
  const grouped = {};

  for (const remote of remotes) {
    if (!grouped[remote.name]) {
      grouped[remote.name] = { name: remote.name, fetch: null, push: null };
    }
    if (remote.direction === 'fetch') grouped[remote.name].fetch = remote.url;
    if (remote.direction === 'push') grouped[remote.name].push = remote.url;
  }

  return Object.values(grouped);
}

function getRecentBranches(repoPath) {
  const output = safeExec('git for-each-ref --sort=-committerdate --format="%(refname:short)|%(committerdate:iso8601)|%(authorname)" refs/heads refs/remotes', repoPath);
  if (!output) return [];

  return output
    .split('\n')
    .filter(Boolean)
    .slice(0, 12)
    .map((line) => {
      const [name, updatedAt, author] = line.split('|');
      return { name, updatedAt, author };
    });
}

function buildGitState(repoPath) {
  const now = new Date().toISOString();
  const branchHealth = getBranchHealth(repoPath);
  const lastCommit = getLastCommit(repoPath);
  const remotes = getRemoteStatus(repoPath);
  const recentBranches = getRecentBranches(repoPath);

  return {
    ok: true,
    timestamp: now,
    repoPath,
    branchHealth,
    lastCommit,
    remotes,
    recentBranches,
    providers: {
      github: remotes.some((r) => /github/i.test((r.fetch || '') + (r.push || ''))),
      gitlab: remotes.some((r) => /gitlab/i.test((r.fetch || '') + (r.push || ''))),
    },
  };
}

function saveGitState(repoPath, outFile) {
  const state = buildGitState(repoPath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

module.exports = {
  buildGitState,
  saveGitState,
};
