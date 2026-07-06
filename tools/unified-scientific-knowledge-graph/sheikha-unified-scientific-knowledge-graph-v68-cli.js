#!/usr/bin/env node
'use strict';

const {
  status,
  buildScienceGraph
} = require('../../runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(buildScienceGraph(), null, 2));
else process.exit(1);
