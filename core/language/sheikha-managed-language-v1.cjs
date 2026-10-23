'use strict';
const { lex } = require('../../sheikha-language/compiler/lexer');
const { parse } = require('../../sheikha-language/compiler/parser');
const { typeCheckAst } = require('../../sheikha-language/compiler/type-checker');
const { lowerToIR } = require('../../sheikha-language/compiler/ir');
const { compileIRToBytecode } = require('../../sheikha-language/compiler/bytecode');
const { runBytecode } = require('../../sheikha-language/compiler/bytecode-vm');
const MAX_SOURCE_BYTES = 65536;
function validate(source, options) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('SOURCE_REQUIRED');
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) throw new Error('SOURCE_TOO_LARGE');
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length)
    throw new Error('RUNTIME_OPTIONS_NOT_ADMITTED');
}
function compile(source, options = {}) {
  validate(source, options);
  const ast = parse(lex(source));
  const types = typeCheckAst(ast);
  if (!types.ok) return { success: false, status: 'TYPECHECK_BLOCKED', diagnostics: types.diagnostics };
  const ir = lowerToIR(ast);
  return { success: true, status: 'COMPILED_LOCAL', ast, ir, bytecode: compileIRToBytecode(ir), types };
}
function run(source, options = {}) {
  const program = compile(source, options);
  if (!program.success) return program;
  // Fixed server-side options: caller cannot enable adapters, network or process execution.
  const result = runBytecode(program.bytecode, { live: false, profile: 'local', strictIsolation: true });
  return { success: result.ok, status: result.ok ? 'VERIFIED_DRY_RUN' : 'GOVERNANCE_BLOCKED',
    output: result.state.output,
    evidence: { adapterDryRun: result.state.adapters.dryRun, strictIsolation: result.state.sandbox.strict,
      violations: result.state.governance.violations.map(v => ({ rule: v.rule, severity: v.severity })),
      instructions: program.bytecode.instructions.length,
      adapterCalls: result.state.adapters.calls.map(c => ({ adapter: c.adapter, live: c.live, ok: c.ok })) } };
}
function status() {
  const probe = run('بسم_الله\nإجراء تحقق:\n  اعرض "SHEIKHA_LOCAL_PROBE"\n');
  const verified = probe.success && probe.output.some(line => line.includes('SHEIKHA_LOCAL_PROBE'));
  return { success: verified, system: 'SHEIKHA_MANAGED_LANGUAGE_V1',
    status: verified ? 'LOCAL_RUNTIME_VERIFIED' : 'LOCAL_RUNTIME_FAILED',
    hostRuntime: 'Node.js', architecture: ['SOURCE', 'LEXER', 'PARSER_AST', 'TYPECHECK', 'IR', 'BYTECODE', 'GOVERNED_VM'],
    management: { compile: true, dryRun: true, liveAdapters: false, deployment: false },
    governance: { haltOnViolation: true, runtimeOptionsClientControlled: false, strictIsolation: true,
      valuesReferenceExecutable: false, automatedFatwaAllowed: false, qualifiedReviewRequired: true },
    limits: { maxSourceBytes: MAX_SOURCE_BYTES },
    evidence: probe.evidence,
    unverified: { productionActivation: 'UNKNOWN', nativeSelfHosting: 'UNKNOWN', allSystemsMigration: 'UNKNOWN' } };
}
module.exports = { compile, run, status, MAX_SOURCE_BYTES };
