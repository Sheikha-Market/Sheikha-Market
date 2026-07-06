#!/usr/bin/env node
'use strict';

const {
  status,
  connectorPlan
} = require('../../runtime/universal-connector-fabric/v116/sheikha-universal-connector-fabric-v116');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
}
else if (cmd === 'demo') {
  console.log(JSON.stringify(connectorPlan(), null, 2));
}
else {
  process.exit(1);
}
