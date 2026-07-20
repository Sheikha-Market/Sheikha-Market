'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  evaluateEvidenceDecision
} = require('../sheikha-logic/sheikha-logic-governance-engine-v1');

const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract: 'runtime/product-runtime/v1/contracts/' +
    'sheikha-unified-product-runtime-v1-contract.json',
  gardens: 'runtime/jannat-gardens/v1/' +
    'sheikha-jannat-gardens-v1-report.json',
  gardensIntegration: 'runtime/gardens-and-trees/v2/' +
    'sheikha-sovereign-bare-metal-system-builder-integration-v2.json',
  bareMetal: 'runtime/bare-metal/v2/' +
    'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json',
  physicalTrial: 'runtime/bare-metal/v2/physical-trial/v1/' +
    'sheikha-v2-physical-boot-trial-v1-report.json',
  uefi: 'runtime/bare-metal/v2/uefi-integration/v1/' +
    'sheikha-uefi-integration-v1-report.json',
  hardware: 'runtime/bare-metal/v2/hardware-compatibility/v1/' +
    'sheikha-universal-hardware-compatibility-v1-report.json',
  systemBuilder: 'runtime/system-builder-fabric/v1/' +
    'sheikha-system-builder-fabric-v1.json',
  systemBuilderHierarchy: 'runtime/system-builder-fabric/v1/' +
    'sheikha-system-builder-platform-hierarchy-v1.json'
});

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function evidence(id, source, verified, detail) {
  return {
    id,
    source,
    kind: 'LOCAL_REPOSITORY_EVIDENCE',
    verified: verified === true,
    supports: true,
    detail
  };
}

function decide(id, proposition, records, requiredEvidenceIds) {
  return evaluateEvidenceDecision({
    id,
    proposition,
    evidence: records,
    requiredEvidenceIds,
    noHarm: true,
    qualifiedHumanReview: false
  });
}

function routeChecks(contract) {
  const canonicalRoutes = contract.productRoutes.map((route) =>
    route.canonical
  );
  const aliases = contract.productRoutes.flatMap((route) => route.aliases);
  const aliasTargetsAreAbsolute = contract.productRoutes.every((route) =>
    route.canonical.startsWith('/') &&
    route.aliases.every((alias) => alias.startsWith('/'))
  );

  return {
    productRoutesDeclared: contract.productRoutes.length >= 4,
    aliasTargetsAreAbsolute,
    aliasesUnique: new Set(aliases).size === aliases.length,
    canonicalRoutesPresent: canonicalRoutes.every(Boolean)
  };
}

function buildUnifiedProductRuntime(options = {}) {
  const contract = readJson(FILES.contract);
  const gardens = readJson(FILES.gardens);
  const integration = readJson(FILES.gardensIntegration);
  const bareMetal = readJson(FILES.bareMetal);
  const physicalTrial = readJson(FILES.physicalTrial);
  const uefi = readJson(FILES.uefi);
  const hardware = readJson(FILES.hardware);
  const systemBuilder = readJson(FILES.systemBuilder);
  const hierarchy = readJson(FILES.systemBuilderHierarchy);

  const decisions = {
    gardens: decide(
      'gardens-worldly-experience',
      'The Sheikha gardens experience is active as a worldly metaphor only.',
      [
        evidence(
          'gardens-boundary',
          FILES.gardens,
          gardens.checks.worldlyMetaphorOnly &&
            gardens.checks.noActualJannahClaim &&
            gardens.checks.noUnseenRepresentationClaim,
          'Worldly metaphor and unseen boundaries are explicit.'
        ),
        evidence(
          'gardens-model',
          FILES.gardens,
          gardens.checks.gardensBuilt &&
            gardens.checks.publicModelDefined,
          'Garden model and public model are present.'
        )
      ],
      ['gardens-boundary', 'gardens-model']
    ),
    bareMetal: decide(
      'bare-metal-qemu-foundation',
      'The Sheikha x86_64 bare-metal Phase 2B foundation is verified in QEMU.',
      [
        evidence(
          'bare-metal-phase2b',
          FILES.bareMetal,
          bareMetal.phase2bVerified && bareMetal.qemuBootExecuted,
          bareMetal.status
        ),
        evidence(
          'bare-metal-artifact',
          FILES.bareMetal,
          bareMetal.bootArtifactCreated && bareMetal.bootImageCreated,
          bareMetal.artifact?.efi?.sha256 || ''
        )
      ],
      ['bare-metal-phase2b', 'bare-metal-artifact']
    ),
    uefi: decide(
      'uefi-foundation-subsets',
      'The UEFI registry and its bounded verified foundation subsets are active.',
      [
        evidence(
          'uefi-registry',
          FILES.uefi,
          uefi.coverage.total === 57,
          `${uefi.coverage.chapters} chapters and ` +
            `${uefi.coverage.appendices} appendices`
        ),
        evidence(
          'uefi-verified-subsets',
          FILES.uefi,
          uefi.coverage.qemuVerifiedSubsets > 0 &&
            uefi.controls.defaultAuthorization === 'DENY',
          `${uefi.coverage.qemuVerifiedSubsets} QEMU verified subsets`
        )
      ],
      ['uefi-registry', 'uefi-verified-subsets']
    ),
    systemBuilder: decide(
      'system-builder-governed-fabric',
      'The System Builder governed fabric and hierarchy are active.',
      [
        evidence(
          'system-builder-fabric',
          FILES.systemBuilder,
          systemBuilder.status === 'ACTIVE_GOVERNED_TOOL_FABRIC',
          systemBuilder.activeProfile
        ),
        evidence(
          'system-builder-hierarchy',
          FILES.systemBuilderHierarchy,
          hierarchy.status === 'ACTIVE' &&
            hierarchy.governance.defaultExecutionAuthorization === 'DENY',
          hierarchy.architecture.foundation.role
        )
      ],
      ['system-builder-fabric', 'system-builder-hierarchy']
    )
  };

  const routes = routeChecks(contract);
  const checks = {
    allProductDecisionsVerified: Object.values(decisions).every((decision) =>
      decision.verified
    ),
    integrationBoundaryActive:
      integration.status === 'ACTIVE_WITH_BOOT_BOUNDARY_ENFORCED',
    bootCriticalPathIsolated:
      integration.criticalBootBoundary.aiInsideBootCriticalPath === false &&
      integration.criticalBootBoundary.systemBuilderInsideBootCriticalPath ===
        false &&
      integration.criticalBootBoundary.jannatGardensInsideBootCriticalPath ===
        false,
    defaultAuthorizationDeny:
      contract.governance.defaultAuthorization === 'DENY',
    noAutomatedFatwa: contract.governance.automatedFatwa === false,
    noReligiousAuthorityClaim:
      contract.governance.religiousAuthorityClaim === false,
    routesValid: Object.values(routes).every(Boolean)
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  const passed = failedChecks.length === 0;

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UNIFIED_PRODUCT_RUNTIME_V1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    status: passed
      ? 'ACTIVE_WITH_BOUNDED_VERIFIED_FOUNDATIONS'
      : 'REVIEW_REQUIRED',
    identity: contract.identity,
    governance: contract.governance,
    layers: contract.layers,
    products: [
      {
        id: 'gardens',
        nameAr: 'جنات وأشجار شيخة',
        status: decisions.gardens.status,
        route: '/riyadh-aljannah-community/',
        metrics: gardens.metrics,
        boundary: gardens.worldlyBeautyBoundary
      },
      {
        id: 'bare-metal',
        nameAr: 'Sheikha Bare Metal',
        status: 'QEMU_VERIFIED_PHYSICAL_PENDING',
        route: '/boot-trial/',
        architecture: bareMetal.architecture,
        phase2bVerified: bareMetal.phase2bVerified,
        physicalBootVerified: physicalTrial.physicalBootVerified,
        generalPurposeOperatingSystemComplete:
          bareMetal.generalPurposeOperatingSystemComplete
      },
      {
        id: 'uefi',
        nameAr: 'Sheikha UEFI',
        status: decisions.uefi.status,
        route: '/boot-trial/',
        coverage: uefi.coverage,
        fullyImplemented: uefi.coverage.fullyImplemented
      },
      {
        id: 'system-builder',
        nameAr: 'Sheikha System Builder',
        status: decisions.systemBuilder.status,
        route: '/system-builder-workbench/',
        registeredFamilies:
          systemBuilder.familyIsolation.registeredFamilyCount,
        activeProfile: systemBuilder.activeProfile,
        nativeInstallVerified:
          systemBuilder.activeExecution.nativeInstallVerified,
        lifecycleVerified:
          systemBuilder.activeExecution.lifecycleVerified
      }
    ],
    hardwareCompatibility: {
      status: hardware.status,
      coverage: hardware.coverage,
      runnableEverywhereToday:
        hardware.claimBoundary.runnableEverywhereToday,
      physicalVerifiedTargets:
        hardware.coverage.physicalVerifiedTargets,
      safetyCertifiedTargets:
        hardware.coverage.safetyCertifiedTargets
    },
    decisions,
    productRoutes: contract.productRoutes,
    routeChecks: routes,
    checks,
    failedChecks,
    passed,
    claimBoundary: {
      jannatIsWorldlyMetaphorOnly: true,
      physicalHardwareVerified: physicalTrial.physicalBootVerified,
      secureBootVerified: bareMetal.secureBootVerified,
      generalPurposeOsComplete:
        bareMetal.generalPurposeOperatingSystemComplete,
      runnableEverywhereToday:
        hardware.claimBoundary.runnableEverywhereToday,
      externalCertificationClaimed: false,
      religiousRulingAutomated: false
    },
    sourceFiles: FILES,
    claimPolicy: contract.claimPolicy
  };
}

module.exports = {
  FILES,
  buildUnifiedProductRuntime,
  routeChecks
};
