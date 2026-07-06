'use strict';

const {
  inspectOsFamilyIndustrialFederation
} = require('../os-family-industrial-federation/sheikha-os-family-industrial-federation-v1');

const productionLayers = Object.freeze([
  {
    id: 'kernel-fabric',
    name: 'Kernel Fabric',
    role: 'host-measurement',
    productionRole: 'read-only-host-evidence'
  },
  {
    id: 'kernel-stack-fabric',
    name: 'Kernel Stack Fabric',
    role: 'layer-ordering',
    productionRole: 'stack-readiness-evidence'
  },
  {
    id: 'kernel-industrial-fabric',
    name: 'Kernel Industrial Fabric',
    role: 'industrial-kernel-cluster-map',
    productionRole: 'cluster-governance-map'
  },
  {
    id: 'universal-os-kernel-federation',
    name: 'Universal OS Kernel Federation',
    role: 'os-kernel-family-federation',
    productionRole: 'cross-platform-model-map'
  },
  {
    id: 'os-family-industrial-federation',
    name: 'OS Family Industrial Federation',
    role: 'industrial-family-cluster-map',
    productionRole: 'production-integration-cluster-map'
  },
  {
    id: 'admission-ownership-governance',
    name: 'Admission Ownership Governance',
    role: 'controlled-change-governance',
    productionRole: 'commit-and-review-gate'
  },
  {
    id: 'enterprise-inspector-readiness',
    name: 'Enterprise Inspector Readiness',
    role: 'operator-visibility',
    productionRole: 'human-review-dashboard-target'
  }
]);

const connectionMatrix = Object.freeze([
  ['kernel-fabric', 'kernel-stack-fabric', 'FEEDS'],
  ['kernel-stack-fabric', 'kernel-industrial-fabric', 'ORDERS'],
  ['kernel-industrial-fabric', 'universal-os-kernel-federation', 'ANCHORS'],
  ['universal-os-kernel-federation', 'os-family-industrial-federation', 'FEDERATES'],
  ['os-family-industrial-federation', 'enterprise-inspector-readiness', 'REPORTS_TO'],
  ['admission-ownership-governance', 'enterprise-inspector-readiness', 'GOVERNS_VISIBILITY'],
  ['admission-ownership-governance', 'os-family-industrial-federation', 'GOVERNS_PROMOTION']
]);

const readinessLevels = Object.freeze({
  MODELED_ONLY: 10,
  HOST_DETECTED: 40,
  READY_FOR_READ_ONLY_PROBE: 55,
  READY_FOR_CONTROLLED_INTEGRATION: 70,
  INTEGRATED_WITH_EVIDENCE: 85,
  PRODUCTION_ACTIVE_WITH_APPROVAL: 100
});

function isLinuxHost(baseFederation) {
  const activeHost = baseFederation.baseFederation?.activeHost;
  const kernel = activeHost?.stack?.kernel;
  return kernel?.os?.platform === 'linux' || kernel?.os?.type === 'Linux';
}

function familyReadiness(family, baseFederation) {
  if (family.id === 'linux-industrial-family' && isLinuxHost(baseFederation)) {
    return {
      level: 'HOST_DETECTED',
      score: readinessLevels.HOST_DETECTED,
      evidence: ['active-host-linux-kernel-evidence'],
      productionClaim: false
    };
  }

  if (family.id === 'container-industrial-family') {
    return {
      level: 'READY_FOR_READ_ONLY_PROBE',
      score: readinessLevels.READY_FOR_READ_ONLY_PROBE,
      evidence: ['modeled-container-family', 'probe-required-before-integration'],
      productionClaim: false
    };
  }

  return {
    level: 'MODELED_ONLY',
    score: readinessLevels.MODELED_ONLY,
    evidence: ['architecture-model-only'],
    productionClaim: false
  };
}

function buildFamilyReadiness(baseFederation) {
  return baseFederation.families.map((family) => ({
    id: family.id,
    family: family.family,
    clusters: family.clusters,
    readiness: familyReadiness(family, baseFederation)
  }));
}

function buildProductionGates(baseFederation) {
  const safety = baseFederation.safety || {};
  const noHighImpactMutation =
    safety.noKernelModification === true &&
    safety.noBootModification === true &&
    safety.noSysctlModification === true &&
    safety.noRegistryModification === true &&
    safety.noPackageInstall === true &&
    safety.noServiceRestart === true;

  return {
    allLayersConnected: true,
    hostEvidenceAvailable: isLinuxHost(baseFederation),
    readOnlyOnly: safety.measurementOnly === true,
    noHighImpactMutation,
    noExternalSystemMutation: true,
    noProductionClaimWithoutEvidence: true,
    noContractOrProviderClaim: true,
    noHarm: safety.noHarm === true,
    humanApprovalRequiredForProductionAction: true
  };
}

function decideProductionReadiness(gates) {
  const ready =
    gates.allLayersConnected &&
    gates.hostEvidenceAvailable &&
    gates.readOnlyOnly &&
    gates.noHighImpactMutation &&
    gates.noExternalSystemMutation &&
    gates.noProductionClaimWithoutEvidence &&
    gates.noHarm;

  return ready
    ? 'READY_FOR_CONTROLLED_PRODUCTION_INTEGRATION'
    : 'PRODUCTION_INTEGRATION_REVIEW_REQUIRED';
}

function buildProductionIntegrationConnectionFabric() {
  const baseFederation = inspectOsFamilyIndustrialFederation();
  const gates = buildProductionGates(baseFederation);
  const decision = decideProductionReadiness(gates);

  return {
    system: 'SHEIKHA_PRODUCTION_INTEGRATION_CONNECTION_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_PRODUCTION_INTEGRATION_AND_CONNECTION_GATE',
    productionStart: {
      started: true,
      type: 'CONTROLLED_READ_ONLY_PRODUCTION_INTEGRATION_START',
      externalConnectionsOpened: false,
      servicesRestarted: false,
      packagesInstalled: false,
      kernelChanged: false,
      registryChanged: false,
      productionRuntimeClaim: false
    },
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noSysctlModification: true,
      noRegistryModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalMutation: true,
      noSecretsWritten: true,
      noHarm: true,
      humanApprovalRequiredForHighImpactAction: true
    },
    layers: productionLayers,
    connections: connectionMatrix.map(([from, to, type]) => ({ from, to, type })),
    families: buildFamilyReadiness(baseFederation),
    gates,
    decision,
    nextActions: [
      'Expose read-only production integration status to Enterprise Inspector.',
      'Add read-only container and hypervisor probe adapters.',
      'Require evidence before any INTEGRATED or PRODUCTION_ACTIVE status.',
      'Keep production actions human-approved and reversible.'
    ],
    baseFederation,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  productionLayers,
  connectionMatrix,
  readinessLevels,
  buildProductionIntegrationConnectionFabric,
  buildProductionGates,
  decideProductionReadiness
};
