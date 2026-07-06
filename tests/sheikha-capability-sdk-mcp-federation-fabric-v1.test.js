'use strict';

const {
  SheikhaCapabilitySDKMCPFederationFabric,
  PLATFORM_ADAPTERS,
  SDK_FAMILIES,
  MCP_CAPABILITIES,
  CAPABILITY_DIMENSIONS
} = require('../runtime/sheikha-universal-production-integration/capability/sheikha-capability-sdk-mcp-federation-fabric');

test('activates capability discovery, SDK federation, MCP federation, and platform adapters', () => {
  const fabric = new SheikhaCapabilitySDKMCPFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_CAPABILITY_SDK_MCP_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_OPERATIONAL_RESILIENCE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);

  expect(status.platformAdapters).toHaveLength(PLATFORM_ADAPTERS.length);
  expect(status.platformAdapters.every((x) => x.status === 'DISCOVERED_AND_FEDERATED')).toBe(true);

  expect(status.sdkFederation).toHaveLength(SDK_FAMILIES.length);
  expect(status.sdkFederation.every((x) => x.status === 'SDK_FEDERATED')).toBe(true);

  expect(status.mcpFederation.status).toBe('ACTIVE');
  expect(status.mcpFederation.capabilities).toEqual(MCP_CAPABILITIES);

  expect(status.capabilityGraph.dimensions).toEqual(CAPABILITY_DIMENSIONS);
  expect(status.boundaries.allAdaptersFederated).toBe(true);
  expect(status.boundaries.allSDKsFederated).toBe(true);
  expect(status.boundaries.mcpGoverned).toBe(true);
});

test('rejects unsupported adapters and sdk families', () => {
  const fabric = new SheikhaCapabilitySDKMCPFederationFabric();

  expect(() => fabric.discoverAdapter('unknown-adapter'))
    .toThrow('Unsupported Sheikha platform adapter');

  expect(() => fabric.federateSDK('unknown-sdk'))
    .toThrow('Unsupported Sheikha SDK family');
});
