'use strict';

const runtimeBus = require('../runtime/bus/sheikha-runtime-bus');
const eventFabric = require('../runtime/events/sheikha-event-fabric');
const recoveryEngine = require('../runtime/recovery/sheikha-recovery-engine');
const neuralMesh = require('../neural/mesh/sheikha-root-neural-mesh');
const federation = require('../runtime/federation/sheikha-runtime-federation');
const synchronizer = require('../runtime/synchronization/sheikha-runtime-synchronizer');
const canonicalRuntime = require('../runtime/governance/sheikha-canonical-runtime-loader');
const { getToolsetsStatus } = require('../runtime/bus/sheikha-mcp-toolsets-registry');

function status() {
  const toolsets = getToolsetsStatus();
  const runtimeBusStatus = runtimeBus.status();
  const neuralMeshStatus = neuralMesh.status();
  const eventFabricStatus = eventFabric.status();
  const recoveryStatus = recoveryEngine.status();
  const federationStatus = federation.status();
  const synchronizationStatus = synchronizer.status();
  const canonicalRuntimeStatus = canonicalRuntime.getCanonicalRuntimeStatus();
  const layers = {
    runtimeBus:
      runtimeBusStatus.success === true &&
      runtimeBusStatus.runtime?.canonical === true &&
      runtimeBusStatus.runtime?.orchestration === true,
    neuralFabric: neuralMeshStatus.status === 'active',
    eventFabric: eventFabricStatus.status === 'active',
    recoveryEngine: recoveryStatus.status === 'active',
    federation: federationStatus.status === 'active',
    synchronization: synchronizationStatus.status === 'active',
    canonicalRuntimeLoader:
      canonicalRuntimeStatus.success === true &&
      canonicalRuntimeStatus.governance === 'ACTIVE' &&
      canonicalRuntimeStatus.canonicalRuntime === true &&
      canonicalRuntimeStatus.duplicateRuntimeProtection === true &&
      canonicalRuntimeStatus.duplicateRuntimeLoading === false,
    orchestrationEngine: true
  };
  const orchestration = Object.values(layers).every(Boolean);
  const failedLayers = Object.entries(layers)
    .filter(([, active]) => !active)
    .map(([name]) => name);
  const optionalIntegrations = {
    githubMcpToolsetsCatalogAvailable:
      toolsets.status === 'active' && toolsets.count >= 20,
    githubMcpToolsetsRequired: false,
    externalSourceControlRequired: false
  };

  return {
    success: true,
    name: 'Sheikha Root Orchestrator',
    status: orchestration ? 'active' : 'partial',
    orchestration,
    mode: 'complete-root-governed-orchestration',
    layers,
    summary: {
      registered: Object.keys(layers).length,
      loaded: Object.values(layers).filter(Boolean).length,
      failed: failedLayers.length,
      failedLayers,
      optionalIntegrations: Object.keys(optionalIntegrations).length
    },
    runtimeBus: runtimeBusStatus,
    neuralMesh: neuralMeshStatus,
    eventFabric: eventFabricStatus,
    recoveryEngine: recoveryStatus,
    federation: federationStatus,
    synchronization: synchronizationStatus,
    canonicalRuntime: canonicalRuntimeStatus,
    toolsets,
    optionalIntegrations,
    offlineOperation: {
      localRuntimeRequired: true,
      githubRequired: false,
      gitlabRequired: false,
      externalCloudRequired: false,
      localOrchestrationIndependent: true
    },
    distributedRoot: {
      status: orchestration ? 'active' : 'partial',
      linked: [
        'runtime bus',
        'neural fabric',
        'event fabric',
        'orchestration engine',
        'recovery engine',
        'runtime federation',
        'runtime synchronization',
        'canonical runtime loader'
      ],
      optionalLinked: ['github mcp toolsets catalog'],
      invariant: 'orchestration=true only when all required local root layers are active and runtime sources are canonical-only'
    },
    message: orchestration
      ? 'تم تفعيل orchestration=true وربط النسيج الجذري الكامل'
      : 'التفعيل جزئي ويحتاج مراجعة طبقة غير نشطة',
    timestamp: new Date().toISOString()
  };
}

module.exports = { status };
