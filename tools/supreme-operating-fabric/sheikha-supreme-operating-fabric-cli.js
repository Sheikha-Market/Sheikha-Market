#!/usr/bin/env node
'use strict';

const {
  status,
  health,
  plan
} = require('../../runtime/supreme-operating-fabric/v1/sheikha-supreme-operating-fabric-v1');

const cmd = process.argv[2] || 'status';
const msg = process.argv.slice(3).join(' ') || 'اختبار طبقة التشغيل العليا';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'health') {
  console.log(JSON.stringify(health(), null, 2));
} else if (cmd === 'plan') {
  console.log(JSON.stringify(plan(msg, 'smart'), null, 2));
} else {
  console.error('Usage: status|health|plan <message>');
  process.exit(1);
}
