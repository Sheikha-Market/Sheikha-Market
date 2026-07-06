#!/usr/bin/env node
'use strict';

const {
  status,
  sovereignPlan
} = require('../../runtime/sovereign-intelligence-fabric/v84/sheikha-sovereign-intelligence-fabric-v84');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(sovereignPlan(), null, 2));
else process.exit(1);
