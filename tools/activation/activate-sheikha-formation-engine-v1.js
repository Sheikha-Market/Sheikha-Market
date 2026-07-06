'use strict';

const fs = require('fs');
const { buildFormationEngine } = require('../../core/formation-engine/sheikha-formation-engine-v1');

const report = buildFormationEngine();

fs.mkdirSync('runtime/formation-engine', { recursive: true });

fs.writeFileSync(
  'runtime/formation-engine/sheikha-formation-engine-v1-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
