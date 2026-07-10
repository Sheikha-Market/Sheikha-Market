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

test('type checker accepts a bounded non-executable values reference and benefit policy', () => {
    const source = [
        'مرجعية القيم:',
        '  المصدر: القرآن_والسنة_الصحيحة',
        '  الدور: قيم_غير_تنفيذية',
        '  السلطة_البرمجية: لا',
        '  الفتوى_الآلية: ممنوعة',
        '  المراجعة_الشرعية: أهل_العلم_المؤهلون',
        '  التحقق_من_المصادر: واجب',
        'سياسة النفع:',
        '  يوجب: الصدق، العدل، الأمانة، الدليل',
        '  يمنع: الضرر، الظلم، الغش، الخداع، الإكراه',
        '  القرار_العالي_الأثر: مراجعة_بشرية_ملزمة',
        '  التنفيذ: أقل_صلاحية_وموافقة_صريحة',
        '',
    ].join('\n');
    const result = typeCheckAst(parse(lex(source)));

    assert.equal(result.ok, true);
    assert.equal(result.symbols.valuesReferences['القيم'].executable, false);
    assert.ok(result.symbols.governancePolicies['النفع']);
});

test('type checker rejects executable religious authority and incomplete safety policy', () => {
    const source = [
        'مرجعية غير_محكومة:',
        '  المصدر: غير_موثق',
        '  الدور: تنفيذية',
        '  السلطة_البرمجية: نعم',
        '  الفتوى_الآلية: مسموحة',
        '  المراجعة_الشرعية: آلية',
        '  التحقق_من_المصادر: اختياري',
        'سياسة ناقصة:',
        '  يوجب: السرعة',
        '  يمنع: لا_شيء',
        '  القرار_العالي_الأثر: آلي',
        '  التنفيذ: صلاحية_مطلقة',
        '',
    ].join('\n');
    const result = typeCheckAst(parse(lex(source)));

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((entry) => entry.code === 'SHK-GOV-003'));
    assert.ok(result.diagnostics.some((entry) => entry.code === 'SHK-GOV-004'));
    assert.ok(result.diagnostics.some((entry) => entry.code === 'SHK-GOV-102'));
    assert.ok(result.diagnostics.some((entry) => entry.code === 'SHK-GOV-103'));
});

test('type checker validates Arabic, mathematical, empirical, and religious evidence domains', () => {
    const canonicalPath = path.resolve(
        __dirname,
        '../../system/sheikha-sovereign-architecture-v1.shk'
    );
    const canonical = fs.readFileSync(canonicalPath, 'utf8');
    const valid = typeCheckAst(parse(lex(canonical)));

    assert.equal(valid.ok, true);
    assert.ok(valid.symbols.reasoningMethodologies['العربية_والعلوم_والاستدلال']);

    const invalid = typeCheckAst(parse(lex([
        'منهج ناقص:',
        '  لغة_البرمجة: غير_محددة',
        '  علوم_العربية: النحو',
        '  علوم_الاستدلال: المنطق',
        '  منهج_الحساب: تخمين',
        '  منهج_العلوم_التجريبية: رأي',
        '  الاستدلال_الشرعي: آلي',
        '  خلط_المجالات: مسموح',
        '  بيان_الدليل_والثقة: غير_مطلوب',
        '  الفتوى_الآلية: مسموحة',
        '',
    ].join('\n'))));

    assert.equal(invalid.ok, false);
    assert.ok(invalid.diagnostics.some((entry) => entry.code === 'SHK-METHOD-002'));
    assert.ok(invalid.diagnostics.some((entry) => entry.code === 'SHK-METHOD-005'));
    assert.ok(invalid.diagnostics.some((entry) => entry.code === 'SHK-METHOD-006'));
    assert.ok(invalid.diagnostics.some((entry) => entry.code === 'SHK-METHOD-009'));
});
