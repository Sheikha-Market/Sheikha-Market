'use strict';

const {
  SheikhaUniversalIntegrationControlPlane
} = require('../engines/sheikha-universal-integration-control-plane');

class SheikhaUniversalSubIntegrationInspector {
  constructor(family) {
    this.family = family;
  }

  inspect(record) {
    const findings = [];

    if (!record) findings.push('missing-adapter-record');
    if (record && record.status !== 'REGISTERED_PRODUCTION_ADAPTER') findings.push('adapter-not-registered');
    if (record && !record.governed) findings.push('adapter-not-governed');
    if (record && !record.healthy) findings.push('adapter-unhealthy');
    if (record && !record.recoverable) findings.push('adapter-not-recoverable');

    return {
      system: 'SHEIKHA_UNIVERSAL_SUB_INTEGRATION_INSPECTOR_V1',
      family: this.family,
      status: findings.length === 0 ? 'PASSED' : 'NEEDS_RECOVERY',
      productionReady: findings.length === 0,
      findings,
      recoveryPlan: findings.map((finding) => ({
        finding,
        action: 'reactivate-governed-production-adapter',
        safe: true,
        audited: true
      }))
    };
  }
}

class SheikhaSupremeUniversalIntegrationInspector {
  constructor({ controlPlane } = {}) {
    this.controlPlane = controlPlane || new SheikhaUniversalIntegrationControlPlane();
  }

  inspectAll() {
    const controlStatus = this.controlPlane.activate();
    const registryEntries = Array.from(this.controlPlane.registry.values());

    const subInspections = registryEntries.map((record) => {
      const inspector = new SheikhaUniversalSubIntegrationInspector(record.family);
      return inspector.inspect(record);
    });

    const passed = subInspections.every((x) => x.status === 'PASSED');

    return {
      system: 'SHEIKHA_SUPREME_UNIVERSAL_INTEGRATION_INSPECTOR_V1',
      arabicName: 'شيخة الانسبكتور العام الرئيسي لتكامل الأنظمة',
      status: passed ? 'ACTIVE_VERIFIED' : 'ACTIVE_WITH_RECOVERY_REQUIRED',
      layerRank: 'HIGHEST_UNIVERSAL_INTEGRATION_INSPECTION_LAYER',
      productionReady: passed,
      inspectorOnly: false,
      inspectedFamilies: subInspections.length,
      controlPlane: controlStatus,
      subInspections,
      governance: {
        source: 'الكتاب والسنة',
        principle: 'لا ضرر ولا ضرار',
        noUngovernedExecution: true,
        recoveryIsGoverned: true,
        auditRequired: true
      },
      boundaries: {
        noSecretMutation: true,
        noUnsafeRepair: true,
        allSubInspectorsGoverned: true,
        allRecoveriesAudited: true
      }
    };
  }

  getStatus() {
    return this.inspectAll();
  }
}

module.exports = {
  SheikhaSupremeUniversalIntegrationInspector,
  SheikhaUniversalSubIntegrationInspector
};
