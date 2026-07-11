'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const REPORT_PATH = path.join(__dirname, 'sheikha-native-desktop-completion-v31-report.json');
const NATIVE_PATH = path.join(__dirname, 'sheikha-native-desktop-verification-v31.json');
const INSTALLER_PATH = path.join(__dirname, 'sheikha-native-desktop-installer-lifecycle-v31.json');
const SECURITY_PATH = path.join(__dirname, 'sheikha-native-desktop-security-hardening-v31.json');
const ACTUAL_ACTIVATION_PATH = path.join(__dirname, 'evidence', 'actual-user-activation-v31.json');
const WORKSPACE_RELEASE_ROOT = path.join(ROOT, 'distribution', 'artifacts', 'v3.1');
const LOCAL_RELEASE_ROOT = path.join(os.homedir(), 'Sheikha-Local-Registry', 'releases', 'v3.1');

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
  const actualActivation = readJson(ACTUAL_ACTIVATION_PATH, null);
  return {
    success: true,
    system: 'SHEIKHA_NATIVE_DESKTOP_STATUS_API_V31',
    status: report.system === 'SHEIKHA_NATIVE_DESKTOP_COMPLETION_V31'
      ? report.status
      : 'REPORT_NOT_AVAILABLE',
    releaseLine: report.releaseLine || 'v3.1',
    version: report.sourceVersion || null,
    builtTargetCount: Number(report.builtTargetCount || 0),
    verifiedTargetCount: Number(report.verifiedTargetCount || 0),
    nativeVerifiedTargetCount: Number(report.nativeVerifiedTargetCount || 0),
    artifactCount: Number(report.artifactCount || 0),
    desktopExecutableArtifactCount: Number(report.desktopExecutableArtifactCount || 0),
    publishedLocallyCount: Number(report.publishedLocallyCount || 0),
    publishedExternallyCount: Number(report.publishedExternallyCount || 0),
    platformStates: report.platformStates || {},
    measurements: report.measurements || null,
    security: report.security || null,
    installer: report.installer || null,
    actualUserActivation: actualActivation ? {
      status: actualActivation.status,
      scope: actualActivation.scope,
      version: actualActivation.version,
      binarySha256: actualActivation.binarySha256,
      probePassed: actualActivation.probePassed === true,
      installedBinaryLaunchPassed: actualActivation.installedBinaryLaunchPassed === true,
      installedPageLoadPassed: actualActivation.installedPageLoadPassed === true,
      desktopEntryInstalled: Boolean(actualActivation.desktopEntryPath),
      iconInstalled: Boolean(actualActivation.iconPath),
      administratorUsed: actualActivation.administratorUsed === true,
      rollbackAdapterAvailable: actualActivation.rollbackAdapterAvailable === true,
      actualRollbackExecuted: actualActivation.actualRollbackExecuted === true
    } : null,
    governance: report.governance || {},
    limitations: report.limitations || [],
    routes: {
      status: '/api/sheikha/distribution-apex/v3.1/status',
      nativeVerification: '/api/sheikha/distribution-apex/v3.1/native-verification',
      installerLifecycle: '/api/sheikha/distribution-apex/v3.1/installer-lifecycle',
      security: '/api/sheikha/distribution-apex/v3.1/security',
      releaseIndex: '/api/sheikha/distribution-apex/v3.1/release-index'
    },
    readOnlyApi: true,
    remoteBuildEndpointExposed: false,
    remoteInstallEndpointExposed: false,
    remotePublishEndpointExposed: false
  };
}

function nativeVerification() {
  return readJson(NATIVE_PATH, { status: 'REPORT_NOT_AVAILABLE', artifacts: [] });
}

function installerLifecycle() {
  return readJson(INSTALLER_PATH, { status: 'REPORT_NOT_AVAILABLE' });
}

function security() {
  return readJson(SECURITY_PATH, { status: 'REPORT_NOT_AVAILABLE' });
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
    releaseLine: index.releaseLine,
    version: index.version,
    artifactCount: index.artifactCount,
    nativeVerifiedTargetCount: index.nativeVerifiedTargetCount,
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
      platform: artifact.platform,
      architecture: artifact.architecture,
      desktopExecutable: artifact.desktopExecutable,
      nativeVerified: artifact.nativeVerified,
      signed: artifact.signed
    })),
    localPathExposed: false
  };
}

module.exports = {
  installerLifecycle,
  nativeVerification,
  releaseIndex,
  security,
  status
};
