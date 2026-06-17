#!/usr/bin/env node
'use strict';

const {
  status,
  governRequest
} = require('../../runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1');

const cmd = process.argv[2] || 'status';
const msg = process.argv.slice(3).join(' ');

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'govern') {
  console.log(JSON.stringify(governRequest(msg), null, 2));
} else {
  console.error('Usage: status|govern <message>');
  process.exit(1);
}
