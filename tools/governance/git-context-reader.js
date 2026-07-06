'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

function readLines(file) {
  if (!file || !fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
}

function readGitLines(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' });
  } catch (error) {
    if (typeof error.stdout === 'string' && error.stdout.length > 0) {
      return error.stdout;
    }
    throw error;
  }
}

function readStatus(options = {}) {
  const captured = readLines(process.env.SHEIKHA_GIT_STATUS_FILE);
  if (captured) return captured;

  const scope = options.scope || process.env.SHEIKHA_GIT_STATUS_SCOPE || 'worktree';

  if (scope === 'staged') {
    return readGitLines(['status', '--short', '--untracked-files=no'])
      .split('\n')
      .filter(Boolean)
      .filter((line) => line[0] && line[0] !== ' ' && line[0] !== '?');
  }

  const args = ['status', '--short'];
  if (options.untracked !== false) args.push('--untracked-files=all');
  return readGitLines(args).split('\n').filter(Boolean);
}

function readTrackedFiles() {
  const captured = readLines(process.env.SHEIKHA_GIT_TRACKED_FILE);
  if (captured) return new Set(captured);

  return new Set(
    readGitLines(['ls-files']).split('\n').filter(Boolean)
  );
}

module.exports = { readStatus, readTrackedFiles };
