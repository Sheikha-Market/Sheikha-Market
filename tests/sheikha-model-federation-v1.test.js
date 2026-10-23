'use strict';

const { buildFederation } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1'
);

describe('Sheikha model federation V1', () => {
  test('federates and classifies models without claiming ownership or commercial rights', () => {
    const source = {
      name: 'provider',
      models: [{
        upstreamId: 'vendor/model',
        upstreamName: 'Model',
        upstreamAuthor: 'vendor',
        modalities: { input: ['text'], output: ['text'] },
        supportedParameters: ['tools'],
        pricing: { freeAtSnapshot: true },
        lifecycle: { callable: false, productionApproved: false },
        rights: { weightLicenseKnown: false, weightResaleAuthorized: false },
        offering: { commerciallyOfferable: false }
      }]
    };
    const federation = buildFederation([source, source], { generatedAt: '2026-08-29T00:00:00.000Z' });
    expect(federation.summary.inputRecords).toBe(2);
    expect(federation.summary.uniqueModels).toBe(1);
    expect(federation.summary.commerciallyVerified).toBe(0);
    expect(federation.models[0].sheikhaDisplayName).toBe('Sheikha / Model');
    expect(federation.models[0].classification.capabilities).toContain('parameter:tools');
    expect(federation.models[0].rights.ownershipClaimedBySheikha).toBe(false);
    expect(federation.models[0].governance.routeStatus).toBe('DEFAULT_DENY');
    expect(federation.continuousImprovement.automaticTraining).toBe(false);
  });
});
