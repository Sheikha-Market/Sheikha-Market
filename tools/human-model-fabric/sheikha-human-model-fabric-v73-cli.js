#!/usr/bin/env node
'use strict';

const {
  status,
  educationPlan
} = require('../../runtime/human-model-fabric/v73/sheikha-human-model-fabric-v73');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(educationPlan(), null, 2));
else process.exit(1);
