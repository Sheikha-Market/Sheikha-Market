'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const production = require('../core/foundation/sheikha-language-production-v1.cjs');
const { packageHeader } = require('../tools/production/build-sheikha-native-runtime-v1.cjs');
test('native package derives finite instructions and inline contracts from Sheikha source', () => {
  const header = packageHeader(production.build());
  assert.ok(header.includes('#define SHEIKHA_COMPONENT_COUNT 18U'));
  assert.ok(header.includes('#define SHEIKHA_INSTRUCTION_COUNT 37U'));
  assert.equal(header.includes('char *'), false);
});
test('native package rejects unsupported executable instructions', () => {
  const result = production.build();
  const bytecode = JSON.parse(result.files['program.bytecode.json']);
  bytecode.instructions.push({ code: 'CALL_COMMAND', command: 'PM2', argument: 'restart' });
  result.files['program.bytecode.json'] = JSON.stringify(bytecode);
  assert.throws(() => packageHeader(result), /NATIVE_OPCODE_NOT_ADMITTED/);
});
test('oversized native contract fails before native compilation', () => {
  const result = production.build(); const contract = JSON.parse(result.files['contracts/core.json']);
  contract.extra = 'x'.repeat(2000); result.files['contracts/core.json'] = JSON.stringify(contract);
  assert.throws(() => packageHeader(result), /CONTRACT_CAPACITY_EXCEEDED/);
});
test('production cannot be admitted by the native environment status', () => {
  const status = require('../core/foundation/sheikha-native-environment-status-v1.cjs').status();
  assert.equal(status.productionReady, false);
});
