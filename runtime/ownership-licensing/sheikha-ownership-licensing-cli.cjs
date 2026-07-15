#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const {
  buildRuntime,
  getActivationState,
  writeActivationState
} = require("./sheikha-owned-assets-licensing-runtime.cjs");

const command = process.argv[2] || "status";

function output(value) {
  process.stdout.write(
    JSON.stringify(value, null, 2) + "\n"
  );
}

if (command === "status") {
  output(getActivationState());
  process.exit(0);
}

if (command === "assets") {
  output(buildRuntime().registry.listAssets());
  process.exit(0);
}

if (command === "licenses") {
  output(buildRuntime().licensing.listLicenses());
  process.exit(0);
}

if (command === "integrations") {
  output(buildRuntime().federation.listIntegrations());
  process.exit(0);
}

if (command === "activate-local") {
  const target = path.resolve(
    __dirname,
    "generated",
    "activation-state.json"
  );

  const state = writeActivationState(target);

  output({
    written: target,
    activation: state.activation
  });

  process.exit(0);
}

if (command === "verify") {
  const contractPath = path.resolve(
    __dirname,
    "../..",
    "contracts",
    "ownership-licensing",
    "sheikha-ownership-licensing-contract.v1.json"
  );

  const contract = JSON.parse(
    fs.readFileSync(contractPath, "utf8")
  );

  const state = getActivationState();

  const checks = {
    contractSchema:
      contract.schemaVersion === "1.0.0",

    ownerMatches:
      contract.owner.id ===
      state.owner.ownerId,

    localActivation:
      state.activation.ACTIVATION_EXECUTED === true,

    noRemoteMutation:
      state.activation.REMOTE_MUTATION_PERFORMED === false,

    cleanupDenied:
      state.activation.CLEANUP_AUTHORIZED === false,

    retentionSafe:
      state.activation.RETENTION_MODE ===
      "DENY_BY_DEFAULT",

    legalTruth:
      state.legalTruth.thirdPartyOwnershipClaimed === false
  };

  output({
    checks,
    passed: Object.values(checks).every(Boolean)
  });

  process.exit(
    Object.values(checks).every(Boolean)
      ? 0
      : 1
  );
}

process.stderr.write(
  [
    "Usage:",
    "  status",
    "  assets",
    "  licenses",
    "  integrations",
    "  activate-local",
    "  verify"
  ].join("\n") + "\n"
);

process.exit(2);
