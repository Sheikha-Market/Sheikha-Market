'use strict';

const {
  classifyNumberScript,
  isArabicNumeric,
  normalizeArabicNumbers,
  parseArabicNumber
} = require('./arabic-number-system');
const { evaluateSimpleArabicMath } = require('./arabic-math-evaluator');

describe('Arabic Number System', () => {
  test('normalizes Arabic, Ajami, and Western digits deterministically', () => {
    expect(normalizeArabicNumbers('١۲3')).toBe('123');
    expect(isArabicNumeric('١٢٣')).toBe(true);
    expect(parseArabicNumber('١٢٣')).toBe(123);
    expect(classifyNumberScript('١٢٣')).toBe('ARABIC');
    expect(classifyNumberScript('۱۲۳')).toBe('AJAMI');
    expect(classifyNumberScript('123')).toBe('WESTERN');
  });

  test('evaluates a simple Arabic arithmetic expression', () => {
    const result = evaluateSimpleArabicMath('٢ زائد ٣');

    expect(result.status).toBe('EVALUATED');
    expect(result.result).toBe(5);
    expect(result.compiled.ir).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'OPERATOR', opcode: 'ADD' })
    ]));
  });
});
