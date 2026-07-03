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
  {
    id: 'l00-physical-infrastructure',
    order: 0,
    name: 'Physical Infrastructure',
    arabicName: 'البنية الفيزيائية',
    fabric: 'datacenter-racks-power-cooling-network'
  },
  {
    id: 'l01-hardware-federation',
    order: 1,
    name: 'Hardware Federation',
    arabicName: 'اتحاد العتاد',
    fabric: 'cpu-memory-storage-pcie-devices'
  },
  {
    id: 'l02-device-federation',
    order: 2,
    name: 'Device Federation',
    arabicName: 'اتحاد الأجهزة',
    fabric: 'gpu-nic-disk-sensor-accelerator'
  },
  {
    id: 'l03-firmware-federation',
    order: 3,
    name: 'Firmware Federation',
    arabicName: 'اتحاد البرمجيات الثابتة',
    fabric: 'bios-uefi-tpm-secure-boot-read-only'
  },
  {
    id: 'l04-boot-federation',
    order: 4,
    name: 'Boot Federation',
    arabicName: 'اتحاد الإقلاع',
    fabric: 'boot-managers-loaders-read-only'
  },
  {
    id: 'l05-kernel-family-federation',
    order: 5,
    name: 'Kernel Family Federation',
    arabicName: 'اتحاد عائلات النواة',
    fabric: 'linux-nt-xnu-bsd-rtos'
  },
  {
    id: 'l06-operating-system-family-federation',
    order: 6,
    name: 'Operating System Family Federation',
    arabicName: 'اتحاد عائلات أنظمة التشغيل',
    fabric: 'linux-windows-apple-bsd-android-chromeos-unix'
  },
  {
    id: 'l07-virtualization-federation',
    order: 7,
    name: 'Virtualization Federation',
    arabicName: 'اتحاد الافتراضية',
    fabric: 'kvm-qemu-vmware-hyperv-xen-firecracker'
  },
  {
    id: 'l08-container-federation',
    order: 8,
    name: 'Container Federation',
    arabicName: 'اتحاد الحاويات',
    fabric: 'docker-containerd-crio-podman-lxc-kubernetes'
  },
  {
    id: 'l09-process-federation',
    order: 9,
    name: 'Process Federation',
    arabicName: 'اتحاد العمليات',
    fabric: 'pm2-systemd-launchd-windows-service-manager'
  },
  {
    id: 'l10-runtime-federation',
    order: 10,
    name: 'Runtime Federation',
    arabicName: 'اتحاد بيئات التشغيل',
    fabric: 'node-python-java-dotnet-php-go-rust-ruby-perl-lua'
  },
  {
    id: 'l11-application-federation',
    order: 11,
    name: 'Application Federation',
    arabicName: 'اتحاد التطبيقات',
    fabric: 'sheikha-runtime-marketplace-erp-crm-scm-ai-services'
  },
  {
    id: 'l12-ai-knowledge-federation',
    order: 12,
    name: 'AI & Knowledge Federation Fabric',
    arabicName: 'اتحاد الذكاء والمعرفة',
    fabric: 'knowledge-graph-ontology-rag-vector-search-memory'
  },
  {
    id: 'l13-governance-federation',
    order: 13,
    name: 'Governance Federation Fabric',
    arabicName: 'اتحاد الحوكمة',
    fabric: 'admission-inspector-policy-audit-compliance-evidence-risk'
  },
  {
    id: 'l14-enterprise-federation',
    order: 14,
    name: 'Enterprise Federation Fabric',
    arabicName: 'اتحاد المؤسسة',
    fabric: 'organizations-departments-projects-workspaces-identity-rbac-tenants'
  },
  {
    id: 'l15-global-sovereign-federation',
    order: 15,
    name: 'Global Sovereign Federation Fabric',
    arabicName: 'الاتحاد العالمي الحاكم',
    fabric: 'control-plane-registry-capability-event-observability-scheduling-integration'
  }
]);

const kernelFamilies = Object.freeze([
  {
    id: 'linux-kernel-federation',
    layer: 'l05-kernel-family-federation',
    name: 'Linux Kernel Federation',
    members: ['Ubuntu', 'Debian', 'Fedora', 'Arch', 'Android', 'Pop!_OS'],
    clusters: ['scheduler', 'memory-manager', 'filesystem', 'network-stack', 'security', 'drivers', 'ipc']
  },
  {
    id: 'windows-nt-federation',
    layer: 'l05-kernel-family-federation',
    name: 'Windows NT Federation',
    members: ['Windows 10', 'Windows 11', 'Windows Server'],
    clusters: ['nt-kernel', 'registry-observation', 'service-control', 'security', 'drivers']
  },
  {
    id: 'apple-xnu-federation',
    layer: 'l05-kernel-family-federation',
    name: 'Apple XNU Federation',
    members: ['macOS', 'iOS', 'iPadOS', 'watchOS', 'tvOS'],
    clusters: ['xnu', 'darwin', 'sandbox', 'driverkit', 'apple-silicon']
  },
  {
    id: 'bsd-federation',
    layer: 'l05-kernel-family-federation',
    name: 'BSD Federation',
    members: ['FreeBSD', 'OpenBSD', 'NetBSD'],
    clusters: ['bsd-kernel', 'userland', 'networking', 'security', 'filesystem']
  },
  {
    id: 'rtos-federation',
    layer: 'l05-kernel-family-federation',
    name: 'RTOS Federation',
    members: ['Zephyr', 'FreeRTOS', 'VxWorks', 'QNX'],
    clusters: ['real-time-scheduler', 'embedded-memory', 'deterministic-io', 'safety-profile']
  }
]);

const platformDomains = Object.freeze([
  {
    layer: 'l06-operating-system-family-federation',
    domains: ['linux-family', 'windows-family', 'apple-family', 'bsd-family', 'chromeos', 'android', 'embedded-linux', 'unix']
  },
  {
    layer: 'l07-virtualization-federation',
    domains: ['kvm', 'qemu', 'vmware', 'hyper-v', 'virtualbox', 'xen', 'firecracker', 'cloud-hypervisor']
  },
  {
    layer: 'l08-container-federation',
    domains: ['docker', 'containerd', 'cri-o', 'podman', 'lxc', 'lxd', 'kubernetes', 'openshift', 'nomad']
  },
  {
    layer: 'l10-runtime-federation',
    domains: ['nodejs', 'python', 'java', 'dotnet', 'php', 'go', 'rust', 'ruby', 'perl', 'lua']
  },
  {
    layer: 'l11-application-federation',
    domains: ['sheikha-runtime', 'marketplace', 'knowledge', 'erp', 'crm', 'scm', 'ai-services', 'analytics']
  },
  {
    layer: 'l12-ai-knowledge-federation',
    domains: ['knowledge-graph', 'ontology', 'semantic-engine', 'reasoning-engine', 'vector-index', 'rag', 'search', 'memory']
  },
  {
    layer: 'l13-governance-federation',
    domains: ['admission', 'inspector', 'policy', 'audit', 'compliance', 'security', 'evidence', 'risk', 'human-review']
  },
  {
    layer: 'l14-enterprise-federation',
    domains: ['organizations', 'departments', 'business-units', 'projects', 'workspaces', 'users', 'identity', 'rbac', 'tenants']
  },
  {
    layer: 'l15-global-sovereign-federation',
    domains: ['control-plane', 'registry', 'capability-fabric', 'event-fabric', 'observability-fabric', 'scheduling-fabric', 'automation-fabric', 'integration-fabric']
  }
]);

function toTitle(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function createNode(id, label, type, layer, metadata = {}) {
  return {
    id,
    label,
    type,
    layer,
    metadata
  };
}

function createEdge(from, to, type, metadata = {}) {
  return {
    from,
    to,
    type,
    metadata
  };
}

function buildLayerNodes() {
  return federatedLayers.map((layer) => createNode(
    layer.id,
    layer.name,
    'FEDERATION_LAYER',
    layer.id,
    {
      order: layer.order,
      arabicName: layer.arabicName,
      fabric: layer.fabric
    }
  ));
}

function buildKernelFamilyNodes() {
  return kernelFamilies.map((family) => createNode(
    family.id,
    family.name,
    'KERNEL_FAMILY_FEDERATION',
    family.layer,
    {
      members: family.members,
      clusters: family.clusters
    }
  ));
}

function buildDomainNodes() {
  return platformDomains.flatMap((group) => group.domains.map((domain) => createNode(
    domain,
    toTitle(domain),
    'FEDERATED_DOMAIN',
    group.layer,
    {
      source: 'SHEIKHA_FEDERATED_SYSTEM_GRAPH_V2'
    }
  )));
}

function buildLayerEdges() {
  const edges = [];

  for (let index = 0; index < federatedLayers.length - 1; index += 1) {
    const lower = federatedLayers[index];
    const upper = federatedLayers[index + 1];

    edges.push(createEdge(lower.id, upper.id, 'PROVIDES', {
      mode: 'directed-foundation'
    }));
    edges.push(createEdge(upper.id, lower.id, 'DEPENDS_ON', {
      mode: 'directed-dependency'
    }));
  }

  return edges;
}

function buildKernelFamilyEdges() {
  return kernelFamilies.flatMap((family) => [
    createEdge('l05-kernel-family-federation', family.id, 'FEDERATES_WITH', {
      family: family.name
    }),
    createEdge(family.id, 'l06-operating-system-family-federation', 'PROVIDES', {
      scope: 'kernel-capability-to-os-family'
    }),
    createEdge('l13-governance-federation', family.id, 'GOVERNS', {
      scope: 'kernel-family-promotion'
    })
  ]);
}

function buildDomainEdges() {
  return platformDomains.flatMap((group) => group.domains.flatMap((domain) => [
    createEdge(group.layer, domain, 'FEDERATES_WITH', {
      domain
    }),
    createEdge(domain, group.layer, 'REPORTS_TO', {
      scope: 'domain-to-layer'
    }),
    createEdge('l13-governance-federation', domain, 'GOVERNS', {
      scope: 'domain-governance'
    })
  ]));
}

function buildCrossLayerEdges() {
  const governedLayers = federatedLayers
    .filter((layer) => layer.id !== 'l13-governance-federation')
    .map((layer) => createEdge('l13-governance-federation', layer.id, 'GOVERNS', {
      scope: 'global-policy'
    }));

  const observedLayers = federatedLayers
    .filter((layer) => layer.id !== 'l15-global-sovereign-federation')
    .map((layer) => createEdge('l15-global-sovereign-federation', layer.id, 'OBSERVES', {
      scope: 'global-control-plane-observability'
    }));

  return [
    ...governedLayers,
    ...observedLayers,
    createEdge('l13-governance-federation', 'l12-ai-knowledge-federation', 'SECURES', {
      scope: 'ai-knowledge-policy'
    }),
    createEdge('l12-ai-knowledge-federation', 'l11-application-federation', 'USES', {
      scope: 'knowledge-augmented-applications'
    }),
    createEdge('l06-operating-system-family-federation', 'l09-process-federation', 'HOSTS', {
      scope: 'operating-system-hosts-process-management'
    }),
    createEdge('l08-container-federation', 'l07-virtualization-federation', 'INTEROPERATES_WITH', {
      scope: 'container-vm-interoperability'
    }),
    createEdge('l09-process-federation', 'l08-container-federation', 'ISOLATES', {
      scope: 'process-and-container-isolation'
    }),
    createEdge('l15-global-sovereign-federation', 'l14-enterprise-federation', 'FEDERATES_WITH', {
      scope: 'global-to-enterprise-control'
    }),
    createEdge('l14-enterprise-federation', 'l13-governance-federation', 'REPORTS_TO', {
      scope: 'enterprise-governance-accountability'
    }),
    createEdge('l15-global-sovereign-federation', 'l13-governance-federation', 'MEASURES', {
      scope: 'governance-metrics'
    })
  ];
}

function buildGraph() {
  const nodes = [
    ...buildLayerNodes(),
    ...buildKernelFamilyNodes(),
    ...buildDomainNodes()
  ];

  const edges = [
    ...buildLayerEdges(),
    ...buildKernelFamilyEdges(),
    ...buildDomainEdges(),
    ...buildCrossLayerEdges()
  ];

  return {
    nodes,
    edges
  };
}

function validateDirectedGraph(graph) {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const orphanEdges = graph.edges.filter((edge) => (
    !nodeIds.has(edge.from) || !nodeIds.has(edge.to)
  ));
  const usedRelationTypes = new Set(graph.edges.map((edge) => edge.type));
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
    nodeCount: nodes.filter((node) => node.layer === layer.id).length
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

module.exports = {
  relationTypes,
  federatedLayers,
  kernelFamilies,
  platformDomains,
  buildFederatedSystemGraphV2,
  validateDirectedGraph
};
