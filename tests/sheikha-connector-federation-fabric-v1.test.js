'use strict';

const {
  SheikhaConnectorFederationFabric,
  SheikhaConnectorFactory,
  CONNECTOR_TARGETS,
  CONNECTOR_OPERATIONS
} = require('../runtime/sheikha-universal-production-integration/connectors/sheikha-connector-federation-fabric');

test('activates Sheikha connector federation and connector factory', () => {
  const fabric = new SheikhaConnectorFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_CONNECTOR_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_RESOURCE_MEASUREMENT_CAPABILITY_SCORING');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.connectors).toHaveLength(CONNECTOR_TARGETS.length);
  expect(status.connectors.every((x) => x.federationStatus === 'FEDERATED')).toBe(true);
  expect(status.connectors.every((x) => x.registryBound)).toBe(true);
  expect(status.connectors.every((x) => x.masterLogBound)).toBe(true);
  expect(status.connectors.every((x) => x.inspectorBound)).toBe(true);
  expect(status.connectors.every((x) => x.recoveryBound)).toBe(true);
  expect(status.connectors.every((x) => x.policyBound)).toBe(true);
  expect(status.connectors.every((x) => x.measurementBound)).toBe(true);

  expect(status.connectorOperations).toEqual(CONNECTOR_OPERATIONS);
  expect(status.boundaries.allConnectorsFederated).toBe(true);
  expect(status.boundaries.noUngovernedConnection).toBe(true);
});

test('connector factory rejects unsupported targets', () => {
  const factory = new SheikhaConnectorFactory();

  expect(() => factory.createConnector('unknown-target'))
    .toThrow('Unsupported Sheikha connector target');
});
