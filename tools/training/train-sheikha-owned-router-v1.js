'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { evaluate, train } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-owned-router-trainer-v1'
);
const { decideLicense } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-license-training-engine-v1'
);

const root = path.resolve(__dirname, '../..');
const datasetPath = path.join(root, 'data/sheikha-ai-training/sheikha-owned-router-dataset-v1.json');
const outputDirectory = path.join(root, 'runtime/sheikha-ai-governor/v1/training');
const datasetBody = fs.readFileSync(datasetPath, 'utf8');
const dataset = JSON.parse(datasetBody);
const datasetSha256 = crypto.createHash('sha256').update(datasetBody).digest('hex');
const model = train(dataset.train);
const evaluation = evaluate(model, dataset.evaluation);
const license = decideLicense({
  modelId: model.system,
  operation: 'COMMERCIAL_INFERENCE',
  licenseId: dataset.license,
  licenseTextSha256: datasetSha256,
  documentedGrants: ['COMMERCIAL_INFERENCE'],
  restrictionsAccepted: true,
  evidence: [path.relative(root, datasetPath)]
});
const productionApproved = evaluation.accuracy === 1 && license.reasons.length === 0;
const report = {
  system: 'SHEIKHA_OWNED_ROUTER_TRAINING_V1',
  status: productionApproved ? 'TRAINED_EVALUATED_COMMERCIAL_INTERNAL_USE_READY' : 'TRAINED_NOT_PROMOTED',
  generatedAt: new Date().toISOString(),
  datasetSha256,
  trainingExamples: dataset.train.length,
  evaluation,
  licenseDecision: license,
  modelSha256: model.modelSha256,
  productionApproved,
  scope: 'REQUEST_CAPABILITY_CLASSIFICATION_ONLY',
  generativeModelClaimed: false
};
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'sheikha-owned-router-model-v1.json'), `${JSON.stringify(model, null, 2)}\n`, { mode: 0o600 });
fs.writeFileSync(path.join(outputDirectory, 'sheikha-owned-router-training-report-v1.json'), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify(report, null, 2));
