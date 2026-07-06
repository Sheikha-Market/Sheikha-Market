'use strict';

const {
  SheikhaAdapterMarketplaceOperationalRuntime,
  MARKETPLACE_ADAPTER_FAMILIES,
  CONNECTION_STATES,
  REQUIRED_CONNECTION_EVIDENCE
} = require('../runtime/sheikha-marketplace/connectors/sheikha-adapter-marketplace-operational-runtime');

test('activates governed adapter marketplace operational runtime', () => {
  const runtime = new SheikhaAdapterMarketplaceOperationalRuntime();
  const status = runtime.getStatus();

  expect(status.status).toBe('ACTIVE_ADAPTER_MARKETPLACE_OPERATIONAL_RUNTIME');
  expect(status.layerRank).toBe('ABOVE_META_OPERATING_SYSTEM');
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.adapterFamilies).toEqual(MARKETPLACE_ADAPTER_FAMILIES);
  expect(status.connectionStates).toEqual(CONNECTION_STATES);
  expect(status.requiredConnectionEvidence).toEqual(REQUIRED_CONNECTION_EVIDENCE);

  expect(status.adapters).toHaveLength(MARKETPLACE_ADAPTER_FAMILIES.length);
  expect(status.adapters.every((x) => x.status === 'CONTRACT_READY')).toBe(true);
  expect(status.adapters.every((x) => x.connectionState === 'CREDENTIALS_REQUIRED')).toBe(true);

  expect(status.boundaries.noCredentialGuessing).toBe(true);
  expect(status.boundaries.liveConnectionRequiresRealCredentials).toBe(true);
});

test('marks adapter family as live connected only when endpoint and credentials are provided', () => {
  const runtime = new SheikhaAdapterMarketplaceOperationalRuntime();

  const microsoft = runtime.inspectAdapterFamily('microsoft', {
    endpoint: 'https://graph.microsoft.com',
    credentials: 'provided-by-secure-runtime'
  });

  expect(microsoft.status).toBe('LIVE_CONNECTED');
  expect(microsoft.connectionState).toBe('LIVE_CONNECTED');
  expect(microsoft.productionReady).toBe(true);
  expect(microsoft.realConnectionAttempted).toBe(true);

  const apple = runtime.inspectAdapterFamily('apple');
  expect(apple.status).toBe('CONTRACT_READY');
  expect(apple.productionReady).toBe(false);
});

test('rejects unsupported marketplace adapter family', () => {
  const runtime = new SheikhaAdapterMarketplaceOperationalRuntime();

  expect(() => runtime.inspectAdapterFamily('unknown-family'))
    .toThrow('Unsupported Sheikha marketplace adapter family');
});
