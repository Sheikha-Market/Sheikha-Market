'use strict';

const contract = require('../runtime/sheikha-language-integration/sheikha-language-integration-v1.json');
const {
  compileArabicProgram
} = require('../core/language/sheikha-arabic/compiler/compile-arabic-program');
const {
  runArabicProgram
} = require('../core/language/sheikha-arabic/vm/run-arabic-program');
const {
  runArabicV2
} = require('../core/language/sheikha-arabic/vm/v2/run-arabic-v2');
const activation = require(
  '../tools/activation/activate-sheikha-native-language-architecture-v1'
);
const production = require(
  '../tools/sheikha-production-language/sheikha-production-language-v1'
);
const {
  interpretSheikhaArabicProduction,
  INTERPRETER_MODES
} = require('../core/language/sheikha-arabic-runtime/sheikha-language-runtime');

const ARABIC_ACCOUNTING_INPUT =
  'حوّل المورد مبلغًا من حساب_المشتري إلى حساب_سوق_شيخة';

describe('Sheikha Language Integration V1', () => {
  test('activates governed Arabic DSL integration', () => {
    expect(contract.status).toBe('ACTIVE');
    expect(contract.mode).toBe('ARABIC_DSL_GOVERNED_PROGRAMMING_INTEGRATION');
  });

  test('connects language with governance and runtime layers', () => {
    expect(contract.integrationTargets).toContain('governance_engine');
    expect(contract.integrationTargets).toContain('sheikha_os');
    expect(contract.integrationTargets).toContain('hpc_runtime');
    expect(contract.integrationTargets).toContain('master_log');
  });

  test('blocks unverifiable language claims', () => {
    expect(contract.blockedClaims).toContain('language_ready_without_compiler_check');
    expect(contract.blockedClaims).toContain('production_ready_without_truth_gate');
  });

  test('compiles the prior Arabic accounting language into AST and IR', () => {
    const compiled = compileArabicProgram(ARABIC_ACCOUNTING_INPUT);

    expect(compiled.status).toBe('PROGRAM_COMPILED');
    expect(compiled.accounting.ast.type).toBe('SheikhaArabicProgram');
    expect(compiled.accounting.ir).toMatchObject({
      type: 'SheikhaArabicIR',
      decision: 'IR_READY_FOR_EXECUTION'
    });
  });

  test('executes both prior Arabic bytecode runtimes with ledger evidence', () => {
    const vmV1 = runArabicProgram(ARABIC_ACCOUNTING_INPUT);
    const vmV2 = runArabicV2(ARABIC_ACCOUNTING_INPUT);

    expect(vmV1.result.status).toBe('EXECUTED');
    expect(vmV1.result.state.ledgerEntries).toHaveLength(1);
    expect(vmV2.program.status).toBe('BYTECODE_READY');
    expect(vmV2.result.status).toBe('EXECUTED');
    expect(vmV2.result.ledger).toHaveLength(1);
  });

  test('discovers the advanced hosted foundation without native completion claims', () => {
    const inventory = activation.buildHostedArabicLanguageInventory();
    const verification = activation.verifyAdvancedHostedArabicFoundation();

    expect(inventory).toMatchObject({
      classification: 'ADVANCED_HOSTED_ARABIC_LANGUAGE_IMPLEMENTATION',
      hostRuntime: 'Node.js'
    });
    expect(inventory.javascriptImplementationFiles).toBeGreaterThanOrEqual(60);
    expect(inventory.executableSourceLines).toBeGreaterThanOrEqual(2500);
    expect(verification).toMatchObject({
      status: 'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED',
      score: 100,
      boundary: {
        advancedHostedImplementationExists: true,
        hostRuntime: 'Node.js',
        selfHostedCompilerProven: false,
        nativeMachineCodeBackendProven: false,
        generalPurposeNativeOperatingSystemProven: false
      }
    });
    expect(Object.values(verification.checks).every(Boolean)).toBe(true);
  });

  test('passes the governed hosted production gate without claiming all-system migration', () => {
    const report = production.buildProductionReport();

    expect(report).toMatchObject({
      status: 'HOSTED_PRODUCTION_GATE_PASSED_NATIVE_SYSTEM_MIGRATION_REQUIRED',
      hostedProductionScore: 100,
      decision: 'SHEIKHA_HOSTED_PRODUCTION_VERIFIED_WITH_GOVERNED_AI',
      production: {
        hostedLanguageSubsystemReady: true,
        universalProductionProgramStarted: true,
        hostedFoundationWave1Admitted: true,
        allSystemsProgrammedInSheikha: false,
        fullNativeProductionReady: false,
        automaticMigrationOrExecution: false
      },
      governance: {
        valuesReferenceExecutable: false,
        softwareClaimsDivineAuthority: false,
        aiIsReligiousAuthority: false,
        automatedFatwaAllowed: false,
        qualifiedScholarReviewForReligiousRulings: true
      },
      systemMigration: {
        status: 'MEASURED_MIGRATION_REQUIRED',
        migrationComplete: false,
        completionClaimAllowed: false
      }
    });
    expect(report.universalProductionProgram).toMatchObject({
      status: 'STARTED_WITH_VERIFIED_HOSTED_FOUNDATION_WAVE_1',
      declaredPurposeIsMachineVerifiableIntention: false,
      scope: 'ALL_CATALOGED_APPROVED_SHEIKHA_SYSTEMS',
      unboundedOrAbsoluteExecutionAllowed: false,
      automaticGlobalCutoverAllowed: false,
      wave1: {
        status: 'HOSTED_PRODUCTION_ADMISSION_PASSED',
        totalSystems: 7,
        admittedSystems: 7,
        rejectedOrReviewSystems: 0
      },
      universalCompletion: {
        allCatalogedSystemsMigrated: false,
        fullNativeCutoverComplete: false,
        completionClaimAllowed: false
      }
    });
    expect(report.universalProductionProgram.wave1.systems.every((system) => (
      system.admitted && system.checks.sourcePresent &&
      system.checks.testsPresent && system.checks.evidencePresent
    ))).toBe(true);
    expect(Object.values(report.checks.execution).every(Boolean)).toBe(true);
    expect(Object.values(report.checks.governance).every(Boolean)).toBe(true);
    expect(report.systemMigration.catalogedImplementationSourceFiles).toBeGreaterThan(1000);
    expect(report.interpreters).toMatchObject({
      status: 'ARABIC_PRIMARY_INTERPRETERS_VERIFIED',
      score: 100,
      boundary: {
        arabicPrimaryAcrossAllModes: true,
        unrestrictedExecution: false,
        externalExecution: false,
        automatedFatwaAllowed: false
      },
      promotion: {
        apexLevel: 97,
        layer: 'SHEIKHA_ARABIC_PRODUCTION_INTERPRETER_APEX_L97',
        scope: 'HOSTED_LANGUAGE_PRODUCTION_PLANE_ONLY',
        aboveArabicFabricsV91ToV96: true,
        crossPlaneAuthorityEscalation: false
      }
    });
  });

  test('interprets all Arabic production modes inside the governed boundary', () => {
    const sheikha = interpretSheikhaArabicProduction([
      'إجراء تشغيل:',
      '  اعرض "SHEIKHA_ARABIC_INTERPRETER_OK"',
      ''
    ].join('\n'), { mode: 'sheikha-program' });
    const accounting = interpretSheikhaArabicProduction(
      ARABIC_ACCOUNTING_INPUT,
      { mode: 'auto' }
    );
    const math = interpretSheikhaArabicProduction('٢ زائد ٣', { mode: 'auto' });
    const command = interpretSheikhaArabicProduction('تحقق حالة النظام', {
      mode: 'auto'
    });
    const religious = interpretSheikhaArabicProduction('أفتني في حكم شرعي', {
      mode: 'auto'
    });

    expect(INTERPRETER_MODES).toEqual(expect.arrayContaining([
      'auto', 'sheikha-program', 'arabic-accounting', 'arabic-math', 'arabic-command'
    ]));
    expect(sheikha).toMatchObject({
      status: 'INTERPRETED',
      mode: 'sheikha-program',
      arabicPrimary: true,
      externalExecution: false
    });
    expect(sheikha.output).toContain('"SHEIKHA_ARABIC_INTERPRETER_OK"');
    expect(accounting).toMatchObject({
      status: 'INTERPRETED',
      mode: 'arabic-accounting'
    });
    expect(math).toMatchObject({
      status: 'INTERPRETED',
      mode: 'arabic-math',
      value: 5
    });
    expect(command).toMatchObject({
      status: 'INTERPRETED_DRY_RUN',
      mode: 'arabic-command',
      executionAllowed: false
    });
    expect(religious).toMatchObject({
      status: 'QUALIFIED_REVIEW_REQUIRED',
      executionAllowed: false,
      automatedFatwaAllowed: false
    });
  });
});
