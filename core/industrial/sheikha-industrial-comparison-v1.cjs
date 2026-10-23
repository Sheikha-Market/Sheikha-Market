'use strict';
const { CONFIG_COUNTS, DIGEST } = require('./sheikha-industrial-federation-v1.cjs');

const KINDS = Object.freeze({ foundry: 'FACTORY_AND_LINE_BLUEPRINT_DRAFT', farm: 'SIMULATED_HARVEST_DRAFT',
  line: 'SIMULATED_LINE_OUTPUT_DRAFT', cluster: 'CLUSTER_BLUEPRINT_DRAFT' });
const POLICY = Object.freeze({ mode: 'SIMULATION_ONLY', historicalOnly: true, sectorCalibrated: false,
  improvementVerified: false, causalEffectEstablished: false, approvalGranted: false,
  physicalExecutionEnabled: false, publicationEnabled: false, externalCallsMade: false,
  reviewDecisionsChanged: false, requestsAutomaticallyResolved: false });
const fail = code => { throw Error(`COMPARISON_${code}`); };
const integer = (n, max) => Number.isSafeInteger(n) && n >= 0 && n <= max;
const arrayOfSize = (items, size) => Array.isArray(items) && items.length === size;
const sameConfig = (a, b) => ['name', 'templateId', ...CONFIG_COUNTS].every(k => a[k] === b[k]);

function measurements(snapshot) {
  const config = snapshot.config, expected = new Map();
  let networkFaults = 0, farmFaults = 0;
  const network = (n, id, kind) => {
    if (!n || n.id !== id || n.kind !== kind || !integer(n.completedCells, 7) || n.totalCells !== 7
      || !integer(n.progressPercent, 100) || !['IDLE', 'RUNNING', 'COMPLETE', 'FAULT_LATCHED', 'ESTOP_LATCHED'].includes(n.state)
      || (n.completedCells === 7) !== (n.progressPercent === 100)
      || n.state === 'COMPLETE' && n.completedCells !== 7
      || n.completedCells === 7 && !['COMPLETE', 'ESTOP_LATCHED'].includes(n.state)
      || n.state === 'IDLE' && (n.completedCells !== 0 || n.progressPercent !== 0)) fail('EVIDENCE_REJECTED');
    if (n.state === 'FAULT_LATCHED') networkFaults++;
    expected.set(id, { kind: KINDS[kind], emitted: n.completedCells === 7 });
  };
  // Validate every topology and artifact field used for counting; the archive hash alone is not sufficient.
  for (const [i, c] of snapshot.clusters.entries()) {
    if (!c || c.id !== `c${i + 1}` || !['COMPLETE', 'INCOMPLETE'].includes(c.state)
      || !arrayOfSize(c.foundries, config.foundriesPerCluster) || !arrayOfSize(c.farms, config.farmsPerCluster)
      || !arrayOfSize(c.factories, config.factoriesPerCluster)) fail('EVIDENCE_REJECTED');
    for (const [j, n] of c.foundries.entries()) network(n, `${c.id}-f${j + 1}`, 'foundry');
    for (const [j, farm] of c.farms.entries()) {
      if (!farm || farm.id !== `${c.id}-p${j + 1}` || farm.kind !== 'farm' || !integer(farm.progressPercent, 100)
        || !['WAITING', 'GROWING', 'COMPLETE', 'FAULT_LATCHED'].includes(farm.state)
        || (farm.state === 'COMPLETE') !== (farm.progressPercent === 100)
        || farm.state === 'WAITING' && farm.progressPercent !== 0
        || farm.state === 'GROWING' && farm.progressPercent === 0) fail('EVIDENCE_REJECTED');
      if (farm.state === 'FAULT_LATCHED') farmFaults++;
      expected.set(farm.id, { kind: KINDS.farm, emitted: farm.state === 'COMPLETE' });
    }
    for (const [j, factory] of c.factories.entries()) {
      if (!factory || factory.id !== `${c.id}-m${j + 1}` || !arrayOfSize(factory.lines, config.linesPerFactory)) fail('EVIDENCE_REJECTED');
      for (const [k, n] of factory.lines.entries()) network(n, `${factory.id}-l${k + 1}`, 'line');
    }
    const lines = c.factories.flatMap(f => f.lines);
    if ((c.state === 'COMPLETE') !== lines.every(n => n.completedCells === 7)
      || lines.some(n => n.progressPercent > 0) && (!c.foundries.every(n => n.completedCells === 7)
        || !c.farms.every(n => n.state === 'COMPLETE'))) fail('EVIDENCE_REJECTED');
    expected.set(c.id, { kind: KINDS.cluster, emitted: c.state === 'COMPLETE' });
  }
  const counts = Object.fromEntries(Object.values(KINDS).map(kind => [kind, 0])), seen = new Set();
  for (const a of snapshot.artifacts) {
    const node = expected.get(a.nodeId);
    if (!node || !node.emitted || seen.has(a.nodeId) || a.kind !== node.kind
      || a.id !== `${snapshot.id}:${snapshot.generation}:${a.nodeId}` || a.sectorId !== config.templateId
      || !integer(a.tick, snapshot.tick) || a.tick === 0 || a.designMaturity !== 'CONCEPT_NOT_MANUFACTURING_DRAWING') fail('EVIDENCE_REJECTED');
    seen.add(a.nodeId); counts[a.kind]++;
  }
  if ([...expected].some(([id, n]) => n.emitted !== seen.has(id))
    || snapshot.state === 'COMPLETE' && (seen.size !== expected.size || networkFaults || farmFaults)
    || (snapshot.state === 'COMPLETE') !== snapshot.clusters.every(c => c.state === 'COMPLETE')
    || snapshot.state === 'LIMIT_REACHED' && snapshot.tick !== 200
    || snapshot.state === 'READY' && (snapshot.tick !== 0 || seen.size)) fail('EVIDENCE_REJECTED');
  return { steps: snapshot.tick, expectedArtifacts: expected.size, emittedArtifacts: seen.size,
    missingArtifacts: expected.size - seen.size, foundryArtifacts: counts[KINDS.foundry], farmArtifacts: counts[KINDS.farm],
    lineArtifacts: counts[KINDS.line], clusterArtifacts: counts[KINDS.cluster], networkFaults, farmFaults };
}

function createFederationComparisons({ archive }) {
  function read(id) {
    if (typeof id !== 'string' || !DIGEST.test(id)) fail('INPUT_REJECTED');
    const candidate = archive.read(id), child = candidate.snapshot, d = child.derivation;
    if (!d) fail('SOURCE_REQUIRED');
    let source;
    try { source = archive.read(d.sourceArchiveId); }
    catch (error) { if (error.message === 'ARCHIVE_NOT_FOUND') fail('SOURCE_NOT_FOUND'); throw error; }
    const parent = source.snapshot;
    if (parent.id !== d.sourceRunId || parent.revision !== d.sourceRevision || parent.generation !== d.sourceGeneration
      || !sameConfig(parent.config, d.baselineConfig) || parent.config.templateId !== child.config.templateId
      || parent.engineProfile !== child.engineProfile) fail('LINEAGE_MISMATCH');
    let before, after;
    try { before = measurements(parent); after = measurements(child); }
    catch { fail('EVIDENCE_REJECTED'); }
    const ref = r => ({ archiveId: r.id, runId: r.snapshot.id, revision: r.snapshot.revision, generation: r.snapshot.generation,
      name: r.snapshot.config.name, state: r.snapshot.state, savedAt: r.savedAt });
    const difference = (key, a, b) => ({ key, source: a, candidate: b, delta: b - a });
    return { schemaVersion: 1, kind: 'ARCHIVED_SIMULATION_COMPARISON', source: ref(source), candidate: ref(candidate),
      context: { templateId: child.config.templateId, engineProfile: child.engineProfile },
      basis: { status: parent.state === 'COMPLETE' && child.state === 'COMPLETE' ? 'BOTH_COMPLETE' : 'PARTIAL',
        sourceComplete: parent.state === 'COMPLETE', candidateComplete: child.state === 'COMPLETE', sameTick: parent.tick === child.tick },
      configuration: CONFIG_COUNTS.map(key => difference(key, parent.config[key], child.config[key])),
      metrics: Object.keys(before).map(key => difference(key, before[key], after[key])), policy: { ...POLICY } };
  }
  return { read };
}
module.exports = { createFederationComparisons };
