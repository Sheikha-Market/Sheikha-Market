'use strict';

const path = require('path');
const { execFileSync } = require('child_process');
const { readStatus } = require('../governance/git-context-reader');

function run(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim();
}

const root = path.join(__dirname, '../..');
const gitStatus = readStatus({ untracked: true }).join('\n').trim();

const admission = JSON.parse(
  run(process.execPath, [path.join(root, 'tools/governance/runtime-admission-controller.js')])
);

const protectedRuntime = JSON.parse(
  run(process.execPath, [path.join(root, 'tools/governance/protected-runtime-enforcer.js')])
);

const drift =
  gitStatus ||
  admission.totals.blocked > 0 ||
  protectedRuntime.totals.forbiddenFiles > 0;

console.log(JSON.stringify({
  detector: 'SHEIKHA_RUNTIME_DRIFT_DETECTOR',
  status: drift ? 'DRIFT_DETECTED' : 'NO_DRIFT',
  gitClean: !gitStatus,
  admission: admission.totals,
  protectedRuntime: protectedRuntime.totals,
  principle: 'لا ضرر ولا ضرار'
}, null, 2));

process.exit(drift ? 1 : 0);
