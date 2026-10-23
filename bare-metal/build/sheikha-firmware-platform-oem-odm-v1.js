#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1.json');
const CONTRACT = path.join(ROOT, 'bare-metal/contracts/SHEIKHA-FIRMWARE-OEM-ODM-CONTRACT-V1.json');
const UEFI_REPORT = path.join(ROOT, 'runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-integration-v1-report.json');
const PHYSICAL = path.join(ROOT, 'runtime/bare-metal/v2/evidence/physical-hardware-boot-verification.json');
const OUTPUT = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1-report.json');
const ROADMAP = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/sheikha-foundation-firmware-roadmap-v1.json');
const DECISION_CONTRACT = path.join(ROOT, 'bare-metal/contracts/SHEIKHA-UNIFIED-GOVERNANCE-DECISION-CONTRACT-V1.json');
const COMPUTING_PLATFORM = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/sheikha-foundation-computing-platform-v1.json');
const REFERENCE_POLICY = path.join(ROOT, 'runtime/islamic-reference-governance/v1/sheikha-quran-sunnah-reference-policy-v1.json');
const CONTROL_PLANE = path.join(ROOT, 'runtime/governance/control-plane/v1/sheikha-governance-control-plane-v1.json');
const DISTRIBUTED_GOVERNANCE_REPORT = path.join(ROOT, 'runtime/governance/control-plane/v1/sheikha-distributed-governance-production-v1-report.json');
const PLATFORM_TRUST_REPORT = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-physical-platform-trust-v1-report.json');
const TPM2_PART2_CONFORMANCE = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-tpm2-part2-structures-conformance-v1.json');
const {generate: generateBoardPackage} = require('./sheikha-named-board-package-v1');
const {evaluateRelease} = require('../../core/governance/sheikha-release-production-gate-v1');
const {planHardwareOperation} = require('../../core/governance/sheikha-hardware-firmware-governance-adapter-v1');
const {EVIDENCE_KINDS} = require('../../core/governance/sheikha-boot-evidence-collector-v1');

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

function evaluate() {
  const boardReport = generateBoardPackage();
  const registry = read(REGISTRY);
  const contract = read(CONTRACT);
  const roadmap = read(ROADMAP);
  const decisionContract = read(DECISION_CONTRACT);
  const computingPlatform = read(COMPUTING_PLATFORM);
  const referencePolicy = read(REFERENCE_POLICY);
  const controlPlane = read(CONTROL_PLANE);
  const distributedGovernance = fs.existsSync(DISTRIBUTED_GOVERNANCE_REPORT) ? read(DISTRIBUTED_GOVERNANCE_REPORT) : null;
  const platformTrust = fs.existsSync(PLATFORM_TRUST_REPORT) ? read(PLATFORM_TRUST_REPORT) : null;
  const tpm2Part2Conformance = read(TPM2_PART2_CONFORMANCE);
  const uefi = read(UEFI_REPORT);
  const physical = read(PHYSICAL);
  const physicalBootVerified = physical.physicalHardwareBootVerified === true || physical.status === 'VERIFIED';
  const satisfiedRequirements = new Set([
    'product_contract',
    'third_party_rights_boundary',
    'qemu_uefi_boot',
    'deterministic_artifact',
    ...(physicalBootVerified ? ['named_board_boot'] : [])
  ]);
  const gateStates = Object.fromEntries(registry.gates.map((gate) => [gate.id, gate.state]));
  const verifiedGates = registry.gates.filter((gate) => gate.state === 'VERIFIED').map((gate) => gate.id);
  const blockedGates = registry.gates.filter((gate) => gate.state !== 'VERIFIED').map((gate) => ({
    id: gate.id,
    state: gate.state,
    missing: gate.required.filter((requirement) => !satisfiedRequirements.has(requirement))
  }));
  const commercialReady = registry.gates.every((gate) => gate.state === 'VERIFIED');
  const actualFirmwareRelease = evaluateRelease({
    releaseType: 'FIRMWARE',
    aiSelfAuthorized: false,
    mutableRelease: true,
    governance: {
      referenceId: referencePolicy.system,
      policyId: contract.id,
      decisionId: null,
      executionLeaseId: null,
      capabilityTokenVerified: false,
      pepAuthorizationAllowed: false,
      postExecutionVerified: physicalBootVerified,
      masterAuditValid: false
    },
    artifact: {
      sha256: physical.artifact?.sha256,
      signatureVerified: false,
      sbomDigest: null,
      buildProvenanceDigest: physical.evidenceHash || null
    },
    productionKey: {status: 'NOT_CONFIGURED'},
    environment: {authorizedId: null, targetId: boardReport.boardPackage},
    recovery: {available: false, rollbackAvailable: false},
    criticalBlockers: blockedGates.map((gate) => gate.id),
    firmware: {
      signedFirmware: false,
      boardPlatformBinding: boardReport.bindingMatches ? boardReport.boardPackage : null,
      antiRollbackPolicy: false,
      recoveryPathVerified: boardReport.recovery.physicalDrillCompleted,
      flashWriteAuthorized: false,
      physicalValidationEvidence: physicalBootVerified
    }
  });
  const actualFirmwareFlashPlan = planHardwareOperation({
    operation: 'FIRMWARE_FLASH_WRITE',
    exactTargetIdentity: boardReport.bindingMatches ? boardReport.boardPackage : null,
    artifactSha256: physical.artifact?.sha256,
    signedArtifact: false,
    humanApproval: false,
    recoveryPlan: null,
    readbackBackupVerified: false,
    antiRollbackPolicy: false,
    physicalPresenceEvidence: false
  });
  const report = {
    schemaVersion: '1.0.0',
    system: registry.id,
    status: commercialReady ? 'OEM_ODM_COMMERCIAL_RELEASE_READY' : 'DEVELOPMENT_FOUNDATION_READY_PRODUCTION_GATES_OPEN',
    generatedAt: new Date().toISOString(),
    product: {
      brand: registry.brand,
      arabicBrand: registry.arabicBrand,
      tracks: registry.deliveryTracks.map((track) => track.id),
      architectures: registry.architectures,
      compositionModel: registry.compositionModel,
      families: registry.productFamilies.map((family) => ({id: family.id, state: family.state}))
    },
    editions: registry.editions,
    foundationComputingPlatform: {
      id: computingPlatform.id,
      status: computingPlatform.status,
      layers: computingPlatform.layers,
      fullyImplemented: computingPlatform.claimBoundary.fullComputingPlatformImplemented
    },
    roadmap: {
      id: roadmap.id,
      status: roadmap.status,
      currentMilestone: roadmap.milestones.find((milestone) => milestone.state === 'PARTIAL')?.id || null,
      verifiedMilestones: roadmap.milestones.filter((milestone) => milestone.state === 'VERIFIED').map((milestone) => milestone.id),
      blockedMilestones: roadmap.milestones.filter((milestone) => milestone.state === 'BLOCKED').map((milestone) => milestone.id)
    },
    evidence: {
      uefiFoundationStatus: uefi.status || null,
      physicalNamedDeviceBootVerified: physicalBootVerified,
      physicalEvidencePath: path.relative(ROOT, PHYSICAL),
      contractActive: contract.status === 'ACTIVE',
      namedBoardPackage: {
        id: boardReport.boardPackage,
        seedVerified: boardReport.seedVerified,
        evidenceRecordsValid: boardReport.evidenceRecordsValid,
        completedBsp: boardReport.implementation.completedBsp,
        recoveryDrillCompleted: boardReport.recovery.physicalDrillCompleted
      }
    },
    governance: {
      doctrine: contract.engineeringDoctrine,
      failureSequence: contract.failureSequence,
      invariantCount: Object.keys(contract.enforceableInvariants).length,
      invariantsSatisfiedByContract: Object.entries(contract.enforceableInvariants).every(([name, value]) =>
        name === 'INTERNAL_DISK_WRITE_DURING_SAFE_TRIAL' || name === 'AI_OVERRIDE_OF_SECURITY_POLICY'
          ? value === false
          : value === true
      ),
      aiAuthorityBounded: registry.aiRole.denied.includes('AUTONOMOUS_UNBOUNDED_FLASH') &&
        registry.aiRole.denied.includes('SECURITY_POLICY_OVERRIDE'),
      cleanRoomRequired: contract.cleanRoomRule.required === true,
      trademarkClearancePending: contract.brandGate.trademarkClearanceRequiredBeforeCommercialRegistration === true &&
        contract.brandGate.globalTrademarkRegistrationClaimed === false,
      unifiedDecisionContract: decisionContract.id,
      decisionContractRequiredFieldsPresent: decisionContract.requiredFields.length === 10,
      religiousReferencePolicyBounded: referencePolicy.boundaries.noAutonomousFatwa === true &&
        referencePolicy.boundaries.noReplacementForQualifiedScholars === true &&
        decisionContract.religiousBoundary.disputedFiqhRequiresQualifiedHumanReview === true,
      controlPlane: {
        id: controlPlane.id,
        authorityIsTechnicalOnly: controlPlane.authorityMeaning === 'BOUNDED_TECHNICAL_EXECUTION_AUTHORIZATION_ONLY' &&
          controlPlane.religiousAuthorityClaimed === false,
        algorithm: controlPlane.algorithm,
        pepCount: controlPlane.pepAudiences.length,
        productionPrivateKeyBundled: controlPlane.productionPrivateKeyBundled,
        distributedProductionReady: distributedGovernance?.commercialDistributedProductionReady === true,
        distributedProductionStatus: distributedGovernance?.status || 'ACTIVATION_REPORT_REQUIRED',
        distributedProductionBlockers: distributedGovernance?.blockers || ['ACTIVATION_REPORT_REQUIRED']
      }
    },
    readiness: {
      gateStates,
      verifiedGates,
      blockedGates,
      developmentKitReady: gateStates.F0 === 'VERIFIED' && gateStates.F1 === 'VERIFIED',
      namedBoardFirmwareReady: false,
      oemOdmCommercialReleaseReady: commercialReady
    },
    nextSafeMilestone: 'F2_NAMED_BOARD_BSP_RECOVERY_AND_NON_DESTRUCTIVE_FLASH_LAB',
    correctedPhysicalClaim: {
      postExitBootServicesKernelEntryVerified: physical.observations?.postKernelGreenBarVisibleBothRuns === true,
      generalPurposeOperatingSystemComplete: false,
      fullMotherboardFirmwareReplacementComplete: false
    },
    releaseIdentity: {
      evidenceId: `SFP-EVIDENCE-${physical.evidenceHash.slice(0, 16).toUpperCase()}`,
      artifactSha256: physical.artifact?.sha256 || null,
      boardBinding: `${physical.platform?.vendor || 'UNKNOWN'}::${physical.platform?.model || 'UNKNOWN'}::${physical.platform?.biosVersion || 'UNKNOWN'}`,
      scope: physical.scope || null,
      externalCertification: false
    },
    actualFirmwareReleaseGate: actualFirmwareRelease,
    runtimeAdapterIntegration: {
      adapterFabric: 'SHEIKHA_GOVERNANCE_RUNTIME_INTEGRATION_AND_ADAPTER_ACTIVATION_V1',
      hardwareFirmwareAdapter: 'SHEIKHA_HARDWARE_FIRMWARE_GOVERNANCE_ADAPTER_V1',
      domainAdapterCount: 10,
      firmwareDefaultMode: 'READ_ONLY',
      physicalWriteActivated: false,
      actualFlashPlan: actualFirmwareFlashPlan
    },
    physicalPlatformTrust: platformTrust ? {
      status: platformTrust.status,
      uefiRuntimePresent: platformTrust.checks.uefiRuntimePresent,
      secureBootEnabled: platformTrust.checks.secureBootEnabled,
      tpm2Present: platformTrust.checks.tpm2Present,
      measuredBootEvidenceAvailable: platformTrust.checks.measuredBootEvidenceAvailable,
      cryptographicAttestationVerified: platformTrust.checks.cryptographicAttestationVerified,
      bmcIdentityAndAttestationVerified: platformTrust.checks.bmcIdentityAndAttestationVerified,
      blockers: platformTrust.blockers,
      reportSha256: platformTrust.reportSha256
    } : {status: 'PLATFORM_TRUST_REPORT_REQUIRED'},
    measurementEvidencePipeline: {
      collector: 'SHEIKHA_BOOT_EVIDENCE_COLLECTOR_AND_HARDWARE_MEASUREMENT_INGESTION_V1',
      acceptedKindCount: EVIDENCE_KINDS.length,
      normalizer: 'SHEIKHA_TPM_PCR_AND_EVENT_LOG_EVIDENCE_NORMALIZATION_V1',
      supportedAlgorithms: ['sha1', 'sha256', 'sha384', 'sha512'],
      realPcrExportIngested: false,
      realTpmEventLogIngested: false,
      normalizedMeasuredBootEvidenceVerified: false,
      directTpmAccessByPipeline: false,
      nativeTpmsAttestParser: 'SHEIKHA_NATIVE_TPMS_ATTEST_AND_AK_TRUST_CHAIN_V1',
      nativeTpmtSignatureVerifier: 'SHEIKHA_NATIVE_TPMT_SIGNATURE_AND_QUOTE_CRYPTOGRAPHIC_VERIFICATION_V1',
      nativeTpmPublicParser: 'SHEIKHA_NATIVE_TPM2B_PUBLIC_TPMT_PUBLIC_AK_NAME_BINDING_V1',
      supportedAkPublicTypes: ['RSA', 'ECC'],
      supportedQuoteSignatures: ['RSASSA', 'RSAPSS', 'ECDSA'],
      realTpmsAttestQuoteIngested: false,
      realTpmtSignatureIngested: false,
      realAkEnrollmentVerified: false,
      realAkPublicExportIngested: false,
      akObjectNameVerified: false,
      akQualifiedNameBindingVerified: false,
      realTpmResidencyVerified: false,
      nativeQuoteCryptographicallyVerified: false
    },
    tpm2Part2Conformance: {
      specificationVersion: tpm2Part2Conformance.specification.version,
      claim: tpm2Part2Conformance.claim,
      profileCount: tpm2Part2Conformance.profiles.length,
      implementedProfiles: tpm2Part2Conformance.profiles
        .filter((profile) => profile.status.startsWith('IMPLEMENTED'))
        .map((profile) => profile.id),
      fullPart2Conformance: false,
      unsupportedStructurePolicy: tpm2Part2Conformance.rules.unknownStructure
    },
    claimBoundary: registry.claimBoundary
  };
  report.reportSha256 = digest(report);
  return report;
}

function generate() {
  const report = evaluate();
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {evaluate, generate, CONTRACT, OUTPUT, REGISTRY, ROADMAP, DECISION_CONTRACT, COMPUTING_PLATFORM};
