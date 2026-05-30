'use strict';

const { tokenizeArabic } = require('../tokenizer/arabic-tokenizer');
const { ARABIC_MATH_OPERATORS } = require('./arabic-math-operators');

function compileArabicMath(input) {
  const tokens = tokenizeArabic(input);

  const ir = tokens.map(t => {
    const op = ARABIC_MATH_OPERATORS[t.original] || ARABIC_MATH_OPERATORS[t.normalized];

    if (op) {
      return {
        type: 'OPERATOR',
        token: t.original,
        symbol: op.symbol,
        opcode: op.opcode
      };
    }

    if (/^\d+(\.\d+)?$/.test(t.original)) {
      return {
        type: 'NUMBER',
        value: Number(t.original)
      };
    }

    return {
      type: 'IDENTIFIER',
      token: t.original
    };
  });

  return {
    compiler: 'SHEIKHA_ARABIC_MATH_COMPILER',
    deterministic: true,
    input,
    ir
  };
}

module.exports = { compileArabicMath };
