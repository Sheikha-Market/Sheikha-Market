'use strict';

const {
  SheikhaConnectorTestHarness
} = require('../runtime/sheikha-universal-production-integration/connectors/testing/sheikha-connector-test-harness');

test('activates measurable connector test harness for all connector targets', () => {
  const harness = new SheikhaConnectorTestHarness();
  const status = harness.getStatus();

  expect(status.status).toBe('ACTIVE_ALL_CONNECTORS_TESTED');
  expect(status.layerRank).toBe('ABOVE_CONNECTOR_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.coverage.score).toBe(100);
  expect(status.coverage.tested).toBeGreaterThanOrEqual(10);
  expect(status.results.every((x) => x.status === 'TESTED_PRODUCTION_CANDIDATE')).toBe(true);
  expect(status.results.every((x) => x.score === 100)).toBe(true);

  expect(status.boundaries.allConnectorTestsAudited).toBe(true);
  expect(status.boundaries.allConnectorTestsGoverned).toBe(true);
});

test('connector test harness rejects unsupported connector target through factory', () => {
  const harness = new SheikhaConnectorTestHarness();

  expect(() => harness.testConnector('unknown-target'))
    .toThrow('Unsupported Sheikha connector target');
});
