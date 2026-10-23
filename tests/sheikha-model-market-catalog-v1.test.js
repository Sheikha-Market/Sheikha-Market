'use strict';

const { buildMarketCatalog } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-model-market-catalog-v1'
);

describe('Sheikha model market catalog V1', () => {
  test('brands the gateway while preserving upstream ownership', () => {
    const catalog = buildMarketCatalog({ data: [{
      id: 'vendor/model:free',
      name: 'Vendor Model',
      pricing: { prompt: '0', completion: '0' },
      architecture: { input_modalities: ['text'], output_modalities: ['text'] },
      supported_parameters: ['tools']
    }] }, { generatedAt: '2026-08-29T00:00:00.000Z' });
    expect(catalog.brand).toBe('Sheikha Model Gateway');
    expect(catalog.summary.freeAtSnapshot).toBe(1);
    expect(catalog.models[0].sheikhaDisplayName).toBe('Sheikha / Vendor Model');
    expect(catalog.models[0].upstreamAuthor).toBe('vendor');
    expect(catalog.models[0].rights.modelOwnershipClaimedBySheikha).toBe(false);
    expect(catalog.models[0].offering.inferencePriceClass).toBe('ZERO_PRICE_AT_SNAPSHOT');
    expect(catalog.models[0].offering.commerciallyOfferable).toBe(false);
    expect(catalog.models[0].offering.resaleOfModelOrWeights).toBe(false);
    expect(catalog.models[0].lifecycle.callable).toBe(false);
  });
});
