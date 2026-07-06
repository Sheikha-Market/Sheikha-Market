'use strict';

const crypto = require('crypto');

const {
  validateDna,
  resolveBlueprint,
  expandFromDnaSchema
} = require('../federation-blueprint-engine/sheikha-federation-blueprint-engine-v7');

const {
  queryCompatibility
} = require('../capability-compatibility/sheikha-capability-compatibility-v1');

const sdkTargets = Object.freeze([
  { id: 'javascript', packageName: '@sheikha/federation-client', extension: 'js' },
  { id: 'python', packageName: 'sheikha_federation_client', extension: 'py' },
  { id: 'go', packageName: 'sheikhafederation', extension: 'go' },
  { id: 'rust', packageName: 'sheikha_federation', extension: 'rs' },
  { id: 'java', packageName: 'com.sheikha.federation', extension: 'java' },
  { id: 'php', packageName: 'Sheikha\\Federation', extension: 'php' },
  { id: 'csharp', packageName: 'Sheikha.Federation', extension: 'cs' }
]);

const universalTemplateLibrary = Object.freeze({
  OperatingSystem: {
    id: 'template-operating-system',
    category: 'Operating System Templates',
    fabrics: ['kernel-fabric', 'os-fabric', 'runtime-fabric', 'security-fabric', 'observability-fabric'],
    clusters: ['kernel', 'filesystem', 'drivers', 'networking', 'security', 'services', 'monitoring'],
    capabilities: ['runtime-hosting', 'container-hosting', 'process-management', 'observability', 'security-observation'],
    services: ['process-service', 'filesystem-service', 'network-service', 'log-service'],
    apis: ['system-status-api', 'process-api', 'security-api'],
    sdks: ['node-sdk', 'python-sdk', 'cli-sdk'],
    runtime: ['nodejs', 'python', 'java', 'go'],
    governance: ['admission-policy', 'safe-observation-policy', 'human-review-policy'],
    inspector: ['health-inspector', 'diagnostics-inspector', 'evidence-inspector'],
    marketplace: ['operating-system-federation-package']
  },
  Language: {
    id: 'template-language',
    category: 'Language Templates',
    fabrics: ['compiler-fabric', 'tooling-fabric', 'language-server-fabric', 'runtime-fabric'],
    clusters: ['lexer', 'parser', 'ast', 'ir', 'optimizer', 'compiler', 'runtime', 'debugger'],
    capabilities: ['compilation', 'analysis', 'toolchain', 'runtime', 'linting'],
    services: ['language-server', 'build-service', 'test-service'],
    apis: ['lsp-api', 'compiler-api', 'package-api'],
    sdks: ['plugin-sdk', 'tooling-sdk', 'runtime-sdk'],
    runtime: ['local-runtime', 'ci-runtime', 'sandbox-runtime'],
    governance: ['quality-policy', 'security-policy', 'license-policy'],
    inspector: ['syntax-inspector', 'dependency-inspector', 'diagnostics-inspector'],
    marketplace: ['language-federation-package']
  },
  Database: {
    id: 'template-database',
    category: 'Database Templates',
    fabrics: ['storage-fabric', 'query-fabric', 'transaction-fabric', 'replication-fabric', 'backup-fabric'],
    clusters: ['storage', 'query-engine', 'transactions', 'replication', 'backup', 'security', 'drivers'],
    capabilities: ['storage', 'query', 'backup', 'replication', 'audit'],
    services: ['query-service', 'migration-service', 'backup-service'],
    apis: ['query-api', 'migration-api', 'backup-api'],
    sdks: ['database-sdk', 'migration-sdk', 'admin-sdk'],
    runtime: ['database-runtime', 'connector-runtime'],
    governance: ['access-policy', 'retention-policy', 'audit-policy'],
    inspector: ['latency-inspector', 'capacity-inspector', 'compliance-inspector'],
    marketplace: ['database-federation-package']
  },
  Cloud: {
    id: 'template-cloud',
    category: 'Cloud Templates',
    fabrics: ['compute-fabric', 'storage-fabric', 'network-fabric', 'identity-fabric', 'cost-fabric'],
    clusters: ['compute', 'storage', 'identity', 'networking', 'monitoring', 'billing'],
    capabilities: ['deployment', 'autoscale', 'observability', 'governance', 'messaging'],
    services: ['compute-service', 'storage-service', 'network-service', 'identity-service'],
    apis: ['cloud-api', 'deployment-api', 'billing-api'],
    sdks: ['cloud-sdk', 'iac-sdk', 'cli-sdk'],
    runtime: ['vm-runtime', 'container-runtime', 'serverless-runtime'],
    governance: ['region-policy', 'budget-policy', 'identity-policy'],
    inspector: ['quota-inspector', 'cost-inspector', 'availability-inspector'],
    marketplace: ['cloud-federation-package']
  },
  Container: {
    id: 'template-container',
    category: 'Container Templates',
    fabrics: ['image-fabric', 'runtime-fabric', 'orchestration-fabric', 'network-policy-fabric'],
    clusters: ['images', 'pods', 'services', 'ingress', 'security', 'observability'],
    capabilities: ['orchestration', 'container-hosting', 'service-discovery', 'observability'],
    services: ['scheduler-service', 'image-service', 'network-policy-service'],
    apis: ['container-api', 'orchestration-api', 'service-api'],
    sdks: ['container-sdk', 'operator-sdk'],
    runtime: ['container-runtime', 'orchestrator-runtime'],
    governance: ['image-policy', 'network-policy', 'admission-policy'],
    inspector: ['image-inspector', 'cluster-inspector', 'policy-inspector'],
    marketplace: ['container-federation-package']
  },
  SDK: {
    id: 'template-sdk',
    category: 'SDK Templates',
    fabrics: ['client-fabric', 'transport-fabric', 'auth-fabric', 'release-fabric'],
    clusters: ['client', 'types', 'auth', 'transport', 'retries', 'errors', 'examples'],
    capabilities: ['api-access', 'authentication', 'mcp-tooling', 'code-generation'],
    services: ['sdk-build-service', 'sdk-test-service', 'sdk-release-service'],
    apis: ['rest-api', 'mcp-api', 'event-api'],
    sdks: ['node-sdk', 'python-sdk', 'go-sdk', 'rust-sdk', 'java-sdk', 'php-sdk', 'csharp-sdk'],
    runtime: ['nodejs', 'python', 'go', 'rust', 'java', 'php', 'dotnet'],
    governance: ['secret-policy', 'version-policy', 'compatibility-policy'],
    inspector: ['contract-inspector', 'compatibility-inspector'],
    marketplace: ['sdk-federation-package']
  },
  API: {
    id: 'template-api',
    category: 'API Templates',
    fabrics: ['gateway-fabric', 'contract-fabric', 'rate-limit-fabric', 'event-fabric'],
    clusters: ['routes', 'contracts', 'auth', 'rate-limits', 'events', 'observability'],
    capabilities: ['api-access', 'messaging', 'observability', 'governance'],
    services: ['gateway-service', 'contract-service', 'event-service'],
    apis: ['openapi', 'status-api', 'event-api'],
    sdks: ['api-client-sdk', 'mcp-tool-sdk'],
    runtime: ['nodejs', 'gateway-runtime'],
    governance: ['api-policy', 'rate-limit-policy', 'audit-policy'],
    inspector: ['contract-inspector', 'latency-inspector'],
    marketplace: ['api-federation-package']
  },
  AI: {
    id: 'template-ai',
    category: 'AI Templates',
    fabrics: ['model-fabric', 'agent-fabric', 'rag-fabric', 'evaluation-fabric', 'guardrail-fabric'],
    clusters: ['models', 'agents', 'tools', 'rag', 'memory', 'evaluation', 'guardrails'],
    capabilities: ['ai-inference', 'knowledge-retrieval', 'agent-orchestration', 'human-review'],
    services: ['model-service', 'agent-service', 'embedding-service', 'evaluation-service'],
    apis: ['inference-api', 'embedding-api', 'agent-api', 'tool-api'],
    sdks: ['agent-sdk', 'model-sdk', 'eval-sdk'],
    runtime: ['inference-runtime', 'agent-runtime', 'batch-runtime'],
    governance: ['safety-policy', 'truthfulness-policy', 'human-review-policy'],
    inspector: ['model-eval-inspector', 'prompt-audit-inspector', 'tool-audit-inspector'],
    marketplace: ['ai-federation-package']
  },
  Knowledge: {
    id: 'template-knowledge',
    category: 'Knowledge Templates',
    fabrics: ['knowledge-graph-fabric', 'ontology-fabric', 'vector-fabric', 'memory-fabric'],
    clusters: ['knowledge-graph', 'ontology', 'semantic-engine', 'vector-index', 'rag', 'search', 'memory'],
    capabilities: ['knowledge-retrieval', 'semantic-search', 'reasoning-support', 'audit'],
    services: ['search-service', 'retrieval-service', 'ontology-service'],
    apis: ['knowledge-api', 'search-api', 'graph-api'],
    sdks: ['knowledge-sdk', 'graph-sdk'],
    runtime: ['retrieval-runtime', 'graph-runtime'],
    governance: ['source-policy', 'citation-policy', 'retention-policy'],
    inspector: ['source-inspector', 'coverage-inspector', 'freshness-inspector'],
    marketplace: ['knowledge-federation-package']
  },
  Marketplace: {
    id: 'template-marketplace',
    category: 'Marketplace Templates',
    fabrics: ['catalog-fabric', 'offer-fabric', 'contract-fabric', 'billing-fabric'],
    clusters: ['catalog', 'products', 'offers', 'contracts', 'billing', 'customers'],
    capabilities: ['commercial-listing', 'contracting', 'billing', 'governance'],
    services: ['catalog-service', 'offer-service', 'billing-service'],
    apis: ['catalog-api', 'order-api', 'billing-api'],
    sdks: ['marketplace-sdk', 'commerce-sdk'],
    runtime: ['commerce-runtime'],
    governance: ['commercial-policy', 'contract-policy', 'billing-policy'],
    inspector: ['catalog-inspector', 'contract-inspector', 'billing-inspector'],
    marketplace: ['marketplace-federation-package']
  },
  ERP: {
    id: 'template-erp',
    category: 'ERP Templates',
    fabrics: ['finance-fabric', 'inventory-fabric', 'procurement-fabric', 'asset-fabric'],
    clusters: ['finance', 'inventory', 'procurement', 'assets', 'operations', 'hr'],
    capabilities: ['enterprise-records', 'workflow', 'approval', 'reporting'],
    services: ['finance-service', 'inventory-service', 'approval-service'],
    apis: ['erp-api', 'workflow-api', 'reporting-api'],
    sdks: ['erp-sdk', 'workflow-sdk'],
    runtime: ['enterprise-runtime'],
    governance: ['approval-policy', 'segregation-policy', 'audit-policy'],
    inspector: ['workflow-inspector', 'approval-inspector', 'audit-inspector'],
    marketplace: ['erp-federation-package']
  }
});

function stableId(input = {}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
    .slice(0, 16);
}

function resolveTemplateName(dna = {}, blueprint = {}) {
  if (dna.template && universalTemplateLibrary[dna.template]) return dna.template;

  const name = String(dna.blueprint || '').toLowerCase();
  const type = String(blueprint.type || '').toUpperCase();

  if (['linux', 'windows', 'macos', 'android', 'ios'].includes(name)) return 'OperatingSystem';
  if (['postgresql', 'mysql', 'oracle'].includes(name) || type === 'DATABASE') return 'Database';
  if (['docker', 'kubernetes'].includes(name) || type === 'CONTAINER') return 'Container';
  if (['language', 'python', 'java', 'rust', 'php', 'nodejs'].includes(name) || type === 'LANGUAGE') return 'Language';
  if (['ai', 'agentic-ai'].includes(name) || type === 'AI') return 'AI';
  if (type === 'SDK') return 'SDK';
  if (type === 'API') return 'API';
  if (type === 'CLOUD' || type === 'CLOUD_PLATFORM') return 'Cloud';
  if (type === 'MARKETPLACE') return 'Marketplace';
  if (type === 'ERP') return 'ERP';

  return 'Knowledge';
}

function mergeUnique(...lists) {
  return Array.from(new Set(lists.flat().filter(Boolean)));
}

function validateTemplateRequest(dna = {}) {
  const validation = validateDna(dna);
  const blockedExternal = Boolean(
    dna.externalChange ||
    dna.systemMutation ||
    dna.kernelMutation ||
    dna.bootMutation ||
    dna.firmwareMutation ||
    dna.serviceRestart ||
    dna.packageInstall
  );

  return {
    valid: validation.valid && !blockedExternal,
    dnaValidation: validation,
    externalChangeBlocked: blockedExternal,
    errors: [
      ...validation.missing.map((field) => `MISSING_${field.toUpperCase()}`),
      ...(blockedExternal ? ['EXTERNAL_CHANGE_FORBIDDEN_IN_TEMPLATE_ENGINE'] : [])
    ]
  };
}

function buildOpenApiSpec(federationPackage) {
  const basePath = `/api/federations/${federationPackage.package.id}`;

  return {
    openapi: '3.1.0',
    info: {
      title: federationPackage.package.name,
      version: federationPackage.package.version
    },
    paths: {
      [`${basePath}/status`]: {
        get: {
          operationId: 'getFederationStatus',
          summary: 'Read governed federation package status'
        }
      },
      [`${basePath}/capabilities`]: {
        get: {
          operationId: 'listFederationCapabilities',
          summary: 'List generated capabilities'
        }
      },
      [`${basePath}/relations`]: {
        get: {
          operationId: 'listFederationRelations',
          summary: 'List generated relationships'
        }
      }
    },
    governance: {
      readOnlyApi: true,
      noExternalMutation: true,
      noHarm: true
    }
  };
}

function generateSdkBundle(federationPackage) {
  return sdkTargets.map((target) => ({
    target: target.id,
    packageName: target.packageName,
    file: `${federationPackage.package.id}.${target.extension}`,
    generatedFrom: federationPackage.openapi.info.title,
    operations: Object.values(federationPackage.openapi.paths)
      .flatMap((path) => Object.values(path).map((operation) => operation.operationId)),
    writeScope: 'DESCRIPTOR_ONLY_NO_FILE_WRITE'
  }));
}

function buildFederationPackage(dna = {}) {
  const validation = validateTemplateRequest(dna);

  if (!validation.valid) {
    return {
      system: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
      status: 'BLOCKED',
      validation,
      dna
    };
  }

  const blueprint = resolveBlueprint(dna.blueprint);

  if (!blueprint) {
    return {
      system: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
      status: 'BLOCKED',
      error: 'BLUEPRINT_NOT_FOUND',
      validation,
      dna
    };
  }

  const templateName = resolveTemplateName(dna, blueprint);
  const template = universalTemplateLibrary[templateName];
  const packageId = `pkg-${stableId({
    name: dna.name,
    family: dna.family,
    blueprint: dna.blueprint,
    template: template.id,
    version: dna.version
  })}`;
  const expansion = expandFromDnaSchema({
    ...dna,
    clusters: mergeUnique(template.clusters, dna.clusters || [], blueprint.clusters || []),
    capabilities: mergeUnique(template.capabilities, dna.capabilities || [], blueprint.capabilities || [])
  });
  const packageManifest = {
    id: packageId,
    name: `${dna.name} Package`,
    version: dna.version,
    dna,
    blueprint: {
      name: dna.blueprint,
      ...blueprint
    },
    template: {
      name: templateName,
      ...template
    },
    fabrics: template.fabrics,
    clusters: mergeUnique(template.clusters, dna.clusters || [], blueprint.clusters || []),
    capabilities: mergeUnique(template.capabilities, dna.capabilities || [], blueprint.capabilities || []),
    services: template.services,
    apis: template.apis,
    sdks: template.sdks,
    runtimes: template.runtime,
    governance: template.governance,
    inspector: template.inspector,
    marketplace: {
      packageType: template.marketplace[0],
      installable: true,
      governed: true,
      publishedInternally: true
    },
    policies: {
      internalRegistryWriteOnly: true,
      externalChangeAllowed: false,
      humanApprovalForExternalChange: true,
      noHarm: true
    }
  };
  const compatibility = queryCompatibility(`${String(dna.blueprint).toLowerCase()}-federation`);
  const openapi = buildOpenApiSpec({ package: packageManifest });
  const sdkBundle = generateSdkBundle({ package: packageManifest, openapi });

  return {
    system: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
    status: expansion.status === 'COMMITTED' ? 'COMMITTED' : expansion.status,
    mode: 'DATA_DRIVEN_TEMPLATE_PACKAGE_GENERATION',
    validation,
    package: packageManifest,
    expansion,
    compatibility,
    openapi,
    sdkBundle,
    persistentRecord: {
      id: packageId,
      type: 'FEDERATION_PACKAGE',
      version: dna.version,
      status: expansion.status === 'COMMITTED' ? 'PERSISTED_PLAN' : 'PERSIST_SKIPPED',
      writeScope: 'SHEIKHA_INTERNAL_PERSISTENT_REGISTRY_ONLY',
      createdAt: new Date().toISOString()
    },
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noExternalMutation: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true
    }
  };
}

function installFederationTemplatePackage(dna = {}) {
  const result = buildFederationPackage(dna);

  if (result.status === 'COMMITTED') {
    persistentTemplateRegistry.set(result.package.id, result);
  }

  return result;
}

const persistentTemplateRegistry = new Map();

function buildPersistentRegistrySnapshot() {
  const records = Array.from(persistentTemplateRegistry.values());

  return {
    system: 'SHEIKHA_FEDERATION_TEMPLATE_PERSISTENT_REGISTRY_V8',
    status: 'ACTIVE',
    mode: 'INTERNAL_PERSISTENT_REGISTRY_SNAPSHOT',
    records: records.map((record) => ({
      id: record.package.id,
      name: record.package.name,
      version: record.package.version,
      blueprint: record.package.blueprint.name,
      template: record.package.template.name,
      capabilities: record.package.capabilities.length,
      sdks: record.sdkBundle.length,
      openapi: true
    })),
    summary: {
      records: records.length,
      capabilities: records.reduce((total, record) => total + record.package.capabilities.length, 0),
      sdkTargets: sdkTargets.length,
      openApiSpecs: records.length
    },
    safety: {
      descriptorOnly: true,
      noGeneratedFilesWritten: true,
      noExternalMutation: true,
      noHarm: true
    }
  };
}

function buildFederationTemplateEngineReport() {
  return {
    system: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
    status: 'ACTIVE',
    mode: 'DATA_DRIVEN_TEMPLATE_LIBRARY_PACKAGE_SDK_REGISTRY',
    templateLibrary: Object.entries(universalTemplateLibrary).map(([name, template]) => ({
      name,
      id: template.id,
      category: template.category,
      fabrics: template.fabrics.length,
      clusters: template.clusters.length,
      capabilities: template.capabilities.length
    })),
    sdkTargets,
    persistentRegistry: buildPersistentRegistrySnapshot(),
    governance: {
      internalRegistryWriteAllowed: true,
      externalSystemWriteAllowed: false,
      descriptorOnlySdkGeneration: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noServiceRestart: true,
      noPackageInstall: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  sdkTargets,
  universalTemplateLibrary,
  resolveTemplateName,
  validateTemplateRequest,
  buildFederationPackage,
  installFederationTemplatePackage,
  buildPersistentRegistrySnapshot,
  buildFederationTemplateEngineReport,
  generateSdkBundle,
  buildOpenApiSpec
};
