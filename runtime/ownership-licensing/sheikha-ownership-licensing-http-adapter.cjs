"use strict";

const {
  buildRuntime,
  getActivationState
} = require("./sheikha-owned-assets-licensing-runtime.cjs");

const ADAPTER_ID =
  "SHEIKHA_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1";

const DEFAULT_BASE_PATH =
  "/api/sheikha/ownership-licensing/v1";

function requireApp(app) {
  if (
    !app ||
    typeof app !== "function" ||
    typeof app.use !== "function"
  ) {
    throw new TypeError(
      "app must be an Express-compatible application"
    );
  }

  return app;
}

function createVerificationResult() {
  const runtime = buildRuntime();
  const state = getActivationState();

  const assets = runtime.registry.listAssets();
  const licenses = runtime.licensing.listLicenses();
  const integrations =
    runtime.federation.listIntegrations();

  const checks = {
    activationExecuted:
      state.activation.ACTIVATION_EXECUTED === true,

    localPortalFoundationActive:
      state.activation
        .LOCAL_PORTAL_FOUNDATION_ACTIVE === true,

    ownedAssetsPresent:
      assets.length >= 6,

    allOwnedAssetsIntegrityValid:
      assets.every((asset) =>
        runtime.registry.verifyAsset(asset.id)
      ),

    activeInternalLicensePresent:
      licenses.some((license) =>
        license.state === "ACTIVE"
      ),

    authorizedLocalIntegrationPresent:
      integrations.some((integration) =>
        integration.scope === "LOCAL" &&
        integration.states.includes("AUTHORIZED")
      ),

    thirdPartyRightsPreserved:
      state.activation
        .THIRD_PARTY_RIGHTS_PRESERVATION_ACTIVE ===
      true,

    noRemoteMutationClaim:
      state.activation
        .REMOTE_MUTATION_PERFORMED === false,

    noProductionDeploymentClaim:
      state.activation
        .PRODUCTION_DEPLOYMENT_EXECUTED === false,

    cleanupRemainsBlocked:
      state.activation.CLEANUP_AUTHORIZED === false,

    retentionPolicySafe:
      state.activation.RETENTION_MODE ===
      "DENY_BY_DEFAULT"
  };

  return {
    schemaVersion: "1.0.0",
    system:
      "SHEIKHA_OWNERSHIP_LICENSING_HTTP_VERIFICATION_V1",
    adapterId: ADAPTER_ID,
    checks,
    passed: Object.values(checks).every(Boolean),
    generatedAt: new Date().toISOString()
  };
}

function createRouter({
  express,
  ownerVisible = true
} = {}) {
  if (
    !express ||
    typeof express.Router !== "function"
  ) {
    throw new TypeError(
      "express dependency with Router() is required"
    );
  }

  const router = express.Router({
    caseSensitive: true,
    strict: true
  });

  router.use((request, response, next) => {
    response.setHeader(
      "X-Sheikha-Contract",
      ADAPTER_ID
    );

    response.setHeader(
      "Cache-Control",
      "no-store, max-age=0"
    );

    response.setHeader(
      "Pragma",
      "no-cache"
    );

    next();
  });

  router.get("/status", (request, response) => {
    const state = getActivationState();

    response.status(200).json({
      ...state,
      owner: ownerVisible
        ? state.owner
        : {
            ownerId: state.owner.ownerId,
            systemNameAr:
              state.owner.systemNameAr,
            systemNameEn:
              state.owner.systemNameEn
          },
      httpAdapter: {
        id: ADAPTER_ID,
        state: "ACTIVE",
        scope: "READ_ONLY_STATUS_AND_REGISTRY",
        basePath: DEFAULT_BASE_PATH,
        mutationCapabilitiesExposed: false,
        productionWiringClaimed: false
      }
    });
  });

  router.get("/assets", (request, response) => {
    const runtime = buildRuntime();

    response.status(200).json({
      schemaVersion: "1.0.0",
      system:
        "SHEIKHA_OWNED_ASSETS_HTTP_VIEW_V1",
      count: runtime.registry.listAssets().length,
      items: runtime.registry.listAssets(),
      mutationCapabilitiesExposed: false
    });
  });

  router.get("/licenses", (request, response) => {
    const runtime = buildRuntime();

    response.status(200).json({
      schemaVersion: "1.0.0",
      system:
        "SHEIKHA_LICENSES_HTTP_VIEW_V1",
      count:
        runtime.licensing.listLicenses().length,
      items:
        runtime.licensing.listLicenses(),
      mutationCapabilitiesExposed: false
    });
  });

  router.get(
    "/integrations",
    (request, response) => {
      const runtime = buildRuntime();

      response.status(200).json({
        schemaVersion: "1.0.0",
        system:
          "SHEIKHA_INTEGRATIONS_HTTP_VIEW_V1",
        count:
          runtime.federation
            .listIntegrations()
            .length,
        items:
          runtime.federation
            .listIntegrations(),
        mutationCapabilitiesExposed: false
      });
    }
  );

  router.get("/verify", (request, response) => {
    const result = createVerificationResult();

    response
      .status(result.passed ? 200 : 503)
      .json(result);
  });

  router.use((request, response) => {
    response.status(404).json({
      schemaVersion: "1.0.0",
      system:
        "SHEIKHA_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1",
      error: "ROUTE_NOT_FOUND",
      method: request.method,
      path: request.path,
      mutationCapabilitiesExposed: false
    });
  });

  return router;
}

function registerSheikhaOwnershipLicensingHttpAdapter(
  app,
  {
    express = require("express"),
    basePath = DEFAULT_BASE_PATH,
    ownerVisible = true
  } = {}
) {
  requireApp(app);

  if (
    typeof basePath !== "string" ||
    !basePath.startsWith("/")
  ) {
    throw new TypeError(
      "basePath must be an absolute HTTP path"
    );
  }

  const router = createRouter({
    express,
    ownerVisible
  });

  app.use(basePath, router);

  return Object.freeze({
    schemaVersion: "1.0.0",
    adapterId: ADAPTER_ID,
    registered: true,
    basePath,
    scope: "READ_ONLY_STATUS_AND_REGISTRY",
    mutationCapabilitiesExposed: false,
    remoteMutationPerformed: false,
    productionDeploymentExecuted: false,
    cleanupAuthorized: false,
    retentionMode: "DENY_BY_DEFAULT"
  });
}

module.exports = {
  ADAPTER_ID,
  DEFAULT_BASE_PATH,
  createRouter,
  createVerificationResult,
  registerSheikhaOwnershipLicensingHttpAdapter
};
