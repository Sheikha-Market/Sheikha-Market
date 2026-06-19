#!/usr/bin/env node
'use strict';

const { status, capabilityPlan } = require('../../runtime/capability-registry-mesh-fabric/v123/sheikha-capability-registry-mesh-fabric-v123');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'demo') console.log(JSON.stringify(capabilityPlan(), null, 2));
else process.exit(1);
