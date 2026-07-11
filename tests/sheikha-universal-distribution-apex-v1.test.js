'use strict';

const fs = require('node:fs');
const path = require('node:path');

const distributionApex = require(
  '../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);
const activation = require(
  '../tools/activation/activate-sheikha-universal-distribution-apex-v1'
);

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Universal Distribution Release Apex V1', () => {
  test('promotes release delivery to a specialized evidence-gated L27 plane', () => {
    const apex = distributionApex.status();

    expect(apex).toMatchObject({
      success: true,
      system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
      status: 'ACTIVE_WITH_EVIDENCE_GATED_LOCAL_RELEASE',
      level: 'L27_HIGHEST_GOVERNED_RELEASE_DISTRIBUTION_APEX_LAYER',
      apexLevel: 27,
      plane: 'RELEASE_DELIVERY_PLANE_ONLY'
    });
    expect(apex.layerRelationship.crossPlaneAuthorityEscalation).toBe(false);
    expect(apex.evidence).toMatchObject({
      targetCount: 27,
      builtCount: 3,
      verifiedCount: 1,
      nativeVerifiedCount: 1,
      localPublishedCount: 3,
      localRegistryOnly: true,
      githubRequired: false,
      reproducibilityVerified: true,
      secretScanPassed: true,
      invalidVerifiedClaims: []
    });
  });

  test('keeps release operations local, bounded, and human approved', () => {
    const governance = distributionApex.status().governance;

    expect(governance).toMatchObject({
      remoteBuildEndpointExposed: false,
      remotePublishEndpointExposed: false,
      automaticExternalPublishing: false,
      automaticSigning: false,
      automaticNotarization: false,
      noPrivilegeEscalationByLayerPromotion: true,
      humanApprovalForHighImpactRelease: true,
      humanFinalDecision: true
    });
  });

  test('exposes the 27-target matrix and sanitized local release index', () => {
    const matrix = distributionApex.matrixSummary();
    const releaseIndex = distributionApex.releaseIndex();

    expect(matrix.targetCount).toBe(27);
    expect(matrix.targets).toHaveLength(27);
    expect(releaseIndex).toMatchObject({
      available: true,
      artifactCount: 3,
      localRegistryOnly: true,
      localPathExposed: false
    });
    expect(JSON.stringify(releaseIndex)).not.toContain('/home/sheikha');
  });

  test('mounts read-only APIs and connects the SDK and enterprise inspector', () => {
    const route = read('routes/distribution-apex/sheikha-universal-distribution-apex-routes.js');
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const inspector = read('core/enterprise/sheikha-enterprise-inspector-v3.js');

    expect(route.match(/router\.get\(/g)).toHaveLength(6);
    expect(route).toContain('/api/sheikha/distribution-apex/v2/status');
    expect(route).toContain('/api/sheikha/distribution-apex/v2/matrix');
    expect(route).toContain('/api/sheikha/distribution-apex/v2/release-index');
    expect(route).not.toContain('router.post(');
    expect(server).toContain("require('./routes/distribution-apex/sheikha-universal-distribution-apex-routes')");
    expect(sdk).toContain('client.distribution');
    expect(sdk).toContain('client.delivery');
    expect(inspector).toContain('distributionReleaseApexStatus');
    expect(inspector).toContain('universalDeliveryV2Status');
  });

  test('writes a complete activation report only when all boundaries pass', () => {
    const report = activation.buildReport();

    expect(report.activationStatus).toBe('L27_ACTIVE_WITH_VERIFIED_BOUNDARIES');
    expect(report.score).toBe(100);
    expect(report.missing).toEqual([]);
    expect(report.checks.localOnlyAndGithubIndependent).toBe(true);
    expect(report.checks.reproducibilityVerified).toBe(true);
    expect(report.checks.secretScanPassed).toBe(true);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
  });
});
