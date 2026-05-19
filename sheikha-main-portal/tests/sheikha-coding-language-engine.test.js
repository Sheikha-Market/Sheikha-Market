/**
 * اختبار طبقات SHK: AST + Type + Governance + Bytecode + Sandbox + Daemon + LSP
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const SheikhaCodingLanguageEngine = require('../lib/sheikha-coding-language-engine');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed += 1;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed += 1;
  }
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shk-engine-test-'));
const lockPath = path.join(tmpDir, 'shk-package-lock.json');
const engine = new SheikhaCodingLanguageEngine({ packageStorePath: lockPath, maxOps: 64 });

console.log('\n[1] AST + Type System');
const script = 'عرف الكمية:رقم = 15\nحلل النص واستخرج الجذر';
const parsed = engine.parseShk(script);
assert(parsed.ok === true, 'parseShk returns ok');
assert(parsed.ast.type === 'Program', 'AST root is Program');
assert(parsed.ast.body.length === 2, 'AST has two statements');
assert(parsed.ast.body[0].type === 'VariableDeclaration', 'first statement is variable declaration');
assert(parsed.ast.body[1].type === 'CommandStatement', 'second statement is command statement');

const typeCheck = engine.typeCheckAst(parsed.ast);
assert(typeCheck.ok === true, 'type check passes on valid script');
assert(typeCheck.symbols['الكمية'] === 'number', 'type checker stores symbol type');

console.log('\n[2] Type Mismatch');
const badType = engine.compileScript('عرف السعر:رقم = \"عشرة\"');
assert(badType.ok === false, 'compile fails for type mismatch');
assert(Array.isArray(badType.typeCheck.errors) && badType.typeCheck.errors.length >= 1, 'type mismatch emits at least one error');

console.log('\n[3] Governance Engine on AST/IR');
const gov = engine.compileScript('عرف تمويل = \"interest\"');
assert(gov.governance.ok === false, 'governance blocks interest/riba');
assert(gov.governance.blocked.length >= 1, 'governance reports blocked findings');

console.log('\n[4] Bytecode + Sandbox + Neural Root Runtime');
const compiled = engine.compileScript(script);
assert(compiled.bytecode.instructions.length >= 2, 'bytecode instructions generated');
const sandbox = engine.executeInSandbox(script);
assert(sandbox.ok === true, 'sandbox execution succeeds');
assert(sandbox.neuralRuntime.mode === 'compiled_vm_plus_neural_root', 'neural root runtime mode enabled');
assert(sandbox.neuralRuntime.neuralRoot.totalCells >= 6, 'neural root cells are active');
assert(Array.isArray(sandbox.neuralRuntime.runtime.state.plannedOperations), 'runtime returns execution plan');

console.log('\n[5] Package Manager');
const pkgResult = engine.installPackage({ name: 'shk-core', version: '1.2.0', constraints: '^1.2.0' });
assert(pkgResult.ok === true, 'package install succeeds');
assert(fs.existsSync(lockPath), 'lock file is created');
const lock = engine.getPackageLock();
assert(lock.lock.packages['shk-core'].version === '1.2.0', 'lock file stores installed package');

console.log('\n[6] Native .shk Daemon Lifecycle');
const start = engine.daemonStart();
assert(start.ok === true && start.started === true, 'daemon starts');
const submit = engine.daemonSubmit(script);
assert(submit.ok === true, 'daemon submits and executes script');
const health = engine.daemonHealth();
assert(health.running === true, 'daemon remains running');
assert(health.processed >= 1, 'daemon processed counter increments');
const stop = engine.daemonStop();
assert(stop.ok === true && stop.stopped === true, 'daemon stops');

console.log('\n[7] LSP bootstrap');
const diagnostics = engine.lspDiagnostics('عرف السعر:رقم = \"x\"');
assert(diagnostics.ok === true, 'lsp diagnostics returns successfully');
assert(diagnostics.diagnostics.length >= 1, 'lsp diagnostics emits issues for wrong type');
const completions = engine.lspCompletions('حل');
assert(completions.ok === true && completions.items.length >= 1, 'lsp completions returns suggestions');
const hover = engine.lspHover('حلل النص', 1, 1);
assert(hover.ok === true, 'lsp hover returns successfully');

console.log(`\nPassed: ${passed} | Failed: ${failed}`);
if (failed > 0) process.exit(1);
