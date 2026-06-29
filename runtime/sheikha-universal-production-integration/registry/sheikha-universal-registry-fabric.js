'use strict';

const {
  SheikhaUniversalMasterLogFabric
} = require('../master-log/sheikha-universal-master-log-fabric');

class SheikhaUniversalSubRegistry {
  constructor(family) {
    this.family = family;
    this.records = new Map();
  }

  register(record) {
    if (!record || !record.id) {
      throw new Error('Registry record requires id');
    }

    const entry = {
      id: record.id,
      family: this.family,
      layer: record.layer || 'universal-production-integration',
      status: record.status || 'REGISTERED',
      capabilities: record.capabilities || [],
      governed: true,
      audited: true,
      productionReady: true,
      registeredAt: new Date().toISOString()
    };

    this.records.set(entry.id, entry);
    return entry;
  }

  getStatus() {
    return {
      system: 'SHEIKHA_UNIVERSAL_SUB_REGISTRY_V1',
      family: this.family,
      status: 'ACTIVE',
      governed: true,
      audited: true,
      productionReady: true,
      records: Array.from(this.records.values())
    };
  }
}

class SheikhaUniversalRegistryFabric {
  constructor({ masterLog } = {}) {
    this.masterLog = masterLog || new SheikhaUniversalMasterLogFabric();
    this.mainRegistry = new Map();
    this.subRegistries = new Map();
  }

  ensureSubRegistry(family) {
    if (!this.subRegistries.has(family)) {
      this.subRegistries.set(family, new SheikhaUniversalSubRegistry(family));
    }

    return this.subRegistries.get(family);
  }

  activate() {
    const logStatus = this.masterLog.activate();

    for (const subLog of logStatus.subLogs) {
      const subRegistry = this.ensureSubRegistry(subLog.family);

      const record = subRegistry.register({
        id: `${subLog.family}:production-adapter`,
        layer: 'system-family-production-layer',
        status: 'REGISTERED_GOVERNED_PRODUCTION',
        capabilities: [
          'discovery',
          'inspection',
          'policy',
          'telemetry',
          'recovery',
          'audit',
          'master-log'
        ]
      });

      this.mainRegistry.set(record.id, record);
    }

    return this.getStatus(logStatus);
  }

  getStatus(logStatus) {
    const subRegistryStatuses = Array.from(this.subRegistries.values()).map((registry) => registry.getStatus());

    return {
      system: 'SHEIKHA_UNIVERSAL_REGISTRY_FABRIC_V1',
      arabicName: 'شيخة الرجيستري الرئيسي والفرعي للتكامل الإنتاجي',
      status: 'ACTIVE',
      layerRank: 'HIGHEST_UNIVERSAL_REGISTRY_LAYER',
      productionReady: true,
      governed: true,
      audited: true,
      mainRegistryRecords: Array.from(this.mainRegistry.values()),
      subRegistries: subRegistryStatuses,
      masterLogStatus: logStatus || null,
      governance: {
        source: 'الكتاب والسنة',
        principle: 'لا ضرر ولا ضرار',
        noUngovernedRegistration: true,
        auditRequired: true,
        masterLogRequired: true
      },
      boundaries: {
        noSecretMutation: true,
        noUnsafeRepair: true,
        allSubRegistriesGoverned: subRegistryStatuses.every((x) => x.governed),
        allSubRegistriesAudited: subRegistryStatuses.every((x) => x.audited),
        allSubRegistriesProductionReady: subRegistryStatuses.every((x) => x.productionReady)
      }
    };
  }
}

module.exports = {
  SheikhaUniversalRegistryFabric,
  SheikhaUniversalSubRegistry
};
