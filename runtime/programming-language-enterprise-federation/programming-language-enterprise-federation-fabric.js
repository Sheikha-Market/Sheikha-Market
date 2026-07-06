'use strict';

const {
  SUPPORTED_SDKS,
  PRODUCTION_DOMAINS
} = require('../sdk-federation/sdk-enterprise-federation-fabric');

class ProgrammingLanguageEnterpriseFederationFabric {
  constructor({ sdkFederation, languageGovernance } = {}) {
    this.sdkFederation = sdkFederation;
    this.languageGovernance = languageGovernance;
    this.languages = SUPPORTED_SDKS;
  }

  federateLanguage(language) {
    if (!this.languages.includes(language)) {
      throw new Error(`Unsupported enterprise federated language: ${language}`);
    }

    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_ENTERPRISE_FEDERATION_FABRIC_V1',
      language,
      status: 'ENTERPRISE_FEDERATED',
      layerRank: 'TOP_PRODUCTION_LANGUAGE_LAYER',
      domains: PRODUCTION_DOMAINS,
      capabilities: [
        'sdk-generation',
        'api-binding',
        'runtime-binding',
        'registry-sync',
        'control-plane-integration',
        'master-log-audit',
        'governed-development'
      ],
      boundaries: {
        inspectorOnly: false,
        productionLayer: true,
        allowUngovernedLanguageRuntime: false
      }
    };
  }

  federateAllLanguages() {
    return this.languages.map((language) => this.federateLanguage(language));
  }

  getStatus() {
    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_ENTERPRISE_FEDERATION_FABRIC_V1',
      status: 'ACTIVE',
      layerRank: 'ABOVE_SDK_FEDERATION',
      productionReady: true,
      inspectorOnly: false,
      languages: this.languages,
      federation: this.federateAllLanguages()
    };
  }
}

module.exports = {
  ProgrammingLanguageEnterpriseFederationFabric
};
