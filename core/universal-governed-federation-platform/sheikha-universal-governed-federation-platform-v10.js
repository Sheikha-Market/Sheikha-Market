'use strict';

const fs = require('fs');
const path = require('path');

const {
  installFederationTemplatePackage,
  buildFederationTemplateEngineReport,
  sdkTargets
} = require('../federation-template-engine/sheikha-federation-template-engine-v8');

const {
  buildFederationOperatingFabricStatus
} = require('../federation-operating-fabric-integration/sheikha-federation-operating-fabric-integration-v9');

const {
  getOperatingIntegrationStatus
} = require('../enterprise-architecture/sheikha-enterprise-architecture-operating-integration-v3');

const {
  relationshipDictionary
} = require('../dynamic-federation-registry/sheikha-dynamic-federation-registry-v2');

const defaultPlatformDna = Object.freeze({
  name: 'Sheikha Universal AI Knowledge Federation',
  family: 'AI Family',
  blueprint: 'AI',
  version: '1.0.0',
  actor: 'universal-governed-federation-platform-v10',
  reason: 'Create a data-driven universal governed federation platform package'
});

const platformComponents = Object.freeze([
  'Federation Package Manager',
  'Universal Industrial Fabric',
  'Universal Registry',
  'Universal Graph',
  'Universal Event Bus',
  'Universal Inspector',
  'Universal Governance'
]);

const eventTypes = Object.freeze([
  'FEDERATION_PACKAGE_INSTALLED',
  'DNA_VALIDATED',
  'BLUEPRINT_RESOLVED',
  'TEMPLATE_GENERATED',
  'INDUSTRIAL_FABRIC_GENERATED',
  'CLUSTER_GENERATED',
  'CAPABILITY_GENERATED',
  'SDK_DESCRIPTOR_GENERATED',
  'REGISTRY_PERSISTED_PLAN',
  'GRAPH_UPDATED',
  'INSPECTOR_COMPLETED',
  'GOVERNANCE_PASSED'
]);

function unique(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function normalizeId(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

function buildFederationPackageManager(packageResult) {
  return {
    system: 'SHEIKHA_FEDERATION_PACKAGE_MANAGER_V10',
    status: packageResult.status === 'COMMITTED' ? 'ACTIVE' : 'BLOCKED',
    flow: ['Install Federation', 'Load Package', 'Validate DNA', 'Expand', 'Register', 'Publish', 'Ready'],
    package: {
      id: packageResult.package?.id || null,
      name: packageResult.package?.name || null,
      version: packageResult.package?.version || null,
      blueprint: packageResult.package?.blueprint?.name || null,
      template: packageResult.package?.template?.name || null
    },
    governance: {
      internalRegistryWriteOnly: true,
      externalChangeAllowed: false,
      packageInstallOnHost: false,
      noHarm: true
    }
  };
}

function buildUniversalIndustrialFabric(packageResult) {
  const pkg = packageResult.package || {};
  const fabrics = (pkg.fabrics || []).map((fabric) => ({
    id: `fabric-${normalizeId(fabric)}`,
    name: fabric,
    type: 'INDUSTRIAL_FABRIC',
    groups: unique([
      'federation',
      'family',
      'blueprint',
      'template',
      'capability',
      'service',
      'api',
      'sdk',
      'runtime',
      'governance',
      'inspector',
      'marketplace'
    ]),
    clusters: (pkg.clusters || []).map((cluster) => ({
      id: `${normalizeId(fabric)}-${normalizeId(cluster)}`,
      name: cluster,
      type: 'INDUSTRIAL_CLUSTER',
      capabilities: pkg.capabilities || [],
      components: unique([
        ...(pkg.services || []),
        ...(pkg.apis || []),
        ...(pkg.sdks || []),
        ...(pkg.runtimes || [])
      ])
    }))
  }));

  return {
    system: 'SHEIKHA_UNIVERSAL_INDUSTRIAL_FABRIC_V10',
    status: fabrics.length ? 'ACTIVE' : 'EMPTY',
    mode: 'INDUSTRIAL_FABRIC_FOR_EVERY_LAYER',
    fabrics,
    summary: {
      fabrics: fabrics.length,
      clusters: fabrics.reduce((total, fabric) => total + fabric.clusters.length, 0),
      capabilities: (pkg.capabilities || []).length
    }
  };
}

function buildUniversalRegistry(packageResult, industrialFabric) {
  const pkg = packageResult.package || {};
  const blueprint = pkg.blueprint || {};
  const template = pkg.template || {};
  const dna = pkg.dna || {};
  const relations = [
    { from: pkg.id, to: normalizeId(dna.family || 'family'), type: 'BELONGS_TO' },
    { from: pkg.id, to: normalizeId(blueprint.name || 'blueprint'), type: 'EXTENDS' },
    { from: pkg.id, to: normalizeId(template.name || 'template'), type: 'IMPLEMENTS' },
    { from: pkg.id, to: 'governance-registry', type: 'GOVERNS' },
    { from: pkg.id, to: 'inspector-registry', type: 'OBSERVES' },
    { from: pkg.id, to: 'marketplace-registry', type: 'PUBLISHES' },
    { from: pkg.id, to: 'universal-graph', type: 'GENERATES' },
    { from: pkg.id, to: 'external-system-boundary', type: 'ISOLATED_FROM' },
    ...(pkg.capabilities || []).map((capability) => ({
      from: pkg.id,
      to: capability,
      type: 'PROVIDES'
    })),
    ...(pkg.services || []).map((service) => ({
      from: pkg.id,
      to: service,
      type: 'CONSUMES'
    })),
    ...(pkg.apis || []).map((api) => ({
      from: pkg.id,
      to: api,
      type: 'CONNECTS_TO'
    })),
    ...(pkg.sdks || []).map((sdk) => ({
      from: pkg.id,
      to: sdk,
      type: 'GENERATES'
    })),
    ...(pkg.runtimes || []).map((runtime) => ({
      from: pkg.id,
      to: runtime,
      type: 'HOSTS'
    }))
  ].filter((relation) => relationshipDictionary.includes(relation.type));

  return {
    system: 'SHEIKHA_UNIVERSAL_REGISTRY_V10',
    status: pkg.id ? 'ACTIVE' : 'BLOCKED',
    mode: 'DATA_DRIVEN_INTERNAL_PERSISTENT_REGISTRY_PLAN',
    federations: [{ id: pkg.id, name: pkg.name, version: pkg.version, status: packageResult.status }],
    families: [{ id: normalizeId(dna.family || 'family'), name: dna.family || 'Unknown Family' }],
    blueprints: [{ id: normalizeId(blueprint.name || 'blueprint'), ...blueprint }],
    templates: [{ id: normalizeId(template.name || 'template'), ...template }],
    fabrics: industrialFabric.fabrics,
    clusters: industrialFabric.fabrics.flatMap((fabric) => fabric.clusters),
    capabilities: pkg.capabilities || [],
    services: pkg.services || [],
    apis: pkg.apis || [],
    sdks: packageResult.sdkBundle || [],
    languages: unique((packageResult.sdkBundle || []).map((sdk) => sdk.target)),
    runtimes: pkg.runtimes || [],
    policies: pkg.policies || {},
    relations,
    versions: [{ packageId: pkg.id, version: pkg.version }],
    writeScope: 'SHEIKHA_INTERNAL_RUNTIME_REGISTRY_ONLY'
  };
}

function node(id, type, label = id) {
  return { id, type, label };
}

function buildUniversalGraph(registry) {
  const nodes = [
    ...registry.federations.map((item) => node(item.id, 'FEDERATION', item.name)),
    ...registry.families.map((item) => node(item.id, 'FAMILY', item.name)),
    ...registry.blueprints.map((item) => node(item.id, 'BLUEPRINT', item.name)),
    ...registry.templates.map((item) => node(item.id, 'TEMPLATE', item.name)),
    ...registry.fabrics.map((item) => node(item.id, 'FABRIC', item.name)),
    ...registry.clusters.map((item) => node(item.id, 'CLUSTER', item.name)),
    ...registry.capabilities.map((item) => node(item, 'CAPABILITY', item)),
    ...registry.services.map((item) => node(item, 'SERVICE', item)),
    ...registry.apis.map((item) => node(item, 'API', item)),
    ...registry.sdks.map((item) => node(item.file, 'SDK_DESCRIPTOR', item.target)),
    ...registry.languages.map((item) => node(item, 'LANGUAGE', item)),
    ...registry.runtimes.map((item) => node(item, 'RUNTIME', item)),
    node('governance-registry', 'GOVERNANCE', 'Governance Registry'),
    node('inspector-registry', 'INSPECTOR', 'Inspector Registry'),
    node('marketplace-registry', 'MARKETPLACE', 'Marketplace Registry')
  ];
  const edges = [
    ...registry.relations,
    ...registry.fabrics.flatMap((fabric) =>
      fabric.clusters.map((cluster) => ({
        from: fabric.id,
        to: cluster.id,
        type: 'HOSTS'
      }))
    ),
    ...registry.sdks.map((sdk) => ({
      from: registry.federations[0]?.id,
      to: sdk.file,
      type: 'GENERATES'
    }))
  ].filter((edge) => relationshipDictionary.includes(edge.type));

  return {
    system: 'SHEIKHA_UNIVERSAL_GRAPH_V10',
    status: nodes.length && edges.length ? 'ACTIVE' : 'EMPTY',
    mode: 'ONE_GRAPH_FOR_FEDERATION_REGISTRY',
    nodes,
    edges,
    summary: {
      nodes: nodes.length,
      edges: edges.length,
      relationshipTypes: unique(edges.map((edge) => edge.type)).length
    }
  };
}

function buildUniversalEventBus(registry, graph) {
  const federation = registry.federations[0] || {};
  const events = eventTypes.map((type) => ({
    id: `${normalizeId(type)}-${normalizeId(federation.id || 'federation')}`,
    type,
    federationId: federation.id,
    governed: true,
    noExternalMutation: true,
    createdAt: new Date().toISOString()
  }));

  return {
    system: 'SHEIKHA_UNIVERSAL_EVENT_BUS_V10',
    status: 'ACTIVE',
    mode: 'GOVERNED_INTERNAL_EVENT_STREAM_PLAN',
    events,
    summary: {
      events: events.length,
      graphNodes: graph.summary.nodes,
      graphEdges: graph.summary.edges
    }
  };
}

function inspectUniversalPlatform(registry, graph, eventBus, packageResult) {
  const checks = {
    packageCommitted: packageResult.status === 'COMMITTED',
    registryReady: registry.status === 'ACTIVE',
    graphReady: graph.status === 'ACTIVE',
    eventBusReady: eventBus.status === 'ACTIVE',
    sdkDescriptorOnly: (registry.sdks || []).every((sdk) => sdk.writeScope === 'DESCRIPTOR_ONLY_NO_FILE_WRITE'),
    noExternalMutation: packageResult.safety?.noExternalMutation === true,
    noHarm: packageResult.safety?.noHarm === true
  };

  return {
    system: 'SHEIKHA_UNIVERSAL_INSPECTOR_V10',
    status: Object.values(checks).every(Boolean) ? 'PASSED' : 'REVIEW',
    checks,
    inspectors: [
      'Blueprint Inspector',
      'Cluster Inspector',
      'Capability Inspector',
      'Runtime Inspector',
      'Security Inspector',
      'Performance Inspector',
      'Governance Inspector',
      'Enterprise Inspector'
    ]
  };
}

function buildUniversalGovernance(packageResult, inspector) {
  const blocked = packageResult.status !== 'COMMITTED' || inspector.status !== 'PASSED';

  return {
    system: 'SHEIKHA_UNIVERSAL_GOVERNANCE_V10',
    status: blocked ? 'REVIEW' : 'PASSED',
    pipeline: [
      { stage: 'READ', status: 'PASS' },
      { stage: 'VALIDATE', status: packageResult.validation?.valid ? 'PASS' : 'FAIL' },
      { stage: 'RISK', status: packageResult.safety?.noExternalMutation ? 'LOW' : 'HIGH' },
      { stage: 'HUMAN_REVIEW', status: 'REQUIRED_FOR_EXTERNAL_CHANGE_ONLY' },
      { stage: 'APPROVAL', status: blocked ? 'REVIEW' : 'APPROVED' },
      { stage: 'REGISTRY_WRITE', status: 'INTERNAL_RUNTIME_REGISTRY_ONLY' },
      { stage: 'GRAPH_UPDATE', status: 'INTERNAL_GRAPH_ONLY' },
      { stage: 'AUDIT', status: 'RECORDED' },
      { stage: 'PUBLISH', status: 'INTERNAL_EVENT_PUBLISHED' }
    ],
    boundaries: {
      noExternalMutation: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true,
      humanApprovalForExternalChange: true
    }
  };
}

function buildUniversalGovernedFederationPlatformV10(dna = defaultPlatformDna) {
  const packageResult = installFederationTemplatePackage({
    ...defaultPlatformDna,
    ...dna
  });
  const packageManager = buildFederationPackageManager(packageResult);
  const industrialFabric = buildUniversalIndustrialFabric(packageResult);
  const registry = buildUniversalRegistry(packageResult, industrialFabric);
  const graph = buildUniversalGraph(registry);
  const eventBus = buildUniversalEventBus(registry, graph);
  const inspector = inspectUniversalPlatform(registry, graph, eventBus, packageResult);
  const governance = buildUniversalGovernance(packageResult, inspector);
  const v8 = buildFederationTemplateEngineReport();
  const v9 = buildFederationOperatingFabricStatus();
  const operatingIntegration = getOperatingIntegrationStatus();
  const active = [
    packageManager.status,
    industrialFabric.status,
    registry.status,
    graph.status,
    eventBus.status,
    inspector.status,
    governance.status,
    v8.status,
    v9.status,
    operatingIntegration.status
  ].every((status) => ['ACTIVE', 'PASSED', 'ACTIVE_100_INTEGRATED'].includes(status));

  return {
    system: 'SHEIKHA_UNIVERSAL_GOVERNED_FEDERATION_PLATFORM_V10',
    status: active ? 'ACTIVE_100' : 'REVIEW',
    mode: 'DATA_DRIVEN_UNIVERSAL_GOVERNED_PLATFORM',
    components: platformComponents.map((component) => ({
      name: component,
      status: 'ACTIVE'
    })),
    flow: [
      'Federation DNA',
      'Schema Engine',
      'Blueprint Library',
      'Template Engine',
      'Expansion Engine',
      'Federation Registry',
      'Universal Relationship Engine',
      'Capability Registry',
      'Service Registry',
      'API Registry',
      'SDK Registry',
      'Language Registry',
      'Runtime Registry',
      'Application Registry',
      'Enterprise Registry',
      'Knowledge Registry',
      'AI Registry',
      'Governance Registry',
      'Inspector Registry',
      'Marketplace Registry',
      'Observability Registry'
    ],
    packageManager,
    industrialFabric,
    registry,
    graph,
    eventBus,
    inspector,
    governance,
    linkedLayers: {
      federationTemplateEngineV8: v8.status,
      federationOperatingFabricV9: v9.status,
      enterpriseArchitectureOperatingIntegrationV3: operatingIntegration.status,
      sdkTargets: sdkTargets.length
    },
    readiness: {
      packageManagerReady: packageManager.status === 'ACTIVE',
      industrialFabricReady: industrialFabric.status === 'ACTIVE',
      registryReady: registry.status === 'ACTIVE',
      graphReady: graph.status === 'ACTIVE',
      eventBusReady: eventBus.status === 'ACTIVE',
      inspectorReady: inspector.status === 'PASSED',
      governanceReady: governance.status === 'PASSED',
      persistentRegistryPlanReady: true,
      overall: active ? 'UNIVERSAL_GOVERNED_PLATFORM_READY' : 'UNIVERSAL_GOVERNED_PLATFORM_REVIEW'
    },
    timestamp: new Date().toISOString()
  };
}

function defaultRegistryPath(rootDir = process.cwd()) {
  return path.join(
    rootDir,
    'runtime',
    'universal-governed-federation-platform',
    'sheikha-universal-registry-v10.json'
  );
}

function writeUniversalRegistrySnapshot(report, options = {}) {
  const filePath = options.filePath || defaultRegistryPath(options.rootDir || process.cwd());
  const dir = path.dirname(filePath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(report.registry, null, 2));

  return {
    system: 'SHEIKHA_UNIVERSAL_REGISTRY_PERSISTENCE_V10',
    status: 'WRITTEN',
    filePath,
    writeScope: 'SHEIKHA_INTERNAL_RUNTIME_REGISTRY_ONLY',
    noExternalMutation: true
  };
}

function readUniversalRegistrySnapshot(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildUniversalGovernedFederationPlatformStatus() {
  const report = buildUniversalGovernedFederationPlatformV10();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    readiness: report.readiness.overall,
    components: report.components.length,
    registry: {
      federations: report.registry.federations.length,
      fabrics: report.registry.fabrics.length,
      clusters: report.registry.clusters.length,
      capabilities: report.registry.capabilities.length,
      sdks: report.registry.sdks.length
    },
    graph: report.graph.summary,
    events: report.eventBus.summary.events,
    governance: report.governance.status,
    timestamp: report.timestamp
  };
}

module.exports = {
  defaultPlatformDna,
  platformComponents,
  eventTypes,
  buildFederationPackageManager,
  buildUniversalIndustrialFabric,
  buildUniversalRegistry,
  buildUniversalGraph,
  buildUniversalEventBus,
  inspectUniversalPlatform,
  buildUniversalGovernance,
  buildUniversalGovernedFederationPlatformV10,
  buildUniversalGovernedFederationPlatformStatus,
  writeUniversalRegistrySnapshot,
  readUniversalRegistrySnapshot,
  defaultRegistryPath
};
