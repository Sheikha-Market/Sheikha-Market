'use strict';

const fs = require('node:fs');
const path = require('node:path');

const gate = require(
  '../../core/production-safety/'
  + 'sheikha-production-change-admission-gate-v1'
);

const runtimePath = path.resolve(
  __dirname,
  '../../runtime/production-safety/'
  + 'sheikha-production-change-admission-gate-v1.json'
);

const runtime = JSON.parse(
  fs.readFileSync(
    runtimePath,
    'utf8'
  )
);

const status = gate.status();
const verification = gate.verify();

const exampleRequest = {
  changeClass:
    'HIGH_IMPACT_PRODUCTION_CHANGE',
  impactLevel: 'HIGH',
  driftClassification:
    'NO_OPERATIONAL_DRIFT',
  baselineVerified: true,
  operationalAssuranceVerified: true,
  currentStateHealthy: true,
  criticalFailedCheckCount: 0,
  evidenceComplete: true,
  changeScope: [
    'server.js',
    'package.json'
  ],
  testsPassed: true,
  currentReleaseVerified: true,
  rollbackReady: true,
  endpointsVerified: true,
  contractsVerified: true,
  storageWithinLimit: true,
  retentionVerified: true,
  packagePlanVerified: true,
  deploymentPlanVerified: true,
  postDeploymentVerificationPlanned:
    true,
  humanApproval: true
};

const example = gate
  .assessProductionChangeAdmission(
    exampleRequest
  );

const runtimeChecks = {
  system:
    runtime.system === status.system,
  status:
    runtime.status === status.status,
  mode:
    runtime.mode === status.mode,
  authority:
    runtime.authority
      === status.authority,
  failClosed:
    runtime.failClosed
      === status.failClosed,
  failClosedDecision:
    runtime.failClosedDecision
      === status.failClosedDecision,
  technicalGateCount:
    runtime.technicalGates.length
      === status.technicalGates.length,
  decisionPipelineCount:
    runtime.decisionPipeline.length
      === status.decisionPipeline.length,
  cleanupDenied:
    runtime.technicalBoundaries
      .cleanupAuthorized === false,
  externalApprovalDenied:
    runtime.technicalBoundaries
      .externalRequestMayGrantApproval
      === false
};

const runtimePassed = Object.values(
  runtimeChecks
).every(Boolean);

const output = {
  status,
  verification,
  runtimeVerification: {
    checks: runtimeChecks,
    passed: runtimePassed
  },
  example
};

console.log(
  JSON.stringify(
    output,
    null,
    2
  )
);

if (
  !verification.passed
  || !runtimePassed
) {
  process.exit(1);
}

console.log(
  'PRODUCTION_CHANGE_ADMISSION_GATE_READY'
);
