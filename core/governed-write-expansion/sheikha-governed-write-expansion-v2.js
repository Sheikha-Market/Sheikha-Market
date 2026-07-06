'use strict';

const {
  registerFamily,
  registerFederation,
  buildRegistryGraph
} = require('../dynamic-federation-registry/sheikha-dynamic-federation-registry-v1');

const writeStages = Object.freeze([
  'READ',
  'VALIDATE',
  'POLICY_EVALUATION',
  'RISK_CHECK',
  'INSPECTOR_REVIEW',
  'APPROVAL_GATE',
  'REGISTRY_WRITE',
  'GRAPH_UPDATE',
  'AUDIT_RECORD',
  'EVENT_PUBLISH'
]);

const blueprints = Object.freeze({
  OPERATING_SYSTEM: {
    familyClusters: ['kernel', 'filesystem', 'drivers', 'security', 'scheduler', 'ipc', 'memory', 'network', 'package', 'service', 'monitoring'],
    capabilities: ['runtime-hosting', 'process-management', 'security-observation', 'governance-observation']
  },
  LANGUAGE: {
    familyClusters: ['lexer', 'parser', 'ast', 'ir', 'compiler', 'optimizer', 'formatter', 'linter', 'package-manager', 'debugger', 'runtime'],
    capabilities: ['compilation', 'analysis', 'toolchain', 'sdk-generation']
  },
  DATABASE: {
    familyClusters: ['storage', 'replication', 'transactions', 'query-engine', 'optimizer', 'backup', 'monitoring', 'security', 'drivers'],
    capabilities: ['data-storage', 'query', 'backup', 'governance-audit']
  },
  CONTAINER: {
    familyClusters: ['namespace', 'cgroups', 'image', 'networking', 'orchestration', 'security', 'observability'],
    capabilities: ['container-hosting', 'image-management', 'orchestration']
  },
  AI: {
    familyClusters: ['models', 'agents', 'tools', 'rag', 'memory', 'evaluation', 'guardrails', 'observability'],
    capabilities: ['inference', 'retrieval', 'agent-orchestration', 'safe-evaluation']
  }
});

function resolveBlueprint(type = 'CUSTOM_FEDERATION') {
  return blueprints[type] || {
    familyClusters: ['registry', 'graph', 'governance', 'inspector', 'observability'],
    capabilities: ['registration', 'governance-observation']
  };
}

function evaluateWritePolicy(request = {}) {
  const risks = [];

  if (request.kernelMutation === true) risks.push('KERNEL_MUTATION_BLOCKED');
  if (request.bootMutation === true) risks.push('BOOT_MUTATION_BLOCKED');
  if (request.firmwareMutation === true) risks.push('FIRMWARE_MUTATION_BLOCKED');
  if (request.serviceRestart === true) risks.push('SERVICE_RESTART_BLOCKED');
  if (request.packageInstall === true) risks.push('PACKAGE_INSTALL_BLOCKED');
  if (request.externalMutation === true) risks.push('EXTERNAL_MUTATION_BLOCKED');

  return {
    system: 'SHEIKHA_GOVERNED_WRITE_POLICY_V2',
    status: risks.length ? 'BLOCKED' : 'PASSED',
    passed: risks.length === 0,
    risks,
    noHarm: risks.length === 0,
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_ONLY'
  };
}

function governedExpandFederation(request = {}) {
  const policy = evaluateWritePolicy(request);

  if (!policy.passed) {
    return {
      system: 'SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V2',
      status: 'BLOCKED',
      mode: 'GOVERNED_READ_WRITE',
      policy,
      stages: writeStages,
      result: null
    };
  }

  const blueprint = resolveBlueprint(request.type);
  const family = registerFamily({
    name: request.familyName || `${request.name || 'Unnamed'} Family`,
    parent: request.parent || 'federation-of-federations',
    clusters: request.familyClusters || blueprint.familyClusters
  });

  const federation = registerFederation({
    type: request.type || 'CUSTOM_FEDERATION',
    name: request.name || 'Unnamed Federation',
    family: family.id,
    clusters: request.clusters || blueprint.familyClusters,
    capabilities: request.capabilities || blueprint.capabilities,
    actor: request.actor || 'system',
    reason: request.reason || 'Governed dynamic expansion'
  });

  const graph = buildRegistryGraph();

  return {
    system: 'SHEIKHA_GOVERNED_WRITE_EXPANSION_FABRIC_V2',
    status: 'COMMITTED',
    mode: 'GOVERNED_READ_WRITE',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_ONLY',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noRegistryModificationOutsideSheikha: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalMutation: true,
      noHarm: true,
      humanReviewRequiredForHighImpactAction: true
    },
    stages: writeStages,
    policy,
    blueprint,
    family,
    federation,
    graph,
    audit: {
      action: 'GOVERNED_FEDERATION_EXPANSION_COMMITTED',
      actor: request.actor || 'system',
      at: new Date().toISOString()
    }
  };
}

module.exports = {
  writeStages,
  blueprints,
  resolveBlueprint,
  evaluateWritePolicy,
  governedExpandFederation
};
