#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const dir = 'runtime/incidents';
fs.mkdirSync(dir, { recursive: true });

const incident = {
  system: 'SHEIKHA_ROOT_CAUSE_ENGINE_V1',
  status: 'ACTIVE',
  generatedAt: new Date().toISOString(),
  incident: {
    name: 'CONFIGURATION_REGRESSION_PREVENTION',
    rootCause: 'Replace settings file instead of merge',
    impact: 'Removed required workspace contract keys',
    prevention: [
      'validate required settings before commit',
      'merge configuration changes instead of overwriting',
      'run sheikha-settings-validator before promotion'
    ]
  }
};

const file = path.join(dir, `root-cause-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(incident, null, 2));

console.log(JSON.stringify({
  ...incident,
  file
}, null, 2));
