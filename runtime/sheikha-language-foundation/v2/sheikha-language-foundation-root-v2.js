'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  loadSourceProgram
} = require('../../../sheikha-language/compiler/source-loader');
const {
  lowerToIR
} = require('../../../sheikha-language/compiler/ir');
const {
  typeCheckAst
} = require('../../../sheikha-language/compiler/type-checker');
const {
  compileIRToBytecode
} = require('../../../sheikha-language/compiler/bytecode');
const {
  runBytecode
} = require('../../../sheikha-language/compiler/bytecode-vm');

const SYSTEM = 'SHEIKHA_LANGUAGE_FOUNDATION_ROOT_V2';
const ROOT = path.resolve(__dirname, '../../..');
const SOURCE_PATH =
  'sheikha-language/system/sheikha-foundation-root-v2.shk';
const REPORT_PATH =
  'runtime/sheikha-language-foundation/v2/' +
  'sheikha-language-foundation-root-v2-report.json';
const EVIDENCE_DIR =
  'runtime/sheikha-language-foundation/v2/evidence';

const AI_CAPABILITY_ROOTS = Object.freeze([
  Object.freeze({
    id: 'ARABIC_LANGUAGE_UNDERSTANDING',
    nameAr: 'فهم اللغة العربية والسياق',
    responsibility: 'LANGUAGE_ANALYSIS_AND_CONTEXT',
  }),
  Object.freeze({
    id: 'KNOWLEDGE_RETRIEVAL',
    nameAr: 'الاسترجاع والمعرفة',
    responsibility: 'EVIDENCE_BOUND_RETRIEVAL',
  }),
  Object.freeze({
    id: 'REASONING_ASSISTANCE',
    nameAr: 'الاستدلال والتخطيط المساعد',
    responsibility: 'BOUNDED_REASONING_SUPPORT',
  }),
  Object.freeze({
    id: 'GENERATIVE_ASSISTANCE',
    nameAr: 'التوليد المساعد',
    responsibility: 'GOVERNED_CONTENT_GENERATION',
  }),
  Object.freeze({
    id: 'CODE_AND_SYSTEMS_ASSISTANCE',
    nameAr: 'البرمجة وهندسة الأنظمة',
    responsibility: 'CODE_ANALYSIS_AND_PROPOSAL',
  }),
  Object.freeze({
    id: 'MEMORY_AND_CONTEXT',
    nameAr: 'الذاكرة والسياق',
    responsibility: 'SCOPED_CONTEXT_MANAGEMENT',
  }),
  Object.freeze({
    id: 'EVALUATION_AND_SAFETY',
    nameAr: 'التقييم والسلامة',
    responsibility: 'EVIDENCE_RISK_AND_POLICY_CHECKS',
  }),
  Object.freeze({
    id: 'TOOL_MEDIATION',
    nameAr: 'وساطة الأدوات',
    responsibility: 'CAPABILITY_GATED_TOOL_ROUTING',
  }),
]);

const SYSTEM_TOOL_ADAPTERS = Object.freeze([
  Object.freeze({
    id: 'LINUX_HOST_ADAPTER',
    nameAr: 'محول Linux',
    role: 'CURRENT_BUILD_AND_PORTAL_HOST_TOOL',
    status: 'ACTIVE_LOCAL_HOST_ADAPTER',
    foundation: false,
    nativeVerification: true,
  }),
  Object.freeze({
    id: 'WINDOWS_HOST_ADAPTER',
    nameAr: 'محول Windows',
    role: 'OPTIONAL_BUILD_AND_COMPATIBILITY_TOOL',
    status: 'REGISTERED_NATIVE_TEST_PENDING',
    foundation: false,
    nativeVerification: false,
  }),
  Object.freeze({
    id: 'MACOS_HOST_ADAPTER',
    nameAr: 'محول macOS',
    role: 'OPTIONAL_BUILD_AND_COMPATIBILITY_TOOL',
    status: 'REGISTERED_NATIVE_TEST_PENDING',
    foundation: false,
    nativeVerification: false,
  }),
]);

const REQUIRED_ENTITIES = Object.freeze([
  'جذر_لغة_شيخة',
  'جذور_قدرات_الذكاء_الصناعي',
  'شيخة_UEFI',
  'شيخة_QEMU',
  'شيخة_Bare_Metal',
  'محولات_الأنظمة_الخارجية',
  'حدود_الاستقلال',
]);

const REQUIRED_MARKERS = Object.freeze([
  'SHEIKHA_FOUNDATION_ROOT_V2_OK',
  'SHEIKHA_LANGUAGE_FIRST_PARTY_FOUNDATION',
  'SHEIKHA_AI_ROOTS_GOVERNED_POST_BOOT',
  'SHEIKHA_EXTERNAL_SYSTEMS_TOOL_ADAPTERS_ONLY',
  'SHEIKHA_NATIVE_MIGRATION_REQUIRED',
]);

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return fallback;
  }
}

function readText(relativePath, fallback = '') {
  try {
    return fs.readFileSync(resolve(relativePath), 'utf8');
  } catch {
    return fallback;
  }
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function hashJson(value) {
  return sha256(
    Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
  );
}

function compileFoundation() {
  const absoluteSourcePath = resolve(SOURCE_PATH);
  const sourceProgram = loadSourceProgram(absoluteSourcePath);
  const ast = sourceProgram.ast;
  const types = typeCheckAst(ast);
  const ir = lowerToIR(ast);
  const bytecode = compileIRToBytecode(ir);
  const run = runBytecode(bytecode, {
    profile: 'local',
    strictIsolation: true,
  });

  return {
    source: sourceProgram.source,
    sourceProgram,
    ast,
    types,
    ir,
    bytecode,
    run,
  };
}

function declarationNames(ast, type) {
  return ast.body
    .filter((node) => node.type === type)
    .map((node) => node.name);
}

function buildAiCapabilityRoots() {
  return AI_CAPABILITY_ROOTS.map((root) => ({
    ...root,
    status: 'REGISTERED_GOVERNED_POST_BOOT_CAPABILITY',
    providerBinding: 'APPROVED_PROVIDER_ADAPTER_REQUIRED',
    criticalBootPath: false,
    independentHighImpactExecution: false,
    evidenceRequiredPerProvider: true,
    humanFinalAuthority: true,
  }));
}

function buildSystemToolAdapters() {
  return SYSTEM_TOOL_ADAPTERS.map((adapter) => ({
    ...adapter,
    mayReplaceSheikhaFoundation: false,
    defaultAuthorization: 'DENY',
    explicitContractRequired: true,
  }));
}

function buildFoundationStatus(options = {}) {
  const compiled = compileFoundation();
  const bareMetal = readJson(
    'runtime/bare-metal/v2/' +
    'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json',
    {}
  );
  const uefi = readJson(
    'runtime/bare-metal/v2/uefi-integration/v1/' +
    'sheikha-uefi-integration-v1-report.json',
    {}
  );
  const bootContract = readJson(
    'bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json',
    {}
  );
  const languageRegistry = readJson(
    'sheikha-language/specifications/language-spec-registry.json',
    {}
  );
  const localSiteSmoke = readJson(
    'runtime/site-operations/v1/sheikha-local-site-smoke-v1-report.json',
    {}
  );
  const serial = readText(
    'runtime/bare-metal/v2/evidence/' +
    'sheikha-v2-uefi-paging-runtime-phase2b-serial.log'
  );
  const entities = declarationNames(
    compiled.ast,
    'EntityDeclaration'
  );
  const procedures = declarationNames(
    compiled.ast,
    'ProcedureDeclaration'
  );
  const valuesReferences = declarationNames(
    compiled.ast,
    'ValuesReferenceDeclaration'
  );
  const governancePolicies = declarationNames(
    compiled.ast,
    'GovernancePolicyDeclaration'
  );
  const reasoningMethodologies = declarationNames(
    compiled.ast,
    'ReasoningMethodologyDeclaration'
  );
  const output = compiled.run.state.output;
  const aiCapabilityRoots = buildAiCapabilityRoots();
  const systemToolAdapters = buildSystemToolAdapters();
  const sourceSha256 = sha256(
    Buffer.from(compiled.source, 'utf8')
  );
  const bytecodeSha256 = hashJson(compiled.bytecode);
  const bootContractMarker =
    `language_contract=${bootContract.id || ''}`;

  const checks = {
    canonicalSourceIsSheikha:
      compiled.sourceProgram.sourceLanguage === 'sheikha' &&
      compiled.sourceProgram.sourceKind === 'shk',
    requiredEntitiesPresent:
      REQUIRED_ENTITIES.every((name) => entities.includes(name)),
    formalValuesReferencePresent:
      valuesReferences.includes('القيم_العليا'),
    formalGovernancePolicyPresent:
      governancePolicies.includes('الخير_والنفع_العام'),
    formalReasoningMethodologyPresent:
      reasoningMethodologies.includes(
        'العربية_والعلوم_والاستدلال'
      ),
    typeCheckPassed: compiled.types.ok === true,
    bytecodeGenerated:
      compiled.bytecode.instructions.length > 0,
    governedVmPassed:
      compiled.run.ok === true &&
      compiled.run.state.governance.violations.length === 0,
    allFoundationMarkersEmitted:
      REQUIRED_MARKERS.every((marker) =>
        output.some((line) => line.includes(marker))
      ),
    languageBootContractValid:
      bootContract.id === 'SHEIKHA_LANGUAGE_BOOT_CONTRACT_V1' &&
      bootContract.currentNativeSeedBackend === 'freestanding-c11',
    languageContractIdentityObservedInQemu:
      bareMetal.qemuBootExecuted === true &&
      bareMetal.phase2bVerified === true &&
      serial.includes(bootContractMarker),
    uefiBoundaryVerified:
      uefi.status ===
        'ACTIVE_WITH_VERIFIED_FOUNDATION_SUBSETS' &&
      Number(uefi.coverage?.fullyImplemented || 0) === 0,
    externalSystemsAreToolAdapters:
      systemToolAdapters.every((adapter) =>
        adapter.foundation === false &&
        adapter.mayReplaceSheikhaFoundation === false
      ),
    externalLanguagePolicyIsToolOnly:
      languageRegistry.architecturePolicy
        ?.externalLanguagesRole === 'TOOL_ADAPTER' &&
      languageRegistry.architecturePolicy
        ?.externalLanguagesMayReplaceFoundation === false,
    aiRootsRemainPostBoot:
      aiCapabilityRoots.every((root) =>
        root.criticalBootPath === false &&
        root.independentHighImpactExecution === false
      ),
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const passed = failedChecks.length === 0;

  return {
    schemaVersion: '2.0.0',
    system: SYSTEM,
    status: passed
      ? 'FOUNDATION_ACTIVE_HOST_BOOTSTRAPPED_NATIVE_MIGRATION_REQUIRED'
      : 'FOUNDATION_REVIEW_REQUIRED',
    generatedAt: options.generatedAt || new Date().toISOString(),
    passed,
    score: Math.round(
      (
        Object.values(checks).filter(Boolean).length /
        Object.keys(checks).length
      ) * 100
    ),
    checks,
    failedChecks,
    identity: {
      canonicalName: 'Sheikha Language Foundation Root',
      arabicName: 'جذر لغة شيخة البرمجية',
      sourceExtension: '.shk',
      sourcePath: SOURCE_PATH,
      sourceSha256,
      bytecodeSha256,
      projectFirstPartyFoundation: true,
      globalUniversalAiFoundationClaimed: false,
    },
    compilation: {
      pipeline: [
        'source',
        'lexer',
        'parser',
        'ast',
        'type-checker',
        'ir',
        'bytecode',
        'governance',
        'vm',
      ],
      bootstrapRuntime: 'Node.js',
      sourceLanguage: compiled.sourceProgram.sourceLanguage,
      typeCheckPassed: compiled.types.ok,
      astNodes: compiled.ast.body.length,
      irSteps: compiled.ir.steps.length,
      bytecodeInstructions:
        compiled.bytecode.instructions.length,
      vmStatus: compiled.run.status,
      governanceViolations:
        compiled.run.state.governance.violations.length,
      selfHostedCompilerVerified: false,
      nativeMachineCodeBackendVerified: false,
    },
    declarations: {
      valuesReferences,
      governancePolicies,
      reasoningMethodologies,
      entities,
      procedures,
    },
    aiCapabilityRoots: {
      count: aiCapabilityRoots.length,
      roots: aiCapabilityRoots,
      localPostBootRuntimeEvidence: {
        liveSseChatVerified:
          localSiteSmoke.liveChat?.passed === true,
        elapsedMs:
          localSiteSmoke.liveChat?.elapsedMs || null,
      },
      everyAiSystemInUniverseIntegrated: false,
      everyAiProviderVerified: false,
    },
    nativeStack: {
      bareMetal: {
        id: 'SHEIKHA_BARE_METAL_PROFILE',
        foundationTarget: true,
        status: bareMetal.status || 'EVIDENCE_UNAVAILABLE',
        architecture: bareMetal.architecture || null,
        qemuBootVerified: bareMetal.phase2bVerified === true,
        physicalHardwareVerified:
          bareMetal.physicalHardwareVerified === true,
        generalPurposeOperatingSystemComplete:
          bareMetal.generalPurposeOperatingSystemComplete === true,
        hostRuntimeRequiredAtKernelRuntime: false,
      },
      uefi: {
        id: 'SHEIKHA_UEFI_PROFILE',
        role: 'FIRMWARE_INTERFACE_PROFILE',
        status: uefi.status || 'EVIDENCE_UNAVAILABLE',
        registeredCapabilities:
          Number(uefi.coverage?.total || 0),
        verifiedSubsets:
          Number(uefi.coverage?.qemuVerifiedSubsets || 0) +
          Number(uefi.coverage?.sourceVerifiedSubsets || 0),
        fullyImplementedCapabilities:
          Number(uefi.coverage?.fullyImplemented || 0),
        externalSpecificationOwned: false,
      },
      qemu: {
        id: 'SHEIKHA_QEMU_VALIDATION_PROFILE',
        role: 'EXTERNAL_EMULATION_AND_VALIDATION_TOOL',
        status: bareMetal.qemuBootExecuted === true
          ? 'LOCAL_QEMU_BOOT_EVIDENCE_VERIFIED'
          : 'QEMU_BOOT_EVIDENCE_PENDING',
        foundation: false,
        replacesPhysicalHardwareQualification: false,
        qemuOwnershipClaimed: false,
      },
      languageBinding: {
        contractId: bootContract.id || null,
        contractIdentityEmbeddedInNativeArtifact:
          serial.includes(bootContractMarker),
        sheikhaSourceFingerprintEmbeddedInNativeArtifact: false,
        bytecodeExecutedInsideKernel: false,
        currentKernelBackend:
          bootContract.currentNativeSeedBackend || null,
        nodeRequiredAtKernelRuntime: false,
        linuxRequiredAtKernelRuntime: false,
      },
    },
    systemToolAdapters: {
      policy: 'EXTERNAL_SYSTEMS_ARE_TOOLS_NOT_FOUNDATIONS',
      adapters: systemToolAdapters,
    },
    implementationBoundary: {
      hostedCompilerAndVmVerified: true,
      nativeBootContractBindingVerified:
        serial.includes(bootContractMarker),
      bootArtifactIndependentFromLinuxAndNodeAtRuntime: true,
      selfHostedCompilerComplete: false,
      nativeMachineCodeBackendComplete: false,
      standardLibraryAndHalPortComplete: false,
      kernelWrittenInSheikhaComplete: false,
      physicalHardwareQualificationComplete: false,
      multiArchitectureQualificationComplete: false,
      allSystemsProgrammedInSheikha: false,
      universalAiFoundationEstablished: false,
    },
    governance: {
      valuesReferenceExecutable: false,
      softwareClaimsDivineAuthority: false,
      aiIsReligiousAuthority: false,
      automatedFatwaAllowed: false,
      qualifiedScholarReviewForReligiousRulings: true,
      humanApprovalForHighImpact: true,
      evidenceBeforeCompletionClaim: true,
      defaultAuthorization: 'DENY',
    },
    evidence: {
      source: SOURCE_PATH,
      ast: `${EVIDENCE_DIR}/sheikha-foundation-root-v2.ast.json`,
      types: `${EVIDENCE_DIR}/sheikha-foundation-root-v2.types.json`,
      ir: `${EVIDENCE_DIR}/sheikha-foundation-root-v2.ir.json`,
      bytecode:
        `${EVIDENCE_DIR}/sheikha-foundation-root-v2.bytecode.json`,
      run: `${EVIDENCE_DIR}/sheikha-foundation-root-v2.run.json`,
      aiRegistry:
        `${EVIDENCE_DIR}/sheikha-ai-capability-root-registry-v2.json`,
      systemAdapterRegistry:
        `${EVIDENCE_DIR}/sheikha-system-tool-adapter-registry-v2.json`,
      bareMetal:
        'runtime/bare-metal/v2/' +
        'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json',
      uefi:
        'runtime/bare-metal/v2/uefi-integration/v1/' +
        'sheikha-uefi-integration-v1-report.json',
      qemuSerial:
        'runtime/bare-metal/v2/evidence/' +
        'sheikha-v2-uefi-paging-runtime-phase2b-serial.log',
    },
    nextStages: [
      'SHEIKHA_SELF_HOSTED_COMPILER',
      'SHEIKHA_NATIVE_MACHINE_CODE_OR_UEFI_BACKEND',
      'SHEIKHA_NATIVE_STANDARD_LIBRARY_AND_HAL',
      'SHEIKHA_KERNEL_AND_DRIVER_PORT',
      'PHYSICAL_HARDWARE_AND_MULTI_ARCH_QUALIFICATION',
    ],
    claimPolicy:
      'Sheikha is the first-party project foundation. ' +
      'It is not a self-hosted native language or universal AI foundation ' +
      'until those capabilities are built and independently verified.',
  };
}

function buildActivationArtifacts(options = {}) {
  const compiled = compileFoundation();
  return {
    report: buildFoundationStatus(options),
    ast: compiled.ast,
    types: compiled.types,
    ir: compiled.ir,
    bytecode: compiled.bytecode,
    run: {
      ok: compiled.run.ok,
      status: compiled.run.status,
      output: compiled.run.state.output,
      governance: compiled.run.state.governance,
      valuesReferences: compiled.run.state.valuesReferences,
      governancePolicies:
        compiled.run.state.governancePolicies,
      reasoningMethodologies:
        compiled.run.state.reasoningMethodologies,
      entities: compiled.run.state.entities,
      sandbox: compiled.run.state.sandbox,
    },
  };
}

module.exports = Object.freeze({
  SYSTEM,
  SOURCE_PATH,
  REPORT_PATH,
  EVIDENCE_DIR,
  AI_CAPABILITY_ROOTS,
  SYSTEM_TOOL_ADAPTERS,
  REQUIRED_ENTITIES,
  REQUIRED_MARKERS,
  compileFoundation,
  buildFoundationStatus,
  buildActivationArtifacts,
});
