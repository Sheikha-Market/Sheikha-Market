'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { loadSourceProgram } = require('../source-loader');

function createSemanticProgram(sourceLanguage, outputLine) {
    return {
        kind: 'SheikhaSourceProgram',
        version: '1.0.0',
        sourceLanguage,
        sourceFile: `market.${sourceLanguage}`,
        program: {
            directives: ['بسم_الله'],
            entities: [
                {
                    name: 'خدمة_موحدة',
                    properties: {
                        اللغة: sourceLanguage,
                        الحوكمة: 'مفعلة',
                    },
                },
            ],
            procedures: [
                {
                    name: 'تشغيل',
                    body: [
                        { command: 'اعرض', argument: outputLine },
                    ],
                },
            ],
        },
    };
}

test('loads semantic manifest into unified AST metadata', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-unified-'));
    const manifestPath = path.join(tempDir, 'program.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(createSemanticProgram('javascript', 'من جافاسكربت'), null, 2)}\n`);

    const program = loadSourceProgram(manifestPath);
    assert.equal(program.sourceLanguage, 'javascript');
    assert.equal(program.sourceFamily, 'javascript-typescript');
    assert.equal(program.ast.type, 'Program');
    assert.ok(program.ast.body.some((node) => node.type === 'ProcedureDeclaration'));
});

test('compiler CLI emits javascript target from semantic manifest', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-compile-'));
    const manifestPath = path.join(tempDir, 'program.json');
    const outputPath = path.join(tempDir, 'program.generated.js');
    const irPath = path.join(tempDir, 'program.ir.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(createSemanticProgram('python', 'من بايثون الموحد'), null, 2)}\n`);

    execFileSync('node', [
        path.resolve(__dirname, '../sheikha-compiler.js'),
        manifestPath,
        '--target', 'javascript',
        '--out', outputPath,
        '--ir', irPath,
    ], { cwd: path.resolve(__dirname, '../../..') });

    const generated = fs.readFileSync(outputPath, 'utf8');
    const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));
    assert.ok(generated.includes('compiled_to_javascript'));
    assert.equal(ir.meta.sourceLanguage, 'python');
});

test('runner CLI executes semantic manifest through unified runtime', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-runner-'));
    const manifestPath = path.join(tempDir, 'program.json');
    const jsonPath = path.join(tempDir, 'run.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(createSemanticProgram('go', 'من منصة جو الموحدة'), null, 2)}\n`);

    const stdout = execFileSync('node', [
        path.resolve(__dirname, '../sheikha-runner.js'),
        manifestPath,
        '--engine', 'tree',
        '--json', jsonPath,
    ], { cwd: path.resolve(__dirname, '../../..'), encoding: 'utf8' });

    const result = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.ok(stdout.includes('SHEIKHA_SOURCE_LANGUAGE=GO'));
    assert.equal(result.source.language, 'go');
    assert.ok(result.output.includes('من منصة جو الموحدة'));
});
