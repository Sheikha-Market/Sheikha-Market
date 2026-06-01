'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('../lexer');
const { parse } = require('../parser');
const { lowerToIR } = require('../ir');
const { runIR } = require('../vm');

test('lowers AST to IR and executes with neural graph', () => {
    const inputPath = path.resolve(__dirname, '../../examples/market.shk');
    const source = fs.readFileSync(inputPath, 'utf8');

    const ast = parse(lex(source));
    const ir = lowerToIR(ast);
    const result = runIR(ir);

    assert.equal(ir.type, 'SheikhaIR');
    assert.ok(ir.steps.length > 0);
    assert.equal(result.state.neural.cells, 19);
    assert.ok(result.state.neural.executionGraph.nodes.length > 0);
    assert.ok(result.state.output.some((line) => line.includes('رفض')));
});

test('governance blocks prohibited command approvals', () => {
    const ast = {
        type: 'Program',
        body: [
            {
                type: 'ProcedureDeclaration',
                name: 'اختبار',
                body: [
                    {
                        type: 'CommandStatement',
                        command: 'أجز',
                        argument: 'عملية فيها ربا',
                        loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
                    },
                ],
                loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            },
        ],
    };

    const ir = lowerToIR(ast);
    const result = runIR(ir);

    assert.equal(result.ok, false);
    assert.ok(result.state.governance.violations.length > 0);
    assert.ok(result.state.governance.violations.some((v) => v.rule === 'prohibited-financial-patterns'));
});

test('executes API/PM2/Docker adapters in dry-run mode', () => {
    const inputPath = path.resolve(__dirname, '../../examples/orchestration.shk');
    const source = fs.readFileSync(inputPath, 'utf8');

    const ast = parse(lex(source));
    const ir = lowerToIR(ast);
    const result = runIR(ir);

    assert.equal(result.ok, true);
    assert.equal(result.state.adapters.dryRun, true);
    assert.ok(result.state.adapters.calls.some((c) => c.adapter === 'api'));
    assert.ok(result.state.adapters.calls.some((c) => c.adapter === 'pm2'));
    assert.ok(result.state.adapters.calls.some((c) => c.adapter === 'docker'));
});

test('governance blocks unsafe docker actions', () => {
    const ast = {
        type: 'Program',
        body: [
            {
                type: 'ProcedureDeclaration',
                name: 'خطر',
                body: [
                    {
                        type: 'CommandStatement',
                        command: 'DOCKER',
                        argument: 'prune',
                        loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
                    },
                ],
                loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            },
        ],
    };

    const result = runIR(lowerToIR(ast));
    assert.equal(result.ok, false);
    assert.ok(result.state.governance.violations.some((v) => v.rule === 'adapter-action-allowlist'));
});

test('sandbox blocks localhost API target under strict production profile', () => {
    const ast = {
        type: 'Program',
        body: [
            {
                type: 'ProcedureDeclaration',
                name: 'عزل',
                body: [
                    {
                        type: 'CommandStatement',
                        command: 'API',
                        argument: '"GET" "http://127.0.0.1:8080/api/health"',
                        loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
                    },
                ],
                loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            },
        ],
    };

    const result = runIR(lowerToIR(ast), { profile: 'production', strictIsolation: true });
    assert.equal(result.ok, false);
    assert.ok(result.state.output.some((line) => line.includes('SANDBOX_DENY')));
});

test('executes python bridge live with json contract', () => {
    const inputPath = path.resolve(__dirname, '../../examples/python-bridge.shk');
    const source = fs.readFileSync(inputPath, 'utf8');

    const ast = parse(lex(source));
    const ir = lowerToIR(ast);
    const result = runIR(ir, { live: true, profile: 'local', strictIsolation: false });

    assert.equal(result.ok, true);
    assert.ok(result.state.adapters.calls.some((c) => c.adapter === 'python' && c.live === true && c.ok === true));
    assert.ok(result.state.output.some((line) => line.includes('[PYTHON:OK] scored')));
    assert.ok(result.state.output.some((line) => line.includes('"score"')));
});
