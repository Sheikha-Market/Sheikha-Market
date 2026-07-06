#!/usr/bin/env node
'use strict';

const fs = require('fs');

const requiredFiles = [
  'package.json',
  'server.js',
  'runtime/execution-cortex/sheikha-execution-cortex-omega.js',
  'protocol/sheikha-vscode-protocol/sheikha-vscode-protocol-v1.json'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));

if (missing.length) {
  console.error(JSON.stringify({
    system: 'SHEIKHA_CONTRACT_VALIDATOR_V1',
    status: 'FAILED',
    missing
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  system: 'SHEIKHA_CONTRACT_VALIDATOR_V1',
  status: 'PASSED',
  checkedFiles: requiredFiles.length
}, null, 2));
