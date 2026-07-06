'use strict';

const {
  orchestrateMetaFederation
} = require('../meta-federation-orchestrator/sheikha-meta-federation-orchestrator-v6');

const dnaSchema = Object.freeze({
  required: ['name', 'family', 'blueprint', 'version'],
  optional: [
    'layers',
    'fabrics',
    'clusters',
    'capabilities',
    'services',
    'apis',
    'sdks',
    'languages',
    'runtimes',
    'applications',
    'relations',
    'governance',
    'inspector',
    'marketplace'
  ]
});

const universalBlueprints = Object.freeze({
  Linux: {
    type: 'OPERATING_SYSTEM',
    family: 'linux-family',
    clusters: ['kernel', 'filesystem', 'drivers', 'networking', 'security', 'services', 'monitoring'],
    capabilities: ['runtime-hosting', 'container-hosting', 'process-management', 'observability']
  },
  PostgreSQL: {
    type: 'DATABASE',
    family: 'database-family',
    clusters: ['storage', 'query-engine', 'transactions', 'replication', 'backup', 'security', 'drivers'],
    capabilities: ['storage', 'query', 'backup', 'replication', 'audit']
  },
  Language: {
    type: 'LANGUAGE',
    family: 'language-family',
    clusters: ['lexer', 'parser', 'ast', 'ir', 'compiler', 'optimizer', 'formatter', 'linter', 'runtime'],
    capabilities: ['compilation', 'analysis', 'toolchain', 'runtime']
  },
  AI: {
    type: 'AI',
    family: 'ai-family',
    clusters: ['models', 'agents', 'tools', 'rag', 'memory', 'evaluation', 'guardrails'],
    capabilities: ['ai-inference', 'knowledge-retrieval', 'agent-orchestration', 'human-review']
  }
});

function validateDna(dna = {}) {
  const missing = dnaSchema.required.filter((field) => !dna[field]);

  return {
    system: 'SHEIKHA_FEDERATION_DNA_SCHEMA_VALIDATOR_V7',
    status: missing.length ? 'INVALID' : 'VALID',
    valid: missing.length === 0,
    missing
  };
}

function resolveBlueprint(name) {
  return universalBlueprints[name] || null;
}

function expandFromDnaSchema(dna = {}) {
  const validation = validateDna(dna);

  if (!validation.valid) {
    return {
      system: 'SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7',
      status: 'BLOCKED',
      validation,
      result: null
    };
  }

  const blueprint = resolveBlueprint(dna.blueprint);

  if (!blueprint) {
    return {
      system: 'SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7',
      status: 'BLOCKED',
      error: 'BLUEPRINT_NOT_FOUND',
      validation,
      dna
    };
  }

  const request = {
    type: blueprint.type,
    name: dna.name,
    familyName: dna.family,
    clusters: dna.clusters || blueprint.clusters,
    capabilities: dna.capabilities || blueprint.capabilities,
    actor: dna.actor || 'blueprint-engine-v7',
    reason: dna.reason || 'Federation DNA schema expansion',
    governanceLevel: dna.governance?.level || 'GOVERNED_INTERNAL_WRITE',
    policies: dna.governance?.policies || {}
  };

  const result = orchestrateMetaFederation(request);

  return {
    system: 'SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7',
    status: result.status,
    mode: 'SCHEMA_BLUEPRINT_DRIVEN_FEDERATION_EXPANSION',
    validation,
    dna,
    blueprint,
    result,
    safety: {
      governedInternalWriteOnly: true,
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
  dnaSchema,
  universalBlueprints,
  validateDna,
  resolveBlueprint,
  expandFromDnaSchema
};
