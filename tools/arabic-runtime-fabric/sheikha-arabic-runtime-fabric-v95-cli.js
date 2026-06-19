#!/usr/bin/env node
'use strict';

const { status, runtimePlan } = require('../../runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(runtimePlan(), null, 2));
else process.exit(1);
