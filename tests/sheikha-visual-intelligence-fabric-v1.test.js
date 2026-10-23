'use strict';

const {
  buildVisualIntelligenceStatus,
  evaluateNonLivingDrawingRequest,
  planGovernedVisualScene,
} = require('../runtime/sheikha-studio/core/sheikha-visual-intelligence-fabric-v1');

describe('Sheikha Visual Intelligence Fabric V1', () => {
  test('reports evidence-backed capabilities without promoting design-only AR or VR', () => {
    const status = buildVisualIntelligenceStatus();
    expect(status.system).toBe('SHEIKHA_VISUAL_FABRIC_V1');
    expect(status.compatibilityAliases).toContain('SHEIKHA_VISUAL_INTELLIGENCE_FABRIC_V1');
    expect(status.counts.total).toBe(8);
    expect(status.counts.locallyExecutable).toBe(3);
    expect(status.counts.designOnly).toBe(3);
    expect(status.counts.commerciallyApproved).toBe(0);
    expect(status.technologyRegistry).toMatchObject({
      id: 'SHEIKHA_VISUAL_TECHNOLOGY_REGISTRY_V1',
      status: 'INTERNAL_SPECIFICATION_ACTIVE',
      licenseId: 'SHEIKHA-VISUAL-GOVERNED-USE-1.0',
      technologyCount: 12,
    });
    expect(status.technologyRegistry.technologies.find((item) => item.id === 'SHEIKHA_CODEC_GATEWAY'))
      .toMatchObject({ commercialUse: 'PATENT_AND_CODEC_LICENSE_REVIEW_REQUIRED' });
    expect(status.technologyRegistry.thirdPartyConnectorPolicy).toMatchObject({
      brandingAndOwnershipRemainWithProvider: true,
      customerContentTrainingDefault: false,
    });
    expect(status.capabilities.find((item) => item.id === 'AR')).toMatchObject({
      maturity: 'DESIGN_ONLY',
      executableClaimAllowed: false,
      commercialClaimAllowed: false,
    });
    expect(status.gardensBoundary.afterlifeNotSimulatedOrClaimed).toBe(true);
    expect(status.contentGovernance.provenanceRequired).toBe(true);
    expect(status.contentGovernance.defaultContentMode).toBe('SHEIKHA_NON_LIVING_DRAWING_MODE_V1');
    expect(status.technologyRegistry.dimensionalModel['5D']).toContain('ليس ادعاء');
    expect(status.commercialRelease.allowed).toBe(false);
    expect(status.controlledCommercialServices).toMatchObject({
      offerableNow: true,
      mode: 'HUMAN_REVIEWED_SERVICE_DELIVERY',
      automaticGenerationOrPublishingAllowed: false,
    });
    expect(status.distinctiveCapability).toMatchObject({
      id: 'SHEIKHA_VERIFIABLE_VISUAL_SCENE_V1',
      implementedAsUnifiedPipeline: false,
    });
    expect(status.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('builds an integrated 5D plan without claiming a rendered output', () => {
    const plan = planGovernedVisualScene({ subject: 'بيت وحديقة ونهر وبيانات طاقة', dimension: '5D' });
    expect(plan).toMatchObject({
      status: 'PLAN_ADMITTED_NOT_RENDERED',
      dimension: '5D',
      renderContract: {
        timelineEnabled: true,
        dataAndDecisionLayerEnabled: true,
        livingSubjectsAllowed: false,
        outputGenerated: false,
      },
      commercialScope: {
        recommendedOfferId: 'SHEIKHA_INTERACTIVE_3D_PILOT_V1',
        licenseId: 'SHEIKHA-VISUAL-GOVERNED-USE-1.0',
      },
      execution: { performed: false, providerCalled: false },
    });
    expect(plan.pipeline).toContain('GARDENS_AND_PASTURES_WORLDLY_ENGINEERING_MODEL');
    expect(plan.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('denies unsupported dimensions and living subjects before planning', () => {
    expect(planGovernedVisualScene({ subject: 'حصان', dimension: '6D' })).toMatchObject({
      status: 'PLAN_DENIED',
      blockers: ['LIVING_OR_ANTHROPOMORPHIC_SUBJECT_DETECTED', 'DIMENSION_MUST_BE_2D_3D_4D_OR_5D'],
      renderContract: null,
    });
  });

  test('allows an architectural drawing plan and denies living subjects', () => {
    expect(evaluateNonLivingDrawingRequest({ subject: 'مربع وبيت وحديقة وماء' })).toMatchObject({
      allowed: true,
      decision: 'ALLOW_PLAN',
      executionPerformed: false,
    });
    expect(evaluateNonLivingDrawingRequest({ subject: 'شخص داخل البيت' })).toMatchObject({
      allowed: false,
      reasons: ['LIVING_OR_ANTHROPOMORPHIC_SUBJECT_DETECTED'],
    });
    expect(evaluateNonLivingDrawingRequest()).toMatchObject({
      allowed: false,
      reasons: ['SUBJECT_REQUIRED'],
    });
  });
});
