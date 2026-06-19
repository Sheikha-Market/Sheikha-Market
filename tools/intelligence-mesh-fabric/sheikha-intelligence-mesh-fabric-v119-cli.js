#!/usr/bin/env node
'use strict';

const {
  status,
  intelligencePlan
} = require('../../runtime/intelligence-mesh-fabric/v119/sheikha-intelligence-mesh-fabric-v119');

const cmd = process.argv[2] || 'status';

if (cmd === 'status')
  console.log(JSON.stringify(status(),null,2));
else if (cmd === 'demo')
  console.log(JSON.stringify(intelligencePlan(),null,2));
else
  process.exit(1);
