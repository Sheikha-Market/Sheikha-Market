#!/usr/bin/env node
'use strict';

const fs = require('fs');

const [, , cmd, file] = process.argv;

if (!cmd || ['help', '--help', '-h'].includes(cmd)) {
  console.log(`Sheikha CLI

Commands:
  check <file>      Check source file exists
  run <file>        Print source as runtime placeholder
  version           Show version
`);
  process.exit(0);
}

if (cmd === 'version') {
  console.log('SHEIKHA_CLI 1.0.0');
  process.exit(0);
}

if (!file || !fs.existsSync(file)) {
  console.error('File not found.');
  process.exit(1);
}

const source = fs.readFileSync(file, 'utf8');

if (cmd === 'check') {
  console.log(JSON.stringify({ status: 'OK', file, bytes: Buffer.byteLength(source) }, null, 2));
  process.exit(0);
}

if (cmd === 'run') {
  console.log(JSON.stringify({ status: 'READY', file, source }, null, 2));
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
