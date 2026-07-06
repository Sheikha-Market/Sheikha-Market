#!/usr/bin/env node
'use strict';

const {
  status,
  regenerativeKnowledgePlan
} = require('../../runtime/regenerative-knowledge-fabric/v128/sheikha-regenerative-knowledge-fabric-v128');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(regenerativeKnowledgePlan(), null, 2));
else process.exit(1);
