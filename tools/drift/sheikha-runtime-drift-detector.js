'use strict';

const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const gitStatus = sh('git status --short');

const admission = JSON.parse(
  sh('node tools/governance/runtime-admission-controller.js')
);

const protectedRuntime = JSON.parse(
  sh('node tools/governance/protected-runtime-enforcer.js')
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
