'use strict';

const { buildCommercialModelReadiness } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-commercial-model-readiness-v1'
);

const brand = { name: 'SHEIKHA', arabicName: 'شيخة', website: 'https://www.sheikha.top' };
const readiness = {
  activePath: 'GOVERNED_OPERATIONAL_KNOWLEDGE_FAST_PATH',
  activePathVerified: true,
  nextArabicCandidate: { model: 'qwen3:4b', license: 'Apache-2.0', status: 'INSTALLED' }
};

test('does not confuse an installed model with a production-ready huge model', () => {
  const result = buildCommercialModelReadiness({ brand, readiness, evaluation: {} });
  expect(result.product.hugeModelTrainedFromScratch).toBe(false);
  expect(result.commercialProductionApproved).toBe(false);
  expect(result.blockers).toContain('MODEL_GPU_RUNTIME');
  expect(result.blockers).toContain('MODEL_QUALITY');
});

test('requires every commercial gate before approval', () => {
  const result = buildCommercialModelReadiness({
    brand,
    readiness,
    evaluation: { qualityGatePassed: true, latencyGatePassed: true },
    runtime: {
      gpuInferenceVerified: true,
      securityGatePassed: true,
      loadGatePassed: true,
      recoveryGatePassed: true,
      legalApproval: true,
      humanApproval: true
    }
  });
  expect(result.status).toBe('COMMERCIAL_PRODUCTION_READY');
  expect(result.counts).toEqual({ total: 9, passed: 9, blocked: 0 });
  expect(result.readinessSha256).toMatch(/^[a-f0-9]{64}$/);
});
