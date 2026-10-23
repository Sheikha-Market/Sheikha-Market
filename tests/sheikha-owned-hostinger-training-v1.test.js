'use strict';

const { buildOwnedHostingerTrainingPlan } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-owned-hostinger-training-v1'
);

describe('Sheikha owned Hostinger training', () => {
  test('fixes cost and ownership while retaining execution gates', () => {
    const report = buildOwnedHostingerTrainingPlan({ availableCredits: 357 });
    expect(report.ownership.baseLicense).toBe('Apache-2.0');
    expect(report.price.maximumAuthorizedChargeSar).toBe(215.63);
    expect(report.price.automaticTopUpAllowed).toBe(false);
    expect(report.execution.admitted).toBe(false);
    expect(report.execution.blockers).toContain('DATASET_V3_QUALITY_GATE_REQUIRED');
  });

  test('admits exactly one bounded run after all gates pass', () => {
    const report = buildOwnedHostingerTrainingPlan({
      hostingerCredentialPresent: true, availableCredits: 6000,
      datasetV3QualityPassed: true, licenseReviewPassed: true, executionAuthorized: true,
    });
    expect(report.execution.admitted).toBe(true);
    expect(report.run.hardCreditStop).toBe(5720);
    expect(report.exitContract.keepPaidEndpointAfterTraining).toBe(false);
  });
});
