'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const MATRIX_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-installer-distribution-matrix-v1.json'
);
const EVIDENCE_PATH = path.join(
  ROOT,
  'runtime',
  'distribution',
  'v1',
  'sheikha-installer-evidence-contract-v1.json'
);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadMatrix() {
  return loadJson(MATRIX_PATH);
}

function loadEvidenceContract() {
  return loadJson(EVIDENCE_PATH);
}

function verifyGovernance() {
  const matrix = loadMatrix();
  const evidence = loadEvidenceContract();

  const targets = Array.isArray(matrix.targets) ? matrix.targets : [];
  const ids = new Set(targets.map((target) => target.id));
  const requiredGates = new Set(evidence.requiredGates || []);

  const platformCounts = targets.reduce((counts, target) => {
    counts[target.platform] = (counts[target.platform] || 0) + 1;
    return counts;
  }, {});

  const checks = {
    matrixSystem:
      matrix.system === 'SHEIKHA_INSTALLER_DISTRIBUTION_MATRIX_V1',
    evidenceSystem:
      evidence.system === 'SHEIKHA_INSTALLER_EVIDENCE_CONTRACT_V1',
    targetCount:
      matrix.targetCount === 26 && targets.length === 26,
    uniqueIds:
      ids.size === 26,
    platformCounts:
      platformCounts.windows === 8 &&
      platformCounts.linux === 13 &&
      platformCounts.macos === 5,
    requiredGateCount:
      requiredGates.size === 10,
    nativeInstallRequired:
      requiredGates.has('NATIVE_INSTALL_TEST_PASSED'),
    smokeRequired:
      requiredGates.has('SMOKE_TEST_PASSED'),
    uninstallRequired:
      requiredGates.has('UNINSTALL_TEST_PASSED'),
    sbomRequired:
      requiredGates.has('SBOM_RECORDED'),
    provenanceRequired:
      requiredGates.has('PROVENANCE_RECORDED'),
    configAloneNotEnough:
      evidence.truthBoundaries?.configurationAloneProvesActivation === false,
    artifactAloneNotEnough:
      evidence.truthBoundaries?.artifactPresenceAloneProvesActivation === false,
    storeReceiptRequired:
      evidence.truthBoundaries?.storePublicationClaimWithoutReceiptAllowed === false,
    humanReleaseApprovalRequired:
      evidence.fullEvidenceRule?.humanReleaseApprovalRequired === true,
    noProductionAuthorization:
      evidence.deployment?.productionChangeAuthorized === false &&
      evidence.deployment?.serviceRestartAuthorized === false &&
      evidence.deployment?.packageInstallationAuthorized === false &&
      evidence.deployment?.cleanupAuthorized === false
  };

  return {
    system: 'SHEIKHA_INSTALLER_DISTRIBUTION_GOVERNANCE_V1',
    verified: Object.values(checks).every(Boolean),
    platformCounts,
    checks
  };
}

function evaluateEvidence(target, bundle, evidenceContract = loadEvidenceContract()) {
  const required = evidenceContract.requiredGates || [];
  const conditional = [];

  if (target.storePublicationRequired) {
    conditional.push(
      ...(evidenceContract.conditionalGates?.storePublicationRequired || [])
    );
  }

  if (target.platform === 'macos') {
    conditional.push(
      ...(evidenceContract.conditionalGates?.macosDistribution || [])
    );
  }

  if (target.platform === 'windows') {
    conditional.push(
      ...(evidenceContract.conditionalGates?.windowsDistribution || [])
    );
  }

  const gates = bundle?.gates || {};
  const requiredPassed = required.every((gate) => gates[gate] === true);
  const conditionalPassed = conditional.every((gate) => gates[gate] === true);

  return {
    targetId: target.id,
    requiredGateCount: required.length,
    conditionalGateCount: conditional.length,
    requiredPassed,
    conditionalPassed,
    fullyEvidenced:
      requiredPassed &&
      conditionalPassed &&
      bundle?.humanReleaseApproval === true
  };
}

module.exports = {
  MATRIX_PATH,
  EVIDENCE_PATH,
  loadMatrix,
  loadEvidenceContract,
  verifyGovernance,
  evaluateEvidence
};

if (require.main === module) {
  const result = verifyGovernance();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.verified ? 0 : 1;
}
