'use strict';

const {
  SDKEnterpriseFederationFabric
} = require('../sdk-federation/sdk-enterprise-federation-fabric');

const {
  ProgrammingLanguageEnterpriseFederationFabric
} = require('../programming-language-enterprise-federation/programming-language-enterprise-federation-fabric');

const {
  GovernanceEnterpriseFederationFabric
} = require('../governance-enterprise-federation/governance-enterprise-federation-fabric');

class SheikhaSovereignFoundationFabric {
  constructor() {
    this.sdkFederation = new SDKEnterpriseFederationFabric();
    this.languageFederation = new ProgrammingLanguageEnterpriseFederationFabric({
      sdkFederation: this.sdkFederation
    });
    this.governanceFederation = new GovernanceEnterpriseFederationFabric();
  }

  activate() {
    return {
      system: 'SHEIKHA_SOVEREIGN_FOUNDATION_FABRIC_V1',
      status: 'ACTIVE',
      layerRank: 'HIGHEST_SOVEREIGN_FOUNDATION_LAYER',
      productionReady: true,
      inspectorOnly: false,
      ethicalSource: 'الكتاب والسنة',
      principle: 'لا ضرر ولا ضرار',
      federations: {
        governance: this.governanceFederation.getStatus(),
        programmingLanguages: this.languageFederation.getStatus(),
        sdk: this.sdkFederation.getStatus()
      },
      boundaries: {
        noUngovernedProductionExecution: true,
        noInspectorOnlyBinding: true,
        noSecretMutation: true,
        auditRequired: true,
        masterLogRequired: true
      }
    };
  }

  getStatus() {
    return this.activate();
  }
}

module.exports = {
  SheikhaSovereignFoundationFabric
};
