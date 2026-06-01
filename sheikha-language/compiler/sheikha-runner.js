#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { lowerToIR } = require('./ir');
const { typeCheckAst } = require('./type-checker');
const { compileIRToBytecode } = require('./bytecode');
const { runIR } = require('./vm');
const { runBytecode } = require('./bytecode-vm');
const { verifyPolicies } = require('./policy-signatures');
const { loadSourceProgram } = require('./source-loader');

const input = process.argv[2];
if (!input) {
    console.error('Usage: node sheikha-runner.js <file.shk|program.json> [--source-language name] [--engine compiled|tree] [--profile local|staging|production] [--strict-isolation true|false] [--json output.json] [--trace output.trace.json] [--types output.types.json] [--live]');
    process.exit(1);
}

let jsonPath = '';
let tracePath = '';
let typesPath = '';
let live = false;
let engine = 'compiled';
let profile = 'local';
let strictIsolation;
let policyManifestPath = 'sheikha-language/policies/policy-signatures.json';
let sourceLanguage = '';

for (let i = 3; i < process.argv.length; i++) {
    if (process.argv[i] === '--json' && process.argv[i + 1]) {
        jsonPath = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--trace' && process.argv[i + 1]) {
        tracePath = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--types' && process.argv[i + 1]) {
        typesPath = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--engine' && process.argv[i + 1]) {
        engine = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--profile' && process.argv[i + 1]) {
        profile = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--strict-isolation' && process.argv[i + 1]) {
        strictIsolation = process.argv[i + 1] === 'true';
        i++;
        continue;
    }
    if (process.argv[i] === '--policy-signatures' && process.argv[i + 1]) {
        policyManifestPath = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--source-language' && process.argv[i + 1]) {
        sourceLanguage = process.argv[i + 1];
        i++;
        continue;
    }
    if (process.argv[i] === '--live') {
        live = true;
    }
}

const sourceProgram = loadSourceProgram(input, { sourceLanguage });
const ast = sourceProgram.ast;
const typeCheck = typeCheckAst(ast);
const ir = lowerToIR(ast, sourceProgram);
const bytecode = compileIRToBytecode(ir);

let policyVerification = { ok: true, errors: [] };
const isStrictProduction = engine === 'compiled' && profile === 'production' && strictIsolation === true;
if (isStrictProduction) {
    const manifestFullPath = path.resolve(process.cwd(), policyManifestPath);
    if (!fs.existsSync(manifestFullPath)) {
        console.error('[POLICY:FAIL] Policy signatures manifest not found: ' + policyManifestPath);
        process.exit(2);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestFullPath, 'utf8'));
    const productionKey = process.env.SHEIKHA_POLICY_SIGNING_KEY_PROD;
    policyVerification = verifyPolicies({
        baseDir: process.cwd(),
        manifest,
        key: productionKey,
        requireKey: true,
        keyName: 'SHEIKHA_POLICY_SIGNING_KEY_PROD',
    });
    if (!policyVerification.ok) {
        for (const error of policyVerification.errors) {
            console.error('[POLICY:FAIL] ' + error);
        }
        process.exit(2);
    }
}

if (typesPath) {
    fs.writeFileSync(typesPath, JSON.stringify(typeCheck, null, 2));
}

if (!typeCheck.ok) {
    for (const diagnostic of typeCheck.diagnostics) {
        if (diagnostic.severity === 'error') {
            console.error(`[TYPE:${diagnostic.code}] ${diagnostic.message}`);
        }
    }
    process.exit(2);
}

const vmResult = engine === 'tree'
    ? runIR(ir, { live, profile, strictIsolation })
    : runBytecode(bytecode, { live, profile, strictIsolation });

const result = {
    success: vmResult.ok,
    status: vmResult.status,
    input: path.basename(input),
    source: {
        language: sourceProgram.sourceLanguage,
        family: sourceProgram.sourceFamily,
        kind: sourceProgram.sourceKind,
    },
    engine,
    profile,
    policyVerification,
    summary: {
        astNodes: ast.body.length,
        irSteps: ir.steps.length,
        bytecodeInstructions: bytecode.instructions.length,
        outputs: vmResult.state.output.length,
        governanceViolations: vmResult.state.governance.violations.length,
        typeErrors: typeCheck.diagnostics.filter((d) => d.severity === 'error').length,
        neuralCells: vmResult.state.neural.cells,
        adapterCalls: vmResult.state.adapters.calls.length,
        adapterDryRun: vmResult.state.adapters.dryRun,
        strictIsolation: vmResult.state.sandbox.strict,
        policyErrors: policyVerification.errors.length,
    },
    typeCheck,
    output: vmResult.state.output,
    governance: vmResult.state.governance,
    neural: vmResult.state.neural,
    adapters: vmResult.state.adapters,
    sandbox: vmResult.state.sandbox,
};

if (jsonPath) {
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
}

if (tracePath) {
    fs.writeFileSync(tracePath, JSON.stringify(vmResult.state.neural.executionGraph, null, 2));
}

console.log('SHEIKHA_VM_ENGINE=' + engine.toUpperCase());
console.log('SHEIKHA_SOURCE_LANGUAGE=' + sourceProgram.sourceLanguage.toUpperCase());
console.log('SHEIKHA_SANDBOX_PROFILE=' + profile.toUpperCase());
console.log('SHEIKHA_POLICY_VERIFIED=' + (policyVerification.ok ? 'YES' : 'NO'));
console.log('SHEIKHA_VM_STATUS=' + result.status.toUpperCase());
console.log('SHEIKHA_TYPE_ERRORS=' + result.summary.typeErrors);
console.log('SHEIKHA_GOV_VIOLATIONS=' + result.summary.governanceViolations);
console.log('SHEIKHA_NEURAL_CELLS=' + result.summary.neuralCells);
console.log('SHEIKHA_ADAPTER_CALLS=' + result.summary.adapterCalls);
console.log('SHEIKHA_ADAPTER_MODE=' + (result.summary.adapterDryRun ? 'DRY' : 'LIVE'));
console.log('SHEIKHA_STRICT_ISOLATION=' + (result.summary.strictIsolation ? 'ON' : 'OFF'));
for (const line of result.output) {
    console.log('[OUT] ' + line);
}

if (!vmResult.ok) {
    process.exit(2);
}
