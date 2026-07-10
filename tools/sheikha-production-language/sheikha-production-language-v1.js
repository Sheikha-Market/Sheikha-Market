'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildReport: buildLanguageArchitectureReport
} = require('../activation/activate-sheikha-native-language-architecture-v1');
const {
  buildIslamicAIKernel
} = require('../../core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1');
const {
  interpretSheikhaArabicProduction,
  INTERPRETER_MODES
} = require('../../core/language/sheikha-arabic-runtime/sheikha-language-runtime');

const ROOT = process.cwd();
const REPORT_JSON =
  'runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json';
const REPORT_MD =
  'runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.md';

const REQUIRED_ASSETS = {
  engine: 'runtime/sheikha-production-language/v1/sheikha-production-language-v1.json',
  registry:
    'runtime/sheikha-production-language/v1/registries/production-language-registry.json',
  mlAiIotMap:
    'runtime/sheikha-production-language/v1/registries/ml-ai-iot-integration-map.json',
  mcpReadiness:
    'runtime/sheikha-production-language/v1/registries/mcp-readiness.json',
  docs: 'docs/sheikha-production-language/SHEIKHA-PRODUCTION-LANGUAGE-V1.md',
  examples: 'docs/sheikha-production-language/examples/hello.sheikha',
  sdk: 'sdk/sheikha-js/index.js',
  apiSdk: 'sdk/sheikha-api/index.js',
  cli: 'cli/sheikha/sheikha-cli.js',
  packageManager: 'packages/sheikha/package-manifest.json',
  ide: 'ide/sheikha-vscode/extension-manifest.json',
  mcp: 'mcp/sheikha/mcp-manifest.json',
  spaceIotMlAi:
    'runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json',
  logisticsPlatform:
    'runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json',
  resourceSources:
    'runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json',
  driftDetector: 'tools/drift/sheikha-runtime-drift-detector.js'
};
const UNIVERSAL_PRODUCTION_WAVE_1 = [
  {
    id: 'SHEIKHA_LANGUAGE_CORE',
    source: 'sheikha-language/system/sheikha-sovereign-architecture-v1.shk',
    tests: ['tests/sheikha-native-language-architecture-v1.test.js'],
    evidence:
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json'
  },
  {
    id: 'SHEIKHA_ADVANCED_ARABIC_COMPILER_RUNTIME',
    source: 'core/language/sheikha-arabic/compiler/compile-arabic-program.js',
    tests: ['tests/sheikha-language-integration-v1.test.js'],
    evidence:
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json'
  },
  {
    id: 'SHEIKHA_GOVERNED_AI_KERNEL',
    source: 'core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1.js',
    tests: ['tests/sheikha-islamic-ai-kernel-v1.test.js'],
    evidence: 'runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json'
  },
  {
    id: 'SHEIKHA_GOVERNANCE_GENERATOR',
    source: 'runtime/governance-generator/v1/sheikha-public-benefit-capability-router-v1.js',
    tests: ['tests/governance-generator-v1.test.js'],
    evidence: 'runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'
  },
  {
    id: 'SHEIKHA_API_SDK',
    source: 'sdk/sheikha-api/index.js',
    tests: ['tests/sdk-fabric-mcp-integration-v1.test.js'],
    evidence:
      'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'
  },
  {
    id: 'SHEIKHA_UNIFIED_CHAT',
    source: 'routes/sheikha-unified-chat-fabric.js',
    tests: ['tests/governance-generator-v1.test.js'],
    evidence:
      'runtime/streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1-report.json'
  },
  {
    id: 'SHEIKHA_RUNTIME_HEALTH',
    source: 'core/runtime-health/sheikha-runtime-health-engine-v1.js',
    tests: ['tests/sheikha-runtime-health-engine-v1.test.js'],
    evidence: 'runtime/runtime-health-aggregator/sheikha-runtime-health-aggregator.json'
  }
];

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function buildAssetChecks() {
  return Object.fromEntries(
    Object.entries(REQUIRED_ASSETS).map(([name, relativePath]) => [name, exists(relativePath)])
  );
}

function buildUniversalProductionProgram(hostedProductionGatePassed) {
  const systems = UNIVERSAL_PRODUCTION_WAVE_1.map((system) => {
    const checks = {
      sourcePresent: exists(system.source),
      testsPresent: system.tests.every(exists),
      evidencePresent: exists(system.evidence),
      hostedProductionGatePassed
    };
    const admitted = Object.values(checks).every(Boolean);

    return {
      ...system,
      checks,
      status: admitted
        ? 'ADMITTED_TO_HOSTED_PRODUCTION_WAVE_1'
        : 'PRODUCTION_ADMISSION_REVIEW_REQUIRED',
      admitted,
      executionMode: 'HOSTED_INTEGRATED_PRODUCTION',
      automaticExternalAction: false,
      nativeSheikhaPortComplete: false
    };
  });
  const admittedSystems = systems.filter((system) => system.admitted).length;
  const wavePassed = admittedSystems === systems.length;

  return {
    system: 'SHEIKHA_UNIVERSAL_GOVERNED_PRODUCTION_PROGRAM_V1',
    status: wavePassed
      ? 'STARTED_WITH_VERIFIED_HOSTED_FOUNDATION_WAVE_1'
      : 'STARTED_WITH_WAVE_1_ADMISSION_REVIEW',
    declaredPurpose: 'الخير والنفع لله وحده',
    declaredPurposeIsMachineVerifiableIntention: false,
    scope: 'ALL_CATALOGED_APPROVED_SHEIKHA_SYSTEMS',
    unboundedOrAbsoluteExecutionAllowed: false,
    automaticGlobalCutoverAllowed: false,
    wave1: {
      status: wavePassed ? 'HOSTED_PRODUCTION_ADMISSION_PASSED' : 'REVIEW_REQUIRED',
      systems,
      totalSystems: systems.length,
      admittedSystems,
      rejectedOrReviewSystems: systems.length - admittedSystems
    },
    nextWaves: [
      'IDENTITY_SECURITY_TRUTH_RECOVERY',
      'MARKET_COMMERCE_SUPPLY_CHAIN',
      'KNOWLEDGE_COMMUNITY_ENTERPRISE',
      'CLOUD_HPC_DATA_ANALYTICS',
      'APPLICATIONS_INTERFACES_PACKAGES',
      'NATIVE_KERNEL_DRIVERS_HAL'
    ],
    universalCompletion: {
      allCatalogedSystemsMigrated: false,
      allSystemsBehavioralParityVerified: false,
      allSystemsSecurityRecoveryVerified: false,
      allSystemsPerformanceQualified: false,
      fullNativeCutoverComplete: false,
      completionClaimAllowed: false
    }
  };
}

function verifyArabicProductionInterpreters() {
  const canonicalSource = fs.readFileSync(
    path.join(ROOT, 'sheikha-language/system/sheikha-sovereign-architecture-v1.shk'),
    'utf8'
  );
  const sheikhaProgram = interpretSheikhaArabicProduction(canonicalSource, {
    mode: 'sheikha-program'
  });
  const accounting = interpretSheikhaArabicProduction(
    'حوّل المورد مبلغًا من حساب_المشتري إلى حساب_سوق_شيخة',
    { mode: 'auto' }
  );
  const math = interpretSheikhaArabicProduction('٢ زائد ٣', { mode: 'auto' });
  const command = interpretSheikhaArabicProduction('تحقق حالة النظام', {
    mode: 'auto'
  });
  const religiousBoundary = interpretSheikhaArabicProduction(
    'أفتني في حكم شرعي',
    { mode: 'auto' }
  );
  const checks = {
    sheikhaProgramInterpreted: sheikhaProgram.status === 'INTERPRETED' &&
      sheikhaProgram.sandbox?.strict === true,
    arabicAccountingInterpreted: accounting.status === 'INTERPRETED' &&
      accounting.ledger?.length === 1,
    arabicMathInterpreted: math.status === 'INTERPRETED' && math.value === 5,
    arabicCommandInterpretedDryRun:
      command.status === 'INTERPRETED_DRY_RUN' && command.externalExecution === false,
    religiousRulingRequiresQualifiedReview:
      religiousBoundary.status === 'QUALIFIED_REVIEW_REQUIRED' &&
      religiousBoundary.executionAllowed === false,
    allModesArabicPrimary: [sheikhaProgram, accounting, math, command]
      .every((result) => result.arabicPrimary === true),
    noInterpreterExternalExecution: [sheikhaProgram, accounting, math, command]
      .every((result) => result.externalExecution === false)
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    system: 'SHEIKHA_ARABIC_PRODUCTION_INTERPRETERS_V1',
    status: passed === total
      ? 'ARABIC_PRIMARY_INTERPRETERS_VERIFIED'
      : 'ARABIC_INTERPRETERS_REVIEW_REQUIRED',
    score: total ? Math.round((passed / total) * 100) : 0,
    supportedModes: INTERPRETER_MODES,
    promotion: {
      apexLevel: 97,
      layer: 'SHEIKHA_ARABIC_PRODUCTION_INTERPRETER_APEX_L97',
      scope: 'HOSTED_LANGUAGE_PRODUCTION_PLANE_ONLY',
      aboveArabicFabricsV91ToV96: true,
      highestArabicInterfaceInCurrentHostedLanguageStack: true,
      crossPlaneAuthorityEscalation: false
    },
    checks,
    evidence: {
      sheikhaProgramStatus: sheikhaProgram.status,
      accountingStatus: accounting.status,
      accountingLedgerEntries: accounting.ledger?.length || 0,
      mathStatus: math.status,
      mathResult: math.value,
      commandStatus: command.status,
      religiousBoundaryStatus: religiousBoundary.status
    },
    boundary: {
      arabicPrimaryAcrossAllModes: true,
      unrestrictedExecution: false,
      externalExecution: false,
      automatedFatwaAllowed: false
    }
  };
}

function buildProductionReport() {
  const architecture = buildLanguageArchitectureReport();
  const advanced = architecture.advancedHostedArabicFoundation;
  const kernel = buildIslamicAIKernel({
    purpose: 'SHEIKHA_LANGUAGE_HOSTED_PRODUCTION_GATE'
  });
  const assetChecks = buildAssetChecks();
  const interpreters = verifyArabicProductionInterpreters();

  const executionChecks = {
    canonicalSheikhaSourceCompiled: architecture.checks.typeCheckPassed === true &&
      architecture.checks.irGenerated === true &&
      architecture.checks.bytecodeGenerated === true,
    canonicalGovernedVmPassed: architecture.checks.vmPassed === true,
    priorAdvancedArabicCompilerPassed:
      advanced?.checks?.arabicProgramCompiled === true,
    priorArabicAstAndIrPassed:
      advanced?.checks?.arabicAstGenerated === true &&
      advanced?.checks?.arabicIrGenerated === true,
    priorArabicVmV1Passed: advanced?.checks?.arabicVmV1Executed === true,
    priorArabicVmV2Passed: advanced?.checks?.arabicVmV2Executed === true,
    arabicMathPassed: advanced?.checks?.arabicMathEvaluated === true &&
      advanced?.checks?.arabicNumberNormalizationVerified === true,
    languageStackPassed: advanced?.checks?.languageStackCompiled === true,
    fabricsV91ToV96Passed: advanced?.checks?.fabricsV91ToV96Active === true,
    arabicProductionInterpretersPassed:
      interpreters.status === 'ARABIC_PRIMARY_INTERPRETERS_VERIFIED' &&
      interpreters.score === 100
  };

  const governanceChecks = {
    valuesReferenceIsFormalAndNonExecutable:
      architecture.checks.formalValuesReferencePresent === true &&
      architecture.checks.valuesReferenceRegisteredAsNonExecutable === true,
    publicBenefitPolicyEnforced:
      architecture.checks.formalGovernancePolicyPresent === true &&
      architecture.checks.governancePolicyEnforcedAtRuntime === true,
    arabicScienceReasoningMethodologyEnforced:
      architecture.checks.formalArabicScienceReasoningMethodologyPresent === true &&
      architecture.checks.reasoningMethodologyEnforcedAtRuntime === true,
    aiIsGovernedToolOnly: kernel.aiRuntime?.role === 'analysis_and_decision_support_only' &&
      kernel.reference?.softwareRepresentsDivineAuthority === false,
    noAutomatedFatwa: architecture.governance.noAutomatedFatwa === true &&
      kernel.aiRuntime?.restrictions?.includes('no_independent_fatwa'),
    qualifiedReviewForReligiousRulings:
      kernel.governance?.scholarsReviewForReligiousRulings === true,
    humanReviewForHighImpact:
      architecture.governance.humanFinalDecisionForHighImpact === true &&
      kernel.governance?.humanReviewForHighImpact === true,
    evidenceAndNoHarmRequired:
      kernel.governance?.evidenceRequired === true && kernel.governance?.noHarm === true,
    evidenceDomainsSeparated:
      architecture.governance.domainEvidenceSeparationEnforced === true &&
      kernel.governance?.evidenceDomainsSeparated === true
  };

  const gateChecks = {
    ...Object.fromEntries(
      Object.entries(assetChecks).map(([name, passed]) => [`asset_${name}`, passed])
    ),
    ...executionChecks,
    ...governanceChecks
  };
  const passed = Object.values(gateChecks).filter(Boolean).length;
  const total = Object.keys(gateChecks).length;
  const hostedProductionScore = total ? Math.round((passed / total) * 100) : 0;
  const hostedProductionGatePassed = hostedProductionScore === 100;
  const universalProductionProgram = buildUniversalProductionProgram(
    hostedProductionGatePassed
  );
  const missingAssets = Object.entries(assetChecks)
    .filter(([, present]) => !present)
    .map(([name]) => name);
  const failedChecks = Object.entries(gateChecks)
    .filter(([, checkPassed]) => !checkPassed)
    .map(([name]) => name);

  return {
    system: 'SHEIKHA_PRODUCTION_LANGUAGE_V1',
    status: hostedProductionGatePassed
      ? 'HOSTED_PRODUCTION_GATE_PASSED_NATIVE_SYSTEM_MIGRATION_REQUIRED'
      : 'HOSTED_PRODUCTION_REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    hostedProductionScore,
    decision: hostedProductionGatePassed
      ? 'SHEIKHA_HOSTED_PRODUCTION_VERIFIED_WITH_GOVERNED_AI'
      : 'REVIEW_SHEIKHA_HOSTED_PRODUCTION_GAPS',
    checks: {
      assets: assetChecks,
      execution: executionChecks,
      governance: governanceChecks
    },
    missingAssets,
    failedChecks,
    integration: {
      canonicalSheikhaSource:
        'sheikha-language/system/sheikha-sovereign-architecture-v1.shk',
      advancedHostedArabicFoundation:
        advanced?.status || 'NOT_VERIFIED',
      advancedHostedArabicFoundationScore: advanced?.score || 0,
      formalArabicDeclarations: ['مرجعية', 'سياسة', 'منهج'],
      aiKernel: kernel.system,
      aiMode: kernel.mode,
      aiRole: kernel.aiRuntime?.role,
      compilerRuntime: architecture.compiler.bootstrapRuntime,
      productionApi:
        '/api/governance/generator/sheikha-language-production',
      interpreterApi:
        '/api/governance/generator/sheikha-language-production/interpret',
      arabicProductionInterpreters: interpreters.status
    },
    governance: {
      declaredFaithReference: 'الحكم لله وحده',
      valuesReference:
        'QURAN_AND_AUTHENTIC_SUNNAH_VALUES_NON_EXECUTABLE_REFERENCE',
      valuesReferenceExecutable: false,
      softwareClaimsDivineAuthority: false,
      aiIsReligiousAuthority: false,
      automatedFatwaAllowed: false,
      qualifiedScholarReviewForReligiousRulings: true,
      humanFinalDecisionForHighImpact: true,
      noHarm: true,
      evidenceRequired: true,
      domainEvidenceSeparation: {
        religiousReasoning: 'QURAN_AUTHENTIC_SUNNAH_QUALIFIED_REVIEW',
        mathematics: 'DEFINITIONS_AXIOMS_PROOF_TEST',
        empiricalScience: 'OBSERVATION_MEASUREMENT_EXPERIMENT_REPLICATION'
      }
    },
    production: {
      hostedLanguageSubsystemReady: hostedProductionGatePassed,
      universalProductionProgramStarted:
        universalProductionProgram.status.startsWith('STARTED_WITH_'),
      hostedFoundationWave1Admitted:
        universalProductionProgram.wave1.status === 'HOSTED_PRODUCTION_ADMISSION_PASSED',
      allSystemsProgrammedInSheikha: false,
      fullNativeProductionReady: false,
      automaticMigrationOrExecution: false,
      externalAccreditationClaimed: false,
      scope:
        'VERIFIED_HOSTED_LANGUAGE_COMPILER_RUNTIME_VM_AI_GOVERNANCE_SUBSYSTEM'
    },
    systemMigration: {
      objective: 'PORT_ALL_APPROVED_SYSTEMS_TO_SHEIKHA_WITH_TESTED_PARITY',
      status: 'MEASURED_MIGRATION_REQUIRED',
      catalogedImplementationSourceFiles:
        architecture.sourceInventory.implementationSourceFiles,
      sheikhaNativeImplementationSourceFiles:
        architecture.sourceInventory.sheikhaImplementationSourceFiles,
      hostedArabicLanguageComponentFiles:
        architecture.hostedArabicLanguageInventory.componentFiles,
      hostedArabicLanguageJavaScriptFiles:
        architecture.hostedArabicLanguageInventory.javascriptImplementationFiles,
      migrationComplete: false,
      completionClaimAllowed: false,
      gates: architecture.completionGate.requiredForCompletion,
      blockers: architecture.completionGate.blockers,
      requiredPerSystem: [
        'owner_and_scope',
        'sheikha_source',
        'type_and_governance_check',
        'behavioral_parity_tests',
        'security_and_recovery_tests',
        'performance_measurement',
        'human_approval',
        'audited_release_evidence'
      ]
    },
    universalProductionProgram,
    interpreters,
    cycle: [
      'ARABIC_SHEIKHA_SOURCE',
      'FORMAL_VALUES_AND_GOVERNANCE_TYPE_CHECK',
      'AST_AND_IR',
      'BYTECODE_OR_APPROVED_TARGET',
      'GOVERNED_AI_ANALYSIS',
      'SANDBOXED_RUNTIME',
      'TEST_AND_SECURITY_GATE',
      'HUMAN_OR_QUALIFIED_REVIEW',
      'AUDITED_PACKAGE',
      'OBSERVED_HOSTED_PRODUCTION',
      'MEASURED_SYSTEM_MIGRATION'
    ],
    evidence: {
      languageArchitecture:
        'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json',
      advancedCompilerStatus: advanced?.evidence?.compilerStatus || null,
      advancedVmV1Status: advanced?.evidence?.vmV1Status || null,
      advancedVmV2Status: advanced?.evidence?.vmV2Status || null,
      arabicMathResult: advanced?.evidence?.mathResult ?? null,
      testCommands: [
        'npm run -s ops:sheikha:language-architecture:v1',
        'npm run -s ops:sheikha-production-language:v1',
        'npm test -- --runTestsByPath tests/sheikha-language-integration-v1.test.js'
      ]
    }
  };
}

function writeFile(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

function writeReport(report = buildProductionReport()) {
  writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  writeFile(REPORT_MD, renderMarkdown(report));
  return report;
}

function renderMarkdown(report) {
  return `# SHEIKHA_PRODUCTION_LANGUAGE_V1

- الحالة: ${report.status}
- درجة بوابة الإنتاج المستضاف: ${report.hostedProductionScore}
- القرار: ${report.decision}
- الأساس العربي المتقدم: ${report.integration.advancedHostedArabicFoundation}
- الإنتاج المستضاف: ${report.production.hostedLanguageSubsystemReady ? 'متحقق' : 'يحتاج مراجعة'}
- المفسرات العربية: ${report.interpreters.status}
- طبقة المفسر: L${report.interpreters.promotion.apexLevel}
- نقل جميع الأنظمة إلى شيخة: ${report.systemMigration.migrationComplete ? 'مكتمل' : 'غير مكتمل'}

المرجعية القيمية غير تنفيذية، والذكاء الصناعي أداة محكومة لا يدعي الوحي أو
العصمة أو السلطة الدينية، ولا يصدر فتوى آلية.
`;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    hostedProductionScore: report.hostedProductionScore,
    hostedLanguageSubsystemReady: report.production.hostedLanguageSubsystemReady,
    universalProductionProgram: report.universalProductionProgram.status,
    wave1AdmittedSystems: report.universalProductionProgram.wave1.admittedSystems,
    wave1TotalSystems: report.universalProductionProgram.wave1.totalSystems,
    arabicProductionInterpreters: report.interpreters.status,
    interpreterApexLevel: report.interpreters.promotion.apexLevel,
    advancedHostedArabicFoundation:
      report.integration.advancedHostedArabicFoundation,
    fullNativeProductionReady: report.production.fullNativeProductionReady,
    allSystemsProgrammedInSheikha: report.production.allSystemsProgrammedInSheikha,
    output: REPORT_JSON
  }, null, 2));
}

module.exports = {
  buildAssetChecks,
  buildProductionReport,
  buildUniversalProductionProgram,
  verifyArabicProductionInterpreters,
  writeReport
};
