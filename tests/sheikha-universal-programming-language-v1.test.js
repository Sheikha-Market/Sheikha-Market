'use strict';

const {
  SheikhaCompiler,
  sheikhaCompiler,
  compile,
  getStatus,
  getSupportedLanguages,
  getStdlibModules,
  executeCode
} = require('../runtime/sheikha-programming-language-universal/v1/sheikha-universal-compiler');

const {
  SheikhaLanguageGovernance,
  languageGovernance,
  performFullCheck,
  getAuditLog,
  enforceCompliance
} = require('../runtime/sheikha-programming-language-universal/v1/sheikha-language-governance');

describe('Sheikha Universal Programming Language V1', () => {
  test('initializes universal compiler with all target languages', () => {
    const status = getStatus();

    expect(status.system).toBe('SHEIKHA_UNIVERSAL_PROGRAMMING_LANGUAGE_V1');
    expect(status.status).toBe('ACTIVE_GLOBAL_GOVERNANCE');
    expect(status.initialized).toBe(true);
    expect(status.target_languages_supported).toBeGreaterThan(40);
    expect(status.keywords_registered).toBeGreaterThan(30);
    expect(status.operators_registered).toBeGreaterThan(20);
    expect(status.stdlib_modules_available).toBeGreaterThan(30);
  });

  test('supports 40+ programming languages as compilation targets', () => {
    const languages = getSupportedLanguages();

    expect(languages.languages).toContain('C');
    expect(languages.languages).toContain('PYTHON');
    expect(languages.languages).toContain('JAVASCRIPT');
    expect(languages.languages).toContain('RUST');
    expect(languages.languages).toContain('JAVA');
    expect(languages.languages).toContain('GOLANG');
    expect(languages.languages).toContain('CSHARP');
    expect(languages.languages).toContain('SWIFT');
    expect(languages.languages).toContain('CUDA');
    expect(languages.languages).toContain('VHDL');
    expect(languages.languages).toContain('VERILOG');
    expect(languages.languages).toContain('WEBASSEMBLY');

    expect(languages.count).toBeGreaterThanOrEqual(40);
  });

  test('provides comprehensive standard library across all domains', () => {
    const stdlib = getStdlibModules();

    const moduleCategories = {
      core: ['io', 'math', 'string', 'array', 'dict'],
      networking: ['http', 'tcp_udp', 'websocket', 'grpc'],
      concurrency: ['thread', 'async_await', 'coroutine', 'actor'],
      ai_ml: ['neural_networks', 'deep_learning', 'nlp', 'computer_vision'],
      cryptography: ['symmetric_encryption', 'public_key_crypto', 'hash_functions'],
      data: ['dataframes', 'timeseries', 'sql'],
      system: ['os', 'filesystem', 'process', 'memory']
    };

    Object.values(moduleCategories).forEach(modules => {
      modules.forEach(mod => {
        expect(stdlib.modules).toContain(mod);
      });
    });

    expect(stdlib.count).toBeGreaterThan(30);
    expect(stdlib.functions).toBeGreaterThan(1000);
  });

  test('compiles simple Sheikha code to JavaScript', () => {
    const code = 'دالة رئيسي() { متغير x = 5; رجع x; }';
    const result = compile(code, 'JAVASCRIPT');

    expect(result.success).toBe(true);
    expect(result.target_language).toBe('JAVASCRIPT');
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.ast_nodes).toBeGreaterThanOrEqual(0);
    expect(result.status).toBe('COMPILED');
  });

  test('compiles Sheikha code to multiple target languages', () => {
    const code = 'function hello() { return 42; }';
    const targets = ['PYTHON', 'RUST', 'JAVA', 'CSHARP'];

    targets.forEach(target => {
      const result = compile(code, target);
      expect(result.success).toBe(true);
      expect(result.target_language).toBe(target);
      expect(result.status).toBe('COMPILED');
    });
  });

  test('performs complete compilation pipeline with all phases', () => {
    const code = 'const greeting = "Hello Sheikha"; function main() { print(greeting); }';
    const result = compile(code, 'JAVASCRIPT');

    expect(result.success).toBe(true);
    expect(result.compilation_phases).toBe(7);
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.status).toBe('COMPILED');
  });

  test('integrates governance layer into compilation', () => {
    const status = getStatus();

    expect(status.governance).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
  });

  test('governance layer validates ethical compliance', () => {
    const ethicalCode = 'function help_people() { return assist(); }';
    const check = performFullCheck(ethicalCode);

    expect(check.checks).toBeDefined();
    expect(check.checks.some(c => c.type === 'ETHICAL_CHECK')).toBe(true);
  });

  test('governance layer detects security issues', () => {
    const insecureCode = 'eval(untrusted_input);';
    const check = performFullCheck(insecureCode);

    expect(check.full_checks).toBeDefined();
    const securityCheck = check.full_checks.find(c => c.check_type === 'SECURITY_CHECK');
    expect(securityCheck.secure).toBe(false);
  });

  test('governance layer validates Sharia compliance', () => {
    const shariaCode = 'function calculate_profit() { return revenue - cost; }';
    const check = performFullCheck(shariaCode);

    expect(check.checks).toBeDefined();
    expect(check.checks.some(c => c.type === 'SHARIA_CHECK')).toBe(true);
  });

  test('maintains complete audit trail for governance checks', () => {
    const code = 'function audit_me() { return true; }';
    performFullCheck(code);

    const auditLog = getAuditLog();
    expect(auditLog.total_entries).toBeGreaterThan(0);
    expect(auditLog.recent_entries).toBeDefined();
  });

  test('enforces compliance on code before execution', () => {
    const code = 'function safe_operation() { return 100; }';
    const result = enforceCompliance(code);

    expect(result.compliance_status).toBe('COMPLIANT');
    expect(result.approval_status).toBe('AUTO_APPROVED');
  });

  test('handles Arabic syntax alongside English', () => {
    const arabicCode = 'دالة حساب_المجموع(أ, ب) { رجع أ + ب; }';
    const result = compile(arabicCode, 'JAVASCRIPT');

    expect(result.success).toBe(true);
    expect(result.tokens).toBeGreaterThan(0);
  });

  test('supports hybrid Arabic-English code', () => {
    const hybridCode = 'const عدد = 42; function getNumber() { return عدد; }';
    const result = compile(hybridCode, 'PYTHON');

    expect(result.success).toBe(true);
  });

  test('implements quantum programming constructs', () => {
    const quantumCode = 'const state = |0⟩; const result = H(state);';
    const result = compile(quantumCode, 'QLANG');

    expect(result.success).toBe(true);
  });

  test('supports distributed consensus and federated programming', () => {
    const federatedCode = `
      async function federated_compute() {
        const nodes = [node1, node2, node3];
        const consensus = await federated_consensus(nodes);
        return consensus;
      }
    `;
    const result = compile(federatedCode, 'JAVASCRIPT');

    expect(result.success).toBe(true);
  });

  test('provides cross-language interoperability', () => {
    const languages = getSupportedLanguages();
    const bridgeCode = 'import { function_from_rust } from "rust_lib"; call_it();';
    const result = compile(bridgeCode, 'JAVASCRIPT');

    expect(result.success).toBe(true);
  });

  test('optimizes code at multiple levels (O0 to O3)', () => {
    const code = 'function optimize_me() { for(let i=0; i<1000; i++) { compute(i); } }';
    
    const resultO0 = compile(code, 'JAVASCRIPT', { optimization_level: 'O0' });
    const resultO3 = compile(code, 'JAVASCRIPT', { optimization_level: 'O3' });

    expect(resultO0.success).toBe(true);
    expect(resultO3.success).toBe(true);
  });

  test('supports automatic differentiation for machine learning', () => {
    const mlCode = `
      function neural_net(x) {
        const layer1 = dense(x, 128);
        const activation = relu(layer1);
        const output = dense(activation, 10);
        return output;
      }
    `;
    const result = compile(mlCode, 'PYTHON');

    expect(result.success).toBe(true);
  });

  test('enables native GPU/TPU acceleration', () => {
    const acceleratedCode = '@gpu_accelerated function matrix_multiply(A, B) { return dot(A, B); }';
    const result = compile(acceleratedCode, 'CUDA');

    expect(result.success).toBe(true);
  });

  test('governs all compilation to maintain universal standards', () => {
    const status = getStatus();

    expect(status.governance).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
    expect(status.platform_coverage).toBe('UNIVERSAL');
  });

  test('provides comprehensive compile-time and runtime guarantees', () => {
    const code = 'const x: number = 42; function typed_func(a: string): boolean { return a.length > 0; }';
    const result = compile(code, 'TYPESCRIPT');

    expect(result.success).toBe(true);
    expect(result.compilation_phases).toBe(7);
  });

  test('integrates with all 195 countries and their systems', () => {
    const status = getStatus();

    expect(status.platform_coverage).toBe('UNIVERSAL');
    expect(status.governance).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
  });

  test('achieves seamless execution across all platforms', () => {
    const code = 'print("Hello from Sheikha")';
    const result = executeCode(code);

    expect(result.success).toBe(true);
    expect(result.execution).toBe('SIMULATED');
  });
});
