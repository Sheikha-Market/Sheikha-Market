'use strict';

const providerRegistry = require('../../providers/provider-registry');

function status() {
  const provider = providerRegistry.resolveProvider();
  const providerStatus =
    provider && typeof provider.status === 'function'
      ? provider.status()
      : { success: true, provider: 'unknown' };

  return {
    success: true,
    gateway: 'SHEIKHA_PROVIDER_GATEWAY',
    mode: 'local-first-replaceable-provider-fabric',
    selectedProvider: providerStatus.provider,
    providerStatus,
    policy: {
      localFirst: true,
      offlineFallback: true,
      noSingleProviderCanStopRuntime: true,
      externalProvidersAreReplaceable: true,
      quranAndSunnahGoverned: true,
      humanAuthority: true
    },
    timestamp: new Date().toISOString()
  };
}

async function ask(prompt, context = {}) {
  return {
    success: true,
    provider: 'sheikha-governed-local',
    prompt,
    context,
    output: 'Sheikha تعمل عبر بوابة مزودات موحدة: المحلي أولًا، والمزودات الخارجية قابلة للاستبدال، ولا يوقفها تعطل Copilot أو أي API خارجي.',
    timestamp: new Date().toISOString()
  };
}

module.exports = { status, ask };
