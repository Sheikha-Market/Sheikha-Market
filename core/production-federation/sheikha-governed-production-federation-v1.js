'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM = 'SHEIKHA_GOVERNED_PRODUCTION_FEDERATION_V1';
const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract:
    'runtime/production-federation/v1/contracts/' +
    'sheikha-governed-production-federation-v1-contract.json',
  modelRegistry:
    'runtime/production-federation/v1/registries/' +
    'production-model-registry-v1.json',
  systemRegistry:
    'runtime/production-federation/v1/registries/' +
    'system-family-adapter-registry-v1.json',
  report:
    'runtime/production-federation/v1/' +
    'sheikha-governed-production-federation-v1-report.json'
});

const EXTERNAL_MODEL_IDS = Object.freeze([
  'INTERNAL_WITH_APPROVED_EXTERNAL_AUGMENTATION',
  'CUSTOMER_OWNED_PLATFORM',
  'EXTERNAL_MANAGED_PLATFORM',
  'HYBRID_INTERNAL_EXTERNAL',
  'FEDERATED_MULTI_PLATFORM',
  'MIGRATION_EXIT_OR_PROVIDER_REPLACEMENT'
]);

const PRODUCTION_MODELS = Object.freeze([
  Object.freeze({
    id: 'INTERNAL_MAXIMUM_CAPABILITY',
    titleAr: 'الإنتاج الداخلي بأعلى قدرة محلية متحققة',
    lane: 'INTERNAL',
    default: true,
    externalComponents: false,
    activation: 'ACTIVE_BOUNDED_BY_LOCAL_EVIDENCE'
  }),
  Object.freeze({
    id: 'INTERNAL_WITH_APPROVED_EXTERNAL_AUGMENTATION',
    titleAr: 'إنتاج داخلي مع قدرة خارجية معتمدة',
    lane: 'HYBRID',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  }),
  Object.freeze({
    id: 'CUSTOMER_OWNED_PLATFORM',
    titleAr: 'بيئة يملكها العميل',
    lane: 'EXTERNAL',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  }),
  Object.freeze({
    id: 'EXTERNAL_MANAGED_PLATFORM',
    titleAr: 'منصة خارجية مُدارة',
    lane: 'EXTERNAL',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  }),
  Object.freeze({
    id: 'HYBRID_INTERNAL_EXTERNAL',
    titleAr: 'إنتاج هجين داخلي وخارجي',
    lane: 'HYBRID',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  }),
  Object.freeze({
    id: 'FEDERATED_MULTI_PLATFORM',
    titleAr: 'اتحاد منصات متعددة',
    lane: 'FEDERATED',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  }),
  Object.freeze({
    id: 'AIR_GAPPED_INTERNAL',
    titleAr: 'إنتاج داخلي معزول شبكيًا',
    lane: 'INTERNAL',
    default: false,
    externalComponents: false,
    activation: 'AVAILABLE_BY_EXPLICIT_SCOPE'
  }),
  Object.freeze({
    id: 'MIGRATION_EXIT_OR_PROVIDER_REPLACEMENT',
    titleAr: 'الهجرة أو الخروج أو استبدال المزود',
    lane: 'FEDERATED',
    default: false,
    externalComponents: true,
    activation: 'REGISTERED_DEFAULT_DENY'
  })
]);

const SYSTEM_FAMILIES = Object.freeze([
  ['SHEIKHA_NATIVE_SYSTEMS', 'أنظمة شيخة الأصلية', 'SHEIKHA_OWNED'],
  ['FIRMWARE_AND_UEFI', 'البرمجيات الثابتة وواجهات الإقلاع', 'MIXED_RIGHTS'],
  ['DESKTOP_OS', 'أنظمة الحاسب المكتبي والمحمول', 'EXTERNAL'],
  ['MOBILE_OS', 'أنظمة الأجهزة المحمولة', 'EXTERNAL'],
  ['SERVER_AND_NETWORK_OS', 'أنظمة الخوادم والشبكات', 'EXTERNAL'],
  ['HYPERVISOR_AND_CLOUD', 'الافتراضية ومنصات السحابة', 'EXTERNAL'],
  ['REAL_TIME_OS', 'أنظمة الزمن الحقيقي', 'EXTERNAL'],
  ['EMBEDDED_AND_DEVICE_OS', 'الأنظمة المضمنة وأنظمة الأجهزة', 'EXTERNAL'],
  ['MAINFRAME_OS', 'أنظمة الحواسيب المركزية', 'EXTERNAL'],
  ['HPC_AND_SUPERCOMPUTING', 'الحوسبة الفائقة والعناقيد', 'EXTERNAL'],
  ['SECURITY_CRITICAL', 'الأنظمة الحرجة وعالية الضمان', 'RESTRICTED_EXTERNAL'],
  ['RESEARCH_AND_EXPERIMENTAL', 'الأنظمة البحثية والتجريبية', 'EXTERNAL'],
  ['LEGACY_AND_HISTORICAL', 'الأنظمة القديمة والتاريخية', 'EXTERNAL'],
  ['CUSTOMER_OR_INDUSTRY_SPECIFIC', 'أنظمة العميل أو القطاع', 'CUSTOMER_OWNED'],
  ['UNLISTED_SYSTEM_OR_PLATFORM', 'أي نظام أو منصة غير مدرجة', 'UNCLASSIFIED']
].map(([id, titleAr, ownershipClass]) => Object.freeze({
  id,
  titleAr,
  ownershipClass,
  adapterContract: 'OPEN_ENDED_EVIDENCE_BOUND_ADAPTER',
  productionSupport:
    id === 'SHEIKHA_NATIVE_SYSTEMS'
      ? 'BOUNDED_LOCAL_EVIDENCE_ONLY'
      : 'NOT_PRODUCTION_SUPPORTED_UNTIL_PROVEN',
  activation:
    id === 'SHEIKHA_NATIVE_SYSTEMS'
      ? 'ACTIVE_BOUNDED_LOCAL_EVIDENCE'
      : id === 'FIRMWARE_AND_UEFI'
        ? 'ACTIVE_VERIFIED_FOUNDATION_SUBSETS'
        : 'REGISTERED_DEFAULT_DENY'
})));

const GOVERNANCE_CONTRACT = Object.freeze({
  schemaVersion: '1.0.0',
  system: SYSTEM,
  status: 'ACTIVE_FAIL_CLOSED_CONTRACT',
  defaultProductionModel: 'INTERNAL_MAXIMUM_CAPABILITY',
  defaultAuthorization: 'DENY',
  releaseIdentityPolicy: {
    strategy: 'BUILD_ONCE_VERIFY_DIGEST_PROMOTE_SAME_ARTIFACT',
    sameArtifactDigestRequiredAcrossLanes: true,
    sameGovernanceContractDigestRequiredAcrossLanes: true,
    silentArtifactSubstitutionAllowed: false,
    signingRequiredWhenTargetPolicyRequiresIt: true,
    signingClaimRequiresEvidence: true
  },
  externalLanePolicy: {
    noValidCustomerChoiceMeansNoExternalProduction: true,
    explicitInformedCustomerChoiceRequired: true,
    rightsAndLicenseVerificationRequired: true,
    providerAndEnvironmentIdentityRequired: true,
    securityPrivacyAndSupplyChainReviewRequired: true,
    exitAndRollbackPlanRequired: true,
    humanApprovalRequired: true,
    externalNetworkDefault: 'DENY',
    automaticExternalPublishing: false
  },
  ownershipPolicy: {
    sheikhaOwnedInputsRemainSheikhaOwned: true,
    externalInputsRemainExternalUnlessValidlyAssigned: true,
    useOrHostingTransfersOwnership: false,
    everyInputRequiresRightsAndProvenance: true,
    everyOutputRequiresRightsClassificationAndProvenance: true,
    unverifiedRightsPromotionAllowed: false,
    sheikhaClaimsOwnershipOfExternalSystems: false
  },
  islamicGovernance: {
    referencePolicy:
      'runtime/islamic-reference-governance/v1/' +
      'sheikha-quran-sunnah-reference-policy-v1.json',
    fulfillmentOfContractsRequired: true,
    trustJusticeAndMutualConsentRequired: true,
    noUnjustTakingRequired: true,
    noRibaGate: true,
    noGhararGate: true,
    truthDisclosureAndNoFraudGate: true,
    noHarmGate: true,
    qualifiedHumanShariaReviewWhenApplicable: true,
    qualifiedLegalReviewWhenApplicable: true,
    automatedFatwaAllowed: false,
    automatedHalalCertificationAllowed: false,
    automatedJudicialAuthorityAllowed: false
  },
  executionBoundary: {
    evaluatesPlansOnly: true,
    executesBuilds: false,
    connectsPlatforms: false,
    performsDeployment: false,
    mutatesProduction: false,
    writesExternalSystems: false
  }
});

const EVIDENCE_SOURCES = Object.freeze([
  Object.freeze({
    id: 'BARE_METAL_X86_64_PHASE2B',
    titleAr: 'إقلاع شيخة x86_64',
    path:
      'runtime/bare-metal/v2/' +
      'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json',
    evaluate(data) {
      const verified =
        data.phase2bVerified === true &&
        data.qemuBootExecuted === true &&
        data.cr3LoadedAtRuntime === true;
      return {
        verified,
        verificationLevel: verified
          ? 'QEMU_RUNTIME_VERIFIED_SUBSET'
          : 'NOT_VERIFIED',
        artifactBuilt: data.bootArtifactCreated === true,
        qemuVerified: verified,
        nativeLifecycleVerified: false
      };
    }
  }),
  Object.freeze({
    id: 'UEFI_FOUNDATION',
    titleAr: 'أساس UEFI',
    path:
      'runtime/bare-metal/v2/uefi-integration/v1/' +
      'sheikha-uefi-integration-v1-report.json',
    evaluate(data) {
      const verifiedSubsetCount =
        Number(data.coverage?.qemuVerifiedSubsets || 0) +
        Number(data.coverage?.sourceVerifiedSubsets || 0);
      return {
        verified: verifiedSubsetCount > 0,
        verificationLevel: verifiedSubsetCount > 0
          ? 'FOUNDATION_SUBSETS_VERIFIED'
          : 'REGISTERED_DEFAULT_DENY',
        artifactBuilt: false,
        qemuVerified:
          Number(data.coverage?.qemuVerifiedSubsets || 0) > 0,
        nativeLifecycleVerified: false,
        registeredCapabilityCount:
          Number(data.coverage?.total || 0),
        verifiedSubsetCount,
        fullyImplementedCapabilityCount:
          Number(data.coverage?.fullyImplemented || 0)
      };
    }
  }),
  Object.freeze({
    id: 'DESKTOP_NATIVE_LINUX_X86_64',
    titleAr: 'تطبيق سطح المكتب الأصلي على Linux x86_64',
    path:
      'runtime/desktop-runtime/v4/' +
      'sheikha-native-desktop-v4-report.json',
    evaluate(data, root) {
      const artifact = inspectLocalArtifact(root, data.artifact);
      const reportClaimsVerification =
        data.desktopExecutableBuilt === true &&
        data.artifactInspected === true &&
        data.nativeLaunchExecuted === true &&
        data.nativeLaunchVerified === true &&
        Number(data.desktopNativeVerifiedCount || 0) === 1 &&
        data.artifact?.format === 'ELF' &&
        data.artifact?.architecture === 'x86_64' &&
        isSha256(data.artifact?.sha256) &&
        data.security?.implementationVerified === true;
      const verified =
        reportClaimsVerification &&
        artifact.present &&
        artifact.bytesMatched &&
        artifact.sha256Matched;
      let verificationLevel = 'DESKTOP_NATIVE_VERIFICATION_REQUIRED';
      if (verified) {
        verificationLevel =
          'DESKTOP_NATIVE_LAUNCH_AND_SECURITY_VERIFIED';
      } else if (reportClaimsVerification && !artifact.present) {
        verificationLevel = 'DESKTOP_ARTIFACT_NOT_PRESENT';
      } else if (
        reportClaimsVerification &&
        (!artifact.bytesMatched || !artifact.sha256Matched)
      ) {
        verificationLevel = 'DESKTOP_ARTIFACT_DIGEST_MISMATCH';
      }
      return {
        verified,
        verificationLevel,
        artifactBuilt: artifact.present && artifact.sha256Matched,
        qemuVerified: false,
        nativeLifecycleVerified: verified,
        nativeLaunchVerified:
          verified && data.nativeLaunchVerified === true,
        securityEnforcementVerified:
          verified && data.security?.implementationVerified === true,
        reportClaimsVerification,
        staleEvidenceClaim: reportClaimsVerification && !verified,
        artifact
      };
    }
  }),
  Object.freeze({
    id: 'SYSTEM_BUILDER_FABRIC',
    titleAr: 'منظومة بناء الأنظمة',
    path:
      'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-fabric-v1.json',
    evaluate(data, root) {
      const execution = data.activeExecution || {};
      const artifact = inspectLocalArtifact(root, {
        path: execution.artifactPath,
        bytes: execution.artifactBytes,
        sha256: execution.artifactSha256
      });
      const artifactBuilt =
        artifact.present &&
        artifact.bytesMatched &&
        artifact.sha256Matched;
      const nativeLifecycleVerified =
        execution.nativeInstallVerified === true &&
        execution.lifecycleVerified === true;
      const dependencyMetadataComplete =
        execution.dependencyMetadataComplete === true;
      return {
        verified: artifactBuilt,
        verificationLevel: nativeLifecycleVerified
          ? 'NATIVE_LIFECYCLE_VERIFIED'
          : artifactBuilt
            ? dependencyMetadataComplete
              ? 'ARTIFACT_SHA256_VERIFIED_LIFECYCLE_PENDING'
              : 'RECOVERED_ARTIFACT_SHA256_VERIFIED_DEPENDENCY_GAP'
            : 'REGISTERED_DEFAULT_DENY',
        artifactBuilt,
        qemuVerified: false,
        nativeLifecycleVerified,
        dependencyMetadataComplete,
        artifactSourceHead: execution.artifactSourceHead || null,
        artifact
      };
    }
  }),
  Object.freeze({
    id: 'LINUX_DEB_AMD64',
    titleAr: 'حزمة Linux amd64',
    path:
      'runtime/distribution/v6/' +
      'sheikha-linux-deb-native-lifecycle-v6-report.json',
    evaluate(data) {
      const nativeLifecycleVerified =
        data.nativeVerified === true &&
        data.healthVerified === true &&
        data.chatVerified === true &&
        data.cliVerified === true &&
        data.upgradeVerified === true &&
        data.rollbackVerified === true &&
        data.removeVerified === true &&
        data.purgeVerified === true;
      return {
        verified: nativeLifecycleVerified,
        verificationLevel: nativeLifecycleVerified
          ? 'NATIVE_LIFECYCLE_VERIFIED'
          : 'NATIVE_LIFECYCLE_PENDING',
        artifactBuilt: Object.keys(data.artifacts || {}).length > 0,
        qemuVerified: false,
        nativeLifecycleVerified
      };
    }
  }),
  Object.freeze({
    id: 'LOCAL_SITE_RUNTIME',
    titleAr: 'واجهات الموقع المحلية',
    path:
      'runtime/site-operations/v1/' +
      'sheikha-local-site-smoke-v1-report.json',
    evaluate(data) {
      const verified =
        data.passed === true &&
        data.status === 'LOCAL_SITE_SMOKE_PASSED';
      return {
        verified,
        verificationLevel: verified
          ? 'LOCAL_SITE_SMOKE_VERIFIED'
          : 'LOCAL_SITE_SMOKE_REQUIRED',
        artifactBuilt: false,
        qemuVerified: false,
        nativeLifecycleVerified: false,
        localRuntimeVerified: verified
      };
    }
  })
]);

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(
      Buffer.isBuffer(value)
        ? value
        : Buffer.from(String(value), 'utf8')
    )
    .digest('hex');
}

function isSha256(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function inspectLocalArtifact(root, artifact = {}) {
  const relativePath = String(artifact?.path || '').trim();
  const expectedSha256 = String(
    artifact?.sha256 || ''
  ).toLowerCase();
  const expectedBytes = Number(artifact?.bytes);
  const safeRelativePath =
    relativePath &&
    !path.isAbsolute(relativePath) &&
    !relativePath.split(/[\\/]+/u).includes('..');

  if (!safeRelativePath) {
    return {
      path: relativePath || null,
      safeRelativePath: false,
      present: false,
      bytes: null,
      sha256: null,
      bytesMatched: false,
      sha256Matched: false
    };
  }

  const absolutePath = path.join(root, relativePath);
  try {
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      throw new Error('ARTIFACT_NOT_A_REGULAR_FILE');
    }
    const actualSha256 = sha256(fs.readFileSync(absolutePath));
    return {
      path: relativePath,
      safeRelativePath: true,
      present: true,
      bytes: stat.size,
      sha256: actualSha256,
      bytesMatched:
        Number.isFinite(expectedBytes) &&
        expectedBytes >= 0 &&
        stat.size === expectedBytes,
      sha256Matched:
        isSha256(expectedSha256) &&
        actualSha256 === expectedSha256
    };
  } catch (error) {
    return {
      path: relativePath,
      safeRelativePath: true,
      present: false,
      bytes: null,
      sha256: null,
      bytesMatched: false,
      sha256Matched: false,
      error: error.code || error.message
    };
  }
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    ).join(',')}}`;
  }
  return JSON.stringify(value);
}

function readEvidence(root, source) {
  const absolutePath = path.join(root, source.path);
  try {
    const buffer = fs.readFileSync(absolutePath);
    const data = JSON.parse(buffer.toString('utf8'));
    return {
      id: source.id,
      titleAr: source.titleAr,
      path: source.path,
      exists: true,
      parsed: true,
      bytes: buffer.byteLength,
      sha256: sha256(buffer),
      ...source.evaluate(data, root)
    };
  } catch (error) {
    return {
      id: source.id,
      titleAr: source.titleAr,
      path: source.path,
      exists: fs.existsSync(absolutePath),
      parsed: false,
      bytes: null,
      sha256: null,
      verified: false,
      verificationLevel: 'EVIDENCE_UNAVAILABLE',
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      error: error.message
    };
  }
}

function inspectInternalEvidence(root = ROOT) {
  return EVIDENCE_SOURCES.map((source) =>
    readEvidence(root, source)
  );
}

function productionModelRegistry() {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_PRODUCTION_MODEL_REGISTRY_V1',
    status: 'ACTIVE',
    defaultModel: 'INTERNAL_MAXIMUM_CAPABILITY',
    count: PRODUCTION_MODELS.length,
    models: PRODUCTION_MODELS
  };
}

function systemFamilyRegistry() {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_SYSTEM_FAMILY_ADAPTER_REGISTRY_V1',
    status: 'ACTIVE_OPEN_ENDED_DEFAULT_DENY',
    count: SYSTEM_FAMILIES.length,
    unlistedAdapterPathAvailable: true,
    registrationDoesNotMeanImplementation: true,
    allSystemsIntegrated: false,
    allSystemsProductionReady: false,
    families: SYSTEM_FAMILIES
  };
}

function evaluateProductionChoice(input = {}) {
  const modelId = String(
    input.model || 'INTERNAL_MAXIMUM_CAPABILITY'
  ).trim().toUpperCase();
  const model = PRODUCTION_MODELS.find((item) => item.id === modelId);

  if (!model) {
    const error = new Error('UNKNOWN_PRODUCTION_MODEL');
    error.code = 'UNKNOWN_PRODUCTION_MODEL';
    throw error;
  }

  const external = EXTERNAL_MODEL_IDS.includes(model.id);
  const choice = input.customerChoice || {};
  const blockers = [];

  if (external) {
    if (choice.explicit !== true) {
      blockers.push('EXPLICIT_CUSTOMER_CHOICE_REQUIRED');
    }
    if (choice.informed !== true) {
      blockers.push('INFORMED_CUSTOMER_CHOICE_REQUIRED');
    }
    if (!String(choice.actorId || '').trim()) {
      blockers.push('ATTRIBUTABLE_CUSTOMER_ACTOR_REQUIRED');
    }
    if (!String(choice.contractVersion || '').trim()) {
      blockers.push('VERSIONED_CONTRACT_REQUIRED');
    }
    if (input.rightsAndLicensesVerified !== true) {
      blockers.push('RIGHTS_AND_LICENSES_VERIFICATION_REQUIRED');
    }
    if (input.providerIdentityVerified !== true) {
      blockers.push('PROVIDER_AND_ENVIRONMENT_IDENTITY_REQUIRED');
    }
    if (input.securityPrivacySupplyChainVerified !== true) {
      blockers.push(
        'SECURITY_PRIVACY_AND_SUPPLY_CHAIN_REVIEW_REQUIRED'
      );
    }
    if (input.exitAndRollbackPlanVerified !== true) {
      blockers.push('EXIT_AND_ROLLBACK_PLAN_REQUIRED');
    }
    if (input.humanApproved !== true) {
      blockers.push('HUMAN_APPROVAL_REQUIRED');
    }
  }

  const expectedGovernanceContractSha256 = sha256(
    canonicalJson(GOVERNANCE_CONTRACT)
  );
  let sourceArtifactSha256 = null;
  let targetArtifactSha256 = null;
  let artifactIdentityMatched = false;
  let governanceContractIdentityMatched = false;

  if (input.promotionRequested === true) {
    sourceArtifactSha256 = String(
      input.sourceArtifactSha256 || ''
    ).toLowerCase();
    targetArtifactSha256 = String(
      input.targetArtifactSha256 || ''
    ).toLowerCase();

    if (!isSha256(sourceArtifactSha256)) {
      blockers.push('SOURCE_ARTIFACT_SHA256_REQUIRED');
    }
    if (!isSha256(targetArtifactSha256)) {
      blockers.push('TARGET_ARTIFACT_SHA256_REQUIRED');
    }
    if (
      isSha256(sourceArtifactSha256) &&
      isSha256(targetArtifactSha256)
    ) {
      artifactIdentityMatched =
        sourceArtifactSha256 === targetArtifactSha256;
      if (!artifactIdentityMatched) {
        blockers.push('ARTIFACT_DIGEST_MISMATCH');
      }
    }
    if (!isSha256(input.governanceContractSha256)) {
      blockers.push('GOVERNANCE_CONTRACT_SHA256_REQUIRED');
    } else {
      governanceContractIdentityMatched =
        String(input.governanceContractSha256).toLowerCase() ===
        expectedGovernanceContractSha256;
      if (!governanceContractIdentityMatched) {
        blockers.push('GOVERNANCE_CONTRACT_DIGEST_MISMATCH');
      }
    }
    if (input.sbomVerified !== true) {
      blockers.push('SBOM_VERIFICATION_REQUIRED');
    }
    if (input.provenanceVerified !== true) {
      blockers.push('PROVENANCE_VERIFICATION_REQUIRED');
    }
    if (
      input.targetSigningRequired === true &&
      input.signatureVerified !== true
    ) {
      blockers.push('TARGET_SIGNATURE_VERIFICATION_REQUIRED');
    }
  }

  return {
    system: SYSTEM,
    operation: 'READ_ONLY_PRODUCTION_CHOICE_EVALUATION',
    model,
    externalLaneRequested: external,
    eligibleForSeparateExecutionAuthorization:
      blockers.length === 0,
    executionAuthorized: false,
    deploymentExecuted: false,
    networkUsed: false,
    releaseIdentityEvaluation: {
      promotionRequested: input.promotionRequested === true,
      sourceArtifactSha256,
      targetArtifactSha256,
      artifactIdentityMatched,
      expectedGovernanceContractSha256,
      governanceContractIdentityMatched
    },
    blockers,
    nextAction: blockers.length === 0
      ? 'SEPARATE_HUMAN_REVIEWED_EXECUTION_AUTHORIZATION_REQUIRED'
      : 'RESOLVE_BLOCKERS_AND_REEVALUATE'
  };
}

function status(root = ROOT) {
  const internalEvidence = inspectInternalEvidence(root);
  const parsedEvidenceCount =
    internalEvidence.filter((item) => item.parsed).length;
  const verifiedEvidenceCount =
    internalEvidence.filter((item) => item.verified).length;
  const qemuVerifiedCount =
    internalEvidence.filter((item) => item.qemuVerified).length;
  const nativeLifecycleVerifiedCount =
    internalEvidence.filter(
      (item) => item.nativeLifecycleVerified
    ).length;
  const staleEvidenceClaimCount =
    internalEvidence.filter(
      (item) => item.staleEvidenceClaim === true
    ).length;
  const contractSha256 = sha256(canonicalJson(GOVERNANCE_CONTRACT));
  const modelRegistry = productionModelRegistry();
  const systemRegistry = systemFamilyRegistry();

  const checks = {
    evidenceInputsParsed:
      parsedEvidenceCount === internalEvidence.length,
    boundedInternalEvidencePresent: verifiedEvidenceCount > 0,
    oneDefaultModel:
      PRODUCTION_MODELS.filter((item) => item.default).length === 1,
    internalMaximumIsDefault:
      modelRegistry.defaultModel === 'INTERNAL_MAXIMUM_CAPABILITY',
    externalModelsDefaultDeny:
      PRODUCTION_MODELS
        .filter((item) => item.externalComponents)
        .every((item) => item.activation === 'REGISTERED_DEFAULT_DENY'),
    unlistedAdapterPathAvailable:
      systemRegistry.unlistedAdapterPathAvailable === true,
    registrationIsNotImplementation:
      systemRegistry.registrationDoesNotMeanImplementation === true,
    sameArtifactDigestRequired:
      GOVERNANCE_CONTRACT.releaseIdentityPolicy
        .sameArtifactDigestRequiredAcrossLanes === true,
    explicitCustomerChoiceRequired:
      GOVERNANCE_CONTRACT.externalLanePolicy
        .explicitInformedCustomerChoiceRequired === true,
    externalNetworkDefaultDeny:
      GOVERNANCE_CONTRACT.externalLanePolicy
        .externalNetworkDefault === 'DENY',
    automatedFatwaDenied:
      GOVERNANCE_CONTRACT.islamicGovernance
        .automatedFatwaAllowed === false,
    executionBoundaryReadOnly:
      GOVERNANCE_CONTRACT.executionBoundary.executesBuilds === false &&
      GOVERNANCE_CONTRACT.executionBoundary.performsDeployment === false &&
      GOVERNANCE_CONTRACT.executionBoundary.mutatesProduction === false
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const passed = failedChecks.length === 0;

  return {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    status: passed
      ? 'ACTIVE_BOUNDED_INTERNAL_EXTERNAL_DEFAULT_DENY'
      : 'FAIL_CLOSED',
    passed,
    defaultProductionModel: modelRegistry.defaultModel,
    internalLane: {
      status: verifiedEvidenceCount > 0
        ? 'ACTIVE_WITH_BOUNDED_VERIFIED_CAPABILITIES'
        : 'BLOCKED_NO_VERIFIED_CAPABILITY',
      evidenceCount: internalEvidence.length,
      parsedEvidenceCount,
      verifiedEvidenceCount,
      qemuVerifiedCount,
      nativeLifecycleVerifiedCount,
      staleEvidenceClaimCount,
      capabilities: internalEvidence
    },
    externalLane: {
      status: 'REGISTERED_DEFAULT_DENY',
      productionReadyAdapterCount: 0,
      customerChoiceRequired: true,
      humanApprovalRequired: true,
      networkUsed: false,
      deploymentExecuted: false
    },
    releaseIdentity: {
      strategy:
        GOVERNANCE_CONTRACT.releaseIdentityPolicy.strategy,
      governanceContractSha256: contractSha256,
      sameArtifactDigestRequired: true,
      signingExecuted: false
    },
    coverage: {
      productionModelCount: PRODUCTION_MODELS.length,
      systemFamilyCount: SYSTEM_FAMILIES.length,
      verifiedInternalCapabilityCount: verifiedEvidenceCount,
      staleEvidenceClaimCount,
      externalProductionReadyAdapterCount: 0
    },
    checks,
    failedChecks,
    truthBoundaries: {
      fabricActiveDoesNotMeanAllSystemsIntegrated: true,
      registrationDoesNotMeanImplementation: true,
      localEvidenceDoesNotMeanUniversalHardwareSupport: true,
      staleReportDoesNotCountWithoutCurrentArtifact: true,
      internalAuthorizationIsNotExternalLicense: true,
      sheikhaOwnsAllExternalSystems: false,
      externalProductionExecuted: false,
      customerContractExecuted: false,
      externalProviderContractExecuted: false,
      automatedFatwa: false,
      qualifiedHumanReviewForReligiousJudgments: true
    },
    surfaces: {
      status: '/api/sheikha/production-federation/v1/status',
      models: '/api/sheikha/production-federation/v1/models',
      systems: '/api/sheikha/production-federation/v1/systems',
      evidence: '/api/sheikha/production-federation/v1/evidence',
      evaluate: '/api/sheikha/production-federation/v1/evaluate'
    }
  };
}

function buildActivationArtifacts(root = ROOT) {
  const report = {
    ...status(root),
    generatedAt: new Date().toISOString(),
    output: FILES
  };

  return {
    contract: GOVERNANCE_CONTRACT,
    modelRegistry: productionModelRegistry(),
    systemRegistry: systemFamilyRegistry(),
    report
  };
}

function writeJson(relativePath, value, root = ROOT) {
  const outputPath = path.join(root, relativePath);
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(value, null, 2)}\n`,
    { encoding: 'utf8', mode: 0o640 }
  );
  fs.renameSync(temporaryPath, outputPath);
  return outputPath;
}

module.exports = Object.freeze({
  SYSTEM,
  ROOT,
  FILES,
  PRODUCTION_MODELS,
  SYSTEM_FAMILIES,
  GOVERNANCE_CONTRACT,
  EVIDENCE_SOURCES,
  canonicalJson,
  inspectInternalEvidence,
  productionModelRegistry,
  systemFamilyRegistry,
  evaluateProductionChoice,
  status,
  buildActivationArtifacts,
  writeJson
});
