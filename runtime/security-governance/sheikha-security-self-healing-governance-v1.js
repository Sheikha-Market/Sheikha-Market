'use strict';

const HIGH_IMPACT_BLOCKED = true;

const policy = {
  engine: 'SHEIKHA_SECURITY_SELF_HEALING_GOVERNANCE_V1',
  status: 'ACTIVE',
  defaultMode: 'SAFE_REMEDIATION_ONLY',
  rules: {
    blockForceFix: true,
    blockBreakingUpgradeWithoutReview: true,
    requireAuditEvidence: true,
    requireTestsBeforeMerge: true,
    requireHumanReviewForHighSeverity: true,
    requireNoKnownHighVulnerabilities: true,
    allowPatchMinorSafeUpdates: true,
    denyDestructiveActions: HIGH_IMPACT_BLOCKED
  },
  severityPolicy: {
    critical: 'BLOCK_MERGE',
    high: 'BLOCK_MERGE_UNTIL_FIXED_OR_ACCEPTED_BY_OWNER',
    moderate: 'REQUIRE_PLAN_AND_TESTS',
    low: 'TRACK'
  },
  protectedCommands: [
    'npm audit fix --force',
    'npm update --force',
    'rm -rf',
    'git push --force'
  ],
  principle: 'لا ضرر ولا ضرار'
};

function evaluateAudit(findings = []) {
  const high = findings.filter(v => ['high', 'critical'].includes(String(v.severity || '').toLowerCase()));
  return {
    success: high.length === 0,
    engine: policy.engine,
    decision: high.length ? 'BLOCK_MERGE' : 'ALLOW_WITH_TESTS',
    highCount: high.length,
    policy
  };
}

module.exports = { policy, evaluateAudit };
