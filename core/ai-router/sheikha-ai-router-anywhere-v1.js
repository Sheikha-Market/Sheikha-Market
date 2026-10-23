'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-ai-router-anywhere-v1.json'
);

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function providerReadiness(providerId, provider) {
  const keyEnv = provider.keyEnv || null;
  const modelEnv = provider.modelEnv || null;
  const keyConfigured = keyEnv ? Boolean(process.env[keyEnv]) : false;
  const modelConfigured = modelEnv ? Boolean(process.env[modelEnv]) : false;

  return {
    id: providerId,
    kind: provider.kind,
    status: provider.status,
    baseUrl: provider.baseUrl,
    protocols: provider.protocols || [],
    keyEnv,
    modelEnv,
    keyConfigured,
    modelConfigured,
    liveExternalConnectionClaim:
      provider.liveExternalConnectionClaim === true,
    connectionState:
      provider.kind === 'LOCAL_INTERNAL'
        ? 'LOCAL_AVAILABLE'
        : keyConfigured
          ? 'CREDENTIAL_PRESENT_NOT_VERIFIED'
          : 'NOT_CONFIGURED',
    executionAuthority: 'NONE',
  };
}

function buildRouterAnywhereStatus() {
  const config = readConfig();
  const providers = Object.entries(config.providers)
    .map(([id, provider]) => providerReadiness(id, provider));

  const externalProviders = providers.filter(
    (provider) => provider.kind === 'EXTERNAL_ROUTER_PROFILE'
  );

  return {
    system: config.system,
    version: config.version,
    status: 'CLEAR',
    mode: config.mode,
    verifiedResearchDate: config.verifiedResearchDate,
    governance: config.governance,
    summary: {
      surfaces: config.surfaces.length,
      providers: providers.length,
      externalProviders: externalProviders.length,
      liveExternalConnections: externalProviders.filter(
        (provider) => provider.liveExternalConnectionClaim
      ).length,
      externalProvidersWithCredentialPresent:
        externalProviders.filter((provider) => provider.keyConfigured).length,
      executionAuthoritiesGranted: 0,
      officialGuides: config.guides.filter((guide) => guide.official).length,
    },
    architecture: config.architecture,
    surfaces: config.surfaces,
    providers,
    truth: {
      readinessDoesNotMeanConnection: true,
      credentialPresenceDoesNotMeanAuthorization: true,
      noExternalConnectionClaimWithoutEvidence: true,
      noExternalExecutionAuthority: true,
    },
  };
}

function listGuides(input = {}) {
  const config = readConfig();
  const surface = String(input.surface || '').trim();
  const provider = String(input.provider || '').trim();

  const guides = config.guides.filter((guide) => {
    if (surface && guide.surface !== surface) return false;
    if (provider && guide.provider !== provider) return false;
    return true;
  });

  return {
    total: guides.length,
    guides,
  };
}

function buildIntegrationPlan(input = {}) {
  const config = readConfig();
  const surface = String(input.surface || '').trim();
  const providerId = String(input.provider || '').trim();
  const provider = config.providers[providerId];

  if (!config.surfaces.includes(surface)) {
    return {
      ok: false,
      decision: 'DENY',
      reason: 'UNSUPPORTED_SURFACE',
      executionPerformed: false,
    };
  }

  if (!provider) {
    return {
      ok: false,
      decision: 'DENY',
      reason: 'UNKNOWN_PROVIDER',
      executionPerformed: false,
    };
  }

  const readiness = providerReadiness(providerId, provider);
  const steps = [
    'SELECT_OFFICIAL_GUIDE',
    'DECLARE_TARGET_SURFACE',
    'DECLARE_PROVIDER_PROFILE',
    'VERIFY_SECRET_BOUNDARY',
    'VERIFY_MODEL_IDENTIFIER',
    'VERIFY_DATA_CLASSIFICATION',
    'VERIFY_AUTHORIZATION_AND_RIGHTS',
    'VERIFY_COST_AND_QUOTA',
    'PREVIEW_ROUTING_POLICY',
    'HUMAN_REVIEW_BEFORE_EXTERNAL_ACTIVATION',
  ];

  return {
    ok: true,
    decision: 'PLAN_ONLY',
    executionPerformed: false,
    networkFetchPerformed: false,
    secretMutationPerformed: false,
    surface,
    provider: readiness,
    steps,
    guideCandidates: listGuides({
      surface,
      provider: providerId,
    }).guides,
    nextAllowedAction:
      provider.kind === 'LOCAL_INTERNAL'
        ? 'PREVIEW_LOCAL_ROUTING_POLICY'
        : readiness.keyConfigured
          ? 'VERIFY_CREDENTIAL_AUTHORITY_WITHOUT_DISCLOSING_SECRET'
          : 'CONFIGURE_SECRET_EXTERNALLY_IN_ENV_OR_VAULT_THEN_RECHECK',
  };
}

module.exports = {
  buildIntegrationPlan,
  buildRouterAnywhereStatus,
  listGuides,
  readConfig,
};
