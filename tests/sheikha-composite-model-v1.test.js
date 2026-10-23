'use strict';

const {
  buildCompositeModel,
  buildCompositeExecutionPlan,
  buildLicenseDecision
} = require('../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');

describe('Sheikha composite model V1', () => {
  const inventory = {
    models: [
      {
        name: 'qwen-coder:7b',
        digest: 'a',
        governorState: 'ELIGIBLE_FOR_EVALUATION',
        license: { id: 'Apache-2.0', commercialUse: true }
      },
      {
        name: 'unknown-model',
        digest: 'b',
        governorState: 'QUARANTINED_PENDING_REVIEW',
        license: { id: 'UNKNOWN' }
      }
    ]
  };

  test('binds only licensed and evaluated models', () => {
    const result = buildCompositeModel(inventory, {
      evaluationResults: { 'qwen-coder:7b': { passed: true } }
    });
    expect(result.roleBindings.coding).toBe('qwen-coder:7b');
    expect(result.inventory.evaluated).toBe(1);
    expect(result.principles.weightMergeWithoutLicenseAllowed).toBe(false);
  });

  test('never issues a Sheikha license for third-party models', () => {
    expect(buildLicenseDecision(inventory.models[0], { verified: true }).decision)
      .toBe('UPSTREAM_LICENSE_MUST_BE_PRESERVED');
    expect(buildLicenseDecision(
      { provider: 'sheikha' },
      { verified: true }
    ).decision).toBe('INTERNAL_LICENSE_ISSUANCE_ELIGIBLE');
  });

  test('builds a mathematical routed plan without merging third-party weights', () => {
    const plan = buildCompositeExecutionPlan(inventory, {
      roles: ['coding'],
      commercial: true,
      evaluationResults: {
        'qwen-coder:7b': {
          passed: true,
          score: 1,
          p95LatencyMs: 4000
        }
      }
    });
    expect(plan.status).toBe('COMMERCIAL_CANARY_ROUTE_ELIGIBLE_NOT_PROMOTED');
    expect(plan.commercialRouteEligible).toBe(true);
    expect(plan.productionCommercialApproved).toBe(false);
    expect(plan.selectedModels[0].model).toBe('qwen-coder:7b');
    expect(plan.selectedModels[0].normalizedWeight).toBe(1);
    expect(plan.ownership.thirdPartyWeightsReLicensedAsSheikha).toBe(false);
    expect(plan.planSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('uses a governed fallback when Arabic model quality is not proven', () => {
    const plan = buildCompositeExecutionPlan(inventory, {
      roles: ['arabic_governance'],
      commercial: true,
      evaluationResults: {}
    });
    expect(plan.productionCommercialApproved).toBe(false);
    expect(plan.uncoveredRoles).toContain('arabic_governance');
    expect(plan.fallbacks[0].route)
      .toBe('GOVERNED_DETERMINISTIC_ARABIC_RAG_AND_TOOLS');
  });
});
