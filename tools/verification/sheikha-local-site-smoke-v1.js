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
  { path: '/market/', marker: '<title>سوق شيخة' },
  { path: '/dashboard/', marker: '<title>لوحة شيخة' },
  { path: '/technology/', marker: '<title>مرصد شيخة التقني' },
  {
    path: '/product-technical/',
    marker: '<title>الملف الهندسي للمنتج',
  },
  { path: '/commercial/', marker: 'حلول شيخة التجارية' },
  {
    path: '/system-builder-workbench/',
    marker: 'بناء الأنظمة المحكومة',
  },
  {
    path: '/enterprise-control-center/',
    marker: 'المركز المؤسسي لشيخة',
  },
  {
    path: '/riyadh-aljannah-community/',
    marker: 'جنات وأشجار شيخة',
  },
  {
    path: '/constructive-dialogue/',
    marker: '<title>حوار شيخة البنّاء',
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

async function checkHardwareCompatibility(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/bare-metal/v2/hardware-compatibility/v1/status`
  );
  const body = await response.json();
  const data = body.data || {};
  return {
    statusCode: response.status,
    status: data.status || null,
    architectures: data.coverage?.architectures || 0,
    targetClasses: data.coverage?.targetClasses || 0,
    connectors: data.coverage?.connectors || 0,
    operatingEnvironments: data.coverage?.operatingEnvironments || 0,
    emulatedVerifiedArchitectures:
      data.coverage?.emulatedVerifiedArchitectures || 0,
    physicalVerifiedTargets:
      data.coverage?.physicalVerifiedTargets || 0,
    safetyCertifiedTargets:
      data.coverage?.safetyCertifiedTargets || 0,
    runnableEverywhereToday:
      data.claimBoundary?.runnableEverywhereToday === true,
    universalHardwareSupportClaimed:
      data.claimBoundary?.universalHardwareSupportClaimed === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status === 'ACTIVE_WITH_VERIFIED_X86_64_FOUNDATION' &&
      data.coverage?.architectures === 8 &&
      data.coverage?.targetClasses === 17 &&
      data.coverage?.connectors === 56 &&
      data.coverage?.operatingEnvironments === 10 &&
      data.coverage?.physicalVerifiedTargets === 0 &&
      data.coverage?.safetyCertifiedTargets === 0 &&
      data.controls?.defaultAuthorization === 'DENY' &&
      data.claimBoundary?.runnableEverywhereToday === false &&
      data.claimBoundary?.universalHardwareSupportClaimed === false,
  };
}

async function checkUnifiedProductRuntime(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/product-runtime/v1/status`
  );
  const body = await response.json();
  const data = body.data || {};
  const products = Array.isArray(data.products) ? data.products : [];
  return {
    statusCode: response.status,
    status: data.status || null,
    productCount: products.length,
    allProductDecisionsVerified:
      data.checks?.allProductDecisionsVerified === true,
    jannatIsWorldlyMetaphorOnly:
      data.claimBoundary?.jannatIsWorldlyMetaphorOnly === true,
    physicalHardwareVerified:
      data.claimBoundary?.physicalHardwareVerified === true,
    generalPurposeOsComplete:
      data.claimBoundary?.generalPurposeOsComplete === true,
    runnableEverywhereToday:
      data.claimBoundary?.runnableEverywhereToday === true,
    automatedFatwa:
      data.governance?.automatedFatwa === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status === 'ACTIVE_WITH_BOUNDED_VERIFIED_FOUNDATIONS' &&
      products.length === 4 &&
      data.checks?.allProductDecisionsVerified === true &&
      data.claimBoundary?.jannatIsWorldlyMetaphorOnly === true &&
      data.claimBoundary?.physicalHardwareVerified === false &&
      data.claimBoundary?.generalPurposeOsComplete === false &&
      data.claimBoundary?.runnableEverywhereToday === false &&
      data.governance?.automatedFatwa === false,
  };
}

async function checkLanguageFoundationV2(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/language-foundation/v2/status`
  );
  const body = await response.json();
  const data = body.data || {};
  const roots = data.aiCapabilityRoots?.roots || [];
  const adapters = data.systemToolAdapters?.adapters || [];
  const binding = data.nativeStack?.languageBinding || {};
  const implementation = data.implementationBoundary || {};
  const governance = data.governance || {};
  return {
    statusCode: response.status,
    status: data.status || null,
    aiCapabilityRootCount: roots.length,
    systemAdapterCount: adapters.length,
    qemuBootVerified:
      data.nativeStack?.bareMetal?.qemuBootVerified === true,
    contractIdentityEmbedded:
      binding.contractIdentityEmbeddedInNativeArtifact === true,
    compilerSelfHosted:
      data.compilation?.selfHostedCompilerVerified === true,
    nativeMachineCodeBackend:
      data.compilation?.nativeMachineCodeBackendVerified === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status ===
        'FOUNDATION_ACTIVE_HOST_BOOTSTRAPPED_NATIVE_MIGRATION_REQUIRED' &&
      data.passed === true &&
      roots.length === 8 &&
      roots.every((root) =>
        root.criticalBootPath === false &&
        root.independentHighImpactExecution === false
      ) &&
      adapters.length === 3 &&
      adapters.every((adapter) =>
        adapter.foundation === false &&
        adapter.mayReplaceSheikhaFoundation === false
      ) &&
      data.nativeStack?.bareMetal?.qemuBootVerified === true &&
      binding.contractIdentityEmbeddedInNativeArtifact === true &&
      binding.bytecodeExecutedInsideKernel === false &&
      implementation.selfHostedCompilerComplete === false &&
      implementation.nativeMachineCodeBackendComplete === false &&
      implementation.universalAiFoundationEstablished === false &&
      governance.automatedFatwaAllowed === false,
  };
}

async function checkRootEvidenceTruthMatrix(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/root-architecture/v3/truth-matrix`
  );
  const body = await response.json();
  const data = body.data || {};
  const domains = Object.fromEntries(
    (data.domains || []).map((domain) => [domain.id, domain])
  );
  const summary = data.evidenceSummary || {};
  const boundaries = data.claimBoundaries || {};
  return {
    statusCode: response.status,
    status: data.status || null,
    truthStatus: data.truthStatus || null,
    domains: summary.domainCount || 0,
    parsedEvidence: summary.parsedEvidenceCount || 0,
    artifactsBuilt: summary.artifactBuiltCount || 0,
    qemuVerified: summary.qemuVerifiedCount || 0,
    nativeLifecycleVerified:
      summary.nativeLifecycleVerifiedCount || 0,
    physicalHardwareVerified:
      summary.physicalHardwareVerifiedCount || 0,
    externallyCertified: summary.externallyCertifiedCount || 0,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status === 'VERIFIED' &&
      data.truthStatus === 'BOUNDED_EVIDENCE_VERIFIED_WITH_GAPS' &&
      summary.domainCount === 9 &&
      summary.parsedEvidenceCount === 9 &&
      summary.artifactBuiltCount >= 4 &&
      summary.qemuVerifiedCount >= 3 &&
      summary.nativeLifecycleVerifiedCount === 1 &&
      summary.physicalHardwareVerifiedCount === 0 &&
      summary.externallyCertifiedCount === 0 &&
      domains.BARE_METAL_X86_64_PHASE2B?.verificationLevel ===
        'QEMU_RUNTIME_VERIFIED_SUBSET' &&
      domains.LINUX_DEB_AMD64?.verificationLevel ===
        'NATIVE_LIFECYCLE_VERIFIED' &&
      domains.PHYSICAL_BOOT_TRIAL?.claims
        ?.physicalHardwareVerified === false &&
      domains.VSCODE_EXTENSION?.claims
        ?.chatInteractionSmokeVerified === false &&
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT?.verificationLevel ===
        'HOST_BOOTSTRAPPED_LANGUAGE_FOUNDATION_VERIFIED' &&
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT?.claims
        ?.compilerSelfHosted === false &&
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT?.claims
        ?.nativeBootContractIdentityVerified === true &&
      domains.SHEIKHA_LANGUAGE_FOUNDATION_ROOT?.claims
        ?.universalAiFoundationClaimed === false &&
      domains.PRODUCER_PRODUCTION_QUALIFICATION
        ?.verificationLevel ===
        'INTERNAL_QUALIFICATION_GATE_ACTIVE' &&
      domains.PRODUCER_PRODUCTION_QUALIFICATION?.claims
        ?.registeredRequirementCount === 31 &&
      domains.PRODUCER_PRODUCTION_QUALIFICATION?.claims
        ?.productionReadyProductCount === 0 &&
      domains.PRODUCER_PRODUCTION_QUALIFICATION?.claims
        ?.governmentLicenseIssuanceAvailable === false &&
      domains.PRODUCER_PRODUCTION_QUALIFICATION?.claims
        ?.candidateSensitiveScoringPerformed === false &&
      boundaries.registrationDoesNotMeanImplementation === true &&
      boundaries.internalProductionAuthorizationIsNotExternalLicensing ===
        true &&
      boundaries.aiFinalProductionAuthorizationAllowed === false &&
      boundaries.automatedFatwa === false,
  };
}

async function checkUnifiedCommerceRuntime(baseUrl) {
  const response = await fetchWithTimeout(
    `${baseUrl}/api/sheikha/commerce/v1/status`
  );
  const body = await response.json();
  const data = body.data || {};
  const cloud = Array.isArray(data.catalog)
    ? data.catalog.find((product) => product.id === 'PROD-CLOUD-SAAS')
    : null;
  return {
    statusCode: response.status,
    status: data.status || null,
    products: data.coverage?.products || 0,
    sectors: data.coverage?.sectors || 0,
    marketGroups: data.coverage?.marketGroups || 0,
    workflows: data.coverage?.workflows || 0,
    saasServices: data.coverage?.saasServices || 0,
    cloudSaasPresent: Boolean(cloud),
    transactionExecutionEnabled:
      data.claimBoundary?.transactionExecutionEnabled === true,
    externalAccreditationClaimed:
      data.claimBoundary?.externalAccreditationClaimed === true,
    passed: response.status === 200 &&
      body.ok === true &&
      data.status === 'ACTIVE_WITH_GOVERNED_CATALOG' &&
      data.coverage?.products === 13 &&
      data.coverage?.sectors === 30 &&
      data.coverage?.marketGroups === 7 &&
      data.coverage?.workflows === 12 &&
      data.coverage?.saasServices === 14 &&
      Boolean(cloud) &&
      cloud.pricing?.mode === 'REQUEST_QUOTE' &&
      cloud.transactionReady === false &&
      data.claimBoundary?.transactionExecutionEnabled === false &&
      data.claimBoundary?.externalAccreditationClaimed === false,
  };
}

async function checkTechnicalExperienceRuntime(baseUrl) {
  const api = `${baseUrl}/api/sheikha/technical-experience/v1`;
  const [statusResponse, telemetryResponse, previewResponse, dossierResponse] =
    await Promise.all([
      fetchWithTimeout(`${api}/status`),
      fetchWithTimeout(`${api}/telemetry`),
      fetchWithTimeout(`${api}/products/PROD-CLOUD-SAAS/preview?level=expert`),
      fetchWithTimeout(`${api}/products/PROD-CLOUD-SAAS/dossier?level=expert`),
    ]);
  const [statusBody, telemetryBody, previewBody, dossierBody] =
    await Promise.all([
      statusResponse.json(),
      telemetryResponse.json(),
      previewResponse.json(),
      dossierResponse.json(),
    ]);
  const status = statusBody.data || {};
  const telemetry = telemetryBody.data || {};
  const preview = previewBody.data || {};
  const architecture = status.architecture || {};
  const telemetryIsMeasured =
    Number.isFinite(telemetry.process?.eventLoop?.observedTurnDelayMs) &&
    Number.isFinite(telemetry.process?.memoryMiB?.heapUsed) &&
    telemetry.secretsIncluded === false &&
    telemetry.syntheticBenchmarkClaimed === false;
  const previewIsComplete =
    preview.product?.id === 'PROD-CLOUD-SAAS' &&
    preview.knowledgeLevel?.id === 'expert' &&
    Array.isArray(preview.sharedMeasurements) &&
    preview.sharedMeasurements.length === 3 &&
    preview.fullDossier?.access === 'VERIFIED_ENTITLEMENT_REQUIRED';
  const dossierDefaultDeny =
    dossierResponse.status === 401 &&
    dossierBody.error === 'AUTHENTICATED_SUBJECT_REQUIRED';
  const architectureIsBounded =
    architecture.model === 'GOVERNED_HYBRID_CENTRAL_AND_DECENTRALIZED' &&
    architecture.central?.length === 4 &&
    architecture.decentralized?.length === 4 &&
    architecture.boundaries?.externalFederationVerified === false &&
    architecture.boundaries?.centralPolicyBypassAllowed === false;

  return {
    statusCode: statusResponse.status,
    status: status.status || null,
    products: status.coverage?.products || 0,
    technicalProfiles: status.coverage?.technicalProfiles || 0,
    activeDocumentationEntitlements:
      status.coverage?.activeDocumentationEntitlements || 0,
    telemetryIsMeasured,
    previewIsComplete,
    dossierStatusCode: dossierResponse.status,
    dossierDefaultDeny,
    architectureIsBounded,
    externalCertificationClaimed:
      status.governance?.noExternalCertificationClaim !== true,
    passed: statusResponse.status === 200 &&
      telemetryResponse.status === 200 &&
      previewResponse.status === 200 &&
      statusBody.ok === true &&
      telemetryBody.ok === true &&
      previewBody.ok === true &&
      status.status === 'ACTIVE_WITH_MEASURED_LOCAL_FOUNDATIONS' &&
      status.coverage?.products === 13 &&
      status.coverage?.technicalProfiles === 13 &&
      telemetryIsMeasured &&
      previewIsComplete &&
      dossierDefaultDeny &&
      architectureIsBounded &&
      status.governance?.noExternalCertificationClaim === true,
  };
}

async function checkProductionQualificationV1(baseUrl) {
  const api = `${baseUrl}/api/sheikha/production-qualification/v1`;
  const [statusResponse, requirementsResponse, productsResponse] =
    await Promise.all([
      fetchWithTimeout(`${api}/status`),
      fetchWithTimeout(`${api}/requirements`),
      fetchWithTimeout(`${api}/products`),
    ]);
  const [statusBody, requirementsBody, productsBody] =
    await Promise.all([
      statusResponse.json(),
      requirementsResponse.json(),
      productsResponse.json(),
    ]);
  const status = statusBody.data || {};
  const requirements = requirementsBody.data || {};
  const products = productsBody.data || {};
  const coverage = status.coverage || {};
  const policy = status.authorizationPolicy || {};
  const boundaries = status.truthBoundaries || {};

  return {
    statusCode: statusResponse.status,
    status: status.status || null,
    registeredProducts: coverage.registeredProducts || 0,
    productionFileRequirements:
      coverage.productionFileRequirements || 0,
    administrativeRequirements:
      coverage.administrativeRequirements || 0,
    engineeringRequirements:
      coverage.engineeringRequirements || 0,
    productionRequirements:
      coverage.productionRequirements || 0,
    producerApplications: coverage.producerApplications || 0,
    activeInternalAuthorizations:
      coverage.activeInternalAuthorizations || 0,
    productionReadyProducts:
      coverage.productionReadyProducts || 0,
    externallyIssuedCertificates:
      coverage.externallyIssuedCertificates || 0,
    physicallyVerifiedHardwareTargets:
      coverage.physicallyVerifiedHardwareTargets || 0,
    runtimeProductionGateStatus:
      status.runtimeEvidence?.productionGateStatus || null,
    passed: statusResponse.status === 200 &&
      requirementsResponse.status === 200 &&
      productsResponse.status === 200 &&
      statusBody.ok === true &&
      requirementsBody.ok === true &&
      productsBody.ok === true &&
      status.status === 'ACTIVE_INTERNAL_QUALIFICATION_GATE' &&
      status.passed === true &&
      coverage.registeredProducts === 13 &&
      coverage.productionFileRequirements === 31 &&
      coverage.administrativeRequirements === 10 &&
      coverage.engineeringRequirements === 11 &&
      coverage.productionRequirements === 10 &&
      coverage.producerApplications === 0 &&
      coverage.activeInternalAuthorizations === 0 &&
      coverage.productionReadyProducts === 0 &&
      coverage.externallyIssuedCertificates === 0 &&
      coverage.physicallyVerifiedHardwareTargets === 0 &&
      requirements.count === 31 &&
      products.count === 13 &&
      products.productionReadyCount === 0 &&
      policy.internalProductionAuthorizationAvailable === true &&
      policy.officialGovernmentLicenseIssuanceAvailable === false &&
      status.candidatePolicy?.sensitiveTraitInference === false &&
      status.aiPolicy?.mayIssueFinalAuthorization === false &&
      boundaries.internalAuthorizationIsNotGovernmentLicense === true &&
      boundaries.allProductsProductionReadyObserved === false &&
      boundaries.allProductsProductionReadyClaimed === false,
  };
}

async function checkGardensKnowledgeDialogueV2(baseUrl) {
  const api = `${baseUrl}/api/sheikha/gardens-knowledge-dialogue/v2`;
  const [
    statusResponse,
    gardenResponse,
    frameworksResponse,
    referencesResponse,
    planResponse,
    assessmentResponse,
    ideaResponse,
    programResponse,
    deniedResponse,
  ] = await Promise.all([
    fetchWithTimeout(`${api}/status`),
    fetchWithTimeout(`${api}/gardens/GARDEN_OF_GOVERNED_AI`),
    fetchWithTimeout(`${api}/thought-frameworks`),
    fetchWithTimeout(`${api}/religious-method/references`),
    fetchWithTimeout(`${api}/dialogue/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'وازن بين الاستدامة وتسريع التقنية',
        frameworkIds: [
          'DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY',
          'HIGH_TECH_AND_POLITICAL_NATIONALISM',
        ],
        religiousLensRequested: true,
      }),
    }),
    fetchWithTimeout(`${api}/ideas/assess`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'برنامج تعليمي وتقني نافع للمجتمع',
        frameworkIds: ['EFFECTIVE_ALTRUISM'],
        religiousLensRequested: true,
      }),
    }),
    fetchWithTimeout(`${api}/ideas/synthesize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ideaName: 'إطار العلم والعمران',
        communityScope: 'digital-community',
        message: 'توسيع المعرفة الموثوقة والمهارات النافعة',
        desiredOutcomes: ['تعليم موثوق', 'عمل منتج'],
        frameworkIds: ['EFFECTIVE_ALTRUISM', 'COMMUNITARIANISM'],
        religiousLensRequested: true,
      }),
    }),
    fetchWithTimeout(`${api}/community/program`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        programName: 'برنامج حي نافع',
        communityScope: 'local-community',
        message: 'التعليم والاستدامة والتحول الرقمي المسؤول',
        frameworkIds: [
          'EFFECTIVE_ALTRUISM',
          'ENVIRONMENTALISM',
        ],
        religiousLensRequested: true,
      }),
    }),
    fetchWithTimeout(`${api}/dialogue/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'صنف معتقد الشخص',
        inferBeliefs: true,
      }),
    }),
  ]);
  const [
    statusBody,
    gardenBody,
    frameworksBody,
    referencesBody,
    planBody,
    assessmentBody,
    ideaBody,
    programBody,
    deniedBody,
  ] =
    await Promise.all([
      statusResponse.json(),
      gardenResponse.json(),
      frameworksResponse.json(),
      referencesResponse.json(),
      planResponse.json(),
      assessmentResponse.json(),
      ideaResponse.json(),
      programResponse.json(),
      deniedResponse.json(),
    ]);
  const status = statusBody.data || {};
  const garden = gardenBody.data || {};
  const frameworks = frameworksBody.data || {};
  const references = referencesBody.data || {};
  const plan = planBody.data || {};
  const assessment = assessmentBody.data || {};
  const idea = ideaBody.data || {};
  const program = programBody.data || {};
  const denied = deniedBody.data || {};
  const treeDetailsComplete =
    Array.isArray(garden.trees) &&
    garden.trees.length > 0 &&
    garden.trees.every((tree) =>
      tree.operationalAnatomy?.fruitAr &&
      tree.physicalExemplar?.scientificName &&
      tree.physicalExemplar?.siteApprovalStatus ===
        'LOCAL_AGRONOMIST_AND_SITE_DATA_REQUIRED'
    );
  const planIsBounded =
    plan.status === 'CONSTRUCTIVE_IDEA_LEVEL_PLAN_READY' &&
    plan.subject?.personIdeologyInferred === false &&
    plan.privacy?.contentPersisted === false &&
    plan.religiousMethod?.automatedFatwa === false &&
    plan.religiousMethod?.qualifiedScholarReviewRequired === true;
  const sensitiveClassificationDenied =
    deniedResponse.status === 422 &&
    denied.status === 'SAFE_REDIRECTION_REQUIRED' &&
    denied.personProfileCreated === false;
  const frameworkCoverageComplete =
    frameworks.coverage?.total === 37 &&
    frameworks.coverage?.contemporary === 19 &&
    frameworks.coverage?.historical === 18 &&
    frameworks.frameworks?.length === 37;
  const religiousReferencesBounded =
    references.references?.length === 8 &&
    references.automationBoundary?.automatedFatwa === false &&
    references.automationBoundary?.qualifiedScholarReviewRequired === true;
  const assessmentIsBounded =
    assessmentResponse.status === 200 &&
    assessment.dimensions?.length === 10 &&
    assessment.conclusions?.ideaDeclaredCorrect === false &&
    assessment.conclusions?.truthClaimVerified === false &&
    assessment.privacy?.individualIdeologyScoreCreated === false;
  const communityProgramIsBounded =
    programResponse.status === 200 &&
    program.status === 'GOVERNED_PEACEFUL_PROGRAM_DRAFT_READY' &&
    program.programs?.length === 7 &&
    program.execution?.authorized === false &&
    program.communityHealth?.individualFaithScore === false &&
    program.communityHealth?.individualIdeologyScore === false &&
    program.communityHealth?.coerciveTreatment === false;
  const purposefulIdeaIsBounded =
    ideaResponse.status === 200 &&
    idea.status === 'GOVERNED_PURPOSEFUL_IDEA_DRAFT_READY' &&
    idea.idea?.generatedIdeologyDraft === true &&
    idea.idea?.canonicalTruthOrIdeology === false &&
    idea.principles?.length === 8 &&
    idea.theoryOfChange?.length === 5 &&
    idea.programs?.length === 7 &&
    idea.governance?.coerciveAdoption === false &&
    idea.governance?.targetedPersuasion === false &&
    idea.execution?.authorized === false;

  return {
    statusCode: statusResponse.status,
    status: status.status || null,
    coverage: status.coverage || null,
    treeDetailsComplete,
    planIsBounded,
    frameworkCoverageComplete,
    religiousReferencesBounded,
    assessmentIsBounded,
    purposefulIdeaIsBounded,
    communityProgramIsBounded,
    sensitiveClassificationDenied,
    physicalPlantingClaimed:
      garden.physicalBoundary?.physicalPlantingExecuted === true,
    passed: statusResponse.status === 200 &&
      gardenResponse.status === 200 &&
      planResponse.status === 200 &&
      status.coverage?.gardens === 9 &&
      status.coverage?.trees === 27 &&
      status.coverage?.products === 13 &&
      status.coverage?.sectors === 30 &&
      status.coverage?.markets === 7 &&
      status.coverage?.thoughtFrameworks === 37 &&
      status.coverage?.contemporaryThoughtFrameworks === 19 &&
      status.coverage?.historicalThoughtFrameworks === 18 &&
      status.coverage?.religiousMethodReferences === 8 &&
      treeDetailsComplete &&
      planIsBounded &&
      frameworkCoverageComplete &&
      religiousReferencesBounded &&
      assessmentIsBounded &&
      purposefulIdeaIsBounded &&
      communityProgramIsBounded &&
      sensitiveClassificationDenied &&
      garden.physicalBoundary?.physicalPlantingExecuted === false,
  };
}

async function checkProductAliases(baseUrl) {
  const aliases = [
    ['/dashboard', '/dashboard/'],
    ['/gardens', '/riyadh-aljannah-community/'],
    ['/builder', '/system-builder-workbench/'],
    ['/uefi', '/boot-trial/'],
    ['/bare-metal', '/boot-trial/'],
    ['/tech', '/technology/'],
    ['/technical-product', '/product-technical/'],
    ['/dialogue', '/constructive-dialogue/'],
  ];
  const results = [];
  for (const [route, target] of aliases) {
    const response = await fetchWithTimeout(`${baseUrl}${route}`, {
      redirect: 'manual',
    });
    results.push({
      route,
      target,
      statusCode: response.status,
      location: response.headers.get('location'),
      passed: response.status === 308 &&
        response.headers.get('location') === target,
    });
  }
  return {
    results,
    passed: results.every((result) => result.passed),
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
  const hardwareCompatibility = await checkHardwareCompatibility(origin);
  const languageFoundationV2 =
    await checkLanguageFoundationV2(origin);
  const rootEvidenceTruthMatrix =
    await checkRootEvidenceTruthMatrix(origin);
  const unifiedProductRuntime = await checkUnifiedProductRuntime(origin);
  const unifiedCommerceRuntime = await checkUnifiedCommerceRuntime(origin);
  const technicalExperienceRuntime =
    await checkTechnicalExperienceRuntime(origin);
  const productionQualificationV1 =
    await checkProductionQualificationV1(origin);
  const gardensKnowledgeDialogueV2 =
    await checkGardensKnowledgeDialogueV2(origin);
  const productAliases = await checkProductAliases(origin);
  const passed = pages.every((page) => page.passed) &&
    health.passed &&
    liveChat.passed &&
    siteRegistry.passed &&
    bootTrial.passed &&
    uefiIntegration.passed &&
    hardwareCompatibility.passed &&
    languageFoundationV2.passed &&
    rootEvidenceTruthMatrix.passed &&
    unifiedProductRuntime.passed &&
    unifiedCommerceRuntime.passed &&
    technicalExperienceRuntime.passed &&
    productionQualificationV1.passed &&
    gardensKnowledgeDialogueV2.passed &&
    productAliases.passed;
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
    hardwareCompatibility,
    languageFoundationV2,
    rootEvidenceTruthMatrix,
    unifiedProductRuntime,
    unifiedCommerceRuntime,
    technicalExperienceRuntime,
    productionQualificationV1,
    gardensKnowledgeDialogueV2,
    productAliases,
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
