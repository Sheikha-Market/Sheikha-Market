#!/usr/bin/env node
'use strict';

const {
  status,
  health,
  routeTask,
  saveVector
} = require('../../runtime/ha-ai-production-fabric/v1/sheikha-ha-ai-production-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'health') {
  console.log(JSON.stringify(health(), null, 2));
} else if (cmd === 'route') {
  console.log(JSON.stringify(routeTask(process.argv.slice(3).join(' ') || 'اختبار', 'smart'), null, 2));
} else if (cmd === 'vector') {
  console.log(JSON.stringify(saveVector(null, process.argv.slice(3).join(' ') || 'Sheikha vector memory test', { source: 'cli' }), null, 2));
} else {
  console.error('Usage: status|health|route|vector');
  process.exit(1);
}
