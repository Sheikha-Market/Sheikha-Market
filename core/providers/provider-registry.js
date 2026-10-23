'use strict';

const path = require('node:path');

const providers = {
  openai: './openai',
  ollama: './ollama',
  local: './local',
  offline: './offline',
  gemini: './gemini',
  claude: './claude'
};

const priority = ['local', 'ollama', 'openai', 'claude', 'gemini', 'offline'];

function loadProvider(name) {
  const target = providers[name];
  if (!target) return null;

  try {
    const provider = require(target);
    return provider && typeof provider === 'object'
      ? { ...provider, id: name, path: path.join(__dirname, target) }
      : null;
  } catch {
    // Provider integrations are optional; resolution continues through the fallback chain.
    return null;
  }
}

function resolveProvider(name = process.env.SHEIKHA_PROVIDER || 'local') {
  const requested = loadProvider(name);
  if (requested) return requested;

  for (const candidate of priority) {
    const provider = loadProvider(candidate);
    if (provider) return provider;
  }

  return require('./offline');
}

function getProviderStatus(name) {
  const provider = loadProvider(name);
  if (!provider) {
    return {
      name,
      available: false,
      reason: 'provider_not_registered'
    };
  }

  // status() قد تكون async (مثل ollama) أو sync
  const rawStatus = typeof provider.status === 'function'
    ? provider.status()
    : { success: true, provider: provider.provider || name };

  // إذا كانت Promise، نُرجع placeholder مبدئي (لا نستطيع await هنا)
  const status = rawStatus && typeof rawStatus.then === 'function'
    ? { success: true, provider: provider.provider || name, runtime: 'CHECK_ASYNC' }
    : rawStatus;

  return {
    name,
    available: true,
    ...status
  };
}

function getProviderRegistryStatus() {
  const selected = process.env.SHEIKHA_PROVIDER || 'local';
  return {
    success: true,
    selected,
    resolved: resolveProvider(selected).provider || selected,
    priority,
    providers: Object.keys(providers).map(getProviderStatus),
    policy: {
      localFirst: true,
      offlineFallback: true,
      externalVendorsAreProvidersOnly: true,
      noSingleProviderCanStopRuntime: true,
      noSecretExposure: true
    },
    timestamp: new Date().toISOString()
  };
}

// يُنفذ سلسلة fallback الذكية عبر جميع المزودات
// يتوقف عند أول مزود يُرجع success:true
function providerAllowedByDisclosurePolicy(
  provider,
  controls = {}
) {
  if (provider?.external !== true) {
    return true;
  }

  return controls.allowExternalProviders === true;
}

function providerConfigured(provider) {
  if (provider.external !== true) return true;
  const statusResult = typeof provider.status === 'function'
    ? provider.status()
    : {};
  return statusResult?.configured === true;
}

async function askProvider(provider, request) {
  try {
    const result = await provider.ask(request);
    return {
      result,
      error: result?.error || 'provider_returned_failure'
    };
  } catch (error) {
    return {
      result: null,
      error: error.message
    };
  }
}

function successfulProviderResult(result, name, blocked, controls) {
  return {
    ...result,
    _providerUsed: name,
    _externalProvidersBlocked: blocked,
    _externalDisclosureAuthorized:
      controls.allowExternalProviders === true
  };
}

async function askWithFallback(
  { prompt, system, model, options = {} },
  preferredProvider = null,
  controls = {}
) {
  const chain = preferredProvider
    ? [preferredProvider, ...priority.filter((p) => p !== preferredProvider)]
    : [...priority];

  let lastError = null;
  const externalProvidersBlocked = [];

  for (const name of chain) {
    const provider = loadProvider(name);
    if (!provider || typeof provider.ask !== 'function') continue;

    if (!providerAllowedByDisclosurePolicy(provider, controls)) {
      externalProvidersBlocked.push(name);
      continue;
    }

    if (!providerConfigured(provider)) continue;

    const attempt = await askProvider(
      provider,
      { prompt, system, model, options }
    );
    if (attempt.result?.success) {
      return successfulProviderResult(
        attempt.result,
        name,
        externalProvidersBlocked,
        controls
      );
    }
    lastError = attempt.error;
  }

  // offline دائماً متاح كحل أخير
  const offline = loadProvider('offline');
  if (offline && typeof offline.ask === 'function') {
    const result = await offline.ask({ prompt });
    return {
      ...result,
      _providerUsed: 'offline',
      _fallbackReason: lastError,
      _externalProvidersBlocked: externalProvidersBlocked,
      _externalDisclosureAuthorized:
        controls.allowExternalProviders === true
    };
  }

  return {
    success: false,
    error: 'all_providers_failed',
    lastError,
    output: null,
    externalProvidersBlocked,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  resolveProvider,
  getProviderRegistryStatus,
  getProviderStatus,
  askWithFallback,
  providerAllowedByDisclosurePolicy,
  providers,
  priority
};
