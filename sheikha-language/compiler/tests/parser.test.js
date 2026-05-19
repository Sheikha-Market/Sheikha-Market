'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { lex } = require('../lexer');
const { parse } = require('../parser');

test('parses market.shk into Program AST', () => {
    const inputPath = path.resolve(__dirname, '../../examples/market.shk');
    const source = fs.readFileSync(inputPath, 'utf8');

    const tokens = lex(source);
    const ast = parse(tokens);

    assert.equal(ast.type, 'Program');
    assert.ok(ast.body.length >= 3);

    const directive = ast.body.find((n) => n.type === 'Directive');
    assert.ok(directive);
    assert.equal(directive.name, 'بسم_الله');

    const entity = ast.body.find((n) => n.type === 'EntityDeclaration');
    assert.ok(entity);
    assert.equal(entity.name, 'صفقة_معادن');
    assert.ok(entity.properties.length >= 3);

    const procedure = ast.body.find((n) => n.type === 'ProcedureDeclaration' && n.name === 'تحقق_شرعي');
    assert.ok(procedure);

    const ifStatement = procedure.body.find((n) => n.type === 'IfStatement');
    assert.ok(ifStatement);
    assert.equal(ifStatement.condition, 'الصفقة فيها غش');
    assert.equal(ifStatement.consequent.length, 1);
    assert.equal(ifStatement.alternate.length, 1);
});

test('compiler CLI emits php and ast files', () => {
    const inputPath = path.resolve(__dirname, '../../examples/market.shk');
    const outputPhp = path.resolve(__dirname, '../../examples/market.generated.php');
    const outputAst = path.resolve(__dirname, '../../examples/market.ast.json');

    if (fs.existsSync(outputPhp)) {
        fs.unlinkSync(outputPhp);
    }
    if (fs.existsSync(outputAst)) {
        fs.unlinkSync(outputAst);
    }

    const compileModule = path.resolve(__dirname, '../sheikha-compiler.js');
    const cmd = `node ${JSON.stringify(compileModule)} ${JSON.stringify(inputPath)} --out ${JSON.stringify(outputPhp)} --ast ${JSON.stringify(outputAst)}`;
    execSync(cmd, { stdio: 'pipe' });

    assert.equal(fs.existsSync(outputPhp), true);
    assert.equal(fs.existsSync(outputAst), true);

    const ast = JSON.parse(fs.readFileSync(outputAst, 'utf8'));
    assert.equal(ast.type, 'Program');
});

test('parses adapter commands from orchestration.shk', () => {
    const inputPath = path.resolve(__dirname, '../../examples/orchestration.shk');
    const source = fs.readFileSync(inputPath, 'utf8');
    const ast = parse(lex(source));

    const procedure = ast.body.find((n) => n.type === 'ProcedureDeclaration' && n.name === 'فحص_الخدمات');
    assert.ok(procedure);
    const commands = procedure.body.filter((n) => n.type === 'CommandStatement').map((n) => n.command);
    assert.ok(commands.includes('API'));
    assert.ok(commands.includes('PM2'));
    assert.ok(commands.includes('DOCKER'));
});
