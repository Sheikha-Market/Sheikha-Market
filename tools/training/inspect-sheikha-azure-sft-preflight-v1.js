#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildAzureSftPreflight } = require('../../runtime/sheikha-ai-governor/v1/sheikha-azure-sft-preflight-v1');

const ROOT = path.resolve(__dirname, '../..');
const DATASET = path.join(ROOT, 'data/sheikha-ai-training/foundry-v1/training.jsonl');
const APPROVAL = path.join(ROOT, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.approval.json');
const MANIFEST = path.join(ROOT, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2.manifest.json');
const QUARANTINE = path.join(ROOT, 'runtime/sheikha-ai-governor/v1/llm-training/sheikha-qwen-lora-curriculum-v2-quarantine.json');
const BASELINE = path.join(ROOT, 'runtime/sheikha-ai-governor/v1/llm-training/llama-sheikha-governed-8b-evaluation.json');
const OUTPUT = path.join(ROOT, 'runtime/sheikha-ai-governor/v1/llm-training/sheikha-azure-sft-preflight-v1.json');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function inspectDataset() {
  const raw = fs.readFileSync(DATASET, 'utf8');
  const lines = raw.split(/\r?\n/u).filter((line) => line.trim());
  let valid = true;
  for (const line of lines) {
    try {
      const item = JSON.parse(line);
      const messages = item.messages;
      valid = valid && Array.isArray(messages)
        && messages.some((message) => message.role === 'user' && String(message.content || '').trim())
        && messages.some((message) => message.role === 'assistant' && String(message.content || '').trim())
        && messages.at(-1)?.role === 'assistant';
    } catch { valid = false; }
  }
  return {
    records: lines.length,
    valid,
    sha256: crypto.createHash('sha256').update(raw).digest('hex'),
  };
}

function azJson(args) {
  return JSON.parse(execFileSync('az', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
}

function main() {
  let account = {};
  let resources = [];
  try {
    account = azJson(['account', 'show', '--output', 'json']);
    resources = azJson(['resource', 'list', '--subscription', account.id, '--output', 'json']);
  } catch {
    account = {};
  }
  const dataset = inspectDataset();
  const approval = readJson(APPROVAL);
  const manifest = readJson(MANIFEST);
  const quarantine = readJson(QUARANTINE);
  const baseline = readJson(BASELINE);
  const report = buildAzureSftPreflight({
    azureCliAuthenticated: Boolean(account.id),
    subscriptionEnabled: account.state === 'Enabled',
    resources,
    datasetRecords: dataset.records,
    datasetSha256: dataset.sha256,
    datasetFormatValid: dataset.valid,
    datasetLicenseApproved: manifest.license?.commercialTrainingAllowed === true
      || manifest.license?.commercialTrainingApproved === true,
    piiAndSecretReviewPassed: manifest.privacy?.piiReviewPassed === true
      || manifest.privacy?.privacyReviewPassed === true
      || manifest.privacy?.reviewStatus === 'PASSED',
    externalProcessorApproved: approval.externalTrainingApproval === true,
    datasetQualityQuarantined: quarantine.quarantined !== false,
    baselineEvaluationPresent: Boolean(baseline.reportSha256 || baseline.sha256),
    budgetApproved: process.env.SHEIKHA_AZURE_BUDGET_APPROVED === 'true',
    paidTrainingAuthorized: process.env.SHEIKHA_AUTHORIZE_AZURE_SFT_JOB_V1 === 'YES',
  });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.status !== 'READY_TO_SUBMIT_SFT_JOB') process.exitCode = 2;
}

main();
