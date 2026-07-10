#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadSourceProgram } = require('./source-loader');
const { lowerToIR } = require('./ir');
const { typeCheckAst } = require('./type-checker');
const { compileIRToBytecode } = require('./bytecode');
const { generateTarget, resolveTarget } = require('./target-generators');

const input = process.argv[2];
if (!input) {
    console.error(
        'Usage: node sheikha-compiler.js file.shk|manifest.json ' +
        '[--target php|javascript|node|python|json-ir|bytecode] [--out output.file] ' +
        '[--ast output.ast.json] [--ir output.ir.json] [--types output.types.json] ' +
        '[--bytecode output.bc.json]'
    );
    process.exit(1);
}

const options = {
    target: '',
    outPath: '',
    astPath: '',
    irPath: '',
    typesPath: '',
    bytecodePath: '',
};

for (let i = 3; i < process.argv.length; i++) {
    const value = process.argv[i + 1];
    if (process.argv[i] === '--out' && value) {
        options.outPath = value;
        i++;
        continue;
    }
    if (process.argv[i] === '--target' && value) {
        options.target = value;
        i++;
        continue;
    }
    if (process.argv[i] === '--ast' && value) {
        options.astPath = value;
        i++;
        continue;
    }
    if (process.argv[i] === '--ir' && value) {
        options.irPath = value;
        i++;
        continue;
    }
    if (process.argv[i] === '--types' && value) {
        options.typesPath = value;
        i++;
        continue;
    }
    if (process.argv[i] === '--bytecode' && value) {
        options.bytecodePath = value;
        i++;
    }
}

const targetAliases = {
    js: 'javascript',
    node: 'javascript',
};
const requestedTarget = String(options.target || '').toLowerCase();
const normalizedTarget = targetAliases[requestedTarget] || requestedTarget;
const target = resolveTarget(normalizedTarget, options.outPath);
const outputExtensions = {
    php: '.php',
    javascript: '.js',
    python: '.py',
    'json-ir': '.ir.json',
    bytecode: '.bytecode.json',
};
const outPath = options.outPath || replaceExtension(input, outputExtensions[target]);

const sourceProgram = loadSourceProgram(input);
const ast = sourceProgram.ast;
const typeCheck = typeCheckAst(ast);
const ir = lowerToIR(ast);
const bytecode = compileIRToBytecode(ir);
const generated = generateTarget(target, {
    sourceProgram,
    ast,
    ir,
    typeCheck,
    bytecode,
    outputPath: outPath,
});

writeFile(outPath, generated);
if (target === 'python') fs.chmodSync(outPath, 0o755);
writeJson(options.astPath, ast);
writeJson(options.irPath, ir);
writeJson(options.typesPath, typeCheck);
writeJson(options.bytecodePath, bytecode);

console.log('SHEIKHA_SOURCE_LANGUAGE=' + sourceProgram.sourceLanguage.toUpperCase());
console.log('SHEIKHA_SOURCE_KIND=' + sourceProgram.sourceKind.toUpperCase());
console.log('SHEIKHA_LANGUAGE_TARGET=' + target.toUpperCase());
console.log('SHEIKHA_LANGUAGE_COMPILED=' + outPath);
console.log('SHEIKHA_TYPECHECK=' + (typeCheck.ok ? 'PASSED' : 'FAILED'));
if (options.astPath) console.log('SHEIKHA_LANGUAGE_AST=' + options.astPath);
if (options.irPath) console.log('SHEIKHA_LANGUAGE_IR=' + options.irPath);
if (options.typesPath) console.log('SHEIKHA_LANGUAGE_TYPES=' + options.typesPath);
if (options.bytecodePath) console.log('SHEIKHA_LANGUAGE_BYTECODE=' + options.bytecodePath);

if (!typeCheck.ok) process.exitCode = 2;

function replaceExtension(filePath, extension) {
    const parsed = path.parse(filePath);
    return path.join(parsed.dir, `${parsed.name}${extension}`);
}

function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
    if (!filePath) return;
    writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
