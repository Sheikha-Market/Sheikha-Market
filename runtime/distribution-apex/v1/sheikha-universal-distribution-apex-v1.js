'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const LOCAL_RELEASES_ROOT = path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases');
const DISTRIBUTION_REPORT = path.join(
  ROOT,
  'runtime/distribution/v1/sheikha-universal-distribution-v1-report.json'
);
const RELEASE_MATRIX = path.join(
  ROOT,
  'distribution/manifest/sheikha-release-matrix-v1.json'
);

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function evidenceSnapshot() {
  const report = readJson(DISTRIBUTION_REPORT, {});
  const matrix = readJson(RELEASE_MATRIX, { targetCount: 0, targets: [] });
  const targets = Array.isArray(report.targets) ? report.targets : [];
  const matrixTargets = Array.isArray(matrix.targets) ? matrix.targets : [];
  const invalidVerifiedClaims = targets.filter((target) =>
    target.status === 'VERIFIED' &&
    (!target.artifact || target.nativeVerified !== true || !target.verificationEvidence)
  );
  return {
    reportAvailable: report.system === 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1',
    matrixAvailable: matrix.targetCount === 27 && matrixTargets.length === 27,
    targetCount: Number(report.targetCount || matrix.targetCount || 0),
    builtCount: Number(report.builtCount || 0),
    verifiedCount: Number(report.verifiedCount || 0),
    nativeVerifiedCount: Number(report.nativeVerifiedCount || 0),
    signedCount: Number(report.signedCount || 0),
    notarizedCount: Number(report.notarizedCount || 0),
    externalPublishedCount: Number(report.publishedCount || 0),
    localPublishedCount: Number(report.localRegistryPublishedCount || 0),
    localRegistryOnly: report.localRegistryOnly === true,
    githubRequired: report.githubRequired === true,
    reproducibilityVerified: report.reproducibility?.passed === true,
    secretScanPassed: report.secretScan?.passed === true,
    invalidVerifiedClaims: invalidVerifiedClaims.map((target) => target.id),
    claimPolicy: report.claimPolicy || 'No target is complete without evidence.'
  };
}

function status() {
  const evidence = evidenceSnapshot();
  const active = evidence.reportAvailable &&
    evidence.matrixAvailable &&
    evidence.builtCount > 0 &&
    evidence.localRegistryOnly &&
    !evidence.githubRequired &&
    evidence.reproducibilityVerified &&
    evidence.secretScanPassed &&
    evidence.invalidVerifiedClaims.length === 0;
  return {
    success: true,
    system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
    status: active ? 'ACTIVE_WITH_EVIDENCE_GATED_LOCAL_RELEASE' : 'REVIEW_REQUIRED',
    arabicName: 'قمة شيخة العالمية للإصدار والتوزيع المحكوم',
    level: 'L27_HIGHEST_GOVERNED_RELEASE_DISTRIBUTION_APEX_LAYER',
    apexLevel: 27,
    plane: 'RELEASE_DELIVERY_PLANE_ONLY',
    position: 'UNDER_NON_EXECUTABLE_VALUES_REFERENCE_AND_COVENANT_GOVERNANCE_ABOVE_RELEASE_EXECUTION_LAYERS',
    layerRelationship: {
      l27: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
      l26: 'SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1',
      l25: 'SHEIKHA_AUTONOMOUS_ENTERPRISE_FABRIC_V1',
      l24: 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      l24Role: 'COGNITIVE_EVIDENCE_AND_DECISION_SUPPORT',
      l27Role: 'RELEASE_EVIDENCE_AGGREGATION_AND_LOCAL_DELIVERY',
      crossPlaneAuthorityEscalation: false
    },
    capabilities: {
      releasePlanner: 'ACTIVE',
      targetMatrixResolver: 'ACTIVE_27_TARGETS',
      toolchainInspector: 'ACTIVE',
      sourceStagingEngine: 'ACTIVE',
      platformAdapterRegistry: 'ACTIVE',
      packageBuilder: 'ACTIVE_WHEN_TOOLCHAIN_AVAILABLE',
      checksumGenerator: 'ACTIVE_SHA256',
      sbomGenerator: 'ACTIVE_CYCLONEDX_1_5',
      provenanceGenerator: 'ACTIVE_SLSA_SHAPED_STATEMENT',
      packageInspector: 'ACTIVE',
      nativeSmokeGate: 'ACTIVE',
      signingReadinessGate: 'ACTIVE_NO_AUTOMATIC_SIGNING',
      localReleaseRegistry: 'ACTIVE_ATOMIC_NO_OVERWRITE',
      releaseIndexGenerator: 'ACTIVE'
    },
    evidence,
    routes: {
      status: '/api/sheikha/distribution-apex/v1/status',
      matrix: '/api/sheikha/distribution-apex/v1/matrix',
      releaseIndex: '/api/sheikha/distribution-apex/v1/release-index'
    },
    governance: {
      highestValuesReferenceExecutable: false,
      covenantGovernanceRequired: true,
      remoteBuildEndpointExposed: false,
      remotePublishEndpointExposed: false,
      automaticExternalPublishing: false,
      automaticSigning: false,
      automaticNotarization: false,
      noPrivilegeEscalationByLayerPromotion: true,
      humanApprovalForHighImpactRelease: true,
      aiIsToolOnly: true,
      humanFinalDecision: true
    }
  };
}

function matrixSummary() {
  const matrix = readJson(RELEASE_MATRIX, { targetCount: 0, targets: [] });
  const targets = Array.isArray(matrix.targets) ? matrix.targets : [];
  return {
    system: 'SHEIKHA_DISTRIBUTION_TARGET_MATRIX_RESOLVER_V1',
    targetCount: matrix.targetCount,
    version: matrix.version,
    targets: targets.map((target) => ({
      id: target.id,
      platform: target.platform,
      architecture: target.architecture,
      packageFormat: target.packageFormat,
      artifactName: target.artifactName,
      readinessStatus: target.status
    }))
  };
}

function releaseIndex() {
  const report = readJson(DISTRIBUTION_REPORT, {});
  const localReleasePath = report.localReleasePath;
  if (!localReleasePath) {
    return { available: false, artifactCount: 0, artifacts: [] };
  }
  const resolvedReleasePath = path.resolve(localReleasePath);
  const withinLocalRegistry = resolvedReleasePath.startsWith(`${LOCAL_RELEASES_ROOT}${path.sep}`);
  if (!withinLocalRegistry) {
    return { available: false, artifactCount: 0, artifacts: [] };
  }
  const index = readJson(path.join(resolvedReleasePath, 'release-index.json'), null);
  if (!index) return { available: false, artifactCount: 0, artifacts: [] };
  const artifacts = Array.isArray(index.artifacts) ? index.artifacts : [];
  const indexValid = index.localRegistryOnly === true &&
    Number(index.artifactCount) === artifacts.length;
  if (!indexValid) return { available: false, artifactCount: 0, artifacts: [] };
  return {
    available: true,
    version: index.version,
    channel: index.channel,
    artifactCount: index.artifactCount,
    localRegistryOnly: index.localRegistryOnly,
    artifacts,
    localPathExposed: false
  };
}

module.exports = { evidenceSnapshot, matrixSummary, releaseIndex, status };
