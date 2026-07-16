'use strict';

const governance = require(
  '../../core/production-safety/'
  + 'sheikha-production-risk-to-safe-governance-v1'
);

function main() {
  const status = governance.status();
  const verification = governance.verify();

  const example = governance.assessProductionRisk({
    driftClassification:
      'MULTIPLE_CRITICAL_DRIFT_CONDITIONS',
    baselineVerified: true,
    evidenceComplete: true,
    currentReleaseVerified: false,
    rollbackReleaseRetained: true,
    endpointsVerified: false,
    contractsVerified: false,
    storageWithinLimit: true,
    retentionPolicyVerified: true,
    humanApproval: false
  });

  const output = {
    status,
    verification,
    example
  };

  process.stdout.write(
    JSON.stringify(output, null, 2)
    + '\n'
  );

  if (!verification.passed) {
    process.stderr.write(
      'PRODUCTION_RISK_TO_SAFE_GOVERNANCE_FAILED\n'
    );

    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    'PRODUCTION_RISK_TO_SAFE_GOVERNANCE_READY\n'
  );
}

if (require.main === module) {
  main();
}

module.exports = Object.freeze({
  main
});
