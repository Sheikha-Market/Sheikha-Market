'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-master-engine-registry-v1.json'
);
const ENGINE_INDEX_PATH = path.join(ROOT, 'core/engines/index.js');
const CRITICAL_CONFIG_PATH = path.join(ROOT, 'config/critical-engines.json');

const {
  allOptionalEngineAliases,
  optionalEngineDefinitions,
} = require(
  '../optional-engine-contract-fabric/sheikha-optional-engine-data-contracts-v14'
);

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function inspectCoreEngine(engine) {
  const sourcePath = path.join(ROOT, engine.source);
  return {
    ...engine,
    sourceExists: fs.existsSync(sourcePath),
    status: fs.existsSync(sourcePath) ? 'SOURCE_READY' : 'SOURCE_MISSING',
  };
}

function buildOptionalRecords(config) {
  return allOptionalEngineAliases.map((id) => {
    const definition = optionalEngineDefinitions[id] || {};
    return {
      id,
      nameAr: definition.label || id,
      source: config.optionalRegistry.definitionsSource,
      loadTier: config.optionalRegistry.loadTier,
      governed: true,
      required: false,
      optional: true,
      domains: [definition.domain || 'unknown'],
      contract: definition.contract || 'generic',
      inferred: Boolean(definition.inferred),
      sourceExists: fs.existsSync(
        path.join(ROOT, config.optionalRegistry.definitionsSource)
      ),
      status: 'OPTIONAL_CONTRACT_READY',
    };
  });
}

function inspectLegacyProjections(config) {
  const indexSource = fs.readFileSync(ENGINE_INDEX_PATH, 'utf8');
  const manifestIds = [
    ...indexSource.matchAll(/\{\s*key:\s*'([^']+)'\s*,\s*file:/g),
  ].map((match) => match[1]);
  const explicitIds = [
    ...indexSource.matchAll(/registerEngine\(\s*['"]([^'"]+)['"]/g),
  ].map((match) => match[1]);
  const runtimeEngineIds = unique([...manifestIds, ...explicitIds]);
  const masterCoreIds = new Set(config.coreEngines.map((engine) => engine.id));
  const runtimeMissingFromMaster = runtimeEngineIds.filter(
    (id) => !masterCoreIds.has(id)
  );
  const masterMissingFromRuntime = config.coreEngines
    .map((engine) => engine.id)
    .filter((id) => !runtimeEngineIds.includes(id));

  const critical = JSON.parse(
    fs.readFileSync(CRITICAL_CONFIG_PATH, 'utf8')
  );
  const criticalFiles = critical.critical_engines_l0 || [];
  const criticalMissingFiles = criticalFiles.filter(
    (file) => !fs.existsSync(path.join(ROOT, 'lib', file))
  );

  return {
    runtimeEngineIds,
    runtimeMissingFromMaster,
    masterMissingFromRuntime,
    criticalFiles,
    criticalMissingFiles,
  };
}

function buildMasterRegistry() {
  const config = readConfig();
  const coreEngines = config.coreEngines.map(inspectCoreEngine);
  const optionalEngines = buildOptionalRecords(config);
  const all = [...coreEngines, ...optionalEngines];

  const duplicateIds = [...new Set(
    all
      .map((item) => item.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index)
  )];

  const missingSources = coreEngines
    .filter((engine) => !engine.sourceExists)
    .map((engine) => engine.id);

  const domains = unique(
    coreEngines.flatMap((engine) => engine.domains || [])
  );

  const tiers = Object.keys(config.loadTiers).reduce((acc, tier) => {
    acc[tier] = all.filter((engine) => engine.loadTier === tier).length;
    return acc;
  }, {});

  const projections = inspectLegacyProjections(config);

  const status =
    duplicateIds.length === 0 &&
    missingSources.length === 0 &&
    projections.runtimeMissingFromMaster.length === 0 &&
    projections.criticalMissingFiles.length === 0
      ? 'CLEAR'
      : 'REVIEW_REQUIRED';

  return {
    system: config.system,
    version: config.version,
    status,
    authority: config.authority,
    mode: config.mode,
    governance: config.governance,
    summary: {
      coreEngines: coreEngines.length,
      optionalEngines: optionalEngines.length,
      totalEngineRecords: all.length,
      domains: domains.length,
      missingSources: missingSources.length,
      duplicateIds: duplicateIds.length,
      canonicalIntentOwners:
        Object.keys(config.canonicalIntentOwners || {}).length,
      runtimeProjectionEngines: projections.runtimeEngineIds.length,
      runtimeMissingFromMaster:
        projections.runtimeMissingFromMaster.length,
      masterMissingFromRuntime:
        projections.masterMissingFromRuntime.length,
      criticalBootFiles: projections.criticalFiles.length,
      criticalMissingFiles:
        projections.criticalMissingFiles.length,
      tiers,
    },
    domains,
    coreEngines,
    optionalEngines,
    canonicalIntentOwners: config.canonicalIntentOwners,
    optionalRegistry: config.optionalRegistry,
    legacyProjections: config.legacyProjections,
    findings: {
      duplicateIds,
      missingSources,
      runtimeMissingFromMaster:
        projections.runtimeMissingFromMaster,
      masterMissingFromRuntime:
        projections.masterMissingFromRuntime,
      criticalMissingFiles:
        projections.criticalMissingFiles,
    },
    projections,
  };
}

function getEngine(id) {
  const registry = buildMasterRegistry();
  return [
    ...registry.coreEngines,
    ...registry.optionalEngines,
  ].find((engine) => engine.id === id) || null;
}

function getDomainEngines(domain) {
  const registry = buildMasterRegistry();
  return registry.coreEngines.filter((engine) =>
    (engine.domains || []).includes(domain)
  );
}

function resolveIntentOwner(intent) {
  const config = readConfig();
  const value = String(intent || '').trim().toLowerCase();
  if (!value) return null;
  if (config.canonicalIntentOwners[value]) {
    return config.canonicalIntentOwners[value];
  }
  const parts = value.split('.');
  while (parts.length > 1) {
    parts.pop();
    const prefix = parts.join('.');
    if (config.canonicalIntentOwners[prefix]) {
      return config.canonicalIntentOwners[prefix];
    }
  }
  return null;
}

module.exports = {
  buildMasterRegistry,
  getDomainEngines,
  getEngine,
  readConfig,
  resolveIntentOwner,
};
