'use strict';

const fs = require('fs');
const path = require('path');

const COLLECTIONS = [
  'organizations',
  'workspaces',
  'projects',
  'users',
  'subscriptions',
  'seats',
  'licenses',
  'usageEvents',
  'apiKeys'
];

function dataDir() {
  return process.env.SHEIKHA_SAAS_V2_DATA_DIR ||
    path.join(process.cwd(), 'data', 'sheikha-enterprise-saas-v2');
}

function paths() {
  const root = dataDir();
  return {
    root,
    state: path.join(root, 'state.json'),
    audit: path.join(root, 'audit.jsonl')
  };
}

function defaultState() {
  return {
    schema: 'SHEIKHA_ENTERPRISE_SAAS_STATE_V2',
    revision: 0,
    updatedAt: null,
    organizations: [],
    workspaces: [],
    projects: [],
    users: [],
    subscriptions: [],
    seats: [],
    licenses: [],
    usageEvents: [],
    apiKeys: []
  };
}

function ensureStorage() {
  const storage = paths();
  fs.mkdirSync(storage.root, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(storage.state)) {
    writeState(defaultState());
  }
  return storage;
}

function readState() {
  const storage = ensureStorage();
  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(storage.state, 'utf8'));
  } catch (error) {
    const wrapped = new Error(`Unable to read SaaS V2 state: ${error.message}`);
    wrapped.code = 'SAAS_STATE_READ_FAILED';
    wrapped.statusCode = 500;
    throw wrapped;
  }

  const state = { ...defaultState(), ...parsed };
  for (const collection of COLLECTIONS) {
    if (!Array.isArray(state[collection])) state[collection] = [];
  }
  return state;
}

function writeState(state) {
  const storage = paths();
  fs.mkdirSync(storage.root, { recursive: true, mode: 0o700 });
  const temporary = `${storage.state}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.renameSync(temporary, storage.state);
}

function appendAudit(entry) {
  const storage = ensureStorage();
  fs.appendFileSync(storage.audit, `${JSON.stringify(entry)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  });
}

function transact(event, mutate) {
  const state = readState();
  const result = mutate(state);
  state.revision += 1;
  state.updatedAt = new Date().toISOString();
  writeState(state);
  appendAudit({
    audit: 'SHEIKHA_ENTERPRISE_SAAS_AUDIT_V2',
    eventId: `audit-${state.revision}`,
    revision: state.revision,
    at: state.updatedAt,
    action: event.action,
    actorId: event.actorId,
    role: event.role,
    tenantId: event.tenantId || null,
    resourceId: event.resourceId || result?.id || null,
    outcome: 'SUCCESS',
    metadata: event.metadata || {}
  });
  return result;
}

function readAudit({ tenantId = null, limit = 100 } = {}) {
  const storage = ensureStorage();
  if (!fs.existsSync(storage.audit)) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  return fs.readFileSync(storage.audit, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
    .filter(entry => !tenantId || entry.tenantId === tenantId)
    .slice(-safeLimit);
}

function status() {
  const state = readState();
  return {
    persistence: 'ATOMIC_JSON_SINGLE_NODE',
    productionDatabaseRequiredForClusterWrites: true,
    revision: state.revision,
    updatedAt: state.updatedAt,
    counts: Object.fromEntries(COLLECTIONS.map(name => [name, state[name].length]))
  };
}

module.exports = {
  COLLECTIONS,
  appendAudit,
  dataDir,
  defaultState,
  readAudit,
  readState,
  status,
  transact
};
