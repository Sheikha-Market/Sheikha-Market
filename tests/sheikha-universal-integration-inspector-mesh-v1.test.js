'use strict';

const {
  SheikhaSupremeUniversalIntegrationInspector,
  SheikhaUniversalSubIntegrationInspector
} = require('../runtime/sheikha-universal-production-integration/inspectors/sheikha-universal-integration-inspector-mesh');

test('activates supreme general inspector and sub inspectors for all integration systems', () => {
  const inspector = new SheikhaSupremeUniversalIntegrationInspector();
  const status = inspector.getStatus();

  expect(status.status).toBe('ACTIVE_VERIFIED');
  expect(status.layerRank).toBe('HIGHEST_UNIVERSAL_INTEGRATION_INSPECTION_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);

  expect(status.inspectedFamilies).toBeGreaterThanOrEqual(20);
  expect(status.subInspections.every((x) => x.status === 'PASSED')).toBe(true);
  expect(status.subInspections.find((x) => x.family === 'linux').status).toBe('PASSED');
  expect(status.subInspections.find((x) => x.family === 'windows').status).toBe('PASSED');
  expect(status.subInspections.find((x) => x.family === 'apple-macos').status).toBe('PASSED');
  expect(status.subInspections.find((x) => x.family === 'supercomputer-linux').status).toBe('PASSED');
  expect(status.subInspections.find((x) => x.family === 'scada-dcs-plc').status).toBe('PASSED');

  expect(status.boundaries.allSubInspectorsGoverned).toBe(true);
  expect(status.boundaries.allRecoveriesAudited).toBe(true);
});

test('sub inspector returns governed recovery plan when adapter is unhealthy', () => {
  const inspector = new SheikhaUniversalSubIntegrationInspector('linux');
  const result = inspector.inspect({
    family: 'linux',
    status: 'REGISTERED_PRODUCTION_ADAPTER',
    governed: true,
    healthy: false,
    recoverable: true
  });

  expect(result.status).toBe('NEEDS_RECOVERY');
  expect(result.findings).toContain('adapter-unhealthy');
  expect(result.recoveryPlan[0].safe).toBe(true);
  expect(result.recoveryPlan[0].audited).toBe(true);
});
