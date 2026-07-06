'use strict';

const {
  SheikhaOSEnterpriseFederationFabric,
  OS_FAMILIES,
  COMPUTE_DOMAINS
} = require('../runtime/sheikha-os-enterprise-federation/sheikha-os-enterprise-federation-fabric');

test('activates Sheikha OS enterprise federation as high governing layer', () => {
  const fabric = new SheikhaOSEnterpriseFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_GOVERNING');
  expect(status.layerRank).toBe('ABOVE_GENERAL_ENTERPRISE_INSPECTOR_AND_SOVEREIGN_FOUNDATION');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);

  expect(status.governedOSFamilies).toEqual(OS_FAMILIES);
  expect(status.computeDomains).toEqual(COMPUTE_DOMAINS);

  expect(status.boundaries.cloudSaasReady).toBe(true);
  expect(status.boundaries.supercomputerReady).toBe(true);
  expect(status.boundaries.governedSelfHealing).toBe(true);

  expect(status.platforms.find((x) => x.family === 'linux').status).toBe('GOVERNED_OS_FEDERATED');
  expect(status.platforms.find((x) => x.family === 'windows').status).toBe('GOVERNED_OS_FEDERATED');
  expect(status.platforms.find((x) => x.family === 'apple-macos').status).toBe('GOVERNED_OS_FEDERATED');
});

test('rejects unsupported operating system families', () => {
  const fabric = new SheikhaOSEnterpriseFederationFabric();

  expect(() =>
    fabric.governPlatform({
      name: 'Unknown Runtime',
      family: 'unknown-os'
    })
  ).toThrow('Unsupported OS family');
});
