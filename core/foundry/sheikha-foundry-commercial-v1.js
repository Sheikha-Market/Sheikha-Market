'use strict';

const crypto = require('node:crypto');

const MODES = Object.freeze(['CUSTOMER_OWNED_TRAINING', 'SHEIKHA_MODEL_LEASE', 'NEW_WEIGHT_ASSIGNMENT', 'FOUNDRY_SOFTWARE_LICENSE']);
const PURPOSES = Object.freeze(['INTERNAL_DEVELOPMENT', 'NONCOMMERCIAL', 'COMMERCIAL', 'COMMERCIAL_RESALE']);
const CONTRIBUTIONS = Object.freeze(['NONE', 'AGGREGATE_EVALUATION', 'LICENSED_EXAMPLES', 'COMPATIBLE_ADAPTER_LICENSE']);
const COST_FIELDS = Object.freeze(['gpuMinutes', 'gpuRateHalalaPerHour', 'laborMinutes', 'laborRateHalalaPerHour', 'storageHalala', 'evaluationHalala', 'rightsReviewHalala', 'deliveryHalala', 'reserveBps', 'marginBps']);

function exactObject(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !keys.includes(k))) throw new Error('INVALID_OR_UNEXPECTED_FIELDS');
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(value)) throw new Error('INVALID_REFERENCE');
  return value;
}
function choice(value, values) {
  if (!values.includes(value)) throw new Error('UNSUPPORTED_CHOICE');
  return value;
}
function uint(value, max = 10000000000) {
  if (!Number.isSafeInteger(value) || value < 0 || value > max) throw new Error('INVALID_NONNEGATIVE_INTEGER');
  return value;
}
function ceilRatio(n, d) { return Number((n + d - 1n) / d); }
function fingerprint(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

function quoteCosts(input) {
  exactObject(input, COST_FIELDS);
  const c = Object.fromEntries(COST_FIELDS.map(k => [k, uint(input[k], k.endsWith('Bps') ? 10000 : 10000000000)]));
  if (c.marginBps >= 10000) throw new Error('MARGIN_MUST_BE_BELOW_100_PERCENT');
  const gpuHalala = ceilRatio(BigInt(c.gpuMinutes) * BigInt(c.gpuRateHalalaPerHour), 60n);
  const laborHalala = ceilRatio(BigInt(c.laborMinutes) * BigInt(c.laborRateHalalaPerHour), 60n);
  const directCostHalala = gpuHalala + laborHalala + c.storageHalala + c.evaluationHalala + c.rightsReviewHalala + c.deliveryHalala;
  if (!Number.isSafeInteger(directCostHalala) || directCostHalala > 10000000000 || directCostHalala <= 0) throw new Error('COST_ESTIMATE_OUT_OF_RANGE');
  const reservedCostHalala = ceilRatio(BigInt(directCostHalala) * BigInt(10000 + c.reserveBps), 10000n);
  const priceExcludingTaxHalala = ceilRatio(BigInt(reservedCostHalala) * 10000n, BigInt(10000 - c.marginBps));
  if (!Number.isSafeInteger(priceExcludingTaxHalala) || priceExcludingTaxHalala > 10000000000) throw new Error('PRICE_OUT_OF_RANGE');
  return {
    currency: 'SAR', unit: 'HALALA', assumptions: c,
    gpuHalala, laborHalala, directCostHalala, reservedCostHalala, priceExcludingTaxHalala,
    contributionAfterReserveHalala: priceExcludingTaxHalala - reservedCostHalala,
    taxDetermined: false, supplierPriceVerified: false, spendingAuthorized: false,
  };
}

function buildFoundryCommercialPolicy() {
  return {
    system: 'SHEIKHA_FOUNDRY_COMMERCIAL_V1', status: 'PRIVATE_DRAFT_WORKFLOW_IMPLEMENTED',
    modes: [...MODES], purposes: [...PURPOSES], contributionOptions: [...CONTRIBUTIONS],
    ownership: {
      sheikhaOriginalPlatformAndTrainingEnvironment: 'RETAINED_BY_SHEIKHA',
      sheikhaOriginalFoundationWeights: 'RETAINED_SUBJECT_TO_VERIFIED_CHAIN_OF_TITLE',
      thirdPartyBasesAndLibraries: 'UPSTREAM_RIGHTS_PRESERVED_NOT_REASSIGNED',
      rentedHardware: 'PROVIDER_PROPERTY_UNLESS_SEPARATELY_PURCHASED',
      customerData: 'CUSTOMER_AND_SOURCE_RIGHTSHOLDERS',
      customerResults: 'SPECIFIC_NEW_ARTIFACTS_AS_SIGNED_CONTRACT_PERMITS',
    },
    defaults: {customerDataTrainingForSheikha: false, adapterReuse: false, automaticPromotion: false, automaticPaidProvisioning: false},
    executionEnabled: false, publicSaleEnabled: false, contractSigned: false,
    commercialProductionReady: false,
  };
}

function buildFoundryQuote(input, options = {}) {
  exactObject(input, ['customerRef', 'mode', 'purpose', 'baseKind', 'baseRef', 'licenseRef', 'artifactKind', 'venue', 'contributionProposal', 'customerBudgetHalala', 'pricing']);
  const customerRef = ref(input.customerRef);
  const mode = choice(input.mode, MODES);
  const purpose = choice(input.purpose, PURPOSES);
  const baseKind = choice(input.baseKind, ['OPEN_WEIGHTS', 'SHEIKHA_OWNED', 'CUSTOMER_OWNED', 'CLOSED_API', 'NONE']);
  const artifactKind = choice(input.artifactKind, ['ADAPTER', 'FULL_WEIGHTS', 'SOFTWARE_LICENSE']);
  if (baseKind === 'CLOSED_API') throw new Error('CLOSED_API_DOES_NOT_TRANSFER_MODEL_WEIGHTS');
  if (mode === 'FOUNDRY_SOFTWARE_LICENSE' ? artifactKind !== 'SOFTWARE_LICENSE' || baseKind !== 'NONE' : artifactKind === 'SOFTWARE_LICENSE' || baseKind === 'NONE') throw new Error('MODE_ARTIFACT_MISMATCH');
  const venue = choice(input.venue, ['LOCAL', 'CUSTOMER_CLOUD', 'SHEIKHA_CLOUD']);
  const contributionProposal = choice(input.contributionProposal ?? 'NONE', CONTRIBUTIONS);
  const pricing = quoteCosts(input.pricing);
  const customerBudgetHalala = uint(input.customerBudgetHalala);
  const requiredEvidence = [
    'SELLER_IDENTITY_AND_TAX_REVIEW', 'SIGNED_CUSTOMER_SCOPE_AND_OWNERSHIP',
    'UPSTREAM_AND_DATA_RIGHTS_REVIEW', 'PRIVACY_AND_TENANT_ISOLATION',
    'RESOURCE_BENCHMARK_AND_RESERVATION', 'VERIFIED_FUNDS_AND_SPENDING_APPROVAL',
    'QUALITY_ACCEPTANCE_AND_ROLLBACK', 'EXPORT_AND_RESTORE_TEST',
  ];
  if (contributionProposal !== 'NONE') requiredEvidence.push('SEPARATE_SCOPED_CONTRIBUTION_GRANT');
  if (venue !== 'LOCAL') requiredEvidence.push('EXTERNAL_PROCESSOR_REGION_AND_CONTRACT_APPROVAL');
  const now = options.now instanceof Date ? options.now : new Date();
  if (!Number.isFinite(now.getTime())) throw new Error('INVALID_DATE');
  const draft = {
    system: 'SHEIKHA_FOUNDRY_QUOTE_V1', schemaVersion: '1.0.0',
    classification: 'CONFIDENTIAL_NONBINDING_DRAFT', issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
    customerRef, mode, purpose, baseKind, baseRef: ref(input.baseRef), licenseRef: ref(input.licenseRef), artifactKind, venue,
    billingUnit: mode === 'SHEIKHA_MODEL_LEASE' ? 'ONE_MONTH_WITH_EXPLICIT_QUOTA' : mode === 'FOUNDRY_SOFTWARE_LICENSE' ? 'SPECIFIC_LICENSE_SCOPE' : 'ONE_BOUNDED_TRAINING_OR_DELIVERY',
    pricing, customerBudgetHalala,
    budgetWithinDraft: customerBudgetHalala >= pricing.priceExcludingTaxHalala,
    ownership: {
      platformTransferIncluded: false, sheikhaFoundationTransferIncluded: false, upstreamRightsPreserved: true,
      newArtifactRights: mode === 'SHEIKHA_MODEL_LEASE' ? 'SHEIKHA_IF_VERIFIED_CUSTOMER_LICENSE_ONLY'
        : mode === 'FOUNDRY_SOFTWARE_LICENSE' ? 'CUSTOMER_USE_LICENSE_NOT_PLATFORM_OWNERSHIP'
        : 'CUSTOMER_NEW_OWNABLE_ARTIFACTS_ONLY_AFTER_SIGNED_SCOPE',
      baseWeightsOwnershipTransferred: false,
      portability: mode === 'SHEIKHA_MODEL_LEASE' ? 'LEASE_SCOPE_NO_IMPLIED_WEIGHT_EXPORT' : 'EXPORT_SUBJECT_TO_BASE_LICENSE_AND_ACCEPTANCE',
    },
    contribution: {
      proposed: contributionProposal, authorized: false, trainingReuseAllowed: false,
      compensation: contributionProposal === 'NONE' ? 'NONE' : 'SEPARATE_NEGOTIATED_DISCOUNT_OR_ROYALTY_NOT_APPLIED',
      serviceConditionalOnGrant: false, unrestrictedDataGrant: false,
    },
    contractClauses: ['CONFIDENTIALITY', 'PURPOSE_LIMITATION', 'NO_PLATFORM_IP_TRANSFER', 'NEW_ARTIFACT_SCHEDULE', 'UPSTREAM_ATTRIBUTION', 'NO_CROSS_TENANT_TRAINING_DEFAULT', 'NO_UNLICENSED_DISTILLATION', 'MILESTONES_AND_COST_CAP', 'ACCEPTANCE_AND_CURE', 'EXIT_EXPORT_RETENTION', 'SUBPROCESSOR_APPROVAL', 'NO_UNILATERAL_RIGHTS_EXPANSION'],
    requiredEvidence,
    status: 'DRAFT_REVIEW_REQUIRED', signatureVerified: false, paymentCollected: false,
    trainingExecuted: false, deploymentExecuted: false, productionReady: false,
  };
  return {...draft, quoteSha256: fingerprint(draft), digestIsSignature: false};
}

module.exports = {MODES, PURPOSES, CONTRIBUTIONS, buildFoundryCommercialPolicy, buildFoundryQuote, quoteCosts};
