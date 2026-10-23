'use strict';

const {
  buildProviderCatalog,
  draftSubscriptionAgreement,
} = require('../runtime/sheikha-studio/core/sheikha-model-provider-subscription-v1');

describe('Sheikha model provider subscription V1', () => {
  test('supports local and subscribed providers without accepting secret values', () => {
    const catalog = buildProviderCatalog();
    expect(catalog.providers.map((provider) => provider.id)).toEqual(expect.arrayContaining([
      'OLLAMA', 'OPENAI', 'AZURE_OPENAI', 'ANTHROPIC', 'GOOGLE_VERTEX_GEMINI', 'AWS_BEDROCK',
    ]));
    expect(catalog.paymentCaptureEnabled).toBe(false);
    expect(catalog.secretStorageImplemented).toBe(false);
  });

  test('separates subscription ownership from training permission', () => {
    const agreement = draftSubscriptionAgreement({
      providerId: 'OPENAI',
      customerOwnsSubscription: true,
      trainingOptIn: true,
      providerTrainingRightsApproved: false,
    });
    expect(agreement.commercialMode).toBe('CUSTOMER_OWNED_SUBSCRIPTION_BYOS');
    expect(agreement.credentialHandling.secretValueAcceptedByThisContract).toBe(false);
    expect(agreement.training.eligibleForSheikhaTrainingCorpus).toBe(false);
    expect(agreement.legallyBinding).toBe(false);
  });

  test('requires both customer opt-in and provider rights for corpus eligibility', () => {
    const agreement = draftSubscriptionAgreement({
      providerId: 'OLLAMA',
      trainingOptIn: true,
      providerTrainingRightsApproved: true,
    });
    expect(agreement.training.eligibleForSheikhaTrainingCorpus).toBe(true);
    expect(agreement.training.automaticLiveLearning).toBe(false);
  });
});
