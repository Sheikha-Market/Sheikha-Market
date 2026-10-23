'use strict';

const { decideLearningRun, buildPolicyCatalog } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-learning-production-policy-v1'
);

const evidence = {
  objective: 'Arabic quality', datasetSha256: 'a'.repeat(64),
  datasetLicenseVerified: true, datasetProvenanceVerified: true,
  piiAndSecretReviewPassed: true, evaluationPlanSha256: 'b'.repeat(64),
  rollbackPlanSha256: 'c'.repeat(64), humanTrainingApproval: true
};

test('admits bounded internal learning without automatic promotion', () => {
  const decision = decideLearningRun({ ...evidence, mode: 'INTERNAL_DEVELOPMENT' });
  expect(decision.admitted).toBe(true);
  expect(decision.executionStarted).toBe(false);
  expect(decision.automaticWeightMutation).toBe(false);
  expect(decision.automaticCommercialPromotion).toBe(false);
});

test('requires customer rights and isolation for customer development', () => {
  const decision = decideLearningRun({ ...evidence, mode: 'CUSTOMER_DEVELOPMENT' });
  expect(decision.blockers).toContain('CUSTOMER_CONTRACT_REQUIRED');
  expect(decision.blockers).toContain('CUSTOMER_DATA_CONSENT_REQUIRED');
  expect(decision.blockers).toContain('TENANT_ISOLATION_REQUIRED');
  expect(decision.blockers).toContain('HUMAN_LEGAL_APPROVAL_REQUIRED');
});

test('requires admitted provider, budget, network and vault for external GPU', () => {
  const decision = decideLearningRun({ ...evidence, mode: 'EXTERNAL_DISTRIBUTED_TRAINING' });
  expect(decision.blockers).toContain('EXTERNAL_GPU_NODE_ADMISSION_REQUIRED');
  expect(decision.blockers).toContain('PROVIDER_CONTRACT_REQUIRED');
  expect(decision.blockers).toContain('BUDGET_APPROVAL_REQUIRED');
  expect(decision.blockers).toContain('VAULT_BACKED_SECRETS_REQUIRED');
});

test('publishes strict invariant controls and preserves ownership', () => {
  const catalog = buildPolicyCatalog();
  expect(catalog.defaultAuthorization).toBe('DENY');
  expect(catalog.invariantControls).toContain('NO_AUTOMATIC_WEIGHT_MUTATION');
  expect(catalog.ownership.customerDataRemainsCustomerOwned).toBe(true);
  expect(catalog.catalogSha256).toMatch(/^[a-f0-9]{64}$/);
});
