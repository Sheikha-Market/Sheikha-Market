#!/usr/bin/env node
'use strict';

const {
  status,
  monitor,
  unifiedPlan,
  selfHeal
} = require('../../runtime/global-industrial-ai-os/v1/sheikha-global-industrial-ai-os-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') console.log(JSON.stringify(status(), null, 2));
else if (cmd === 'monitor') console.log(JSON.stringify(monitor({ name: 'Satellite monitored refinery supply chain', domain: 'space logistics refinery', facility: 'Refinery A' }), null, 2));
else if (cmd === 'plan') console.log(JSON.stringify(unifiedPlan({ name: 'Energy and satellite supply chain AI production', domain: 'space satellite logistics energy robotics' }), null, 2));
else if (cmd === 'self-heal') console.log(JSON.stringify(selfHeal(), null, 2));
else {
  console.error('Usage: status | monitor | plan | self-heal');
  process.exit(1);
}
