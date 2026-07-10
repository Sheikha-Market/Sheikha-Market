'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { loadSourceProgram } = require('../sheikha-language/compiler/source-loader');
const { lowerToIR } = require('../sheikha-language/compiler/ir');
const { typeCheckAst } = require('../sheikha-language/compiler/type-checker');
const { compileIRToBytecode } = require('../sheikha-language/compiler/bytecode');
const { runBytecode } = require('../sheikha-language/compiler/bytecode-vm');
const { generateTarget } = require('../sheikha-language/compiler/target-generators');
const activation = require(
  '../tools/activation/activate-sheikha-native-language-architecture-v1'
);

const ROOT = path.join(__dirname, '..');
const SOURCE = 'sheikha-language/system/sheikha-sovereign-architecture-v1.shk';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

describe('Sheikha Native Language Architecture V1', () => {
  test('compiles and executes the canonical architecture as native Sheikha source', () => {
    const sourceProgram = loadSourceProgram(SOURCE);
    const typeCheck = typeCheckAst(sourceProgram.ast);
    const ir = lowerToIR(sourceProgram.ast);
    const bytecode = compileIRToBytecode(ir);
    const vm = runBytecode(bytecode, { profile: 'local', strictIsolation: true });

    expect(sourceProgram).toMatchObject({
      sourceLanguage: 'sheikha',
      sourceKind: 'shk'
    });
    expect(typeCheck.ok).toBe(true);
    expect(ir.meta.sourceLanguage).toBe('sheikha');
    expect(bytecode.instructions.length).toBeGreaterThan(0);
    expect(vm.ok).toBe(true);
    expect(vm.state.governance.violations).toEqual([]);
    expect(vm.state.valuesReferences['القيم_العليا']).toMatchObject({
      executable: false
    });
    expect(vm.state.governancePolicies['الخير_والنفع_العام']).toBeDefined();
    expect(vm.state.reasoningMethodologies['العربية_والعلوم_والاستدلال']).toBeDefined();
    expect(vm.state.governance.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        rule: 'non-executable-values-reference',
        status: 'pass'
      }),
      expect.objectContaining({
        rule: 'public-benefit-governance-policy',
        status: 'pass'
      }),
      expect.objectContaining({
        rule: 'arabic-science-reasoning-methodology',
        status: 'pass'
      })
    ]));
    expect(vm.state.output.some((line) => (
      line.includes('SHEIKHA_LANGUAGE_ARCHITECTURE_FOUNDATION_OK')
    ))).toBe(true);
  });

  test('uses the unified source loader and target generator for semantic manifests', () => {
    const sourceProgram = loadSourceProgram(
      'sheikha-language/examples/javascript-market.semantic.json'
    );
    const typeCheck = typeCheckAst(sourceProgram.ast);
    const ir = lowerToIR(sourceProgram.ast);
    const bytecode = compileIRToBytecode(ir);
    const generated = generateTarget('javascript', {
      sourceProgram,
      ast: sourceProgram.ast,
      ir,
      typeCheck,
      bytecode,
      outputPath: '/tmp/generated.js'
    });

    expect(sourceProgram.sourceLanguage).toBe('javascript');
    expect(ir.meta.sourceLanguage).toBe('javascript');
    expect(typeCheck.ok).toBe(true);
    expect(generated).toContain('compiled_to_javascript');
    expect(generated).toContain('source_language');
  });

  test('reports truthful source coverage and native migration blockers', () => {
    const report = readJson(
      'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json'
    );

    expect(report).toMatchObject({
      system: 'SHEIKHA_NATIVE_LANGUAGE_ARCHITECTURE_V1',
      status: 'FOUNDATION_ACTIVE_FULL_NATIVE_MIGRATION_REQUIRED',
      foundationScore: 100
    });
    expect(report.sourceInventory.sheikhaImplementationSourceFiles).toBeGreaterThanOrEqual(1);
    expect(report.sourceInventory.hostImplementationSourceFiles).toBeGreaterThan(1000);
    expect(report.sourceInventory.sheikhaImplementationLineSharePercent).toBeGreaterThan(0);
    expect(report.sourceInventory.sheikhaImplementationLineSharePercent).toBeLessThan(1);
    expect(report.compiler).toMatchObject({
      bootstrapRuntime: 'Node.js',
      selfHosted: false,
      nativeTargetAvailable: false,
      typeCheckPassed: true,
      governanceViolations: 0
    });
    expect(report.checks).toMatchObject({
      formalValuesReferencePresent: true,
      formalGovernancePolicyPresent: true,
      valuesReferenceRegisteredAsNonExecutable: true,
      governancePolicyEnforcedAtRuntime: true,
      formalArabicScienceReasoningMethodologyPresent: true,
      reasoningMethodologyEnforcedAtRuntime: true,
      priorAdvancedHostedArabicFoundationDiscovered: true,
      priorAdvancedHostedArabicFoundationExecuted: true
    });
    expect(report.source.valuesReferences).toContain('القيم_العليا');
    expect(report.source.governancePolicies).toContain('الخير_والنفع_العام');
    expect(report.source.reasoningMethodologies)
      .toContain('العربية_والعلوم_والاستدلال');
    expect(report.advancedHostedArabicFoundation).toMatchObject({
      status: 'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED',
      score: 100
    });
    expect(report.hostedArabicLanguageInventory.javascriptImplementationFiles)
      .toBeGreaterThanOrEqual(60);
    expect(report.currentImplementationBoundary).toMatchObject({
      compilerRequiresNodeToday: true,
      linuxRequiredForPortalRuntimeToday: true,
      completeArchitectureProgrammedInSheikhaToday: false,
      allSystemsPortedToSheikhaToday: false,
      fullGeneralPurposeBareMetalOsCompleteToday: false
    });
    expect(report.completionGate.nativeMigrationComplete).toBe(false);
    expect(report.completionGate.allowedCompletionClaimToday).toBe(false);
    expect(report.completionGate.blockers).toEqual(expect.arrayContaining([
      'SLA-05', 'SLA-06', 'SLA-07', 'SLA-08', 'SLA-09', 'SLA-10', 'SLA-11'
    ]));
  });

  test('activation model and public surfaces preserve the same boundaries', () => {
    const stages = activation.buildMigrationStages([
      'php', 'javascript', 'python', 'json-ir', 'bytecode'
    ]);
    const packageJson = readJson('package.json');
    const route = read('routes/governance-generator/status.routes.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const unifiedChat = read('routes/sheikha-unified-chat-fabric.js');
    const docs = read(
      'docs/sheikha-language-architecture-v1/SHEIKHA-NATIVE-LANGUAGE-ARCHITECTURE-V1.md'
    );

    expect(stages.find((stage) => stage.id === 'SLA-05').status).toBe('NOT_IMPLEMENTED');
    expect(stages.find((stage) => stage.id === 'SLA-06').status).toBe('NOT_IMPLEMENTED');
    expect(stages.find((stage) => stage.id === 'SLA-01B').status).toBe('VERIFIED');
    expect(stages.find((stage) => stage.id === 'SLA-01C').status).toBe('VERIFIED');
    expect(stages.find((stage) => stage.id === 'SLA-04A').status)
      .toBe('VERIFIED_NODE_HOSTED');
    expect(packageJson.scripts['ops:sheikha:language-architecture:v1'])
      .toBe('node tools/activation/activate-sheikha-native-language-architecture-v1.js');
    expect(route).toContain("router.get('/sheikha-language-architecture'");
    expect(route).toContain("router.get('/sheikha-language-production'");
    expect(route).toContain("router.post('/sheikha-language-production/interpret'");
    expect(sdk).toContain('client.languageArchitecture');
    expect(sdk).toContain('productionStatus');
    expect(sdk).toContain('interpret: input');
    expect(unifiedChat).toContain('nativeLanguageArchitecture');
    expect(docs).toContain('FOUNDATION_ACTIVE_FULL_NATIVE_MIGRATION_REQUIRED');
  });
});
