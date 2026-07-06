'use strict';

const {
  SheikhaLivingUserExperienceFabric,
  USER_EXPERIENCE_DIMENSIONS,
  EXPERIENCE_SIGNALS,
  USER_IDENTITY_ELEMENTS,
  IMPROVEMENT_ACTIONS
} = require('../runtime/sheikha-experience-os/living-ux/sheikha-living-user-experience-fabric');

test('activates living user experience fabric above experience OS', () => {
  const fabric = new SheikhaLivingUserExperienceFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_LIVING_USER_EXPERIENCE');
  expect(status.layerRank).toBe('ABOVE_EXPERIENCE_OPERATING_SYSTEM');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.dimensions).toEqual(USER_EXPERIENCE_DIMENSIONS);
  expect(status.signals).toEqual(EXPERIENCE_SIGNALS);
  expect(status.userIdentityElements).toEqual(USER_IDENTITY_ELEMENTS);
  expect(status.improvementActions).toEqual(IMPROVEMENT_ACTIONS);

  expect(status.sampleExperience.status).toBe('PERSONALIZED_LIVING_EXPERIENCE_READY');
  expect(status.sampleExperience.experience.arabicFirst).toBe(true);
  expect(status.sampleExperience.experience.rtlReady).toBe(true);
  expect(status.sampleExperience.experience.noLivingBeingImages).toBe(true);

  expect(status.boundaries.everyExperienceImprovesByMeasurement).toBe(true);
  expect(status.boundaries.noSensitiveInference).toBe(true);
});

test('generates context-bound personalized user experience safely', () => {
  const fabric = new SheikhaLivingUserExperienceFabric();

  const experience = fabric.generatePersonalizedExperience({
    userId: 'user-1',
    role: 'merchant',
    workspace: 'marketplace',
    language: 'ar'
  });

  expect(experience.status).toBe('PERSONALIZED_LIVING_EXPERIENCE_READY');
  expect(experience.identityContext.status).toBe('USER_IDENTITY_CONTEXT_BUILT');
  expect(experience.signals.status).toBe('EXPERIENCE_SIGNALS_CAPTURED');
  expect(experience.score.status).toBe('USER_EXPERIENCE_SCORED');
  expect(experience.improvementPlan.status).toBe('UX_IMPROVEMENT_PLAN_READY');

  expect(experience.boundaries.noUnsafeProfiling).toBe(true);
  expect(experience.boundaries.noContextEscape).toBe(true);
  expect(experience.identityContext.boundaries.noLivingBeingImages).toBe(true);
});

test('creates measurable UX improvement plan from a gap', () => {
  const fabric = new SheikhaLivingUserExperienceFabric();
  const plan = fabric.planImprovement('low-readability');

  expect(plan.status).toBe('UX_IMPROVEMENT_PLAN_READY');
  expect(plan.actions).toHaveLength(IMPROVEMENT_ACTIONS.length);
  expect(plan.actions.every((x) => x.safe)).toBe(true);
  expect(plan.actions.every((x) => x.requiresApproval)).toBe(true);
  expect(plan.output.measurableNextIteration).toBe(true);
});
