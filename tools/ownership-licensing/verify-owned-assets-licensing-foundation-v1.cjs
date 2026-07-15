#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const {
  buildRuntime,
  getActivationState
} = require("../../runtime/ownership-licensing/sheikha-owned-assets-licensing-runtime.cjs");

const root = path.resolve(__dirname, "../..");

const requiredFiles = [
  "core/ownership/sheikha-owned-asset-registry.cjs",
  "core/licensing/sheikha-license-authority.cjs",
  "core/federation/sheikha-integration-authority.cjs",
  "runtime/ownership-licensing/sheikha-owned-assets-licensing-runtime.cjs",
  "runtime/ownership-licensing/sheikha-ownership-licensing-cli.cjs",
  "contracts/ownership-licensing/sheikha-ownership-licensing-contract.v1.json",
  "licenses/sheikha/SHEIKHA-PROPRIETARY-ASSET-LICENSE-V1.md",
  "licenses/sheikha/SHEIKHA-INTEGRATION-LICENSE-V1.md",
  "licenses/sheikha/SHEIKHA-FEDERATION-AGREEMENT-V1.md",
  "runtime/ownership-licensing/generated/detected-tools-registry.json"
];

const missing = requiredFiles.filter(
  (relative) => !fs.existsSync(
    path.join(root, relative)
  )
);

if (missing.length > 0) {
  throw new Error(
    "Missing required files: " + missing.join(", ")
  );
}

const runtime = buildRuntime();
const state = getActivationState();

const checks = {
  ownedAssetsCreated:
    runtime.registry.listAssets().length >= 6,

  allOwnedAssetsVerified:
    runtime.registry
      .listAssets()
      .every((asset) =>
        runtime.registry.verifyAsset(asset.id)
      ),

  internalLicenseActive:
    runtime.licensing
      .listLicenses()
      .some((license) =>
        license.state === "ACTIVE"
      ),

  portalAuthorized:
    runtime.federation
      .listIntegrations()
      .some((integration) =>
        integration.states.includes("AUTHORIZED")
      ),

  activationExecuted:
    state.activation.ACTIVATION_EXECUTED === true,

  localPortalActive:
    state.activation.LOCAL_PORTAL_FOUNDATION_ACTIVE === true,

  remoteMutationNotPerformed:
    state.activation.REMOTE_MUTATION_PERFORMED === false,

  cleanupNotAuthorized:
    state.activation.CLEANUP_AUTHORIZED === false,

  rightsPreserved:
    state.legalTruth.thirdPartyOwnershipClaimed === false
};

const result = {
  schemaVersion: "1.0.0",
  system:
    "SHEIKHA_VERIFY_OWNED_ASSETS_LICENSING_FOUNDATION_V1",
  checks,
  passed: Object.values(checks).every(Boolean),
  activation: state.activation
};

process.stdout.write(
  JSON.stringify(result, null, 2) + "\n"
);

process.exit(result.passed ? 0 : 1);
