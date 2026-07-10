'use strict';

const fs = require('node:fs');
const path = require('node:path');

const distributionApex = require(
  '../../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);

const ROOT = process.cwd();
const REPORT_PATH = path.join(
  ROOT,
  'runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1-report.json'
);

function buildReport() {
  const apex = distributionApex.status();
  const checks = {
    promotedToL27: apex.apexLevel === 27,
    specializedReleasePlane: apex.plane === 'RELEASE_DELIVERY_PLANE_ONLY',
    evidenceAvailable: apex.evidence.reportAvailable && apex.evidence.matrixAvailable,
    realArtifactsBuilt: apex.evidence.builtCount > 0,
    nativeEvidencePresent: apex.evidence.nativeVerifiedCount > 0,
    localOnlyAndGithubIndependent:
      apex.evidence.localRegistryOnly === true && apex.evidence.githubRequired === false,
    reproducibilityVerified: apex.evidence.reproducibilityVerified === true,
    secretScanPassed: apex.evidence.secretScanPassed === true,
    noInvalidVerifiedClaims: apex.evidence.invalidVerifiedClaims.length === 0,
    noRemoteBuildOrPublish: apex.governance.remoteBuildEndpointExposed === false &&
      apex.governance.remotePublishEndpointExposed === false,
    humanFinalDecision: apex.governance.humanFinalDecision === true
  };
  const missing = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  return {
    ...apex,
    activationStatus: missing.length === 0 ? 'L27_ACTIVE_WITH_VERIFIED_BOUNDARIES' : 'L27_REVIEW_REQUIRED',
    score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 10),
    checks,
    missing,
    generatedAt: new Date().toISOString()
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    activationStatus: report.activationStatus,
    score: report.score,
    apexLevel: report.apexLevel,
    builtCount: report.evidence.builtCount,
    nativeVerifiedCount: report.evidence.nativeVerifiedCount,
    output: path.relative(ROOT, REPORT_PATH)
  }, null, 2));
}

module.exports = { buildReport, writeReport };
