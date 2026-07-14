'use strict';

const SYSTEM = 'SHEIKHA_WEBSITE_PRIMARY_RUNTIME_V1';

const WEBSITE_PRIMARY_RUNTIME = Object.freeze({
  system: SYSTEM,
  version: '1.0.0',
  status: 'ACTIVE',

  parentPlatform: 'SHEIKHA_SYSTEM_BUILDER_PLATFORM_HIERARCHY_V1',
  foundationPlatform: 'system-builder-platform',
  parentPlatform: 'SHEIKHA_SYSTEM_BUILDER_PLATFORM_HIERARCHY_V1',
  foundationPlatform: 'system-builder-platform',
  primarySurface: 'website',
  primaryRuntime: 'sheikha-main-portal',

  productSurfaces: Object.freeze({
    website: Object.freeze({
      role: 'PRIMARY_PRODUCT_AND_COMMERCIAL_SURFACE',
      requiredForProduction: true,
      independentlyOperable: true,
      defaultPort: 8080,
      responsibilities: Object.freeze([
        'public-product-experience',
        'commerce-experience',
        'customer-access',
        'marketplace-access',
        'enterprise-apis',
        'health-and-readiness',
      ]),
    }),

    vscode: Object.freeze({
      role: 'DEVELOPMENT_ADMINISTRATION_AND_DIAGNOSTIC_TOOL_ONLY',
      requiredForProduction: false,
      requiredForWebsiteStartup: false,
      requiredForCustomerAccess: false,
      mayBeClosedWhileWebsiteRuns: true,
    }),

    vscodeExtension: Object.freeze({
      role: 'OPTIONAL_CLIENT_ADAPTER',
      requiredForProduction: false,
      requiredForWebsiteStartup: false,
      requiredForCustomerAccess: false,
    }),
  }),

  availabilityPolicy: Object.freeze({
    websiteMustNotDependOnEditorProcess: true,
    websiteMustNotDependOnExtensionProcess: true,
    websiteMustRemainAvailableWhenModelIsSlow: true,
    websiteMustRemainAvailableWhenDeepModelIsUnavailable: true,
    modelFailureMode: 'DEGRADED_AI_CAPABILITY_NOT_WEBSITE_OUTAGE',
    deepAnalysisMode: 'EXPLICIT_OR_BACKGROUND_NON_BLOCKING',
    immediateUserAcknowledgementRequired: true,
    modelWaitProgressEventRequired: true,
    firstTokenTargetIsSla: false,
  }),

  routingPolicy: Object.freeze({
    websiteRequestOrder: Object.freeze([
      'validate-request',
      'governance-gate',
      'serve-immediate-web-response',
      'start-fast-model-when-needed',
      'emit-model-wait-progress-when-threshold-crossed',
      'run-deep-analysis-only-when-explicitly-required',
      'complete-response-or-governed-fallback',
    ]),

    profiles: Object.freeze({
      fast: 'tinyllama:latest',
      coding: 'qwen2.5-coder:7b',
      reasoning: 'deepseek-r1:8b',
      deepArabic: 'Sheikha-Core:latest',
    }),
  }),

  requiredProductionDependencies: Object.freeze([
    'node-runtime',
    'sheikha-main-portal',
    'public-web-assets',
    'enterprise-api-routes',
    'health-endpoint',
  ]),

  optionalProductionDependencies: Object.freeze([
    'ollama',
    'local-language-models',
    'vscode',
    'sheikha-vscode-extension',
  ]),
});

function getWebsitePrimaryRuntimeStatus() {
  return {
    ...WEBSITE_PRIMARY_RUNTIME,
    operationalMeaning: {
      systemBuilderIsFoundation: true,
      websiteIsFoundation: false,
      websiteIsPrimaryProductSurface: true,
      websiteIsSystemBuilderSurface: true,
      vscodeIsToolOnly: true,
      editorShutdownMustNotStopWebsite: true,
      deepModelMustNotBlockWebsiteAvailability: true,
    },
  };
}

function validateWebsitePrimaryRuntime() {
  const status = getWebsitePrimaryRuntimeStatus();

  const checks = {
    active:
      status.status === 'ACTIVE',

    systemBuilderIsFoundation:
      status.foundationPlatform === 'system-builder-platform',

    systemBuilderIsFoundation:
      status.foundationPlatform === 'system-builder-platform',

    websiteIsPrimary:
      status.primarySurface === 'website',

    portalIsPrimaryRuntime:
      status.primaryRuntime === 'sheikha-main-portal',

    websiteRequiredForProduction:
      status.productSurfaces.website.requiredForProduction === true,

    websiteIndependent:
      status.productSurfaces.website.independentlyOperable === true,

    websiteIsNotSystemFoundation:
      status.operationalMeaning.websiteIsFoundation === false,

    websiteIsSystemBuilderSurface:
      status.operationalMeaning.websiteIsSystemBuilderSurface === true,

    websiteIsNotSystemFoundation:
      status.operationalMeaning.websiteIsFoundation === false,

    websiteIsSystemBuilderSurface:
      status.operationalMeaning.websiteIsSystemBuilderSurface === true,

    vscodeNotRequired:
      status.productSurfaces.vscode.requiredForProduction === false &&
      status.productSurfaces.vscode.requiredForWebsiteStartup === false,

    extensionNotRequired:
      status.productSurfaces.vscodeExtension.requiredForProduction === false &&
      status.productSurfaces.vscodeExtension.requiredForWebsiteStartup === false,

    editorNotRuntimeDependency:
      status.availabilityPolicy
        .websiteMustNotDependOnEditorProcess === true,

    slowModelDoesNotStopWebsite:
      status.availabilityPolicy
        .websiteMustRemainAvailableWhenModelIsSlow === true,

    deepModelDoesNotStopWebsite:
      status.availabilityPolicy
        .websiteMustRemainAvailableWhenDeepModelIsUnavailable === true,

    deepAnalysisNonBlocking:
      status.availabilityPolicy.deepAnalysisMode ===
        'EXPLICIT_OR_BACKGROUND_NON_BLOCKING',

    latencyTargetIsNotSla:
      status.availabilityPolicy.firstTokenTargetIsSla === false,
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: SYSTEM,
    checks,
    failedChecks,
    passed: failedChecks.length === 0,
  };
}

module.exports = {
  SYSTEM,
  WEBSITE_PRIMARY_RUNTIME,
  getWebsitePrimaryRuntimeStatus,
  validateWebsitePrimaryRuntime,
};
