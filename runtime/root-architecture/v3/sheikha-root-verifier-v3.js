'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM = 'SHEIKHA_ROOT_VERIFIER_V3';
const OUTPUT_PATH =
  'runtime/root-architecture/v3/' +
  'sheikha-root-evidence-truth-matrix-v3.json';

const REQUIRED_PATHS = Object.freeze([
  'runtime/root-architecture/v3/sheikha-root-architecture-v3.json',
  'runtime/root-architecture/v3/sheikha-root-capability-graph-v3.json',
  'sheikha-language/system/sheikha-foundation-root-v2.shk',
  'runtime/sheikha-language-foundation/v2/sheikha-language-foundation-root-v2.js',
  'runtime/gardens-and-trees/v3/sheikha-gardens-and-trees-v3.json',
  'runtime/system-builder/root/v1/sheikha-system-builder-root-v1.json',
  'runtime/reasoning-governance/v2/sheikha-logical-reasoning-governance-v2.js',
  'runtime/islamic-reference-governance/v1/sheikha-quran-sunnah-reference-policy-v1.json',
  'runtime/uefi-capability-registry/v2/sheikha-uefi-capability-registry-v2.json',
  'runtime/site-unification/v2/sheikha-site-unification-v2.json',
  'core/sheikha-logic/sheikha-logic-governance-engine-v1.js',
  'core/product-runtime/sheikha-unified-product-runtime-v1.js',
  'core/production-qualification/sheikha-producer-production-qualification-v1.js',
  'runtime/producer-production-qualification/v1/contracts/' +
    'sheikha-producer-production-qualification-v1-contract.json',
  'core/production-federation/sheikha-governed-production-federation-v1.js',
  'runtime/production-federation/v1/contracts/' +
    'sheikha-governed-production-federation-v1-contract.json',
  'core/intelligence-apex/sheikha-intelligence-capability-apex-v1.js',
  'runtime/intelligence-capability-apex/v1/contracts/' +
    'sheikha-intelligence-capability-apex-v1-contract.json',
  'runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-capability-registry-v1.json',
  'core/site-registry/sheikha-site-registry-v2.js'
]);

const EVIDENCE_SOURCES = Object.freeze([
  Object.freeze({
    id: 'SHEIKHA_LANGUAGE_FOUNDATION_ROOT',
    titleAr: 'جذر لغة شيخة البرمجية',
    path:
      'runtime/sheikha-language-foundation/v2/' +
      'sheikha-language-foundation-root-v2-report.json'
  }),
  Object.freeze({
    id: 'BARE_METAL_X86_64_PHASE2B',
    titleAr: 'النواة والإقلاع x86_64',
    path:
      'runtime/bare-metal/v2/' +
      'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json'
  }),
  Object.freeze({
    id: 'UEFI_FOUNDATION',
    titleAr: 'تكامل UEFI',
    path:
      'runtime/bare-metal/v2/uefi-integration/v1/' +
      'sheikha-uefi-integration-v1-report.json'
  }),
  Object.freeze({
    id: 'PHYSICAL_BOOT_TRIAL',
    titleAr: 'تجربة الإقلاع الفيزيائي',
    path:
      'runtime/bare-metal/v2/physical-trial/v1/' +
      'sheikha-v2-physical-boot-trial-v1-report.json'
  }),
  Object.freeze({
    id: 'SYSTEM_BUILDER_FABRIC',
    titleAr: 'منظومة بناء الأنظمة',
    path:
      'runtime/system-builder-fabric/v1/' +
      'sheikha-system-builder-fabric-v1.json'
  }),
  Object.freeze({
    id: 'LINUX_DEB_AMD64',
    titleAr: 'حزمة Linux DEB',
    path:
      'runtime/distribution/v6/' +
      'sheikha-linux-deb-native-lifecycle-v6-report.json'
  }),
  Object.freeze({
    id: 'VSCODE_EXTENSION',
    titleAr: 'إضافة VS Code',
    path:
      'runtime/extension-experience-apex/v1/' +
      'sheikha-vscode-extension-experience-apex-v1-report.json'
  }),
  Object.freeze({
    id: 'GARDENS_KNOWLEDGE_DIALOGUE',
    titleAr: 'المعرفة والحوار البنّاء',
    path:
      'runtime/jannat-gardens/v2/' +
      'sheikha-gardens-knowledge-dialogue-v2-report.json'
  }),
  Object.freeze({
    id: 'PRODUCER_PRODUCTION_QUALIFICATION',
    titleAr: 'تأهيل المنتجين وجاهزية الإنتاج',
    path:
      'runtime/producer-production-qualification/v1/' +
      'sheikha-producer-production-qualification-v1-report.json'
  }),
  Object.freeze({
    id: 'GOVERNED_PRODUCTION_FEDERATION',
    titleAr: 'اتحاد الإنتاج الداخلي والخارجي المحكوم',
    path:
      'runtime/production-federation/v1/' +
      'sheikha-governed-production-federation-v1-report.json'
  }),
  Object.freeze({
    id: 'INTELLIGENCE_CAPABILITY_APEX',
    titleAr: 'قمة شيخة للقدرات الذكية',
    path:
      'runtime/intelligence-capability-apex/v1/' +
      'sheikha-intelligence-capability-apex-v1-report.json'
  })
]);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readGitHead(root) {
  try {
    const gitPath = path.join(root, '.git');
    const headPath = path.join(gitPath, 'HEAD');
    const head = fs.readFileSync(headPath, 'utf8').trim();
    if (!head.startsWith('ref: ')) return head || null;

    const reference = head.slice(5);
    const looseReferencePath = path.join(gitPath, reference);
    if (fs.existsSync(looseReferencePath)) {
      return fs.readFileSync(looseReferencePath, 'utf8').trim() || null;
    }

    const packedReferences = fs.readFileSync(
      path.join(gitPath, 'packed-refs'),
      'utf8'
    );
    const match = packedReferences
      .split('\n')
      .find((line) => line.endsWith(` ${reference}`));
    return match ? match.split(' ')[0] : null;
  } catch {
    return null;
  }
}

function readEvidence(root, source) {
  const absolutePath = path.join(root, source.path);
  try {
    const buffer = fs.readFileSync(absolutePath);
    return {
      ...source,
      exists: true,
      parsed: true,
      bytes: buffer.byteLength,
      sha256: sha256(buffer),
      data: JSON.parse(buffer.toString('utf8')),
      error: null
    };
  } catch (error) {
    return {
      ...source,
      exists: fs.existsSync(absolutePath),
      parsed: false,
      bytes: null,
      sha256: null,
      data: null,
      error: error.message
    };
  }
}

function evidenceMetadata(evidence) {
  return {
    path: evidence.path,
    exists: evidence.exists,
    parsed: evidence.parsed,
    bytes: evidence.bytes,
    sha256: evidence.sha256,
    generatedAt: evidence.data?.generatedAt || null
  };
}

function unavailableDomain(evidence) {
  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: null,
    verificationLevel: 'EVIDENCE_UNAVAILABLE',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: false,
      sourcePresent: evidence.exists,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      physicalHardwareVerified: false,
      externallyCertified: false
    },
    limitations: [{
      code: 'EVIDENCE_UNAVAILABLE',
      messageAr: 'ملف الدليل مفقود أو غير صالح للقراءة.'
    }],
    nextGateAr: 'إصلاح ملف الدليل وإعادة التحقق قبل أي ادعاء.'
  };
}

function evaluateLanguageFoundation(evidence) {
  const data = evidence.data;
  const compilation = data.compilation || {};
  const nativeBinding = data.nativeStack?.languageBinding || {};
  const hostedVerified =
    data.passed === true &&
    compilation.typeCheckPassed === true &&
    compilation.vmStatus === 'passed' &&
    Number(compilation.governanceViolations || 0) === 0;
  const bytecodeBuilt =
    hostedVerified &&
    /^[a-f0-9]{64}$/.test(data.identity?.bytecodeSha256 || '');

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: hostedVerified
      ? 'HOST_BOOTSTRAPPED_LANGUAGE_FOUNDATION_VERIFIED'
      : 'LANGUAGE_FOUNDATION_VERIFICATION_FAILED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: bytecodeBuilt,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      localGeneratedEvidenceVerified: hostedVerified,
      physicalHardwareVerified: false,
      externallyCertified: false,
      projectFirstPartyFoundation:
        data.identity?.projectFirstPartyFoundation === true,
      compilerSelfHosted:
        compilation.selfHostedCompilerVerified === true,
      nativeMachineCodeBackend:
        compilation.nativeMachineCodeBackendVerified === true,
      nativeBootContractIdentityVerified:
        nativeBinding.contractIdentityEmbeddedInNativeArtifact === true,
      sourceFingerprintEmbedded:
        nativeBinding
          .sheikhaSourceFingerprintEmbeddedInNativeArtifact === true,
      bytecodeExecutedInsideKernel:
        nativeBinding.bytecodeExecutedInsideKernel === true,
      aiCapabilityRootCount:
        Number(data.aiCapabilityRoots?.count || 0),
      externalSystemsAreTools:
        data.systemToolAdapters?.policy ===
        'EXTERNAL_SYSTEMS_ARE_TOOLS_NOT_FOUNDATIONS',
      universalAiFoundationClaimed:
        data.identity?.globalUniversalAiFoundationClaimed === true
    },
    limitations: [
      {
        code: 'SELF_HOSTED_COMPILER_PENDING',
        messageAr:
          'المترجم الحالي مستضاف على Node.js ولم يتحقق مترجم شيخة ذاتي الاستضافة.'
      },
      {
        code: 'NATIVE_MACHINE_CODE_BACKEND_PENDING',
        messageAr:
          'الـBytecode والـVM متحققان، أما Backend أصلي للآلة فما زال مطلوبًا.'
      },
      {
        code: 'NATIVE_SOURCE_FINGERPRINT_PENDING',
        messageAr:
          'هوية عقد اللغة ظاهرة في QEMU، لكن بصمة مصدر شيخة غير مضمّنة في EFI.'
      }
    ],
    nextGateAr:
      'بناء مترجم ذاتي وBackend أصلي ثم تضمين بصمة المصدر وتشغيلها داخل النواة.'
  };
}

function evaluateBareMetal(evidence) {
  const data = evidence.data;
  const artifactBuilt =
    data.bootArtifactCreated === true &&
    data.bootImageCreated === true &&
    Boolean(data.artifact?.efi?.sha256) &&
    Boolean(data.artifact?.image?.sha256);
  const qemuVerified =
    data.phase2bVerified === true &&
    data.qemuBootExecuted === true &&
    data.cr3LoadedAtRuntime === true &&
    data.tlbInvalidationExecutedAtRuntime === true;

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: qemuVerified
      ? 'QEMU_RUNTIME_VERIFIED_SUBSET'
      : artifactBuilt
        ? 'ARTIFACT_BUILT'
        : 'SOURCE_PRESENT',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt,
      qemuVerified,
      nativeLifecycleVerified: false,
      physicalHardwareVerified: data.physicalHardwareVerified === true,
      secureBootVerified: data.secureBootVerified === true,
      generalPurposeOsComplete:
        data.generalPurposeOperatingSystemComplete === true,
      allDriversComplete: data.allDriversComplete === true,
      externallyCertified: false
    },
    limitations: [
      {
        code: 'PHYSICAL_BOOT_PENDING',
        messageAr: 'التحقق الحالي داخل QEMU وليس إقلاعًا على جهاز فعلي.'
      },
      {
        code: 'SECURE_BOOT_PENDING',
        messageAr: 'Secure Boot غير متحقق في هذا الدليل.'
      },
      {
        code: 'GENERAL_PURPOSE_OS_INCOMPLETE',
        messageAr: 'الدليل يثبت نطاق Phase 2B ولا يثبت نظام تشغيل عام مكتمل.'
      }
    ],
    nextGateAr:
      'تجربة وسائط قابلة للإزالة على جهاز معتمد ثم توثيق Secure Boot.'
  };
}

function evaluateUefi(evidence) {
  const data = evidence.data;
  const coverage = data.coverage || {};
  const verifiedSubsets =
    Number(coverage.qemuVerifiedSubsets || 0) +
    Number(coverage.sourceVerifiedSubsets || 0);

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: verifiedSubsets > 0
      ? 'FOUNDATION_SUBSETS_VERIFIED'
      : 'REGISTERED_DEFAULT_DENY',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: Number(coverage.total || 0) > 0,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: Number(coverage.qemuVerifiedSubsets || 0) > 0,
      nativeLifecycleVerified: false,
      physicalHardwareVerified: false,
      externallyCertified: false,
      registeredCapabilityCount: Number(coverage.total || 0),
      fullyImplementedCapabilityCount:
        Number(coverage.fullyImplemented || 0),
      verifiedSubsetCount: verifiedSubsets,
      defaultDenyCapabilityCount: Number(coverage.defaultDeny || 0)
    },
    limitations: [{
      code: 'UEFI_FULL_IMPLEMENTATION_NOT_VERIFIED',
      messageAr:
        'تسجيل قدرات UEFI لا يعني تنفيذها؛ التنفيذ الكامل ما زال صفرًا.'
    }],
    nextGateAr:
      'تنفيذ كل مجموعة بروتوكولات مع مصدر واختبار وأثر تشغيل مستقل.'
  };
}

function evaluatePhysicalBoot(evidence) {
  const data = evidence.data;
  const physicalVerified =
    data.physicalBootExecuted === true &&
    data.physicalBootVerified === true;

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: physicalVerified
      ? 'PHYSICAL_BOOT_VERIFIED'
      : data.trialKitPrepared === true
        ? 'TRIAL_KIT_READY_PHYSICAL_PENDING'
        : 'TRIAL_KIT_PENDING',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: data.trialKitPrepared === true,
      qemuVerified: data.qemuBootVerified === true,
      nativeLifecycleVerified: false,
      physicalHardwareVerified: physicalVerified,
      removableMediaAttached: data.removableMediaAttached === true,
      targetDeviceSelected: Boolean(data.targetDeviceSelected),
      externallyCertified: false
    },
    limitations: physicalVerified ? [] : [{
      code: 'REMOVABLE_MEDIA_AND_PHYSICAL_BOOT_PENDING',
      messageAr:
        'لم تُحدد وسائط قابلة للإزالة ولم يُنفذ إقلاع فيزيائي موثق.'
    }],
    nextGateAr:
      'اختيار وسيط تجريبي صريح بموافقة بشرية ثم تنفيذ اختبار غير مدمر.'
  };
}

function evaluateSystemBuilder(evidence, currentHead) {
  const data = evidence.data;
  const execution = data.activeExecution || {};
  const artifactBuilt =
    /^[a-f0-9]{64}$/.test(execution.artifactSha256 || '') &&
    (
      /^BUILT_/.test(execution.status || '') ||
      (
        execution.artifactPresent === true &&
        execution.artifactVerificationStatus === 'SHA256_VERIFIED'
      )
    );
  const nativeLifecycleVerified =
    execution.nativeInstallVerified === true &&
    execution.lifecycleVerified === true;
  const provenanceStale = Boolean(
    currentHead &&
    data.sourceHead &&
    currentHead !== data.sourceHead
  );

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: nativeLifecycleVerified
      ? 'NATIVE_LIFECYCLE_VERIFIED'
      : artifactBuilt
        ? 'ARTIFACT_BUILT_NATIVE_LIFECYCLE_PENDING'
        : 'REGISTERED_DEFAULT_DENY',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt,
      qemuVerified: false,
      nativeLifecycleVerified,
      physicalHardwareVerified: false,
      externallyCertified: false,
      activeProfile: data.activeProfile || null,
      recordedSourceHead: data.sourceHead || null,
      recordedSourceHeadMatchesCurrent: !provenanceStale,
      artifactSourceHead: execution.artifactSourceHead || null,
      artifactPresent: execution.artifactPresent === true,
      dependencyMetadataComplete:
        execution.dependencyMetadataComplete === true,
      defaultAuthorization:
        data.governance?.defaultAuthorization || null
    },
    limitations: [
      ...(
        nativeLifecycleVerified
          ? []
          : [{
            code: 'RPM_NATIVE_LIFECYCLE_PENDING',
            messageAr:
              execution.dependencyMetadataComplete === false
                ? 'أثر RPM مستعاد ومثبت البصمة، لكن بيانات الاعتماديات ' +
                  'تحتاج بناءً مصححًا بعقد جديد قبل دورة الحياة.'
                : 'أثر البناء موجود، لكن التثبيت ودورة الحياة الأصلية غير متحققين.'
          }]
      ),
      ...(
        provenanceStale
          ? [{
            code: 'RECORDED_SOURCE_HEAD_DIFFERS',
            messageAr:
              'مرجع المصدر في سجل البناء أقدم من HEAD الحالي ويحتاج تجديدًا.'
          }]
          : []
      )
    ],
    nextGateAr:
      'إكمال دورة Fedora الأصلية ثم تجديد مرجع المصدر دون تعديل التاريخ.'
  };
}

function evaluateLinuxDeb(evidence) {
  const data = evidence.data;
  const nativeLifecycleVerified =
    data.nativeVerified === true &&
    data.baselineInstalled === true &&
    data.baselineLaunched === true &&
    data.healthVerified === true &&
    data.chatVerified === true &&
    data.cliVerified === true &&
    data.cleanShutdownVerified === true &&
    data.upgradeVerified === true &&
    data.rollbackVerified === true &&
    data.removeVerified === true &&
    data.purgeVerified === true;
  const artifacts = Object.values(data.artifacts || {});
  const artifactBuilt =
    artifacts.length > 0 &&
    artifacts.every((artifact) =>
      /^[a-f0-9]{64}$/.test(artifact.sha256 || '')
    );

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: nativeLifecycleVerified
      ? 'NATIVE_LIFECYCLE_VERIFIED'
      : artifactBuilt
        ? 'ARTIFACT_BUILT'
        : 'SOURCE_PRESENT',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt,
      qemuVerified: false,
      nativeLifecycleVerified,
      physicalHardwareVerified: false,
      externallyCertified: false,
      healthVerified: data.healthVerified === true,
      chatVerified: data.chatVerified === true,
      cliVerified: data.cliVerified === true,
      upgradeVerified: data.upgradeVerified === true,
      rollbackVerified: data.rollbackVerified === true,
      removeVerified: data.removeVerified === true,
      purgeVerified: data.purgeVerified === true,
      externalNetworkUsed: data.externalNetworkUsed === true,
      signingUsed: data.signingUsed === true
    },
    limitations: [{
      code: 'PLATFORM_SCOPE_LINUX_AMD64_ONLY',
      messageAr:
        'دورة الحياة الأصلية المثبتة تخص Linux amd64 ولا تعمم على بقية المنصات.'
    }],
    nextGateAr:
      'إنتاج أدلة أصلية مستقلة لكل معمارية ونظام مستهدف.'
  };
}

function evaluateExtension(evidence) {
  const data = evidence.data;
  const verification = data.verification || {};
  const liveVerified =
    verification.liveExtensionHostSmokePassed === true &&
    verification.chatInteractionSmokeVerified === true &&
    verification.inspectorInteractionSmokeVerified === true &&
    verification.loadedVersionVerified === true;
  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: liveVerified
      ? 'LIVE_EXTENSION_HOST_INTERACTION_VERIFIED'
      : 'DECLARED_ACTIVE_REPORT_LIVE_SMOKE_REQUIRED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      physicalHardwareVerified: false,
      externallyCertified: false,
      declaredActive: data.status === 'ACTIVE',
      liveInstalledVersionVerified:
        verification.loadedVersionVerified === true,
      liveLoadedVersionVerified:
        verification.loadedVersionVerified === true,
      chatInteractionSmokeVerified:
        verification.chatInteractionSmokeVerified === true,
      inspectorInteractionSmokeVerified:
        verification.inspectorInteractionSmokeVerified === true,
      extensionVersion: data.extensionVersion || null,
      noUnboundedAutonomy:
        data.boundaries?.noUnboundedAutonomy === true,
      humanApprovalForHighImpact:
        data.boundaries?.humanApprovalForHighImpactActions === true
    },
    limitations: liveVerified ? [] : [{
      code: 'LIVE_EXTENSION_SMOKE_REQUIRED',
      messageAr:
        'التقرير يعلن التفعيل ولا يثبت جلسة VS Code حية للإرسال والفاحص.'
    }],
    nextGateAr:
      'تشغيل اختبار تفاعل حي للإرسال والرد والفاحص وتسجيل إصدار الإضافة.'
  };
}

function evaluateGardens(evidence) {
  const data = evidence.data;
  const locallyVerified =
    data.passed === true &&
    Array.isArray(data.failedChecks) &&
    data.failedChecks.length === 0;

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: locallyVerified
      ? 'LOCAL_GENERATED_EVIDENCE_VERIFIED'
      : 'LOCAL_VERIFICATION_FAILED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      localGeneratedEvidenceVerified: locallyVerified,
      physicalHardwareVerified: false,
      externallyCertified: false,
      physicalGardenCreated: false,
      automatedFatwa: false
    },
    limitations: [{
      code: 'DIGITAL_KNOWLEDGE_SCOPE_ONLY',
      messageAr:
        'التحقق يخص المعرفة والواجهات الرقمية ولا يثبت إنشاء حديقة مادية.'
    }],
    nextGateAr:
      'إبقاء الادعاء رقميًا وربط أي تنفيذ مادي بدليل موقع ومختصين.'
  };
}

function evaluateProductionQualification(evidence) {
  const data = evidence.data;
  const coverage = data.coverage || {};
  const policy = data.authorizationPolicy || {};
  const boundaries = data.truthBoundaries || {};
  const runtime = data.runtimeEvidence || {};
  const locallyVerified =
    data.passed === true &&
    data.status === 'ACTIVE_INTERNAL_QUALIFICATION_GATE' &&
    Array.isArray(data.failedChecks) &&
    data.failedChecks.length === 0;
  const productionReadyProducts =
    Number(coverage.productionReadyProducts || 0);
  const externalCertificates =
    Number(coverage.externallyIssuedCertificates || 0);
  const physicalTargets =
    Number(coverage.physicallyVerifiedHardwareTargets || 0);
  const limitations = [];

  if (productionReadyProducts === 0) {
    limitations.push({
      code: 'NO_PRODUCT_INTERNALLY_AUTHORIZED_FOR_PRODUCTION',
      messageAr:
        'بوابة التأهيل فعالة، لكن لا يوجد ملف منتج مفوض للإنتاج بعد.'
    });
  }
  const productionRuntimeReady =
    ['READY', 'PASSED'].includes(runtime.productionGateStatus);
  if (!productionRuntimeReady) {
    limitations.push({
      code: 'PRODUCTION_RUNTIME_GATE_NOT_READY',
      messageAr:
        'بوابة جاهزية التشغيل العامة ليست في حالة READY.'
    });
  }
  if (externalCertificates === 0) {
    limitations.push({
      code: 'NO_EXTERNAL_CERTIFICATE_ISSUER_EVIDENCE',
      messageAr:
        'لا توجد شهادة خارجية مسجلة من جهة مختصة، ولا تدعي شيخة إصدارها.'
    });
  }

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: locallyVerified
      ? 'INTERNAL_QUALIFICATION_GATE_ACTIVE'
      : 'INTERNAL_QUALIFICATION_GATE_REVIEW_REQUIRED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      localGeneratedEvidenceVerified: locallyVerified,
      physicalHardwareVerified: physicalTargets > 0,
      externallyCertified: externalCertificates > 0,
      registeredProductCount:
        Number(coverage.registeredProducts || 0),
      registeredRequirementCount:
        Number(coverage.productionFileRequirements || 0),
      producerApplicationCount:
        Number(coverage.producerApplications || 0),
      activeInternalAuthorizationCount:
        Number(coverage.activeInternalAuthorizations || 0),
      productionReadyProductCount: productionReadyProducts,
      productionRuntimeGateReady: productionRuntimeReady,
      externalCertificateCount: externalCertificates,
      physicalHardwareTargetCount: physicalTargets,
      internalAuthorizationAvailable:
        policy.internalProductionAuthorizationAvailable === true,
      governmentLicenseIssuanceAvailable:
        policy.officialGovernmentLicenseIssuanceAvailable === true,
      internalAuthorizationIsNotGovernmentLicense:
        boundaries.internalAuthorizationIsNotGovernmentLicense === true,
      allProductsProductionReadyObserved:
        boundaries.allProductsProductionReadyObserved === true,
      allProductsProductionReadyClaimed:
        boundaries.allProductsProductionReadyClaimed === true,
      candidateSensitiveScoringPerformed:
        data.candidatePolicy?.sensitiveTraitInference !== false,
      aiFinalAuthorizationAvailable:
        data.aiPolicy?.mayIssueFinalAuthorization === true
    },
    limitations,
    nextGateAr:
      'إيداع ملف منتج وإصدار، مراجعة أدلته بشريًا، ثم إصدار تفويض داخلي محدود.'
  };
}

function evaluateProductionFederation(evidence) {
  const data = evidence.data;
  const internal = data.internalLane || {};
  const external = data.externalLane || {};
  const coverage = data.coverage || {};
  const boundaries = data.truthBoundaries || {};
  const active =
    data.passed === true &&
    data.status ===
      'ACTIVE_BOUNDED_INTERNAL_EXTERNAL_DEFAULT_DENY' &&
    internal.verifiedEvidenceCount > 0 &&
    external.status === 'REGISTERED_DEFAULT_DENY' &&
    external.networkUsed === false &&
    external.deploymentExecuted === false;
  const limitations = [];

  if (Number(coverage.externalProductionReadyAdapterCount || 0) === 0) {
    limitations.push({
      code: 'EXTERNAL_PRODUCTION_ADAPTERS_DEFAULT_DENY',
      messageAr:
        'العائلات الخارجية مسجلة، لكن لا يوجد محول خارجي مفوض للإنتاج.'
    });
  }
  if (data.releaseIdentity?.signingExecuted !== true) {
    limitations.push({
      code: 'RELEASE_SIGNING_NOT_EXECUTED',
      messageAr:
        'سياسة ثبات القطعة فعالة، أما التوقيع فلا يُدعى دون دليل مستقل.'
    });
  }
  if (boundaries.customerContractExecuted !== true) {
    limitations.push({
      code: 'CUSTOMER_EXTERNAL_CONTRACT_NOT_EXECUTED',
      messageAr:
        'لم ينفذ عقد عميل لمسار خارجي، ولذلك يبقى المسار ممنوعًا.'
    });
  }

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: active
      ? 'GOVERNED_DUAL_LANE_POLICY_AND_LOCAL_EVIDENCE_VERIFIED'
      : 'PRODUCTION_FEDERATION_REVIEW_REQUIRED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      localGeneratedEvidenceVerified: active,
      physicalHardwareVerified: false,
      externallyCertified: false,
      defaultInternalModel:
        data.defaultProductionModel ===
        'INTERNAL_MAXIMUM_CAPABILITY',
      verifiedInternalCapabilityCount:
        Number(coverage.verifiedInternalCapabilityCount || 0),
      externalProductionReadyAdapterCount:
        Number(coverage.externalProductionReadyAdapterCount || 0),
      externalLaneDefaultDeny:
        external.status === 'REGISTERED_DEFAULT_DENY',
      customerChoiceRequired:
        external.customerChoiceRequired === true,
      humanApprovalRequired:
        external.humanApprovalRequired === true,
      sameArtifactDigestRequired:
        data.releaseIdentity?.sameArtifactDigestRequired === true,
      externalNetworkUsed: external.networkUsed === true,
      externalDeploymentExecuted:
        external.deploymentExecuted === true,
      allSystemsIntegrated:
        boundaries.fabricActiveDoesNotMeanAllSystemsIntegrated === false,
      automatedFatwa: boundaries.automatedFatwa === true
    },
    limitations,
    nextGateAr:
      'تنفيذ محول محدد بعقد عميل وحقوق واختبارات ثم تفويض بشري مستقل.'
  };
}

function evaluateIntelligenceApex(evidence) {
  const data = evidence.data;
  const coverage = data.coverage || {};
  const benchmark = data.benchmark || {};
  const boundaries = data.truthBoundaries || {};
  const localRouterVerified =
    data.passed === true &&
    data.status === 'ACTIVE_LOCAL_MULTI_MODEL_CAPABILITY_ROUTER' &&
    Number(coverage.discoveredLocalModels || 0) > 0 &&
    Number(coverage.registeredCapabilities || 0) > 0 &&
    Array.isArray(data.failedChecks) &&
    data.failedChecks.length === 0;
  const localSmokeVerified =
    benchmark.status === 'LOCAL_OPERATIONAL_SMOKE_PASSED' &&
    Number(benchmark.executedCases || 0) > 0 &&
    benchmark.executedCases === benchmark.passedCases;
  const limitations = [];

  if (!localSmokeVerified) {
    limitations.push({
      code: 'LOCAL_OPERATIONAL_BENCHMARK_PENDING',
      messageAr:
        'سجل القدرات والتوجيه فعال، لكن القياس التشغيلي المحلي لم يكتمل بعد.'
    });
  }
  limitations.push({
    code: 'SEMANTIC_ACCURACY_AND_COMPETITOR_COMPARISON_NOT_PROVEN',
    messageAr:
      'التفعيل لا يثبت دقة المعنى أو التفوق على Copilot أو GPT أو جميع النماذج.'
  });

  return {
    id: evidence.id,
    titleAr: evidence.titleAr,
    declaredStatus: data.status || null,
    verificationLevel: localSmokeVerified
      ? 'LOCAL_CAPABILITY_ROUTER_AND_OPERATIONAL_SMOKE_VERIFIED'
      : localRouterVerified
        ? 'LOCAL_CAPABILITY_ROUTER_VERIFIED_BENCHMARK_PENDING'
        : 'INTELLIGENCE_CAPABILITY_APEX_REVIEW_REQUIRED',
    evidence: evidenceMetadata(evidence),
    claims: {
      registered: true,
      sourcePresent: true,
      artifactBuilt: false,
      qemuVerified: false,
      nativeLifecycleVerified: false,
      localGeneratedEvidenceVerified: localRouterVerified,
      physicalHardwareVerified: false,
      externallyCertified: false,
      localModelCount:
        Number(coverage.discoveredLocalModels || 0),
      registeredCapabilityCount:
        Number(coverage.registeredCapabilities || 0),
      activeLocalCapabilityCount:
        Number(coverage.activeLocalCapabilities || 0),
      activeGovernedCapabilityCount:
        Number(coverage.activeGovernedCapabilities || 0),
      reasoningModeCount:
        Number(coverage.reasoningModes || 0),
      localOperationalSmokeVerified: localSmokeVerified,
      externalComparisonCaseCount:
        Number(benchmark.externalComparisonCases || 0),
      competitorSuperiorityEstablished:
        benchmark.competitorSuperiorityEstablished === true,
      betterThanAllModelsClaimed:
        boundaries.betterThanAllModelsClaimed === true,
      humansRemainPrimaryAndAccountable:
        boundaries.humansRemainPrimaryAndAccountable === true,
      githubRequired:
        data.providerPolicy?.githubRequired === true,
      copilotRequired:
        data.providerPolicy?.copilotRequired === true
    },
    limitations,
    nextGateAr:
      'تشغيل قياس محلي ثم مجموعة مقارنة متكافئة بتحكيم مستقل قبل أي ادعاء تفوق.'
  };
}

const DOMAIN_EVALUATORS = Object.freeze({
  SHEIKHA_LANGUAGE_FOUNDATION_ROOT: evaluateLanguageFoundation,
  BARE_METAL_X86_64_PHASE2B: evaluateBareMetal,
  UEFI_FOUNDATION: evaluateUefi,
  PHYSICAL_BOOT_TRIAL: evaluatePhysicalBoot,
  SYSTEM_BUILDER_FABRIC: evaluateSystemBuilder,
  LINUX_DEB_AMD64: evaluateLinuxDeb,
  VSCODE_EXTENSION: evaluateExtension,
  GARDENS_KNOWLEDGE_DIALOGUE: evaluateGardens,
  PRODUCER_PRODUCTION_QUALIFICATION:
    evaluateProductionQualification,
  GOVERNED_PRODUCTION_FEDERATION:
    evaluateProductionFederation,
  INTELLIGENCE_CAPABILITY_APEX:
    evaluateIntelligenceApex
});

function evaluateDomain(evidence, currentHead) {
  if (!evidence.parsed) return unavailableDomain(evidence);
  return DOMAIN_EVALUATORS[evidence.id](evidence, currentHead);
}

function buildEvidenceSummary(domains, staleProvenanceReferences) {
  const count = (claim) =>
    domains.filter((domain) => domain.claims[claim] === true).length;

  return {
    domainCount: domains.length,
    parsedEvidenceCount:
      domains.filter((domain) => domain.evidence.parsed).length,
    registeredCount: count('registered'),
    artifactBuiltCount: count('artifactBuilt'),
    qemuVerifiedCount: count('qemuVerified'),
    nativeLifecycleVerifiedCount: count('nativeLifecycleVerified'),
    localGeneratedEvidenceVerifiedCount:
      count('localGeneratedEvidenceVerified'),
    physicalHardwareVerifiedCount: count('physicalHardwareVerified'),
    externallyCertifiedCount: count('externallyCertified'),
    staleProvenanceReferenceCount: staleProvenanceReferences.length
  };
}

function verify(root = path.resolve(__dirname, '../../..')) {
  const currentHead = readGitHead(root);
  const missing = REQUIRED_PATHS.filter((relativePath) => {
    return !fs.existsSync(path.join(root, relativePath));
  });
  const evidence = EVIDENCE_SOURCES.map((source) =>
    readEvidence(root, source)
  );
  const evidenceErrors = evidence
    .filter((entry) => !entry.parsed)
    .map((entry) => ({
      id: entry.id,
      path: entry.path,
      error: entry.error
    }));
  const domains = evidence.map((entry) =>
    evaluateDomain(entry, currentHead)
  );
  const staleProvenanceReferences = domains
    .filter((domain) =>
      domain.claims.recordedSourceHead &&
      domain.claims.recordedSourceHeadMatchesCurrent === false
    )
    .map((domain) => ({
      domain: domain.id,
      recordedSourceHead: domain.claims.recordedSourceHead,
      currentSourceHead: currentHead,
      disposition: 'REVIEW_REQUIRED_NOT_AUTOMATIC_INVALIDATION'
    }));
  const gaps = domains.flatMap((domain) =>
    domain.limitations.map((limitation) => ({
      domain: domain.id,
      ...limitation
    }))
  );
  const failClosed =
    missing.length > 0 ||
    evidenceErrors.length > 0;

  return {
    schemaVersion: '3.2.0',
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    status: failClosed ? 'FAIL_CLOSED' : 'VERIFIED',
    truthStatus: failClosed
      ? 'EVIDENCE_INCOMPLETE_FAIL_CLOSED'
      : gaps.length > 0
        ? 'BOUNDED_EVIDENCE_VERIFIED_WITH_GAPS'
        : 'EVIDENCE_VERIFIED',
    sourceSnapshot: {
      currentHead,
      scope:
        'COMMITTED_HEAD_REFERENCE; UNCOMMITTED_WORKTREE_CONTENT_NOT_ASSERTED'
    },
    requiredPathCount: REQUIRED_PATHS.length,
    missing,
    evidenceErrors,
    evidenceSummary:
      buildEvidenceSummary(domains, staleProvenanceReferences),
    domains,
    staleProvenanceReferences,
    gaps,
    claimBoundaries: {
      registrationDoesNotMeanImplementation: true,
      reportDoesNotMeanLiveRuntimeProof: true,
      nativeLifecycleDoesNotMeanUniversalHardwareSupport: true,
      externalAccreditationRequiresIssuerEvidence: true,
      internalProductionAuthorizationIsNotExternalLicensing: true,
      candidateSensitiveTraitScoringAllowed: false,
      aiFinalProductionAuthorizationAllowed: false,
      externalProductionRequiresExplicitCustomerChoice: true,
      externalProductionRequiresHumanApproval: true,
      sameArtifactDigestRequiredAcrossPromotionLanes: true,
      sheikhaIsProjectFirstPartyLanguageFoundation: true,
      externalOperatingSystemsAreToolAdapters: true,
      universalAiFoundationClaimed: false,
      automatedFatwa: false,
      qualifiedHumanReviewForReligiousJudgments: true
    },
    allUefiProtocolsImplemented: false,
    allDevicesWorldwideSupported: false,
    physicalHardwareBootVerified: false,
    secureBootVerified: false,
    productionSiteDeployed: false
  };
}

function writeReport(root = path.resolve(__dirname, '../../..')) {
  const report = verify(root);
  const outputPath = path.join(root, OUTPUT_PATH);
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporaryPath, outputPath);
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    truthStatus: report.truthStatus,
    sourceHead: report.sourceSnapshot.currentHead,
    evidenceSummary: report.evidenceSummary,
    gapCount: report.gaps.length,
    output: OUTPUT_PATH
  }, null, 2));
  if (report.status !== 'VERIFIED') process.exitCode = 1;
}

module.exports = Object.freeze({
  SYSTEM,
  OUTPUT_PATH,
  REQUIRED_PATHS,
  EVIDENCE_SOURCES,
  readGitHead,
  verify,
  writeReport
});
