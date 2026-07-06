'use strict';

const LANGUAGE_MATRIX = {
  'javascript-node': {
    runtime: 'Node.js',
    sdkRole: 'web-runtime-extension-api',
    integration: ['registry', 'control-plane', 'master-log', 'governance']
  },
  python: {
    runtime: 'Python',
    sdkRole: 'automation-data-ai-tools',
    integration: ['registry', 'control-plane', 'master-log', 'governance']
  },
  go: {
    runtime: 'Go',
    sdkRole: 'high-performance-services',
    integration: ['registry', 'control-plane', 'master-log']
  },
  rust: {
    runtime: 'Rust',
    sdkRole: 'safe-systems-runtime',
    integration: ['registry', 'control-plane', 'governance']
  },
  java: {
    runtime: 'Java',
    sdkRole: 'enterprise-backend',
    integration: ['registry', 'control-plane', 'master-log']
  },
  csharp: {
    runtime: 'C#/.NET',
    sdkRole: 'enterprise-windows-cloud',
    integration: ['registry', 'control-plane', 'governance']
  },
  php: {
    runtime: 'PHP',
    sdkRole: 'marketplace-web-commerce',
    integration: ['registry', 'master-log', 'governance']
  }
};

class ProgrammingLanguageGovernanceFabric {
  constructor({ sdkFederation } = {}) {
    this.sdkFederation = sdkFederation;
    this.languages = LANGUAGE_MATRIX;
  }

  governLanguage(language) {
    const config = this.languages[language];

    if (!config) {
      throw new Error(`Unsupported governed language: ${language}`);
    }

    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_GOVERNANCE_FABRIC_V1',
      language,
      runtime: config.runtime,
      sdkRole: config.sdkRole,
      integration: config.integration,
      governance: {
        status: 'GOVERNED',
        principle: 'الصدق، الحوكمة، لا ضرر ولا ضرار',
        executionBoundary: 'no-ungoverned-sdk-execution'
      }
    };
  }

  generateIntegrationMatrix() {
    return Object.keys(this.languages).map((language) => this.governLanguage(language));
  }

  getStatus() {
    return {
      system: 'SHEIKHA_PROGRAMMING_LANGUAGE_GOVERNANCE_FABRIC_V1',
      status: 'ACTIVE',
      languages: Object.keys(this.languages),
      matrix: this.generateIntegrationMatrix()
    };
  }
}

module.exports = {
  ProgrammingLanguageGovernanceFabric,
  LANGUAGE_MATRIX
};
