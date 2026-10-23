'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const ENGINE_INDEX = path.join(ROOT, 'core/engines/index.js');
const NEURAL_ROUTER = path.join(ROOT, 'core/engines/sheikha-neural-router.js');
const CRITICAL_CONFIG = path.join(ROOT, 'config/critical-engines.json');
const {
  buildMasterRegistry,
} = require(
  '../engine-registry/sheikha-master-engine-registry-v1'
);

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractManifestEngines(source) {
  return [...source.matchAll(/\{\s*key:\s*'([^']+)'\s*,\s*file:\s*'([^']+)'/g)]
    .map((match) => ({
      engine: match[1],
      source: `lib/${match[2]}`,
      registration: 'ENGINE_MANIFEST',
    }));
}

function extractExplicitEngines(source) {
  return [...source.matchAll(/registerEngine\(\s*['"]([^'"]+)['"]/g)]
    .map((match) => ({
      engine: match[1],
      source: 'core/engines/index.js',
      registration: 'EXPLICIT',
    }));
}

function extractRoutes(source, origin) {
  return [...source.matchAll(
    /(?:registerRoute\(|\[)\s*['"]([^'"]+)['"]\s*,\s*(?:\{\s*engine:\s*)?['"]([^'"]+)['"]/g
  )].map((match) => ({
    intent: match[1],
    engine: match[2],
    origin,
  }));
}

function inspectEngineRuntime(registry) {
  const indexSource = readText(ENGINE_INDEX);
  const routerSource = readText(NEURAL_ROUTER);
  const critical = JSON.parse(readText(CRITICAL_CONFIG));

  const declared = [
    ...extractManifestEngines(indexSource),
    ...extractExplicitEngines(indexSource),
  ];

  const declaredEngines = unique(declared.map((entry) => entry.engine));
  const referencedEngines = unique(
    registry.pages.flatMap((page) => [
      page.primaryEngine,
      ...page.supportingEngines,
      ...page.policyEngines,
    ])
  );

  const engineHealth = referencedEngines.map((engine) => {
    const records = declared.filter((entry) => entry.engine === engine);
    const manifest = records.find((entry) => entry.registration === 'ENGINE_MANIFEST');
    const sourceExists = manifest
      ? fs.existsSync(path.join(ROOT, manifest.source))
      : records.length > 0;

    return {
      engine,
      declared: records.length > 0,
      sourceExists,
      registrations: records.map((entry) => entry.registration),
      sources: unique(records.map((entry) => entry.source)),
      status: records.length > 0 && sourceExists ? 'DECLARED' : 'REVIEW_REQUIRED',
    };
  });

  const routeRecords = [
    ...extractRoutes(routerSource, 'neural-router-default'),
    ...extractRoutes(indexSource, 'engine-index'),
  ];

  const routeGroups = new Map();
  for (const route of routeRecords) {
    if (!routeGroups.has(route.intent)) routeGroups.set(route.intent, []);
    routeGroups.get(route.intent).push(route);
  }

  const conflicts = [...routeGroups.entries()]
    .map(([intent, records]) => ({
      intent,
      engines: unique(records.map((record) => record.engine)),
      records,
    }))
    .filter((entry) => entry.engines.length > 1);

  const criticalNames = critical.critical_engines_l0 || [];
  const master = buildMasterRegistry();
  const masterIds = new Set([
    ...master.coreEngines.map((engine) => engine.id),
    ...master.optionalEngines.map((engine) => engine.id),
  ]);
  const missingFromMaster = referencedEngines.filter(
    (engine) => !masterIds.has(engine)
  );
  const unresolved = engineHealth.filter((entry) => !entry.declared);
  const clear =
    conflicts.length === 0 &&
    unresolved.length === 0 &&
    missingFromMaster.length === 0 &&
    master.status === 'CLEAR';

  return {
    system: 'SHEIKHA_ENGINE_DOMAIN_HEALTH_V3',
    status: clear ? 'CLEAR' : 'REVIEW_REQUIRED',
    summary: {
      referencedEngines: referencedEngines.length,
      declaredReferencedEngines: engineHealth.filter((entry) => entry.declared).length,
      unresolvedReferencedEngines: unresolved.length,
      routeRecords: routeRecords.length,
      routeIntentConflicts: conflicts.length,
      criticalL0Files: criticalNames.length,
      missingFromMasterRegistry: missingFromMaster.length,
      masterCoreEngines: master.summary.coreEngines,
      masterOptionalEngines: master.summary.optionalEngines,
      masterEngineRecords: master.summary.totalEngineRecords,
    },
    engineHealth,
    conflicts,
    criticalL0: criticalNames,
    masterRegistry: {
      status: master.status,
      authority: master.authority,
      summary: master.summary,
      missingReferencedEngines: missingFromMaster,
    },
  };
}

module.exports = {
  inspectEngineRuntime,
};
