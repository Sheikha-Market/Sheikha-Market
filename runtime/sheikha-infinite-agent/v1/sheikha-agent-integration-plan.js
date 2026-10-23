'use strict';

const { SheikhaInfiniteAgentKernel } = require('./sheikha-infinite-agent-kernel');
const naturalModel = require('../../sheikha-natural-integration/v1/sheikha-natural-integration-model');
const research = require('../../../core/research/sheikha-research-brain-v1.cjs');
const { runNetwork } = require('../../../core/robotics/sheikha-industrial-network-v1');

const STAGES = Object.freeze([
  'extraction', 'concentration', 'smelting', 'refining',
  'forming', 'manufacturing', 'distribution', 'recycling'
]);
const MODES = Object.freeze(['sea', 'road', 'air', 'rail', 'pipeline', 'warehouse']);
const INPUT_FIELDS = Object.freeze([
  'hsCode', 'factoryRef', 'registrationRef', 'locationRef', 'foundryRef',
  'sourceRef', 'pipelineRef', 'scienceRef', 'method', 'scenario', 'branching'
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function record(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('INVALID_PLAN_INPUT');
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !fields.includes(key) ||
        !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) fail('INVALID_PLAN_INPUT');
  }
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function reference(value) {
  if (value === undefined) return null;
  if (typeof value !== 'string' || value.length > 96 ||
      !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(value) ||
      /^(?:sk-|gh[pousr]_|github_pat_|AIza|AKIA|ASIA|Bearer)/i.test(value)) fail('INVALID_PLAN_REFERENCE');
  return value;
}

function branchingValues(value) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype ||
      value.length > 64 || Reflect.ownKeys(value).length !== value.length + 1) fail('INVALID_BRANCHING');
  const result = [];
  for (let i = 0; i < value.length; i += 1) {
    const property = Object.getOwnPropertyDescriptor(value, String(i));
    if (!property || !Object.hasOwn(property, 'value') ||
        !Number.isSafeInteger(property.value) || property.value < 1 || property.value > 1000000) {
      fail('INVALID_BRANCHING');
    }
    result.push(property.value);
  }
  return result;
}

function planHierarchy(branching = [10, 5, 2]) {
  const values = branchingValues(branching);
  const limits = new SheikhaInfiniteAgentKernel().limits;
  const violations = [];
  let count = 1n;
  let total = count;
  const levels = [{ depth: 0, parents: '0', childrenPerParent: null, descriptors: '1' }];
  // Exact arithmetic describes a large request without allocating its agents.
  for (const [index, childrenPerParent] of values.entries()) {
    const parents = count;
    count *= BigInt(childrenPerParent);
    total += count;
    levels.push({ depth: index + 1, parents: String(parents), childrenPerParent, descriptors: String(count) });
    if (childrenPerParent > limits.maxChildren) {
      violations.push({ code: 'MAX_CHILDREN_EXCEEDED', depth: index + 1, limit: limits.maxChildren });
    }
  }
  if (values.length > limits.maxDepth) violations.push({ code: 'MAX_DEPTH_EXCEEDED', limit: limits.maxDepth });
  if (total > BigInt(limits.maxAgents)) violations.push({ code: 'MAX_AGENTS_EXCEEDED', limit: limits.maxAgents });
  if (total > BigInt(limits.totalBudget)) violations.push({ code: 'TOTAL_BUDGET_EXCEEDED', limit: limits.totalBudget });
  return freeze({
    status: violations.length ? 'CAPACITY_BLOCKED' : 'LOCAL_CAPACITY_PLAN',
    requestedDescriptors: String(total), countEncoding: 'EXACT_DECIMAL_STRING',
    levels, limits, violations, fitsLocalDescriptorLimits: violations.length === 0,
    budgetUnit: 'DESCRIPTOR_REGISTRATION_NOT_MONEY_OR_COMPUTE',
    descriptorsCreated: 0, resourcesReserved: false, executionAuthorized: false,
    liveWorkers: 0, productionReady: false
  });
}

function buildIntegrationPlan(input = {}) {
  record(input, INPUT_FIELDS);
  const hsCode = input.hsCode === undefined ? null : input.hsCode;
  if (hsCode !== null && (typeof hsCode !== 'string' || !/^(?:[0-9]{4}|[0-9]{6})$/.test(hsCode))) {
    fail('INVALID_HS_CODE_FORMAT');
  }
  if (Object.hasOwn(input, 'hsCode') && hsCode === null) fail('INVALID_HS_CODE_FORMAT');
  const refs = {};
  for (const field of INPUT_FIELDS.filter(key => key.endsWith('Ref'))) refs[field] = reference(input[field]);
  const { scienceRef, ...factoryRefs } = refs;
  const scenario = input.scenario === undefined ? 'island' : input.scenario;
  naturalModel.getScenario(scenario);
  const method = input.method === undefined ? 'simulation' : input.method;
  if (!research.METHODS.includes(method)) fail('INVALID_RESEARCH_METHOD');
  const hierarchy = planHierarchy(input.branching);

  // Five representative descriptors are not an expansion of the requested tree.
  const kernel = new SheikhaInfiniteAgentKernel({ maxAgents: 5, maxChildren: 4, maxDepth: 1, totalBudget: 5 });
  const coordinator = kernel.registerBot({ id: 'integration-coordinator', status: 'PLANNED' });
  const descriptors = [coordinator.snapshot()];
  for (const [id, capability] of [
    ['product', 'manifest'], ['factory', 'factory'], ['science', 'aiLearning'], ['garden', 'digitalTwin']
  ]) {
    descriptors.push(coordinator.spawnChild({ id, status: 'PLANNED', capabilities: { [capability]: { status: 'PLANNED' } } }).snapshot());
  }
  return freeze({
    schema: 'SHEIKHA_AGENT_INTEGRATION_PLAN_V1', status: 'LOCAL_DESIGN_AND_SYNTHETIC_EXAMPLES',
    productionHold: true, productionReady: false, externalExecution: false,
    hierarchy,
    representativeRegistry: { count: descriptors.length, scope: 'EXAMPLE_ONLY_NOT_REQUESTED_HIERARCHY', descriptors },
    product: {
      descriptorId: 'product', hsCode, codeCheck: hsCode === null ? 'NOT_SUPPLIED' : 'FORMAT_ONLY',
      classificationVerified: false, edition: null, jurisdiction: null
    },
    factory: {
      descriptorId: 'factory', ...factoryRefs, registrationVerified: false,
      ownershipVerified: false, physicalConnection: false
    },
    supplyChain: {
      stages: STAGES, logisticsModes: MODES, scope: 'USER_REQUESTED_GENERIC_TEMPLATE',
      applicableToEveryProduct: false, movementLedgerImplemented: false,
      transportConnected: false, quantityAccountingImplemented: false
    },
    research: {
      descriptorId: 'science', scienceRef,
      plan: research.plan({ question: 'Evaluate the bounded synthetic integration example.', method, evidenceIds: [] }),
      evidenceAvailable: false, trainingPerformed: false
    },
    garden: {
      descriptorId: 'garden', scenario,
      example: naturalModel.exportLearningExample({ scenario }),
      realWorldForecast: false
    },
    industrialExample: runNetwork(),
    links: [
      { from: 'factory', to: 'product', relation: 'PROPOSED_PRODUCTION' },
      { from: 'science', to: 'garden', relation: 'SYNTHETIC_MODEL_REVIEW' },
      { from: 'garden', to: 'factory', relation: 'PROPOSED_RESOURCE_STUDY' }
    ],
    governmentIntegration: { status: 'NOT_CONNECTED', authorizationGranted: false },
    referenceBoundary: {
      values: 'QURAN_AND_SUNNAH_WITH_HUMAN_REVIEW',
      automatedReligiousCertification: false, unseenWorldClaim: false,
      biologicalTwinAvailable: false, prophetAsSoftwareEntity: false
    }
  });
}

module.exports = Object.freeze({ planHierarchy, buildIntegrationPlan });
