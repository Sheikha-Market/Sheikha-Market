'use strict';

const crypto = require('node:crypto');

const TRUST_CULTIVATION_MAP = Object.freeze({
  soil: 'PLATFORM_IDENTITY_SECURE_BOOT_TPM_AND_RECOVERY_BASELINE',
  seed: 'CONTENT_ADDRESSED_SOURCE_ARTIFACT_AND_PROVENANCE',
  nursery: 'READ_ONLY_SANDBOX_AND_NAMED_BOARD_TRIAL',
  irrigation: 'BOUNDED_COMPUTE_DATA_TIME_BUDGET_AND_HUMAN_REVIEW',
  pruning: 'REVERSIBLE_PATCH_RETEST_AND_AUDIT',
  fruit: 'SIGNED_VERIFIED_RELEASE_WITH_SBOM_AND_ACCEPTANCE_EVIDENCE',
  propagation: 'REPEATABLE_OEM_ODM_RELEASE_AFTER_PRODUCTION_GATES'
});

function stableDigest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function worldlyScopeConfirmed(compiledProgram) {
  const isolation = compiledProgram.engineeringPlan?.sacredLanguageIsolation || {};
  return compiledProgram.declarationKind === 'garden' &&
    isolation.afterlifeTextMayGenerateGeometry === false &&
    isolation.afterlifeTextMayGenerateQuantities === false &&
    isolation.afterlifeTextMayGenerateMaterialSpecification === false &&
    isolation.afterlifeTextMayAuthorizeConstruction === false &&
    isolation.namesAreTextualRemindersOnly === true;
}

function resolveBridgeStatus({languageReady, releaseReady}) {
  if (releaseReady) {
    return 'CONTROLLED_RELEASE_CANDIDATE_REQUIRES_SEPARATE_EXECUTION_LEASE';
  }
  if (languageReady) {
    return 'LANGUAGE_PLAN_READY_TRUST_AND_EXECUTION_GATES_BLOCKED';
  }
  return 'LANGUAGE_PLAN_INVALID';
}

function buildGardensLanguageTrustBridge({compiledProgram, platformReport}) {
  if (compiledProgram?.system !== 'SHEIKHA_LANGUAGE_CULTIVATION_COMPILER_V1') {
    throw new Error('SHEIKHA_COMPILED_CULTIVATION_PROGRAM_REQUIRED');
  }
  if (platformReport?.system !== 'SHEIKHA_FIRMWARE_PLATFORM_OEM_ODM_V1') {
    throw new Error('SHEIKHA_FIRMWARE_PLATFORM_REPORT_REQUIRED');
  }

  const checks = {
    languageTypeCheckPassed: compiledProgram.typeCheck?.ok === true,
    worldlyScopeConfirmed: worldlyScopeConfirmed(compiledProgram),
    languageReferencesResolved:
      compiledProgram.cultivationGraph?.unresolvedReferences?.length === 0,
    physicalBootEvidenceVerified:
      platformReport.evidence?.physicalNamedDeviceBootVerified === true,
    tpm2Present: platformReport.physicalPlatformTrust?.tpm2Present === true,
    secureBootVerified:
      platformReport.physicalPlatformTrust?.secureBootEnabled === true,
    measuredBootVerified:
      platformReport.physicalPlatformTrust?.measuredBootEvidenceAvailable === true,
    nativeQuoteVerified:
      platformReport.measurementEvidencePipeline?.nativeQuoteCryptographicallyVerified === true,
    akPublicAreaAndNameVerified:
      platformReport.measurementEvidencePipeline?.realAkPublicExportIngested === true &&
      platformReport.measurementEvidencePipeline?.akObjectNameVerified === true &&
      platformReport.measurementEvidencePipeline?.akQualifiedNameBindingVerified === true,
    akEnrollmentVerified:
      platformReport.measurementEvidencePipeline?.realAkEnrollmentVerified === true,
    firmwareReleaseAllowed:
      platformReport.actualFirmwareReleaseGate?.decision === 'RELEASE_ALLOW',
    engineeringExecutionAuthorized:
      compiledProgram.admissionReview?.decision === 'READY_FOR_CONTROLLED_EXECUTION' &&
      compiledProgram.engineeringPlan?.physicalExecutionAuthorized === true
  };
  const blockers = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const languageReady = checks.languageTypeCheckPassed &&
    checks.worldlyScopeConfirmed && checks.languageReferencesResolved;
  const trustReady = checks.physicalBootEvidenceVerified && checks.tpm2Present &&
    checks.secureBootVerified && checks.measuredBootVerified &&
    checks.nativeQuoteVerified && checks.akPublicAreaAndNameVerified &&
    checks.akEnrollmentVerified;
  const releaseReady = trustReady && checks.firmwareReleaseAllowed &&
    checks.engineeringExecutionAuthorized;

  const result = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_GARDENS_LANGUAGE_PLATFORM_TRUST_BRIDGE_V1',
    status: resolveBridgeStatus({languageReady, releaseReady}),
    metaphorScope: 'WORLDLY_ENGINEERING_AND_SOFTWARE_LIFECYCLE_ONLY',
    actualJannahOrUnseenSimulationClaimed: false,
    map: TRUST_CULTIVATION_MAP,
    bindings: {
      languageDeclaration: compiledProgram.declaration,
      languagePlanSha256: stableDigest(compiledProgram),
      platformReportSha256: platformReport.reportSha256 || stableDigest(platformReport),
      physicalArtifactSha256: platformReport.releaseIdentity?.artifactSha256 || null,
      boardBinding: platformReport.releaseIdentity?.boardBinding || null
    },
    checks,
    readiness: {languageReady, trustReady, releaseReady},
    blockers,
    execution: {
      requested: false,
      authorized: false,
      performed: false,
      directTpmAccessPerformed: false,
      firmwareMutationPerformed: false,
      networkUsed: false
    },
    invariants: [
      'COMPILATION_NEVER_AUTHORIZES_PHYSICAL_EXECUTION',
      'METAPHOR_NEVER_OVERRIDES_MEASURED_EVIDENCE',
      'UNVERIFIED_TPM_OR_AK_EVIDENCE_FAILS_CLOSED',
      'FIRMWARE_RELEASE_REQUIRES_A_SEPARATE_SIGNED_EXECUTION_LEASE',
      'SACRED_UNSEEN_IS_NOT_AN_ENGINEERING_INPUT'
    ]
  };
  return {...result, bridgeSha256: stableDigest(result)};
}

module.exports = {TRUST_CULTIVATION_MAP, buildGardensLanguageTrustBridge};
