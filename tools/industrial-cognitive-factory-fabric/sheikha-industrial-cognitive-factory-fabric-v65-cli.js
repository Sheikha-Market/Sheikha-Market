#!/usr/bin/env node
'use strict';

const { status, demoPlan, factoryPlan } = require('../../runtime/industrial-cognitive-factory-fabric/v1/sheikha-industrial-cognitive-factory-fabric-v65');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoPlan(), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(factoryPlan({ name: 'Manual Factory Plan' }), null, 2));
else process.exit(1);
