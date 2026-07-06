#!/usr/bin/env node
'use strict';

const {
  status,
  healingPlan
} = require('../../runtime/self-healing-fabric/v74/sheikha-self-healing-fabric-v74');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(healingPlan(), null, 2));
else process.exit(1);
