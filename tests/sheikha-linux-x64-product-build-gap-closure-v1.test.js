'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
);
const contract = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      'runtime',
      'distribution',
      'v1',
      'sheikha-linux-x64-product-build-contract-v1.json'
    ),
    'utf8'
  )
);
const runner = fs.readFileSync(
  path.join(
    ROOT,
    'scripts',
    'distribution',
    'linux',
    'build-sheikha-linux-installers-v1.sh'
  ),
  'utf8'
);
const tool = fs.readFileSync(
  path.join(
    ROOT,
    'tools',
    'distribution',
    'sheikha-linux-x64-product-build-v1.js'
  ),
  'utf8'
);

test('Linux x64 product build contract defines four targets', () => {
  assert.equal(contract.targets.length, 4);
  assert.equal(
    new Set(contract.targets.map((target) => target.id)).size,
    4
  );
});

test('contract covers DEB, RPM, tar.gz, and CLI products', () => {
  assert.deepEqual(
    contract.targets.map((target) => target.product),
    ['deb', 'rpm', 'tar-gz', 'cli']
  );
});

test('every target has an exact product package script', () => {
  for (const target of contract.targets) {
    assert.equal(
      typeof packageJson.scripts[target.packageScript],
      'string'
    );
  }
});

test('every exact package script invokes the product build tool', () => {
  for (const target of contract.targets) {
    assert.match(
      packageJson.scripts[target.packageScript],
      /sheikha-linux-x64-product-build-v1\.js build/
    );
  }
});

test('every target delegate exists and is nonrecursive', () => {
  for (const target of contract.targets) {
    assert.equal(
      typeof packageJson.scripts[target.delegateScript],
      'string'
    );
    assert.notEqual(target.delegateScript, target.packageScript);
  }
});

test('runner accepts product and architecture arguments', () => {
  assert.match(runner, /PRODUCT="\$\{1:-\}"/);
  assert.match(runner, /ARCH="\$\{2:-\}"/);
});

test('runner supports the four Linux x64 products', () => {
  assert.match(runner, /deb\|rpm\|tar-gz\|cli/);
  assert.match(runner, /x64/);
});

test('runner selects an exact product-specific package script', () => {
  assert.match(
    runner,
    /sheikha:dist:linux:\$\{PRODUCT\}:\$\{ARCH\}/
  );
  assert.doesNotMatch(runner, /genericFallback/i);
});

test('runner exports product, architecture, and output directory', () => {
  assert.match(runner, /SHEIKHA_TARGET_PRODUCT/);
  assert.match(runner, /SHEIKHA_TARGET_ARCH/);
  assert.match(runner, /SHEIKHA_OUTPUT_DIR/);
});

test('runner and product tool do not install packages', () => {
  for (const text of [runner, tool]) {
    assert.doesNotMatch(text, /\bnpm\s+(install|ci)\b/i);
    assert.doesNotMatch(text, /\bapt(-get)?\s+install\b/i);
    assert.doesNotMatch(text, /\bbrew\s+install\b/i);
  }
});

test('RPM target requires rpmbuild and remains evidence gated', () => {
  const rpm = contract.targets.find(
    (target) => target.id === 'LINUX_RPM_X64'
  );
  assert.ok(rpm.requiredCommands.includes('rpmbuild'));
  assert.equal(rpm.delegateExecutionValidationRequired, true);
});

test('documentation rejects artifact completion claims', () => {
  const text = fs.readFileSync(
    path.join(
      ROOT,
      'docs',
      'distribution',
      'SHEIKHA-LINUX-X64-PRODUCT-BUILD-GAP-CLOSURE-V1.md'
    ),
    'utf8'
  );

  assert.match(text, /لا تثبت إنشاء حزمة صحيحة/);
  assert.match(text, /لا تقوم هذه المرحلة بتثبيتها/);
  assert.match(text, /لا تنفذ.*أي بناء أو تثبيت حزم/s);
});
