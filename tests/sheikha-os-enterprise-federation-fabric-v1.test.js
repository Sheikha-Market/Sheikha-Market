'use strict';

const {
  SheikhaOSEnterpriseFederationFabric,
  OS_FAMILIES,
  COMPUTE_DOMAINS
} = require('../runtime/sheikha-os-enterprise-federation/sheikha-os-enterprise-federation-fabric');

test('registers OS architecture without claiming deployment or compatibility', () => {
  const fabric = new SheikhaOSEnterpriseFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ARCHITECTURE_REGISTERED_EVIDENCE_REQUIRED');
  expect(status.layerRank).toBe('ABOVE_GENERAL_ENTERPRISE_INSPECTOR_AND_SOVEREIGN_FOUNDATION');
  expect(status.productionReady).toBe(false);
  expect(status.inspectorOnly).toBe(true);
  expect(status.architecture.scope).toBe('USER_SPACE_GOVERNANCE_NOT_A_NEW_KERNEL');
  expect(status.upstreamOwnershipTransferred).toBe(false);
  expect(status.linuxDistributions.map(item => item.id)).toEqual(['debian', 'ubuntu', 'pop']);

  expect(status.governedOSFamilies).toEqual(OS_FAMILIES);
  expect(status.computeDomains).toEqual(COMPUTE_DOMAINS);

  expect(status.boundaries.cloudSaasReady).toBe(false);
  expect(status.boundaries.supercomputerReady).toBe(false);
  expect(status.boundaries.governedSelfHealing).toBe(false);

  expect(status.platforms.every(x => x.status === 'OS_ARCHITECTURE_REGISTERED_NOT_RELEASED')).toBe(true);
  expect(status.platforms.every(x => !x.productionReady && !x.governance.inspectorVerified)).toBe(true);
});

test('host observation is explicit and never included in public catalog automatically', () => {
  const hostObserver = { sample: jest.fn(() => ({ fixture: true })), watch: jest.fn(), stop: jest.fn() };
  const fabric = new SheikhaOSEnterpriseFederationFabric({ hostObserver });
  fabric.getStatus(); expect(hostObserver.sample).not.toHaveBeenCalled();
  expect(fabric.inspectLocalHost()).toEqual({ fixture: true });
  fabric.observeLocalHost({ maxSamples: 2 }); expect(hostObserver.watch).toHaveBeenCalledWith({ maxSamples: 2 });
  fabric.stopObservation(); expect(hostObserver.stop).toHaveBeenCalled();
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
