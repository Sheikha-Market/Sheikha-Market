'use strict';

const fs = require('node:fs');
const path = require('node:path');

const fabric = require(
  '../core/production-federation/' +
  'sheikha-governed-production-federation-v1'
);
const routes = require(
  '../routes/production-federation/' +
  'sheikha-governed-production-federation-routes-v1'
);
const ROOT = path.resolve(__dirname, '..');
const DESKTOP_ARTIFACT_PATH = path.join(
  ROOT,
  'desktop/shell/tauri-v4/src-tauri/target/release/' +
    'sheikha-native-desktop'
);
const DESKTOP_ARTIFACT_EXISTS = fs.existsSync(DESKTOP_ARTIFACT_PATH);
const V7_RPM_ARTIFACT_PATH = path.join(
  ROOT,
  'distribution/artifacts/v7/1.0.51_sheikha.v7.1/artifacts/' +
    'sheikha-1.0.51-0.sheikha.v7.1.x86_64.rpm'
);
const V7_RPM_ARTIFACT_EXISTS = fs.existsSync(V7_RPM_ARTIFACT_PATH);

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function routeHandler(path, method) {
  const layer = routes.stack.find((entry) =>
    entry.route?.path === path &&
    entry.route.methods?.[method] === true
  );
  return layer.route.stack.at(-1).handle;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

describe('Sheikha Governed Production Federation V1', () => {
  test('activates the internal lane from bounded local evidence', () => {
    const result = fabric.status();

    expect(result.system).toBe(
      'SHEIKHA_GOVERNED_PRODUCTION_FEDERATION_V1'
    );
    expect(result.status).toBe(
      'ACTIVE_BOUNDED_INTERNAL_EXTERNAL_DEFAULT_DENY'
    );
    expect(result.passed).toBe(true);
    expect(result.defaultProductionModel).toBe(
      'INTERNAL_MAXIMUM_CAPABILITY'
    );
    expect(
      result.coverage.verifiedInternalCapabilityCount
    ).toBeGreaterThanOrEqual(4);
    expect(
      result.internalLane.nativeLifecycleVerifiedCount
    ).toBeGreaterThanOrEqual(1);
    expect(result.internalLane.staleEvidenceClaimCount).toBe(
      DESKTOP_ARTIFACT_EXISTS ? 0 : 1
    );
    expect(
      result.truthBoundaries.staleReportDoesNotCountWithoutCurrentArtifact
    ).toBe(true);
  });

  test('keeps every external production option fail closed', () => {
    const registry = fabric.productionModelRegistry();
    const external = registry.models.filter(
      (model) => model.externalComponents
    );

    expect(registry.models).toHaveLength(8);
    expect(external.length).toBeGreaterThan(0);
    expect(
      external.every(
        (model) => model.activation === 'REGISTERED_DEFAULT_DENY'
      )
    ).toBe(true);
    expect(fabric.status().externalLane).toMatchObject({
      status: 'REGISTERED_DEFAULT_DENY',
      productionReadyAdapterCount: 0,
      networkUsed: false,
      deploymentExecuted: false
    });
  });

  test('requires customer, rights, identity, and human approval', () => {
    const denied = fabric.evaluateProductionChoice({
      model: 'EXTERNAL_MANAGED_PLATFORM',
      promotionRequested: true
    });

    expect(denied.eligibleForSeparateExecutionAuthorization).toBe(false);
    expect(denied.executionAuthorized).toBe(false);
    expect(denied.blockers).toEqual(expect.arrayContaining([
      'EXPLICIT_CUSTOMER_CHOICE_REQUIRED',
      'INFORMED_CUSTOMER_CHOICE_REQUIRED',
      'RIGHTS_AND_LICENSES_VERIFICATION_REQUIRED',
      'PROVIDER_AND_ENVIRONMENT_IDENTITY_REQUIRED',
      'SECURITY_PRIVACY_AND_SUPPLY_CHAIN_REVIEW_REQUIRED',
      'EXIT_AND_ROLLBACK_PLAN_REQUIRED',
      'HUMAN_APPROVAL_REQUIRED',
      'SOURCE_ARTIFACT_SHA256_REQUIRED',
      'TARGET_ARTIFACT_SHA256_REQUIRED',
      'GOVERNANCE_CONTRACT_SHA256_REQUIRED'
    ]));

    const digest = 'a'.repeat(64);
    const governanceDigest = fabric.status()
      .releaseIdentity.governanceContractSha256;
    const eligible = fabric.evaluateProductionChoice({
      model: 'EXTERNAL_MANAGED_PLATFORM',
      customerChoice: {
        explicit: true,
        informed: true,
        actorId: 'customer-authorized-actor',
        contractVersion: '1.0.0'
      },
      rightsAndLicensesVerified: true,
      providerIdentityVerified: true,
      securityPrivacySupplyChainVerified: true,
      exitAndRollbackPlanVerified: true,
      humanApproved: true,
      promotionRequested: true,
      sourceArtifactSha256: digest,
      targetArtifactSha256: digest,
      governanceContractSha256: governanceDigest,
      sbomVerified: true,
      provenanceVerified: true
    });

    expect(
      eligible.eligibleForSeparateExecutionAuthorization
    ).toBe(true);
    expect(eligible.executionAuthorized).toBe(false);
    expect(eligible.deploymentExecuted).toBe(false);
    expect(
      eligible.releaseIdentityEvaluation.artifactIdentityMatched
    ).toBe(true);
    expect(
      eligible.releaseIdentityEvaluation
        .governanceContractIdentityMatched
    ).toBe(true);
  });

  test('rejects artifact substitution and governance contract drift', () => {
    const evaluation = fabric.evaluateProductionChoice({
      model: 'CUSTOMER_OWNED_PLATFORM',
      customerChoice: {
        explicit: true,
        informed: true,
        actorId: 'customer-authorized-actor',
        contractVersion: '1.0.0'
      },
      rightsAndLicensesVerified: true,
      providerIdentityVerified: true,
      securityPrivacySupplyChainVerified: true,
      exitAndRollbackPlanVerified: true,
      humanApproved: true,
      promotionRequested: true,
      sourceArtifactSha256: 'a'.repeat(64),
      targetArtifactSha256: 'b'.repeat(64),
      governanceContractSha256: 'c'.repeat(64),
      sbomVerified: true,
      provenanceVerified: true
    });

    expect(evaluation.blockers).toEqual(expect.arrayContaining([
      'ARTIFACT_DIGEST_MISMATCH',
      'GOVERNANCE_CONTRACT_DIGEST_MISMATCH'
    ]));
    expect(evaluation.executionAuthorized).toBe(false);
  });

  test('registers an open-ended adapter path without ownership claims', () => {
    const registry = fabric.systemFamilyRegistry();
    const unlisted = registry.families.find(
      (family) => family.id === 'UNLISTED_SYSTEM_OR_PLATFORM'
    );

    expect(registry.count).toBe(15);
    expect(registry.registrationDoesNotMeanImplementation).toBe(true);
    expect(registry.allSystemsIntegrated).toBe(false);
    expect(unlisted.adapterContract).toBe(
      'OPEN_ENDED_EVIDENCE_BOUND_ADAPTER'
    );
    expect(
      fabric.GOVERNANCE_CONTRACT.ownershipPolicy
        .sheikhaClaimsOwnershipOfExternalSystems
    ).toBe(false);
  });

  test('denies automated religious, deployment, and network authority', () => {
    const contract = fabric.GOVERNANCE_CONTRACT;

    expect(contract.islamicGovernance.automatedFatwaAllowed).toBe(false);
    expect(
      contract.islamicGovernance.automatedHalalCertificationAllowed
    ).toBe(false);
    expect(
      contract.islamicGovernance.automatedJudicialAuthorityAllowed
    ).toBe(false);
    expect(contract.executionBoundary.executesBuilds).toBe(false);
    expect(contract.executionBoundary.performsDeployment).toBe(false);
    expect(contract.externalLanePolicy.externalNetworkDefault).toBe('DENY');
  });

  test('serves status, registries, evidence, and read-only evaluation', () => {
    const status = createResponse();
    routeHandler('/status', 'get')({}, status);
    expect(status.statusCode).toBe(200);
    expect(status.body.data.passed).toBe(true);

    const models = createResponse();
    routeHandler('/models', 'get')({}, models);
    expect(models.body.data.count).toBe(8);

    const systems = createResponse();
    routeHandler('/systems', 'get')({}, systems);
    expect(systems.body.data.count).toBe(15);

    const evidence = createResponse();
    routeHandler('/evidence', 'get')({}, evidence);
    expect(evidence.body.data.capabilities).toHaveLength(6);
    const desktop = evidence.body.data.capabilities.find(
      (item) => item.id === 'DESKTOP_NATIVE_LINUX_X86_64'
    );
    expect(desktop).toMatchObject({
      verified: DESKTOP_ARTIFACT_EXISTS,
      reportClaimsVerification: true,
      staleEvidenceClaim: !DESKTOP_ARTIFACT_EXISTS,
      artifact: {
        present: DESKTOP_ARTIFACT_EXISTS
      }
    });
    const systemBuilder = evidence.body.data.capabilities.find(
      (item) => item.id === 'SYSTEM_BUILDER_FABRIC'
    );
    expect(systemBuilder).toMatchObject({
      verified: V7_RPM_ARTIFACT_EXISTS,
      artifactBuilt: V7_RPM_ARTIFACT_EXISTS,
      dependencyMetadataComplete: false,
      nativeLifecycleVerified: false,
      artifact: {
        present: V7_RPM_ARTIFACT_EXISTS
      }
    });
    if (V7_RPM_ARTIFACT_EXISTS) {
      expect(systemBuilder.verificationLevel).toBe(
        'RECOVERED_ARTIFACT_SHA256_VERIFIED_DEPENDENCY_GAP'
      );
    }

    const evaluation = createResponse();
    routeHandler('/evaluate', 'post')({
      body: { model: 'CUSTOMER_OWNED_PLATFORM' }
    }, evaluation);
    expect(evaluation.body.data.executionAuthorized).toBe(false);
  });

  test('binds server, SDK, inspector, activation, and owner dashboard', () => {
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const inspector = read(
      'core/enterprise/sheikha-enterprise-inspector-v3.js'
    );
    const dashboard = read(
      'public/sheikha-dashboards/dashboards.js'
    );
    const dashboardHtml = read(
      'public/sheikha-dashboards/index.html'
    );
    const packageJson = require('../package.json');

    expect(server).toContain(
      "'/api/sheikha/production-federation/v1'"
    );
    expect(sdk).toContain('client.productionFederation');
    expect(inspector).toContain('productionFederationStatus');
    expect(dashboard).toContain('renderProduction');
    expect(dashboard).toContain('production-evidence-table');
    expect(dashboardHtml).toContain('data-view="production"');
    expect(
      packageJson.scripts['ops:production-federation:activate:v1']
    ).toBeTruthy();
  });
});
