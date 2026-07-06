#!/usr/bin/env node
'use strict';

const {
  status,
  researchPlan
} = require('../../runtime/research-innovation-fabric/v72/sheikha-research-innovation-fabric-v72');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(researchPlan(), null, 2));
else process.exit(1);
