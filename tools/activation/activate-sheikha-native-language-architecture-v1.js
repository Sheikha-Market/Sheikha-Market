'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { loadSourceProgram } = require('../../sheikha-language/compiler/source-loader');
const { lowerToIR } = require('../../sheikha-language/compiler/ir');
const { typeCheckAst } = require('../../sheikha-language/compiler/type-checker');
const { compileIRToBytecode } = require('../../sheikha-language/compiler/bytecode');
const { runBytecode } = require('../../sheikha-language/compiler/bytecode-vm');
const { listTargets } = require('../../sheikha-language/compiler/target-generators');
const { buildIslamicAIKernel } = require('../../core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1');
const {
  compileArabicProgram
} = require('../../core/language/sheikha-arabic/compiler/compile-arabic-program');
const {
  evaluateSimpleArabicMath
} = require('../../core/language/sheikha-arabic/math/arabic-math-evaluator');
const {
  normalizeArabicNumbers,
  parseArabicNumber
} = require('../../core/language/sheikha-arabic/math/arabic-number-system');
const {
  runArabicProgram
} = require('../../core/language/sheikha-arabic/vm/run-arabic-program');
const {
  runArabicV2
} = require('../../core/language/sheikha-arabic/vm/v2/run-arabic-v2');
const {
  SheikhaLanguageStack
} = require('../../runtime/sheikha-language-stack/sheikha-language-stack');

const ROOT = process.cwd();
const SOURCE_PATH = 'sheikha-language/system/sheikha-sovereign-architecture-v1.shk';
const RUNTIME_DIR = 'runtime/sheikha-language-architecture/v1';
const REPORT_PATH = `${RUNTIME_DIR}/sheikha-native-language-architecture-v1-report.json`;
const EVIDENCE_DIR = `${RUNTIME_DIR}/evidence`;

const CODE_EXTENSIONS = new Set([
  '.c', '.cc', '.cjs', '.cpp', '.cs', '.go', '.h', '.java', '.js', '.jsx', '.kt',
  '.mjs', '.php', '.py', '.rs', '.sh', '.sheikha', '.shk', '.ts', '.tsx'
]);
const SHEIKHA_EXTENSIONS = new Set(['.sheikha', '.shk']);
const INVENTORY_EXCLUDES = [
  '.git/',
  'archive/',
  'archives/',
  'backups/',
  'bare-metal/build/out/',
  'dist/',
  'node_modules/',
  'runtime/bus/events/'
];
const SKIP_DIRECTORY_NAMES = new Set([
  '.cache', '.git', '.venv', 'archive', 'archives', 'backups', 'build', 'bundles',
  'coverage', 'dist', 'exports', 'node_modules', 'release', 'releases', 'reports',
  'sheikha-main-portal-restored', 'venv'
]);
const HOSTED_ARABIC_LANGUAGE_PREFIXES = [
  'core/language/arabic/',
  'core/language/sheikha-arabic-runtime/',
  'core/language/sheikha-arabic/',
  'runtime/arabic-compiler-fabric/',
  'runtime/arabic-language-cluster-fabric/',
  'runtime/arabic-package-manager-fabric/',
  'runtime/arabic-runtime-fabric/',
  'runtime/arabic-standard-library-fabric/',
  'runtime/arabic-type-system-fabric/',
  'runtime/sheikha-language-production/',
  'runtime/sheikha-language-stack/',
  'runtime/sheikha-production-language/',
  'runtime/sheikha-programming-language-universal/'
];
const ARABIC_FABRIC_MODULES = [
  ['V91', '../../runtime/arabic-language-cluster-fabric/v91/sheikha-arabic-language-cluster-fabric-v91'],
  ['V92', '../../runtime/arabic-compiler-fabric/v92/sheikha-arabic-compiler-fabric-v92'],
  ['V93', '../../runtime/arabic-type-system-fabric/v93/sheikha-arabic-type-system-fabric-v93'],
  ['V94', '../../runtime/arabic-standard-library-fabric/v94/sheikha-arabic-standard-library-fabric-v94'],
  ['V95', '../../runtime/arabic-runtime-fabric/v95/sheikha-arabic-runtime-fabric-v95'],
  ['V96', '../../runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96']
];

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function repositoryFiles() {
  const files = [];
  walk(ROOT, '', files);
  return files.sort();
}

function walk(directory, relativeDirectory, files) {
  let entries = [];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (_) {
    return;
  }

  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORY_NAMES.has(entry.name) || isExcluded(`${relativePath}/`)) continue;
      walk(path.join(directory, entry.name), relativePath, files);
      continue;
    }
    if (entry.isFile()) files.push(relativePath);
  }
}

function isExcluded(filePath) {
  return INVENTORY_EXCLUDES.some((prefix) => filePath.startsWith(prefix));
}

function isGeneratedOrExample(filePath) {
  return filePath.startsWith('docs/') ||
    filePath.startsWith('tests/') ||
    filePath.includes('/tests/') ||
    filePath.includes('/examples/') ||
    filePath.includes('.generated.') ||
    /\.test\.[^.]+$/i.test(filePath);
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(resolve(filePath), 'utf8');
    if (!content) return 0;
    return content.split(/\r?\n/).length;
  } catch (_) {
    return 0;
  }
}

function buildSourceInventory(files = repositoryFiles()) {
  const codeFiles = files.filter((filePath) => (
    !isExcluded(filePath) && CODE_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  ));
  const sheikhaSources = codeFiles.filter((filePath) => (
    SHEIKHA_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  ));
  const implementationSources = codeFiles.filter((filePath) => !isGeneratedOrExample(filePath));
  const sheikhaImplementationSources = implementationSources.filter((filePath) => (
    SHEIKHA_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  ));
  const hostImplementationSources = implementationSources.filter((filePath) => (
    !SHEIKHA_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  ));
  const nativeKernelSources = implementationSources.filter((filePath) => (
    filePath.startsWith('bare-metal/') && ['.c', '.h'].includes(path.extname(filePath))
  ));
  const compilerBootstrapSources = implementationSources.filter((filePath) => (
    filePath.startsWith('sheikha-language/compiler/') && path.extname(filePath) === '.js'
  ));

  const sheikhaImplementationLines = sheikhaImplementationSources
    .reduce((total, filePath) => total + countLines(filePath), 0);
  const hostImplementationLines = hostImplementationSources
    .reduce((total, filePath) => total + countLines(filePath), 0);
  const implementationLines = sheikhaImplementationLines + hostImplementationLines;

  return {
    codeFiles: codeFiles.length,
    implementationSourceFiles: implementationSources.length,
    sheikhaSourceFiles: sheikhaSources.length,
    sheikhaImplementationSourceFiles: sheikhaImplementationSources.length,
    sheikhaExampleAndDocumentationFiles:
      sheikhaSources.length - sheikhaImplementationSources.length,
    hostImplementationSourceFiles: hostImplementationSources.length,
    nativeKernelCHeaderFiles: nativeKernelSources.length,
    compilerBootstrapJavaScriptFiles: compilerBootstrapSources.length,
    sheikhaImplementationLines,
    hostImplementationLines,
    implementationLines,
    sheikhaImplementationFileSharePercent: implementationSources.length
      ? Number(((sheikhaImplementationSources.length / implementationSources.length) * 100).toFixed(4))
      : 0,
    sheikhaImplementationLineSharePercent: implementationLines
      ? Number(((sheikhaImplementationLines / implementationLines) * 100).toFixed(4))
      : 0,
    sheikhaSources,
    sheikhaImplementationSources,
    nativeKernelSources,
    compilerBootstrapSources
  };
}

function buildHostedArabicLanguageInventory(files = repositoryFiles()) {
  const componentFiles = files.filter((filePath) => (
    HOSTED_ARABIC_LANGUAGE_PREFIXES.some((prefix) => filePath.startsWith(prefix))
  ));
  const javascriptFiles = componentFiles.filter((filePath) => path.extname(filePath) === '.js');
  const jsonFiles = componentFiles.filter((filePath) => path.extname(filePath) === '.json');
  const executableSourceLines = javascriptFiles
    .reduce((total, filePath) => total + countLines(filePath), 0);

  return {
    classification: 'ADVANCED_HOSTED_ARABIC_LANGUAGE_IMPLEMENTATION',
    hostRuntime: 'Node.js',
    componentFiles: componentFiles.length,
    javascriptImplementationFiles: javascriptFiles.length,
    jsonContractAndRegistryFiles: jsonFiles.length,
    executableSourceLines,
    componentRoots: HOSTED_ARABIC_LANGUAGE_PREFIXES,
    files: componentFiles
  };
}

function verifyAdvancedHostedArabicFoundation() {
  const accountingInput =
    'حوّل المورد مبلغًا من حساب_المشتري إلى حساب_سوق_شيخة';

  try {
    const compiler = compileArabicProgram(accountingInput);
    const vmV1 = runArabicProgram(accountingInput);
    const vmV2 = runArabicV2(accountingInput);
    const math = evaluateSimpleArabicMath('٢ زائد ٣');
    const languageStack = new SheikhaLanguageStack().compile(
      'نظام:\n"إدارة البيانات"\nمصدر:\njson',
      'json'
    );
    const fabricStatuses = Object.fromEntries(ARABIC_FABRIC_MODULES.map(([version, modulePath]) => {
      const moduleStatus = require(modulePath).status();
      return [version, {
        system: moduleStatus.system,
        status: moduleStatus.status,
        apexLevel: moduleStatus.apexLevel
      }];
    }));

    const checks = {
      arabicProgramCompiled: compiler.status === 'PROGRAM_COMPILED' &&
        compiler.accounting?.ir?.decision === 'IR_READY_FOR_EXECUTION',
      arabicAstGenerated: compiler.accounting?.ast?.type === 'SheikhaArabicProgram',
      arabicIrGenerated: compiler.accounting?.ir?.type === 'SheikhaArabicIR',
      arabicVmV1Executed: vmV1.result?.status === 'EXECUTED' &&
        vmV1.result?.state?.ledgerEntries?.length === 1,
      arabicVmV2Executed: vmV2.program?.status === 'BYTECODE_READY' &&
        vmV2.result?.status === 'EXECUTED' &&
        vmV2.result?.ledger?.length === 1,
      arabicMathEvaluated: math.status === 'EVALUATED' && math.result === 5,
      arabicNumberNormalizationVerified:
        normalizeArabicNumbers('١۲3') === '123' && parseArabicNumber('١۲3') === 123,
      languageStackCompiled: languageStack.status === 'COMPILED' &&
        languageStack.semantic?.status === 'SEMANTICALLY_VALID' &&
        languageStack.code?.status === 'CODE_GENERATED',
      fabricsV91ToV96Active: Object.values(fabricStatuses).every((entry) => (
        entry.status === 'ACTIVE'
      ))
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passed / Object.keys(checks).length) * 100);

    return {
      system: 'SHEIKHA_ADVANCED_HOSTED_ARABIC_FOUNDATION_V1',
      status: score === 100
        ? 'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED'
        : 'ADVANCED_HOSTED_ARABIC_FOUNDATION_REVIEW_REQUIRED',
      score,
      checks,
      fabricStatuses,
      evidence: {
        accountingInput,
        compilerStatus: compiler.status,
        astType: compiler.accounting?.ast?.type || null,
        irType: compiler.accounting?.ir?.type || null,
        vmV1Status: vmV1.result?.status || null,
        vmV1LedgerEntries: vmV1.result?.state?.ledgerEntries?.length || 0,
        vmV2BytecodeStatus: vmV2.program?.status || null,
        vmV2Status: vmV2.result?.status || null,
        vmV2LedgerEntries: vmV2.result?.ledger?.length || 0,
        mathInput: math.input,
        mathResult: math.result,
        languageStackStatus: languageStack.status
      },
      boundary: {
        advancedHostedImplementationExists: true,
        hostRuntime: 'Node.js',
        selfHostedCompilerProven: false,
        nativeMachineCodeBackendProven: false,
        generalPurposeNativeOperatingSystemProven: false
      }
    };
  } catch (error) {
    return {
      system: 'SHEIKHA_ADVANCED_HOSTED_ARABIC_FOUNDATION_V1',
      status: 'ADVANCED_HOSTED_ARABIC_FOUNDATION_EXECUTION_FAILED',
      score: 0,
      checks: {},
      error: String(error?.stack || error?.message || error),
      boundary: {
        advancedHostedImplementationExists: true,
        executionVerified: false
      }
    };
  }
}

function buildMigrationStages(targets) {
  const nativeTargetAvailable = targets.some((target) => (
    ['elf', 'native', 'uefi', 'wasm'].includes(target)
  ));
  return [
    { id: 'SLA-01', stage: 'canonical_sheikha_architecture_source', status: 'VERIFIED' },
    {
      id: 'SLA-01B',
      stage: 'formal_non_executable_values_reference_and_governance_policy',
      status: 'VERIFIED'
    },
    {
      id: 'SLA-01C',
      stage: 'formal_arabic_science_and_reasoning_methodology',
      status: 'VERIFIED'
    },
    { id: 'SLA-02', stage: 'lexer_parser_types_ir_bytecode', status: 'VERIFIED_NODE_BOOTSTRAPPED' },
    { id: 'SLA-03', stage: 'governed_compiled_vm', status: 'VERIFIED_NODE_BOOTSTRAPPED' },
    { id: 'SLA-04', stage: 'semantic_manifest_language_adapters', status: 'VERIFIED_HOST_BRIDGE' },
    {
      id: 'SLA-04A',
      stage: 'advanced_hosted_arabic_compiler_runtime_vm_math_and_v91_v96_fabrics',
      status: 'VERIFIED_NODE_HOSTED'
    },
    { id: 'SLA-05', stage: 'self_hosted_sheikha_compiler', status: 'NOT_IMPLEMENTED' },
    {
      id: 'SLA-06',
      stage: 'native_machine_code_or_uefi_backend',
      status: nativeTargetAvailable ? 'AVAILABLE_REQUIRES_QUALIFICATION' : 'NOT_IMPLEMENTED'
    },
    { id: 'SLA-07', stage: 'native_standard_library_and_hal', status: 'NOT_IMPLEMENTED' },
    { id: 'SLA-08', stage: 'kernel_and_driver_port_to_sheikha', status: 'NOT_IMPLEMENTED' },
    { id: 'SLA-09', stage: 'core_service_port_to_sheikha', status: 'NOT_STARTED' },
    { id: 'SLA-10', stage: 'node_linux_host_removal_from_kernel_path', status: 'NOT_READY' },
    { id: 'SLA-11', stage: 'physical_hardware_and_multi_arch_qualification', status: 'NOT_COMPLETE' }
  ];
}

function buildReport() {
  const sourceProgram = loadSourceProgram(SOURCE_PATH);
  const ast = sourceProgram.ast;
  const typeCheck = typeCheckAst(ast);
  const ir = lowerToIR(ast);
  const bytecode = compileIRToBytecode(ir);
  const vm = runBytecode(bytecode, { profile: 'local', strictIsolation: true });
  const repositoryInventoryFiles = repositoryFiles();
  const inventory = buildSourceInventory(repositoryInventoryFiles);
  const hostedArabicLanguageInventory = buildHostedArabicLanguageInventory(
    repositoryInventoryFiles
  );
  const advancedHostedArabicFoundation = verifyAdvancedHostedArabicFoundation();
  const targets = listTargets();
  const migrationStages = buildMigrationStages(targets);
  const islamicAiKernel = buildIslamicAIKernel();
  const entityNames = ast.body
    .filter((node) => node.type === 'EntityDeclaration')
    .map((node) => node.name);
  const procedureNames = ast.body
    .filter((node) => node.type === 'ProcedureDeclaration')
    .map((node) => node.name);
  const valuesReferenceNames = ast.body
    .filter((node) => node.type === 'ValuesReferenceDeclaration')
    .map((node) => node.name);
  const governancePolicyNames = ast.body
    .filter((node) => node.type === 'GovernancePolicyDeclaration')
    .map((node) => node.name);
  const reasoningMethodologyNames = ast.body
    .filter((node) => node.type === 'ReasoningMethodologyDeclaration')
    .map((node) => node.name);

  const checks = {
    canonicalSourceIsSheikha: sourceProgram.sourceLanguage === 'sheikha' &&
      sourceProgram.sourceKind === 'shk',
    architectureEntitiesPresent: entityNames.length >= 5,
    architectureProceduresPresent: procedureNames.length >= 3,
    formalValuesReferencePresent: valuesReferenceNames.includes('القيم_العليا'),
    formalGovernancePolicyPresent:
      governancePolicyNames.includes('الخير_والنفع_العام'),
    formalArabicScienceReasoningMethodologyPresent:
      reasoningMethodologyNames.includes('العربية_والعلوم_والاستدلال'),
    typeCheckPassed: typeCheck.ok === true,
    irGenerated: ir.type === 'SheikhaIR' && ir.steps.length > 0,
    bytecodeGenerated: bytecode.instructions.length > 0,
    vmPassed: vm.ok === true && vm.state.governance.violations.length === 0,
    valuesReferenceRegisteredAsNonExecutable:
      vm.state.valuesReferences?.['القيم_العليا']?.executable === false,
    governancePolicyEnforcedAtRuntime: vm.state.governance.checks.some((entry) => (
      entry.rule === 'public-benefit-governance-policy' && entry.status === 'pass'
    )),
    reasoningMethodologyEnforcedAtRuntime: vm.state.governance.checks.some((entry) => (
      entry.rule === 'arabic-science-reasoning-methodology' && entry.status === 'pass'
    )),
    foundationMarkerEmitted: vm.state.output.some((line) => (
      line.includes('SHEIKHA_LANGUAGE_ARCHITECTURE_FOUNDATION_OK')
    )),
    islamicAiGovernanceLinked:
      islamicAiKernel.governance?.noHarm === true &&
      islamicAiKernel.governance?.scholarsReviewForReligiousRulings === true,
    rootAuthorityEvidencePresent: exists(
      'runtime/root-authority-layer/v1/sheikha-root-authority-layer-v1.json'
    ),
    bareMetalContractsPresent: [
      'bare-metal/contracts/SHEIKHA-BOOT-CONTRACT-V1.json',
      'bare-metal/contracts/SHEIKHA-KERNEL-CONTRACT-V1.json',
      'bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json',
      'bare-metal/contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json'
    ].every(exists),
    publicBenefitBoundaryLinked: exists(
      'runtime/governance-generator/v1/registries/public-benefit-capability-policy-v1.json'
    ),
    priorAdvancedHostedArabicFoundationDiscovered:
      hostedArabicLanguageInventory.javascriptImplementationFiles >= 60 &&
      hostedArabicLanguageInventory.executableSourceLines >= 2500,
    priorAdvancedHostedArabicFoundationExecuted:
      advancedHostedArabicFoundation.status ===
        'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED' &&
      advancedHostedArabicFoundation.score === 100
  };
  const passedChecks = Object.values(checks).filter(Boolean).length;

  return {
    system: 'SHEIKHA_NATIVE_LANGUAGE_ARCHITECTURE_V1',
    status: passedChecks === Object.keys(checks).length
      ? 'FOUNDATION_ACTIVE_FULL_NATIVE_MIGRATION_REQUIRED'
      : 'FOUNDATION_REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    foundationScore: Math.round((passedChecks / Object.keys(checks).length) * 100),
    checks,
    source: {
      path: SOURCE_PATH,
      language: sourceProgram.sourceLanguage,
      kind: sourceProgram.sourceKind,
      valuesReferences: valuesReferenceNames,
      governancePolicies: governancePolicyNames,
      reasoningMethodologies: reasoningMethodologyNames,
      entities: entityNames,
      procedures: procedureNames
    },
    compiler: {
      bootstrapRuntime: 'Node.js',
      supportedTargets: targets,
      selfHosted: false,
      nativeTargetAvailable: targets.some((target) => (
        ['elf', 'native', 'uefi', 'wasm'].includes(target)
      )),
      typeCheckPassed: typeCheck.ok,
      irSteps: ir.steps.length,
      bytecodeInstructions: bytecode.instructions.length,
      vmStatus: vm.status,
      governanceViolations: vm.state.governance.violations.length,
      valuesReferences: valuesReferenceNames.length,
      governancePolicies: governancePolicyNames.length,
      reasoningMethodologies: reasoningMethodologyNames.length
    },
    sourceInventory: inventory,
    hostedArabicLanguageInventory,
    advancedHostedArabicFoundation,
    currentImplementationBoundary: {
      valuesReference: 'QURAN_AND_AUTHENTIC_SUNNAH_VALUES_NON_EXECUTABLE_REFERENCE',
      valuesReferenceIsFirstClassLanguageDeclaration: true,
      governancePolicyIsFirstClassLanguageDeclaration: true,
      reasoningMethodologyIsFirstClassLanguageDeclaration: true,
      priorAdvancedHostedArabicFoundationRecognized: true,
      priorAdvancedHostedCompilerRuntimeVmVerified:
        advancedHostedArabicFoundation.score === 100,
      softwareIsReligiousAuthority: false,
      aiRole: 'GOVERNED_ANALYSIS_AND_ASSISTANCE_ONLY',
      automatedFatwaAllowed: false,
      currentPortalRuntime: 'NODE_JS_EXPRESS_PM2',
      compilerRequiresNodeToday: true,
      bareMetalSeedImplementation: 'C_UEFI_X86_64',
      linuxRequiredForPortalRuntimeToday: true,
      completeArchitectureProgrammedInSheikhaToday: false,
      allSystemsPortedToSheikhaToday: false,
      fullGeneralPurposeBareMetalOsCompleteToday: false,
      physicalHardwareQualificationCompleteToday: false
    },
    migrationStages,
    completionGate: {
      nativeMigrationComplete: false,
      allowedCompletionClaimToday: false,
      blockers: migrationStages
        .filter((stage) => !stage.status.startsWith('VERIFIED'))
        .map((stage) => stage.id),
      requiredForCompletion: [
        'self_hosted_sheikha_compiler',
        'native_machine_code_backend',
        'native_standard_library_and_hal',
        'kernel_and_driver_port',
        'core_service_port',
        'remove_node_linux_from_kernel_path',
        'physical_hardware_and_multi_arch_qualification'
      ]
    },
    governance: {
      divineJudgmentBelief: 'الحكم لله وحده',
      valuesReferenceExecutable: false,
      systemClaimsDivineAuthority: false,
      noRevelationOrInfallibilityClaim: true,
      noAutomatedFatwa: true,
      qualifiedScholarReviewForReligiousRulings: true,
      evidenceBeforeTechnicalClaim: true,
      noHarm: true,
      humanFinalDecisionForHighImpact: true,
      languageTypeChecksGovernanceBoundaries: true,
      vmEnforcesGovernanceBoundaries: true,
      arabicLanguageSciencesDeclared: true,
      mathematicalProofMethodDeclared: true,
      empiricalScienceMethodDeclared: true,
      domainEvidenceSeparationEnforced: true
    },
    evidence: {
      ast: `${EVIDENCE_DIR}/sheikha-sovereign-architecture-v1.ast.json`,
      ir: `${EVIDENCE_DIR}/sheikha-sovereign-architecture-v1.ir.json`,
      types: `${EVIDENCE_DIR}/sheikha-sovereign-architecture-v1.types.json`,
      bytecode: `${EVIDENCE_DIR}/sheikha-sovereign-architecture-v1.bytecode.json`,
      run: `${EVIDENCE_DIR}/sheikha-sovereign-architecture-v1.run.json`
    },
    __artifacts: { ast, ir, typeCheck, bytecode, vm }
  };
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(resolve(relativePath)), { recursive: true });
  fs.writeFileSync(resolve(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeReport(report = buildReport()) {
  const artifacts = report.__artifacts;
  writeJson(report.evidence.ast, artifacts.ast);
  writeJson(report.evidence.ir, artifacts.ir);
  writeJson(report.evidence.types, artifacts.typeCheck);
  writeJson(report.evidence.bytecode, artifacts.bytecode);
  writeJson(report.evidence.run, {
    success: artifacts.vm.ok,
    status: artifacts.vm.status,
    output: artifacts.vm.state.output,
    governance: artifacts.vm.state.governance,
    valuesReferences: artifacts.vm.state.valuesReferences,
    governancePolicies: artifacts.vm.state.governancePolicies,
    reasoningMethodologies: artifacts.vm.state.reasoningMethodologies,
    sandbox: artifacts.vm.state.sandbox,
    neural: artifacts.vm.state.neural
  });
  const serialized = { ...report };
  delete serialized.__artifacts;
  writeJson(REPORT_PATH, serialized);
  return serialized;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    foundationScore: report.foundationScore,
    sheikhaImplementationSourceFiles:
      report.sourceInventory.sheikhaImplementationSourceFiles,
    hostImplementationSourceFiles:
      report.sourceInventory.hostImplementationSourceFiles,
    sheikhaImplementationLineSharePercent:
      report.sourceInventory.sheikhaImplementationLineSharePercent,
    compilerSelfHosted: report.compiler.selfHosted,
    nativeTargetAvailable: report.compiler.nativeTargetAvailable,
    fullNativeMigrationComplete: report.completionGate.nativeMigrationComplete,
    advancedHostedArabicFoundationStatus:
      report.advancedHostedArabicFoundation.status,
    advancedHostedArabicFoundationScore:
      report.advancedHostedArabicFoundation.score,
    hostedArabicLanguageJavaScriptFiles:
      report.hostedArabicLanguageInventory.javascriptImplementationFiles,
    output: REPORT_PATH
  }, null, 2));
}

module.exports = {
  buildMigrationStages,
  buildReport,
  buildHostedArabicLanguageInventory,
  buildSourceInventory,
  repositoryFiles,
  verifyAdvancedHostedArabicFoundation,
  writeReport
};
