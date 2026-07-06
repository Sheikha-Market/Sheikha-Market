'use strict';

const fs = require('fs');
const path = require('path');

const {
  buildHumanDevelopmentFramework
} = require('../../core/human-development/sheikha-human-development-framework-v1');

const report = buildHumanDevelopmentFramework({
  source: 'human_civilizational_knowledge',
  purpose: 'earth_development_and_beneficial_decision_support'
});

fs.mkdirSync('runtime/human-development', { recursive: true });

fs.writeFileSync(
  path.join('runtime/human-development', 'sheikha-human-development-framework-v1-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
