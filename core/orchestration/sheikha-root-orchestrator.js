'use strict';

const runtimeBus = require('../runtime/bus/sheikha-runtime-bus');
const eventFabric = require('../runtime/events/sheikha-event-fabric');
const recoveryEngine = require('../runtime/recovery/sheikha-recovery-engine');
const neuralMesh = require('../neural/mesh/sheikha-root-neural-mesh');

function status() {
  const layers = {
    runtimeBus: runtimeBus.status().status === 'active',
    neuralFabric: neuralMesh.status().status === 'active',
    eventFabric: eventFabric.status().status === 'active',
    recoveryEngine: recoveryEngine.status().status === 'active',
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
    message: orchestration
      ? 'تم تفعيل orchestration=true وربط النسيج الجذري الكامل'
      : 'التفعيل جزئي ويحتاج مراجعة طبقة غير نشطة',
    timestamp: new Date().toISOString()
  };
}

module.exports = { status };
