'use strict';

const {
  buildGoverningPortfolio,
  planCapabilityRoute,
  buildGovernedStudentTrainingPlan
} = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-governing-model-orchestrator-v1'
);

test('does not turn catalog registration into production approval', () => {
  const portfolio = buildGoverningPortfolio({ federation: { models: [{}, {}] } });
  expect(portfolio.counts.federatedCatalogRecords).toBe(2);
  expect(portfolio.counts.productionEligibleLocalModels).toBe(0);
  expect(portfolio.commercialProductionApproved).toBe(false);
});

test('requires qualified scholarly review for Quran and Sunnah reference claims', () => {
  const blocked = buildGovernedStudentTrainingPlan({
    domain: 'arabic-governance', studentModelId: 'student-v1',
    baseModelLicenseVerified: true,
    dataset: {
      sha256: 'a'.repeat(64), licenseVerified: true,
      provenanceVerified: true, piiAndSecretReviewPassed: true
    },
    evaluationPlanSha256: 'b'.repeat(64), rollbackPlanSha256: 'c'.repeat(64),
    islamicReferenceClaims: true
  });
  expect(blocked.status).toBe('TRAINING_BLOCKED');
  expect(blocked.blockers).toContain('QUALIFIED_SCHOLARLY_REVIEW_REQUIRED');
  expect(blocked.islamicGovernance.automatedFatwaAllowed).toBe(false);
});

test('admits an evidence-complete student training plan without promoting it', () => {
  const plan = buildGovernedStudentTrainingPlan({
    domain: 'software-quality', studentModelId: 'student-v1',
    baseModelLicenseVerified: true,
    dataset: {
      sha256: 'a'.repeat(64), licenseVerified: true,
      provenanceVerified: true, piiAndSecretReviewPassed: true
    },
    evaluationPlanSha256: 'b'.repeat(64), rollbackPlanSha256: 'c'.repeat(64)
  });
  expect(plan.status).toBe('READY_FOR_ISOLATED_TRAINING_RUN');
  expect(plan.commercialProductionApproved).toBe(false);
});

test('routes only a candidate that passed rights, quality and latency gates', () => {
  const portfolio = buildGoverningPortfolio({ federation: { models: [] }, localModels: [{
    id: 'approved', capabilities: ['INFERENCE'], licenseVerified: true,
    commercialUseVerified: true, qualityGatePassed: true, latencyGatePassed: true
  }] });
  expect(planCapabilityRoute(portfolio, { capabilities: ['INFERENCE'] }).selectedId).toBe('approved');
  expect(planCapabilityRoute(portfolio, { capabilities: ['TRAINING'] }).fallback)
    .toBe('GOVERNED_DETERMINISTIC_ARABIC_PATH');
});
