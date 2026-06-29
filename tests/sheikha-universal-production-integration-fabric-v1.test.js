'use strict';

const {
  SheikhaUniversalProductionIntegrationFabric,
  UNIVERSAL_SYSTEM_FAMILIES,
  UNIVERSAL_PRODUCTION_CAPABILITIES
} = require('../runtime/sheikha-universal-production-integration/sheikha-universal-production-integration-fabric');

test('activates Sheikha universal production integration across all system families', () => {
  const fabric = new SheikhaUniversalProductionIntegrationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_UNIVERSAL_PRODUCTION_INTEGRATION');
  expect(status.layerRank).toBe('HIGHEST_UNIVERSAL_PRODUCTION_LAYER');
  expect(status.brand).toBe('Sheikha');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);

  expect(status.systemFamilies).toHaveLength(UNIVERSAL_SYSTEM_FAMILIES.length);
  expect(status.systemFamilies.every((x) => x.status === 'UNIVERSAL_PRODUCTION_INTEGRATED')).toBe(true);
  expect(status.systemFamilies.every((x) => x.governed)).toBe(true);
  expect(status.systemFamilies.every((x) => x.selfHealing)).toBe(true);

  expect(UNIVERSAL_SYSTEM_FAMILIES).toContain('supercomputer-linux');
  expect(UNIVERSAL_SYSTEM_FAMILIES).toContain('scada-dcs-plc');
  expect(UNIVERSAL_SYSTEM_FAMILIES).toContain('rtos-qnx');
  expect(UNIVERSAL_SYSTEM_FAMILIES).toContain('medical-systems');
  expect(UNIVERSAL_SYSTEM_FAMILIES).toContain('aerospace-flight-systems');

  expect(UNIVERSAL_PRODUCTION_CAPABILITIES).toContain('ai-federation');
  expect(UNIVERSAL_PRODUCTION_CAPABILITIES).toContain('self-healing');
});

test('rejects unsupported universal system family', () => {
  const fabric = new SheikhaUniversalProductionIntegrationFabric();

  expect(() => fabric.activateSystemFamily('unknown-family'))
    .toThrow('Unsupported Sheikha universal system family');
});
