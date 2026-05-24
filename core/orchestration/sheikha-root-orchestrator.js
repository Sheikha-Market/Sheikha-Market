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
  const layers = {
    runtimeBus: runtimeBus.status().status === 'active',
    neuralFabric: neuralMesh.status().status === 'active',
    eventFabric: eventFabric.status().status === 'active',
    recoveryEngine: recoveryEngine.status().status === 'active',
    federation: federation.status().status === 'active',
    synchronization: synchronizer.status().status === 'active',
    canonicalRuntimeLoader: canonicalRuntime.getCanonicalRuntimeStatus().status === 'active',
    githubMcpToolsets: toolsets.status === 'active' && toolsets.count >= 20,
    orchestrationEngine: true
  };

  const orchestration = Object.values(layers).every(Boolean);

  return {
    success: true,
    name: 'Sheikha Root Orchestrator',
    status: orchestration ? 'active' : 'partial',
    orchestration,
    mode: 'complete-root-governed-orchestration',
    layers,
    runtimeBus: runtimeBus.status(),
    neuralMesh: neuralMesh.status(),
    eventFabric: eventFabric.status(),
    recoveryEngine: recoveryEngine.status(),
    federation: federation.status(),
    synchronization: synchronizer.status(),
    canonicalRuntime: canonicalRuntime.getCanonicalRuntimeStatus(),
    toolsets,
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
        'canonical runtime loader',
        'github mcp toolsets'
      ],
      invariant: 'orchestration=true only when all linked root layers are active and runtime sources are canonical-only'
    },
    message: orchestration
      ? 'تم تفعيل orchestration=true وربط النسيج الجذري الكامل'
      : 'التفعيل جزئي ويحتاج مراجعة طبقة غير نشطة',
    timestamp: new Date().toISOString()
  };
}

module.exports = { status };
