'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  runBenchmark
} = require(
  '../tools/benchmark/' +
  'sheikha-intelligence-capability-apex-v1-benchmark'
);

function testRoot() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-intelligence-benchmark-')
  );
}

function modelExecutor() {
  return Promise.resolve({
    success: true,
    output: [
      'نتيجة عربية محكومة وموجزة.',
      'الدليل قابل للتحقق، ولا يوجد ادعاء تفوق مطلق.',
      'تحتاج الدقة الدلالية والقرارات عالية الأثر إلى مراجعة بشرية مستقلة.'
    ].join(' '),
    metrics: {
      elapsedMs: 2,
      evalCount: 2
    }
  });
}

describe('Sheikha Intelligence Apex local benchmark V1', () => {
  test('requires every passing case to invoke a local model', async () => {
    const report = await runBenchmark({
      root: testRoot(),
      localModels: ['tinyllama:latest'],
      executor: modelExecutor,
      generatedAt: '2026-07-31T00:00:00.000Z'
    });

    expect(report.status).toBe('LOCAL_OPERATIONAL_SMOKE_PASSED');
    expect(report.summary.passedCases).toBe(4);
    expect(report.summary.modelBackedCases).toBe(4);
    expect(report.summary.modelInvocations).toBe(4);
    expect(report.summary.fallbackCases).toBe(0);
    expect(report.truthBoundaries.zeroModelInvocationCanPass)
      .toBe(false);
  });

  test('does not accept provider fallback as a local benchmark', async () => {
    const report = await runBenchmark({
      root: testRoot(),
      localModels: [],
      fallbackExecutor: async () => ({
        success: true,
        output: 'إجابة عربية احتياطية صالحة نصيًا.',
        provider: 'test-fallback'
      }),
      generatedAt: '2026-07-31T00:00:00.000Z'
    });

    expect(report.status)
      .toBe('LOCAL_OPERATIONAL_SMOKE_REVIEW_REQUIRED');
    expect(report.summary.passedCases).toBe(0);
    expect(report.summary.modelBackedCases).toBe(0);
    expect(report.summary.fallbackCases).toBe(4);
  });

  test('separates local execution proof from output quality review', async () => {
    const report = await runBenchmark({
      root: testRoot(),
      localModels: ['tinyllama:latest'],
      caseIds: ['FAST_RESPONSE_SMOKE'],
      executionModel: 'tinyllama:latest',
      executionNumPredict: 4,
      executor: async () => ({
        success: true,
        output: 'Sure, here',
        metrics: {
          elapsedMs: 2,
          evalCount: 4
        }
      }),
      generatedAt: '2026-07-31T00:00:00.000Z'
    });

    expect(report.status).toBe('LOCAL_OPERATIONAL_SMOKE_PASSED');
    expect(report.summary.passedCases).toBe(1);
    expect(report.summary.qualityPassedCases).toBe(0);
    expect(report.summary.qualityReviewRequiredCases).toBe(1);
    expect(report.selection.fullTaskCoverageCompleted).toBe(false);
    expect(
      report.truthBoundaries
        .operationalConnectivitySeparatedFromOutputQuality
    ).toBe(true);
  });
});
