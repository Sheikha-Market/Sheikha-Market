'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

function readLines(file) {
  if (!file || !fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
}

function readStatus(options = {}) {
  const captured = readLines(process.env.SHEIKHA_GIT_STATUS_FILE);
  if (captured) return captured;

  const args = ['status', '--short'];
  if (options.untracked !== false) args.push('--untracked-files=all');
  return execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);
}

function readTrackedFiles() {
  const captured = readLines(process.env.SHEIKHA_GIT_TRACKED_FILE);
  if (captured) return new Set(captured);

  return new Set(
    execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)
  );
}

module.exports = { readStatus, readTrackedFiles };
