'use strict';

const {
  createThinReference,
  routeIntelligence,
  valueScore
} = require('../runtime/sheikha-ai-governor/v1/sheikha-value-intelligence-v1');

describe('Sheikha value intelligence V1', () => {
  test('ranks evidence and utility above low-value volume', () => {
    const useful = valueScore({ evidence: 1, utility: 1, freshness: 0.8, uniqueness: 0.7, cost: 0.2, risk: 0.1 });
    const noisy = valueScore({ evidence: 0.1, utility: 0.1, freshness: 1, uniqueness: 0.2, cost: 0.8, risk: 0.7 });
    expect(useful).toBeGreaterThan(noisy);
  });

  test('stores a content-addressed thin reference instead of source content', () => {
    const reference = createThinReference({
      source: 'docs/example.md', content: 'دليل علمي موثق', terms: 'دليل علمي موثق',
      evidence: 1, utility: 0.8, licenseId: 'LOCAL'
    });
    expect(reference.id).toMatch(/^[a-f0-9]{64}$/);
    expect(reference.contentStoredInIndex).toBe(false);
    expect(reference).not.toHaveProperty('content');
  });

  test('routes calculation and research before compact generation', () => {
    const route = routeIntelligence({ query: 'ابحث عن مصدر ثم احسب النسبة' });
    expect(route.stages).toEqual(expect.arrayContaining([
      'GOVERNED_RETRIEVAL', 'DETERMINISTIC_CALCULATION_TOOL', 'COMPACT_MODEL_SYNTHESIS'
    ]));
    expect(route.largeModelRequiredByDefault).toBe(false);
  });
});
