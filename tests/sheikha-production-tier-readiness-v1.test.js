'use strict';

const foundation = require('../core/language/sheikha-arabic/arabic-language-foundation.json');
const { evaluateArabicFoundation, buildProductionTierReadiness } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-production-tier-readiness-v1'
);

test('verifies the existing Arabic foundation against governed operational answers', () => {
  const result = evaluateArabicFoundation(foundation);
  expect(result.passedCases).toBe(result.totalCases);
  expect(result.passed).toBe(true);
});

test('separates internal readiness from distributed commercial readiness', () => {
  const report = buildProductionTierReadiness({
    arabicFoundation: foundation,
    gpu: { local: { ollamaGpuInferenceVerified: true }, external: { activeGpuProviderCount: 0 } },
    security: { status: 'PASSED', findings: [] },
    load: { passed: true, boundaries: { soakTested: false } },
    sustained: { passed: true, healthBeforePassed: true, healthAfterPassed: true },
    recovery: { status: 'VERIFIED', healthAfterRestart: true,
      boundaries: { multiNodeFailoverTested: false } }
  });
  expect(report.tiers.localExperimental.status).toBe('READY');
  expect(report.tiers.internalGovernedProduction.status).toBe('READY');
  expect(report.tiers.distributedCommercialProduction.status).toBe('BLOCKED');
});
