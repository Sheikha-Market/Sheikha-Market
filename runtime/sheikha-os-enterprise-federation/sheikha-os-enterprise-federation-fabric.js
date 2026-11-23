'use strict';

const { HostObserver, DISTRIBUTIONS, ARCHITECTURE } = require('./sheikha-host-observation');
const { describePlatformIntegration, inspectPlatformEvidence } = require('./sheikha-platform-evidence');

const {
  SheikhaGeneralEnterpriseInspectorFederation
} = require('../enterprise-inspector-federation/sheikha-general-and-sub-inspector-federation');

const OS_FAMILIES = [
  'linux',
  'windows',
  'apple-macos',
  'unix',
  'android',
  'ios'
];

const COMPUTE_DOMAINS = [
  'personal-computers',
  'workstations',
  'enterprise-servers',
  'cloud-servers',
  'saas-cloud',
  'supercomputers',
  'hpc-clusters',
  'edge-computing',
  'iot-gateways',
  'container-platforms',
  'kubernetes',
  'virtual-machines'
];

class SheikhaOSEnterpriseFederationFabric {
  constructor({ inspector, hostObserver } = {}) {
    this.inspector = inspector || new SheikhaGeneralEnterpriseInspectorFederation();
    this.hostObserver = hostObserver || new HostObserver();
  }

  inspectLocalHost() { return this.hostObserver.sample(); }
  observeLocalHost(options) { return this.hostObserver.watch(options); }
  stopObservation() { this.hostObserver.stop(); }
  inspectPlatformEvidence(options) { return inspectPlatformEvidence(options); }

  governPlatform(platform) {
    if (!platform || !platform.name || !platform.family) {
      throw new Error('Platform requires name and family');
    }

    if (!OS_FAMILIES.includes(platform.family)) {
      throw new Error(`Unsupported OS family: ${platform.family}`);
    }

    return {
      system: 'SHEIKHA_OS_ENTERPRISE_FEDERATION_FABRIC_V1',
      platform: platform.name,
      family: platform.family,
      status: 'OS_ARCHITECTURE_REGISTERED_NOT_RELEASED',
      productionReady: false,
      layerRank: 'HIGH_OS_ENTERPRISE_GOVERNING_LAYER',
      domains: platform.domains || COMPUTE_DOMAINS,
      governance: {
        source: 'الكتاب والسنة',
        principle: 'لا ضرر ولا ضرار',
        noUngovernedExecution: true,
        auditRequired: true,
        recoveryRequired: true,
        inspectorVerified: false
      },
      capabilities: [
        'os-governance',
        'server-governance',
        'cloud-governance',
        'saas-governance',
        'supercomputer-governance',
        'hpc-governance',
        'runtime-federation',
        'security-boundary',
        'observability',
        'self-healing'
      ]
    };
  }

  governAllPlatforms() {
    return [
      { name: 'Linux Enterprise Runtime', family: 'linux' },
      { name: 'Windows Enterprise Runtime', family: 'windows' },
      { name: 'Apple macOS Enterprise Runtime', family: 'apple-macos' },
      { name: 'Unix Server Runtime', family: 'unix' },
      { name: 'Android Edge Runtime', family: 'android' },
      { name: 'iOS Device Runtime', family: 'ios' }
    ].map((platform) => this.governPlatform(platform));
  }

  getStatus() {
    const inspection = this.inspector.getStatus();

    return {
      system: 'SHEIKHA_OS_ENTERPRISE_FEDERATION_FABRIC_V1',
      arabicName: 'شيخة OS طبقة الاتحاد المؤسسي الحاكمة',
      status: 'ARCHITECTURE_REGISTERED_EVIDENCE_REQUIRED',
      layerRank: 'ABOVE_GENERAL_ENTERPRISE_INSPECTOR_AND_SOVEREIGN_FOUNDATION',
      productionReady: false,
      inspectorOnly: true,
      evidenceScope: 'CATALOG_NOT_OS_COMPATIBILITY_ATTESTATION',
      architecture: ARCHITECTURE,
      platformIntegration: describePlatformIntegration(),
      linuxDistributions: DISTRIBUTIONS,
      upstreamOwnershipTransferred: false,
      system76HardwareVerified: false,
      governedOSFamilies: OS_FAMILIES,
      computeDomains: COMPUTE_DOMAINS,
      platforms: this.governAllPlatforms(),
      inspection,
      boundaries: {
        noSecretMutation: true,
        noUngovernedProductionExecution: true,
        noUnsafeRepair: true,
        governedSelfHealing: false,
        auditRequired: true,
        cloudSaasReady: false,
        supercomputerReady: false
      }
    };
  }
}

module.exports = {
  SheikhaOSEnterpriseFederationFabric,
  OS_FAMILIES,
  COMPUTE_DOMAINS
};
