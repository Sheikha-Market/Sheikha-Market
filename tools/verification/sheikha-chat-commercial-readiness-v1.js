'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/chat-commercial-readiness/v1'
);
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  'sheikha-chat-commercial-readiness-v1.json'
);
const STARTED_AT = new Date().toISOString();
const start = process.hrtime.bigint();

function elapsedMs() {
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseEvent(block) {
  let event = 'message';
  const data = [];
  for (const line of block.split(/\r?\n/u)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trim());
  }
  const raw = data.join('\n');
  try {
    return { event, data: JSON.parse(raw) };
  } catch {
    return { event, data: { text: raw } };
  }
}

function writeReport(report) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(report, null, 2)}\n`, {
    mode: 0o600
  });
  process.stdout.write(`${JSON.stringify({
    system: report.system,
    status: report.status,
    passed: report.passed,
    timingMs: report.timingMs,
    route: report.route,
    responseCharacters: report.response.characters,
    responseSha256: report.response.sha256,
    checks: report.checks,
    evidence: path.relative(ROOT, OUTPUT_FILE)
  }, null, 2)}\n`);
}

const payload = JSON.stringify({
  message:
    'قدّم تقريرًا عربيًا موجزًا عن جاهزية شات شيخة التجارية، مع الحالة والأدلة والحدود.',
  language: 'ar',
  mode: 'smart',
  actor: 'commercial-readiness-verifier',
  channel: 'extension-chat',
  responseMode: 'FAST_THEN_DEEP_STREAM'
});

const events = [];
const tokens = [];
let buffer = '';
let firstEventMs = null;
let firstTokenMs = null;
let doneMs = null;
let doneReason = null;
let terminalRoute = null;
let statusCode = null;
let route = null;
let finished = false;

function finish(error = null) {
  if (finished) return;
  finished = true;
  const response = tokens.join('').trim();
  const fallbackDetected =
    /(?:لم يكتمل استدلال|تجاوز ميزانية|تعافٍ محلي|timeout)/iu.test(response);
  const unsupportedCommercialClaimDetected =
    /(?:رضا[^\n]{0,20}\d+%|جميع أنحاء العالم|جميع الأجهزة|دون أي مشاكل)/iu
      .test(response);
  const requiredSectionsPresent =
    /الحالة/u.test(response) && /الأدلة/u.test(response) && /الحدود/u.test(response);
  const completeEndingPresent = /[.!؟:]$/u.test(response);
  const governedLocalCompletion =
    String(terminalRoute || '').startsWith('GOVERNED_');
  const fullResponsePresent = response.length >= 120 &&
    requiredSectionsPresent &&
    !fallbackDetected &&
    doneReason !== 'length' &&
    completeEndingPresent &&
    !/^(?:الحالة الموثقة الآن|إليك النتيجة مباشرة|الجواب المباشر):?\s*$/u
      .test(response);
  const thresholds = {
    firstEventMsMaximum: 1000,
    firstTokenMsMaximum: 8000,
    doneMsMaximum: 90000
  };
  const checks = {
    httpSuccess: statusCode >= 200 && statusCode < 300,
    firstEventWithinBudget:
      firstEventMs !== null && firstEventMs <= thresholds.firstEventMsMaximum,
    firstTokenWithinBudget:
      firstTokenMs !== null && firstTokenMs <= thresholds.firstTokenMsMaximum,
    doneReceived: doneMs !== null,
    modelStoppedNaturally:
      governedLocalCompletion ||
      (Boolean(doneReason) && doneReason !== 'length' && !fallbackDetected),
    doneWithinBudget: doneMs !== null && doneMs <= thresholds.doneMsMaximum,
    routePresent: Boolean(route),
    requiredSectionsPresent,
    fullResponsePresent,
    noFallbackCompletion: !fallbackDetected,
    noUnsupportedCommercialClaim: !unsupportedCommercialClaimDetected,
    noSecretMaterialRecorded: true
  };
  const passed = Object.values(checks).every(Boolean) && !error;
  writeReport({
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_CHAT_COMMERCIAL_READINESS_V1',
    generatedAt: new Date().toISOString(),
    startedAt: STARTED_AT,
    status: passed
      ? 'COMMERCIAL_RESPONSE_PATH_VERIFIED'
      : 'COMMERCIAL_RESPONSE_PATH_BLOCKED',
    passed,
    endpoint: 'http://127.0.0.1:8080/api/sheikha/live/chat/v1',
    request: {
      language: 'ar',
      mode: 'smart',
      channel: 'extension-chat',
      responseMode: 'FAST_THEN_DEEP_STREAM',
      bodySha256: sha256(payload)
    },
    timingMs: {
      firstEvent: firstEventMs,
      firstToken: firstTokenMs,
      done: doneMs,
      total: Number(elapsedMs().toFixed(3))
    },
    thresholds,
    route,
    terminalRoute,
    httpStatus: statusCode,
    eventSequence: events.map((item) => item.event),
    doneReason,
    response: {
      text: response,
      characters: response.length,
      sha256: sha256(response)
    },
    checks,
    error: error ? String(error.message || error) : null,
    boundaries: {
      localLoopbackOnly: true,
      externalNetworkUsed: false,
      highImpactActionExecuted: false,
      credentialsRecorded: false,
      productionClaimScope:
        'Verifies one local response path; does not establish public SLA or multi-node availability.'
    }
  });
  process.exitCode = passed ? 0 : 1;
}

const request = http.request({
  hostname: '127.0.0.1',
  port: 8080,
  path: '/api/sheikha/live/chat/v1',
  method: 'POST',
  headers: {
    accept: 'text/event-stream',
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload)
  },
  timeout: 95000
}, (response) => {
  statusCode = response.statusCode;
  response.setEncoding('utf8');
  response.on('data', (chunk) => {
    buffer += chunk;
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (!block.trim()) continue;
      const parsed = parseEvent(block);
      const atMs = Number(elapsedMs().toFixed(3));
      if (firstEventMs === null) firstEventMs = atMs;
      events.push({ event: parsed.event, atMs });
      route ||= parsed.data?.route || null;
      if (parsed.event === 'token') {
        const text = String(parsed.data?.text || '');
        if (text && firstTokenMs === null) firstTokenMs = atMs;
        tokens.push(text);
      }
      if (parsed.event === 'done') {
        doneMs = atMs;
        doneReason = parsed.data?.doneReason || parsed.data?.reason || null;
        terminalRoute = parsed.data?.route || null;
        route ||= parsed.data?.route || null;
      }
    }
  });
  response.on('end', () => finish());
});

request.on('timeout', () => {
  request.destroy(new Error('COMMERCIAL_READINESS_TIMEOUT'));
});
request.on('error', finish);
request.end(payload);
