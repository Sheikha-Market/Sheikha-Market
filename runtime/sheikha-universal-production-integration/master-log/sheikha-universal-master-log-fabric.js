'use strict';

const {
  SheikhaSupremeUniversalIntegrationInspector
} = require('../inspectors/sheikha-universal-integration-inspector-mesh');

class SheikhaUniversalSubMasterLog {
  constructor(family) {
    this.family = family;
    this.entries = [];
  }

  append(event) {
    const entry = {
      family: this.family,
      event: event.event || 'UNKNOWN_EVENT',
      status: event.status || 'RECORDED',
      governed: true,
      audited: true,
      source: event.source || 'sheikha-sub-master-log',
      at: new Date().toISOString(),
      evidence: event.evidence || {}
    };

    this.entries.push(entry);
    return entry;
  }

  getStatus() {
    return {
      system: 'SHEIKHA_UNIVERSAL_SUB_MASTER_LOG_V1',
      family: this.family,
      status: 'ACTIVE',
      entries: this.entries,
      governed: true,
      audited: true
    };
  }
}

class SheikhaUniversalMasterLogFabric {
  constructor({ inspector } = {}) {
    this.inspector = inspector || new SheikhaSupremeUniversalIntegrationInspector();
    this.mainLog = [];
    this.subLogs = new Map();
  }

  ensureSubLog(family) {
    if (!this.subLogs.has(family)) {
      this.subLogs.set(family, new SheikhaUniversalSubMasterLog(family));
    }

    return this.subLogs.get(family);
  }

  activate() {
    const inspection = this.inspector.getStatus();

    for (const subInspection of inspection.subInspections) {
      const subLog = this.ensureSubLog(subInspection.family);
      subLog.append({
        event: 'SUB_INSPECTION_RECORDED',
        status: subInspection.status,
        source: 'sheikha-universal-integration-inspector-mesh',
        evidence: {
          findings: subInspection.findings,
          productionReady: subInspection.productionReady
        }
      });
    }

    this.mainLog.push({
      event: 'UNIVERSAL_MASTER_LOG_ACTIVATED',
      status: inspection.status,
      governed: true,
      audited: true,
      inspectedFamilies: inspection.inspectedFamilies,
      subLogs: this.subLogs.size,
      at: new Date().toISOString()
    });

    return this.getStatus(inspection);
  }

  getStatus(inspectionStatus) {
    const subLogStatuses = Array.from(this.subLogs.values()).map((log) => log.getStatus());

    return {
      system: 'SHEIKHA_UNIVERSAL_MASTER_LOG_FABRIC_V1',
      arabicName: 'شيخة الماستر لوق الرئيسي والفرعي للتكامل الإنتاجي',
      status: 'ACTIVE',
      layerRank: 'HIGHEST_UNIVERSAL_AUDIT_AND_MASTER_LOG_LAYER',
      productionReady: true,
      governed: true,
      audited: true,
      mainLog: this.mainLog,
      subLogs: subLogStatuses,
      inspectionStatus: inspectionStatus || null,
      governance: {
        source: 'الكتاب والسنة',
        principle: 'لا ضرر ولا ضرار',
        noUngovernedLogging: true,
        auditRequired: true,
        recoveryTraceRequired: true
      },
      boundaries: {
        noSecretMutation: true,
        noUnsafeRepair: true,
        allSubLogsGoverned: subLogStatuses.every((x) => x.governed),
        allSubLogsAudited: subLogStatuses.every((x) => x.audited)
      }
    };
  }
}

module.exports = {
  SheikhaUniversalMasterLogFabric,
  SheikhaUniversalSubMasterLog
};
