#!/usr/bin/env node
'use strict';

const { status, demoGraph, buildGraph } = require('../../runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(demoGraph(), null, 2));
else if (cmd === 'build') console.log(JSON.stringify(buildGraph({ entities: [], relations: [] }), null, 2));
else process.exit(1);
