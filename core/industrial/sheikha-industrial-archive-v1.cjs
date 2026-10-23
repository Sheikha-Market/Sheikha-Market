'use strict';

const path = require('node:path');
const { createHash } = require('node:crypto');
const { validConfig, validDerivation } = require('./sheikha-industrial-federation-v1.cjs');
const { createPrivateStore } = require('./sheikha-industrial-private-store-v1.cjs');

const ARCHIVE_LIMITS = Object.freeze({ records: 100, bytes: 256 * 1024, directoryEntries: 104 });
const POLICY = Object.freeze({ reviewOnly: true, replaySupported: false, approvalGranted: false,
  signatureAuthenticated: false, physicalExecutionEnabled: false });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).sort().join(',') === keys.split(',').sort().join(',');
const integer = (value, max) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const fail = code => { throw Error(code); };

function validSnapshot(s) {
  return exact(s, 'id,revision,generation,config,state,tick,limits,boundaries,engineProfile,execution,clusters,artifacts,events,expiresAt'
      + (Object.hasOwn(s || {}, 'derivation') ? ',derivation' : ''))
    && /^[a-f0-9-]{36}$/.test(s.id) && validConfig(s.config)
    && (!Object.hasOwn(s, 'derivation') || validDerivation(s.derivation, s.config) && s.derivation.sourceRunId !== s.id)
    && integer(s.revision, Number.MAX_SAFE_INTEGER) && integer(s.generation, s.revision) && integer(s.tick, 200)
    && ['READY', 'RUNNING', 'PAUSED', 'STOPPED', 'COMPLETE', 'LIMIT_REACHED'].includes(s.state)
    && s.engineProfile === 'EXISTING_SEVEN_CELL_DEMO_NOT_A_SECTOR_PHYSICS_MODEL'
    && Number.isFinite(Date.parse(s.expiresAt))
    && exact(s.boundaries, 'mode,sectorCalibrated,physicalCommandSent,physicalAgriculturePerformed,realFactoriesBuilt,realHarvestVerified,productionReady,automaticPropagation,externalCallsMade,paymentEnabled,publicationEnabled,superiorityClaimVerified')
    && s.boundaries.mode === 'SIMULATION_ONLY' && s.boundaries.realFactoriesBuilt === 0
    && Object.entries(s.boundaries).every(([key, value]) => ['mode', 'realFactoriesBuilt'].includes(key) || value === false)
    && exact(s.execution, 'automaticServerScheduler,persistentStorage,independentPhysicalSafetyRequired')
    && s.execution.automaticServerScheduler === false && s.execution.persistentStorage === false
    && s.execution.independentPhysicalSafetyRequired === true
    && Array.isArray(s.clusters) && s.clusters.length === s.config.clusters
    && Array.isArray(s.artifacts) && s.artifacts.length <= 64
    && s.artifacts.every(a => a && a.physicalOutput === false && a.reviewStatus === 'DRAFT_REQUIRES_HUMAN_REVIEW')
    && Array.isArray(s.events) && s.events.length <= 160;
}

function createFederationArchive({ root = path.resolve(__dirname, '../../runtime/industrial-federation-archive/v1'), now = Date.now } = {}) {
  const files = createPrivateStore({ root, limits: ARCHIVE_LIMITS, prefix: 'ARCHIVE' });
  function read(id) {
    const record = files.read(id);
    try {
      if (!exact(record, 'schemaVersion,id,savedAt,policy,snapshotSha256,snapshot') || record.schemaVersion !== 1
        || record.id !== id || record.snapshotSha256 !== id || !Number.isFinite(Date.parse(record.savedAt))
        || !exact(record.policy, Object.keys(POLICY).join(',')) || Object.entries(POLICY).some(([k, v]) => record.policy[k] !== v)
        || !validSnapshot(record.snapshot) || hash(record.snapshot) !== id) fail('ARCHIVE_RECORD_REJECTED');
      return record;
    } catch { fail('ARCHIVE_RECORD_REJECTED'); }
  }
  function list() {
    const records = []; let unavailableRecords = 0;
    for (const name of files.entries()) {
      if (name === '.write-lock' || /^\.[a-f0-9-]{36}\.tmp$/.test(name)) continue;
      if (!/^[a-f0-9]{64}\.json$/.test(name)) { unavailableRecords++; continue; }
      try {
        const r = read(name.slice(0, -5)), s = r.snapshot;
        records.push({ id: r.id, savedAt: r.savedAt, runId: s.id, name: s.config.name,
          state: s.state, generation: s.generation, revision: s.revision, tick: s.tick, artifactCount: s.artifacts.length });
      } catch { unavailableRecords++; }
    }
    records.sort((a, b) => b.savedAt.localeCompare(a.savedAt) || a.id.localeCompare(b.id));
    return { records, unavailableRecords, limits: ARCHIVE_LIMITS, policy: POLICY };
  }
  function save(snapshot) {
    if (!validSnapshot(snapshot)) fail('ARCHIVE_INPUT_REJECTED');
    const id = hash(snapshot), record = { schemaVersion: 1, id, savedAt: new Date(now()).toISOString(),
      policy: POLICY, snapshotSha256: id, snapshot };
    const bytes = Buffer.from(JSON.stringify(record) + '\n');
    if (bytes.length > ARCHIVE_LIMITS.bytes) fail('ARCHIVE_INPUT_REJECTED');
    return files.withLock(() => {
      if (files.entries().includes(`${id}.json`)) return read(id);
      files.write(id, record);
      return read(id);
    });
  }
  // No import, replay, deletion or restore-to-engine operation is exposed.
  return { save, read, list };
}

module.exports = { createFederationArchive, ARCHIVE_LIMITS };
