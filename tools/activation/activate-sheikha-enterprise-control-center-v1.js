'use strict';

const fs = require('fs');
const { buildEnterprisePluginRegistry } = require('../../core/enterprise-plugin-registry/sheikha-enterprise-plugin-registry-v1');

const report = buildEnterprisePluginRegistry();

fs.mkdirSync('runtime/enterprise-control-center', { recursive: true });
fs.mkdirSync('public/enterprise-control-center', { recursive: true });

fs.writeFileSync(
  'runtime/enterprise-control-center/sheikha-enterprise-control-center-v1-report.json',
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  'public/enterprise-control-center/status.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
