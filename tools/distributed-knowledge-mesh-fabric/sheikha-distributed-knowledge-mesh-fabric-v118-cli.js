#!/usr/bin/env node
'use strict';

const {
  status,
  knowledgePlan
} = require('../../runtime/distributed-knowledge-mesh-fabric/v118/sheikha-distributed-knowledge-mesh-fabric-v118');

const cmd = process.argv[2] || 'status';

if (cmd === 'status')
  console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo')
  console.log(JSON.stringify(knowledgePlan(), null, 2));
else
  process.exit(1);
