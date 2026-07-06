#!/usr/bin/env node
'use strict';

const { status, navigatorPlan } = require('../../runtime/sheikha-navigator-fabric/v111/sheikha-navigator-fabric-v111');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(navigatorPlan(), null, 2));
else process.exit(1);
