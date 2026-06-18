#!/usr/bin/env node
'use strict';

const {
  status,
  createEarthTwin
} = require('../../runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(createEarthTwin(), null, 2));
else process.exit(1);
