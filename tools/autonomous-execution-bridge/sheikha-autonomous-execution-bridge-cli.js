#!/usr/bin/env node
'use strict';

const {
  status,
  execute
} = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');

const cmd = process.argv[2] || 'status';
const msg = process.argv.slice(3).join(' ') || 'عرّف بنفسك باختصار';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'execute') {
  execute(msg, { mode: 'smart', timeoutMs: 180000, numPredict: 128 })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  console.error('Usage: status|execute <message>');
  process.exit(1);
}
