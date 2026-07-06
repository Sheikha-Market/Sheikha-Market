#!/usr/bin/env node
'use strict';

const {
  status,
  executionPlan
} = require('../../runtime/strategic-execution-fabric/v86/sheikha-strategic-execution-fabric-v86');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'demo') {
  console.log(JSON.stringify(executionPlan(), null, 2));
}
