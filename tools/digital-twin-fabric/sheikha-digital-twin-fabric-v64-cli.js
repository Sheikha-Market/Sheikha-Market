#!/usr/bin/env node
'use strict';

const {
  status,
  createTwin,
  demoTwin
} = require('../../runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoTwin(), null, 2));
else if (cmd === 'twin') console.log(JSON.stringify(createTwin({ name: 'Manual Twin', type: 'GENERAL' }), null, 2));
else process.exit(1);
