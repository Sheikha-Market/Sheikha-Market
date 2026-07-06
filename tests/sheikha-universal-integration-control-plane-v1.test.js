'use strict';

const {
  SheikhaUniversalIntegrationControlPlane
} = require('../runtime/sheikha-universal-production-integration/engines/sheikha-universal-integration-control-plane');

test('activates Sheikha universal integration control plane with production registry and recovery', () => {
  const plane = new SheikhaUniversalIntegrationControlPlane();
  const status = plane.activate();

  expect(status.status).toBe('ACTIVE');
  expect(status.productionReady).toBe(true);
  expect(status.registeredFamilies).toBeGreaterThanOrEqual(20);
  expect(status.policies.every((x) => x.policy === 'ENFORCED')).toBe(true);
  expect(status.telemetry.every((x) => x.health === 'HEALTHY')).toBe(true);
  expect(status.recovery.every((x) => x.recovery === 'READY')).toBe(true);
  expect(status.boundaries.allAdaptersGoverned).toBe(true);
});
