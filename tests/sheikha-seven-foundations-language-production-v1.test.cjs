'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path');
const production = require('../core/foundation/sheikha-language-production-v1.cjs');
const language = require('../core/language/sheikha-managed-language-v1.cjs');
const source = fs.readFileSync(path.resolve(__dirname, '../' + production.SOURCE_FILE), 'utf8');
test('Sheikha source drives bytecode production of all session component contracts', () => {
  const result = production.build();
  assert.equal(result.manifest.status, 'LOCAL_LANGUAGE_PRODUCTION_COMPLETE');
  const contracts = Object.keys(result.files).filter(f => f.startsWith('contracts/'));
  assert.equal(contracts.length, 18);
  const evidence = JSON.parse(result.files['execution.json']);
  assert.equal(evidence.governanceViolations, 0);
  assert.equal(evidence.output.filter(x => x.startsWith('PRODUCED:')).length, 18);
  assert.equal(evidence.adapterDryRun, true);
});
test('builds are deterministic for the same local evidence', () => {
  assert.deepEqual(production.build().files, production.build().files);
});
test('production before verification is blocked and no artifacts returned', () => {
  const invalid = source.replace('  تحقق_وحدة "utf"\n  انتج_عقد "utf"', '  انتج_عقد "utf"\n  تحقق_وحدة "utf"');
  assert.throws(() => production.build(invalid), /PRODUCTION_GATE_BLOCKED/);
});
test('adapter commands are rejected by the production dialect', () => {
  const unsafe = source + '  PM2 restart sheikha-api\n';
  assert.throws(() => production.build(unsafe), /PRODUCTION_COMMAND_NOT_ADMITTED/);
});
test('normal managed runtime cannot silently treat production commands as output', () => {
  const result = language.run('إجراء انتاج:\n  تحقق_وحدة "core"\n');
  assert.equal(result.success, false);
  assert.equal(result.status, 'GOVERNANCE_BLOCKED');
});
test('missing governance and unregistered component identifiers block production', () => {
  const noPolicy = source.replace('سياسة الانتاج_المحلي:', 'سياسة سياسة_أخرى:');
  assert.throws(() => production.build(noPolicy), /PRODUCTION_GATE_BLOCKED/);
  assert.throws(() => production.build(source.replace('تحقق_وحدة "utf"', 'تحقق_وحدة "unknown"')), /TYPECHECK_BLOCKED/);
});
