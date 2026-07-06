#!/usr/bin/env node
'use strict';

const { status, livingTwinPlan } = require('../../runtime/living-digital-twin-agriculture-fabric/v125/sheikha-living-digital-twin-agriculture-fabric-v125');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(livingTwinPlan(), null, 2));
else process.exit(1);
