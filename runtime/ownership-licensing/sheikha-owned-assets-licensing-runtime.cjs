"use strict";

const fs = require("node:fs");
const path = require("node:path");

const {
  SheikhaOwnedAssetRegistry
} = require("../../core/ownership/sheikha-owned-asset-registry.cjs");

const {
  SheikhaLicenseAuthority
} = require("../../core/licensing/sheikha-license-authority.cjs");

const {
  SheikhaIntegrationAuthority
} = require("../../core/federation/sheikha-integration-authority.cjs");

const ROOT = path.resolve(__dirname, "../..");

const OWNER = Object.freeze({
  ownerId: "SALMAN_AHMED_SALMAN_AL_RAJEH",
  ownerLegalNameAr: "سلمان أحمد سلمان الراجح",
  ownerLegalNameEn: "Salman Ahmed Salman Al-Rajeh",
  systemNameAr: "منظومة شيخة",
  systemNameEn: "Sheikha"
});

const ownedAssets = [
  {
    id: "SHEIKHA_SYSTEM_BUILDER_PLATFORM",
    name: "Sheikha System Builder Platform",
    assetType: "SOFTWARE_PLATFORM",
    capabilities: [
      "SYSTEM_BUILDING",
      "GOVERNANCE",
      "TOOL_ORCHESTRATION"
    ]
  },
  {
    id: "SHEIKHA_LANGUAGE",
    name: "لغة شيخة البرمجية",
    assetType: "PROGRAMMING_LANGUAGE",
    capabilities: [
      "ARABIC_PROGRAMMING",
      "COMPILATION",
      "GOVERNED_EXECUTION"
    ]
  },
  {
    id: "SHEIKHA_GOVERNANCE_FABRIC",
    name: "Sheikha Governance Fabric",
    assetType: "GOVERNANCE_SYSTEM",
    capabilities: [
      "POLICY",
      "AUTHORIZATION",
      "AUDIT"
    ]
  },
  {
    id: "SHEIKHA_TOOL_REGISTRY",
    name: "Sheikha Governed Tool Registry",
    assetType: "TOOL_REGISTRY",
    capabilities: [
      "DISCOVERY",
      "ALLOWLIST",
      "RIGHTS_CLASSIFICATION"
    ]
  },
  {
    id: "SHEIKHA_LICENSE_AUTHORITY",
    name: "Sheikha License Authority",
    assetType: "LICENSING_SYSTEM",
    capabilities: [
      "LICENSE_ISSUANCE",
      "LICENSE_ACTIVATION",
      "RIGHTS_BOUNDARIES"
    ]
  },
  {
    id: "SHEIKHA_FEDERATION_AUTHORITY",
    name: "Sheikha Integration and Federation Authority",
    assetType: "FEDERATION_SYSTEM",
    capabilities: [
      "INTEGRATION",
      "FEDERATION",
      "AUTHORIZATION"
    ]
  }
];

function buildRuntime() {
  const registry = new SheikhaOwnedAssetRegistry(OWNER);
  const licensing = new SheikhaLicenseAuthority({
    licensorId: OWNER.ownerId,
    licensorLegalNameAr: OWNER.ownerLegalNameAr,
    licensorLegalNameEn: OWNER.ownerLegalNameEn,
    systemNameAr: OWNER.systemNameAr,
    systemNameEn: OWNER.systemNameEn
  });

  const federation = new SheikhaIntegrationAuthority({
    authorityId: "SHEIKHA_INTEGRATION_AUTHORITY_V1",
    authorityNameAr: "سلطة التكامل التقني لمنظومة شيخة",
    authorityNameEn: "Sheikha Technical Integration Authority"
  });

  for (const asset of ownedAssets) {
    registry.registerAsset({
      ...asset,
      ownerId: OWNER.ownerId,
      ownershipClass: "OWNED",
      rightsBasis:
        "CREATOR_DECLARATION_AND_REPOSITORY_PROVENANCE",
      evidence: [
        "LOCAL_REPOSITORY_COMMIT_PROVENANCE",
        "OWNER_DECLARATION",
        "GENERATED_IN_SHEIKHA_MAIN_PORTAL"
      ],
      restrictions: [
        "NO_UNAUTHORIZED_RELICENSING",
        "NO_FALSE_OFFICIAL_AUTHORITY_CLAIM"
      ]
    });
  }

  const internalLicense = licensing.issueLicense({
    id: "SHEIKHA_INTERNAL_OPERATION_LICENSE_V1",
    licensee: "SHEIKHA_INTERNAL_RUNTIME",
    licenseType: "PROPRIETARY_INTERNAL",
    state: "ACTIVE",
    assetIds: ownedAssets.map((asset) => asset.id),
    grants: [
      "USE",
      "OPERATE",
      "TEST",
      "INTEGRATE_IN_SHEIKHA_CONTROLLED_ENVIRONMENTS"
    ],
    restrictions: [
      "NO_EXTERNAL_SUBLICENSE_WITHOUT_SIGNED_AGREEMENT",
      "PRESERVE_OWNERSHIP_NOTICES"
    ],
    territory: "INTERNAL_TECHNICAL_OPERATION",
    requiresCounterpartyAcceptance: false,
    requiresLegalReview: false,
    evidence: [
      "OWNER_INTERNAL_AUTHORIZATION"
    ]
  });

  federation.registerIntegration({
    id: "SHEIKHA_LOCAL_PORTAL_INTEGRATION_V1",
    target: "Sheikha Main Portal",
    targetOwner: OWNER.ownerLegalNameEn,
    scope: "LOCAL",
    states: [
      "REGISTERED",
      "INTEGRATED",
      "LICENSED",
      "AUTHORIZED"
    ],
    adapter: "LOCAL_PORTAL_RUNTIME_ADAPTER",
    contractReference:
      "SHEIKHA_OWNERSHIP_LICENSING_FEDERATION_CONTRACT_V1",
    licenseReference: internalLicense.id,
    authorizationEvidence:
      "OWNER_INTERNAL_AUTHORIZATION",
    dataBoundaries: [
      "LOCAL_REPOSITORY",
      "LOCAL_TOOL_REGISTRY",
      "NO_UNAUTHORIZED_EXTERNAL_DATA_TRANSFER"
    ],
    allowedCapabilities: [
      "OWNERSHIP_REGISTRATION",
      "LICENSE_REGISTRATION",
      "INTEGRATION_REGISTRATION",
      "FEDERATION_POLICY"
    ],
    deniedCapabilities: [
      "UNAUTHORIZED_PRODUCTION_MUTATION",
      "UNAUTHORIZED_SUBLICENSING",
      "FALSE_THIRD_PARTY_OWNERSHIP_CLAIM"
    ]
  });

  return {
    registry,
    licensing,
    federation
  };
}

function getActivationState() {
  const runtime = buildRuntime();

  const state = {
    schemaVersion: "1.0.0",
    system:
      "SHEIKHA_OWNED_ASSETS_LICENSING_FEDERATION_FOUNDATION_V1",
    owner: OWNER,
    scope: "LOCAL_SHEIKHA_MAIN_PORTAL_FOUNDATION",
    activation: {
      ACTIVATION_EXECUTED: true,
      LOCAL_PORTAL_FOUNDATION_ACTIVE: true,
      OWNED_ASSET_REGISTRY_ACTIVE: true,
      LICENSING_AUTHORITY_ACTIVE: true,
      INTEGRATION_AUTHORITY_ACTIVE: true,
      FEDERATION_AUTHORITY_ACTIVE: true,
      AUTHORIZATION_CONTRACTS_ACTIVE: true,
      THIRD_PARTY_RIGHTS_PRESERVATION_ACTIVE: true,

      REMOTE_MUTATION_PERFORMED: false,
      PRODUCTION_DEPLOYMENT_EXECUTED: false,
      SERVICES_RESTARTED: false,
      PACKAGES_INSTALLED: false,
      EXTERNAL_CONNECTIONS_CREATED: false,

      CLEANUP_AUTHORIZED: false,
      RETENTION_MODE: "DENY_BY_DEFAULT"
    },
    ownership: runtime.registry.summary(),
    licensing: runtime.licensing.summary(),
    federation: runtime.federation.summary(),
    legalTruth: {
      technicalFoundationCreated: true,
      legalRegistrationClaimed: false,
      trademarkRegistrationClaimed: false,
      patentRegistrationClaimed: false,
      thirdPartyOwnershipClaimed: false,
      contractsRequireAcceptanceWhenExternal: true
    },
    generatedAt: new Date().toISOString()
  };

  return state;
}

function writeActivationState(outputPath) {
  const state = getActivationState();

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true
  });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(state, null, 2) + "\n",
    "utf8"
  );

  return state;
}

module.exports = {
  OWNER,
  buildRuntime,
  getActivationState,
  writeActivationState
};
