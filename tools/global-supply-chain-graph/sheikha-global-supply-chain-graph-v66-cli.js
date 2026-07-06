#!/usr/bin/env node
'use strict';

const { status, buildSupplyChain } = require('../../runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(buildSupplyChain(), null, 2));
else process.exit(1);
