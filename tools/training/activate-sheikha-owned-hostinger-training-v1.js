#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildOwnedHostingerTrainingPlan } = require('../../runtime/sheikha-ai-governor/v1/sheikha-owned-hostinger-training-v1');

const ROOT = path.resolve(__dirname, '../..');
const envFiles = ['.env', '.env.production'].map((file) => path.join(ROOT, file));
const credentialPresent = envFiles.some((file) => {
  try {
    const match = fs.readFileSync(file, 'utf8').match(/^HOSTINGER_API_TOKEN=(.+)$/mu);
    return Boolean(match && match[1] && !/^(CHANGE_ME|REPLACE|YOUR_)/u.test(match[1]));
  } catch { return false; }
});
const quarantine = JSON.parse(fs.readFileSync(path.join(ROOT,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-curriculum-v2-quarantine.json'), 'utf8'));
const report = buildOwnedHostingerTrainingPlan({
  hostingerCredentialPresent: credentialPresent,
  availableCredits: Number(process.env.SHEIKHA_HOSTINGER_GPU_CREDITS || 357),
  datasetV3QualityPassed: process.env.SHEIKHA_DATASET_V3_QUALITY_PASSED === 'true'
    && quarantine.status !== 'QUALITY_REGRESSION_QUARANTINED',
  licenseReviewPassed: process.env.SHEIKHA_QWEN3_32B_LICENSE_REVIEW_PASSED === 'true',
  executionAuthorized: process.env.SHEIKHA_AUTHORIZE_SINGLE_PAYMENT_HOSTINGER_TRAINING_V1 === 'YES',
});
const output = path.join(ROOT,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-owned-hostinger-training-v1.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
