'use strict';

const {
  buildFederatedSystemGraph
} = require('../federated-system-graph/sheikha-federated-system-graph-v2');

const closureLayers = Object.freeze([
  { id: 'l16-federation-of-federations', name: 'Federation of Federations', scope: 'all-domain-federations' },
  { id: 'l17-platform-federation', name: 'Platform Federation', scope: 'sdk-toolchains-package-managers-runtimes' },
  { id: 'l18-infrastructure-federation', name: 'Infrastructure Federation', scope: 'physical-vm-container-edge-cloud-iot' },
  { id: 'l19-enterprise-federation', name: 'Enterprise Federation', scope: 'organizations-departments-projects-identity-rbac' },
  { id: 'l20-knowledge-federation', name: 'Knowledge Federation', scope: 'engineering-business-security-legal-ai-industrial' },
  { id: 'l21-ai-federation', name: 'AI Federation', scope: 'models-agents-tools-mcp-rag-memory-evaluation' },
  { id: 'l22-governance-federation', name: 'Governance Federation', scope: 'admission-inspector-policy-risk-audit-human-review' },
  { id: 'l23-global-integration-federation', name: 'Global Integration Federation', scope: 'control-plane-registry-capability-event-observability' }
]);

const federationFamilies = Object.freeze([
  {
    id: 'linux-federation',
    parent: 'l16-federation-of-federations',
    families: ['debian-family', 'ubuntu-family', 'redhat-family', 'suse-family', 'arch-family', 'android-family', 'embedded-linux-family']
  },
  {
    id: 'windows-federation',
    parent: 'l16-federation-of-federations',
    families: ['desktop-family', 'server-family', 'azure-stack-family', 'hyper-v-family', 'wsl-family', 'iot-family']
  },
  {
    id: 'apple-federation',
    parent: 'l16-federation-of-federations',
    families: ['macos-family', 'ios-family', 'ipados-family', 'watchos-family', 'tvos-family', 'visionos-family']
  },
  {
    id: 'platform-federation',
    parent: 'l17-platform-federation',
    families: ['nodejs', 'python', 'java', 'dotnet', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin']
  },
  {
    id: 'infrastructure-federation',
    parent: 'l18-infrastructure-federation',
    families: ['physical-servers', 'virtual-machines', 'containers', 'edge', 'cloud', 'cluster', 'gpu-farms', 'storage', 'networking', 'iot']
  },
  {
    id: 'knowledge-domain-federation',
    parent: 'l20-knowledge-federation',
    families: ['engineering', 'business', 'security', 'legal', 'ai', 'industrial', 'education']
  },
  {
    id: 'ai-system-federation',
    parent: 'l21-ai-federation',
    families: ['models', 'agents', 'tools', 'mcp', 'rag', 'memory', 'planning', 'evaluation', 'guardrails']
  },
  {
    id: 'governance-system-federation',
    parent: 'l22-governance-federation',
    families: ['admission', 'inspector', 'policy', 'risk', 'compliance', 'ethics', 'audit', 'monitoring', 'human-review']
  }
]);

const closureRelations = Object.freeze([
  ['l15-global-federation', 'l16-federation-of-federations', 'EXTENDS_TO'],
  ['l16-federation-of-federations', 'l17-platform-federation', 'FEDERATES'],
  ['l17-platform-federation', 'l18-infrastructure-federation', 'RUNS_ON'],
  ['l18-infrastructure-federation', 'l19-enterprise-federation', 'SERVES'],
  ['l19-enterprise-federation', 'l20-knowledge-federation', 'USES'],
  ['l20-knowledge-federation', 'l21-ai-federation', 'SUPPORTS'],
  ['l21-ai-federation', 'l22-governance-federation', 'GOVERNED_BY'],
  ['l22-governance-federation', 'l23-global-integration-federation', 'REPORTS_TO'],
  ['l23-global-integration-federation', 'l16-federation-of-federations', 'GOVERNS']
]);

function inspectFederationClosure() {
  return {
    system: 'SHEIKHA_FEDERATION_OF_FEDERATIONS_CLOSURE_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_FEDERATION_CLOSURE_MAPPING',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noRegistryModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalMutation: true,
      noHarm: true,
      measurementOnly: true,
      humanReviewRequired: true
    },
    closureLayers,
    federationFamilies,
    relations: closureRelations.map(([from, to, type]) => ({ from, to, type })),
    baseGraph: buildFederatedSystemGraph(),
    closure: {
      architectureClosed: true,
      extensionModel: 'ADD_FEDERATION_OR_FAMILY_WITHOUT_REDESIGN',
      productionRuntimeClaim: false,
      highImpactActionAllowed: false,
      humanApprovalRequiredForPromotion: true
    }
  };
}

module.exports = {
  closureLayers,
  federationFamilies,
  closureRelations,
  inspectFederationClosure
};
