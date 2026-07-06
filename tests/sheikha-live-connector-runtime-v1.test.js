'use strict';

const {
  SheikhaLiveConnectorRuntime,
  LIVE_CONNECTOR_STAGES
} = require('../runtime/sheikha-universal-production-integration/connectors/live/sheikha-live-connector-runtime');

test('activates live connector runtime with measurable read-only discovery', () => {
  const runtime = new SheikhaLiveConnectorRuntime();
  const status = runtime.getStatus();

  expect(status.status).toBe('ACTIVE_LIVE_CONNECTORS_READY');
  expect(status.layerRank).toBe('ABOVE_CONNECTOR_TEST_HARNESS');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.coverage.score).toBe(100);
  expect(status.connectors.length).toBeGreaterThanOrEqual(10);
  expect(status.connectors.every((x) => x.status === 'LIVE_CONNECTED_PRODUCTION_CANDIDATE')).toBe(true);

  expect(status.connectors.every((x) => x.bindings.registry)).toBe(true);
  expect(status.connectors.every((x) => x.bindings.masterLog)).toBe(true);
  expect(status.connectors.every((x) => x.bindings.inspector)).toBe(true);
  expect(status.connectors.every((x) => x.bindings.recovery)).toBe(true);

  expect(status.boundaries.readOnlyDiscovery).toBe(true);
  expect(status.boundaries.allLiveConnectorsAudited).toBe(true);
  expect(status.boundaries.allLiveConnectorsGoverned).toBe(true);
});

test('live connector runtime exposes governed lifecycle stages and host evidence', () => {
  const runtime = new SheikhaLiveConnectorRuntime();
  const result = runtime.runLiveConnector('linux');

  expect(result.status).toBe('LIVE_CONNECTED_PRODUCTION_CANDIDATE');
  expect(result.stages).toHaveLength(LIVE_CONNECTOR_STAGES.length);
  expect(result.stages.every((x) => x.status === 'PASSED')).toBe(true);
  expect(result.liveEvidence.platform).toBeTruthy();
  expect(result.liveEvidence.arch).toBeTruthy();
  expect(result.boundaries.liveExecutionIsReadOnly).toBe(true);
});
