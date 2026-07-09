'use strict';

const fs = require('fs');
const path = require('path');

const contractPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1.json';
const reportPath = 'runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json';
const benchmarkReportPath = 'runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json';
const communityReportPaths = [
  'runtime/community/sheikha-community-modeling-report.json',
  'runtime/community/sheikha-community-modeling-monitor-v1-report.json',
  'runtime/community-modeling/sheikha-community-modeling-monitor-v1.json',
  'runtime/community-modeling/sheikha-community-modeling-ignite-v1-report.json',
  'runtime/community/sheikha-community-modeling-ignite-v1-report.json',
  'runtime/community-modeling/latest.json',
  'runtime/community/latest.json'
];

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

function exists(file) {
  return fs.existsSync(file);
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
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
    liveComputeBenchmarkPresent: existsFn(benchmarkReportPath),
    packagePresent: existsFn('package.json'),
    serverPresent: existsFn('server.js')
  };
}

function buildReport(existsFn = exists) {
  const checks = buildChecks(existsFn);
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const benchmark = existsFn(benchmarkReportPath)
    ? safeReadJson(benchmarkReportPath)
    : null;

  return {
    system: contract.system,
    status: passed === total ? 'PASSED' : 'NEEDS_REVIEW',
    generatedAt: new Date().toISOString(),
    score: Math.round((passed / total) * 100),
    passed,
    total,
    checks,
    evidence: {
      communityReportPaths,
      benchmarkReportPath,
      liveComputeBenchmark: benchmark
    },
    contract,
    recommendation:
      passed === total
        ? 'Live compute benchmark is recorded. Keep production claims governed by the truth gate and measured evidence.'
        : 'Complete missing files and measured benchmark evidence before declaring full integration.'
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
  benchmarkReportPath,
  buildReport,
  communityReportPaths,
  hasCommunityReport,
  writeReport
};
