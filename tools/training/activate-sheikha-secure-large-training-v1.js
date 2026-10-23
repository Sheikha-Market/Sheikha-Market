'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildSecureReadiness } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-secure-large-training-v1'
);

const root = path.resolve(__dirname, '../..');
const requestPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-secure-large-training-request-v1.json');
const outputPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-secure-large-training-readiness-v1.json');
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
const report = buildSecureReadiness({
  nodeCandidates: request.nodeCandidates,
  training: {
    parametersB: request.target.parametersB,
    datasetManifestSha256: request.dataset.manifestSha256,
    datasetTokenCount: request.dataset.tokenCount,
    datasetLicenseVerified: request.dataset.commercialLicenseVerified,
    externalTrainingLicenseVerified: request.dataset.externalTrainingLicenseVerified,
    datasetProvenanceVerified: request.dataset.provenanceVerified,
    piiReviewPassed: request.dataset.piiReviewPassed,
    tokenizerManifestSha256: request.dataset.tokenizerManifestSha256,
    evalPlanSha256: request.dataset.evaluationPlanSha256,
    rollbackPlanSha256: request.dataset.rollbackPlanSha256,
    humanApproval: request.authorization.trainingExecutionApproved
  },
  license: request.license
});
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  fabricStatus: report.fabricStatus,
  trainingAdmissionStatus: report.trainingAdmissionStatus,
  commercialReadiness: report.commercialReadiness,
  admittedGpuNodes: report.nodeAdmissions.filter((node) => node.admitted).length,
  internalLicenseStatus: report.license.status,
  report: path.relative(root, outputPath)
}, null, 2)}\n`);
