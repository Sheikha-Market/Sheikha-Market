'use strict';

const crypto = require('node:crypto');

const PROVIDERS = Object.freeze([
  { id: 'OLLAMA', mode: 'LOCAL', credential: 'NONE_OR_LOCAL_AUTH', outputTrainingRights: 'MODEL_LICENSE_AND_LOCAL_POLICY' },
  { id: 'OPENAI', mode: 'API_SUBSCRIPTION', credential: 'SECRET_REFERENCE', outputTrainingRights: 'PROVIDER_TERMS_AND_CONTRACT_REVIEW' },
  { id: 'AZURE_OPENAI', mode: 'CLOUD_SUBSCRIPTION', credential: 'SECRET_REFERENCE', outputTrainingRights: 'PROVIDER_TERMS_AND_CONTRACT_REVIEW' },
  { id: 'ANTHROPIC', mode: 'API_SUBSCRIPTION', credential: 'SECRET_REFERENCE', outputTrainingRights: 'PROVIDER_TERMS_AND_CONTRACT_REVIEW' },
  { id: 'GOOGLE_VERTEX_GEMINI', mode: 'CLOUD_SUBSCRIPTION', credential: 'WORKLOAD_IDENTITY_OR_SECRET_REFERENCE', outputTrainingRights: 'PROVIDER_TERMS_AND_CONTRACT_REVIEW' },
  { id: 'AWS_BEDROCK', mode: 'CLOUD_SUBSCRIPTION', credential: 'WORKLOAD_IDENTITY', outputTrainingRights: 'PROVIDER_TERMS_AND_CONTRACT_REVIEW' },
  { id: 'OPENAI_COMPATIBLE', mode: 'CUSTOM_API', credential: 'SECRET_REFERENCE', outputTrainingRights: 'CUSTOM_PROVIDER_CONTRACT_REVIEW' },
]);

function getProvider(providerId) {
  return PROVIDERS.find((provider) => provider.id === String(providerId || '').trim().toUpperCase());
}

function draftSubscriptionAgreement(input = {}) {
  const provider = getProvider(input.providerId);
  if (!provider) {
    return { status: 'UNKNOWN_PROVIDER', agreementCreated: false };
  }
  const customerOwnsSubscription = input.customerOwnsSubscription === true;
  const trainingOptIn = input.trainingOptIn === true;
  const providerTrainingRightsApproved = input.providerTrainingRightsApproved === true;
  const base = {
    system: 'SHEIKHA_MODEL_PROVIDER_SUBSCRIPTION_AGREEMENT_V1',
    status: 'DRAFT_REQUIRES_ACCEPTANCE',
    providerId: provider.id,
    commercialMode: customerOwnsSubscription ? 'CUSTOMER_OWNED_SUBSCRIPTION_BYOS' : 'SHEIKHA_MANAGED_SUBSCRIPTION_PENDING_BILLING',
    credentialHandling: {
      secretValueAcceptedByThisContract: false,
      secretReferenceRequired: provider.credential !== 'NONE_OR_LOCAL_AUTH',
      vaultRequired: provider.credential !== 'NONE_OR_LOCAL_AUTH',
      customerRetainsProviderAccountOwnership: customerOwnsSubscription,
    },
    billing: {
      providerChargesPaidBy: customerOwnsSubscription ? 'CUSTOMER_DIRECTLY' : 'SHEIKHA_AFTER_SEPARATE_PAID_PLAN',
      sheikhaSubscriptionRequired: !customerOwnsSubscription,
      automaticChargeAuthorized: false,
    },
    training: {
      customerContentTrainingOptIn: trainingOptIn,
      providerOutputTrainingRightsApproved: providerTrainingRightsApproved,
      eligibleForSheikhaTrainingCorpus: trainingOptIn && providerTrainingRightsApproved,
      humanCurationAndPrivacyReviewRequired: true,
      automaticLiveLearning: false,
    },
    terms: [
      'NO_SECRET_DISCLOSURE',
      'NO_CUSTOMER_CONTENT_TRAINING_WITHOUT_EXPLICIT_OPT_IN',
      'PROVIDER_TERMS_AND_OUTPUT_RIGHTS_MUST_BE_RESPECTED',
      'USAGE_LIMITS_AND_COST_CAPS_REQUIRED',
      'CUSTOMER_MAY_REVOKE_PROVIDER_CONNECTION',
      'NO_HARM_NO_UNJUST_APPROPRIATION',
    ],
    legallyBinding: false,
    legalHumanReviewRequired: true,
  };
  return { ...base, agreementSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

function buildProviderCatalog() {
  return {
    system: 'SHEIKHA_MODEL_PROVIDER_CATALOG_V1',
    providers: PROVIDERS,
    supportedCommercialModes: ['CUSTOMER_OWNED_SUBSCRIPTION_BYOS', 'SHEIKHA_MANAGED_SUBSCRIPTION_PENDING_BILLING'],
    paymentCaptureEnabled: false,
    secretStorageImplemented: false,
    activationPolicy: 'CONTRACT_ACCEPTANCE_PLUS_VAULT_REFERENCE_PLUS_CONNECTIVITY_TEST',
  };
}

module.exports = { PROVIDERS, buildProviderCatalog, draftSubscriptionAgreement };
