'use strict';

const fs = require('fs');

const report = {
  system: 'SHEIKHA_LICENSING_ENGINE_V1',
  status: 'ACTIVE',
  checks: {
    licensingEngine: fs.existsSync(
      'runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'
    ),
    licensesRegistry: fs.existsSync(
      'runtime/licensing-engine/v1/registries/licenses.json'
    )
  }
};

report.score =
  Object.values(report.checks).every(Boolean)
    ? 100
    : 0;

console.log(JSON.stringify(report, null, 2));
