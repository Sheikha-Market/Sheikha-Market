#!/usr/bin/env node
'use strict';

const {
  status,
  recordEvent,
  learnFromReality,
  createProductionPlan,
  selfHeal
} = require('../../runtime/ai-supply-chain-living-production/v1/sheikha-ai-supply-chain-living-production-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'event') console.log(JSON.stringify(recordEvent({ factory: 'Factory A', material: 'Raw Steel', quantity: 100, delay: 2, defect: false, supplier: 'Supplier A', quality: 'standard' }), null, 2));
else if (cmd === 'learn') console.log(JSON.stringify(learnFromReality(), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(createProductionPlan({ demand: 1000, inventory: 300, supply: 200, capacity: 400 }), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHeal(), null, 2));
else {
  console.error('Usage: status | event | learn | plan | self-heal');
  process.exit(1);
}
