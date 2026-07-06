#!/usr/bin/env node
'use strict';

const {
  status,
  meshPlan
} = require('../../runtime/global-knowledge-mesh/v81/sheikha-global-knowledge-mesh-v81');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(meshPlan(), null, 2));
else process.exit(1);
