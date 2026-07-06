'use strict';

const os = require('os');
const { execSync } = require('child_process');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const report = {
  checker: 'SHEIKHA_COMPUTER_ARCHITECTURE_CHECK',
  status: 'ACTIVE',
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch(),
  cpuCount: os.cpus().length,
  memoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
  node: process.version,
  kernel: sh('uname -r'),
  gitClean: !sh('git status --short'),
  principle: 'لا ضرر ولا ضرار'
};

console.log(JSON.stringify(report, null, 2));
