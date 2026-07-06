'use strict';

const { getKernelRegistry, getKernelInvariant } = require('./registry/kernel-registry');
const { getProviderRegistryStatus } = require('../providers/provider-registry');
const ownership = require('../../runtime/ownership/runtime-ownership-registry.json');

function getKernelStatus() {
  const registry = getKernelRegistry();
  const providers = getProviderRegistryStatus();

  return {
    success: true,
    kernel: registry.kernel,
    runtime: registry.runtime,
    mode: registry.mode,
    governance: registry.governance,
    canonical: registry.canonical,
    deterministicRuntime: registry.deterministicKernel,
    providerAbstraction: registry.providerAbstraction,
    offlineSurvivability: registry.offlineSurvivability,
    localFirst: registry.localFirst,
    singleton: registry.singleton,
    ownershipControl: registry.ownershipControl,
    externalProvidersAreReplaceable: registry.externalProvidersAreReplaceable,
    layers: registry.layers,
    providers,
    ownership,
    invariant: getKernelInvariant(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getKernelStatus
};
