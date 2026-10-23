'use strict';

const {
  OPERATIONS,
  buildTrainingPlan,
  decideLicense
} = require('../runtime/sheikha-ai-governor/v1/sheikha-model-license-training-engine-v1');

describe('Sheikha model licensing and training engine V1', () => {
  test('supports distinct rights and defaults to deny without evidence', () => {
    expect(OPERATIONS).toContain('COMMERCIAL_INFERENCE');
    expect(OPERATIONS).toContain('DISTILLATION');
    const denied = decideLicense({ modelId: 'vendor/model', operation: 'FINE_TUNING' });
    expect(denied.decision).toBe('REVIEW_REQUIRED_DEFAULT_DENY');
    expect(denied.legallyIssuedThirdPartyLicense).toBe(false);
  });

  test('builds a ready plan only from documented rights and evidence', () => {
    const license = decideLicense({
      modelId: 'owned/model',
      operation: 'FINE_TUNING',
      licenseId: 'SHEIKHA-LOCAL',
      licenseTextSha256: 'a'.repeat(64),
      documentedGrants: ['FINE_TUNING'],
      restrictionsAccepted: true,
      evidence: ['local://license']
    });
    const ready = buildTrainingPlan({
      baseModel: 'owned/model',
      baseModelDigest: 'b'.repeat(64),
      datasetManifestSha256: 'c'.repeat(64),
      datasetProvenanceVerified: true,
      piiReviewPassed: true,
      evalPlanSha256: 'd'.repeat(64),
      rollbackPlanSha256: 'e'.repeat(64),
      licenseDecisions: [license]
    });
    expect(ready.status).toBe('READY_FOR_HUMAN_APPROVED_TRAINING_RUN');
    expect(ready.trainingExecuted).toBe(false);
  });
});
