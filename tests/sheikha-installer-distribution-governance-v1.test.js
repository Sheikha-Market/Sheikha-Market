'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadMatrix,
  loadEvidenceContract,
  verifyGovernance,
  evaluateEvidence
} = require('../core/distribution/sheikha-installer-distribution-governance-v1');

test('installer distribution governance verifies', () => {
  assert.equal(verifyGovernance().verified, true);
});

test('matrix contains exactly 26 unique targets', () => {
  const matrix = loadMatrix();
  assert.equal(matrix.targets.length, 26);
  assert.equal(new Set(matrix.targets.map((target) => target.id)).size, 26);
});

test('platform target counts are 8 Windows, 13 Linux, and 5 macOS', () => {
  const counts = verifyGovernance().platformCounts;
  assert.deepEqual(counts, {
    windows: 8,
    linux: 13,
    macos: 5
  });
});

test('all targets name a native runner and output extension', () => {
  const matrix = loadMatrix();
  for (const target of matrix.targets) {
    assert.equal(typeof target.nativeRunner, 'string');
    assert.ok(target.nativeRunner.length > 0);
    assert.ok(target.artifactExtensions.length > 0);
  }
});

test('required evidence includes install, smoke, and uninstall tests', () => {
  const gates = new Set(loadEvidenceContract().requiredGates);
  assert.equal(gates.has('NATIVE_INSTALL_TEST_PASSED'), true);
  assert.equal(gates.has('SMOKE_TEST_PASSED'), true);
  assert.equal(gates.has('UNINSTALL_TEST_PASSED'), true);
});

test('required evidence includes digest, SBOM, and provenance', () => {
  const gates = new Set(loadEvidenceContract().requiredGates);
  assert.equal(gates.has('SHA256_RECORDED'), true);
  assert.equal(gates.has('SBOM_RECORDED'), true);
  assert.equal(gates.has('PROVENANCE_RECORDED'), true);
});

test('configuration or artifact presence alone cannot prove activation', () => {
  const boundaries = loadEvidenceContract().truthBoundaries;
  assert.equal(boundaries.configurationAloneProvesActivation, false);
  assert.equal(boundaries.artifactPresenceAloneProvesActivation, false);
});

test('Snap publication requires store evidence', () => {
  const matrix = loadMatrix();
  const snap = matrix.targets.find(
    (target) => target.id === 'LINUX_SNAP_STORE'
  );
  assert.equal(snap.storePublicationRequired, true);
  assert.deepEqual(
    loadEvidenceContract().conditionalGates.storePublicationRequired,
    ['STORE_UPLOAD_COMPLETED', 'STORE_PUBLICATION_STATUS_RECORDED']
  );
});

test('empty evidence bundle never becomes fully evidenced', () => {
  const target = loadMatrix().targets[0];
  const result = evaluateEvidence(target, {});
  assert.equal(result.fullyEvidenced, false);
});

test('all required and applicable gates plus human approval are required', () => {
  const target = loadMatrix().targets.find(
    (item) => item.id === 'WINDOWS_USER_INSTALLER_X64'
  );
  const contract = loadEvidenceContract();
  const gates = {};

  for (const gate of contract.requiredGates) {
    gates[gate] = true;
  }
  for (const gate of contract.conditionalGates.windowsDistribution) {
    gates[gate] = true;
  }

  const withoutApproval = evaluateEvidence(target, {
    gates,
    humanReleaseApproval: false
  });
  const withApproval = evaluateEvidence(target, {
    gates,
    humanReleaseApproval: true
  });

  assert.equal(withoutApproval.fullyEvidenced, false);
  assert.equal(withApproval.fullyEvidenced, true);
});
