'use strict';

const crypto = require('crypto');

const v2Registry = new Map();
const v2Audit = [];
const v2Events = [];

const relationshipDictionary = Object.freeze([
  'BELONGS_TO',
  'DEPENDS_ON',
  'IMPLEMENTS',
  'EXTENDS',
  'PROVIDES',
  'CONSUMES',
  'HOSTS',
  'EXECUTES',
  'SUPERVISES',
  'AUDITS',
  'GOVERNS',
  'OBSERVES',
  'CONNECTS_TO',
  'DISCOVERS',
  'GENERATES',
  'REPORTS_TO',
  'PUBLISHES',
  'SUBSCRIBES',
  'SCALES_WITH',
  'FEDERATES_WITH',
  'COMPATIBLE_WITH',
  'REQUIRES',
  'OPTIONAL_WITH',
  'ISOLATED_FROM'
]);

const expansionStages = Object.freeze([
  'family',
  'industrialClusters',
  'capabilityClusters',
  'serviceClusters',
  'apiClusters',
  'sdkClusters',
  'languageClusters',
  'runtimeClusters',
  'applicationClusters',
  'enterpriseClusters',
  'aiClusters',
  'knowledgeClusters',
  'governanceClusters',
  'inspectorClusters'
]);

const blueprintLibrary = Object.freeze({
  OPERATING_SYSTEM: {
    id: 'blueprint-operating-system',
    familyKind: 'operating-system-family',
    industrialClusters: ['kernel', 'filesystem', 'drivers', 'security', 'scheduler', 'ipc', 'memory', 'network', 'package', 'service', 'monitoring'],
    capabilityClusters: ['runtime-hosting', 'process-management', 'container-hosting', 'observability', 'security-policy'],
    serviceClusters: ['identity-service', 'update-service', 'logging-service', 'network-service'],
    apiClusters: ['system-api', 'process-api', 'filesystem-api', 'security-api'],
    sdkClusters: ['system-sdk', 'driver-sdk', 'observability-sdk'],
    languageClusters: ['shell', 'c', 'cpp', 'python', 'javascript'],
    runtimeClusters: ['nodejs', 'python', 'java', 'dotnet', 'go'],
    applicationClusters: ['agent-host', 'service-host', 'inspector-host'],
    enterpriseClusters: ['workspace', 'tenant', 'rbac', 'audit'],
    aiClusters: ['agentic-ops', 'diagnostics-ai', 'rag-ops'],
    knowledgeClusters: ['os-ontology', 'runtime-knowledge', 'operation-memory'],
    governanceClusters: ['admission', 'policy', 'risk', 'human-review'],
    inspectorClusters: ['health', 'diagnostics', 'evidence', 'readiness']
  },
  LANGUAGE: {
    id: 'blueprint-language',
    familyKind: 'language-family',
    industrialClusters: ['lexer', 'parser', 'ast', 'ir', 'compiler', 'optimizer', 'formatter', 'linter', 'package-manager', 'debugger', 'runtime'],
    capabilityClusters: ['compile', 'interpret', 'format', 'lint', 'test', 'package'],
    serviceClusters: ['language-server', 'build-service', 'test-service', 'package-service'],
    apiClusters: ['compiler-api', 'lsp-api', 'package-api'],
    sdkClusters: ['language-sdk', 'plugin-sdk', 'tooling-sdk'],
    languageClusters: ['source-language', 'intermediate-language', 'target-language'],
    runtimeClusters: ['local-runtime', 'server-runtime', 'sandbox-runtime'],
    applicationClusters: ['ide-integration', 'ci-integration', 'agent-tooling'],
    enterpriseClusters: ['developer-workspace', 'policy-profile', 'quality-gate'],
    aiClusters: ['code-agent', 'test-agent', 'review-agent'],
    knowledgeClusters: ['language-ontology', 'api-docs', 'examples'],
    governanceClusters: ['quality-policy', 'security-policy', 'license-policy'],
    inspectorClusters: ['syntax', 'diagnostics', 'dependency-inspection']
  },
  SDK: {
    id: 'blueprint-sdk',
    familyKind: 'sdk-family',
    industrialClusters: ['client', 'types', 'auth', 'transport', 'retries', 'errors', 'examples'],
    capabilityClusters: ['api-access', 'authentication', 'mcp-tooling', 'code-generation'],
    serviceClusters: ['sdk-build', 'sdk-test', 'sdk-release'],
    apiClusters: ['rest-api', 'mcp-api', 'event-api'],
    sdkClusters: ['node-sdk', 'python-sdk', 'cli-sdk'],
    languageClusters: ['typescript', 'python', 'shell'],
    runtimeClusters: ['nodejs', 'python'],
    applicationClusters: ['developer-portal', 'extension', 'automation'],
    enterpriseClusters: ['tenant-sdk-policy', 'api-key-scope', 'usage-meter'],
    aiClusters: ['sdk-agent', 'tool-agent'],
    knowledgeClusters: ['sdk-docs', 'usage-patterns'],
    governanceClusters: ['secret-policy', 'rate-limit-policy', 'audit-policy'],
    inspectorClusters: ['contract-check', 'compatibility-check']
  },
  DATABASE: {
    id: 'blueprint-database',
    familyKind: 'database-family',
    industrialClusters: ['schema', 'query', 'index', 'transaction', 'backup', 'replication', 'security'],
    capabilityClusters: ['storage', 'querying', 'analytics', 'governed-access'],
    serviceClusters: ['query-service', 'migration-service', 'backup-service'],
    apiClusters: ['sql-api', 'document-api', 'graph-api'],
    sdkClusters: ['database-sdk', 'migration-sdk'],
    languageClusters: ['sql', 'query-dsl'],
    runtimeClusters: ['database-runtime', 'connector-runtime'],
    applicationClusters: ['analytics', 'crm', 'erp', 'marketplace'],
    enterpriseClusters: ['data-domain', 'access-policy', 'retention-policy'],
    aiClusters: ['semantic-search', 'vector-retrieval', 'data-agent'],
    knowledgeClusters: ['data-catalog', 'schema-ontology', 'lineage'],
    governanceClusters: ['privacy-policy', 'access-review', 'audit'],
    inspectorClusters: ['health', 'latency', 'capacity', 'compliance']
  },
  CLOUD_PLATFORM: {
    id: 'blueprint-cloud-platform',
    familyKind: 'cloud-family',
    industrialClusters: ['compute', 'storage', 'network', 'identity', 'billing', 'region', 'security'],
    capabilityClusters: ['deployment', 'autoscale', 'observability', 'cost-governance'],
    serviceClusters: ['compute-service', 'storage-service', 'network-service', 'identity-service'],
    apiClusters: ['cloud-api', 'deployment-api', 'billing-api'],
    sdkClusters: ['cloud-sdk', 'iac-sdk', 'cli-sdk'],
    languageClusters: ['iac', 'yaml', 'json'],
    runtimeClusters: ['container-runtime', 'serverless-runtime', 'vm-runtime'],
    applicationClusters: ['saas', 'api-layer', 'data-platform'],
    enterpriseClusters: ['account', 'subscription', 'tenant', 'cost-center'],
    aiClusters: ['ai-gateway', 'model-hosting', 'agent-hosting'],
    knowledgeClusters: ['resource-graph', 'architecture-graph'],
    governanceClusters: ['policy-as-code', 'budget-policy', 'region-policy'],
    inspectorClusters: ['quota', 'cost', 'security', 'availability']
  },
  AI_FRAMEWORK: {
    id: 'blueprint-ai-framework',
    familyKind: 'ai-family',
    industrialClusters: ['model', 'dataset', 'training', 'inference', 'evaluation', 'guardrails'],
    capabilityClusters: ['generation', 'retrieval', 'planning', 'tool-use', 'evaluation'],
    serviceClusters: ['model-service', 'embedding-service', 'agent-service'],
    apiClusters: ['inference-api', 'embedding-api', 'tool-api'],
    sdkClusters: ['agent-sdk', 'model-sdk', 'eval-sdk'],
    languageClusters: ['python', 'typescript', 'prompt-dsl'],
    runtimeClusters: ['inference-runtime', 'agent-runtime', 'batch-runtime'],
    applicationClusters: ['chat', 'inspector', 'automation'],
    enterpriseClusters: ['workspace', 'policy', 'usage', 'cost'],
    aiClusters: ['generative-ai', 'agentic-ai', 'multi-agent', 'rag'],
    knowledgeClusters: ['vector-store', 'knowledge-graph', 'memory'],
    governanceClusters: ['safety-policy', 'truthfulness-policy', 'human-review'],
    inspectorClusters: ['model-eval', 'prompt-audit', 'tool-audit']
  },
  CUSTOM_FEDERATION: {
    id: 'blueprint-custom',
    familyKind: 'custom-family',
    industrialClusters: ['core', 'integration', 'security', 'observability'],
    capabilityClusters: ['register', 'discover', 'govern', 'observe'],
    serviceClusters: ['registry-service', 'integration-service'],
    apiClusters: ['status-api', 'registry-api'],
    sdkClusters: ['custom-sdk'],
    languageClusters: ['json', 'yaml'],
    runtimeClusters: ['managed-runtime'],
    applicationClusters: ['custom-application'],
    enterpriseClusters: ['custom-enterprise-domain'],
    aiClusters: ['custom-agent'],
    knowledgeClusters: ['custom-knowledge'],
    governanceClusters: ['custom-policy', 'audit'],
    inspectorClusters: ['custom-inspector']
  }
});

function stableId(input = {}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
    .slice(0, 16);
}

function normalizeType(type) {
  const normalized = String(type || 'CUSTOM_FEDERATION').toUpperCase();
  return blueprintLibrary[normalized] ? normalized : 'CUSTOM_FEDERATION';
}

function resolveBlueprint(type) {
  return blueprintLibrary[normalizeType(type)];
}

function event(action, payload = {}) {
  return {
    id: `evt-${stableId({ action, payload, at: Date.now() })}`,
    action,
    payload,
    at: new Date().toISOString()
  };
}

function audit(action, payload = {}, actor = 'system') {
  return {
    id: `aud-${stableId({ action, payload, actor, at: Date.now() })}`,
    action,
    actor,
    payload,
    at: new Date().toISOString()
  };
}

function validateRequest(input = {}) {
  const errors = [];

  if (!input.name || typeof input.name !== 'string') {
    errors.push('FEDERATION_NAME_REQUIRED');
  }

  if (input.directSystemWrite === true || input.systemMutation === true) {
    errors.push('DIRECT_SYSTEM_WRITE_FORBIDDEN');
  }

  if (input.kernelMutation === true || input.bootMutation === true || input.firmwareMutation === true) {
    errors.push('LOW_LEVEL_SYSTEM_MUTATION_FORBIDDEN');
  }

  if (input.productionRuntimeClaim === true) {
    errors.push('PRODUCTION_RUNTIME_CLAIM_REQUIRES_EVIDENCE');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function evaluatePolicy(input = {}) {
  const validation = validateRequest(input);
  const highImpact = input.highImpactAction === true;
  const approved = input.approvedByHuman === true;
  const requiresHumanReview = highImpact || input.requiresHumanReview === true;

  if (!validation.valid) {
    return {
      decision: 'BLOCKED',
      allowedToWriteRegistry: false,
      requiresHumanReview,
      validation
    };
  }

  if (requiresHumanReview && !approved) {
    return {
      decision: 'REVIEW_REQUIRED',
      allowedToWriteRegistry: false,
      requiresHumanReview,
      validation
    };
  }

  return {
    decision: 'APPROVED',
    allowedToWriteRegistry: true,
    requiresHumanReview,
    validation
  };
}

function expansionItems(stage, federationId, blueprint, explicitItems = []) {
  const items = explicitItems.length ? explicitItems : blueprint[stage] || [];

  return items.map((name) => ({
    id: `${federationId}-${stage}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    stage,
    name,
    status: 'PLANNED_REGISTERED',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_ONLY'
  }));
}

function buildRelations(federationId, familyId, expansion) {
  const relations = [
    { from: federationId, to: familyId, type: 'BELONGS_TO' },
    { from: federationId, to: 'governance-registry', type: 'GOVERNS' },
    { from: federationId, to: 'inspector-registry', type: 'OBSERVES' },
    { from: federationId, to: 'capability-registry', type: 'PROVIDES' },
    { from: federationId, to: 'event-bus', type: 'PUBLISHES' },
    { from: federationId, to: 'universal-graph', type: 'GENERATES' },
    { from: federationId, to: 'enterprise-registry', type: 'FEDERATES_WITH' }
  ];

  for (const stage of expansionStages) {
    const entries = expansion[stage] || [];

    for (const entry of entries) {
      relations.push({ from: federationId, to: entry.id, type: 'GENERATES' });
      relations.push({ from: entry.id, to: federationId, type: 'REPORTS_TO' });
      relations.push({ from: entry.id, to: 'governance-registry', type: 'GOVERNS' });
    }
  }

  relations.push({
    from: (expansion.industrialClusters[0] || {}).id || federationId,
    to: federationId,
    type: 'DEPENDS_ON'
  });
  relations.push({ from: federationId, to: 'read-only-runtime-boundary', type: 'ISOLATED_FROM' });
  relations.push({ from: federationId, to: 'existing-federations', type: 'COMPATIBLE_WITH' });
  relations.push({ from: federationId, to: 'human-approval-gate', type: 'REQUIRES' });
  relations.push({ from: federationId, to: 'optional-marketplace-publication', type: 'OPTIONAL_WITH' });
  relations.push({ from: federationId, to: 'observability-fabric', type: 'SUBSCRIBES' });
  relations.push({ from: federationId, to: 'capacity-fabric', type: 'SCALES_WITH' });
  relations.push({ from: 'auto-discovery', to: federationId, type: 'DISCOVERS' });
  relations.push({ from: 'registry-writer', to: federationId, type: 'IMPLEMENTS' });
  relations.push({ from: federationId, to: 'base-blueprint', type: 'EXTENDS' });
  relations.push({ from: federationId, to: 'service-registry', type: 'CONSUMES' });
  relations.push({ from: federationId, to: 'runtime-registry', type: 'HOSTS' });
  relations.push({ from: federationId, to: 'execution-gate', type: 'EXECUTES' });
  relations.push({ from: 'governance-registry', to: federationId, type: 'SUPERVISES' });
  relations.push({ from: 'audit-registry', to: federationId, type: 'AUDITS' });
  relations.push({ from: federationId, to: 'external-connectors', type: 'CONNECTS_TO' });

  return relations.filter((relation) => relationshipDictionary.includes(relation.type));
}

function buildExpansionPlan(input = {}) {
  const type = normalizeType(input.type);
  const blueprint = resolveBlueprint(type);
  const federationId = input.id || `fedv2-${stableId({
    type,
    name: input.name,
    family: input.family || blueprint.familyKind
  })}`;
  const familyId = input.family || `family-${stableId({
    type: 'family',
    name: input.familyName || blueprint.familyKind,
    parent: type
  })}`;
  const expansion = {};

  for (const stage of expansionStages) {
    const explicitItems = Array.isArray(input[stage]) ? input[stage] : [];
    expansion[stage] = expansionItems(stage, federationId, blueprint, explicitItems);
  }

  expansion.family = [{
    id: familyId,
    stage: 'family',
    name: input.familyName || blueprint.familyKind,
    status: 'PLANNED_REGISTERED',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_ONLY'
  }];

  const relations = buildRelations(federationId, familyId, expansion);

  return {
    federation: {
      id: federationId,
      type,
      name: input.name || 'Unnamed Federation',
      family: familyId,
      blueprint: blueprint.id,
      status: 'PLANNED',
      mode: 'GOVERNED_READ_WRITE_INTERNAL_REGISTRY',
      writeScope: 'SHEIKHA_INTERNAL_REGISTRY_ONLY',
      productionRuntimeClaim: false
    },
    expansion,
    relations,
    graph: {
      nodes: [
        { id: federationId, label: input.name || 'Unnamed Federation', type: 'FEDERATION' },
        { id: familyId, label: input.familyName || blueprint.familyKind, type: 'FEDERATION_FAMILY' },
        ...Object.values(expansion)
          .flat()
          .map((item) => ({ id: item.id, label: item.name, type: item.stage }))
      ],
      edges: relations
    }
  };
}

function buildGovernedWritePipeline(policy) {
  return [
    { stage: 'READ', status: 'PASS' },
    { stage: 'VALIDATE', status: policy.validation.valid ? 'PASS' : 'FAIL' },
    { stage: 'POLICY_EVALUATION', status: policy.decision === 'BLOCKED' ? 'FAIL' : 'PASS' },
    { stage: 'HUMAN_REVIEW', status: policy.requiresHumanReview ? (policy.decision === 'APPROVED' ? 'APPROVED' : 'REQUIRED') : 'NOT_REQUIRED' },
    { stage: 'APPROVE', status: policy.decision },
    { stage: 'WRITE', status: policy.allowedToWriteRegistry ? 'INTERNAL_REGISTRY_WRITE_ONLY' : 'SKIPPED' },
    { stage: 'AUDIT', status: 'RECORDED' },
    { stage: 'PUBLISH_EVENT', status: policy.allowedToWriteRegistry ? 'PUBLISHED' : 'NOT_PUBLISHED' }
  ];
}

function governedRegisterFederation(input = {}) {
  const policy = evaluatePolicy(input);
  const plan = buildExpansionPlan(input);
  const auditEntry = audit('GOVERNED_FEDERATION_REGISTRATION_EVALUATED', {
    federationId: plan.federation.id,
    decision: policy.decision,
    validation: policy.validation
  }, input.actor || 'system');
  const eventEntry = event('FEDERATION_REGISTRATION_' + policy.decision, {
    federationId: plan.federation.id,
    type: plan.federation.type
  });

  v2Audit.push(auditEntry);

  if (policy.allowedToWriteRegistry) {
    const stored = {
      ...plan,
      federation: {
        ...plan.federation,
        status: 'REGISTERED'
      },
      governance: {
        readAllowed: true,
        internalRegistryWriteAllowed: true,
        externalSystemWriteAllowed: false,
        humanReviewRequired: policy.requiresHumanReview,
        noHarm: true
      },
      audit: [auditEntry],
      events: [eventEntry],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    v2Registry.set(stored.federation.id, stored);
    v2Events.push(eventEntry);

    return {
      system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2',
      status: 'ACTIVE',
      decision: policy.decision,
      pipeline: buildGovernedWritePipeline(policy),
      record: stored
    };
  }

  return {
    system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2',
    status: policy.decision,
    decision: policy.decision,
    pipeline: buildGovernedWritePipeline(policy),
    plan,
    audit: [auditEntry],
    events: [eventEntry]
  };
}

function listV2Federations() {
  return Array.from(v2Registry.values());
}

function buildUniversalRegistryGraphV2() {
  const records = listV2Federations();
  const nodes = [];
  const edges = [];

  for (const record of records) {
    nodes.push(...record.graph.nodes);
    edges.push(...record.graph.edges);
  }

  const usedRelationTypes = Array.from(new Set(edges.map((relation) => relation.type))).sort();

  return {
    system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_GRAPH_V2',
    status: 'ACTIVE',
    mode: 'GOVERNED_READ_WRITE_INTERNAL_REGISTRY_GRAPH',
    nodes,
    edges,
    summary: {
      records: records.length,
      nodes: nodes.length,
      relations: edges.length,
      usedRelationTypes,
      missingRelationTypes: relationshipDictionary.filter((type) => !usedRelationTypes.includes(type))
    }
  };
}

function buildDynamicFederationRegistryV2Report() {
  return {
    system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2',
    status: 'ACTIVE',
    mode: 'GOVERNED_READ_WRITE_INTERNAL_REGISTRY_ONLY',
    relationshipDictionary,
    blueprintLibrary: Object.values(blueprintLibrary).map((blueprint) => ({
      id: blueprint.id,
      familyKind: blueprint.familyKind,
      stageCount: expansionStages.filter((stage) => Array.isArray(blueprint[stage])).length
    })),
    expansionStages,
    graph: buildUniversalRegistryGraphV2(),
    audit: v2Audit,
    events: v2Events,
    governance: {
      readAllowed: true,
      internalRegistryWriteAllowedAfterGovernance: true,
      externalSystemWriteAllowed: false,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  relationshipDictionary,
  expansionStages,
  blueprintLibrary,
  buildExpansionPlan,
  governedRegisterFederation,
  listV2Federations,
  buildUniversalRegistryGraphV2,
  buildDynamicFederationRegistryV2Report,
  evaluatePolicy
};
