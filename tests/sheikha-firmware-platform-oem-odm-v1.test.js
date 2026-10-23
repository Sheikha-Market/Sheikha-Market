'use strict';

const fs = require('node:fs');
const {EVIDENCE_KINDS} = require('../core/governance/sheikha-boot-evidence-collector-v1');
const {evaluate, generate, CONTRACT, OUTPUT, REGISTRY, ROADMAP, DECISION_CONTRACT, COMPUTING_PLATFORM} = require('../bare-metal/build/sheikha-firmware-platform-oem-odm-v1');

describe('Sheikha Firmware Platform OEM/ODM V1', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
  });
  afterEach(() => { jest.restoreAllMocks(); });
  test('defines an independent product and preserves third-party rights', () => {
    const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
    expect(registry.brand).toBe('Sheikha Foundation Firmware Platform');
    expect(registry.productFamilies).toHaveLength(9);
    expect(registry.architectures).toEqual(['x86_64', 'aarch64', 'riscv64']);
    expect(registry.claimBoundary.amibiosOrAptioCodeIncluded).toBe(false);
    expect(contract.rights.proprietaryFirmwareImport).toContain('DENIED');
    expect(contract.prohibited).toContain('CLAIM_AMI_PRODUCT_OWNERSHIP_OR_REBRANDING');
  });

  test('enforces evidence governance and bounded AI authority', () => {
    const report = evaluate();
    expect(report.governance.invariantsSatisfiedByContract).toBe(true);
    expect(report.governance.aiAuthorityBounded).toBe(true);
    expect(report.governance.cleanRoomRequired).toBe(true);
    expect(report.governance.trademarkClearancePending).toBe(true);
    expect(report.correctedPhysicalClaim.postExitBootServicesKernelEntryVerified).toBe(true);
    expect(report.correctedPhysicalClaim.generalPurposeOperatingSystemComplete).toBe(false);
    expect(report.correctedPhysicalClaim.fullMotherboardFirmwareReplacementComplete).toBe(false);
  });

  test('binds evidence to the named board and exposes a measurable roadmap', () => {
    const roadmap = JSON.parse(fs.readFileSync(ROADMAP, 'utf8'));
    const report = evaluate();
    expect(roadmap.milestones).toHaveLength(5);
    expect(report.roadmap.currentMilestone).toBe('M1');
    expect(report.releaseIdentity.evidenceId).toMatch(/^SFP-EVIDENCE-[A-F0-9]{16}$/);
    expect(report.releaseIdentity.boardBinding).toContain('Pulse 16 AI C1VFKG');
    expect(report.releaseIdentity.externalCertification).toBe(false);
  });

  test('defines useful community and enterprise editions without weakening safety', () => {
    const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    expect(registry.editions.community.notDeliberatelyCrippled).toBe(true);
    expect(registry.editions.community.releaseRequires).toContain('SECRET_SCAN');
    expect(registry.editions.enterpriseOem.adds).toContain('PRODUCTION_SIGNING');
  });

  test('binds all computing layers to a bounded unified decision contract', () => {
    const decision = JSON.parse(fs.readFileSync(DECISION_CONTRACT, 'utf8'));
    const computing = JSON.parse(fs.readFileSync(COMPUTING_PLATFORM, 'utf8'));
    const report = evaluate();
    expect(computing.layers).toHaveLength(8);
    expect(computing.claimBoundary.fullComputingPlatformImplemented).toBe(false);
    expect(decision.rules.UNVERIFIED).toBe('DENY');
    expect(decision.religiousBoundary.aiIsNotAutonomousMufti).toBe(true);
    expect(report.governance.decisionContractRequiredFieldsPresent).toBe(true);
    expect(report.governance.religiousReferencePolicyBounded).toBe(true);
  });

  test('includes the fail-closed named-board qualification result', () => {
    const report = evaluate();
    expect(report.evidence.namedBoardPackage.seedVerified).toBe(true);
    expect(report.evidence.namedBoardPackage.evidenceRecordsValid).toBe(true);
    expect(report.evidence.namedBoardPackage.completedBsp).toBe(false);
    expect(report.evidence.namedBoardPackage.recoveryDrillCompleted).toBe(false);
  });

  test('binds firmware to technical-only capability enforcement', () => {
    const report = evaluate();
    expect(report.governance.controlPlane.authorityIsTechnicalOnly).toBe(true);
    expect(report.governance.controlPlane.algorithm).toBe('Ed25519');
    expect(report.governance.controlPlane.pepCount).toBe(10);
    expect(report.governance.controlPlane.productionPrivateKeyBundled).toBe(false);
    expect(report.governance.controlPlane.distributedProductionReady).toBe(false);
    expect(report.governance.controlPlane.distributedProductionStatus).toBeTruthy();
  });

  test('denies the actual MSI seed at the production release gate', () => {
    const report = evaluate();
    expect(report.actualFirmwareReleaseGate.decision).toBe('RELEASE_DENY');
    expect(report.actualFirmwareReleaseGate.blockers).toEqual(expect.arrayContaining([
      'DECISION_REQUIRED',
      'VERIFIED_CAPABILITY_TOKEN_REQUIRED',
      'ARTIFACT_SIGNATURE_VERIFICATION_REQUIRED',
      'SBOM_REQUIRED',
      'APPROVED_PRODUCTION_KEY_REQUIRED',
      'FIRMWARE_RECOVERY_PATH_REQUIRED'
    ]));
    expect(report.actualFirmwareReleaseGate.blockers).not.toContain('PHYSICAL_VALIDATION_EVIDENCE_REQUIRED');
  });

  test('keeps the actual firmware adapter read-only and flash denied', () => {
    const report = evaluate();
    expect(report.runtimeAdapterIntegration.domainAdapterCount).toBe(10);
    expect(report.runtimeAdapterIntegration.firmwareDefaultMode).toBe('READ_ONLY');
    expect(report.runtimeAdapterIntegration.physicalWriteActivated).toBe(false);
    expect(report.runtimeAdapterIntegration.actualFlashPlan.decision).toBe('DENY');
    expect(report.runtimeAdapterIntegration.actualFlashPlan.blockers).toEqual(expect.arrayContaining([
      'HUMAN_APPROVAL_REQUIRED', 'RECOVERY_PLAN_REQUIRED', 'SIGNED_ARTIFACT_REQUIRED',
      'READBACK_BACKUP_REQUIRED', 'ANTI_ROLLBACK_POLICY_REQUIRED', 'PHYSICAL_PRESENCE_EVIDENCE_REQUIRED'
    ]));
  });

  test('reports measured platform trust without turning local probes into attestation', () => {
    const report = evaluate();
    expect(report.physicalPlatformTrust.uefiRuntimePresent).toBe(true);
    expect(report.physicalPlatformTrust.tpm2Present).toBe(true);
    expect(report.physicalPlatformTrust.secureBootEnabled).toBe(false);
    expect(report.physicalPlatformTrust.measuredBootEvidenceAvailable).toBe(false);
    expect(report.physicalPlatformTrust.cryptographicAttestationVerified).toBe(false);
  });

  test('registers offline evidence ingestion without claiming real TPM evidence', () => {
    const report = evaluate();
    expect(report.measurementEvidencePipeline.acceptedKindCount).toBe(EVIDENCE_KINDS.length);
    expect(report.measurementEvidencePipeline.supportedAlgorithms).toEqual(['sha1', 'sha256', 'sha384', 'sha512']);
    expect(report.measurementEvidencePipeline.realPcrExportIngested).toBe(false);
    expect(report.measurementEvidencePipeline.realTpmEventLogIngested).toBe(false);
    expect(report.measurementEvidencePipeline.normalizedMeasuredBootEvidenceVerified).toBe(false);
    expect(report.measurementEvidencePipeline.directTpmAccessByPipeline).toBe(false);
    expect(report.measurementEvidencePipeline.supportedQuoteSignatures).toEqual(['RSASSA', 'RSAPSS', 'ECDSA']);
    expect(report.measurementEvidencePipeline.realTpmsAttestQuoteIngested).toBe(false);
    expect(report.measurementEvidencePipeline.realTpmtSignatureIngested).toBe(false);
    expect(report.measurementEvidencePipeline.realAkEnrollmentVerified).toBe(false);
    expect(report.measurementEvidencePipeline.supportedAkPublicTypes).toEqual(['RSA', 'ECC']);
    expect(report.measurementEvidencePipeline.realAkPublicExportIngested).toBe(false);
    expect(report.measurementEvidencePipeline.akObjectNameVerified).toBe(false);
    expect(report.measurementEvidencePipeline.akQualifiedNameBindingVerified).toBe(false);
    expect(report.measurementEvidencePipeline.realTpmResidencyVerified).toBe(false);
    expect(report.measurementEvidencePipeline.nativeQuoteCryptographicallyVerified).toBe(false);
  });

  test('keeps flashing, production keys, and shipment behind human approval', () => {
    const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
    expect(contract.defaultAuthorization).toBe('DENY');
    expect(contract.highImpactHumanApprovalRequired).toEqual(expect.arrayContaining([
      'FLASH_PHYSICAL_FIRMWARE', 'ENROLL_PRODUCTION_KEYS', 'SHIP_OEM_PRODUCTION_IMAGE'
    ]));
  });

  test('publishes bounded TPM Part 2 coverage without claiming full conformance', () => {
    const report = evaluate();
    expect(report.tpm2Part2Conformance.specificationVersion).toBe('185');
    expect(report.tpm2Part2Conformance.claim).toBe('BOUNDED_SUBSET_IMPLEMENTATION_NOT_FULL_PART2_CONFORMANCE');
    expect(report.tpm2Part2Conformance.implementedProfiles).toEqual([
      'ATTESTATION_QUOTE', 'QUOTE_SIGNATURE', 'AK_PUBLIC_IDENTITY', 'OBJECT_NAME'
    ]);
    expect(report.tpm2Part2Conformance.fullPart2Conformance).toBe(false);
    expect(report.tpm2Part2Conformance.unsupportedStructurePolicy).toBe('DENY');
  });

  test('reports development readiness without claiming OEM production readiness', () => {
    const report = evaluate();
    expect(report.readiness.developmentKitReady).toBe(true);
    expect(report.readiness.namedBoardFirmwareReady).toBe(false);
    expect(report.readiness.oemOdmCommercialReleaseReady).toBe(false);
    expect(report.readiness.verifiedGates).toEqual(['F0', 'F1']);
    expect(report.readiness.blockedGates.map((gate) => gate.id)).toEqual(['F2', 'F3', 'F4', 'F5', 'F6', 'F7']);
    expect(report.readiness.blockedGates[0].missing).toEqual([
      'board_specific_bsp', 'non_destructive_recovery'
    ]);
  });

  test('writes a content-addressed readiness report', () => {
    const report = generate();
    expect(fs.writeFileSync).toHaveBeenCalledWith(OUTPUT, JSON.stringify(report, null, 2) + '\n');
    expect(report.reportSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
