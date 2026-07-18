'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadContract,
  loadEvidenceTemplate,
  verifyExecutionFoundation
} = require('../core/distribution/sheikha-native-installer-build-execution-v1');

const {
  loadMatrix
} = require('../core/distribution/sheikha-installer-distribution-governance-v1');

const ROOT = path.resolve(__dirname, '..');

test('native installer build execution foundation verifies', () => {
  assert.equal(verifyExecutionFoundation().verified, true);
});

test('execution contract preserves the 26-target matrix', () => {
  assert.equal(loadContract().targetCount, 26);
  assert.equal(loadMatrix().targets.length, 26);
});

test('execution contract defines nine native runner groups', () => {
  const groups = loadContract().runnerGroups;
  assert.equal(groups.length, 9);
  assert.equal(new Set(groups).size, 9);
});

test('Windows targets use Windows runner groups', () => {
  for (const target of loadMatrix().targets.filter(
    (item) => item.platform === 'windows'
  )) {
    assert.match(target.nativeRunner, /^windows-/);
  }
});

test('Linux targets use Linux runner groups', () => {
  for (const target of loadMatrix().targets.filter(
    (item) => item.platform === 'linux'
  )) {
    assert.match(target.nativeRunner, /^linux-/);
  }
});

test('macOS targets use macOS runner groups', () => {
  for (const target of loadMatrix().targets.filter(
    (item) => item.platform === 'macos'
  )) {
    assert.match(target.nativeRunner, /^macos-/);
  }
});

test('evidence template starts with all base gates closed', () => {
  const gates = loadEvidenceTemplate().gates;
  for (const gate of [
    'SOURCE_COMMIT_BOUND',
    'NATIVE_BUILD_COMPLETED',
    'ARTIFACT_PRESENT',
    'SHA256_RECORDED',
    'SBOM_RECORDED',
    'PROVENANCE_RECORDED',
    'NATIVE_INSTALL_TEST_PASSED',
    'SMOKE_TEST_PASSED',
    'UNINSTALL_TEST_PASSED',
    'SIGNATURE_OR_UNSIGNED_STATUS_RECORDED'
  ]) {
    assert.equal(gates[gate], false);
  }
});

test('human release approval starts disabled', () => {
  assert.equal(loadEvidenceTemplate().humanReleaseApproval, false);
});

test('all three platform runner scripts exist', () => {
  for (const relativePath of [
    'scripts/distribution/linux/build-sheikha-linux-installers-v1.sh',
    'scripts/distribution/windows/build-sheikha-windows-installers-v1.ps1',
    'scripts/distribution/macos/build-sheikha-macos-installers-v1.sh'
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, relativePath)), true);
  }
});

test('platform runners do not install packages', () => {
  for (const relativePath of [
    'scripts/distribution/linux/build-sheikha-linux-installers-v1.sh',
    'scripts/distribution/windows/build-sheikha-windows-installers-v1.ps1',
    'scripts/distribution/macos/build-sheikha-macos-installers-v1.sh'
  ]) {
    const text = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
    assert.doesNotMatch(text, /\bnpm\s+(install|ci)\b/i);
    assert.doesNotMatch(text, /\bapt(-get)?\s+install\b/i);
    assert.doesNotMatch(text, /\bbrew\s+install\b/i);
  }
});

test('runner scripts contain native platform guards', () => {
  const linux = fs.readFileSync(
    path.join(
      ROOT,
      'scripts/distribution/linux/build-sheikha-linux-installers-v1.sh'
    ),
    'utf8'
  );
  const windows = fs.readFileSync(
    path.join(
      ROOT,
      'scripts/distribution/windows/build-sheikha-windows-installers-v1.ps1'
    ),
    'utf8'
  );
  const macos = fs.readFileSync(
    path.join(
      ROOT,
      'scripts/distribution/macos/build-sheikha-macos-installers-v1.sh'
    ),
    'utf8'
  );

  assert.match(linux, /uname -s/);
  assert.match(windows, /Windows_NT/);
  assert.match(macos, /Darwin/);
});

test('runbook rejects full activation claims without native evidence', () => {
  const text = fs.readFileSync(
    path.join(
      ROOT,
      'docs/distribution/SHEIKHA-NATIVE-INSTALLER-BUILD-EXECUTION-RUNBOOK-V1.md'
    ),
    'utf8'
  );

  assert.match(text, /لا تدعي أن الحزم بُنيت أو اختُبرت/);
  assert.match(text, /لا يثبت اكتمال Windows أو macOS من جهاز Linux وحده/);
  assert.match(text, /الاعتماد البشري يبقى `false`/);
});
