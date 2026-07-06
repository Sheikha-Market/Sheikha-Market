'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const tag = process.argv[2];

if (!tag) {
  console.error('Usage: node sheikha-production-promotion.js <release-tag>');
  process.exit(1);
}

const status = sh('git status --short');

if (status) {
  console.error(JSON.stringify({
    promotion: 'BLOCKED',
    reason: 'Working tree not clean',
    status
  }, null, 2));
  process.exit(1);
}

const drift = JSON.parse(
  sh('node tools/drift/sheikha-runtime-drift-detector.js')
);

if (drift.status !== 'NO_DRIFT') {
  console.error(JSON.stringify({
    promotion: 'BLOCKED',
    reason: 'Runtime drift detected',
    drift
  }, null, 2));
  process.exit(1);
}

const tags = sh('git tag').split('\n');

if (!tags.includes(tag)) {
  console.error(JSON.stringify({
    promotion: 'BLOCKED',
    reason: 'Release tag not found',
    tag
  }, null, 2));
  process.exit(1);
}

const sha = sh('git rev-parse HEAD');
const timestamp = new Date().toISOString();

const record = {
  promotion: 'SHEIKHA_PRODUCTION_PROMOTION',
  status: 'READY',
  tag,
  sha,
  timestamp,
  principle: 'لا ضرر ولا ضرار'
};

fs.mkdirSync('runtime/promotion/records', { recursive: true });

const file =
  `runtime/promotion/records/promotion-${timestamp.replace(/[:.]/g, '-')}.json`;

fs.writeFileSync(file, JSON.stringify(record, null, 2));

console.log(JSON.stringify({
  status: 'PROMOTION_READY',
  tag,
  sha,
  record: file
}, null, 2));
