'use strict';

const express = require('express');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const config = require('../../config/config');
const {
  SheikhaInfiniteAgentKernel
} = require('../../runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel');
const naturalModel = require('../../runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model');

const router = express.Router();
const kernel = new SheikhaInfiniteAgentKernel({
  maxAgents: 1000, maxDepth: 8, maxChildren: 100, totalBudget: 1000
});
const MAX_BODY_BYTES = 16 * 1024;
const json = express.json({ limit: MAX_BODY_BYTES, strict: true });
// Design access uses the application's JWT/admin chain. A generated fallback
// key never configures access, regardless of the upstream Cloud Run IAM policy.
const adminAuthConfigured = typeof process.env.JWT_SECRET === 'string' &&
  process.env.JWT_SECRET.length >= 32 &&
  config.security?.jwt?.secret === process.env.JWT_SECRET;

function reject(res, status, error) {
  return res.status(status).json({ success: false, error, executed: false });
}

function bodyRecord(req, allowed) {
  const input = req.body;
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.getPrototypeOf(input) !== Object.prototype ||
      Object.keys(input).some(key => !allowed.includes(key))) {
    const error = new Error('INVALID_REQUEST_BODY');
    error.code = 'INVALID_REQUEST_BODY';
    throw error;
  }
  if (Buffer.byteLength(JSON.stringify(input), 'utf8') > MAX_BODY_BYTES) {
    const error = new Error('REQUEST_BODY_TOO_LARGE');
    error.code = 'REQUEST_BODY_TOO_LARGE';
    throw error;
  }
  return input;
}

// This is the complete public allowlist; every other path requires admin auth.
const PUBLIC_STATUS_ROUTES = Object.freeze(['GET /', 'HEAD /', 'GET /status', 'HEAD /status']);
const ADMIN_MIDDLEWARE = Object.freeze([requireConfiguredAdminAuth, authenticate, requireAdmin]);

function basicStatus() {
  return {
    success: true,
    status: 'SERVICE_AVAILABLE',
    schema: 'LOCAL_DESCRIPTOR_MODEL',
    localSimulation: true,
    bounded: true,
    liveNeuralNetwork: false
  };
}

function kernelDesign() {
  return {
    success: true,
    system: 'SHEIKHA_INFINITE_AGENT_KERNEL',
    status: 'LOCAL_DESCRIPTOR_MODEL',
    verificationScope: 'LOCALLY_TESTED_DESCRIPTOR_KERNEL',
    kernel: 'SHEIKHA_INFINITE_AGENT_KERNEL',
    seal: null,
    bareMetalBootVerified: false,
    liveNeuralNetwork: false,
    externalExecution: false,
    persistent: false,
    schema: kernel.schema,
    policy: kernel.policy,
    statistics: kernel.statistics(),
    naturalModel: naturalModel.MODEL_METADATA
  };
}

function requestBoundary(req, res, next) {
  res.set('Cache-Control', 'no-store');
  if (Object.keys(req.query).length) return reject(res, 400, 'QUERY_OVERRIDES_NOT_ALLOWED');
  const length = Number(req.headers['content-length']);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    return reject(res, 413, 'REQUEST_BODY_TOO_LARGE');
  }
  next();
}

router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.use((req, res, next) => {
  if (PUBLIC_STATUS_ROUTES.includes(req.method + ' ' + req.path)) return next();
  return requireConfiguredAdminAuth(req, res, () =>
    authenticate(req, res, () => requireAdmin(req, res, next)));
});
router.use(requestBoundary);

router.get('/', (_req, res) => res.json(basicStatus()));
router.get('/status', (_req, res) => res.json(basicStatus()));
router.get('/design', (_req, res) => res.json(kernelDesign()));
// Compatibility URL; retains the same admin boundary and measured scope.
router.get('/full', (_req, res) => res.json(kernelDesign()));

router.get('/jannah', (_req, res) => res.json({
  success: true,
  status: 'LOCAL_SIMULATION_SCHEMA',
  scenarioScope: 'EARTH_GARDEN_ENGINEERING',
  symbolicRouteName: 'jannah',
  unseenWorldClaim: false,
  synthetic: true,
  model: naturalModel.MODEL_METADATA,
  inputSchema: naturalModel.MODEL_METADATA.inputSchema,
  scenario: naturalModel.getScenario('meadow'),
  scenarios: naturalModel.listScenarios()
}));

router.get('/arabia', (_req, res) => res.json({
  success: true,
  status: 'LOCAL_SIMULATION_SCHEMA',
  synthetic: true,
  realWorldForecast: false,
  model: naturalModel.MODEL_METADATA,
  inputSchema: naturalModel.MODEL_METADATA.inputSchema,
  scenario: naturalModel.getScenario('arabia')
}));

function simulate(req, res) {
  try {
    const input = bodyRecord(req, [
      'scenario', 'rainMm', 'irrigationMm', 'soilWaterMm', 'soilCapacityMm',
      'infiltrationCapacityMmDay', 'solarMJm2Day', 'cloudFraction',
      'canopyFraction', 'cropFactor', 'fieldCapacityFraction',
      'drainageFraction', 'treeCanopyFraction', 'fruitingFactor'
    ]);
    return res.json({ success: true, data: naturalModel.simulateDay(input), externalExecution: false });
  } catch (error) {
    return reject(res, error.code === 'REQUEST_BODY_TOO_LARGE' ? 413 : 400,
      error.code === 'REQUEST_BODY_TOO_LARGE' ? error.code : 'INVALID_SIMULATION_INPUT');
  }
}

router.post('/simulate', json, simulate);

router.get('/spawn', (_req, res) => {
  res.set('Allow', 'POST');
  return reject(res, 405, 'USE_AUTHENTICATED_ADMIN_POST');
});

function requireConfiguredAdminAuth(_req, res, next) {
  if (!adminAuthConfigured) return reject(res, 403, 'ADMIN_AUTH_NOT_CONFIGURED');
  next();
}

router.post('/spawn', json, (req, res) => {
  try {
    const input = bodyRecord(req, ['parentId', 'count', 'descriptor']);
    const count = input.count === undefined ? 1 : input.count;
    if (!Number.isSafeInteger(count) || count < 1 || count > kernel.limits.maxChildren) {
      return reject(res, 400, 'INVALID_CHILD_COUNT');
    }
    const descriptor = input.descriptor === undefined ? {} : input.descriptor;
    const before = kernel.statistics();
    if (before.agents + count > kernel.limits.maxAgents || before.budgetRemaining < count) {
      return reject(res, 409, 'KERNEL_CAPACITY_EXCEEDED');
    }
    let bots;
    if (input.parentId === undefined) {
      if (count !== 1) return reject(res, 400, 'ROOT_CREATION_REQUIRES_COUNT_ONE');
      bots = [kernel.registerBot(descriptor)];
    } else {
      const parent = kernel.getBot(input.parentId);
      if (parent.depth >= kernel.limits.maxDepth) return reject(res, 409, 'MAX_DEPTH_EXCEEDED');
      if (kernel.getChildren(parent.id).length + count > kernel.limits.maxChildren) {
        return reject(res, 409, 'MAX_CHILDREN_EXCEEDED');
      }
      // Validation and capacity checks happen before the first registration.
      bots = [...kernel.iterateChildren(parent.id, { count, template: descriptor })];
    }
    return res.status(201).json({
      success: true,
      status: 'LOCAL_DESCRIPTORS_CREATED',
      created: bots.length,
      botIds: bots.map(bot => bot.id),
      statistics: kernel.statistics(),
      externalExecution: false,
      persistent: false
    });
  } catch (error) {
    const conflict = ['DUPLICATE_BOT_ID', 'MAX_DEPTH_EXCEEDED', 'MAX_CHILDREN_EXCEEDED',
      'MAX_AGENTS_EXCEEDED', 'TOTAL_BUDGET_EXHAUSTED'];
    const status = error.code === 'BOT_NOT_FOUND' ? 404 :
      error.code === 'REQUEST_BODY_TOO_LARGE' ? 413 : conflict.includes(error.code) ? 409 : 400;
    const code = typeof error.code === 'string' && /^[A-Z_]+$/.test(error.code)
      ? error.code : 'INVALID_SPAWN_INPUT';
    return reject(res, status, code);
  }
});

function requestFailure(error, _req, res, _next) {
  if (error.type === 'entity.too.large') return reject(res, 413, 'REQUEST_BODY_TOO_LARGE');
  if (error.type === 'entity.parse.failed') return reject(res, 400, 'INVALID_JSON');
  return reject(res, 500, 'INFINITE_AGENT_REQUEST_FAILED');
}

router.use(requestFailure);

function describeSunnahReference(_req, res) {
  return res.set('Cache-Control', 'no-store').json({
    success: true,
    status: 'REFERENCE_FRAME_ONLY',
    referenceFrame: {
      scope: ['SUNNAH', 'SIRAH'],
      use: 'SOURCED_HUMAN_REVIEWED_REFERENCE',
      independentReligiousRuling: false
    },
    bodyDigitalTwinAvailable: false,
    biologicalSimulation: false,
    dnaDataAvailable: false,
    syntheticBodyGenerated: false,
    prophetAsSoftwareEntity: false,
    externalExecution: false
  });
}

function createNaturalRouter() {
  const engineering = express.Router();
  engineering.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  engineering.use(ADMIN_MIDDLEWARE);
  engineering.use(requestBoundary);
  const describeEngineering = (_req, res) => res.json({
    success: true,
    status: 'LOCAL_ENGINEERING_SIMULATION_MODEL',
    synthetic: true,
    model: naturalModel.MODEL_METADATA,
    scenarios: naturalModel.listScenarios(),
    remoteFeedsConnected: false,
    physicalActuation: false
  });
  engineering.get('/', describeEngineering);
  engineering.get('/full', describeEngineering);
  engineering.get('/water', (_req, res) => res.json({
    success: true,
    status: 'SYNTHETIC_WATER_BALANCE_MODEL',
    synthetic: true,
    model: naturalModel.MODEL_METADATA,
    scenarios: naturalModel.listScenarios(),
    simulationEndpoint: 'POST /api/cosmic/simulate',
    remoteFeedsConnected: false,
    physicalActuation: false
  }));
  engineering.get('/atoms', (_req, res) => res.status(501).json({
    success: false,
    error: 'ATOMIC_SIMULATION_NOT_IMPLEMENTED',
    executed: false,
    physicalActuation: false,
    externalExecution: false
  }));
  engineering.get('/metadata', (_req, res) => res.json({
    success: true, synthetic: true, model: naturalModel.MODEL_METADATA,
    inputSchema: naturalModel.MODEL_METADATA.inputSchema
  }));
  engineering.get('/scenarios', (_req, res) => res.json({
    success: true, synthetic: true, scenarios: naturalModel.listScenarios()
  }));
  engineering.get('/island', (_req, res) => res.json({
    success: true,
    status: 'LOCAL_SIMULATION_SCHEMA',
    synthetic: true,
    model: naturalModel.MODEL_METADATA,
    inputSchema: naturalModel.MODEL_METADATA.inputSchema,
    scenario: naturalModel.getScenario('island')
  }));
  engineering.get('/rasul', describeSunnahReference);
  engineering.post('/simulate', json, simulate);
  engineering.use(requestFailure);
  return engineering;
}

function createReferenceRouter() {
  const reference = express.Router();
  reference.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  reference.use(ADMIN_MIDDLEWARE);
  reference.use(requestBoundary);
  reference.get('/', describeSunnahReference);
  reference.use(requestFailure);
  return reference;
}

module.exports = router;
module.exports.createNaturalRouter = createNaturalRouter;
module.exports.createReferenceRouter = createReferenceRouter;
