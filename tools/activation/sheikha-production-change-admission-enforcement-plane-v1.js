'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const enforcement = require(
  '../../core/production-safety/sheikha-production-change-admission-enforcement-plane-v1'
);

const candidateMainHead =
  '8c3404d7a7c102fe3ff483e3b2fc53dc5e598412';

const payloadSha256 =
  'c5c1d3533f91e05ecf6a6130f6fdc6c3daa04ee5326596a92eef7be1c8a7a50c';

const scopePaths = [
  'package.json',
  'server.js'
];

const approvalRecord = {
  system:
    enforcement.APPROVAL_RECORD_SYSTEM,
  approvalChannel:
    enforcement.APPROVAL_CHANNEL,
  authority:
    enforcement.AUTHORITY,
  approverId:
    'SALMAN_AHMED_SALMAN_AL_RAJEH',
  candidateMainHead,
  payloadSha256,
  scopePaths,
  approved: true,
  identityProofClaimed: false,
  rollbackRequired: true,
  packageInstallAllowed: false,
  cleanupAllowed: false
};

const temporaryDirectory =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      'sheikha-enforcement-plane-'
    )
  );

const approvalPath =
  path.join(
    temporaryDirectory,
    'approval-record.json'
  );

fs.writeFileSync(
  approvalPath,
  JSON.stringify(
    approvalRecord,
    null,
    2
  ) + '\n',
  {
    encoding: 'utf8',
    mode: 0o600
  }
);

const approvalSha256 =
  crypto
    .createHash('sha256')
    .update(
      fs.readFileSync(
        approvalPath
      )
    )
    .digest('hex');

const request = {
  source:
    'LOCAL_CONTROLLED_WORKFLOW',
  executionBoundary:
    enforcement.EXECUTION_BOUNDARY,
  candidateMainHead,
  payloadSha256,
  scopePaths,
  baselineVerified: true,
  operationalAssuranceVerified: true,
  driftClassification:
    'NO_OPERATIONAL_DRIFT',
  criticalFailedCheckCount: 0,
  currentStateHealthy: true,
  rollbackReady: true,
  packageInstallRequested: false,
  cleanupRequested: false
};

const gateAssessment = {
  status:
    'AWAITING_HUMAN_APPROVAL',
  admissionGranted: false,
  authority:
    'HUMAN_ONLY',
  trustedHumanApproval: false
};

const verification =
  enforcement.verify();

const admitted =
  enforcement.assessControlledPromotion({
    request,
    gateAssessment,
    approvalRecordPath:
      approvalPath,
    expectedApprovalRecordSha256:
      approvalSha256
  });

const denied =
  enforcement.assessControlledPromotion({
    request: {
      ...request,
      approved: true
    },
    gateAssessment,
    approvalRecordPath:
      approvalPath,
    expectedApprovalRecordSha256:
      approvalSha256
  });

fs.rmSync(
  temporaryDirectory,
  {
    recursive: true,
    force: true
  }
);

const checks = {
  verificationPassed:
    verification.passed === true,
  admitted:
    admitted
      .controlledWorkflowAdmissionGranted
      === true,
  noExecution:
    admitted
      .productionExecutionPerformed
      === false,
  deniedExternalField:
    denied
      .controlledWorkflowAdmissionGranted
      === false,
  deniedSafeHold:
    denied.status === 'SAFE_HOLD'
};

const failedChecks = Object.entries(
  checks
)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const output = {
  system:
    enforcement.SYSTEM,
  status:
    failedChecks.length
      ? 'FAILED'
      : 'READY',
  authority:
    enforcement.AUTHORITY,
  executionBoundary:
    enforcement.EXECUTION_BOUNDARY,
  checks,
  failedChecks
};

process.stdout.write(
  JSON.stringify(
    output,
    null,
    2
  ) + '\n'
);

if (failedChecks.length) {
  process.exit(1);
}

process.stdout.write(
  'PRODUCTION_CHANGE_ADMISSION_ENFORCEMENT_PLANE_READY\n'
);
