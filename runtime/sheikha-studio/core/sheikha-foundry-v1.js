'use strict';

const crypto = require('node:crypto');

const NATIVE_CAPABILITIES = Object.freeze([
  { id: 'SHEIKHA_LANGUAGE', state: 'ACTIVE_HOSTED_LANGUAGE', role: 'ARABIC_GOVERNED_PROGRAMMING' },
  { id: 'SHEIKHA_CLI', state: 'ACTIVE_LOCAL_RUNTIME', role: 'AUTOMATION_AND_PRODUCT_CONTROL' },
  { id: 'SHEIKHA_STUDIO', state: 'ACTIVE_WEB_RUNTIME', role: 'AUTHORING_AND_OPERATIONS' },
  { id: 'SHEIKHA_MODEL_ROUTER', state: 'ACTIVE_FOUNDATION', role: 'MODEL_SELECTION_AND_GOVERNANCE' },
  { id: 'SHEIKHA_TRAINING_GATE', state: 'ACTIVE_FOUNDATION', role: 'LICENSE_PRIVACY_QUALITY_APPROVAL' },
  { id: 'SHEIKHA_EVALUATION', state: 'ACTIVE_FOUNDATION', role: 'QUALITY_SAFETY_AND_EVIDENCE' },
  { id: 'SHEIKHA_MODEL_REGISTRY', state: 'ACTIVE_FOUNDATION', role: 'MODEL_IDENTITY_VERSION_AND_PROVENANCE' },
  { id: 'SHEIKHA_GIT_LAB_HUB', state: 'ACTIVE_LOCAL_CONTRACT', role: 'SOURCE_AND_EXPERIMENT_FEDERATION' },
]);

const OPTIONAL_PROVIDERS = Object.freeze([
  { id: 'LOCAL_OLLAMA', billing: 'OWNER_COMPUTE', activation: 'EXPLICIT_LOCAL_CONFIGURATION' },
  { id: 'AZURE', billing: 'EXTERNAL_SUBSCRIPTION', activation: 'CONTRACT_CREDENTIAL_BUDGET_AND_APPROVAL' },
  { id: 'AWS', billing: 'EXTERNAL_SUBSCRIPTION', activation: 'CONTRACT_CREDENTIAL_BUDGET_AND_APPROVAL' },
  { id: 'GCP', billing: 'EXTERNAL_SUBSCRIPTION', activation: 'CONTRACT_CREDENTIAL_BUDGET_AND_APPROVAL' },
  { id: 'HOSTINGER', billing: 'EXTERNAL_SUBSCRIPTION', activation: 'CONTRACT_CREDENTIAL_BUDGET_AND_APPROVAL' },
  { id: 'OPENAI', billing: 'USER_OWNED_SUBSCRIPTION', activation: 'PROVIDER_TERMS_SECRET_REFERENCE_AND_APPROVAL' },
  { id: 'ANTHROPIC', billing: 'USER_OWNED_SUBSCRIPTION', activation: 'PROVIDER_TERMS_SECRET_REFERENCE_AND_APPROVAL' },
  { id: 'GOOGLE_MODELS', billing: 'USER_OWNED_SUBSCRIPTION', activation: 'PROVIDER_TERMS_SECRET_REFERENCE_AND_APPROVAL' },
]);

function buildSheikhaFoundryStatus() {
  const base = {
    system: 'SHEIKHA_FOUNDRY_V1',
    status: 'NATIVE_FOUNDATION_ACTIVE_EXTERNAL_PROVIDERS_OPTIONAL',
    core: {
      microsoftOrAzureIsCore: false,
      externalProviderRequiredForLocalCore: false,
      sheikhaCliIsPrimary: true,
      sheikhaLanguageIsPrimary: true,
      sheikhaStudioIsPrimary: true,
    },
    nativeCapabilities: NATIVE_CAPABILITIES,
    modelWorkbench: {
      command: 'npm run ops:foundry:workbench:v1 -- demo',
      policyEndpoint: '/api/commercial/v1/foundry/policy',
      access: 'AUTHENTICATED_ADMIN_PREVIEWS_ONLY',
      features: ['COMPOSITION_COMPATIBILITY', 'SPECIALTY_COMPARISON', 'TRAINING_LINEAGE_INDEX', 'NONREGRESSION_REVIEW', 'OWNERSHIP_AND_COST_QUOTE', 'BYOC_CUSTODY_PLANNING', 'PROFIT_AND_CASH_REINVESTMENT', 'ECONOMIC_FIRST_TRAINING_SOURCING', 'THREE_PARTY_CONTRACT_AND_EXIT_REVIEW', 'STORAGE_LOCATION_CONTRACT_AND_ACCESS_PLANNING', 'REGISTRY_STORAGE_AND_ACTIVE_COMPUTE_CAPACITY', 'FIRMWARE_UEFI_SECURE_BOOT_DECLARATION_REVIEW'],
      artifactVerification: 'LOCAL_STREAMED_SHA256_CLI_ONLY',
      artifactCustody: {
        command: 'node tools/training/sheikha-artifact-custody-v1.js help',
        implementation: 'LOCAL_ENCRYPT_SEAL_VERIFY_RESTORE_PRIVATE_CLI',
        externalUploadImplemented: false,
        customerRightsTransferredByBackup: false,
      },
      executionFromPreview: false,
      privateCustomerDataPublished: false,
      productionPromotionEnabled: false,
    },
    trainingCells: {
      command: 'npm run ops:foundry:cells:v1 -- status',
      implementation: 'SQLITE_WAL_SINGLE_HOST_OFFLINE_SMOKE_WORKER',
      maxConcurrentSmokeWorkers: 1,
      artifactStorage: 'PRIVATE_NOT_WEB_SERVED',
      executionFromStatusRequest: false,
      automaticPromotion: false,
      distributedWorkerActivated: false,
      note: 'GPU recipes remain behind the existing dataset, privacy, quality and approval gates',
    },
    visualProduction: {
      command: 'node tools/media/sheikha-visual-foundry.cjs status',
      implementation: 'PRIVATE_LOCAL_ARCHIVE_DAILY_VISUAL_AND_UI_DRAFTS',
      config: 'config/sheikha-visual-foundry.json',
      architecture: 'docs/foundry/SHEIKHA-VISUAL-FOUNDRY.md',
      liveState: 'READ_FRESH_LOCAL_WATCH_STATUS_AND_SYSTEMD_TIMER',
      humanReviewRequired: true,
      automaticPublishing: false,
      automaticSourceEdits: false,
      scheduledNovelImageOrVideoGeneration: 'PROVIDER_NOT_CONFIGURED',
      physicalProductionActivated: false,
    },
    optionalProviders: OPTIONAL_PROVIDERS.map((provider) => ({
      ...provider,
      optional: true,
      activated: false,
    })),
    providerPolicy: {
      noAutomaticPaidProvisioning: true,
      explicitSubscriptionAndBudgetRequired: true,
      credentialsUseSecretReferencesOnly: true,
      upstreamNamesLicensesAndTermsPreserved: true,
      providerOutputsDoNotBecomeTrainingDataByDefault: true,
      trainingRequiresSeparateRightsLicensePrivacyAndHumanApproval: true,
      noHarmAndNoUnauthorizedDelegationRequired: true,
    },
    executionStarted: false,
    commercialClaim: 'FOUNDATION_AVAILABLE_NOT_A_CLAIM_OF_HYPERSCALE_MODEL_TRAINING',
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { NATIVE_CAPABILITIES, OPTIONAL_PROVIDERS, buildSheikhaFoundryStatus };
