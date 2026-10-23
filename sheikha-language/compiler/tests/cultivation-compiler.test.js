'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lex } = require('../lexer');
const { parse } = require('../parser');
const {
    compileCultivationSource,
    compileCultivationFile,
} = require('../cultivation-compiler');

test('parses مغرس as a first-class cultivation entity', () => {
    const ast = parse(lex([
        'مغرس اختبار:',
        '  المساحة: 1000 متر_مربع',
        '  السكان: 10 شخص',
        '',
    ].join('\n')));
    const declaration = ast.body[0];
    assert.equal(declaration.type, 'EntityDeclaration');
    assert.equal(declaration.declarationKind, 'cultivation');
    assert.equal(declaration.name, 'اختبار');
});

test('parses the complete cultivation vocabulary as first-class entities', () => {
    const source = [
        'جنة دنيا:',
        '  النطاق: الدنيا',
        '  المساحة: 1000',
        '  السكان: 10',
        'تربة حية:',
        '  فحص: واجب',
        'بذرة موثقة:',
        '  المصدر: مملوك',
        'مرعى دوري:',
        '  السعة: محسوبة',
        'ثمرة نافعة:',
        '  النوع: غذاء',
        '',
    ].join('\n');
    const ast = parse(lex(source));
    assert.deepEqual(
        ast.body.map((entry) => entry.declarationKind),
        ['garden', 'soil', 'seed', 'pasture', 'fruit']
    );
});

test('compiles a Sheikha cultivation program to an engineering plan', () => {
    const input = path.resolve(
        __dirname,
        '../../examples/worldly-gardens.shk'
    );
    const result = compileCultivationFile(input);
    assert.equal(result.sourceLanguage, 'sheikha');
    assert.equal(result.declaration, 'جنات_الدنيا');
    assert.equal(result.declarationKind, 'garden');
    assert.equal(
        result.engineeringPlan.status,
        'ENGINEERING_BASIS_DECLARED_REQUIRES_INDEPENDENT_VERIFICATION'
    );
    assert.equal(result.engineeringPlan.disciplines.length, 8);
    assert.equal(
        Object.keys(result.typeCheck.symbols.cultivationDeclarations).length,
        15
    );
    assert.equal(result.cultivationGraph.unresolvedReferences.length, 0);
    assert.equal(
        result.cultivationGraph.pathways.fromScratch,
        'SOIL_TO_SEED_TO_NURSERY_TO_HARVEST'
    );
    assert.equal(result.execution.authorized, false);
    assert.equal(result.engineeringPlan.evidenceIndependentlyVerified, false);
    assert.equal(result.admissionReview.decision, 'BLOCKED');
    assert.equal(result.admissionReview.reviewable, true);
    assert.equal(result.admissionReview.executable, false);
    assert.equal(
        result.admissionReview.evidence.unresolvedEngineeringInputCount,
        8
    );
    assert.ok(result.admissionReview.blockers.includes(
        'INDEPENDENT_EVIDENCE_VERIFICATION_REQUIRED'
    ));
    assert.equal(
        result.admissionReview.rule,
        'COMPILATION_NEVER_AUTHORIZES_PHYSICAL_EXECUTION'
    );
});

test('type checker rejects a non-worldly engineering garden', () => {
    const ast = parse(lex([
        'جنة مرفوضة:',
        '  النطاق: الآخرة',
        '  المساحة: 1000',
        '  السكان: 10',
        '',
    ].join('\n')));
    const { typeCheckAst } = require('../type-checker');
    const result = typeCheckAst(ast);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((entry) =>
        entry.code === 'SHK-CULT-001'
    ));
});

test('requires every engineering garden to declare a worldly scope', () => {
    const source = [
        'جنة غيبية:',
        '  النطاق: الآخرة',
        '  المساحة: 1000',
        '  السكان: 10',
        '',
    ].join('\n');
    assert.throws(
        () => compileCultivationSource(source),
        (error) => error.code === 'SHK-CULT-TYPECHECK-FAILED' &&
            error.diagnostics.some((entry) => entry.code === 'SHK-CULT-001')
    );
});

test('forbids unseen descriptions from entering engineering calculation', () => {
    const source = [
        'مغرس ممنوع:',
        '  المساحة: 1000',
        '  السكان: 10',
        '  أبعاد_الجنة: 100',
        '',
    ].join('\n');
    assert.throws(
        () => compileCultivationSource(source),
        (error) => error.code === 'SHK-CULT-UNSEEN-001'
    );
});

test('compiler CLI writes a reviewable JSON artifact', () => {
    const input = path.resolve(
        __dirname,
        '../../examples/worldly-gardens.shk'
    );
    const output = path.resolve(
        __dirname,
        '../../examples/worldly-gardens.plan.json'
    );
    const result = compileCultivationFile(input);
    fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    const written = JSON.parse(fs.readFileSync(output, 'utf8'));
    assert.equal(written.engineeringPlan.physicalExecutionAuthorized, false);
});
