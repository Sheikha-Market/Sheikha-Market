#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildFoundationBootstrap } = require('../../runtime/sheikha-ai-governor/v1/sheikha-foundation-bootstrap-v1');

const ROOT = path.resolve(__dirname, '../..');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const sourceManifest = read('data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.manifest.json');
const foundryManifest = read('data/sheikha-ai-training/foundry-v1/manifest.json');
const tokenEvidence = read('runtime/sheikha-ai-governor/v1/llm-training/sheikha-arabic-commercial-curriculum-v2-token-evidence.json');
const quarantine = read('runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-curriculum-v2-quarantine.json');

const report = buildFoundationBootstrap({
  baseModelId: 'Llama-Sheikha-Governed:8b',
  baseModelTrainingRights: true,
  datasetLicenseApproved: sourceManifest.license?.commercialTrainingApproved === true,
  piiReviewPassed: sourceManifest.privacy?.reviewStatus === 'PASSED',
  trainSplitValid: foundryManifest.files?.training?.records > 0,
  validationSplitValid: foundryManifest.files?.validation?.records > 0,
  testSplitValid: foundryManifest.files?.test?.records > 0,
  datasetQualityQuarantined: quarantine.status === 'QUALITY_REGRESSION_QUARANTINED',
  records: sourceManifest.records,
  tokens: tokenEvidence.tokenCount,
  provider: process.env.SHEIKHA_FOUNDATION_PROVIDER || 'LOCAL_OR_OPTIONAL_AZURE',
  fixedBudgetApproved: process.env.SHEIKHA_FOUNDATION_BUDGET_APPROVED === 'true',
  executionAuthorized: process.env.SHEIKHA_AUTHORIZE_FOUNDATION_BOOTSTRAP_V1 === 'YES',
});
const output = path.join(ROOT, 'runtime/sheikha-ai-governor/v1/llm-training/sheikha-foundation-bootstrap-v1.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
