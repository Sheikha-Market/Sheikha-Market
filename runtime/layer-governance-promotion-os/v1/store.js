'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const sleepArray = new Int32Array(new SharedArrayBuffer(4));

function locations() {
  const root = process.env.SHEIKHA_LAYER_GOVERNANCE_DATA_DIR ||
    (process.env.NODE_ENV === 'test'
      ? path.join(os.tmpdir(), 'sheikha-layer-governance', String(process.pid))
      : path.join(process.cwd(), 'data', 'sheikha-layer-governance'));
  return {
    root,
    state: path.join(root, 'state.json'),
    audit: path.join(root, 'audit.jsonl'),
    lock: path.join(root, 'state.lock')
  };
}

function initialState() {
  return {
    schema: 'SHEIKHA_LAYER_GOVERNANCE_STATE_V1',
    revision: 0,
    updatedAt: null,
    assessments: [],
    proposals: [],
    promotions: []
  };
}

function acquireLock(paths) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    try {
      const descriptor = fs.openSync(paths.lock, 'wx', 0o600);
      fs.writeFileSync(descriptor, `${process.pid}:${Date.now()}\n`);
      return descriptor;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - fs.statSync(paths.lock).mtimeMs > 30000) {
          fs.unlinkSync(paths.lock);
          continue;
        }
      } catch (statError) {
        if (statError.code !== 'ENOENT') throw statError;
      }
      Atomics.wait(sleepArray, 0, 0, 10);
    }
  }
  const error = new Error('Layer governance state lock timed out.');
  error.code = 'LAYER_GOVERNANCE_LOCK_TIMEOUT';
  error.statusCode = 503;
  throw error;
}

function releaseLock(paths, descriptor) {
  try {
    fs.closeSync(descriptor);
  } finally {
    try {
      fs.unlinkSync(paths.lock);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

function writeState(paths, state) {
  const temporary = `${paths.state}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, paths.state);
}

function ensure() {
  const paths = locations();
  fs.mkdirSync(paths.root, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(paths.state)) writeState(paths, initialState());
  return paths;
}

function read() {
  const paths = ensure();
  const state = { ...initialState(), ...JSON.parse(fs.readFileSync(paths.state, 'utf8')) };
  ['assessments', 'proposals', 'promotions'].forEach(key => {
    if (!Array.isArray(state[key])) state[key] = [];
  });
  return state;
}

function transact(event, mutate) {
  const paths = ensure();
  const descriptor = acquireLock(paths);
  try {
    const state = { ...initialState(), ...JSON.parse(fs.readFileSync(paths.state, 'utf8')) };
    const result = mutate(state);
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    writeState(paths, state);
    fs.appendFileSync(paths.audit, `${JSON.stringify({
      audit: 'SHEIKHA_LAYER_GOVERNANCE_AUDIT_V1',
      revision: state.revision,
      at: state.updatedAt,
      action: event.action,
      actorId: event.actorId || 'SYSTEM_ADVISORY',
      resourceId: event.resourceId || result?.id || null,
      outcome: 'SUCCESS'
    })}\n`, { mode: 0o600 });
    return result;
  } finally {
    releaseLock(paths, descriptor);
  }
}

function auditEntries(limit = 100) {
  const paths = ensure();
  if (!fs.existsSync(paths.audit)) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return fs.readFileSync(paths.audit, 'utf8').split('\n').filter(Boolean)
    .map(line => JSON.parse(line)).slice(-safeLimit);
}

function status() {
  const state = read();
  return {
    persistence: 'ATOMIC_JSON_SINGLE_HOST',
    revision: state.revision,
    updatedAt: state.updatedAt,
    counts: {
      assessments: state.assessments.length,
      proposals: state.proposals.length,
      promotions: state.promotions.length
    }
  };
}

module.exports = { auditEntries, read, status, transact };
