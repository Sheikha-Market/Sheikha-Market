'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(
  ROOT,
  'runtime/chat-commercial-readiness/v1/sheikha-chat-commercial-load-v1.json'
);
const requestCount = Number(process.env.SHEIKHA_LOAD_REQUESTS || 20);
const concurrency = Number(process.env.SHEIKHA_LOAD_CONCURRENCY || 5);
const payload = JSON.stringify({
  message: 'قدّم تقريرًا عربيًا موجزًا عن جاهزية شات شيخة التجارية، مع الحالة والأدلة والحدود.',
  language: 'ar',
  mode: 'smart',
  actor: 'commercial-load-verifier',
  channel: 'extension-chat',
  responseMode: 'FAST_THEN_DEEP_STREAM'
});

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] || null;
}

function runRequest(id) {
  const started = process.hrtime.bigint();
  return new Promise((resolve) => {
    let body = '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/sheikha/live/chat/v1',
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload)
      },
      timeout: 5000
    }, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
        const structuredReadiness = body.includes('الحالة:') &&
          body.includes('الأدلة:') && body.includes('الحدود:');
        const governedOperationalReadiness =
          body.includes('GOVERNED_OPERATIONAL_KNOWLEDGE_FAST_PATH') &&
          ['حقوق', 'أمن', 'جودة', 'تراجع'].every((term) => body.includes(term));
        resolve({
          id,
          passed: res.statusCode === 200 &&
            body.includes('event: done') &&
            (structuredReadiness || governedOperationalReadiness) &&
            !body.includes('GOVERNED_LOCAL_TIME_BUDGET_FALLBACK'),
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(3)),
          bytes: Buffer.byteLength(body)
        });
      });
    });
    req.on('timeout', () => req.destroy(new Error('LOAD_REQUEST_TIMEOUT')));
    req.on('error', (error) => resolve({
      id,
      passed: false,
      statusCode: null,
      durationMs: Number((Number(process.hrtime.bigint() - started) / 1e6).toFixed(3)),
      bytes: 0,
      error: error.message
    }));
    req.end(payload);
  });
}

async function main() {
  const results = [];
  let nextId = 1;
  async function worker() {
    while (nextId <= requestCount) {
      const id = nextId++;
      results.push(await runRequest(id));
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, requestCount) }, worker)
  );
  results.sort((a, b) => a.id - b.id);
  const durations = results.map((item) => item.durationMs);
  const passedCount = results.filter((item) => item.passed).length;
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CHAT_COMMERCIAL_LOAD_V1',
    generatedAt: new Date().toISOString(),
    status: passedCount === requestCount ? 'VERIFIED' : 'BLOCKED',
    passed: passedCount === requestCount,
    requestCount,
    concurrency,
    passedCount,
    failedCount: requestCount - passedCount,
    latencyMs: {
      minimum: Math.min(...durations),
      p50: percentile(durations, 0.5),
      p95: percentile(durations, 0.95),
      maximum: Math.max(...durations)
    },
    results,
    boundaries: {
      loopbackOnly: true,
      durationClass: 'short-burst',
      publicInternetTested: false,
      soakTested: false
    }
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({
    status: report.status,
    passed: report.passed,
    requestCount,
    concurrency,
    passedCount,
    failedCount: report.failedCount,
    latencyMs: report.latencyMs,
    evidence: path.relative(ROOT, OUTPUT)
  }, null, 2)}\n`);
  process.exitCode = report.passed ? 0 : 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
