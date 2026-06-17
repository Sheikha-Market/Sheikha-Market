#!/usr/bin/env node
'use strict';

const {
  status,
  health,
  plan
} = require('../../runtime/autonomous-enterprise-fabric/v1/sheikha-autonomous-enterprise-fabric-v1');

const cmd = process.argv[2] || 'status';
const arg = process.argv.slice(3).join(' ');

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'health') {
  console.log(JSON.stringify(health(), null, 2));
} else if (cmd === 'plan') {
  console.log(JSON.stringify(plan(arg || 'اصلح الشات والاكستنشن'), null, 2));
} else {
  console.error('Usage: status|health|plan');
  process.exit(1);
}
