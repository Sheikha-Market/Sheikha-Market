'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const modelPath = require.resolve('../runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model');
const { simulateDay, getScenario, listScenarios, exportLearningExample, MODEL_METADATA, FIELD_SCHEMA } = require(modelPath);

function rejectsCode(run, code) {
  assert.throws(run, error => error.code === code);
}

function assertWaterBalance(result) {
  const water = result.water;
  const input = water.initialSoilWaterMm + water.rainMm + water.irrigationMm;
  const output = water.finalSoilWaterMm + water.evapotranspirationMm + water.runoffMm + water.drainageMm;
  assert.ok(Math.abs(input - output) <= water.balanceToleranceMm);
  assert.ok(water.finalSoilWaterMm >= 0 && water.finalSoilWaterMm <= result.inputs.soilCapacityMm);
  for (const field of ['infiltrationMm', 'evapotranspirationMm', 'runoffMm', 'drainageMm']) {
    assert.ok(Number.isFinite(water[field]) && water[field] >= 0);
  }
  assert.equal(water.riverInflowEquivalentMm, water.runoffMm);
}

test('module loads without I/O, timer, network, process or actuator APIs', () => {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), { module }, { timeout: 1000 });
  assert.equal(typeof module.exports.simulateDay, 'function');
});

test('all default scenarios are reproducible, immutable, labeled synthetic and conserve water', () => {
  assert.deepEqual(listScenarios().map(item => item.id), ['island', 'meadow', 'arabia']);
  for (const scenario of listScenarios()) {
    const first = simulateDay(scenario.inputs);
    assert.deepEqual(first, simulateDay({ scenario: scenario.id }));
    assert.deepEqual(first, simulateDay(scenario.inputs));
    assertWaterBalance(first);
    assert.equal(first.synthetic, true);
    assert.equal(first.provenance.validatedDigitalTwin, false);
    assert.equal(first.provenance.trainedAI, false);
    assert.equal(first.vegetation.harvestEstimated, false);
    assert.throws(() => { first.water.finalSoilWaterMm = -1; }, TypeError);
    assert.throws(() => { scenario.inputs.rainMm = 999; }, TypeError);
  }
  assert.equal(MODEL_METADATA.timeStepDays, 1);
  assert.equal(FIELD_SCHEMA.solarMJm2Day.unit, 'MJ/m2/day');
  rejectsCode(() => getScenario('unobserved'), 'UNKNOWN_SYNTHETIC_SCENARIO');
});

test('drought exhausts available soil water, increases stress and suppresses descriptive growth', () => {
  const dry = simulateDay({ scenario: 'arabia', soilWaterMm: 0, rainMm: 0, irrigationMm: 0 });
  assertWaterBalance(dry);
  assert.equal(dry.water.evapotranspirationMm, 0);
  assert.equal(dry.water.finalSoilWaterMm, 0);
  assert.equal(dry.vegetation.waterStressIndex, 1);
  assert.equal(dry.vegetation.growthIndex, 0);
  assert.equal(dry.vegetation.fruitPotentialIndex, 0);
  const irrigated = simulateDay({ scenario: 'arabia', soilWaterMm: 0, rainMm: 0, irrigationMm: 10 });
  assertWaterBalance(irrigated);
  assert.equal(irrigated.vegetation.waterStressIndex, 0);
  assert.ok(irrigated.vegetation.growthIndex > dry.vegetation.growthIndex);
});

test('rainfall, saturation, infiltration limits, drainage and river equivalents account for every mm', () => {
  const saturated = simulateDay({
    soilWaterMm: 0, soilCapacityMm: 100, rainMm: 300, irrigationMm: 0,
    infiltrationCapacityMmDay: 200, solarMJm2Day: 0,
    fieldCapacityFraction: 0.5, drainageFraction: 0.5
  });
  assertWaterBalance(saturated);
  assert.equal(saturated.water.infiltrationMm, 100);
  assert.equal(saturated.water.runoffMm, 200);
  assert.equal(saturated.water.drainageMm, 25);
  assert.equal(saturated.water.finalSoilWaterMm, 75);
  const limited = simulateDay({
    soilWaterMm: 0, rainMm: 50, irrigationMm: 10,
    infiltrationCapacityMmDay: 5, solarMJm2Day: 0, drainageFraction: 0
  });
  assertWaterBalance(limited);
  assert.equal(limited.water.infiltrationMm, 5);
  assert.equal(limited.water.runoffMm, 55);
  const full = simulateDay({ soilWaterMm: 140, rainMm: 10, solarMJm2Day: 0, drainageFraction: 0 });
  assertWaterBalance(full);
  assert.equal(full.water.infiltrationMm, 0);
  assert.equal(full.water.runoffMm, 10);
});

test('clouds attenuate synthetic solar demand, and a dark day has finite zero growth', () => {
  const clear = simulateDay({ cloudFraction: 0 });
  const cloudy = simulateDay({ cloudFraction: 1 });
  assert.ok(cloudy.solar.effectiveSolarMJm2Day < clear.solar.effectiveSolarMJm2Day);
  assert.ok(cloudy.water.evapotranspirationDemandMm < clear.water.evapotranspirationDemandMm);
  const dark = simulateDay({ solarMJm2Day: 0, rainMm: 0 });
  assert.equal(dark.water.evapotranspirationMm, 0);
  assert.equal(dark.vegetation.waterStressIndex, 0);
  assert.equal(dark.vegetation.growthIndex, 0);
  assertWaterBalance(dark);
});

test('bounded daily sequences conserve water across dry and wet synthetic seasons', () => {
  let soilWaterMm = 25;
  let externalInput = 0;
  let losses = 0;
  for (let day = 0; day < 366; day += 1) {
    const rainMm = day % 17 === 0 ? 90 : day % 7 === 0 ? 3.5 : 0;
    const result = simulateDay({ scenario: 'arabia', soilWaterMm, rainMm });
    assertWaterBalance(result);
    externalInput += result.water.externalInputMm;
    losses += result.water.evapotranspirationMm + result.water.runoffMm + result.water.drainageMm;
    soilWaterMm = result.water.finalSoilWaterMm;
    for (const field of ['waterStressIndex', 'growthIndex', 'fruitPotentialIndex']) {
      assert.ok(result.vegetation[field] >= 0 && result.vegetation[field] <= 1);
    }
  }
  assert.ok(Math.abs(25 + externalInput - losses - soilWaterMm) < 1e-7);
});

test('non-finite, negative, oversized, conflicting and unknown inputs are rejected without coercion', () => {
  for (const field of Object.keys(FIELD_SCHEMA)) {
    for (const value of [NaN, Infinity, -Infinity, -1, '1', null]) {
      rejectsCode(() => simulateDay({ [field]: value }), 'INVALID_MODEL_NUMERIC_INPUT');
    }
    rejectsCode(() => simulateDay({ [field]: FIELD_SCHEMA[field].max + 1 }), 'INVALID_MODEL_NUMERIC_INPUT');
  }
  rejectsCode(() => simulateDay({ soilWaterMm: 101, soilCapacityMm: 100 }), 'SOIL_STORAGE_EXCEEDS_CAPACITY');
  rejectsCode(() => simulateDay({ treeCanopyFraction: 0.9, canopyFraction: 0.2 }), 'TREE_CANOPY_EXCEEDS_TOTAL_CANOPY');
  rejectsCode(() => simulateDay({ command: 'operate-irrigation' }), 'UNKNOWN_MODEL_INPUT_FIELD');
  rejectsCode(() => simulateDay({ scenario: 'constructor' }), 'UNKNOWN_SYNTHETIC_SCENARIO');
  rejectsCode(() => simulateDay({ scenario: undefined }), 'UNKNOWN_SYNTHETIC_SCENARIO');
  rejectsCode(() => simulateDay([]), 'INVALID_MODEL_INPUT');
  let getterCalled = false;
  const input = {};
  Object.defineProperty(input, 'rainMm', { get() { getterCalled = true; return 5; } });
  rejectsCode(() => simulateDay(input), 'INVALID_MODEL_INPUT');
  assert.equal(getterCalled, false);
});

test('learning export has reproducible features, units and model targets labeled synthetic, without training', () => {
  const input = { scenario: 'island', rainMm: 12 };
  const example = exportLearningExample(input);
  const result = simulateDay(input);
  assert.deepEqual(example, exportLearningExample(input));
  assert.deepEqual(Object.keys(example.features), Object.keys(FIELD_SCHEMA));
  assert.equal(example.observation.kind, 'SYNTHETIC_SIMULATION_NOT_MEASUREMENT');
  assert.equal(example.synthetic, true);
  assert.equal(example.trainingPerformed, false);
  assert.equal(example.neuralModelLive, false);
  assert.equal(example.targets.finalSoilWaterMm, result.water.finalSoilWaterMm);
  assert.equal(example.targets.growthIndex, result.vegetation.growthIndex);
  assert.equal(example.units.features.solarMJm2Day, 'MJ/m2/day');
  assert.equal(example.units.targets.runoffMm, 'mm/day');
  assert.throws(() => { example.targets.growthIndex = 1; }, TypeError);
});
