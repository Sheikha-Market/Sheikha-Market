'use strict';

const fs = require('fs');
const path = require('path');

const contractPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1.json';
const reportPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json';
const communityReportPaths = [
  'runtime/community/sheikha-community-modeling-report.json',
  'runtime/community/sheikha-community-modeling-monitor-v1-report.json',
  'runtime/community-modeling/sheikha-community-modeling-ignite-v1-report.json',
  'runtime/community/sheikha-community-modeling-ignite-v1-report.json'
];

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

function exists(file) {
  return fs.existsSync(file);
}

function hasCommunityReport(existsFn = exists) {
  return communityReportPaths.some((filePath) => existsFn(filePath));
}

function buildChecks(existsFn = exists) {
  return {
    contractPresent: existsFn(contractPath),
    identityReportPresent: existsFn('runtime/identity/sheikha-active-identity-v2-report.json'),
    productionTruthGatePresent: existsFn('runtime/production-truth-gate/sheikha-production-truth-gate-v4.json'),
    communityReportPresent: hasCommunityReport(existsFn),
    packagePresent: existsFn('package.json'),
    serverPresent: existsFn('server.js')
  };
}

function buildReport(existsFn = exists) {
  const checks = buildChecks(existsFn);
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
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
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(writeReport(), null, 2));
}

module.exports = {
  buildChecks,
  buildReport,
  communityReportPaths,
  hasCommunityReport,
  writeReport
};
