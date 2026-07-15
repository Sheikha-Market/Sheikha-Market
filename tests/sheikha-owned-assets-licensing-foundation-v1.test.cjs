"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SheikhaOwnedAssetRegistry
} = require("../core/ownership/sheikha-owned-asset-registry.cjs");

const {
  SheikhaLicenseAuthority
} = require("../core/licensing/sheikha-license-authority.cjs");

const {
  SheikhaIntegrationAuthority
} = require("../core/federation/sheikha-integration-authority.cjs");

const {
  OWNER,
  buildRuntime,
  getActivationState
} = require("../runtime/ownership-licensing/sheikha-owned-assets-licensing-runtime.cjs");

test("registers Sheikha-owned assets only with provenance", () => {
  const registry = new SheikhaOwnedAssetRegistry(OWNER);

  assert.throws(
    () =>
      registry.registerAsset({
        id: "INVALID_OWNED",
        name: "Invalid",
        ownerId: OWNER.ownerId,
        ownershipClass: "OWNED",
        evidence: []
      }),
    /provenance evidence/
  );

  const asset = registry.registerAsset({
    id: "VALID_OWNED",
    name: "Valid",
    ownerId: OWNER.ownerId,
    ownershipClass: "OWNED",
    evidence: ["REPOSITORY_PROVENANCE"]
  });

  assert.equal(asset.ownershipClass, "OWNED");
  assert.equal(registry.verifyAsset(asset.id), true);
});

test("does not convert installed third-party tools into owned assets", () => {
  const registry = new SheikhaOwnedAssetRegistry(OWNER);

  const asset = registry.registerAsset({
    id: "NODE_RUNTIME",
    name: "Node.js",
    ownershipClass: "INTEGRATED",
    thirdPartyOwner: "Node.js contributors",
    upstreamLicense: "UPSTREAM_LICENSE",
    sublicensingAuthorized: false,
    evidence: ["LOCAL_INSTALLATION_DISCOVERY"]
  });

  assert.equal(asset.ownershipClass, "INTEGRATED");
  assert.equal(asset.ownerLegalName, null);
  assert.equal(asset.sublicensingAuthorized, false);
});

test("issues an explicit active internal license", () => {
  const authority = new SheikhaLicenseAuthority({
    licensorId: OWNER.ownerId,
    licensorLegalNameAr: OWNER.ownerLegalNameAr,
    licensorLegalNameEn: OWNER.ownerLegalNameEn,
    systemNameAr: OWNER.systemNameAr,
    systemNameEn: OWNER.systemNameEn
  });

  const license = authority.issueLicense({
    id: "TEST_LICENSE",
    licensee: "SHEIKHA_TEST_RUNTIME",
    licenseType: "PROPRIETARY_INTERNAL",
    state: "ACTIVE",
    assetIds: ["VALID_OWNED"],
    grants: ["USE"],
    evidence: ["OWNER_INTERNAL_AUTHORIZATION"]
  });

  assert.equal(license.state, "ACTIVE");
  assert.equal(license.legalRegistrationClaimed, false);
});

test("requires evidence for LICENSED and AUTHORIZED integrations", () => {
  const authority = new SheikhaIntegrationAuthority({
    authorityId: "TEST_AUTHORITY",
    authorityNameAr: "اختبار",
    authorityNameEn: "Test"
  });

  assert.throws(
    () =>
      authority.registerIntegration({
        id: "INVALID_INTEGRATION",
        target: "Target",
        scope: "GLOBAL",
        states: ["LICENSED", "AUTHORIZED"]
      }),
    /authorizationEvidence|licenseReference/
  );

  const integration = authority.registerIntegration({
    id: "VALID_INTEGRATION",
    target: "Target",
    scope: "GLOBAL",
    states: [
      "INTEGRATED",
      "FEDERATED",
      "LICENSED",
      "AUTHORIZED"
    ],
    licenseReference: "TEST_LICENSE",
    authorizationEvidence: "SIGNED_ACCEPTANCE"
  });

  assert.equal(
    integration.states.includes("AUTHORIZED"),
    true
  );
  assert.equal(integration.noOwnershipTransfer, true);
});

test("activates the local portal foundation without false production claims", () => {
  const runtime = buildRuntime();
  const state = getActivationState();

  assert.ok(runtime.registry.listAssets().length >= 6);
  assert.equal(
    state.activation.ACTIVATION_EXECUTED,
    true
  );
  assert.equal(
    state.activation.LOCAL_PORTAL_FOUNDATION_ACTIVE,
    true
  );
  assert.equal(
    state.activation.REMOTE_MUTATION_PERFORMED,
    false
  );
  assert.equal(
    state.activation.PRODUCTION_DEPLOYMENT_EXECUTED,
    false
  );
  assert.equal(
    state.activation.CLEANUP_AUTHORIZED,
    false
  );
  assert.equal(
    state.activation.RETENTION_MODE,
    "DENY_BY_DEFAULT"
  );
});
