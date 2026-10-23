'use strict';

const { diffModels, renew, transportPolicy } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-model-renewal-v1'
);

describe('Sheikha model renewal V1', () => {
  test('detects versions without auto licensing or promotion', async () => {
    const payload = { data: [{ id: 'vendor/model:v2', name: 'Model V2', pricing: { prompt: '0', completion: '0' } }] };
    const result = await renew({
      previous: { models: [{ upstreamId: 'vendor/model:v1' }] },
      fetcher: async () => ({ ok: true, json: async () => payload })
    });
    expect(result.report.changes.added).toEqual(['vendor/model:v2']);
    expect(result.report.externalLicensesIssued).toBe(false);
    expect(result.report.productionPromotion).toBe(false);
  });

  test('uses local transports before remote providers', () => {
    expect(transportPolicy().order.slice(0, 2)).toEqual(['IN_PROCESS', 'UNIX_DOMAIN_SOCKET']);
    expect(diffModels([], []).added).toEqual([]);
  });
});
