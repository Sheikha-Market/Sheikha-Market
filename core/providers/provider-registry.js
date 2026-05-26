'use strict';

const path = require('path');

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
  } catch (e) {
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

  const status = typeof provider.status === 'function'
    ? provider.status()
    : { success: true, provider: provider.provider || name };

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

module.exports = {
  resolveProvider,
  getProviderRegistryStatus,
  getProviderStatus,
  providers,
  priority
};
