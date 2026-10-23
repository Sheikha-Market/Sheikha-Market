'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { buildCompositeExecutionPlan } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1'
);

const root = path.resolve(__dirname, '../..');
const read = (relative) => JSON.parse(
  fs.readFileSync(path.join(root, relative), 'utf8')
);
const inventory = read(
  'runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1.json'
);
const native = read(
  'runtime/sheikha-ai-governor/v1/sheikha-model-evaluation-v1.json'
);
const arabic = read(
  'runtime/sheikha-ai-governor/v1/llm-training/' +
  'sheikha-arabic-governed-4b-evaluation.json'
);
const evaluationResults = Object.fromEntries(
  (native.evaluations || []).map((evaluation) => [
    evaluation.model,
    {
      passed: evaluation.status === 'EVALUATION_PASSED',
      score: evaluation.totalCount > 0
        ? evaluation.passedCount / evaluation.totalCount
        : 0,
      maximumLatencyMs: Math.max(
        0,
        ...(evaluation.results || []).map((item) =>
          Number(item.latencyMs || 0))
      )
    }
  ])
);
evaluationResults[arabic.model] = {
  passed: arabic.qualityGatePassed === true,
  score: arabic.totalCases > 0
    ? arabic.passedCases / arabic.totalCases
    : 0,
  p95LatencyMs: arabic.p95LatencyMs
};
const plan = buildCompositeExecutionPlan(inventory, {
  roles: ['coding', 'reasoning', 'arabic_governance'],
  commercial: true,
  evaluationResults
});
const report = {
  ...plan,
  generatedAt: new Date().toISOString(),
  evidence: {
    inventorySha256: crypto.createHash('sha256')
      .update(JSON.stringify(inventory))
      .digest('hex'),
    arabicEvaluationSha256: arabic.reportSha256,
    discoveredModels: inventory.summary.discovered
  },
  deliveryTruth: {
    availableToday: 'SHEIKHA_GOVERNED_COMPOSITE_RUNTIME',
    trainedLargeModelFromScratchCompleted: false,
    weightMergePerformed: false,
    thirdPartyLicenseReissued: false
  }
};
const target = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/' +
  'sheikha-composite-runtime-v2-report.json'
);
fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  system: report.system,
  status: report.status,
  selectedModels: report.selectedModels.map((item) => item.model),
  uncoveredRoles: report.uncoveredRoles,
  productionCommercialApproved: report.productionCommercialApproved,
  output: path.relative(root, target),
  planSha256: report.planSha256
}, null, 2)}\n`);
