'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const REPORT_PATH = path.join(__dirname, 'sheikha-universal-delivery-v2-report.json');
const MATRIX_PATH = path.join(ROOT, 'distribution/manifest/sheikha-target-matrix-v2.json');
const WORKSPACE_RELEASE_ROOT = path.join(ROOT, 'distribution', 'artifacts', 'v2');
const LOCAL_RELEASE_ROOT = path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases', 'v2');

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function status() {
  const report = readJson(REPORT_PATH, {});
  const available = report.system === 'SHEIKHA_UNIVERSAL_DELIVERY_DISTRIBUTION_INSTALLER_FABRIC_V2';
  return {
    success: true,
    system: 'SHEIKHA_UNIVERSAL_DELIVERY_STATUS_API_V2',
    status: available ? report.status : 'REPORT_NOT_AVAILABLE',
    version: report.sourceVersion || null,
    productCount: Number(report.productCount || 0),
    targetCount: Number(report.targetCount || 0),
    builtCount: Number(report.builtCount || 0),
    inspectedCount: Number(report.inspectedCount || 0),
    verifiedCount: Number(report.verifiedCount || 0),
    nativeVerifiedCount: Number(report.nativeVerifiedCount || 0),
    auxiliaryArtifactCount: Number(report.auxiliaryArtifactCount || 0),
    totalArtifactCount: Number(report.totalArtifactCount || 0),
    publishedLocallyCount: Number(report.publishedLocallyCount || 0),
    publishedExternallyCount: Number(report.publishedExternallyCount || 0),
    statusCounts: report.statusCounts || {},
    coverage: report.coverage || {},
    localRegistryOnly: report.localRegistryOnly === true,
    githubRequired: report.githubRequired === true,
    claimPolicy: report.claimPolicy || 'No artifact is complete without evidence.',
    limitations: report.limitations || [],
    routes: {
      status: '/api/sheikha/distribution-apex/v2/status',
      matrix: '/api/sheikha/distribution-apex/v2/matrix',
      releaseIndex: '/api/sheikha/distribution-apex/v2/release-index'
    },
    governance: {
      readOnlyApi: true,
      remoteBuildEndpointExposed: false,
      remotePublishEndpointExposed: false,
      automaticExternalPublishing: false,
      humanApprovalForHighImpactRelease: true,
      humanFinalDecision: true
    }
  };
}

function matrixSummary() {
  const matrix = readJson(MATRIX_PATH, { targetCount: 0, targets: [] });
  const report = readJson(REPORT_PATH, { targets: [] });
  const runtimeById = new Map((report.targets || []).map((target) => [target.id, target]));
  return {
    system: 'SHEIKHA_PRODUCT_TARGET_MATRIX_API_V2',
    version: matrix.version || null,
    targetCount: Number(matrix.targetCount || 0),
    sourceOfTruth: matrix.sourceOfTruth === true,
    targets: (matrix.targets || []).map((target) => {
      const runtime = runtimeById.get(target.id);
      return {
        id: target.id,
        product: target.product,
        platform: target.platform,
        operatingSystem: target.operatingSystem,
        architecture: target.architecture,
        format: target.format,
        installationScope: target.installationScope,
        runtimeType: target.runtimeType,
        artifactName: target.artifactName,
        declaredStatus: target.status,
        runtimeStatus: runtime?.status || target.status,
        built: runtime?.built === true,
        inspected: runtime?.inspected === true,
        verified: runtime?.verified === true,
        nativeVerified: runtime?.nativeVerified === true,
        limitations: target.limitations
      };
    })
  };
}

function isWithin(candidate, root) {
  const resolved = path.resolve(candidate);
  return resolved === path.resolve(root) || resolved.startsWith(`${path.resolve(root)}${path.sep}`);
}

function releaseIndex() {
  const report = readJson(REPORT_PATH, {});
  const candidates = [];
  if (report.localReleasePath && isWithin(report.localReleasePath, LOCAL_RELEASE_ROOT)) {
    candidates.push(path.join(report.localReleasePath, 'release-index.json'));
  }
  if (report.sourceVersion) {
    candidates.push(path.join(WORKSPACE_RELEASE_ROOT, report.sourceVersion, 'release-index.json'));
  }
  const indexPath = candidates.find((candidate) =>
    fs.existsSync(candidate) && (isWithin(candidate, LOCAL_RELEASE_ROOT) || isWithin(candidate, WORKSPACE_RELEASE_ROOT))
  );
  const index = indexPath ? readJson(indexPath, null) : null;
  if (!index || index.localRegistryOnly !== true || index.githubRequired !== false) {
    return { available: false, artifactCount: 0, artifacts: [] };
  }
  const artifacts = Array.isArray(index.artifacts) ? index.artifacts : [];
  if (Number(index.artifactCount) !== artifacts.length) {
    return { available: false, artifactCount: 0, artifacts: [] };
  }
  return {
    available: true,
    version: index.version,
    channel: index.channel,
    artifactCount: artifacts.length,
    targetArtifactCount: Number(index.targetArtifactCount || 0),
    auxiliaryArtifactCount: Number(index.auxiliaryArtifactCount || 0),
    localRegistryOnly: true,
    githubRequired: false,
    artifacts: artifacts.map((artifact) => ({
      artifactId: artifact.artifactId,
      targetId: artifact.targetId,
      product: artifact.product,
      productVersion: artifact.productVersion,
      status: artifact.status,
      name: artifact.name,
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      inspectionPassed: artifact.inspectionPassed,
      nativeVerified: artifact.nativeVerified,
      qemuVerified: artifact.qemuVerified,
      signed: artifact.signed,
      notarized: artifact.notarized
    })),
    localPathExposed: false
  };
}

module.exports = { matrixSummary, releaseIndex, status };
