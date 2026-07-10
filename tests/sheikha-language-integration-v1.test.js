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
});
