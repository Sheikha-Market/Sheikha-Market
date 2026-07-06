'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const status = sh('git status --short');

if (status) {
  console.error(JSON.stringify({
    release: 'BLOCKED',
    reason: 'Working tree is not clean',
    status
  }, null, 2));
  process.exit(1);
}

const admission = JSON.parse(
  sh("node tools/governance/runtime-admission-controller.js")
);

if (admission.totals.blocked !== 0) {
  console.error(JSON.stringify({
    release: 'BLOCKED',
    reason: 'Blocked files detected',
    totals: admission.totals
  }, null, 2));
  process.exit(1);
}

const sha = sh('git rev-parse HEAD');
const branch = sh('git branch --show-current');
const timestamp = new Date().toISOString();

const record = {
  release: 'SHEIKHA_GOVERNED_RUNTIME_RELEASE',
  status: 'READY',
  branch,
  sha,
  timestamp,
  principle: 'لا ضرر ولا ضرار'
};

fs.mkdirSync('runtime/releases/records', { recursive: true });

const file =
  `runtime/releases/records/release-${timestamp.replace(/[:.]/g, '-')}.json`;

fs.writeFileSync(file, JSON.stringify(record, null, 2));

console.log(JSON.stringify({
  status: 'RELEASE_READY',
  record: file,
  sha,
  branch
}, null, 2));
