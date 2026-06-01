#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { lowerToIR } = require('./ir');
const { typeCheckAst } = require('./type-checker');
const { compileIRToBytecode } = require('./bytecode');
const { loadSourceProgram } = require('./source-loader');
const { generateTarget, resolveTarget } = require('./target-generators');

function readOption(args, name) {
    const index = args.indexOf(name);
    if (index === -1) {
        return null;
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${name}`);
    }
    return value;
}

function ensureParentDir(filePath) {
    const dir = path.dirname(filePath);
    if (dir && dir !== '.') {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function defaultOutputFor(input, target) {
    if (target === 'javascript') {
        return input.replace(/\.[^.]+$/, '.generated.js');
    }
    if (target === 'python') {
        return input.replace(/\.[^.]+$/, '.generated.py');
    }
    if (target === 'json-ir') {
        return input.replace(/\.[^.]+$/, '.ir.json');
    }
    if (target === 'bytecode') {
        return input.replace(/\.[^.]+$/, '.bytecode.json');
    }
    return input.replace(/\.[^.]+$/, '.generated.php');
}

const args = process.argv.slice(2);
const input = args[0];

if (!input) {
    console.error('Usage: node sheikha-compiler.js <file.shk|program.json> [--source-language name] [--target php|javascript|python|json-ir|bytecode] [--out file] [--ast file.json] [--ir file.json] [--types file.json] [--bytecode file.json]');
    process.exit(1);
}

const requestedTarget = readOption(args, '--target');
const astOutput = readOption(args, '--ast');
const irOutput = readOption(args, '--ir');
const typesOutput = readOption(args, '--types');
const bytecodeOutput = readOption(args, '--bytecode');
const sourceLanguage = readOption(args, '--source-language');
const output = readOption(args, '--out');
const target = resolveTarget(requestedTarget, output);
const outputPath = output || defaultOutputFor(input, target);

const sourceProgram = loadSourceProgram(input, { sourceLanguage });
const typeCheck = typeCheckAst(sourceProgram.ast);
const ir = lowerToIR(sourceProgram.ast, sourceProgram);
const bytecode = compileIRToBytecode(ir);

const rendered = generateTarget(target, {
    ast: sourceProgram.ast,
    ir,
    typeCheck,
    bytecode,
    sourceProgram,
    outputPath,
});

ensureParentDir(outputPath);
fs.writeFileSync(outputPath, rendered);

const optionalArtifacts = [
    [astOutput, sourceProgram.ast],
    [irOutput, ir],
    [typesOutput, typeCheck],
    [bytecodeOutput, bytecode],
];

for (const [filePath, payload] of optionalArtifacts) {
    if (!filePath) {
        continue;
    }
    ensureParentDir(filePath);
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

console.log('SHEIKHA_LANGUAGE_SOURCE=' + sourceProgram.sourceLanguage.toUpperCase());
console.log('SHEIKHA_LANGUAGE_TARGET=' + target.toUpperCase().replace('-', '_'));
console.log('SHEIKHA_LANGUAGE_COMPILED=' + outputPath);
