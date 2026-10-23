'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(
  ROOT,
  'runtime/chat-commercial-readiness/v1/sheikha-chat-commercial-sustained-v1.json'
);
const durationMs = Number(process.env.SHEIKHA_SUSTAINED_DURATION_MS || 60_000);
const intervalMs = Number(process.env.SHEIKHA_SUSTAINED_INTERVAL_MS || 2_500);
const host = process.env.SHEIKHA_SUSTAINED_HOST || '127.0.0.1';
const port = Number(process.env.SHEIKHA_SUSTAINED_PORT || 8083);
const payload = JSON.stringify({
  message: 'اكتب حالة الجاهزية التجارية وغير التجارية الموثقة باختصار',
  language: 'ar'
});

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] || null;
}

function request({ method = 'GET', requestPath, body = '' }) {
  const started = process.hrtime.bigint();
  return new Promise((resolve) => {
    let responseBody = '';
    const req = http.request({
      hostname: host,
      port,
      path: requestPath,
      method,
      headers: body ? {
        accept: 'text/event-stream',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body)
      } : {},
      timeout: 10_000
    }, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        body: responseBody,
        durationMs: Number((Number(process.hrtime.bigint() - started) / 1e6).toFixed(3))
      }));
    });
    req.on('timeout', () => req.destroy(new Error('SUSTAINED_REQUEST_TIMEOUT')));
    req.on('error', (error) => resolve({
      statusCode: null,
      body: '',
      durationMs: Number((Number(process.hrtime.bigint() - started) / 1e6).toFixed(3)),
      error: error.message
    }));
    req.end(body);
  });
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  if (!Number.isFinite(durationMs) || durationMs < 10_000 ||
      !Number.isFinite(intervalMs) || intervalMs < 1_000) {
    throw new Error('INVALID_SUSTAINED_TEST_BOUNDS');
  }

  const healthBefore = await request({ requestPath: '/health' });
  const deadline = Date.now() + durationMs;
  const results = [];
  let id = 1;
  while (Date.now() < deadline) {
    const result = await request({
      method: 'POST',
      requestPath: '/api/sheikha/live/chat/v1',
      body: payload
    });
    const structuredReadiness = result.body.includes('الحالة:') &&
      result.body.includes('الأدلة:') && result.body.includes('الحدود:');
    const governedOperationalReadiness =
      result.body.includes('GOVERNED_OPERATIONAL_KNOWLEDGE_FAST_PATH') &&
      ['حقوق', 'أمن', 'جودة', 'تراجع'].every((term) => result.body.includes(term));
    const passed = result.statusCode === 200 &&
      result.body.includes('event: done') &&
      (structuredReadiness || governedOperationalReadiness) &&
      !result.body.includes('GOVERNED_LOCAL_TIME_BUDGET_FALLBACK');
    results.push({
      id: id++,
      passed,
      statusCode: result.statusCode,
      durationMs: result.durationMs,
      bytes: Buffer.byteLength(result.body),
      ...(result.error ? { error: result.error } : {})
    });
    await sleep(intervalMs);
  }
  const healthAfter = await request({ requestPath: '/health' });
  const durations = results.map((item) => item.durationMs);
  const passedCount = results.filter((item) => item.passed).length;
  const healthPassed = [healthBefore, healthAfter].every((item) =>
    item.statusCode === 200 && item.body.includes('SHEIKHA_COMMERCIAL_CHAT_GATEWAY_V1')
  );
  const passed = results.length > 0 && passedCount === results.length && healthPassed;
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CHAT_COMMERCIAL_SUSTAINED_V1',
    generatedAt: new Date().toISOString(),
    status: passed ? 'VERIFIED' : 'BLOCKED',
    passed,
    target: `http://${host}:${port}`,
    configuredDurationMs: durationMs,
    intervalMs,
    requestCount: results.length,
    passedCount,
    failedCount: results.length - passedCount,
    healthBeforePassed: healthBefore.statusCode === 200,
    healthAfterPassed: healthAfter.statusCode === 200,
    latencyMs: {
      minimum: Math.min(...durations),
      p50: percentile(durations, 0.5),
      p95: percentile(durations, 0.95),
      maximum: Math.max(...durations)
    },
    results,
    boundaries: {
      gatewayAndBackendIncluded: true,
      loopbackOnly: host === '127.0.0.1' || host === 'localhost',
      durationClass: 'sustained-smoke',
      formalSoakTest: false,
      contractualSlaEvidence: false
    }
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = passed ? 0 : 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
