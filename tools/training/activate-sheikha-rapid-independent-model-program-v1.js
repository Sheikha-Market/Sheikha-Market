'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildRapidIndependentModelProgram } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-rapid-independent-model-program-v1'
);

const root = path.resolve(__dirname, '../..');
const secure = JSON.parse(fs.readFileSync(path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-secure-large-training-readiness-v1.json'), 'utf8'));
const tokenEvidence = JSON.parse(fs.readFileSync(path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-arabic-commercial-curriculum-v2-token-evidence.json'), 'utf8'));
const quarantine = JSON.parse(fs.readFileSync(path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-curriculum-v2-quarantine.json'), 'utf8'));
const report = buildRapidIndependentModelProgram({
  targetParametersB: secure.training?.estimate?.parametersB || 7,
  targetTokens: secure.training?.estimate?.targetTrainingTokens || 140_000_000_000,
  ownedLicensedTokens: tokenEvidence.tokenCount || 0,
  aggregateGpuMemoryGiB: secure.training?.cluster?.aggregateGpuMemoryGiB || 0,
  productionGpuNodes: secure.training?.cluster?.usableGpuNodes || 0,
  baseModelId: 'Llama-Sheikha-Governed:8b',
  baseModelLicenseAllowsTraining: true,
  piiReviewPassed: true,
  datasetQualityQuarantined: quarantine.status === 'QUALITY_REGRESSION_QUARANTINED',
  trainingApproval: false,
});
const output = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-rapid-independent-model-program-v1.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  status: report.status,
  servingNow: report.servingNow,
  continuedPretraining: report.accelerationTracks.continuedPretraining,
  independentFromScratch: report.accelerationTracks.independentFromScratch,
  report: path.relative(root, output),
  sha256: report.sha256,
}, null, 2)}\n`);
