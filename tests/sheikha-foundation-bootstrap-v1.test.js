'use strict';

const { buildFoundationBootstrap } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-foundation-bootstrap-v1'
);

describe('Sheikha foundation bootstrap', () => {
  test('retains quarantine and does not claim universal superiority', () => {
    const report = buildFoundationBootstrap({
      baseModelId: 'Llama-Sheikha-Governed:8b', baseModelTrainingRights: true,
      datasetLicenseApproved: true, piiReviewPassed: true,
      trainSplitValid: true, validationSplitValid: true, testSplitValid: true,
      datasetQualityQuarantined: true,
    });
    expect(report.training.admitted).toBe(false);
    expect(report.training.blockers).toContain('QUALITY_REGRESSION_QUARANTINED');
    expect(report.claim.betterThanAllModelsClaimed).toBe(false);
    expect(report.architecture.productionWeightsMutableOnline).toBe(false);
  });

  test('admits one isolated bootstrap run only after every gate passes', () => {
    const report = buildFoundationBootstrap({
      baseModelId: 'licensed-base', baseModelTrainingRights: true,
      datasetLicenseApproved: true, piiReviewPassed: true,
      trainSplitValid: true, validationSplitValid: true, testSplitValid: true,
      datasetQualityQuarantined: false, fixedBudgetApproved: true, executionAuthorized: true,
    });
    expect(report.status).toBe('FOUNDATION_RUN_ADMITTED');
    expect(report.training.admitted).toBe(true);
    expect(report.learningLoop.autonomousProductionPromotion).toBe(false);
  });
});
