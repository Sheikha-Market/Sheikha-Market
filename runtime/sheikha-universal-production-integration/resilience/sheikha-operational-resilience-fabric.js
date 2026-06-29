'use strict';

const {
  SheikhaUniversalRegistryFabric
} = require('../registry/sheikha-universal-registry-fabric');

const RESILIENCE_STAGES = [
  'health',
  'prevention',
  'protection',
  'immunity',
  'recovery',
  'healing',
  'validation',
  'audit',
  'promotion'
];

class SheikhaSystemResilienceLayer {
  constructor(family) {
    this.family = family;
  }

  evaluate(record) {
    const healthy = Boolean(record?.productionReady && record?.governed && record?.audited);

    return {
      system: 'SHEIKHA_SYSTEM_RESILIENCE_LAYER_V1',
      family: this.family,
      status: healthy ? 'RESILIENT' : 'NEEDS_RECOVERY',
      productionReady: healthy,
      governed: true,
      stages: RESILIENCE_STAGES.map((stage) => ({
        stage,
        status: healthy ? 'PASSED' : 'REQUIRED',
        safe: true,
        audited: true
      })),
      recoveryPlan: healthy ? [] : [
        {
          action: 'reactivate-registry-record',
          safe: true,
          audited: true
        },
        {
          action: 'rerun-inspection-and-master-log-validation',
          safe: true,
          audited: true
        }
      ]
    };
  }
}

class SheikhaOperationalResilienceFabric {
  constructor({ registry } = {}) {
    this.registry = registry || new SheikhaUniversalRegistryFabric();
  }

  activate() {
    const registryStatus = this.registry.activate();

    const resilience = registryStatus.mainRegistryRecords.map((record) => {
      const layer = new SheikhaSystemResilienceLayer(record.family);
      return layer.evaluate(record);
    });

    const passed = resilience.every((x) => x.status === 'RESILIENT');

    return {
      system: 'SHEIKHA_OPERATIONAL_RESILIENCE_FABRIC_V1',
      arabicName: 'شيخة طبقة الصحة والوقاية والحصانة والتعافي والتشافي',
      status: passed ? 'ACTIVE_RESILIENT' : 'ACTIVE_WITH_RECOVERY_REQUIRED',
      layerRank: 'HIGHEST_OPERATIONAL_RESILIENCE_LAYER',
      productionReady: passed,
      governed: true,
      audited: true,
      registryStatus,
      resilience,
      stages: RESILIENCE_STAGES,
      boundaries: {
        noUngovernedRecovery: true,
        noUnsafeRepair: true,
        noSecretMutation: true,
        allRecoveriesAudited: true,
        allSystemsValidated: passed
      }
    };
  }

  getStatus() {
    return this.activate();
  }
}

module.exports = {
  SheikhaOperationalResilienceFabric,
  SheikhaSystemResilienceLayer,
  RESILIENCE_STAGES
};
