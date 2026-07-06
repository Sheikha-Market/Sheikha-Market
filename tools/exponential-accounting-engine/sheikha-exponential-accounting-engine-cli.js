#!/usr/bin/env node
'use strict';

const {
  status,
  calculateExponentialAccounting
} = require('../../runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'calculate') {
  console.log(JSON.stringify(calculateExponentialAccounting({
    principal: process.argv[3] || 1000,
    rate: process.argv[4] || 0.10,
    periods: process.argv[5] || 12,
    contribution: process.argv[6] || 0
  }), null, 2));
} else {
  console.error('Usage: status | calculate <principal> <rate> <periods> <contribution>');
  process.exit(1);
}
