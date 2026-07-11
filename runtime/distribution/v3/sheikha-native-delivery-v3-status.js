'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const REPORT_PATH = path.join(__dirname, 'sheikha-native-delivery-v3-report.json');
const ELIGIBILITY_PATH = path.join(__dirname, 'sheikha-cross-architecture-eligibility-v3.json');
const RUNNER_PATH = path.join(__dirname, 'sheikha-native-runner-readiness-v3.json');
const DESKTOP_PATH = path.join(__dirname, 'sheikha-desktop-runtime-readiness-v3.json');
const WORKSPACE_RELEASE_ROOT = path.join(ROOT, 'distribution', 'artifacts', 'v3');
const LOCAL_RELEASE_ROOT = path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases', 'v3');

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function isWithin(candidate, root) {
  const resolved = path.resolve(candidate);
  return resolved === path.resolve(root) || resolved.startsWith(`${path.resolve(root)}${path.sep}`);
}

function status() {
  const report = readJson(REPORT_PATH, {});
  return {
    success: true,
    system: 'SHEIKHA_NATIVE_DELIVERY_STATUS_API_V3',
    status: report.system === 'SHEIKHA_NATIVE_DESKTOP_AND_MULTI_ARCH_DELIVERY_V3'
      ? report.status
      : 'REPORT_NOT_AVAILABLE',
    version: report.sourceVersion || null,
    productCoreImplemented: report.productCoreImplemented === true,
    desktopNativeShellImplemented: report.desktopNativeShellImplemented === true,
    desktopExecutableBuiltCount: Number(report.desktopExecutableBuiltCount || 0),
    eligibilityRecordCount: Number(report.eligibilityRecordCount || 0),
    nativeRunnerContractCount: Number(report.nativeRunnerContractCount || 0),
    builtCount: Number(report.builtCount || 0),
    inspectedCount: Number(report.inspectedCount || 0),
    verifiedCount: Number(report.verifiedCount || 0),
    nativeVerifiedCount: Number(report.nativeVerifiedCount || 0),
    publishedLocallyCount: Number(report.publishedLocallyCount || 0),
    publishedExternallyCount: Number(report.publishedExternallyCount || 0),
    crossArchitectureStatusCounts: report.crossArchitectureStatusCounts || {},
    runnerStatusCounts: report.runnerStatusCounts || {},
    limitations: report.limitations || [],
    governance: report.governance || {},
    routes: {
      status: '/api/sheikha/distribution-apex/v3/status',
      desktop: '/api/sheikha/distribution-apex/v3/desktop-readiness',
      eligibility: '/api/sheikha/distribution-apex/v3/eligibility',
      runners: '/api/sheikha/distribution-apex/v3/runners',
      releaseIndex: '/api/sheikha/distribution-apex/v3/release-index'
    },
    readOnlyApi: true,
    remoteBuildEndpointExposed: false,
    remotePublishEndpointExposed: false
  };
}

function desktopReadiness() {
  return readJson(DESKTOP_PATH, { status: 'REPORT_NOT_AVAILABLE' });
}

function eligibility() {
  return readJson(ELIGIBILITY_PATH, { status: 'REPORT_NOT_AVAILABLE', entries: [] });
}

function runners() {
  return readJson(RUNNER_PATH, { status: 'REPORT_NOT_AVAILABLE', runners: [] });
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
  const indexPath = candidates.find((candidate) => fs.existsSync(candidate) &&
    (isWithin(candidate, LOCAL_RELEASE_ROOT) || isWithin(candidate, WORKSPACE_RELEASE_ROOT)));
  const index = indexPath ? readJson(indexPath, null) : null;
  if (!index || index.localRegistryOnly !== true || index.githubRequired !== false ||
      index.artifactCount !== index.artifacts?.length) {
    return { available: false, artifactCount: 0, artifacts: [] };
  }
  return {
    available: true,
    version: index.version,
    releaseLine: index.releaseLine,
    artifactCount: index.artifactCount,
    inheritedArtifactCount: index.inheritedArtifactCount,
    desktopExecutableArtifactCount: index.desktopExecutableArtifactCount,
    localRegistryOnly: true,
    githubRequired: false,
    artifacts: index.artifacts.map((artifact) => ({
      artifactId: artifact.artifactId,
      product: artifact.product,
      productVersion: artifact.productVersion,
      status: artifact.status,
      name: artifact.name,
      bytes: artifact.bytes,
      sha256: artifact.sha256,
      artifactKind: artifact.artifactKind,
      architecture: artifact.architecture,
      desktopExecutable: artifact.desktopExecutable,
      nativeVerified: artifact.nativeVerified
    })),
    localPathExposed: false
  };
}

module.exports = { desktopReadiness, eligibility, releaseIndex, runners, status };
