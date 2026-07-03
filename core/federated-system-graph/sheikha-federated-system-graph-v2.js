'use strict';

const {
  inspectGlobalEnterpriseOperatingFabric
} = require('../global-enterprise-operating-fabric/sheikha-global-enterprise-operating-fabric-v1');

const relationTypes = Object.freeze([
  'DEPENDS_ON',
  'HOSTS',
  'PROVIDES',
  'USES',
  'OBSERVES',
  'MEASURES',
  'INTEROPERATES_WITH',
  'FEDERATES_WITH',
  'GOVERNS',
  'REPORTS_TO',
  'SECURES',
  'ISOLATES'
]);

const federatedDomains = Object.freeze([
  { id: 'hardware-federation', layer: 'L01', clusters: ['cpu', 'memory', 'storage', 'network', 'devices'] },
  { id: 'firmware-federation', layer: 'L02', clusters: ['bios', 'uefi', 'tpm', 'secure-boot'] },
  { id: 'boot-federation', layer: 'L03', clusters: ['grub', 'systemd-boot', 'windows-boot-manager', 'apple-boot'] },
  { id: 'kernel-family-federation', layer: 'L04', clusters: ['linux', 'windows-nt', 'apple-xnu', 'bsd', 'rtos'] },
  { id: 'operating-system-federation', layer: 'L05', clusters: ['linux', 'windows', 'macos', 'android', 'ios', 'bsd', 'chromeos'] },
  { id: 'runtime-federation', layer: 'L06', clusters: ['nodejs', 'python', 'java', 'dotnet', 'php', 'go', 'rust', 'ruby'] },
  { id: 'process-federation', layer: 'L07', clusters: ['pm2', 'systemd', 'launchd', 'windows-service-manager'] },
  { id: 'container-federation', layer: 'L08', clusters: ['docker', 'containerd', 'podman', 'kubernetes', 'openshift'] },
  { id: 'virtualization-federation', layer: 'L09', clusters: ['kvm', 'qemu', 'vmware', 'hyper-v', 'virtualbox', 'firecracker'] },
  { id: 'application-federation', layer: 'L10', clusters: ['sheikha-runtime', 'marketplace', 'product-knowledge', 'api-services'] },
  { id: 'ai-federation', layer: 'L11', clusters: ['models', 'rag', 'agents', 'vector-index', 'inference'] },
  { id: 'knowledge-federation', layer: 'L12', clusters: ['knowledge-graph', 'ontology', 'semantic-engine', 'search', 'memory'] },
  { id: 'governance-federation', layer: 'L13', clusters: ['admission', 'inspector', 'policy', 'audit', 'risk', 'human-review'] },
  { id: 'enterprise-federation', layer: 'L14', clusters: ['organizations', 'tenants', 'projects', 'workspaces', 'rbac'] },
  { id: 'global-federation', layer: 'L15', clusters: ['control-plane', 'registry', 'capability-fabric', 'event-fabric', 'observability'] }
]);

const graphEdges = Object.freeze([
  ['hardware-federation', 'firmware-federation', 'PROVIDES'],
  ['firmware-federation', 'boot-federation', 'PROVIDES'],
  ['boot-federation', 'kernel-family-federation', 'HOSTS'],
  ['kernel-family-federation', 'operating-system-federation', 'PROVIDES'],
  ['operating-system-federation', 'runtime-federation', 'HOSTS'],
  ['runtime-federation', 'process-federation', 'USES'],
  ['process-federation', 'application-federation', 'HOSTS'],
  ['operating-system-federation', 'container-federation', 'HOSTS'],
  ['hardware-federation', 'virtualization-federation', 'PROVIDES'],
  ['virtualization-federation', 'operating-system-federation', 'HOSTS'],
  ['application-federation', 'ai-federation', 'USES'],
  ['ai-federation', 'knowledge-federation', 'USES'],
  ['knowledge-federation', 'governance-federation', 'REPORTS_TO'],
  ['governance-federation', 'enterprise-federation', 'GOVERNS'],
  ['enterprise-federation', 'global-federation', 'FEDERATES_WITH'],
  ['global-federation', 'governance-federation', 'GOVERNS']
]);

function buildFederatedSystemGraph() {
  return {
    system: 'SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2',
    status: 'ACTIVE',
    mode: 'READ_ONLY_FEDERATED_SYSTEM_GRAPH',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noRegistryModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true,
      measurementOnly: true,
      humanReviewRequired: true
    },
    relationTypes,
    domains: federatedDomains,
    nodes: federatedDomains.map((domain) => ({
      id: domain.id,
      layer: domain.layer,
      type: 'FEDERATED_INDUSTRIAL_DOMAIN',
      clusters: domain.clusters
    })),
    edges: graphEdges.map(([from, to, type]) => ({ from, to, type })),
    baseOperatingFabric: inspectGlobalEnterpriseOperatingFabric()
  };
}

module.exports = {
  relationTypes,
  federatedDomains,
  graphEdges,
  buildFederatedSystemGraph
};
