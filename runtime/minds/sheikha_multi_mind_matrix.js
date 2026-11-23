'use strict';

const { createHash } = require('node:crypto');
const { createPrivateStore } = require('../../core/industrial/sheikha-industrial-private-store-v1.cjs');
const { SheikhaInfiniteAgentKernel, POLICY } = require('../sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
const research = require('../../core/research/sheikha-research-brain-v1.cjs');
const natural = require('../sheikha-natural-integration/v1/sheikha-natural-integration-model');
const localKernel = require('../kernel/sheikha-kernel');

const SCHEMA = 'SHEIKHA_LOCAL_MULTI_MIND_V1';
const STATE_ID = createHash('sha256').update(SCHEMA).digest('hex');
const LIMITS = Object.freeze({ totalBots: 128, botsPerMind: 16, replicationBatch: 8, journalEntries: 128 });
const role = (name, actions) => Object.freeze({ name, actions: Object.freeze(actions) });
const CATALOG = Object.freeze({
  governor: role('الحاكم', ['review-operation']),
  trader: role('التاجر', ['compare-offers']),
  scholar: role('العالم', ['research-plan', 'summarize-sample']),
  ceo: role('المدير التنفيذي', ['work-plan']),
  strategist: role('المدير الاستراتيجي', ['roadmap']),
  engineer: role('المهندس', ['kernel-self-test']),
  earth: role('إعمار الأرض', ['simulate-water']),
  heavens_earth: role('البحث في السماوات والأرض', ['research-plan']),
  cosmic: role('البحث الكوني', ['research-plan']),
  omni: role('متخصص عام', ['research-plan']),
  guardian: role('الحارس', ['review-operation']),
  watch: role('المراقب', ['status']),
  editor: role('المحرر', ['prepare-change'])
});
const KEYS = Object.keys(CATALOG);

function fail(code) { const error = new Error(code); error.code = code; throw error; }
function record(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
      Reflect.ownKeys(value).some(key => typeof key !== 'string' || !keys.includes(key) ||
        !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'))) fail('INVALID_MIND_INPUT');
  return value;
}
function integer(value, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail('INVALID_MIND_INPUT');
  return value;
}
function mindKey(key) {
  if (typeof key !== 'string' || !Object.hasOwn(CATALOG, key)) fail('MIND_NOT_FOUND');
  return key;
}
function admitted(key, action) {
  mindKey(key);
  if (!CATALOG[key].actions.includes(action)) fail('MIND_ACTION_NOT_ALLOWED');
}

// No executable objects, getters, shared references or unbounded input trees.
function data(input) {
  let nodes = 0;
  const seen = new WeakSet();
  function walk(value, depth) {
    if (++nodes > 2048 || depth > 8) fail('INVALID_MIND_INPUT');
    if (value === null || typeof value === 'boolean') return;
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (typeof value === 'string' && value.length <= 2000) return;
    if (!value || typeof value !== 'object' || seen.has(value)) fail('INVALID_MIND_INPUT');
    seen.add(value);
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 512 ||
          Reflect.ownKeys(value).length !== value.length + 1) fail('INVALID_MIND_INPUT');
      for (let i = 0; i < value.length; i++) {
        const property = Object.getOwnPropertyDescriptor(value, String(i));
        if (!property || !Object.hasOwn(property, 'value')) fail('INVALID_MIND_INPUT');
        walk(property.value, depth + 1);
      }
    } else {
      record(value, Object.keys(value).filter(key => !['__proto__', 'constructor', 'prototype'].includes(key)));
      for (const item of Object.values(value)) walk(item, depth + 1);
    }
  }
  walk(input, 0);
  const encoded = JSON.stringify(input);
  if (Buffer.byteLength(encoded) > 16384) fail('INVALID_MIND_INPUT');
  return JSON.parse(encoded);
}

function initialState() {
  return { schema: SCHEMA, revision: 0, counts: Object.fromEntries(KEYS.map(key => [key, 1])), journal: [] };
}
function validateState(state) {
  try {
    record(state, ['schema', 'revision', 'counts', 'journal']);
    if (state.schema !== SCHEMA) fail('INVALID_MIND_INPUT');
    integer(state.revision, 0, Number.MAX_SAFE_INTEGER - 1);
    record(state.counts, KEYS);
    if (Object.keys(state.counts).length !== KEYS.length) fail('INVALID_MIND_INPUT');
    for (const count of Object.values(state.counts)) integer(count, 1, LIMITS.botsPerMind);
    if (Object.values(state.counts).reduce((a, b) => a + b, 0) > LIMITS.totalBots) fail('INVALID_MIND_INPUT');
    if (!Array.isArray(state.journal) || state.journal.length !== Math.min(state.revision, LIMITS.journalEntries)) fail('INVALID_MIND_INPUT');
    state.journal.forEach((entry, index) => {
      record(entry, ['sequence', 'mind', 'action', 'status', 'at']);
      if (entry.sequence !== state.revision - state.journal.length + index + 1) fail('INVALID_MIND_INPUT');
      mindKey(entry.mind);
      if (!['initialize', 'replicate', ...CATALOG[entry.mind].actions].includes(entry.action) ||
          !['LOCAL_COMPUTATION_COMPLETED', 'PLAN_ONLY', 'DENIED', 'LOCAL_DESCRIPTORS_CREATED', 'LOCAL_STATE_INITIALIZED'].includes(entry.status) ||
          typeof entry.at !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(entry.at)) fail('INVALID_MIND_INPUT');
    });
    return state;
  } catch (_error) { fail('MIND_STATE_INVALID'); }
}

function registry(state) {
  const kernel = new SheikhaInfiniteAgentKernel({ maxAgents: LIMITS.totalBots, maxDepth: 1,
    maxChildren: LIMITS.botsPerMind - 1, totalBudget: LIMITS.totalBots });
  for (const key of KEYS) {
    const root = kernel.registerBot({ id: key + '-root', name: CATALOG[key].name });
    for (let index = 1; index < state.counts[key]; index++) {
      root.spawnChild({ id: key + '-cell-' + index, name: CATALOG[key].name });
    }
  }
  return kernel;
}

function compareOffers(input) {
  record(input, ['offers', 'quantity']);
  integer(input.quantity, 1, 1000000);
  if (!Array.isArray(input.offers) || input.offers.length < 1 || input.offers.length > 32) fail('INVALID_MIND_INPUT');
  const ids = new Set();
  const offers = input.offers.map(offer => {
    record(offer, ['id', 'unitPriceMinor', 'shippingMinor', 'availableQuantity', 'leadDays']);
    if (typeof offer.id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(offer.id) || ids.has(offer.id)) fail('INVALID_MIND_INPUT');
    ids.add(offer.id);
    integer(offer.unitPriceMinor, 0, 1000000000);
    integer(offer.shippingMinor, 0, 1000000000);
    integer(offer.availableQuantity, 0, 1000000);
    integer(offer.leadDays, 0, 3650);
    return { id: offer.id, totalMinor: offer.unitPriceMinor * input.quantity + offer.shippingMinor,
      sufficientStock: offer.availableQuantity >= input.quantity, leadDays: offer.leadDays };
  }).sort((a, b) => Number(b.sufficientStock) - Number(a.sufficientStock) || a.totalMinor - b.totalMinor || a.leadDays - b.leadDays);
  return { offers, scope: 'USER_SUPPLIED_SAME_CURRENCY_ARITHMETIC', supplierVerified: false, orderPlaced: false };
}

function compute(key, action, input, state) {
  switch (action) {
    case 'review-operation': {
      const decision = registry(state).evaluateOperation(key + '-root', input);
      return { status: decision.status === 'DENIED' ? 'DENIED' : 'PLAN_ONLY', result: decision };
    }
    case 'compare-offers': return { result: compareOffers(input) };
    case 'research-plan': return { status: 'PLAN_ONLY', result: research.plan(input) };
    case 'summarize-sample':
      record(input, ['values']);
      return { result: research.summarize(input.values) };
    case 'simulate-water': return { result: natural.simulateDay(input), synthetic: true };
    case 'kernel-self-test':
      record(input, []);
      return { result: localKernel.verifyLocal() };
    case 'status':
      record(input, []);
      return { result: { statistics: registry(state).statistics(), journalRevision: state.revision, liveMonitoring: false } };
    case 'work-plan': {
      record(input, ['tasks']);
      if (!Array.isArray(input.tasks) || !input.tasks.length || input.tasks.length > 32) fail('INVALID_MIND_INPUT');
      const tasks = input.tasks.map((task, index) => {
        record(task, ['mind', 'action']); admitted(task.mind, task.action);
        return { step: index + 1, mind: task.mind, action: task.action, status: 'AWAITING_EXPLICIT_DISPATCH' };
      });
      return { status: 'PLAN_ONLY', result: { tasks, delegatedExecution: false } };
    }
    case 'roadmap':
      record(input, ['horizonDays']); integer(input.horizonDays, 1, 365);
      return { status: 'PLAN_ONLY', result: { horizonDays: input.horizonDays,
        milestones: ['DEFINE_SCOPE', 'VERIFY_BASELINE', 'LOCAL_PROTOTYPE', 'TEST_AND_REVIEW', 'REQUEST_RELEASE_APPROVAL'] } };
    case 'prepare-change':
      record(input, ['component', 'changeType']);
      if (!['kernel', 'minds', 'routes'].includes(input.component) ||
          !['fix', 'test', 'documentation'].includes(input.changeType)) fail('INVALID_MIND_INPUT');
      return { status: 'PLAN_ONLY', result: { ...input, steps: ['READ_CURRENT_STATE', 'REVIEW_DIFF', 'PREPARE_PATCH', 'RUN_TESTS', 'HUMAN_REVIEW'],
        filesModified: false, patchGenerated: false } };
    default: fail('MIND_ACTION_NOT_ALLOWED');
  }
}

class SheikhaMultiMindMatrix {
  #state = initialState();
  #store;
  constructor(options = {}) {
    record(options, ['stateRoot']);
    if (options.stateRoot !== undefined) {
      if (typeof options.stateRoot !== 'string' || !options.stateRoot.startsWith('/')) fail('INVALID_MIND_INPUT');
      this.#store = createPrivateStore({ root: options.stateRoot, prefix: 'MIND_STATE',
        limits: { bytes: 65536, records: 1, directoryEntries: 4 } });
    }
    Object.freeze(this);
  }
  #load() {
    if (!this.#store) return { state: structuredClone(this.#state), saved: false };
    try { return { state: validateState(this.#store.read(STATE_ID)), saved: true }; }
    catch (error) { if (error.message === 'MIND_STATE_NOT_FOUND') return { state: initialState(), saved: false }; throw error; }
  }
  #mutate(key, action, operation) {
    const transaction = () => {
      const { state } = this.#load();
      const result = operation(state);
      state.revision++;
      state.journal.push({ sequence: state.revision, mind: key, action, status: result.status, at: new Date().toISOString() });
      state.journal = state.journal.slice(-LIMITS.journalEntries);
      validateState(state);
      if (this.#store) this.#store.write(STATE_ID, state, { replace: true });
      else this.#state = state;
      return { ...result, revision: state.revision, persisted: Boolean(this.#store), externalExecution: false };
    };
    return this.#store ? this.#store.withLock(transaction) : transaction();
  }
  initialize() {
    return this.#mutate('governor', 'initialize', state => ({ status: 'LOCAL_STATE_INITIALIZED',
      totalBots: registry(state).statistics().agents, executed: false }));
  }
  status() {
    const { state, saved } = this.#load();
    return { schema: SCHEMA, status: 'LOCAL_DESCRIPTOR_MODEL', governance: POLICY,
      model: 'CENTRAL_POLICY_WITH_ROLE_SCOPED_LOCAL_DISPATCH', revision: state.revision,
      statistics: registry(state).statistics(), limits: LIMITS,
      minds: KEYS.map(key => ({ key, ...CATALOG[key], rootBotId: key + '-root', cellsCount: state.counts[key] })),
      storage: { mode: this.#store ? 'PRIVATE_LOCAL_FILESYSTEM' : 'MEMORY', saved,
        survivesProcessRestart: saved, survivesHostReplacement: false, tamperProof: false },
      countScope: 'LOCAL_ROLE_DESCRIPTORS', seal: null, modelProviderConnected: false,
      distributedWorkersConnected: false, externalExecution: false, productionReady: false };
  }
  listMinds() { return this.status().minds; }
  journal() { return { entries: this.#load().state.journal, bounded: true, tamperProof: false, containsCommandInputs: false }; }
  replicate(input) {
    input = data(input); record(input, ['mind', 'count']);
    const key = mindKey(input.mind);
    const count = integer(input.count, 1, LIMITS.replicationBatch);
    return this.#mutate(key, 'replicate', state => {
      const total = Object.values(state.counts).reduce((a, b) => a + b, 0);
      if (state.counts[key] + count > LIMITS.botsPerMind || total + count > LIMITS.totalBots) fail('MIND_CAPACITY_EXCEEDED');
      const start = state.counts[key];
      state.counts[key] += count;
      const kernel = registry(state);
      return { status: 'LOCAL_DESCRIPTORS_CREATED', created: count,
        botIds: Array.from({ length: count }, (_, i) => kernel.getBot(key + '-cell-' + (start + i)).id),
        totalBots: kernel.statistics().agents, executed: false, inheritance: 'ROLE_SCHEMA_AND_POLICY_ONLY' };
    });
  }
  replicateAll() { fail('EXPLICIT_BOUNDED_REPLICATION_REQUIRED'); }
  executeOrder(key, command) {
    key = mindKey(key);
    command = data(command); record(command, ['action', 'input']);
    admitted(key, command.action);
    const input = command.input === undefined ? {} : command.input;
    return this.#mutate(key, command.action, state => {
      let output;
      try { output = compute(key, command.action, input, state); }
      catch (error) { if (error.code === 'MIND_ACTION_NOT_ALLOWED' || error.code === 'MIND_NOT_FOUND') throw error; fail('INVALID_MIND_INPUT'); }
      const status = output.status || 'LOCAL_COMPUTATION_COMPLETED';
      return { ...output, status, mind: key, action: command.action,
        executed: status === 'LOCAL_COMPUTATION_COMPLETED', executionScope: 'LOCAL_DETERMINISTIC_FUNCTION_ONLY',
        modelProviderConnected: false, authorityGranted: false };
    });
  }
}

Object.freeze(SheikhaMultiMindMatrix.prototype);
module.exports = SheikhaMultiMindMatrix;
module.exports.CATALOG = CATALOG;
module.exports.LIMITS = LIMITS;
module.exports.STATE_ID = STATE_ID;
Object.freeze(module.exports);
