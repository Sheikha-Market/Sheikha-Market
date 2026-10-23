'use strict';

// A synthetic, deterministic one-day bucket model. These are illustrative
// coefficients and scenarios, not observations, calibrated agronomy or a twin.
const SCHEMA_VERSION = '1.0';

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

const FIELD_SCHEMA = freeze({
  rainMm: { min: 0, max: 500, unit: 'mm/day' },
  irrigationMm: { min: 0, max: 500, unit: 'mm/day' },
  soilWaterMm: { min: 0, max: 2000, unit: 'mm' },
  soilCapacityMm: { min: 1, max: 2000, unit: 'mm' },
  infiltrationCapacityMmDay: { min: 0, max: 500, unit: 'mm/day' },
  solarMJm2Day: { min: 0, max: 50, unit: 'MJ/m2/day' },
  cloudFraction: { min: 0, max: 1, unit: 'fraction' },
  canopyFraction: { min: 0, max: 1, unit: 'fraction' },
  cropFactor: { min: 0, max: 2.5, unit: 'dimensionless' },
  fieldCapacityFraction: { min: 0, max: 1, unit: 'fraction' },
  drainageFraction: { min: 0, max: 1, unit: 'fraction/day' },
  treeCanopyFraction: { min: 0, max: 1, unit: 'fraction' },
  fruitingFactor: { min: 0, max: 1, unit: 'dimensionless' }
});
const FIELD_NAMES = Object.freeze(Object.keys(FIELD_SCHEMA));
const COEFFICIENTS = freeze({
  cloudAttenuation: 0.65,
  evaporationMmPerMJm2: 0.25,
  bareSoilFactor: 0.2,
  lightReferenceMJm2Day: 20
});
const PROVENANCE = freeze({
  source: 'AUTHORED_SYNTHETIC_SCENARIOS_AND_HEURISTICS',
  measuredObservations: false,
  calibrated: false,
  validatedDigitalTwin: false,
  trainedAI: false,
  physicalActuation: false,
  scope: 'ILLUSTRATIVE_TERRESTRIAL_WATER_AND_VEGETATION_MODEL'
});
const MODEL_METADATA = freeze({
  id: 'SHEIKHA_NATURAL_INTEGRATION_MODEL_V1',
  schemaVersion: SCHEMA_VERSION,
  kind: 'SYNTHETIC_DAILY_BUCKET_MODEL',
  timeStepDays: 1,
  status: 'LOCAL_SIMULATION',
  inputSchema: {
    scenario: { allowed: ['island', 'meadow', 'arabia'], default: 'meadow' },
    numericFields: FIELD_SCHEMA,
    unknownFields: 'REJECTED'
  },
  coefficients: COEFFICIENTS,
  waterBalanceEquation: 'initialSoilWaterMm + rainMm + irrigationMm = finalSoilWaterMm + evapotranspirationMm + runoffMm + drainageMm',
  assumptions: [
    'All flows are one-day water-depth equivalents over the same unit land area.',
    'Rain and irrigation enter first; infiltration is limited by daily capacity and empty soil storage.',
    'Evapotranspiration follows infiltration; drainage follows evapotranspiration.',
    'Infiltration is an internal transfer, not an additional term on the balance output side.',
    'Runoff is routed to a river-equivalent flow; this is not river depth, discharge or channel routing.',
    'Solar input is synthetic clear-sky potential before the cloud attenuation heuristic.',
    'Growth and fruit potential are descriptive indices, not biomass, harvest, yield or forecasts.',
    'This model makes no claims about unseen matters, human physiology or living neural networks.'
  ],
  outputUnits: {
    water: 'mm per one-day step over unit land area',
    solar: 'MJ/m2/day',
    waterStressIndex: 'dimensionless [0,1]; 1 means unmet modeled water demand',
    growthIndex: 'dimensionless [0,1]; descriptive only',
    fruitPotentialIndex: 'dimensionless [0,1]; descriptive only'
  },
  provenance: PROVENANCE
});

const SCENARIOS = freeze({
  island: {
    id: 'island', label: 'جزيرة اصطناعية', synthetic: true, provenance: PROVENANCE,
    inputs: {
      scenario: 'island', rainMm: 18, irrigationMm: 0, soilWaterMm: 90,
      soilCapacityMm: 180, infiltrationCapacityMmDay: 60, solarMJm2Day: 24,
      cloudFraction: 0.45, canopyFraction: 0.8, cropFactor: 1,
      fieldCapacityFraction: 0.7, drainageFraction: 0.2,
      treeCanopyFraction: 0.6, fruitingFactor: 0.7
    }
  },
  meadow: {
    id: 'meadow', label: 'مرج اصطناعي', synthetic: true, provenance: PROVENANCE,
    inputs: {
      scenario: 'meadow', rainMm: 6, irrigationMm: 0, soilWaterMm: 75,
      soilCapacityMm: 140, infiltrationCapacityMmDay: 35, solarMJm2Day: 22,
      cloudFraction: 0.35, canopyFraction: 0.9, cropFactor: 0.85,
      fieldCapacityFraction: 0.7, drainageFraction: 0.25,
      treeCanopyFraction: 0.1, fruitingFactor: 0.3
    }
  },
  arabia: {
    id: 'arabia', label: 'بيئة عربية جافة اصطناعية', synthetic: true, provenance: PROVENANCE,
    inputs: {
      scenario: 'arabia', rainMm: 0.2, irrigationMm: 0, soilWaterMm: 15,
      soilCapacityMm: 100, infiltrationCapacityMmDay: 18, solarMJm2Day: 30,
      cloudFraction: 0.05, canopyFraction: 0.15, cropFactor: 0.55,
      fieldCapacityFraction: 0.65, drainageFraction: 0.15,
      treeCanopyFraction: 0.05, fruitingFactor: 0.2
    }
  }
});
const SCENARIO_LIST = Object.freeze(Object.values(SCENARIOS));

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function dataRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('INVALID_MODEL_INPUT');
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) fail('INVALID_MODEL_INPUT');
  const keys = Reflect.ownKeys(value);
  if (keys.length > FIELD_NAMES.length + 1) fail('INVALID_MODEL_INPUT');
  for (const key of keys) {
    if (typeof key !== 'string' || (key !== 'scenario' && !FIELD_NAMES.includes(key))) fail('UNKNOWN_MODEL_INPUT_FIELD');
    if (!Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) fail('INVALID_MODEL_INPUT');
  }
  return value;
}

function getScenario(id = 'meadow') {
  if (typeof id !== 'string' || !Object.hasOwn(SCENARIOS, id)) fail('UNKNOWN_SYNTHETIC_SCENARIO');
  return SCENARIOS[id];
}

function listScenarios() { return SCENARIO_LIST; }

function normalizeInput(input = {}) {
  dataRecord(input);
  const scenario = Object.hasOwn(input, 'scenario') ? input.scenario : 'meadow';
  if (typeof scenario !== 'string') fail('UNKNOWN_SYNTHETIC_SCENARIO');
  const baseline = getScenario(scenario).inputs;
  const values = { scenario };
  for (const field of FIELD_NAMES) {
    const value = Object.hasOwn(input, field) ? input[field] : baseline[field];
    const bounds = FIELD_SCHEMA[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < bounds.min || value > bounds.max) fail('INVALID_MODEL_NUMERIC_INPUT');
    values[field] = value;
  }
  if (values.soilWaterMm > values.soilCapacityMm) fail('SOIL_STORAGE_EXCEEDS_CAPACITY');
  if (values.treeCanopyFraction > values.canopyFraction) fail('TREE_CANOPY_EXCEEDS_TOTAL_CANOPY');
  return Object.freeze(values);
}

function simulateDay(input = {}) {
  const values = normalizeInput(input);
  const effectiveSolarMJm2Day = values.solarMJm2Day * (1 - COEFFICIENTS.cloudAttenuation * values.cloudFraction);
  const canopyDemandFactor = COEFFICIENTS.bareSoilFactor + (1 - COEFFICIENTS.bareSoilFactor) * values.canopyFraction;
  const evapotranspirationDemandMm = effectiveSolarMJm2Day * COEFFICIENTS.evaporationMmPerMJm2 * values.cropFactor * canopyDemandFactor;
  const externalInputMm = values.rainMm + values.irrigationMm;
  const infiltrationMm = Math.min(externalInputMm, values.infiltrationCapacityMmDay,
    values.soilCapacityMm - values.soilWaterMm);
  const runoffMm = externalInputMm - infiltrationMm;
  const soilAfterInfiltrationMm = values.soilWaterMm + infiltrationMm;
  const evapotranspirationMm = Math.min(soilAfterInfiltrationMm, evapotranspirationDemandMm);
  const soilAfterEvapotranspirationMm = soilAfterInfiltrationMm - evapotranspirationMm;
  const fieldCapacityMm = values.soilCapacityMm * values.fieldCapacityFraction;
  const drainageMm = Math.max(0, soilAfterEvapotranspirationMm - fieldCapacityMm) * values.drainageFraction;
  const finalSoilWaterMm = soilAfterEvapotranspirationMm - drainageMm;
  const totalAvailableMm = values.soilWaterMm + externalInputMm;
  const balanceResidualMm = totalAvailableMm - (finalSoilWaterMm + evapotranspirationMm + runoffMm + drainageMm);
  const balanceToleranceMm = 1e-9 * Math.max(1, totalAvailableMm);
  if (Math.abs(balanceResidualMm) > balanceToleranceMm) fail('WATER_BALANCE_INVARIANT_FAILED');
  const waterSupplyRatio = evapotranspirationDemandMm === 0 ? 1 : evapotranspirationMm / evapotranspirationDemandMm;
  const waterStressIndex = Math.max(0, Math.min(1, 1 - waterSupplyRatio));
  const lightIndex = Math.min(1, effectiveSolarMJm2Day / COEFFICIENTS.lightReferenceMJm2Day);
  const cropActivity = Math.min(1, values.cropFactor);
  const growthIndex = lightIndex * waterSupplyRatio * values.canopyFraction * cropActivity;
  const fruitPotentialIndex = lightIndex * waterSupplyRatio * values.treeCanopyFraction * values.fruitingFactor * cropActivity;
  return freeze({
    schemaVersion: SCHEMA_VERSION,
    model: MODEL_METADATA.id,
    status: 'LOCAL_SIMULATION',
    synthetic: true,
    deterministic: true,
    timeStepDays: 1,
    inputs: values,
    solar: {
      clearSkyPotentialMJm2Day: values.solarMJm2Day,
      cloudFraction: values.cloudFraction,
      effectiveSolarMJm2Day
    },
    water: {
      initialSoilWaterMm: values.soilWaterMm,
      rainMm: values.rainMm,
      irrigationMm: values.irrigationMm,
      externalInputMm,
      totalAvailableMm,
      infiltrationMm,
      evapotranspirationDemandMm,
      evapotranspirationMm,
      runoffMm,
      riverInflowEquivalentMm: runoffMm,
      drainageMm,
      finalSoilWaterMm,
      balanceResidualMm,
      balanceToleranceMm,
      conserved: true
    },
    vegetation: {
      status: 'DESCRIPTIVE_INDICES_ONLY',
      canopyFraction: values.canopyFraction,
      treeCanopyFraction: values.treeCanopyFraction,
      waterStressIndex,
      lightIndex,
      growthIndex,
      fruitPotentialIndex,
      harvestEstimated: false
    },
    provenance: PROVENANCE
  });
}

function exportLearningExample(input = {}) {
  const result = simulateDay(input);
  const features = {};
  const featureUnits = {};
  for (const field of FIELD_NAMES) {
    features[field] = result.inputs[field];
    featureUnits[field] = FIELD_SCHEMA[field].unit;
  }
  return freeze({
    schemaVersion: SCHEMA_VERSION,
    label: 'SYNTHETIC_MODEL_GENERATED_EXAMPLE',
    synthetic: true,
    observation: {
      scenario: result.inputs.scenario,
      kind: 'SYNTHETIC_SIMULATION_NOT_MEASUREMENT',
      inputs: result.inputs
    },
    features,
    targets: {
      finalSoilWaterMm: result.water.finalSoilWaterMm,
      evapotranspirationMm: result.water.evapotranspirationMm,
      runoffMm: result.water.runoffMm,
      drainageMm: result.water.drainageMm,
      waterStressIndex: result.vegetation.waterStressIndex,
      growthIndex: result.vegetation.growthIndex,
      fruitPotentialIndex: result.vegetation.fruitPotentialIndex
    },
    units: {
      features: featureUnits,
      targets: {
        finalSoilWaterMm: 'mm', evapotranspirationMm: 'mm/day',
        runoffMm: 'mm/day', drainageMm: 'mm/day',
        waterStressIndex: 'dimensionless', growthIndex: 'dimensionless',
        fruitPotentialIndex: 'dimensionless'
      }
    },
    trainingPerformed: false,
    neuralModelLive: false,
    provenance: PROVENANCE
  });
}

module.exports = Object.freeze({
  simulateDay,
  getScenario,
  listScenarios,
  exportLearningExample,
  MODEL_METADATA,
  FIELD_SCHEMA
});
