'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildFoundryStatus } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-foundry-v1'
);

const root = path.resolve(__dirname, '../..');
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const inventory = read('runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-cluster-inventory-v1.json');
const admission = read('runtime/sheikha-ai-governor/v1/llm-training/llama-sheikha-governed-8b-admission.json');
const evaluation = read('runtime/sheikha-ai-governor/v1/llm-training/llama-sheikha-governed-8b-evaluation.json');

const report = buildFoundryStatus({
  parametersB: 7,
  nodes: inventory.nodes,
  pilot: {
    modelId: admission.technicalModelId,
    artifactSha256: admission.reportSha256,
    nativeInferencePassed: true,
    qualityGatePassed: evaluation.qualityGatePassed,
    safetyGatePassed: false,
    licenseGatePassed: false,
    securityGatePassed: false,
    canaryPassed: false,
    humanCommercialApproval: false
  }
});
const reportPath = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-model-foundry-v1-report.json'
);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  status: report.status,
  local: report.environments.local.status,
  external: report.environments.external.status,
  pilotCommercialApproved: report.pilot.commercialProductionApproved,
  report: path.relative(root, reportPath)
}, null, 2)}\n`);
