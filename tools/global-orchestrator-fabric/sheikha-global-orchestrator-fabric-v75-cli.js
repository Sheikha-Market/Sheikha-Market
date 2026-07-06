#!/usr/bin/env node
'use strict';

const {
  status,
  orchestrationPlan
} = require('../../runtime/global-orchestrator-fabric/v75/sheikha-global-orchestrator-fabric-v75');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(orchestrationPlan(), null, 2));
else process.exit(1);
