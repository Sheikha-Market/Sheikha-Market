'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(process.cwd(), 'runtime/sheikha-visual-spatial-fabric-v1');
const SOURCE_FILES = Object.freeze([
  'server.js',
  'drawing-policy-v2.js',
  'drawing-license-v2.js',
  'terminology-v2.js',
  'dimension-engine-v1.js',
  'render.js',
  'scenes.js',
  'catalog.js',
]);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function inspectSources() {
  return SOURCE_FILES.map((name) => {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) return { name, present: false, sha256: null };
    return { name, present: true, sha256: sha256(fs.readFileSync(file)) };
  });
}

function buildDrawingMotionV2BridgeStatus() {
  const sources = inspectSources();
  const { DIMENSIONS, PREFERRED_TERMS, SEMANTIC_BOUNDARY } = require(path.join(ROOT, 'terminology-v2'));
  const { square, house } = require(path.join(ROOT, 'dimension-engine-v1'));
  const { evaluateDrawing } = require(path.join(ROOT, 'drawing-policy-v2'));
  const selfTest = {
    square: square(4),
    house: house(8, 10, 3, 2),
    allowedGarden: evaluateDrawing({ subject: 'gardens', purpose: 'planning' }),
    deniedLivingLikeness: evaluateDrawing({ subject: 'human_likeness_generation' }),
  };
  const sourceComplete = sources.every((item) => item.present);
  const selfTestPassed = selfTest.square.area === 16
    && selfTest.house.baseArea === 80
    && selfTest.allowedGarden.decision === 'ALLOW'
    && selfTest.deniedLivingLikeness.decision === 'DENY';
  const base = {
    system: 'SHEIKHA_VISUAL_FABRIC_V2_APEX_BRIDGE',
    status: sourceComplete && selfTestPassed
      ? 'SOURCE_INTEGRATED_LOCAL_RUNTIME_AVAILABLE'
      : 'INTEGRATION_EVIDENCE_INCOMPLETE',
    runtime: {
      service: 'sheikha-visual-fabric',
      localBaseUrl: 'http://127.0.0.1:8093',
      healthEndpoint: '/health',
      drawingStatusEndpoint: '/api/drawing/status',
      legacyV1ApiPreserved: true,
    },
    sources,
    sourceComplete,
    selfTestPassed,
    selfTest,
    dimensions: Object.keys(DIMENSIONS),
    preferredTerms: PREFERRED_TERMS,
    semanticBoundary: SEMANTIC_BOUNDARY,
    integrations: {
      apex: true,
      sheikhaLanguage: true,
      gardensFarmsPastures: true,
      scienceAndCalculation: true,
      commercialCatalog: true,
      localSvgAndPngRenderer: true,
      externalProvidersOptional: true,
    },
    claims: {
      alive: false,
      conscious: false,
      unlimitedCapability: false,
      universalRarityProven: false,
      commercialAutomatedPlatformReady: false,
    },
  };
  return { ...base, sha256: sha256(JSON.stringify(base)) };
}

function buildPossibilityPlan(input = {}) {
  const goal = String(input.goal || '').trim();
  const beneficiary = String(input.beneficiary || '').trim();
  const measurableOutcome = String(input.measurableOutcome || '').trim();
  const constraints = String(input.constraints || '').trim();
  const complete = Boolean(goal && beneficiary && measurableOutcome);
  const base = {
    system: 'SHEIKHA_BENEFICIAL_POSSIBILITY_ENGINE_V1',
    status: complete ? 'BOUNDED_PLAN_READY' : 'REQUIRE_CONCRETE_GOAL_BENEFICIARY_AND_MEASURE',
    goal: goal || null,
    beneficiary: beneficiary || null,
    measurableOutcome: measurableOutcome || null,
    constraints: constraints || 'NOT_DECLARED_REQUIRES_DISCOVERY',
    stages: complete ? [
      'VERIFY_BENEFIT_RIGHTS_AND_NO_HARM',
      'MEASURE_CURRENT_CAPABILITY_AND_BARRIERS',
      'SELECT_SMALLEST_USEFUL_PROTOTYPE',
      'BUILD_DRAWING_SIMULATION_OR_WORKFLOW',
      'TEST_WITH_INTENDED_BENEFICIARY',
      'MEASURE_OUTCOME_COST_ACCESSIBILITY_AND_RISK',
      'IMPROVE_OR_STOP_FROM_EVIDENCE',
      'HUMAN_APPROVED_CONTROLLED_DELIVERY',
    ] : [],
    principles: [
      'HELP_WITHOUT_FALSE_PROMISES',
      'ACCESSIBILITY_AND_HUMAN_DIGNITY',
      'USER_RETAINS_AGENCY_AND_CONSENT',
      'NO_HARM_NO_DECEPTION_AND_RIGHTS_PRESERVED',
      'SUCCESS_REQUIRES_MEASURED_REAL_WORLD_EVIDENCE',
    ],
    execution: { performed: false, externalCommitmentCreated: false },
  };
  return { ...base, sha256: sha256(JSON.stringify(base)) };
}

module.exports = { SOURCE_FILES, buildDrawingMotionV2BridgeStatus, buildPossibilityPlan };
