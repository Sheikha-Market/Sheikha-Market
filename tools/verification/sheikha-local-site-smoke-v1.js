#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT_PATH = path.join(
  ROOT,
  'runtime/site-operations/v1/' +
    'sheikha-local-site-smoke-v1-report.json'
);
const PAGE_CHECKS = [
  { path: '/', marker: '<title>شيخة' },
  { path: '/commercial/', marker: 'حلول شيخة التجارية' },
  {
    path: '/system-builder-workbench/',
    marker: 'لغة عربية لبناء الأنظمة المحكومة',
  },
  {
    path: '/enterprise-control-center/',
    marker: 'المركز المؤسسي لشيخة',
  },
  {
    path: '/riyadh-aljannah-community/',
    marker: 'رياض الجنة',
  },
  {
    path: '/site-map/',
    marker: 'صفحات شيخة ومساراتها العامة',
  },
  {
    path: '/boot-trial/',
    marker: 'تجربة إقلاع MSI',
  },
  {
    path: '/download.html',
    marker: 'قناة التنزيل',
  },
];

function assertLoopback(baseUrl) {
  const parsed = new URL(baseUrl);
  if (!['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)) {
    throw new Error('Local site smoke accepts loopback URLs only');
  }
  return parsed.origin;
}

function parseSseEvents(source) {
  return source
    .split(/\r?\n\r?\n/)
    .map((block) => {
      const event = block.match(/^event:\s*(.+)$/m)?.[1]?.trim();
      const data = block.match(/^data:\s*(.+)$/m)?.[1]?.trim();
      if (!event || !data) return null;
      try {
        return { event, data: JSON.parse(data) };
      } catch {
        return { event, data: null };
      }
    })
    .filter(Boolean);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPage(baseUrl, check) {
  const startedAt = performance.now();
  const response = await fetchWithTimeout(`${baseUrl}${check.path}`);
  const body = await response.text();
  return {
    path: check.path,
    statusCode: response.status,
    bytes: Buffer.byteLength(body),
    marker: check.marker,
    markerPresent: body.includes(check.marker),
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
    passed: response.status === 200 && body.includes(check.marker),
  };
}

async function checkHealth(baseUrl) {
  const startedAt = performance.now();
  const response = await fetchWithTimeout(`${baseUrl}/api/health`);
  const body = await response.json();
  const passed = response.status === 200 &&
    body.success === true &&
    body.data?.status === 'ok';
  return {
    statusCode: response.status,
    serviceStatus: body.data?.status || null,
    system: body.data?.identity?.system || null,
    integrationSummary: body.data?.integrationSummary || null,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
    passed,
  };
}

async function checkLiveChat(baseUrl) {
  const startedAt = performance.now();
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/live/chat/v1`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'اختبار تشغيل الموقع المحلي',
        language: 'ar',
      }),
    }
  );
  const body = await response.text();
  const events = parseSseEvents(body);
  const names = events.map((entry) => entry.event);
  const required = ['ack', 'meta', 'heartbeat', 'token', 'done'];
  const requiredOrder = required.map((name) => names.indexOf(name));
  const token = events.find((entry) => entry.event === 'token');
  const elapsedMs = Number((performance.now() - startedAt).toFixed(2));
  const orderValid = requiredOrder.every((index) => index >= 0) &&
    requiredOrder.every((index, position) =>
      position === 0 || index > requiredOrder[position - 1]
    );
  const immediateArabicToken = token?.data?.immediate === true &&
    typeof token.data.text === 'string' &&
    /[\u0600-\u06ff]/.test(token.data.text);

  return {
    statusCode: response.status,
    contentType: response.headers.get('content-type'),
    eventOrder: names,
    requiredOrderValid: orderValid,
    immediateArabicToken,
    responseCompletedUnderOneSecond: elapsedMs < 1000,
    elapsedMs,
    deepModelMode: events.find((entry) =>
      entry.event === 'meta'
    )?.data?.deepModelMode || null,
    passed: response.status === 200 &&
      orderValid &&
      immediateArabicToken &&
      elapsedMs < 1000,
  };
}

async function checkRegistry(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/site-registry/v2/status`
  );
  const body = await response.json();
  const counts = body.data?.counts || {};
  return {
    statusCode: response.status,
    status: body.data?.status || null,
    discoveredHtmlPages: counts.discoveredHtmlPages || 0,
    publicCanonicalPages: counts.publicCanonicalPages || 0,
    domains: counts.domains || 0,
    passed: response.status === 200 &&
      body.ok === true &&
      body.data?.status === 'ACTIVE' &&
      counts.discoveredHtmlPages > 0 &&
      counts.publicCanonicalPages > 0,
  };
}

async function checkBootTrial(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/bare-metal/v2/physical-trial/v1/status`
  );
  const body = await response.json();
  const data = body.data || {};
  return {
    statusCode: response.status,
    status: data.status || null,
    imageSha256: data.image?.sha256 || null,
    structurallyVerified:
      data.verification?.structurallyVerified === true,
    qemuBootVerified: data.verification?.qemuBootVerified === true,
    physicalBootVerified:
      data.verification?.physicalBootVerified === true,
    installableToInternalDisk:
      data.installation?.installableToInternalDisk === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.verification?.structurallyVerified === true &&
      data.verification?.qemuBootVerified === true &&
      data.verification?.physicalBootVerified === false &&
      data.installation?.installableToInternalDisk === false,
  };
}

async function checkUefiIntegration(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/bare-metal/v2/uefi-integration/v1/status`
  );
  const body = await response.json();
  const data = body.data || {};
  return {
    statusCode: response.status,
    status: data.status || null,
    specificationRevision: data.specification?.revision || null,
    chapters: data.coverage?.chapters || 0,
    appendices: data.coverage?.appendices || 0,
    registeredCapabilities: data.coverage?.total || 0,
    verifiedSubsets:
      (data.coverage?.qemuVerifiedSubsets || 0) +
      (data.coverage?.sourceVerifiedSubsets || 0),
    defaultDenyCapabilities: data.coverage?.defaultDeny || 0,
    fullImplementationClaimed:
      data.claimBoundary?.fullUefiImplementationClaimed === true,
    conformanceCertified:
      data.claimBoundary?.uefiConformanceCertified === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status === 'ACTIVE_WITH_VERIFIED_FOUNDATION_SUBSETS' &&
      data.specification?.revision === '2.11' &&
      data.coverage?.chapters === 39 &&
      data.coverage?.appendices === 18 &&
      data.coverage?.total === 57 &&
      data.coverage?.fullyImplemented === 0 &&
      data.controls?.defaultAuthorization === 'DENY' &&
      data.claimBoundary?.fullUefiImplementationClaimed === false &&
      data.claimBoundary?.uefiConformanceCertified === false,
  };
}

async function runSmoke(baseUrl) {
  const origin = assertLoopback(baseUrl);
  const pages = [];
  for (const check of PAGE_CHECKS) {
    pages.push(await checkPage(origin, check));
  }
  const health = await checkHealth(origin);
  const liveChat = await checkLiveChat(origin);
  const siteRegistry = await checkRegistry(origin);
  const bootTrial = await checkBootTrial(origin);
  const uefiIntegration = await checkUefiIntegration(origin);
  const passed = pages.every((page) => page.passed) &&
    health.passed &&
    liveChat.passed &&
    siteRegistry.passed &&
    bootTrial.passed &&
    uefiIntegration.passed;
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_LOCAL_SITE_SMOKE_V1',
    generatedAt: new Date().toISOString(),
    status: passed ? 'LOCAL_SITE_SMOKE_PASSED' : 'LOCAL_SITE_SMOKE_FAILED',
    baseUrl: origin,
    executionScope: 'LOCAL_DEVELOPMENT_RUNTIME',
    pages,
    health,
    liveChat,
    siteRegistry,
    bootTrial,
    uefiIntegration,
    checkedPageCount: pages.length,
    passed,
    productionReadinessClaimed: false,
    productionBoundary:
      'Production startup requires operator-provided JWT and data-encryption secrets.',
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  return report;
}

if (require.main === module) {
  runSmoke(process.env.SHEIKHA_SITE_BASE_URL || 'http://127.0.0.1:8080')
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (!report.passed) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(`[SHEIKHA_LOCAL_SITE_SMOKE] ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = {
  PAGE_CHECKS,
  REPORT_PATH,
  assertLoopback,
  parseSseEvents,
  runSmoke,
};
