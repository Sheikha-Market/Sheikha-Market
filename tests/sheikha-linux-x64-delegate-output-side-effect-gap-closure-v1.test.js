'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');

const contract = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      'runtime',
      'distribution',
      'v1',
      'sheikha-linux-x64-controlled-validation-build-contract-v1.json'
    ),
    'utf8'
  )
);

const evidence = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      'runtime',
      'distribution',
      'v1',
      'sheikha-linux-x64-validation-artifact-evidence-v1.json'
    ),
    'utf8'
  )
);

const builder = fs.readFileSync(
  path.join(
    ROOT,
    'tools',
    'distribution',
    'sheikha-linux-x64-controlled-validation-builder-v1.js'
  ),
  'utf8'
);

const productTool = fs.readFileSync(
  path.join(
    ROOT,
    'tools',
    'distribution',
    'sheikha-linux-x64-product-build-v1.js'
  ),
  'utf8'
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

test('controlled contract defines three Linux x64 validation targets', () => {
  assert.equal(contract.targets.length, 3);
  assert.deepEqual(
    contract.targets.map((item) => item.product),
    ['deb', 'tar-gz', 'cli']
  );
});

test('controlled mode is non-release validation only', () => {
  assert.equal(contract.mode, 'NON_RELEASE_VALIDATION_ONLY');
});

test('explicit external output directory is mandatory', () => {
  assert.equal(
    contract.executionRules.explicitOutputDirectoryRequired,
    true
  );
  assert.equal(
    contract.executionRules.outputMustBeOutsideRepository,
    true
  );
  assert.equal(
    contract.executionRules.outputMustBeUnderAllowedRoot,
    true
  );
});

test('network, package installation, service control, and remote mutation are disabled', () => {
  const rules = contract.executionRules;
  assert.equal(rules.networkAccessRequired, false);
  assert.equal(rules.packageInstallationAllowed, false);
  assert.equal(rules.serviceControlAllowed, false);
  assert.equal(rules.remoteMutationAllowed, false);
});

test('production deployment and artifact promotion remain disabled', () => {
  const rules = contract.executionRules;
  assert.equal(rules.productionDeploymentAllowed, false);
  assert.equal(rules.artifactPromotionAllowed, false);
});

test('evidence starts with release and promotion claims disabled', () => {
  assert.equal(evidence.releaseArtifactClaimed, false);
  assert.equal(evidence.productionPromotionAuthorized, false);
});

test('all evidence gates start closed', () => {
  assert.equal(
    Object.values(evidence.gates).every((value) => value === false),
    true
  );
});

test('builder enforces clean source worktree', () => {
  assert.match(builder, /sourceIsClean/);
  assert.match(builder, /cleanSourceWorktree/);
});

test('builder enforces an allowed output root outside the repository', () => {
  assert.match(builder, /OUTPUT_DIRECTORY_INSIDE_REPOSITORY_REJECTED/);
  assert.match(builder, /OUTPUT_DIRECTORY_OUTSIDE_ALLOWED_ROOT/);
});

test('builder creates DEB with dpkg-deb and archives with Git and tar', () => {
  assert.match(builder, /dpkg-deb/);
  assert.match(builder, /git/);
  assert.match(builder, /archive/);
  assert.match(builder, /tar/);
});

test('builder does not contain package installation or service restart commands', () => {
  assert.doesNotMatch(builder, /\bnpm\s+(?:install|ci)\b/i);
  assert.doesNotMatch(builder, /\bapt(?:-get)?\s+install\b/i);
  assert.doesNotMatch(builder, /\bsystemctl\s+(?:start|restart|stop)\b/i);
  assert.doesNotMatch(builder, /\bpm2\s+(?:start|restart|delete)\b/i);
});

test('product tool routes DEB, tar.gz, and CLI to the controlled builder', () => {
  assert.match(productTool, /controlledProducts/);
  assert.match(
    productTool,
    /sheikha-linux-x64-controlled-validation-builder-v1\.js/
  );
});

test('runner requires an explicit controlled output directory', () => {
  assert.match(runner, /EXPLICIT_OUTPUT_DIRECTORY_REQUIRED/);
  assert.match(runner, /native-installer-validation-builds/);
});

test('documentation rejects commercial and production claims', () => {
  const document = fs.readFileSync(
    path.join(
      ROOT,
      'docs',
      'distribution',
      'SHEIKHA-LINUX-X64-DELEGATE-OUTPUT-SIDE-EFFECT-GAP-CLOSURE-V1.md'
    ),
    'utf8'
  );

  assert.match(document, /غير مخصصة للإصدار/);
  assert.match(document, /لا يعني اعتماده للبيع أو الإنتاج/);
  assert.match(document, /لا تنفذ الأمر السابق/);
});
