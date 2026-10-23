'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  buildCompositeModel,
  buildLicenseDecision
} = require('../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');

const root = path.resolve(__dirname, '../..');
const inventoryPath = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1.json'
);
const output = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-composite-model-report-v1.json'
);
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const evaluationPath = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-model-evaluation-v1.json'
);
const nativeEvaluation = fs.existsSync(evaluationPath)
  ? JSON.parse(fs.readFileSync(evaluationPath, 'utf8'))
  : { evaluations: [] };
const evaluationResults = Object.fromEntries(
  nativeEvaluation.evaluations.map((evaluation) => [
    evaluation.model,
    {
      passed: evaluation.status === 'EVALUATION_PASSED',
      score: `${evaluation.passedCount}/${evaluation.totalCount}`,
      maximumLatencyMs: Math.max(
        0,
        ...evaluation.results.map((result) => Number(result.latencyMs || 0))
      ),
      productionQualityCertified: false
    }
  ])
);
const composite = buildCompositeModel(inventory, { evaluationResults });
const licenseDecisions = inventory.models.map((model) => ({
  model: model.name,
  ...buildLicenseDecision(model, null)
}));
const report = {
  ...composite,
  evaluationResults,
  licenseDecisions,
  finalReadiness: {
    status: 'NOT_PRODUCTION_READY',
    completed: [
      'LOCAL_MODEL_DISCOVERY',
      'LOCAL_LICENSE_CAPTURE',
      'GOVERNOR_POLICY',
      'MINIMAL_INFERENCE_SMOKE',
      'RENEWAL_PLAN'
    ],
    blockers: [
      'UPSTREAM_LICENSE_REVIEW_FOR_FOUR_MODELS',
      'FULL_MODEL_QUALITY_EVALUATION',
      'QWEN_LOCAL_LATENCY_EXCEEDS_INTERACTIVE_BUDGET',
      'DEEPSEEK_TARGETED_EVALUATION_FAILED_1_OF_3_ONLY',
      'COMPOSITE_ROUTER_RUNTIME_BINDING',
      'LOAD_SOAK_AND_FAILURE_TESTS',
      'ROLLBACK_AND_CANARY_PROMOTION',
      'HUMAN_PRODUCTION_APPROVAL'
    ],
    claimPolicy: 'No production-ready or complete-license claim until every blocker has evidence.'
  }
};
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  system: report.system,
  status: report.status,
  finalReadiness: report.finalReadiness.status,
  inventory: report.inventory,
  roleBindings: report.roleBindings,
  output: path.relative(root, output),
  networkUsed: false,
  modelWeightsModified: false,
  licensesIssuedForThirdParties: false
}, null, 2));
