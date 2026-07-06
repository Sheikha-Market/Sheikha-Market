'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const status = sh('git status --short');

if (status) {
  console.error(JSON.stringify({
    rollback: 'BLOCKED',
    reason: 'Working tree not clean',
    status
  }, null, 2));
  process.exit(1);
}

const tag = process.argv[2];

if (!tag) {
  console.error(JSON.stringify({
    rollback: 'BLOCKED',
    reason: 'Missing rollback tag'
  }, null, 2));
  process.exit(1);
}

const tags = sh('git tag').split('\n');

if (!tags.includes(tag)) {
  console.error(JSON.stringify({
    rollback: 'BLOCKED',
    reason: 'Tag not found',
    tag
  }, null, 2));
  process.exit(1);
}

const timestamp = new Date().toISOString();

const record = {
  rollback: 'SHEIKHA_RUNTIME_ROLLBACK',
  status: 'READY',
  tag,
  timestamp,
  principle: 'لا ضرر ولا ضرار'
};

fs.mkdirSync(
  'runtime/recovery/rollback',
  { recursive: true }
);

const file =
  `runtime/recovery/rollback/rollback-${timestamp.replace(/[:.]/g, '-')}.json`;

fs.writeFileSync(
  file,
  JSON.stringify(record, null, 2)
);

console.log(JSON.stringify({
  status: 'ROLLBACK_READY',
  tag,
  record: file
}, null, 2));
