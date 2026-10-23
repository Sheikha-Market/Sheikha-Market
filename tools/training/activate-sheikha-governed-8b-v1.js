'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { selectCandidate } = require(
  '../../runtime/sheikha-ai-governor/v1/llm-training/sheikha-model-selection-v1'
);

const root = path.resolve(__dirname, '../..');
const trainingRoot = path.join(root, 'runtime/sheikha-ai-governor/v1/llm-training');
const evaluationPath = path.join(trainingRoot, 'llama-sheikha-governed-8b-evaluation.json');
const outputPath = path.join(trainingRoot, 'llama-sheikha-governed-8b-admission.json');
const evaluation = JSON.parse(fs.readFileSync(evaluationPath, 'utf8'));
const selection = selectCandidate([{
  ...evaluation,
  licenseReviewed: false,
}]);
const base = {
  system: 'SHEIKHA_FOUNDRY_MODEL_ADMISSION_V1',
  productName: 'نموذج شيخة العربي المحكوم',
  technicalModelId: 'Llama-Sheikha-Governed:8b',
  classification: 'LLAMA_3_1_8B_DERIVATIVE_RUNTIME_PROFILE',
  independentlyTrainedFromScratch: false,
  parameterClass: '8B',
  baseModel: 'llama3.1:8b',
  upstreamOwner: 'Meta Platforms, Inc.',
  license: {
    id: 'LLAMA_3_1_COMMUNITY_LICENSE',
    termsEmbeddedInOllamaManifest: true,
    attributionRequired: 'Built with Llama',
    redistributionNamePrefixSatisfied: true,
    humanLegalReviewComplete: false,
  },
  evaluation: {
    status: evaluation.status,
    passedCases: evaluation.passedCases,
    totalCases: evaluation.totalCases,
    p95LatencyMs: evaluation.p95LatencyMs,
    qualityGatePassed: evaluation.qualityGatePassed,
    latencyGatePassed: evaluation.latencyGatePassed,
    reportSha256: evaluation.reportSha256,
  },
  selection,
  admission: {
    localEngineeringServingAllowed: evaluation.qualityGatePassed && evaluation.latencyGatePassed,
    controlledPilotCandidate: true,
    commercialProductionApproved: false,
    publicGeneralAvailabilityApproved: false,
    customerContentTrainingDefault: false,
    automaticPromotion: false,
  },
  remainingGates: [
    'INDEPENDENT_SAFETY_EVALUATION', 'PROMPT_INJECTION_AND_ABUSE_EVALUATION',
    'LOAD_SOAK_AND_RECOVERY', 'PRIVACY_IMPACT_REVIEW', 'HUMAN_LEGAL_APPROVAL',
    'CONTROLLED_CANARY_AND_ROLLBACK',
  ],
};
const report = { ...base, reportSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  status: report.admission.localEngineeringServingAllowed ? 'LOCAL_ENGINEERING_SERVING_ADMITTED' : 'ADMISSION_DENIED',
  technicalModelId: report.technicalModelId,
  evaluation: report.evaluation,
  commercialProductionApproved: report.admission.commercialProductionApproved,
  report: path.relative(root, outputPath),
  reportSha256: report.reportSha256,
}, null, 2)}\n`);
