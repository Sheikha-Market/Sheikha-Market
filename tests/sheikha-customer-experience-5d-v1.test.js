'use strict';

const {
  buildCustomerExperience5DStatus,
  evaluateCustomerExperience5D,
} = require('../runtime/sheikha-studio/core/sheikha-customer-experience-5d-v1');

const baseline = { value: 70, usability: 72, trust: 80, context: 65, time: 68 };

describe('Sheikha customer experience 5D', () => {
  test('qualifies a measured non-regressive candidate but never auto-promotes it', () => {
    const result = evaluateCustomerExperience5D({
      baseline,
      candidate: { value: 78, usability: 76, trust: 82, context: 73, time: 75 },
      environments: ['web', 'mobile'], consentGranted: true, minimumImprovement: 3,
    });
    expect(result.status).toBe('CANDIDATE_ELIGIBLE_FOR_CONTROLLED_TRIAL');
    expect(result.assessment.delta).toBeGreaterThanOrEqual(3);
    expect(result.promote).toBe(false);
    expect(result.humanReviewRequired).toBe(true);
  });

  test('retains baseline when one axis regresses beyond tolerance', () => {
    const result = evaluateCustomerExperience5D({
      baseline,
      candidate: { value: 90, usability: 90, trust: 60, context: 90, time: 90 },
      environments: ['web'], consentGranted: true,
    });
    expect(result.status).toBe('BASELINE_RETAINED');
    expect(result.assessment.regressions).toContainEqual({ dimension: 'TRUST', delta: -20 });
  });

  test('requires consent and defines 5D as an experience model', () => {
    expect(evaluateCustomerExperience5D({ baseline, candidate: baseline, environments: ['web'] }).status).toBe('EVIDENCE_REQUIRED');
    expect(buildCustomerExperience5DStatus().boundaries.fiveDIsAnExperienceModelNotPhysicsClaim).toBe(true);
  });
});
