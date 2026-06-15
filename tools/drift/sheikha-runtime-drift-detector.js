'use strict';

const { readStatus } = require('../governance/git-context-reader');
const { runAdmissionController } = require('../governance/runtime-admission-controller');
const { run: runProtectedRuntime } = require('../governance/protected-runtime-enforcer');

const gitStatus = readStatus({ untracked: true }).join('\n').trim();
const admission = runAdmissionController();
const protectedRuntime = runProtectedRuntime();

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
