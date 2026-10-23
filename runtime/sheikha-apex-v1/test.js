'use strict';
const assert = require('assert');
const { PRODUCTS, MODELS } = require('./products-v1');
const { diagnoseRarity, RESOURCE_POLICY } = require('./resource-governance-v1');
const firmware = require('./firmware-governance-v1');
const tpm = require('./tpm-governance-v1');

const tests = [];
function test(name, fn) { fn(); tests.push(name); }

test('products count is 11', () => assert.strictEqual(PRODUCTS.length, 11));
test('models count is 8', () => assert.strictEqual(MODELS.length, 8));
test('rarity example equals 80.5 VERY_RARE', () => {
  const r = diagnoseRarity({
    availability: 10,
    alternatives: 20,
    supplierConcentration: 90,
    criticality: 85,
    renewalDifficulty: 45
  });
  assert.strictEqual(r.score, 80.5);
  assert.strictEqual(r.id, 'VERY_RARE');
  assert.strictEqual(r.commercialDecisionAllowedFromRarityAlone, false);
});
test('resource policy prevents monopoly', () => assert.strictEqual(RESOURCE_POLICY.noMonopoly, true));
test('resource policy prevents artificial scarcity', () => assert.strictEqual(RESOURCE_POLICY.noArtificialScarcity, true));
test('firmware flashing locked', () => assert.strictEqual(firmware.status().firmwareWriteAuthorized, false));
test('secure boot key mutation locked', () => assert.strictEqual(firmware.status().secureBootKeyMutationAuthorized, false));
test('tpm getcap read only', () => assert.strictEqual(tpm.classifyCommand('tpm2_getcap -c properties-fixed').class, 'READ_ONLY'));
test('tpm clear high impact', () => assert.strictEqual(tpm.classifyCommand('tpm2_clear').defaultAuthorized, false));
test('tpm activatecredential not authorized now', () => assert.strictEqual(tpm.status().activateCredentialAuthorizedNow, false));
test('ewar is defense only', () => {
  const p = PRODUCTS.find((x) => x.id === 'SHEIKHA_EWAR_DEFENSIVE_RESILIENCE');
  assert.ok(p);
  assert.strictEqual(p.state, 'DEFENSE_ONLY');
});
test('gardens boundary is worldly only', () => {
  const p = PRODUCTS.find((x) => x.id === 'SHEIKHA_GARDENS_FARMS_PASTURES');
  assert.strictEqual(p.boundary, 'WORLDLY_ENGINEERING_ONLY_NO_AFTERLIFE_SIMULATION');
});

console.log(`SHEIKHA_RUNTIME_APEX_TESTS=${tests.length}/${tests.length}_PASSED`);
