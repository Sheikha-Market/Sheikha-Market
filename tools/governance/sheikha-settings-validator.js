#!/usr/bin/env node
'use strict';

const fs = require('fs');

const file = '.vscode/settings.json';
const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

const required = [
  '"todo-tree.ripgrep": "/usr/bin/rg"',
  '"python.defaultInterpreterPath"',
  '"github.copilot.enable"'
];

const missing = required.filter((item) => !text.includes(item));

if (missing.length) {
  console.error(JSON.stringify({
    system: 'SHEIKHA_SETTINGS_VALIDATOR_V1',
    status: 'FAILED',
    missing
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  system: 'SHEIKHA_SETTINGS_VALIDATOR_V1',
  status: 'PASSED',
  checkedSettings: required.length
}, null, 2));
