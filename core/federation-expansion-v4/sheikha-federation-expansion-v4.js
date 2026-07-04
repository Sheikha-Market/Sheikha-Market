'use strict';

const {
  governedExpandFederationV3,
  relationshipRegistry
} = require('../governed-write-expansion-v3/sheikha-governed-write-expansion-v3');

const governanceLevels = Object.freeze({
  LEVEL_1_READ_ONLY: 'READ_ONLY',
  LEVEL_2_INTERNAL_WRITE: 'GOVERNED_INTERNAL_WRITE',
  LEVEL_3_HUMAN_APPROVED_EXPANSION: 'HUMAN_APPROVED_INTERNAL_EXPANSION',
  LEVEL_4_EXTERNAL_CHANGE: 'EXTERNAL_CHANGE_EXPLICIT_APPROVAL_REQUIRED'
});

const marketplaceBlueprints = Object.freeze({
  POSTGRESQL: {
    type: 'DATABASE',
    familyName: 'PostgreSQL Family',
    clusters: ['storage', 'query-engine', 'transactions', 'replication', 'backup', 'security', 'drivers'],
    capabilities: ['sql-query', 'storage', 'backup', 'replication', 'audit']
  },
  KUBERNETES: {
    type: 'CONTAINER',
    familyName: 'Kubernetes Family',
    clusters: ['orchestration', 'pods', 'services', 'ingress', 'security', 'observability'],
    capabilities: ['orchestration', 'scheduling', 'service-discovery', 'governance-observation']
  },
  LINUX: {
    type: 'OPERATING_SYSTEM',
    familyName: 'Linux Family',
    clusters: ['kernel', 'filesystem', 'drivers', 'networking', 'security', 'services', 'monitoring'],
    capabilities: ['runtime-hosting', 'container-hosting', 'process-management', 'observability']
  },
  AI_AGENT: {
    type: 'AI',
    familyName: 'AI Agent Family',
    clusters: ['agents', 'tools', 'memory', 'rag', 'evaluation', 'guardrails'],
    capabilities: ['agent-orchestration', 'retrieval', 'safe-evaluation', 'human-review']
  }
});

function normalizeFederationDna(input = {}) {
  return {
    id: input.id || null,
    name: input.name || 'Unnamed Federation DNA',
    type: input.type || 'CUSTOM',
    familyName: input.familyName || `${input.name || 'Unnamed'} Family`,
    blueprint: input.blueprint || input.type || 'CUSTOM',
    clusters: Array.isArray(input.clusters) ? input.clusters : [],
    capabilities: Array.isArray(input.capabilities) ? input.capabilities : [],
    services: Array.isArray(input.services) ? input.services : [],
    apis: Array.isArray(input.apis) ? input.apis : [],
    sdks: Array.isArray(input.sdks) ? input.sdks : [],
    runtimes: Array.isArray(input.runtimes) ? input.runtimes : [],
    governanceLevel: input.governanceLevel || governanceLevels.LEVEL_2_INTERNAL_WRITE,
    policies: input.policies || {},
    metadata: input.metadata || {},
    version: input.version || '1.0.0'
  };
}

function evaluateGovernanceLevel(dna) {
  if (dna.governanceLevel === governanceLevels.LEVEL_4_EXTERNAL_CHANGE) {
    return {
      status: 'BLOCKED',
      reason: 'EXTERNAL_CHANGE_REQUIRES_EXPLICIT_APPROVAL',
      allowed: false
    };
  }

  if (dna.governanceLevel === governanceLevels.LEVEL_3_HUMAN_APPROVED_EXPANSION && dna.policies.humanApproved !== true) {
    return {
      status: 'PENDING_HUMAN_APPROVAL',
      reason: 'HUMAN_APPROVAL_REQUIRED',
      allowed: false
    };
  }

  return {
    status: 'PASSED',
    reason: 'GOVERNED_INTERNAL_EXPANSION_ALLOWED',
    allowed: true
  };
}

function installFederationPackage(packageName, options = {}) {
  const key = String(packageName || '').toUpperCase();
  const blueprint = marketplaceBlueprints[key];

  if (!blueprint) {
    return {
      system: 'SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4',
      status: 'BLOCKED',
      error: 'MARKETPLACE_BLUEPRINT_NOT_FOUND',
      packageName
    };
  }

  return expandFederationFromDna({
    name: `${key} Federation`,
    ...blueprint,
    actor: options.actor || 'marketplace',
    reason: options.reason || `Install ${key} federation package`,
    governanceLevel: options.governanceLevel || governanceLevels.LEVEL_2_INTERNAL_WRITE,
    policies: options.policies || {}
  });
}

function expandFederationFromDna(input = {}) {
  const dna = normalizeFederationDna(input);
  const governance = evaluateGovernanceLevel(dna);

  if (!governance.allowed) {
    return {
      system: 'SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4',
      status: governance.status,
      mode: 'GOVERNED_DNA_BLUEPRINT_EXPANSION',
      governance,
      dna,
      result: null
    };
  }

  const result = governedExpandFederationV3({
    type: dna.type,
    name: dna.name,
    familyName: dna.familyName,
    clusters: dna.clusters,
    capabilities: dna.capabilities,
    actor: input.actor || 'system',
    reason: input.reason || 'Federation DNA expansion'
  });

  return {
    system: 'SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4',
    status: result.status,
    mode: 'GOVERNED_DNA_BLUEPRINT_MARKETPLACE_EXPANSION',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_AND_GRAPH_ONLY',
    governance,
    governanceLevels,
    dna,
    relationshipRegistry,
    expansion: result,
    marketplace: {
      installed: Boolean(input.marketplacePackage),
      packageName: input.marketplacePackage || null
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

module.exports = {
  governanceLevels,
  marketplaceBlueprints,
  normalizeFederationDna,
  evaluateGovernanceLevel,
  expandFederationFromDna,
  installFederationPackage
};
