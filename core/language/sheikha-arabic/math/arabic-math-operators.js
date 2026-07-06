'use strict';

const ARABIC_MATH_OPERATORS = {
  'زائد': { symbol: '+', opcode: 'ADD' },
  'ناقص': { symbol: '-', opcode: 'SUBTRACT' },
  'ضرب': { symbol: '*', opcode: 'MULTIPLY' },
  'في': { symbol: '*', opcode: 'MULTIPLY_OR_SCOPE' },
  'قسمة': { symbol: '/', opcode: 'DIVIDE' },
  'على': { symbol: '/', opcode: 'DIVIDE_OR_OBLIGATION' },
  'يساوي': { symbol: '=', opcode: 'EQUALS' },
  'أكبر': { symbol: '>', opcode: 'GREATER_THAN' },
  'أصغر': { symbol: '<', opcode: 'LESS_THAN' },
  'لوغاريتم': { symbol: 'log', opcode: 'LOG' },
  'جذر': { symbol: 'sqrt', opcode: 'SQRT' },
  'أس': { symbol: '^', opcode: 'POWER' }
};

module.exports = { ARABIC_MATH_OPERATORS };
