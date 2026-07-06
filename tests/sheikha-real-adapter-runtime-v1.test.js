'use strict';

const {
  SheikhaRealAdapterRuntime,
  REAL_ADAPTERS
} = require('../runtime/sheikha-universal-production-integration/connectors/real/sheikha-real-adapter-runtime');

test('activates real adapter runtime with host discovery and contract-ready adapters', () => {
  const runtime = new SheikhaRealAdapterRuntime();
  const status = runtime.getStatus();

  expect(status.status).toBe('ACTIVE_REAL_ADAPTER_RUNTIME');
  expect(status.layerRank).toBe('ABOVE_LIVE_CONNECTOR_RUNTIME');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.adapters).toHaveLength(REAL_ADAPTERS.length);
  expect(status.adapters.every((x) => x.status === 'REAL_ADAPTER_DISCOVERED')).toBe(true);
  expect(status.adapters.every((x) => x.mode === 'READ_ONLY_DISCOVERY')).toBe(true);

  expect(status.coverage.score).toBe(100);
  expect(status.coverage.liveDiscoveryReady).toBeGreaterThanOrEqual(3);
  expect(status.coverage.contractReady).toBeGreaterThanOrEqual(5);

  expect(status.boundaries.readOnlyDiscovery).toBe(true);
  expect(status.boundaries.noWriteOperation).toBe(true);
  expect(status.boundaries.allAdaptersGoverned).toBe(true);
});

test('real adapter runtime exposes host evidence and rejects unsupported adapters', () => {
  const runtime = new SheikhaRealAdapterRuntime();
  const linux = runtime.runAdapter('linux-host');

  expect(linux.hostEvidence.hostname).toBeTruthy();
  expect(linux.hostEvidence.platform).toBeTruthy();
  expect(linux.hostEvidence.cpus).toBeGreaterThanOrEqual(1);
  expect(linux.boundaries.noWriteOperation).toBe(true);

  expect(() => runtime.runAdapter('unknown-adapter'))
    .toThrow('Unsupported Sheikha real adapter');
});
