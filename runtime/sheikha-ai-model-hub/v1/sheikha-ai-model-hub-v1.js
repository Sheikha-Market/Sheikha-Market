'use strict';

const crypto = require('node:crypto');

const ASSET_KINDS = Object.freeze([
  'SHEIKHA_OWNED_FROM_SCRATCH',
  'THIRD_PARTY_OPEN_WEIGHT',
  'CUSTOMER_OWNED',
  'EXTERNAL_API'
]);

const PROVIDER_CLASSES = Object.freeze([
  'LOCAL',
  'SHEIKHA_CLOUD',
  'CUSTOMER_CLOUD',
  'OPTIONAL_EXTERNAL_CONNECTOR'
]);

const LIFECYCLE = Object.freeze([
  'REGISTERED',
  'RIGHTS_REVIEWED',
  'SECURITY_REVIEWED',
  'EVALUATED',
  'CANARY',
  'COMMERCIAL_APPROVED',
  'SUSPENDED',
  'RETIRED'
]);

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function normalizeAsset(input = {}) {
  return {
    assetId: String(input.assetId || '').trim(),
    displayName: String(input.displayName || '').trim(),
    kind: String(input.kind || '').trim().toUpperCase(),
    providerClass: String(input.providerClass || '').trim().toUpperCase(),
    artifactSha256: String(input.artifactSha256 || '').trim().toLowerCase(),
    licenseId: String(input.licenseId || '').trim(),
    licenseEvidenceSha256: String(input.licenseEvidenceSha256 || '').trim().toLowerCase(),
    evaluationEvidenceSha256: String(input.evaluationEvidenceSha256 || '').trim().toLowerCase(),
    provenanceEvidenceSha256: String(input.provenanceEvidenceSha256 || '').trim().toLowerCase(),
    privacyReviewPassed: input.privacyReviewPassed === true,
    securityReviewPassed: input.securityReviewPassed === true,
    qualityGatePassed: input.qualityGatePassed === true,
    canaryPassed: input.canaryPassed === true,
    humanCommercialApproval: input.humanCommercialApproval === true,
    externalTermsAccepted: input.externalTermsAccepted === true,
    customerDataTrainingConsent: input.customerDataTrainingConsent === true
  };
}

function isDigest(value) {
  return /^[a-f0-9]{64}$/u.test(value);
}

function assessAsset(input = {}) {
  const asset = normalizeAsset(input);
  const blockers = [];

  if (!asset.assetId) blockers.push('ASSET_ID_REQUIRED');
  if (!asset.displayName) blockers.push('DISPLAY_NAME_REQUIRED');
  if (!ASSET_KINDS.includes(asset.kind)) blockers.push('SUPPORTED_ASSET_KIND_REQUIRED');
  if (!PROVIDER_CLASSES.includes(asset.providerClass)) blockers.push('SUPPORTED_PROVIDER_CLASS_REQUIRED');
  if (!isDigest(asset.artifactSha256)) blockers.push('IMMUTABLE_ARTIFACT_DIGEST_REQUIRED');
  if (!asset.licenseId) blockers.push('LICENSE_ID_REQUIRED');
  if (!isDigest(asset.licenseEvidenceSha256)) blockers.push('LICENSE_EVIDENCE_DIGEST_REQUIRED');
  if (!isDigest(asset.provenanceEvidenceSha256)) blockers.push('PROVENANCE_EVIDENCE_DIGEST_REQUIRED');
  if (!isDigest(asset.evaluationEvidenceSha256)) blockers.push('EVALUATION_EVIDENCE_DIGEST_REQUIRED');
  if (!asset.privacyReviewPassed) blockers.push('PRIVACY_REVIEW_REQUIRED');
  if (!asset.securityReviewPassed) blockers.push('SECURITY_REVIEW_REQUIRED');
  if (!asset.qualityGatePassed) blockers.push('QUALITY_GATE_REQUIRED');
  if (!asset.canaryPassed) blockers.push('CANARY_REQUIRED');
  if (!asset.humanCommercialApproval) blockers.push('HUMAN_COMMERCIAL_APPROVAL_REQUIRED');

  if (asset.kind === 'EXTERNAL_API') {
    if (!asset.externalTermsAccepted) blockers.push('EXTERNAL_SERVICE_TERMS_REQUIRED');
    if (asset.providerClass !== 'OPTIONAL_EXTERNAL_CONNECTOR') {
      blockers.push('EXTERNAL_API_MUST_REMAIN_OPTIONAL');
    }
  }

  const declarationsComplete = blockers.length === 0;
  // This endpoint validates declarations, not evidence contents or signed authority.
  blockers.push('INDEPENDENT_ARTIFACT_RIGHTS_AND_RELEASE_VERIFICATION_REQUIRED');
  const result = {
    system: 'SHEIKHA_AI_MODEL_HUB_ASSET_GATE_V1',
    asset,
    rights: {
      ownedWeights: false,
      ownershipStatus: 'NOT_VERIFIED',
      sheikhaFoundationOwnershipClaimAllowed: false,
      externalApiWeightsDelivered: false,
      customerDataReusableForSheikhaTraining: false
    },
    declarationsComplete,
    evidenceContentsVerified: false,
    persisted: false,
    lifecycleStage: 'DECLARATION_ASSESSED',
    commercialApproved: false,
    automaticPublicationAllowed: false,
    automaticCustomerDataReuseAllowed: false,
    blockers
  };

  return { ...result, decisionSha256: sha256(result) };
}

function getHubStatus() {
  const components = [
    ['MODEL_REGISTRY', 'PERSISTENT_REGISTRY_NOT_VERIFIED_BY_THIS_ENDPOINT'],
    ['DATASET_REGISTRY', 'PERSISTENT_REGISTRY_NOT_VERIFIED_BY_THIS_ENDPOINT'],
    ['ARTIFACT_PROVENANCE', 'DECLARATION_VALIDATION_ONLY'],
    ['LICENSE_GATE', 'DECLARATION_VALIDATION_ONLY'],
    ['EVALUATION_GATE', 'DECLARATION_VALIDATION_ONLY'],
    ['LOCAL_INFERENCE', 'LIVE_VERIFICATION_REQUIRED'],
    ['LOCAL_FROM_SCRATCH_LAB', 'PER_RUN_EVIDENCE_REQUIRED'],
    ['OPTIONAL_HUGGING_FACE_METADATA_CONNECTOR', 'OPT_IN_VERIFICATION_REQUIRED'],
    ['SPACES_STYLE_APP_GALLERY', 'PORTAL_NOT_HOSTING_SERVICE'],
    ['CUSTOMER_PRIVATE_TRAINING', 'CONTRACT_AND_CAPACITY_REQUIRED'],
    ['DISTRIBUTED_LARGE_MODEL_TRAINING', 'EXTERNAL_CAPACITY_REQUIRED'],
    ['SHEIKHA_LPU_HARDWARE', 'RESEARCH_NOT_BUILT'],
    ['AUTOMATIC_COMMERCIAL_RELEASE', 'DISABLED_BY_GOVERNANCE']
  ].map(([id, status]) => ({ id, status }));

  const status = {
    system: 'SHEIKHA_AI_MODEL_HUB_V1',
    nameAr: 'منظومة شيخة لمستودعات النماذج ودورة حياة التعلم الآلي',
    status: 'ACTIVE_WITH_GOVERNED_LIMITS',
    ownership: {
      platformCode: 'SHEIKHA_REPOSITORY_SCOPE',
      modelWeights: 'PER_ASSET_PROVENANCE_AND_CONTRACT',
      customerData: 'CUSTOMER_CONTROLLED_DEFAULT_DENY_REUSE',
      externalApiWeights: 'NOT_DELIVERED_NOT_OWNED'
    },
    architecture: {
      controlPlane: 'SHEIKHA_RUNTIME',
      registries: ['MODELS', 'DATASETS', 'APPLICATIONS', 'EVALUATIONS', 'LICENSES'],
      executionPlanes: ['LOCAL', 'SHEIKHA_CLOUD', 'CUSTOMER_CLOUD', 'OPTIONAL_EXTERNAL'],
      integrations: ['SHEIKHA_FOUNDRY', 'SHEIKHA_GIT', 'SHEIKHA_MARKET', 'SHEIKHA_SAAS'],
      trustBoundary: ['SHEIKHA_TPM', 'SHEIKHA_UEFI', 'SHEIKHA_SECURE_BOOT', 'SHEIKHA_FIRMWARE']
    },
    lifecycle: LIFECYCLE,
    components,
    release: {
      publicMarketplaceReady: false,
      commercialLargeModelReady: false,
      governedPrivatePilotReady: false,
      reason: 'EACH_ASSET_REQUIRES_RIGHTS_SECURITY_QUALITY_CANARY_AND_HUMAN_APPROVAL'
    },
    claims: {
      universalBenchmarkLeadershipProven: false,
      largeOwnedModelCompleted: false,
      customLpuBuilt: false
    }
  };

  return { ...status, statusSha256: sha256(status) };
}

module.exports = {
  ASSET_KINDS,
  LIFECYCLE,
  PROVIDER_CLASSES,
  assessAsset,
  getHubStatus
};
