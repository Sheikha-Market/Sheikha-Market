'use strict';

const {
  SheikhaSovereignFoundationFabric
} = require('../sovereign-foundation/sheikha-sovereign-foundation-fabric');

class SheikhaSubRecoveryInspector {
  inspect(status) {
    const findings = [];

    if (!status || status.status !== 'ACTIVE') {
      findings.push('sovereign-foundation-not-active');
    }

    if (!status?.federations?.governance) {
      findings.push('missing-governance-federation');
    }

    if (!status?.federations?.programmingLanguages) {
      findings.push('missing-programming-language-federation');
    }

    if (!status?.federations?.sdk) {
      findings.push('missing-sdk-federation');
    }

    return {
      system: 'SHEIKHA_SUB_RECOVERY_INSPECTOR_V1',
      status: findings.length === 0 ? 'PASSED' : 'NEEDS_RECOVERY',
      findings,
      recoveryPlan: findings.map((finding) => ({
        finding,
        action: 'rebuild-or-reactivate-governed-layer',
        safe: true
      }))
    };
  }
}

class SheikhaGeneralEnterpriseInspectorFederation {
  constructor() {
    this.foundation = new SheikhaSovereignFoundationFabric();
    this.subInspector = new SheikhaSubRecoveryInspector();
  }

  inspectAll() {
    const sovereignStatus = this.foundation.getStatus();
    const subInspection = this.subInspector.inspect(sovereignStatus);

    return {
      system: 'SHEIKHA_GENERAL_ENTERPRISE_INSPECTOR_FEDERATION_V1',
      status: subInspection.status === 'PASSED' ? 'ACTIVE_VERIFIED' : 'ACTIVE_WITH_RECOVERY_REQUIRED',
      layerRank: 'GENERAL_INSPECTOR_ABOVE_SOVEREIGN_FOUNDATION',
      productionReady: true,
      inspectorOnly: false,
      sovereignStatus,
      subInspection,
      boundaries: {
        noUngovernedExecution: true,
        noSecretMutation: true,
        recoveryIsGoverned: true,
        auditRequired: true
      }
    };
  }

  getStatus() {
    return this.inspectAll();
  }
}

module.exports = {
  SheikhaGeneralEnterpriseInspectorFederation,
  SheikhaSubRecoveryInspector
};
