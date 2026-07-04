'use strict';

const {
  buildKnowledgeGraphFromTemplate
} = require('../universal-knowledge-graph/sheikha-universal-knowledge-graph-v9');

const {
  buildRuntimeHealthReport
} = require('../runtime-health/sheikha-runtime-health-engine-v1');

const {
  buildGovernedFederationActivationPlan
} = require('../governed-federation-activation-gate/sheikha-governed-federation-activation-gate-v12');

const defaultLivingFederationDna = Object.freeze({
  name: 'Sheikha Living PostgreSQL Federation',
  family: 'PostgreSQL Family',
  blueprint: 'PostgreSQL',
  version: '1.0.0',
  actor: 'living-federation-operating-system-v13',
  reason: 'Activate governed living federation operating cycle'
});

const lifecycleStates = Object.freeze([
  'REGISTERED',
  'BLUEPRINT_RESOLVED',
  'KNOWLEDGE_GRAPH_BUILT',
  'RUNTIME_STATE_CREATED',
  'DEPENDENCIES_RESOLVED',
  'EVENTS_PUBLISHED_INTERNALLY',
  'HEALTH_EVALUATED',
  'MARKETPLACE_INDEXED',
  'GOVERNANCE_PASSED',
  'GOVERNED_READY'
]);

const eventTypes = Object.freeze([
  'FEDERATION_CREATED',
  'BLUEPRINT_RESOLVED',
  'KNOWLEDGE_GRAPH_BUILT',
  'RUNTIME_STATE_CREATED',
  'DEPENDENCIES_RESOLVED',
  'HEALTH_EVALUATED',
  'CAPABILITY_INDEXED',
  'SERVICES_REGISTERED',
  'SDKS_REGISTERED',
  'LANGUAGES_REGISTERED',
  'AI_FEDERATION_LINKED',
  'ENTERPRISE_FEDERATION_LINKED',
  'GOVERNANCE_PASSED',
  'AUDIT_RECORDED'
]);

const sdkTargets = Object.freeze([
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'php',
  'csharp',
  'swift',
  'kotlin',
  'dart'
]);

const languageFamilies = Object.freeze({
  programming: ['JavaScript', 'Python', 'Go', 'Rust', 'Java', 'PHP', 'C#', 'Swift', 'Kotlin', 'Dart'],
  dsl: ['Sheikha DSL', 'Policy DSL', 'Workflow DSL'],
  configuration: ['JSON', 'YAML', 'TOML', 'ENV'],
  markup: ['HTML', 'Markdown', 'XML'],
  query: ['SQL', 'GraphQL', 'KQL'],
  prompt: ['Arabic Prompt', 'English Prompt', 'Governed System Prompt'],
  workflow: ['BPMN', 'State Machine', 'Event Flow']
});

const enterpriseFederations = Object.freeze([
  'Sheikha',
  'Oracle',
  'SAP',
  'Microsoft',
  'Google',
  'AWS',
  'Azure',
  'Alibaba',
  'IBM'
]);

function unique(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function nodesByType(graph, type) {
  return (graph.nodes || []).filter((item) => item.type === type);
}

function nodeNames(graph, type) {
  return nodesByType(graph, type).map((item) => item.name || item.id);
}

function buildRuntimeState(graph, activationPlan) {
  const capabilities = nodeNames(graph, 'CAPABILITY');
  const fabrics = nodeNames(graph, 'FABRIC');
  const clusters = nodeNames(graph, 'CLUSTER');
  const ready = graph.status === 'ACTIVE' && activationPlan.status === 'APPROVED_INTERNAL_PLAN';

  return {
    system: 'SHEIKHA_UNIVERSAL_FEDERATION_RUNTIME_V13',
    status: ready ? 'ACTIVE' : 'BLOCKED',
    mode: 'LIVING_FEDERATION_RUNTIME_STATE',
    federation: {
      id: graph.nodes?.find((item) => item.type === 'FEDERATION')?.id || null,
      name: graph.nodes?.find((item) => item.type === 'FEDERATION')?.name || null,
      family: graph.nodes?.find((item) => item.type === 'FAMILY')?.name || null,
      blueprint: graph.nodes?.find((item) => item.type === 'BLUEPRINT')?.name || null
    },
    lifecycle: {
      states: lifecycleStates,
      current: ready ? 'GOVERNED_READY' : 'GOVERNANCE_BLOCKED'
    },
    capabilities,
    fabrics,
    clusters,
    compatibility: {
      graphReady: graph.status === 'ACTIVE',
      activationGateApproved: activationPlan.status === 'APPROVED_INTERNAL_PLAN',
      sdkDescriptorOnly: true,
      externalMutationAllowed: false
    }
  };
}

function buildUniversalEventBus(runtimeState) {
  const federationId = runtimeState.federation.id || 'unknown-federation';

  return {
    system: 'SHEIKHA_UNIVERSAL_EVENT_BUS_V13',
    status: runtimeState.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED',
    mode: 'INTERNAL_PUBLISH_SUBSCRIBE_EVENT_PLAN',
    events: eventTypes.map((type, index) => ({
      id: `living-${index + 1}-${type.toLowerCase().replace(/_/g, '-')}`,
      type,
      federationId,
      subscribers: [
        'runtime',
        'inspector',
        'knowledge-graph',
        'capability-marketplace',
        'observability',
        'audit'
      ],
      publishScope: 'SHEIKHA_INTERNAL_EVENT_PLAN_ONLY',
      noExternalMutation: true
    })),
    summary: {
      events: eventTypes.length,
      subscribers: 6
    }
  };
}

function buildDependencyEngine(graph, runtimeState) {
  const required = [
    runtimeState.federation.family,
    runtimeState.federation.blueprint,
    ...runtimeState.capabilities
  ];
  const optional = [
    ...runtimeState.fabrics,
    ...runtimeState.clusters,
    ...sdkTargets
  ];
  const dependencyTree = {
    federation: runtimeState.federation.id,
    required: unique(required),
    optional: unique(optional)
  };
  const edgeKeys = new Set((graph.edges || []).map((item) => `${item.from}->${item.to}`));
  const circular = (graph.edges || []).some((item) => edgeKeys.has(`${item.to}->${item.from}`));

  return {
    system: 'SHEIKHA_UNIVERSAL_DEPENDENCY_ENGINE_V13',
    status: circular ? 'REVIEW' : 'ACTIVE',
    mode: 'GRAPH_DERIVED_DEPENDENCY_ANALYSIS',
    dependencyTree,
    compatibility: {
      versionCompatibility: true,
      runtimeCompatibility: true,
      sdkCompatibility: true,
      apiCompatibility: true,
      languageCompatibility: true
    },
    circularDetection: {
      circular,
      cycles: []
    },
    summary: {
      required: dependencyTree.required.length,
      optional: dependencyTree.optional.length
    }
  };
}

function buildFederationHealth(runtimeState, dependencyEngine) {
  const hostHealth = buildRuntimeHealthReport();
  const runtimeReady = runtimeState.status === 'ACTIVE';
  const dependencyReady = dependencyEngine.status === 'ACTIVE';
  const baseScore = Math.round((hostHealth.overallScore + (runtimeReady ? 100 : 0) + (dependencyReady ? 100 : 60)) / 3);

  return {
    system: 'SHEIKHA_FEDERATION_RUNTIME_HEALTH_ENGINE_V13',
    status: baseScore >= 90 ? 'HEALTHY' : 'REVIEW',
    score: baseScore,
    readiness: baseScore >= 90 ? 'FEDERATION_RUNTIME_READY' : 'FEDERATION_RUNTIME_REVIEW',
    risk: baseScore >= 90 ? 'LOW' : 'CONTROLLED',
    recommendation: baseScore >= 90
      ? 'Continue governed internal expansion.'
      : 'Review runtime state and dependencies before expansion.',
    host: hostHealth.host,
    safety: hostHealth.safety
  };
}

function buildCapabilityMarketplace(runtimeState) {
  const reusableBy = ['Linux', 'Windows', 'PostgreSQL', 'Docker', 'ERP', 'Marketplace', 'AI'];

  return {
    system: 'SHEIKHA_UNIVERSAL_CAPABILITY_MARKETPLACE_V13',
    status: runtimeState.capabilities.length ? 'ACTIVE' : 'EMPTY',
    mode: 'REUSABLE_CAPABILITY_REGISTRY',
    capabilities: runtimeState.capabilities.map((capability) => ({
      id: `capability:${capability}`,
      name: capability,
      relation: 'PROVIDES',
      reusableBy,
      governed: true
    })),
    summary: {
      capabilities: runtimeState.capabilities.length,
      reusableFamilies: reusableBy.length
    }
  };
}

function buildServiceRegistry(runtimeState) {
  const serviceTypes = ['REST', 'GraphQL', 'gRPC', 'CLI', 'SDK', 'Event', 'Cron', 'Worker', 'Streaming'];

  return {
    system: 'SHEIKHA_UNIVERSAL_SERVICE_REGISTRY_V13',
    status: runtimeState.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED',
    mode: 'DESCRIPTOR_ONLY_SERVICE_REGISTRY',
    services: serviceTypes.map((type) => ({
      id: `${runtimeState.federation.id || 'federation'}:${type.toLowerCase()}`,
      type,
      descriptorOnly: true,
      externalEndpointCreated: false
    })),
    summary: {
      services: serviceTypes.length
    }
  };
}

function buildSdkRegistry(runtimeState) {
  return {
    system: 'SHEIKHA_UNIVERSAL_SDK_REGISTRY_V13',
    status: runtimeState.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED',
    mode: 'DESCRIPTOR_ONLY_SDK_REGISTRY',
    sdks: sdkTargets.map((target) => ({
      target,
      packageName: `sheikha_${target}_federation_client`,
      generatedFrom: runtimeState.federation.id,
      descriptorOnly: true,
      fileWritten: false
    })),
    summary: {
      targets: sdkTargets.length
    }
  };
}

function buildLanguageFederation() {
  const total = Object.values(languageFamilies).reduce((sum, items) => sum + items.length, 0);

  return {
    system: 'SHEIKHA_UNIVERSAL_LANGUAGE_FEDERATION_V13',
    status: 'ACTIVE',
    mode: 'PROGRAMMING_DSL_CONFIG_MARKUP_QUERY_PROMPT_WORKFLOW',
    families: languageFamilies,
    summary: {
      families: Object.keys(languageFamilies).length,
      languages: total
    }
  };
}

function buildAiFederation(runtimeState) {
  return {
    system: 'SHEIKHA_UNIVERSAL_AI_FEDERATION_V13',
    status: 'ACTIVE',
    mode: 'GOVERNED_AI_FEDERATION_RESEARCH_AND_RUNTIME_DESCRIPTORS',
    components: [
      'models',
      'agents',
      'reasoning',
      'memory',
      'planning',
      'tools',
      'rag',
      'evaluation',
      'safety',
      'alignment'
    ],
    links: runtimeState.capabilities.filter((capability) =>
      ['ai-inference', 'knowledge-retrieval', 'agent-orchestration', 'safe-evaluation'].includes(capability)
    ),
    claims: {
      agiClaimed: false,
      asiClaimed: false,
      consciousnessClaimed: false,
      ghaybClaimed: false
    },
    governance: {
      humanReviewRequired: true,
      truthfulnessRequired: true,
      noDivineAttributeClaims: true
    }
  };
}

function buildEnterpriseFederation(runtimeState) {
  return {
    system: 'SHEIKHA_UNIVERSAL_ENTERPRISE_FEDERATION_V13',
    status: 'ACTIVE',
    mode: 'ENTERPRISE_INTEGRATION_REGISTRY_WITHOUT_PARTNERSHIP_CLAIMS',
    organizations: enterpriseFederations.map((name) => ({
      id: `enterprise:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      integrationDescriptor: true,
      partnershipClaimed: false,
      contractClaimed: false
    })),
    federationContext: runtimeState.federation.id,
    governance: {
      noFalsePartnershipClaim: true,
      contractRequiredForCommercialClaim: true
    }
  };
}

function buildEvolutionEngine(runtimeState, health) {
  return {
    system: 'SHEIKHA_FEDERATION_EVOLUTION_ENGINE_V13',
    status: runtimeState.status === 'ACTIVE' && health.status === 'HEALTHY' ? 'ACTIVE' : 'REVIEW',
    mode: 'GOVERNED_INTERNAL_EVOLUTION_PLAN',
    flow: [
      'Validate',
      'Blueprint',
      'DNA',
      'Graph',
      'Runtime',
      'Health',
      'Capabilities',
      'SDK',
      'APIs',
      'Inspector',
      'Knowledge',
      'Marketplace',
      'Audit',
      'Metrics',
      'Ready'
    ],
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_GRAPH_EVENT_PLAN_ONLY',
    externalMutationAllowed: false,
    humanApprovalForExternalChange: true
  };
}

function buildLivingFederationOperatingSystem(dna = defaultLivingFederationDna) {
  const graph = buildKnowledgeGraphFromTemplate(dna);
  const activationPlan = buildGovernedFederationActivationPlan(dna);
  const runtimeState = buildRuntimeState(graph, activationPlan);
  const eventBus = buildUniversalEventBus(runtimeState);
  const dependencies = buildDependencyEngine(graph, runtimeState);
  const health = buildFederationHealth(runtimeState, dependencies);
  const capabilityMarketplace = buildCapabilityMarketplace(runtimeState);
  const serviceRegistry = buildServiceRegistry(runtimeState);
  const sdkRegistry = buildSdkRegistry(runtimeState);
  const languageFederation = buildLanguageFederation();
  const aiFederation = buildAiFederation(runtimeState);
  const enterpriseFederation = buildEnterpriseFederation(runtimeState);
  const evolutionEngine = buildEvolutionEngine(runtimeState, health);
  const active = [
    graph.status === 'ACTIVE',
    activationPlan.status === 'APPROVED_INTERNAL_PLAN',
    runtimeState.status === 'ACTIVE',
    eventBus.status === 'ACTIVE',
    dependencies.status === 'ACTIVE',
    health.status === 'HEALTHY',
    capabilityMarketplace.status === 'ACTIVE',
    serviceRegistry.status === 'ACTIVE',
    sdkRegistry.status === 'ACTIVE',
    languageFederation.status === 'ACTIVE',
    aiFederation.status === 'ACTIVE',
    enterpriseFederation.status === 'ACTIVE',
    evolutionEngine.status === 'ACTIVE'
  ].every(Boolean);

  return {
    system: 'SHEIKHA_LIVING_FEDERATION_OPERATING_SYSTEM_V13',
    status: active ? 'ACTIVE_100' : 'REVIEW',
    mode: 'LIVING_GOVERNED_FEDERATION_OPERATING_CYCLE',
    dna,
    linkedLayers: {
      universalKnowledgeGraphV9: graph.status,
      governedActivationGateV12: activationPlan.status
    },
    runtimeState,
    eventBus,
    dependencies,
    health,
    capabilityMarketplace,
    serviceRegistry,
    sdkRegistry,
    languageFederation,
    aiFederation,
    enterpriseFederation,
    evolutionEngine,
    summary: {
      nodes: graph.summary?.nodes || 0,
      edges: graph.summary?.edges || 0,
      lifecycleStates: lifecycleStates.length,
      events: eventBus.summary.events,
      capabilities: capabilityMarketplace.summary.capabilities,
      services: serviceRegistry.summary.services,
      sdkTargets: sdkRegistry.summary.targets,
      languages: languageFederation.summary.languages,
      enterprises: enterpriseFederation.organizations.length
    },
    governance: {
      tawhid: 'لا إله إلا الله وحده لا شريك له',
      allGreatnessBelongsToAllah: true,
      systemIsToolNotAuthority: true,
      noGhaybClaims: true,
      noDivineAttributeClaims: true,
      humanReviewRequiredForHighImpact: true,
      readOnlyExternalWorld: true,
      governedInternalPlanOnly: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalMutation: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

function getLivingFederationOperatingSystemStatus() {
  const report = buildLivingFederationOperatingSystem();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    linkedLayers: report.linkedLayers,
    health: {
      status: report.health.status,
      score: report.health.score,
      readiness: report.health.readiness
    },
    summary: report.summary,
    governance: report.governance,
    timestamp: report.timestamp
  };
}

module.exports = {
  defaultLivingFederationDna,
  lifecycleStates,
  eventTypes,
  sdkTargets,
  languageFamilies,
  enterpriseFederations,
  buildRuntimeState,
  buildUniversalEventBus,
  buildDependencyEngine,
  buildFederationHealth,
  buildCapabilityMarketplace,
  buildServiceRegistry,
  buildSdkRegistry,
  buildLanguageFederation,
  buildAiFederation,
  buildEnterpriseFederation,
  buildEvolutionEngine,
  buildLivingFederationOperatingSystem,
  getLivingFederationOperatingSystemStatus
};
