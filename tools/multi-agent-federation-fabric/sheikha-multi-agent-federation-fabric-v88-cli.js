#!/usr/bin/env node
'use strict';

const {
  status,
  federationPlan
} = require('../../runtime/multi-agent-federation-fabric/v88/sheikha-multi-agent-federation-fabric-v88');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(federationPlan(), null, 2));
else process.exit(1);
