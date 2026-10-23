'use strict';

const {
  createGovernorRegistry,
  evaluateModel,
  selectModel
} = require('../runtime/sheikha-ai-governor/v1/sheikha-ai-governor-v1');

describe('Sheikha AI Governor V1', () => {
  test('quarantines models without verified source and license', () => {
    const model = evaluateModel({ id: 'unverified', enabled: true });
    expect(model.state).toBe('QUARANTINED');
    expect(model.callableByGovernor).toBe(false);
    expect(model.weightExtractionAllowed).toBe(false);
  });

  test('routes only approved models under Sheikha governance', () => {
    const registry = createGovernorRegistry([
      {
        id: 'sheikha-core',
        provider: 'sheikha',
        source: 'local://sheikha-core',
        licenseState: 'LOCAL_ORIGINAL',
        capabilities: ['arabic', 'tools'],
        local: true,
        enabled: true
      },
      {
        id: 'unknown-model',
        source: 'unknown://model',
        licenseState: 'UNKNOWN',
        capabilities: ['arabic', 'tools'],
        enabled: true
      }
    ]);
    const decision = selectModel(registry, { capabilities: ['arabic'] });
    expect(decision.decision).toBe('ROUTE_APPROVED');
    expect(decision.selected.id).toBe('sheikha-core');
    expect(decision.governanceBypassAllowed).toBe(false);
    expect(registry.summary).toEqual({
      registered: 2,
      approved: 1,
      callable: 1,
      quarantined: 1
    });
  });
});
