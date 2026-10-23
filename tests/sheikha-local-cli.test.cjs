'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { checkJs, sourceComparison } = require('../cli.cjs');

test('syntax check does not execute inspected project code', () => {
  const folder = fs.mkdtempSync(path.join(__dirname, '.cli-check-'));
  try {
    const marker = path.join(folder, 'MUST_NOT_EXIST');
    const file = path.join(folder, 'valid.cjs');
    fs.writeFileSync(file, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed');\n`);
    assert.equal(checkJs(file).passed, true);
    assert.equal(fs.existsSync(marker), false);
    fs.writeFileSync(file, '# invalid JavaScript\n');
    assert.equal(checkJs(file).reason, 'INVALID_SYNTAX');
    fs.writeFileSync(file, '');
    assert.equal(checkJs(file).reason, 'EMPTY_FILE');
    fs.writeFileSync(file, '// الصق محتوى kernel.js\n');
    assert.equal(checkJs(file).reason, 'PLACEHOLDER_CONTENT');
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});

test('outside files and symlinks outside the project are refused', () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-cli-test-'));
  const inside = fs.mkdtempSync(path.join(__dirname, '.cli-link-'));
  try {
    const file = path.join(outside, 'external.js');
    fs.writeFileSync(file, 'module.exports = true;\n');
    assert.throws(() => checkJs(file), /PathOutsideProject/);
    const link = path.join(inside, 'external.js');
    fs.symlinkSync(file, link);
    assert.throws(() => checkJs(link), /PathOutsideProject/);
  } finally {
    fs.rmSync(inside, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

test('source changes cannot be promoted to tested source by a receipt', () => {
  assert.equal(sourceComparison(null).state, 'NOT_VERIFIED');
  const changed = sourceComparison({ passed: true, sourceHashes: { 'cli.cjs': '0'.repeat(64) } });
  assert.equal(changed.state, 'SOURCE_CHANGED_SINCE_TEST');
  assert.equal(changed.mismatches[0].state, 'CHANGED');
  const escaped = sourceComparison({ passed: true, sourceHashes: { '../../outside.js': '0'.repeat(64) } });
  assert.equal(escaped.mismatches[0].state, 'INVALID_RECEIPT_PATH');
});
