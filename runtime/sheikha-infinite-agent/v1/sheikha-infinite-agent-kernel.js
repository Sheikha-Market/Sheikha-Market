'use strict';

// This is an in-memory descriptor kernel. It does not boot an OS, operate a
// factory, train a model, invoke an adapter, or grant external permissions.
const SCHEMA_VERSION = '1.0';
const CAPABILITY_NAMES = Object.freeze([
  'machine', 'factory', 'aiLearning', 'structure', 'superstructure',
  'substructure', 'system', 'os', 'compute', 'kernel', 'bareMetal',
  'interfaces', 'manifest', 'digitalTwin'
]);
const POLICY = Object.freeze({
  version: SCHEMA_VERSION,
  L0: Object.freeze({
    reference: 'QURAN_AND_SUNNAH',
    immutable: true,
    rules: Object.freeze(['NO_RIBA', 'NO_GHARAR', 'NO_HARM']),
    automatedReligiousCertification: false
  }),
  L1: Object.freeze({
    defaultDecision: 'DENIED',
    externalAuthorizationRequired: true,
    executionSupported: false
  }),
  L2: Object.freeze({
    mode: 'PLAN_ONLY',
    shellExecution: false,
    executionSupported: false
  })
});
const KERNEL_SCHEMA = Object.freeze({
  version: SCHEMA_VERSION,
  type: 'SHEIKHA_BOT',
  capabilityNames: CAPABILITY_NAMES,
  replication: 'EXPLICIT_LAZY_BOUNDED',
  inheritance: 'SCHEMA_AND_POLICY_ONLY'
});
const EVIDENCE = Object.freeze({
  physicalExecution: false,
  operatingSystemBooted: false,
  neuralModelLive: false,
  externalTwinVerified: false,
  adapterExecution: false
});
const LIMIT_CEILINGS = Object.freeze({
  maxAgents: 100000,
  maxDepth: 64,
  maxChildren: 10000,
  totalBudget: 100000
});
const DEFAULT_LIMITS = Object.freeze({
  maxAgents: 1000,
  maxDepth: 8,
  maxChildren: 100,
  totalBudget: 1000
});
const L1_ACTIONS = Object.freeze([
  'deploy', 'publish', 'change-dns', 'change-firewall', 'sign-contract',
  'change-model-weights', 'change-permissions', 'operate-device'
]);
const LOCAL_REPAIR_STEPS = Object.freeze({
  'inspect-module-resolution': 'Review a declared local module reference.',
  'inspect-port-ownership': 'Review local port ownership before proposing a change.',
  'prepare-stub-patch': 'Prepare a reviewable local patch without applying it.',
  'prepare-cleanup-plan': 'Prepare a local cleanup proposal without removing files.'
});
const INTERNAL_CREATION = Symbol('SHEIKHA_KERNEL_CREATION');

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

// Accept data records only: no getters, prototype payloads, symbols or functions.
// Validation errors intentionally omit input values.
function record(value, allowed, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) fail(code);
  const keys = Reflect.ownKeys(value);
  if (keys.length > 32) fail(code);
  for (const key of keys) {
    if (typeof key !== 'string' || !allowed.includes(key)) fail(code);
    const property = Object.getOwnPropertyDescriptor(value, key);
    if (!property || !Object.hasOwn(property, 'value')) fail(code);
  }
  return value;
}

function integer(value, min, max, code) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail(code);
  return value;
}

function reference(value, code = 'INVALID_REFERENCE') {
  if (typeof value !== 'string' || value.length > 96 ||
      !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(value) ||
      /^(?:sk-|gh[pousr]_|github_pat_|AIza|AKIA|ASIA|Bearer)/i.test(value)) fail(code);
  return value;
}

function name(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 128 ||
      /[\x00-\x1f\x7f]/.test(value)) fail('INVALID_BOT_NAME');
  return value;
}

function normalizeCapabilities(input = {}) {
  record(input, CAPABILITY_NAMES, 'INVALID_CAPABILITIES');
  const capabilities = {};
  for (const capability of CAPABILITY_NAMES) {
    const supplied = Object.hasOwn(input, capability) ? input[capability] : {};
    record(supplied, ['status', 'adapterRef'], 'INVALID_CAPABILITY_DESCRIPTOR');
    const status = supplied.status === undefined ? 'PLANNED' : supplied.status;
    if (!['PLANNED', 'LOCAL_SIMULATION'].includes(status)) fail('INVALID_CAPABILITY_STATUS');
    capabilities[capability] = Object.freeze({
      kind: capability,
      status,
      adapterRef: supplied.adapterRef == null ? null : reference(supplied.adapterRef),
      executionSupported: false
    });
  }
  return Object.freeze(capabilities);
}

function normalizeParty(input) {
  if (input == null) return null;
  record(input, ['physicalRef', 'digitalRef'], 'INVALID_DIGITAL_TWIN_PARTY');
  const physicalRef = input.physicalRef == null ? null : reference(input.physicalRef);
  const digitalRef = input.digitalRef == null ? null : reference(input.digitalRef);
  if (physicalRef === null && digitalRef === null) fail('DIGITAL_TWIN_REFERENCE_REQUIRED');
  return Object.freeze({ physicalRef, digitalRef });
}

function normalizeTwin(input = {}) {
  record(input, ['partyA', 'partyB'], 'INVALID_DIGITAL_TWIN');
  return Object.freeze({
    partyA: normalizeParty(input.partyA),
    partyB: normalizeParty(input.partyB),
    status: 'PLANNED',
    verified: false
  });
}

function normalizeManifest(input = {}) {
  record(input, ['reference'], 'INVALID_MANIFEST');
  return Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    reference: input.reference == null ? null : reference(input.reference),
    containsCredentials: false
  });
}

function normalizeDescriptor(input = {}) {
  record(input, ['id', 'name', 'status', 'capabilities', 'digitalTwin', 'manifest'], 'INVALID_BOT_DESCRIPTOR');
  const status = input.status === undefined ? 'LOCAL_SIMULATION' : input.status;
  if (!['PLANNED', 'LOCAL_SIMULATION'].includes(status)) fail('INVALID_BOT_STATUS');
  return Object.freeze({
    id: input.id === undefined ? undefined : reference(input.id, 'INVALID_BOT_ID'),
    name: input.name === undefined ? 'Sheikha Bot' : name(input.name),
    status,
    capabilities: normalizeCapabilities(input.capabilities),
    digitalTwin: normalizeTwin(input.digitalTwin),
    manifest: normalizeManifest(input.manifest)
  });
}

// Convert a validated descriptor back to the deliberately small public input
// schema. No parent metadata, credentials, adapter authority or budgets are copied.
function templateInput(normalized) {
  const capabilities = {};
  for (const key of CAPABILITY_NAMES) {
    capabilities[key] = Object.freeze({
      status: normalized.capabilities[key].status,
      adapterRef: normalized.capabilities[key].adapterRef
    });
  }
  return Object.freeze({
    name: normalized.name,
    status: normalized.status,
    capabilities: Object.freeze(capabilities),
    digitalTwin: Object.freeze({
      partyA: normalized.digitalTwin.partyA,
      partyB: normalized.digitalTwin.partyB
    }),
    manifest: Object.freeze({ reference: normalized.manifest.reference })
  });
}

class SheikhaBot {
  #kernel;
  #descriptor;

  constructor(token, kernel, descriptor) {
    if (token !== INTERNAL_CREATION) fail('BOT_CREATION_REQUIRES_KERNEL');
    this.#kernel = kernel;
    this.#descriptor = descriptor;
    Object.freeze(this);
  }

  get id() { return this.#descriptor.id; }
  get parentId() { return this.#descriptor.parentId; }
  get depth() { return this.#descriptor.depth; }
  get status() { return this.#descriptor.status; }
  get capabilities() { return this.#descriptor.capabilities; }
  get digitalTwin() { return this.#descriptor.digitalTwin; }
  get manifest() { return this.#descriptor.manifest; }
  get policy() { return POLICY; }
  get schema() { return KERNEL_SCHEMA; }

  snapshot() { return this.#descriptor; }
  spawnChild(descriptor = {}) { return this.#kernel.spawnChild(this.id, descriptor); }
  iterateChildren(options) { return this.#kernel.iterateChildren(this.id, options); }
  evaluateOperation(operation) { return this.#kernel.evaluateOperation(this.id, operation); }
  planLocalRepair(plan) { return this.#kernel.planLocalRepair(this.id, plan); }
}

class SheikhaInfiniteAgentKernel {
  #bots = new Map();
  #children = new Map();
  #limits;
  #spent = 0;
  #nextId = 1;

  constructor(options = {}) {
    record(options, Object.keys(DEFAULT_LIMITS), 'INVALID_KERNEL_OPTIONS');
    const limits = {};
    for (const key of Object.keys(DEFAULT_LIMITS)) {
      const value = options[key] === undefined ? DEFAULT_LIMITS[key] : options[key];
      limits[key] = integer(value, key === 'maxDepth' || key === 'maxChildren' ? 0 : 1,
        LIMIT_CEILINGS[key], 'INVALID_KERNEL_LIMIT');
    }
    this.#limits = Object.freeze(limits);
    Object.freeze(this);
  }

  get policy() { return POLICY; }
  get schema() { return KERNEL_SCHEMA; }
  get limits() { return this.#limits; }

  #requireBot(id) {
    reference(id, 'INVALID_BOT_ID');
    const bot = this.#bots.get(id);
    if (!bot) fail('BOT_NOT_FOUND');
    return bot;
  }

  #create(input, parentId) {
    const normalized = normalizeDescriptor(input);
    const parent = parentId === null ? null : this.#requireBot(parentId);
    const depth = parent === null ? 0 : parent.depth + 1;
    if (depth > this.#limits.maxDepth) fail('MAX_DEPTH_EXCEEDED');
    if (parent && this.#children.get(parent.id).length >= this.#limits.maxChildren) fail('MAX_CHILDREN_EXCEEDED');
    if (this.#bots.size >= this.#limits.maxAgents) fail('MAX_AGENTS_EXCEEDED');
    if (this.#spent >= this.#limits.totalBudget) fail('TOTAL_BUDGET_EXHAUSTED');
    let id = normalized.id;
    if (id === undefined) {
      do { id = 'agent-' + this.#nextId++; } while (this.#bots.has(id));
    }
    if (this.#bots.has(id)) fail('DUPLICATE_BOT_ID');
    const descriptor = Object.freeze({
      schemaVersion: SCHEMA_VERSION,
      type: KERNEL_SCHEMA.type,
      id,
      name: normalized.name,
      parentId,
      depth,
      status: normalized.status,
      capabilities: normalized.capabilities,
      digitalTwin: normalized.digitalTwin,
      manifest: normalized.manifest,
      kernelSchema: KERNEL_SCHEMA,
      policy: POLICY,
      evidence: EVIDENCE
    });
    const bot = new SheikhaBot(INTERNAL_CREATION, this, descriptor);
    this.#bots.set(id, bot);
    this.#children.set(id, []);
    if (parent) this.#children.get(parent.id).push(id);
    this.#spent += 1;
    return bot;
  }

  registerBot(descriptor = {}) { return this.#create(descriptor, null); }

  // Children start with schema and policy, not a copy of their parent's data.
  spawnChild(parentId, descriptor = {}) { return this.#create(descriptor, parentId); }

  iterateChildren(parentId, options = {}) {
    this.#requireBot(parentId);
    record(options, ['count', 'template'], 'INVALID_CHILD_ITERATION');
    const count = integer(options.count, 0, this.#limits.maxChildren, 'INVALID_CHILD_COUNT');
    const normalized = normalizeDescriptor(options.template);
    if (normalized.id !== undefined) fail('ITERATOR_REQUIRES_GENERATED_IDS');
    const template = templateInput(normalized);
    const kernel = this;
    // No registrations occur until next(). Each next() uses the same central
    // admission checks, so multiple iterators cannot reserve or inflate budget.
    return (function* children() {
      for (let index = 0; index < count; index += 1) {
        yield kernel.spawnChild(parentId, template);
      }
    })();
  }

  getBot(id) { return this.#requireBot(id); }

  getChildren(parentId) {
    this.#requireBot(parentId);
    return Object.freeze(this.#children.get(parentId).map(id => this.#bots.get(id)));
  }

  statistics() {
    const statuses = { PLANNED: 0, LOCAL_SIMULATION: 0 };
    let roots = 0;
    for (const bot of this.#bots.values()) {
      statuses[bot.status] += 1;
      if (bot.parentId === null) roots += 1;
    }
    return Object.freeze({
      status: 'LOCAL_SIMULATION',
      agents: this.#bots.size,
      roots,
      children: this.#bots.size - roots,
      budgetSpent: this.#spent,
      budgetRemaining: this.#limits.totalBudget - this.#spent,
      limits: this.#limits,
      statuses: Object.freeze(statuses),
      evidence: EVIDENCE
    });
  }

  evaluateOperation(botId, operation) {
    this.#requireBot(botId);
    record(operation, ['action', 'level'], 'INVALID_OPERATION');
    const action = reference(operation.action, 'INVALID_OPERATION_ACTION');
    let level = null;
    if (action === 'change-l0-policy') level = 'L0';
    else if (L1_ACTIONS.includes(action)) level = 'L1';
    else if (Object.hasOwn(LOCAL_REPAIR_STEPS, action)) level = 'L2';
    if (operation.level !== undefined && operation.level !== level) fail('OPERATION_LEVEL_MISMATCH');
    if (level === 'L2') return this.planLocalRepair(botId, { action });
    return Object.freeze({
      botId,
      action,
      level,
      status: 'DENIED',
      reason: level === 'L0' ? 'IMMUTABLE_L0_POLICY' :
        level === 'L1' ? 'EXTERNAL_AUTHORIZATION_REQUIRED' : 'UNKNOWN_OPERATION',
      externalAuthorizationRequired: level === 'L1',
      executionSupported: false,
      executed: false
    });
  }

  planLocalRepair(botId, plan) {
    this.#requireBot(botId);
    record(plan, ['action', 'targetRef'], 'INVALID_LOCAL_REPAIR_PLAN');
    const action = reference(plan.action, 'INVALID_OPERATION_ACTION');
    if (!Object.hasOwn(LOCAL_REPAIR_STEPS, action)) fail('LOCAL_REPAIR_ACTION_NOT_ALLOWED');
    return Object.freeze({
      botId,
      action,
      targetRef: plan.targetRef === undefined ? null : reference(plan.targetRef),
      level: 'L2',
      status: 'PLANNED',
      steps: Object.freeze([LOCAL_REPAIR_STEPS[action]]),
      executionSupported: false,
      executed: false
    });
  }
}

Object.freeze(SheikhaBot.prototype);
Object.freeze(SheikhaInfiniteAgentKernel.prototype);

module.exports = Object.freeze({
  SheikhaBot,
  SheikhaInfiniteAgent: SheikhaBot,
  SheikhaInfiniteAgentKernel,
  SCHEMA_VERSION,
  CAPABILITY_NAMES,
  KERNEL_SCHEMA,
  POLICY
});
