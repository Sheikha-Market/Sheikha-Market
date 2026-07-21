#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

const files = {
  fivePaths: 'runtime/root-architecture/v3/sheikha-current-five-paths-v2.json',
  specs: 'runtime/uefi-capability-registry/v4/sheikha-uefi-specification-baseline-v4.json',
  packages: 'runtime/uefi-capability-registry/v4/sheikha-edk2-package-registry-v4.json',
  dependencies: 'runtime/uefi-capability-registry/v4/sheikha-edk2-dependency-registry-v4.json',
  phases: 'runtime/uefi-capability-registry/v4/sheikha-uefi-pi-phase-registry-v4.json',
  architectures: 'runtime/uefi-capability-registry/v4/sheikha-uefi-architecture-target-registry-v4.json',
  registry: 'runtime/uefi-capability-registry/v4/sheikha-uefi-comprehensive-registration-v4.json',
  evidence: 'runtime/uefi-capability-registry/v4/sheikha-uefi-implementation-evidence-matrix-v4.json',
  driverAbi: 'runtime/driver-abi/v2/sheikha-driver-abi-contract-v2.json',
  productRuntime: 'runtime/unified-product-runtime/v2/sheikha-unified-product-runtime-contract-v2.json',
  graph: 'runtime/root-architecture/v3/sheikha-root-v3-uefi-capability-graph-v4.json',
  overlay: 'runtime/root-architecture/v3/sheikha-root-architecture-v3-uefi-v4-overlay.json'
};

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), 'utf8')
  );
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const fivePaths = readJson(files.fivePaths);
const specs = readJson(files.specs);
const packages = readJson(files.packages);
const dependencies = readJson(files.dependencies);
const phases = readJson(files.phases);
const architectures = readJson(files.architectures);
const registry = readJson(files.registry);
const evidence = readJson(files.evidence);
const driverAbi = readJson(files.driverAbi);
const productRuntime = readJson(files.productRuntime);
const graph = readJson(files.graph);
const overlay = readJson(files.overlay);

invariant(fivePaths.pathCount === 5, 'Five paths must equal 5.');
invariant(specs.specificationCount === 5, 'Specification baselines must equal 5.');
invariant(
  specs.specifications.some(
    (item) => item.id === 'uefi-specification' && item.version === '2.11'
  ),
  'UEFI 2.11 baseline missing.'
);
invariant(
  specs.specifications.some(
    (item) => item.id === 'uefi-platform-initialization' && item.version === '1.9'
  ),
  'PI 1.9 baseline missing.'
);
invariant(
  specs.specifications.some(
    (item) => item.id === 'acpi-specification' && item.version === '6.6'
  ),
  'ACPI 6.6 baseline missing.'
);
invariant(
  specs.specifications.some(
    (item) => item.id === 'uefi-shell-specification' && item.version === '2.2'
  ),
  'UEFI Shell 2.2 baseline missing.'
);
invariant(
  specs.specifications.some(
    (item) => item.id === 'pi-distribution-packaging' && item.version === '1.1'
  ),
  'PI Distribution Packaging 1.1 baseline missing.'
);

invariant(
  packages.release.releaseTag === 'edk2-stable202605',
  'Latest verified EDK II stable release tag missing.'
);
invariant(packages.packageCount === 28, 'EDK II package count must equal 28.');
invariant(
  packages.packages.every(
    (item) =>
      item.registrationStatus === 'REGISTERED' &&
      item.sourceFetched === false &&
      item.buildVerified === false &&
      item.implementationClaimed === false
  ),
  'EDK II package truth boundary violation.'
);

invariant(
  dependencies.dependencyCount === 13,
  'EDK II dependency count must equal 13.'
);
invariant(
  dependencies.dependencies.every(
    (item) =>
      item.registrationStatus === 'REGISTERED' &&
      item.sourceFetched === false &&
      item.buildVerified === false
  ),
  'EDK II dependency truth boundary violation.'
);

invariant(phases.phaseCount === 8, 'PI/UEFI phase count must equal 8.');
invariant(
  architectures.targetCount === 6,
  'Architecture target count must equal 6.'
);
invariant(
  registry.groupCount >= 30,
  'Comprehensive registry must contain at least 30 groups.'
);
invariant(
  registry.registrationCount >= 500,
  'Comprehensive registry must contain at least 500 entries.'
);
invariant(
  registry.registrationCount === registry.registrations.length,
  'Registration count mismatch.'
);
invariant(
  registry.allDeclaredGroupsRegistered === true,
  'All declared groups must be registered.'
);

const groupIds = registry.groups.map((item) => item.id);
const registrationIds = registry.registrations.map((item) => item.id);

invariant(
  new Set(groupIds).size === groupIds.length,
  'Duplicate group identifiers detected.'
);
invariant(
  new Set(registrationIds).size === registrationIds.length,
  'Duplicate registration identifiers detected.'
);

for (const registration of registry.registrations) {
  invariant(
    registration.registrationStatus === 'REGISTERED',
    `Unregistered entry: ${registration.id}`
  );
  invariant(
    registration.implementationStatus === 'NOT_CLAIMED_IMPLEMENTED',
    `Unsafe implementation claim: ${registration.id}`
  );
  invariant(
    registration.verificationStatus === 'EVIDENCE_REQUIRED',
    `Missing evidence requirement: ${registration.id}`
  );
  invariant(
    registration.sourceModuleEvidence.length === 0 &&
      registration.buildEvidence.length === 0 &&
      registration.emulatorEvidence.length === 0 &&
      registration.physicalHardwareEvidence.length === 0 &&
      registration.secureBootEvidence.length === 0 &&
      registration.productionEvidence.length === 0,
    `Unexpected evidence claim: ${registration.id}`
  );
}

const truth = registry.truthBoundaries;

invariant(truth.registrationDoesNotMeanImplemented === true);
invariant(truth.implementationDoesNotMeanVerified === true);
invariant(truth.allDeclaredGroupsRegistered === true);
invariant(truth.allOfficialProtocolIdentifiersExhaustivelyRegistered === false);
invariant(truth.normativeSpecHeaderExtractionStillRequired === true);
invariant(truth.allUefiProtocolsImplemented === false);
invariant(truth.ALL_UEFI_PROTOCOLS_IMPLEMENTED === false);
invariant(truth.allDriversComplete === false);
invariant(truth.allEdk2PackagesBuilt === false);
invariant(truth.allArchitectureTargetsVerified === false);
invariant(truth.allDevicesWorldwideSupported === false);
invariant(truth.physicalHardwareBootVerified === false);
invariant(truth.secureBootVerified === false);
invariant(truth.generalPurposeOperatingSystemComplete === false);
invariant(truth.productionFirmwareReady === false);

invariant(
  evidence.automaticPromotionAllowed === false,
  'Evidence promotion must be manual and fail-closed.'
);
invariant(
  driverAbi.truthBoundaries.abiFullyImplemented === false,
  'Driver ABI must not claim full implementation.'
);
invariant(
  driverAbi.truthBoundaries.allDriversComplete === false,
  'Driver completion must remain false.'
);
invariant(
  productRuntime.truthBoundaries.runtimeProcessStarted === false,
  'Runtime must not be claimed started.'
);
invariant(
  productRuntime.truthBoundaries.productionDeployed === false,
  'Production deployment must remain false.'
);
invariant(
  productRuntime.truthBoundaries.autonomousReligiousRulingAllowed === false,
  'Autonomous religious rulings must remain prohibited.'
);
invariant(
  productRuntime.truthBoundaries.qualifiedScholarReviewRequired === true,
  'Qualified scholar review must remain required.'
);
invariant(
  graph.truthBoundaries.graphRegistrationDoesNotMeanRuntimeWiring === true,
  'Graph registration boundary missing.'
);
invariant(
  graph.truthBoundaries.allNodesImplemented === false,
  'Graph nodes must not be claimed implemented.'
);
invariant(
  overlay.activation.isolatedWorktree === true &&
    overlay.activation.networkSourceFetchExecuted === false &&
    overlay.activation.packageInstallExecuted === false &&
    overlay.activation.mainUpdated === false &&
    overlay.activation.runtimeStarted === false &&
    overlay.activation.productionDeployed === false,
  'Isolated activation truth boundary violation.'
);

const report = {
  schemaVersion: '1.0.0',
  system: 'SHEIKHA_UEFI_COMPREHENSIVE_REGISTRY_V4_VERIFIER',
  classification:
    'LATEST_BASELINES_PACKAGES_GROUPS_AND_TRUTH_BOUNDARIES_VERIFIED',
  specificationBaselineCount: specs.specificationCount,
  edk2ReleaseTag: packages.release.releaseTag,
  edk2PackageCount: packages.packageCount,
  edk2DependencyCount: dependencies.dependencyCount,
  phaseCount: phases.phaseCount,
  architectureTargetCount: architectures.targetCount,
  capabilityGroupCount: registry.groupCount,
  registrationCount: registry.registrationCount,
  graphNodeCount: graph.nodeCount,
  graphEdgeCount: graph.edgeCount,
  allDeclaredGroupsRegistered: true,
  registrationDoesNotMeanImplemented: true,
  allOfficialProtocolIdentifiersExhaustivelyRegistered: false,
  allUefiProtocolsImplemented: false,
  allDriversComplete: false,
  allEdk2PackagesBuilt: false,
  physicalHardwareBootVerified: false,
  secureBootVerified: false,
  productionFirmwareReady: false,
  autonomousReligiousRulingAllowed: false,
  qualifiedScholarReviewRequired: true,
  passed: true
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
