'use strict';
const { isDeepStrictEqual } = require('node:util');
const { ARCHIVE_LIMITS } = require('./sheikha-industrial-archive-v1.cjs');

const POLICY = Object.freeze({ mode: 'SIMULATION_ONLY', historicalOnly: true, atomicSnapshot: false,
  signatureAuthenticated: false, currentReviewVerified: false, approvalGranted: false,
  improvementVerified: false, replaySupported: false, physicalExecutionEnabled: false,
  publicationEnabled: false, externalCallsMade: false, reviewDecisionsChanged: false });
const ref = r => ({ id: r.id, savedAt: r.savedAt, runId: r.snapshot.id, name: r.snapshot.config.name,
  templateId: r.snapshot.config.templateId, state: r.snapshot.state, generation: r.snapshot.generation,
  revision: r.snapshot.revision, tick: r.snapshot.tick, artifactCount: r.snapshot.artifacts.length });

function createFederationLineage({ archive }) {
  function read() {
    const listed = archive.list();
    if (listed.records.length > ARCHIVE_LIMITS.records) throw Error('LINEAGE_CAPACITY_LIMIT');
    const records = new Map(), groups = new Map();
    let unavailableRecords = listed.unavailableRecords;
    // One bounded pass; a record lost between listing and reading is omitted, never reconstructed.
    for (const item of listed.records) {
      let r;
      try { r = archive.read(item.id); }
      catch (error) {
        if (!['ARCHIVE_NOT_FOUND', 'ARCHIVE_RECORD_REJECTED', 'ARCHIVE_UNAVAILABLE'].includes(error.message)) throw error;
        unavailableRecords++; continue;
      }
      records.set(r.id, r);
      if (!groups.has(r.snapshot.id)) groups.set(r.snapshot.id, []);
      groups.get(r.snapshot.id).push(r);
    }
    const experiments = new Map();
    for (const [runId, snapshots] of groups) {
      snapshots.sort((a, b) => b.snapshot.revision - a.snapshot.revision || a.id.localeCompare(b.id));
      const s = snapshots[0].snapshot, d = s.derivation;
      const consistent = new Set(snapshots.map(r => r.snapshot.revision)).size === snapshots.length
        && snapshots.every(r => isDeepStrictEqual(r.snapshot.config, s.config)
          && isDeepStrictEqual(r.snapshot.derivation, d) && r.snapshot.engineProfile === s.engineProfile);
      experiments.set(runId, { runId, name: s.config.name, templateId: s.config.templateId,
        archiveIds: snapshots.map(r => r.id), source: consistent && d ? { archiveId: d.sourceArchiveId, runId: d.sourceRunId } : null,
        linkStatus: !consistent ? 'INCONSISTENT_RUN' : d ? 'SOURCE_UNAVAILABLE' : 'ORIGINAL' });
    }
    for (const e of experiments.values()) {
      if (!e.source) continue;
      const child = records.get(e.archiveIds[0]).snapshot, d = child.derivation;
      const parent = records.get(d.sourceArchiveId)?.snapshot;
      if (!parent) continue;
      e.linkStatus = parent.id === d.sourceRunId && parent.revision === d.sourceRevision
        && parent.generation === d.sourceGeneration && isDeepStrictEqual(parent.config, d.baselineConfig)
        && parent.config.templateId === child.config.templateId && parent.engineProfile === child.engineProfile
        && experiments.get(parent.id).linkStatus !== 'INCONSISTENT_RUN' ? 'MATCHED' : 'SOURCE_MISMATCH';
    }
    // Traverse run identities, not successive saves or reset generations; bound every walk by the index size.
    const cyclic = new Set();
    for (const start of experiments.values()) {
      const path = [], seen = new Map(); let current = start;
      while (current?.linkStatus === 'MATCHED' && path.length <= experiments.size) {
        if (seen.has(current.runId)) { path.slice(seen.get(current.runId)).forEach(id => cyclic.add(id)); break; }
        seen.set(current.runId, path.length); path.push(current.runId); current = experiments.get(current.source.runId);
      }
    }
    for (const id of cyclic) experiments.get(id).linkStatus = 'CYCLE';
    const families = new Map();
    for (const e of experiments.values()) {
      let root = e, depth = 0;
      while (root.linkStatus === 'MATCHED' && depth < experiments.size) { root = experiments.get(root.source.runId); depth++; }
      e.familyId = root.runId; e.depth = depth; e.ancestryStatus = root.linkStatus === 'ORIGINAL' ? 'COMPLETE' : 'INCOMPLETE';
      if (!families.has(root.runId)) families.set(root.runId, { id: root.runId, name: root.name,
        ancestryStatus: e.ancestryStatus, experimentIds: [] });
      families.get(root.runId).experimentIds.push(e.runId);
    }
    for (const f of families.values()) f.experimentIds.sort((a, b) => experiments.get(a).depth - experiments.get(b).depth || a.localeCompare(b));
    return { schemaVersion: 1, kind: 'ARCHIVED_SIMULATION_LINEAGE',
      records: [...records.values()].map(ref).sort((a, b) => b.savedAt.localeCompare(a.savedAt) || a.id.localeCompare(b.id)),
      experiments: [...experiments.values()].sort((a, b) => a.runId.localeCompare(b.runId)),
      families: [...families.values()].sort((a, b) => a.id.localeCompare(b.id)),
      unavailableRecords, limits: { ...ARCHIVE_LIMITS }, policy: { ...POLICY } };
  }
  return { read };
}
module.exports = { createFederationLineage };
