#!/usr/bin/env node
'use strict';

const { status, executionPlan } = require('../../runtime/distributed-execution-mesh-fabric/v117/sheikha-distributed-execution-mesh-fabric-v117');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(executionPlan(), null, 2));
else process.exit(1);
