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
  'GOVERNS',
  'REPORTS_TO',
  'INTEROPERATES_WITH',
  'FEDERATES_WITH',
  'ISOLATES',
  'MEASURES',
  'SECURES'
]);

const federatedLayers = Object.freeze([
  ['l00-physical-infrastructure', 0, 'Physical Infrastructure', 'البنية الفيزيائية', 'datacenter-racks-power-cooling-network'],
  ['l01-hardware-federation', 1, 'Hardware Federation', 'اتحاد العتاد', 'cpu-memory-storage-pcie-devices'],
  ['l02-device-federation', 2, 'Device Federation', 'اتحاد الأجهزة', 'gpu-nic-disk-sensor-accelerator'],
  ['l03-firmware-federation', 3, 'Firmware Federation', 'اتحاد البرمجيات الثابتة', 'bios-uefi-tpm-secure-boot-read-only'],
  ['l04-boot-federation', 4, 'Boot Federation', 'اتحاد الإقلاع', 'boot-managers-loaders-read-only'],
  ['l05-kernel-family-federation', 5, 'Kernel Family Federation', 'اتحاد عائلات النواة', 'linux-nt-xnu-bsd-rtos'],
  ['l06-operating-system-family-federation', 6, 'Operating System Family Federation', 'اتحاد عائلات أنظمة التشغيل', 'linux-windows-apple-bsd-android-chromeos-unix'],
  ['l07-virtualization-federation', 7, 'Virtualization Federation', 'اتحاد الافتراضية', 'kvm-qemu-vmware-hyperv-xen-firecracker'],
  ['l08-container-federation', 8, 'Container Federation', 'اتحاد الحاويات', 'docker-containerd-crio-podman-lxc-kubernetes'],
  ['l09-process-federation', 9, 'Process Federation', 'اتحاد العمليات', 'pm2-systemd-launchd-windows-service-manager'],
  ['l10-runtime-federation', 10, 'Runtime Federation', 'اتحاد بيئات التشغيل', 'node-python-java-dotnet-php-go-rust-ruby-perl-lua'],
  ['l11-application-federation', 11, 'Application Federation', 'اتحاد التطبيقات', 'sheikha-runtime-marketplace-erp-crm-scm-ai-services'],
  ['l12-ai-knowledge-federation', 12, 'AI & Knowledge Federation Fabric', 'اتحاد الذكاء والمعرفة', 'knowledge-graph-ontology-rag-vector-search-memory'],
  ['l13-governance-federation', 13, 'Governance Federation Fabric', 'اتحاد الحوكمة', 'admission-inspector-policy-audit-compliance-evidence-risk'],
  ['l14-enterprise-federation', 14, 'Enterprise Federation Fabric', 'اتحاد المؤسسة', 'organizations-departments-projects-workspaces-identity-rbac-tenants'],
  ['l15-global-sovereign-federation', 15, 'Global Sovereign Federation Fabric', 'الاتحاد العالمي الحاكم', 'control-plane-registry-capability-event-observability-scheduling-integration']
].map(([id, order, name, arabicName, fabric]) => ({
  id,
  order,
  name,
  arabicName,
  fabric
})));

const kernelFamilies = Object.freeze([
  ['linux-kernel-federation', 'Linux Kernel Federation', ['Ubuntu', 'Debian', 'Fedora', 'Arch', 'Android', 'Pop!_OS'], ['scheduler', 'memory-manager', 'filesystem', 'network-stack', 'security', 'drivers', 'ipc']],
  ['windows-nt-federation', 'Windows NT Federation', ['Windows 10', 'Windows 11', 'Windows Server'], ['nt-kernel', 'registry-observation', 'service-control', 'security', 'drivers']],
  ['apple-xnu-federation', 'Apple XNU Federation', ['macOS', 'iOS', 'iPadOS', 'watchOS', 'tvOS'], ['xnu', 'darwin', 'sandbox', 'driverkit', 'apple-silicon']],
  ['bsd-federation', 'BSD Federation', ['FreeBSD', 'OpenBSD', 'NetBSD'], ['bsd-kernel', 'userland', 'networking', 'security', 'filesystem']],
  ['rtos-federation', 'RTOS Federation', ['Zephyr', 'FreeRTOS', 'VxWorks', 'QNX'], ['real-time-scheduler', 'embedded-memory', 'deterministic-io', 'safety-profile']]
].map(([id, name, members, clusters]) => ({
  id,
  layer: 'l05-kernel-family-federation',
  name,
  members,
  clusters
})));

const platformDomains = Object.freeze([
  ['l06-operating-system-family-federation', ['linux-family', 'windows-family', 'apple-family', 'bsd-family', 'chromeos', 'android', 'embedded-linux', 'unix']],
  ['l07-virtualization-federation', ['kvm', 'qemu', 'vmware', 'hyper-v', 'virtualbox', 'xen', 'firecracker', 'cloud-hypervisor']],
  ['l08-container-federation', ['docker', 'containerd', 'cri-o', 'podman', 'lxc', 'lxd', 'kubernetes', 'openshift', 'nomad']],
  ['l10-runtime-federation', ['nodejs', 'python', 'java', 'dotnet', 'php', 'go', 'rust', 'ruby', 'perl', 'lua']],
  ['l11-application-federation', ['sheikha-runtime', 'marketplace', 'knowledge', 'erp', 'crm', 'scm', 'ai-services', 'analytics']],
  ['l12-ai-knowledge-federation', ['knowledge-graph', 'ontology', 'semantic-engine', 'reasoning-engine', 'vector-index', 'rag', 'search', 'memory']],
  ['l13-governance-federation', ['admission', 'inspector', 'policy', 'audit', 'compliance', 'security', 'evidence', 'risk', 'human-review']],
  ['l14-enterprise-federation', ['organizations', 'departments', 'business-units', 'projects', 'workspaces', 'users', 'identity', 'rbac', 'tenants']],
  ['l15-global-sovereign-federation', ['control-plane', 'registry', 'capability-fabric', 'event-fabric', 'observability-fabric', 'scheduling-fabric', 'automation-fabric', 'integration-fabric']]
].map(([layer, domains]) => ({
  layer,
  domains
})));

function toTitle(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function node(id, label, type, layer, metadata = {}) {
  return { id, label, type, layer, metadata };
}

function edge(from, to, type, metadata = {}) {
  return { from, to, type, metadata };
}

function buildLayerNodes() {
  return federatedLayers.map((layer) => node(layer.id, layer.name, 'FEDERATION_LAYER', layer.id, {
    order: layer.order,
    arabicName: layer.arabicName,
    fabric: layer.fabric
  }));
}

function buildKernelNodes() {
  return kernelFamilies.map((family) => node(family.id, family.name, 'KERNEL_FAMILY_FEDERATION', family.layer, {
    members: family.members,
    clusters: family.clusters
  }));
}

function buildDomainNodes() {
  return platformDomains.flatMap((group) => group.domains.map((domain) => node(
    domain,
    toTitle(domain),
    'FEDERATED_DOMAIN',
    group.layer,
    { source: 'SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2' }
  )));
}

function buildLayerEdges() {
  return federatedLayers.slice(0, -1).flatMap((layer, index) => {
    const nextLayer = federatedLayers[index + 1];
    return [
      edge(layer.id, nextLayer.id, 'PROVIDES', { mode: 'directed-foundation' }),
      edge(nextLayer.id, layer.id, 'DEPENDS_ON', { mode: 'directed-dependency' })
    ];
  });
}

function buildKernelEdges() {
  return kernelFamilies.flatMap((family) => [
    edge('l05-kernel-family-federation', family.id, 'FEDERATES_WITH', { family: family.name }),
    edge(family.id, 'l06-operating-system-family-federation', 'PROVIDES', { scope: 'kernel-to-os-family' }),
    edge('l13-governance-federation', family.id, 'GOVERNS', { scope: 'kernel-family-promotion' })
  ]);
}

function buildDomainEdges() {
  return platformDomains.flatMap((group) => group.domains.flatMap((domain) => [
    edge(group.layer, domain, 'FEDERATES_WITH', { domain }),
    edge(domain, group.layer, 'REPORTS_TO', { scope: 'domain-to-layer' }),
    edge('l13-governance-federation', domain, 'GOVERNS', { scope: 'domain-governance' })
  ]));
}

function buildCrossLayerEdges() {
  const governed = federatedLayers
    .filter((layer) => layer.id !== 'l13-governance-federation')
    .map((layer) => edge('l13-governance-federation', layer.id, 'GOVERNS', { scope: 'global-policy' }));

  const observed = federatedLayers
    .filter((layer) => layer.id !== 'l15-global-sovereign-federation')
    .map((layer) => edge('l15-global-sovereign-federation', layer.id, 'OBSERVES', {
      scope: 'global-control-plane-observability'
    }));

  return [
    ...governed,
    ...observed,
    edge('l13-governance-federation', 'l12-ai-knowledge-federation', 'SECURES', { scope: 'ai-policy' }),
    edge('l12-ai-knowledge-federation', 'l11-application-federation', 'USES', { scope: 'knowledge-augmented-apps' }),
    edge('l06-operating-system-family-federation', 'l09-process-federation', 'HOSTS', { scope: 'os-hosts-processes' }),
    edge('l08-container-federation', 'l07-virtualization-federation', 'INTEROPERATES_WITH', { scope: 'container-vm' }),
    edge('l09-process-federation', 'l08-container-federation', 'ISOLATES', { scope: 'process-container-isolation' }),
    edge('l15-global-sovereign-federation', 'l14-enterprise-federation', 'FEDERATES_WITH', { scope: 'global-enterprise' }),
    edge('l14-enterprise-federation', 'l13-governance-federation', 'REPORTS_TO', { scope: 'accountability' }),
    edge('l15-global-sovereign-federation', 'l13-governance-federation', 'MEASURES', { scope: 'governance-metrics' })
  ];
}

function buildGraph() {
  return {
    nodes: [
      ...buildLayerNodes(),
      ...buildKernelNodes(),
      ...buildDomainNodes()
    ],
    edges: [
      ...buildLayerEdges(),
      ...buildKernelEdges(),
      ...buildDomainEdges(),
      ...buildCrossLayerEdges()
    ]
  };
}

function validateDirectedGraph(graph) {
  const nodeIds = new Set(graph.nodes.map((graphNode) => graphNode.id));
  const orphanEdges = graph.edges.filter((graphEdge) => (
    !nodeIds.has(graphEdge.from) || !nodeIds.has(graphEdge.to)
  ));
  const usedRelationTypes = new Set(graph.edges.map((graphEdge) => graphEdge.type));
  const missingRelationTypes = relationTypes.filter((type) => !usedRelationTypes.has(type));

  return {
    valid: orphanEdges.length === 0 && missingRelationTypes.length === 0,
    orphanEdges,
    usedRelationTypes: Array.from(usedRelationTypes).sort(),
    missingRelationTypes
  };
}

function summarizeByLayer(nodes) {
  return federatedLayers.map((layer) => ({
    layer: layer.id,
    name: layer.name,
    nodeCount: nodes.filter((graphNode) => graphNode.layer === layer.id).length
  }));
}

function buildFederatedSystemGraphV2() {
  const sourceFabric = inspectGlobalEnterpriseOperatingFabric();
  const graph = buildGraph();
  const validation = validateDirectedGraph(graph);

  return {
    system: 'SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2',
    status: validation.valid ? 'ACTIVE' : 'REVIEW_REQUIRED',
    mode: 'READ_ONLY_DIRECTED_FEDERATED_SYSTEM_GRAPH',
    purpose: 'Unify Sheikha federated fabrics into one directed system graph for safe extension, querying, governance, and integration planning.',
    relationTypes,
    layers: federatedLayers,
    graph,
    validation,
    summary: {
      layerCount: federatedLayers.length,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      kernelFamilyCount: kernelFamilies.length,
      relationTypeCount: relationTypes.length,
      nodesByLayer: summarizeByLayer(graph.nodes)
    },
    sourceFabrics: {
      globalEnterpriseOperatingFabric: {
        system: sourceFabric.system,
        status: sourceFabric.status,
        mode: sourceFabric.mode,
        closure: sourceFabric.closure
      },
      productionIntegration: {
        system: sourceFabric.productionIntegration.system,
        status: sourceFabric.productionIntegration.status,
        decision: sourceFabric.productionIntegration.decision,
        gates: sourceFabric.productionIntegration.gates
      },
      osFamilyFederation: {
        system: sourceFabric.osFamilyFederation.system,
        status: sourceFabric.osFamilyFederation.status,
        familyCount: sourceFabric.osFamilyFederation.families.length
      }
    },
    readiness: {
      directedGraphReady: validation.valid,
      allRelationTypesCovered: validation.missingRelationTypes.length === 0,
      globalClosureReady: sourceFabric.closure.architectureClosed === true,
      productionIntegrationReady:
        sourceFabric.productionIntegration.decision === 'READY_FOR_CONTROLLED_PRODUCTION_INTEGRATION',
      extensionWithoutRedesignReady:
        sourceFabric.closure.extensionModel === 'ADD_NEW_FAMILY_WITHOUT_REDESIGN',
      overall: validation.valid
        ? 'FEDERATED_SYSTEM_GRAPH_V2_READY'
        : 'FEDERATED_SYSTEM_GRAPH_V2_REVIEW_REQUIRED'
    },
    governance: {
      readOnly: true,
      measurementOnly: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noRegistryModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalConnectionOpened: true,
      noRuntimeClaimWithoutEvidence: true,
      noHighImpactActionAllowed: true,
      humanReviewRequiredForPromotion: true,
      noHarm: true,
      tawhid: 'الله وحده لا شريك له'
    },
    nextActions: [
      'Expose graph summary to Enterprise Inspector as read-only architecture evidence.',
      'Use graph nodes as the source of truth before adding any new fabric.',
      'Require evidence-backed adapters before marking any domain as production active.',
      'Add query helpers for impact analysis, dependency tracing, and governance coverage.'
    ],
    timestamp: new Date().toISOString()
  };
}

function buildFederatedSystemGraph() {
  return buildFederatedSystemGraphV2();
}

module.exports = {
  relationTypes,
  federatedLayers,
  kernelFamilies,
  platformDomains,
  buildFederatedSystemGraph,
  buildFederatedSystemGraphV2,
  validateDirectedGraph
};
