#!/usr/bin/env node
'use strict';

const { status, typePlan } = require('../../runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(typePlan(), null, 2));
else process.exit(1);
