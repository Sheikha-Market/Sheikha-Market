'use strict';

const SUPPORTED_SDKS = [
  'javascript-node',
  'python',
  'go',
  'rust',
  'java',
  'csharp',
  'php'
];

const PRODUCTION_DOMAINS = [
  'development',
  'runtime',
  'api',
  'sdk',
  'language-governance',
  'control-plane',
  'registry',
  'master-log',
  'enterprise-integration',
  'marketplace',
  'vscode-extension',
  'cloud',
  'governance'
];

class SDKEnterpriseFederationFabric {
  constructor({ registry, controlPlane, masterLog, governance } = {}) {
    this.registry = registry || new Map();
    this.controlPlane = controlPlane || {};
    this.masterLog = masterLog || [];

    this.governance = governance || {
      requireGovernance: true,
      sourceOfEthics: 'الكتاب والسنة',
      principles: [
        'الصدق',
        'الأمانة',
        'الإتقان',
        'لا ضرر ولا ضرار',
        'منع الظلم',
        'منع الربا والغرر والخداع',
        'الخير والنفع المباح'
      ],
      execution: 'governed-production'
    };
  }

  assertProductionDomain(domain) {
    if (!PRODUCTION_DOMAINS.includes(domain)) {
      throw new Error(`Unsupported production domain: ${domain}`);
    }
  }

  registerSDK(sdk) {
    if (!sdk || !sdk.language || !sdk.name) {
      throw new Error('SDK registration requires language and name');
    }

    if (!SUPPORTED_SDKS.includes(sdk.language)) {
      throw new Error(`Unsupported SDK language: ${sdk.language}`);
    }

    const domains = sdk.domains || ['development', 'runtime', 'sdk'];
    domains.forEach((domain) => this.assertProductionDomain(domain));

    const record = {
      id: `${sdk.language}:${sdk.name}`,
      language: sdk.language,
      name: sdk.name,
      version: sdk.version || '1.0.0',
      status: 'production-registered',
      productionReady: true,
      domains,
      capabilities: sdk.capabilities || [],
      governance: this.governance,
      boundaries: {
        inspectorOnly: false,
        requiresGovernedExecution: true,
        allowUngovernedRuntime: false,
        allowSecretMutation: false,
        allowHarmfulUse: false
      },
      integrations: {
        registry: true,
        controlPlane: true,
        masterLog: true,
        governance: true,
        languageGovernance: true
      },
      createdAt: new Date().toISOString()
    };

    this.registry.set(record.id, record);
    this.masterLog.push({
      event: 'PRODUCTION_SDK_REGISTERED',
      id: record.id,
      language: record.language,
      domains: record.domains,
      at: record.createdAt
    });

    return record;
  }

  registerProductionRuntime() {
    return SUPPORTED_SDKS.map((language) =>
      this.registerSDK({
        language,
        name: `sheikha-${language}-production-sdk`,
        version: '1.0.0',
        domains: PRODUCTION_DOMAINS,
        capabilities: [
          'development',
          'runtime-integration',
          'api-client',
          'governance-check',
          'registry-sync',
          'control-plane-binding',
          'master-log-audit'
        ]
      })
    );
  }

  listSDKs() {
    return Array.from(this.registry.values());
  }

  getStatus() {
    return {
      system: 'SHEIKHA_SDK_ENTERPRISE_FEDERATION_FABRIC_PRODUCTION_V1',
      status: 'ACTIVE',
      layerType: 'production-runtime-layer',
      inspectorOnly: false,
      productionReady: true,
      supportedSDKs: SUPPORTED_SDKS,
      productionDomains: PRODUCTION_DOMAINS,
      registered: this.listSDKs().length,
      governance: this.governance
    };
  }
}

module.exports = {
  SDKEnterpriseFederationFabric,
  SUPPORTED_SDKS,
  PRODUCTION_DOMAINS
};
