'use strict';

const {
  SheikhaOperationalResilienceFabric,
  SheikhaSystemResilienceLayer,
  RESILIENCE_STAGES
} = require('../runtime/sheikha-universal-production-integration/resilience/sheikha-operational-resilience-fabric');

test('activates operational resilience across all registered governed systems', () => {
  const fabric = new SheikhaOperationalResilienceFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_RESILIENT');
  expect(status.layerRank).toBe('HIGHEST_OPERATIONAL_RESILIENCE_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.resilience.length).toBeGreaterThanOrEqual(20);
  expect(status.resilience.every((x) => x.status === 'RESILIENT')).toBe(true);
  expect(status.stages).toEqual(RESILIENCE_STAGES);

  expect(status.boundaries.noUngovernedRecovery).toBe(true);
  expect(status.boundaries.allRecoveriesAudited).toBe(true);
  expect(status.boundaries.allSystemsValidated).toBe(true);
});

test('system resilience returns governed recovery when record is not production ready', () => {
  const layer = new SheikhaSystemResilienceLayer('linux');
  const result = layer.evaluate({
    family: 'linux',
    productionReady: false,
    governed: true,
    audited: true
  });

  expect(result.status).toBe('NEEDS_RECOVERY');
  expect(result.recoveryPlan.length).toBeGreaterThanOrEqual(1);
  expect(result.recoveryPlan.every((x) => x.safe)).toBe(true);
  expect(result.recoveryPlan.every((x) => x.audited)).toBe(true);
});
