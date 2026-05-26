'use strict';

const KERNEL_ID = 'SHEIKHA_KERNEL';
const STARTED_AT = new Date().toISOString();

const registry = Object.freeze({
  kernel: KERNEL_ID,
  runtime: 'SHEIKHA_KERNEL_RUNTIME',
  mode: 'sovereign-deterministic-operating-fabric',
  governance: 'ACTIVE',
  canonical: true,
  providerAbstraction: true,
  deterministicKernel: true,
  singleton: true,
  ownershipControl: true,
  offlineSurvivability: true,
  localFirst: true,
  externalProvidersAreReplaceable: true,
  humanAuthority: true,
  noDestructiveAutomation: true,
  noSecretExposure: true,
  noConsciousnessClaim: true,
  noGhaybPrediction: true,
  layers: {
    boot: 'core/kernel/boot',
    runtime: 'core/kernel/runtime',
    governance: 'core/kernel/governance',
    providers: 'core/providers',
    memory: 'core/kernel/memory',
    registry: 'core/kernel/registry',
    security: 'core/kernel/security',
    federation: 'core/kernel/federation',
    orchestration: 'core/kernel/orchestration',
    ownership: 'runtime/ownership'
  },
  providerPriority: ['local', 'ollama', 'openai', 'claude', 'gemini', 'offline'],
  startedAt: STARTED_AT
});

function getKernelRegistry() {
  return {
    ...registry,
    uptimeSeconds: Math.max(0, Math.floor((Date.now() - Date.parse(STARTED_AT)) / 1000)),
    timestamp: new Date().toISOString()
  };
}

function getKernelInvariant() {
  return {
    success: true,
    invariant: 'Sheikha remains operational when any external AI provider, IDE budget, or cloud API is unavailable.',
    controls: [
      'canonical ownership',
      'provider abstraction',
      'local-first intelligence',
      'offline fallback',
      'human-reviewed publishing',
      'registry-driven routing',
      'Quran-and-Sunnah governed safety'
    ],
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  KERNEL_ID,
  getKernelRegistry,
  getKernelInvariant,
  registry
};
