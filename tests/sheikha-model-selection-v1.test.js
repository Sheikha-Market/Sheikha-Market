'use strict';

const { selectCandidate } = require('../runtime/sheikha-ai-governor/v1/llm-training/sheikha-model-selection-v1');

describe('Sheikha model selection', () => {
  test('selects by measured quality and latency but requires license review', () => {
    const result = selectCandidate([
      { model: 'a', passedCases: 5, totalCases: 6, qualityGatePassed: false, latencyGatePassed: true, licenseReviewed: true, p95LatencyMs: 1000 },
      { model: 'b', passedCases: 6, totalCases: 6, qualityGatePassed: true, latencyGatePassed: true, licenseReviewed: false, p95LatencyMs: 2000 },
    ]);
    expect(result.selected.model).toBe('b');
    expect(result.servingEligible).toBe(false);
    expect(result.automaticPromotion).toBe(false);
  });
});
