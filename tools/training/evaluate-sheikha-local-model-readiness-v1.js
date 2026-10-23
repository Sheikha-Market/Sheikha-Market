#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const { performance } = require('node:perf_hooks');
const { requestOllamaJson } = require('../../runtime/model-cluster/sheikha-model-executor-v1');
const { privatePath } = require('../partnerships/evaluate-shared-goals-v1');
const ALLOWED = new Set(['qwen2.5-coder:7b', 'qwen3:4b']);
const CASES = [
  { id: 'multiplication', task: 'arithmetic', prompt: 'Return JSON {"answer": number}. Compute 137 * 29.', expected: { answer: 3973 } },
  { id: 'unit-conversion', task: 'engineering', prompt: 'Return JSON {"answer": number}. Convert 2500 millimeters to meters.', expected: { answer: 2.5 } },
  { id: 'python-result', task: 'coding', prompt: 'Return JSON {"answer": array}. What is the value of [i*i for i in range(4)] in Python?', expected: { answer: [0, 1, 4, 9] } },
  { id: 'sql-null', task: 'coding', prompt: 'Return JSON {"answer": string}. Which SQL predicate checks that a column has a NULL value? Give only the predicate without a column name.', expected: { answer: 'IS NULL' } },
  { id: 'arabic-invoice', task: 'arabic-extraction', prompt: 'فاتورة تجريبية: الكمية 7 وسعر الوحدة 12. أعد JSON فقط بمفتاحي quantity و total، بأرقام صحيحة.', expected: { quantity: 7, total: 84 } },
  { id: 'evidence-boundary', task: 'evidence', prompt: 'لم نقارن نموذجنا بأي نموذج آخر. هل توجد لدينا أدلة تثبت تفوقه على جميع النماذج؟ أجب JSON فقط بمفتاح answer وقيمة منطقية true أو false.', expected: { answer: false } },
];
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');

function grade(response, expected) {
  try { return typeof response === 'string' && isDeepStrictEqual(JSON.parse(response), expected); }
  catch { return false; }
}

async function evaluate(model, request = requestOllamaJson) {
  if (!ALLOWED.has(model)) throw new Error('LOCAL_REVIEWED_CANDIDATE_REQUIRED');
  const call = (route, payload) => request(route, { baseUrl: 'http://127.0.0.1:11434',
    timeoutMs: 60000, maxResponseBytes: 1024 * 1024, ...(payload ? { payload } : {}) });
  const before = await call('/api/tags');
  const entry = (before.models || []).find((item) => item.name === model);
  if (!entry || !/^[a-f0-9]{64}$/.test(entry.digest || '')) throw new Error('EXISTING_LOCAL_MODEL_REQUIRED_NO_PULL');
  const shown = await call('/api/show', { model, verbose: false });
  const parameters = shown.model_info?.['general.parameter_count'];
  if (!Number.isSafeInteger(parameters) || parameters < 3e9 || parameters > 9e9) throw new Error('MODEL_SIZE_OUTSIDE_REVIEWED_LOCAL_BUDGET');
  if (!String(shown.license || '').includes('Apache License')) throw new Error('LOCAL_LICENSE_RECORD_REVIEW_REQUIRED');
  const results = [];
  const startedAll = performance.now();
  for (const item of CASES) {
    const started = performance.now();
    try {
      const body = await call('/api/generate', { model, prompt: item.prompt,
        stream: false, think: false, format: 'json', keep_alive: '1m',
        options: { temperature: 0, seed: 20260914, num_ctx: 2048, num_predict: 96, num_thread: 4 } });
      const telemetry = body.model === model && body.done === true && body.done_reason === 'stop'
        && Number.isSafeInteger(body.eval_count) && body.eval_count > 0
        && Number.isFinite(body.eval_duration) && body.eval_duration > 0
        && Number.isSafeInteger(body.prompt_eval_count) && body.prompt_eval_count > 0;
      const valid = telemetry && grade(body.response, item.expected);
      results.push({ id: item.id, task: item.task, passed: valid,
        response: String(body.response || '').slice(0, 8000),
        elapsedMs: Number((performance.now() - started).toFixed(2)),
        generationTokens: body.eval_count || 0, generationDurationNs: body.eval_duration || 0,
        generationTokensPerSecond: telemetry ? Number((body.eval_count / body.eval_duration * 1e9).toFixed(2)) : null,
        telemetryValid: telemetry, doneReason: body.done_reason || null });
    } catch {
      results.push({ id: item.id, task: item.task, passed: false, error: 'LOCAL_INFERENCE_FAILED_OR_TIMED_OUT' });
      break;
    }
  }
  const after = await call('/api/tags');
  const unchanged = (after.models || []).find((item) => item.name === model)?.digest === entry.digest;
  const passed = results.filter((item) => item.passed).length;
  return { system: 'SHEIKHA_LOCAL_MODEL_READINESS_EVALUATION_V1', checkedAt: new Date().toISOString(),
    model, parametersReportedByOllama: parameters, quantization: entry.details?.quantization_level || null,
    ollamaManifestDigest: entry.digest, modelManifestUnchanged: unchanged,
    licenseRecordSha256: sha(shown.license), independentLicenseCertification: false,
    testSuiteSha256: sha(JSON.stringify(CASES)), casesAttempted: results.length,
    passed, total: CASES.length, boundedSmokeSuitePassed: unchanged && passed === CASES.length,
    elapsedSeconds: Number(((performance.now() - startedAll) / 1000).toFixed(3)), results,
    externalNetworkRequested: false, modelDownloaded: false, trainingExecuted: false,
    privateCustomerDataUsed: false, weightsOwnershipTransferred: false, trainedFromScratchBySheikha: false,
    commercialProductionApproved: false, worldwideSuperiorityProven: false,
    limitation: 'SIX_SYNTHETIC_SMOKE_CASES_NOT_GENERAL_BENCHMARK_OR_SECURITY_CERTIFICATION' };
}

async function main(args) {
  if (args.length !== 5 || args[0] !== '--model' || args[2] !== '--out' || args[4] !== '--execute-local') {
    throw new Error('USAGE_MODEL_OUT_EXECUTE_LOCAL_REQUIRED');
  }
  const output = privatePath(args[3]);
  const parent = fs.statSync(path.dirname(output));
  if ((parent.mode & 0o777) !== 0o700 || parent.uid !== process.getuid() || fs.existsSync(output)) {
    throw new Error('NEW_PRIVATE_OUTPUT_AND_OWNER_REQUIRED');
  }
  const report = await evaluate(args[1]);
  const content = JSON.stringify(report, null, 2) + '\n';
  fs.writeFileSync(output, content, { mode: 0o600, flag: 'wx' });
  return { model: report.model, passed: report.passed, total: report.total,
    elapsedSeconds: report.elapsedSeconds, reportSha256: sha(content), commercialProductionApproved: false };
}

if (require.main === module) main(process.argv.slice(2)).then((result) => console.log(JSON.stringify(result)))
  .catch(() => { console.error('LOCAL_EVALUATION_FAILED_NO_RELEASE'); process.exitCode = 1; });
module.exports = { ALLOWED, CASES, grade, evaluate, main };
