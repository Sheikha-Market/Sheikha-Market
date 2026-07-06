#!/usr/bin/env node
'use strict';

const { status, libraryPlan } = require('../../runtime/arabic-standard-library-fabric/v94/sheikha-arabic-standard-library-fabric-v94');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(libraryPlan(), null, 2));
else process.exit(1);
