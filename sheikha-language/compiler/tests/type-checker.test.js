'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('../lexer');
const { parse } = require('../parser');
const { typeCheckAst } = require('../type-checker');

test('type checker passes valid market program', () => {
    const inputPath = path.resolve(__dirname, '../../examples/market.shk');
    const source = fs.readFileSync(inputPath, 'utf8');
    const ast = parse(lex(source));

    const result = typeCheckAst(ast);
    assert.equal(result.ok, true);
    assert.equal(result.diagnostics.filter((d) => d.severity === 'error').length, 0);
});

test('type checker reports Arabic diagnostics on invalid entity weight', () => {
    const source = 'كيان صفقة:\n  الوزن: ثقيل\n';
    const ast = parse(lex(source));
    const result = typeCheckAst(ast);

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === 'SHK-TYPE-001'));
});

test('type checker validates API adapter command signatures', () => {
    const source = 'إجراء اختبار:\n  API "BAD" "local"\n';
    const ast = parse(lex(source));
    const result = typeCheckAst(ast);

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === 'SHK-TYPE-101'));
    assert.ok(result.diagnostics.some((d) => d.code === 'SHK-TYPE-102'));
});

test('type checker validates python bridge contract', () => {
    const valid = 'إجراء تقييم:\n  PYTHON "sheikha-language/examples/python-score-bridge.py" "sheikha-language/examples/python-score-contract.json"\n';
    const validAst = parse(lex(valid));
    const validResult = typeCheckAst(validAst);
    assert.equal(validResult.ok, true);

    const invalid = 'إجراء تقييم:\n  PYTHON "bad.txt" "sheikha-language/examples/python-score-contract.json"\n';
    const invalidAst = parse(lex(invalid));
    const invalidResult = typeCheckAst(invalidAst);
    assert.equal(invalidResult.ok, false);
    assert.ok(invalidResult.diagnostics.some((d) => d.code === 'SHK-TYPE-106'));
});

test('type checker rejects unsupported python permission in contract', () => {
    const source = 'إجراء تقييم:\n  PYTHON "sheikha-language/examples/python-score-bridge.py" "sheikha-language/examples/python-score-contract.invalid.json"\n';
    const ast = parse(lex(source));
    const result = typeCheckAst(ast);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.code === 'SHK-TYPE-113'));
});
