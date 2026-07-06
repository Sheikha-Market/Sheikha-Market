#!/usr/bin/env node
'use strict';

const {
  status,
  meshPlan
} = require('../../runtime/autonomous-service-mesh-fabric/v115/sheikha-autonomous-service-mesh-fabric-v115');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'demo') {
  console.log(JSON.stringify(meshPlan(), null, 2));
} else {
  process.exit(1);
}
