'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { isCloudModel } = require('../../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1');

const root = path.resolve(__dirname, '../..');
const model = process.env.SHEIKHA_EVAL_MODEL || 'Sheikha-Core:latest';
const reportPath = path.join(root, process.env.SHEIKHA_EVAL_REPORT ||
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-core-candidate-evaluation.json');
const requestTimeoutMs = Math.max(5000, Number(process.env.SHEIKHA_EVAL_TIMEOUT_MS) || 30000);
const cases = [
  ['اشرح باختصار كيف نتحقق من نتيجة هندسية.', ['قياس', 'اختبار', 'دليل', 'قبول']],
  ['اكتب ردًا مهنيًا عن تأخر تنفيذ الطلب.', ['نعتذر', 'تأخير', 'سبب', 'موعد']],
  ['ما الضابط قبل استخدام بيانات في تدريب نموذج؟', ['مصدر', 'ترخيص', 'موافقة', 'خصوصية']],
  ['كيف أحسب نسبة الإنجاز بطريقة قابلة للمراجعة؟', ['البسط', 'المقام', '100', 'مصدر']],
  ['رتب خطوات إصلاح خطأ برمجي دون نشر مباشر.', ['إعادة', 'اختبار', 'فرق', 'نشر']],
  ['متى تصبح خدمة الذكاء الاصطناعي جاهزة تجاريًا؟', ['حقوق', 'أمن', 'جودة', 'تراجع']]
];

async function main() {
  if (isCloudModel(model)) throw new Error('CLOUD_MODEL_NOT_ALLOWED_IN_LOCAL_EVALUATOR');
  const results = [];
  for (const [prompt, requiredTerms] of cases) {
    const started = performance.now();
    let response;
    try {
      response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model, prompt, stream: false, think: false,
        options: { temperature: 0, num_predict: 128, num_ctx: 2048 }
      }),
      signal: globalThis.AbortSignal.timeout(requestTimeoutMs)
      });
    } catch (error) {
      results.push({ prompt, response: '', latencyMs: Number((performance.now() - started).toFixed(2)),
        requiredTerms, matchedTerms: [], containsArabic: false, containsCjk: false,
        qualityPassed: false, error: error.name === 'TimeoutError' ? 'INFERENCE_TIMEOUT' : error.message });
      continue;
    }
    if (!response.ok) throw new Error(`OLLAMA_HTTP_${response.status}`);
    const body = await response.json();
    const text = String(body.response || '').trim();
    const matchedTerms = requiredTerms.filter((term) => text.includes(term));
    const containsCjk = /[\u3400-\u9fff]/.test(text);
    results.push({
      prompt, response: text, latencyMs: Number((performance.now() - started).toFixed(2)),
      requiredTerms, matchedTerms, containsArabic: /[\u0600-\u06ff]/.test(text),
      containsCjk, qualityPassed: matchedTerms.length >= 2 && !containsCjk
    });
  }
  const passed = results.filter((item) => item.qualityPassed).length;
  const sortedLatencies = results.map((item) => item.latencyMs).sort((a, b) => a - b);
  const p95LatencyMs = sortedLatencies[Math.max(0, Math.ceil(sortedLatencies.length * 0.95) - 1)];
  const latencyBudgetMs = Math.max(1000, Number(process.env.SHEIKHA_EVAL_P95_BUDGET_MS) || 8000);
  const report = {
    system: 'SHEIKHA_OLLAMA_CANDIDATE_EVALUATION_V1', model,
    status: passed === results.length ? 'QUALITY_GATE_PASSED' : 'QUALITY_GATE_FAILED',
    passedCases: passed, totalCases: results.length,
    averageLatencyMs: Number((results.reduce((sum, item) => sum + item.latencyMs, 0) / results.length).toFixed(2)),
    p95LatencyMs,
    latencyBudgetMs,
    latencyGatePassed: p95LatencyMs <= latencyBudgetMs,
    qualityGatePassed: passed === results.length, commercialProductionApproved: false, results
  };
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) main().catch((error) => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
