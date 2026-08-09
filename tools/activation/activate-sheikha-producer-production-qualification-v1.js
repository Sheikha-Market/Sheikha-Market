#!/usr/bin/env node
'use strict';

const {
  FILES,
  buildActivationArtifacts,
  writeJson
} = require(
  '../../core/production-qualification/' +
  'sheikha-producer-production-qualification-v1'
);

function activate(options = {}) {
  const artifacts = buildActivationArtifacts(options);
  writeJson(FILES.requirements, artifacts.requirements, options);
  writeJson(
    FILES.administrativeIndex,
    artifacts.administrativeIndex,
    options
  );
  writeJson(
    FILES.engineeringIndex,
    artifacts.engineeringIndex,
    options
  );
  writeJson(
    FILES.productionIndex,
    artifacts.productionIndex,
    options
  );
  writeJson(
    FILES.productReadiness,
    artifacts.productReadiness,
    options
  );
  writeJson(FILES.report, artifacts.report, options);
  return artifacts.report;
}

if (require.main === module) {
  const report = activate();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    passed: report.passed,
    coverage: report.coverage,
    failedChecks: report.failedChecks,
    report: FILES.report
  }, null, 2));
  if (!report.passed) process.exitCode = 1;
}

module.exports = {
  activate
};
