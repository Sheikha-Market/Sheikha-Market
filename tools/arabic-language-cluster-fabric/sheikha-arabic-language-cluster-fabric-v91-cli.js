#!/usr/bin/env node
'use strict';

const { status, languagePlan } = require('../../runtime/arabic-language-cluster-fabric/v91/sheikha-arabic-language-cluster-fabric-v91');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(languagePlan(), null, 2));
else process.exit(1);
