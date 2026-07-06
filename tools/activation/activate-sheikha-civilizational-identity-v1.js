'use strict';

const fs = require('fs');
const { buildCivilizationalIdentity } = require('../../core/identity/sheikha-civilizational-identity-v1');

const report = buildCivilizationalIdentity();

fs.mkdirSync('runtime/identity', { recursive: true });
fs.mkdirSync('public/identity-system', { recursive: true });

fs.writeFileSync(
  'runtime/identity/sheikha-civilizational-identity-v1-report.json',
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  'public/identity-system/identity.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
