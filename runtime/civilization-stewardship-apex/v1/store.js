'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const COLLECTIONS = ['mandates', 'reviews', 'delegations', 'evidenceLinks'];
const sleepArray = new Int32Array(new SharedArrayBuffer(4));

function rootDir() {
  if (process.env.SHEIKHA_CIVILIZATION_STEWARDSHIP_DATA_DIR) {
    return process.env.SHEIKHA_CIVILIZATION_STEWARDSHIP_DATA_DIR;
  }
  if (process.env.NODE_ENV === 'test') {
    return path.join(os.tmpdir(), 'sheikha-civilization-stewardship-apex', String(process.pid));
  }
  return path.join(process.cwd(), 'data', 'sheikha-civilization-stewardship-apex');
}

function locations() {
  const root = rootDir();
  return {
    root,
    state: path.join(root, 'state.json'),
    audit: path.join(root, 'audit.jsonl'),
    lock: path.join(root, 'state.lock')
  };
}

function initialState() {
  return {
    schema: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_STATE_V1',
    revision: 0,
    updatedAt: null,
    mandates: [],
    reviews: [],
    delegations: [],
    evidenceLinks: []
  };
}

function sleep(milliseconds) {
  Atomics.wait(sleepArray, 0, 0, milliseconds);
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
      sleep(10);
    }
  }
  const error = new Error('Civilization Stewardship Apex state lock timed out.');
  error.code = 'CIVILIZATION_STEWARDSHIP_LOCK_TIMEOUT';
  error.statusCode = 503;
  throw error;
}

function releaseLock(paths, descriptor) {
  let releaseError = null;
  try {
    fs.closeSync(descriptor);
  } catch (error) {
    releaseError = error;
  }
  try {
    fs.unlinkSync(paths.lock);
  } catch (error) {
    if (error.code !== 'ENOENT' && !releaseError) releaseError = error;
  }
  if (releaseError) throw releaseError;
}

function writeAt(paths, state) {
  const temporary = `${paths.state}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.renameSync(temporary, paths.state);
}

function ensure() {
  const paths = locations();
  fs.mkdirSync(paths.root, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(paths.state)) {
    const descriptor = acquireLock(paths);
    try {
      if (!fs.existsSync(paths.state)) writeAt(paths, initialState());
    } finally {
      releaseLock(paths, descriptor);
    }
  }
  return paths;
}

function read() {
  const paths = ensure();
  const parsed = JSON.parse(fs.readFileSync(paths.state, 'utf8'));
  const state = { ...initialState(), ...parsed };
  COLLECTIONS.forEach((name) => {
    if (!Array.isArray(state[name])) state[name] = [];
  });
  return state;
}

function transact(event, mutate) {
  const paths = ensure();
  const descriptor = acquireLock(paths);
  try {
    const state = JSON.parse(fs.readFileSync(paths.state, 'utf8'));
    const result = mutate(state);
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    writeAt(paths, state);
    fs.appendFileSync(paths.audit, `${JSON.stringify({
      audit: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_AUDIT_V1',
      revision: state.revision,
      at: state.updatedAt,
      action: event.action,
      actorId: event.actorId || 'civilization-stewardship-apex',
      resourceId: event.resourceId || result?.id || null,
      outcome: 'SUCCESS',
      metadata: event.metadata || {}
    })}\n`, { encoding: 'utf8', mode: 0o600 });
    return result;
  } finally {
    releaseLock(paths, descriptor);
  }
}

function auditEntries(limit = 100) {
  const paths = ensure();
  if (!fs.existsSync(paths.audit)) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return fs.readFileSync(paths.audit, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
    .slice(-safeLimit);
}

function status() {
  const state = read();
  return {
    persistence: 'ATOMIC_JSON_SINGLE_HOST',
    singleHostMultiProcessLock: true,
    distributedTransactionalStore: false,
    revision: state.revision,
    updatedAt: state.updatedAt,
    counts: Object.fromEntries(COLLECTIONS.map(name => [name, state[name].length]))
  };
}

module.exports = { auditEntries, read, rootDir, status, transact };
