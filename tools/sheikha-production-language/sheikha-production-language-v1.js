'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildReport: buildLanguageArchitectureReport
} = require('../activation/activate-sheikha-native-language-architecture-v1');
const {
  buildIslamicAIKernel
} = require('../../core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1');

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

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function buildAssetChecks() {
  return Object.fromEntries(
    Object.entries(REQUIRED_ASSETS).map(([name, relativePath]) => [name, exists(relativePath)])
  );
}

function buildProductionReport() {
  const architecture = buildLanguageArchitectureReport();
  const advanced = architecture.advancedHostedArabicFoundation;
  const kernel = buildIslamicAIKernel({
    purpose: 'SHEIKHA_LANGUAGE_HOSTED_PRODUCTION_GATE'
  });
  const assetChecks = buildAssetChecks();

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
    fabricsV91ToV96Passed: advanced?.checks?.fabricsV91ToV96Active === true
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
        '/api/governance/generator/sheikha-language-production'
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
  writeReport
};
