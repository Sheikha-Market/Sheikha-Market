'use strict';

const {
  SheikhaGitLabGovernanceIntegration,
  GOVERNANCE_GATES,
  INTEGRATION_TARGETS
} = require('../runtime/sheikha-studio/git-lab/governance/sheikha-git-lab-governance-integration');

test('activates Git Lab governance integration above federation', () => {
  const integration = new SheikhaGitLabGovernanceIntegration();
  const status = integration.getStatus();

  expect(status.status).toBe('ACTIVE_GIT_LAB_GOVERNANCE_INTEGRATION');
  expect(status.layerRank).toBe('ABOVE_SHEIKHA_GIT_LAB_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.governanceGates).toHaveLength(GOVERNANCE_GATES.length);
  expect(status.integrationTargets).toHaveLength(INTEGRATION_TARGETS.length);
  expect(status.sampleMergeReadiness.status).toBe('MERGE_READINESS_EVALUATED');

  expect(status.boundaries.allGatesGoverned).toBe(true);
  expect(status.boundaries.allTargetsBound).toBe(true);
  expect(status.boundaries.noUngovernedMerge).toBe(true);
});

test('evaluates merge readiness with strict evidence requirements', () => {
  const integration = new SheikhaGitLabGovernanceIntegration();

  const readiness = integration.evaluateMergeReadiness({
    branch: 'feature/safe-change'
  });

  expect(readiness.status).toBe('MERGE_READINESS_EVALUATED');
  expect(readiness.mergeAllowed).toBe(false);
  expect(readiness.decision).toBe('MERGE_ONLY_AFTER_VERIFIED_GATES');
  expect(readiness.requirements).toContain('tests-pass');
  expect(readiness.requirements).toContain('master-log-written');
});

test('rejects unsupported governance gate and integration target', () => {
  const integration = new SheikhaGitLabGovernanceIntegration();

  expect(() => integration.evaluateGovernanceGate('unknown-gate'))
    .toThrow('Unsupported Sheikha Git Lab governance gate');

  expect(() => integration.bindIntegrationTarget('unknown-target'))
    .toThrow('Unsupported Sheikha Git Lab integration target');
});
