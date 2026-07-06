'use strict';

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const clean = sh('git status --short');

if (clean) {
  console.error(JSON.stringify({
    release: 'BLOCKED',
    reason: 'Working tree not clean'
  }, null, 2));
  process.exit(1);
}

const tag = process.argv[2];

if (!tag) {
  console.error('Usage: node sheikha-release-manager.js <tag>');
  process.exit(1);
}

const commit = sh('git rev-parse HEAD');

const payload = {
  release: tag,
  commit,
  createdAt: new Date().toISOString(),
  governance: 'ACTIVE',
  principle: 'لا ضرر ولا ضرار'
};

const hash = crypto
  .createHash('sha256')
  .update(JSON.stringify(payload))
  .digest('hex');

payload.sha256 = hash;

const path =
  `runtime/releases/manifests/${tag}.json`;

fs.writeFileSync(
  path,
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status: 'RELEASE_READY',
  manifest: path,
  sha256: hash
}, null, 2));
