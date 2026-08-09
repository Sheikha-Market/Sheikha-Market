#!/usr/bin/env node
'use strict';

const {
  FILES,
  discoverLocalModels,
  executeIntelligenceRequest,
  writeJson
} = require(
  '../../core/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-v1'
);
const {
  activate
} = require(
  '../activation/' +
  'activate-sheikha-intelligence-capability-apex-v1'
);

const CASES = Object.freeze([
  Object.freeze({
    id: 'ARABIC_GENERAL_SMOKE',
    expectedTask: 'ARABIC_GENERAL',
    prompt:
      'أجب بجملة عربية قصيرة: ما الفرق بين اكتمال الملف والتحقق من دليله؟'
  }),
  Object.freeze({
    id: 'FAST_RESPONSE_SMOKE',
    expectedTask: 'FAST_RESPONSE',
    prompt:
      'Quick local runtime smoke: reply with OK.'
  }),
  Object.freeze({
    id: 'CODING_SMOKE',
    expectedTask: 'CODING',
    prompt:
      'صحح الخطأ وأعد الدالة فقط: function sum(a,b){ return a-b; }'
  }),
  Object.freeze({
    id: 'REASONING_SMOKE',
    expectedTask: 'REASONING',
    prompt:
      'حلل بجملة قصيرة خطرًا واحدًا للاعتماد على مزود ذكاء واحد وتخفيفه.'
  })
]);

async function runBenchmark(options = {}) {
  const generatedAt =
    options.generatedAt || new Date().toISOString();
  const inventory = options.inventory ||
    await discoverLocalModels(options);
  const requestedCaseIds = String(
    options.caseIds ||
    process.env.SHEIKHA_LOCAL_BENCHMARK_CASES ||
    ''
  )
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  const benchmarkCases = requestedCaseIds.length
    ? CASES.filter((entry) =>
      requestedCaseIds.includes(entry.id)
    )
    : CASES;
  const executionModel = String(
    options.executionModel ||
    process.env.SHEIKHA_LOCAL_BENCHMARK_MODEL ||
    ''
  ).trim();
  const executionModels = executionModel
    ? inventory.models.filter((model) =>
      model.name === executionModel
    )
    : inventory.models;
  const executionInventory = {
    ...inventory,
    models: executionModels,
    count: executionModels.length
  };
  const executionTimeoutMs = Number(
    options.executionTimeoutMs ||
    process.env.SHEIKHA_LOCAL_BENCHMARK_TIMEOUT_MS ||
    60000
  );
  const executionNumPredict = Number(
    options.executionNumPredict ||
    process.env.SHEIKHA_LOCAL_BENCHMARK_NUM_PREDICT ||
    32
  );
  const executionKeepAlive = String(
    options.executionKeepAlive ??
    process.env.SHEIKHA_LOCAL_BENCHMARK_KEEP_ALIVE ??
    '2m'
  );
  const results = [];
  for (const benchmarkCase of benchmarkCases) {
    const started = process.hrtime.bigint();
    const result = await executeIntelligenceRequest({
      prompt: benchmarkCase.prompt,
      mode: 'standard'
    }, {
      ...options,
      inventory: executionInventory,
      executionTimeoutMs,
      executionNumPredict,
      executionNumCtx: 512,
      executionKeepAlive,
      executionThink: false,
      persist: false
    });
    const elapsedMs =
      Number(process.hrtime.bigint() - started) / 1e6;
    const modelBacked =
      result.execution.route === 'LOCAL_MULTI_MODEL' &&
      result.execution.modelInvocations > 0 &&
      result.execution.successfulModelInvocations > 0 &&
      result.execution.selectedModels.length > 0;
    const operationalPassed =
      result.success === true &&
      result.task === benchmarkCase.expectedTask &&
      result.output.length > 0 &&
      modelBacked;
    results.push({
      id: benchmarkCase.id,
      expectedTask: benchmarkCase.expectedTask,
      observedTask: result.task,
      status: result.status,
      passed: operationalPassed,
      operationalPassed,
      route: result.execution.route,
      modelBacked,
      selectedModels: result.execution.selectedModels,
      modelInvocations: result.execution.modelInvocations,
      successfulModelInvocations:
        result.execution.successfulModelInvocations,
      failedModelInvocations:
        result.execution.failedModelInvocations,
      errors: result.execution.roleResults
        .map((entry) => entry.error)
        .filter(Boolean),
      outputSha256: result.output
        ? require('node:crypto')
          .createHash('sha256')
          .update(result.output)
          .digest('hex')
        : null,
      outputBytes: Buffer.byteLength(result.output || ''),
      elapsedMs: Math.round(elapsedMs * 100) / 100,
      qualityStatus: result.quality.status,
      qualityPassed: result.quality.passed,
      qualityFailures: result.quality.failed,
      semanticCorrectnessProven: false
    });
  }

  const passedCases =
    results.filter((entry) => entry.passed).length;
  const qualityPassedCases =
    results.filter((entry) => entry.qualityPassed).length;
  const modelBackedCases =
    results.filter((entry) => entry.modelBacked).length;
  const report = {
    schemaVersion: '1.0.0',
    system:
      'SHEIKHA_INTELLIGENCE_CAPABILITY_APEX_V1_LOCAL_OPERATIONAL_BENCHMARK',
    generatedAt,
    status:
      results.length > 0 &&
      passedCases === results.length
      ? 'LOCAL_OPERATIONAL_SMOKE_PASSED'
      : 'LOCAL_OPERATIONAL_SMOKE_REVIEW_REQUIRED',
    scope:
      'LOCAL_ROUTING_INFERENCE_AND_OUTPUT_SAFETY_SMOKE_ONLY',
    inventory: {
      status: inventory.status,
      online: inventory.online,
      endpoint: inventory.endpoint,
      discoveryMethod: inventory.discoveryMethod,
      modelCount: inventory.count,
      error: inventory.error
    },
    selection: {
      registeredCaseCount: CASES.length,
      selectedCaseIds: benchmarkCases.map((entry) => entry.id),
      deferredCaseIds: CASES
        .filter((entry) => !benchmarkCases.includes(entry))
        .map((entry) => entry.id),
      unknownRequestedCaseIds: requestedCaseIds.filter(
        (id) => !CASES.some((entry) => entry.id === id)
      ),
      executionModel: executionModel || null,
      executionModelAvailable:
        !executionModel || executionModels.length === 1,
      fullTaskCoverageCompleted:
        benchmarkCases.length === CASES.length
    },
    executionBudget: {
      timeoutMsPerCase: executionTimeoutMs,
      numPredictMaximum: executionNumPredict,
      numCtxMaximum: 512,
      thinkingDisabledForOperationalSmoke: true,
      keepAlive: executionKeepAlive,
      normalRuntimeProfilesModified: false
    },
    cases: results,
    summary: {
      executedCases: results.length,
      passedCases,
      failedCases: results.length - passedCases,
      qualityPassedCases,
      qualityReviewRequiredCases:
        results.length - qualityPassedCases,
      modelBackedCases,
      fallbackCases:
        results.filter((entry) =>
          entry.route === 'PROVIDER_FALLBACK'
        ).length,
      modelInvocations: results.reduce(
        (sum, entry) => sum + entry.modelInvocations,
        0
      ),
      externalComparisonCases: 0,
      copilotComparisonCases: 0,
      externalGptComparisonCases: 0
    },
    truthBoundaries: {
      zeroModelInvocationCanPass: false,
      operationalConnectivitySeparatedFromOutputQuality: true,
      operationalSmokeIsSemanticBenchmark: false,
      operationalSmokeIsCompetitorBenchmark: false,
      superiorityEstablished: false,
      accuracyEstablished: false,
      independentBlindReviewCompleted: false,
      humansRemainPrimaryAndAccountable: true
    },
    nextGate:
      'Add versioned public task suites, equal budgets, blind human scoring, ' +
      'reproducible hardware disclosure, and authorized competitor runs.'
  };
  writeJson(FILES.benchmark, report, options);
  await activate(options);
  return report;
}

if (require.main === module) {
  runBenchmark()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (report.summary.failedCases > 0) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = {
  CASES,
  runBenchmark
};
