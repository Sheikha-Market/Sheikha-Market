'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('../lexer');
const { parse } = require('../parser');
const { lowerToIR } = require('../ir');
const { compileIRToBytecode } = require('../bytecode');
const { runBytecode } = require('../bytecode-vm');

test('compiled VM executes bytecode with radical neural mesh profile', () => {
    const inputPath = path.resolve(__dirname, '../../examples/market.shk');
    const source = fs.readFileSync(inputPath, 'utf8');

    const ast = parse(lex(source));
    const ir = lowerToIR(ast);
    const bytecode = compileIRToBytecode(ir);
    const result = runBytecode(bytecode);

    assert.equal(result.ok, true);
    assert.equal(result.state.neural.mode, 'compiled-bytecode-runtime');
    assert.ok(result.state.neural.cells >= 57);
    assert.ok(result.state.output.some((line) => line.includes('رفض')));
});

test('compiled VM uses strict sandbox by default', () => {
    const source = 'إجراء فحص:\n  API "GET" "http://127.0.0.1:8080/api/health"\n';
    const ast = parse(lex(source));
    const bytecode = compileIRToBytecode(lowerToIR(ast));
    const result = runBytecode(bytecode);

    assert.equal(result.ok, false);
    assert.equal(result.state.sandbox.profile, 'production');
    assert.equal(result.state.sandbox.strict, true);
    assert.ok(result.state.output.some((line) => line.includes('SANDBOX_DENY')));
});

test('compiled VM allows local sandbox profile override', () => {
    const source = 'إجراء فحص:\n  API "GET" "http://127.0.0.1:8080/api/health"\n';
    const ast = parse(lex(source));
    const bytecode = compileIRToBytecode(lowerToIR(ast));
    const result = runBytecode(bytecode, { profile: 'local', strictIsolation: false });

    assert.equal(result.ok, true);
    assert.equal(result.state.sandbox.profile, 'local');
    assert.equal(result.state.sandbox.strict, false);
});
