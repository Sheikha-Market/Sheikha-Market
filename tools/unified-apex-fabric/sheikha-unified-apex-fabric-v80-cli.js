#!/usr/bin/env node
'use strict';

const {
  status,
  apexPlan
} = require('../../runtime/unified-apex-fabric/v80/sheikha-unified-apex-fabric-v80');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(apexPlan(), null, 2));
else process.exit(1);
