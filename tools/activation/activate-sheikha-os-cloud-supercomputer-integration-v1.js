'use strict';

const fs = require('fs');
const path = require('path');

const contractPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1.json';
const reportPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json';

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

function exists(file) {
  return fs.existsSync(file);
}

const checks = {
  contractPresent: exists(contractPath),
  identityReportPresent: exists('runtime/identity/sheikha-active-identity-v2-report.json'),
  productionTruthGatePresent: exists('runtime/production-truth-gate/sheikha-production-truth-gate-v4.json'),
  communityReportPresent:
    exists('runtime/community-modeling/sheikha-community-modeling-ignite-v1-report.json') ||
    exists('runtime/community/sheikha-community-modeling-ignite-v1-report.json'),
  packagePresent: exists('package.json'),
  serverPresent: exists('server.js')
};

const passed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;

const report = {
  system: contract.system,
  status: passed === total ? 'PASSED' : 'NEEDS_REVIEW',
  generatedAt: new Date().toISOString(),
  score: Math.round((passed / total) * 100),
  passed,
  total,
  checks,
  contract,
  recommendation:
    passed === total
      ? 'Run live health endpoints, compute benchmark, cloud deployment check, and commit as integration gate.'
      : 'Complete missing files before declaring full integration.'
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
