#!/usr/bin/env node
'use strict';

const fabric = require(
  '../../core/production-federation/' +
  'sheikha-governed-production-federation-v1'
);

function activate(root = fabric.ROOT) {
  const artifacts = fabric.buildActivationArtifacts(root);

  fabric.writeJson(fabric.FILES.contract, artifacts.contract, root);
  fabric.writeJson(
    fabric.FILES.modelRegistry,
    artifacts.modelRegistry,
    root
  );
  fabric.writeJson(
    fabric.FILES.systemRegistry,
    artifacts.systemRegistry,
    root
  );
  fabric.writeJson(fabric.FILES.report, artifacts.report, root);

  return artifacts.report;
}

if (require.main === module) {
  const report = activate();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    passed: report.passed,
    internalLane: report.internalLane.status,
    verifiedInternalCapabilityCount:
      report.coverage.verifiedInternalCapabilityCount,
    externalLane: report.externalLane.status,
    externalProductionReadyAdapterCount:
      report.coverage.externalProductionReadyAdapterCount,
    output: report.output
  }, null, 2));
  if (!report.passed) process.exitCode = 1;
}

module.exports = Object.freeze({ activate });
