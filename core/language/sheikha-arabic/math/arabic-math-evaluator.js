'use strict';

const { compileArabicMath } = require('./arabic-math-compiler');

function evaluateSimpleArabicMath(input) {
  const compiled = compileArabicMath(input);
  const ir = compiled.ir;

  const values = ir.filter(x => x.type === 'NUMBER').map(x => x.value);
  const op = ir.find(x => x.type === 'OPERATOR');

  let result = null;

  if (values.length >= 2 && op) {
    const [a, b] = values;

    if (op.opcode === 'ADD') result = a + b;
    if (op.opcode === 'SUBTRACT') result = a - b;
    if (op.opcode === 'MULTIPLY' || op.opcode === 'MULTIPLY_OR_SCOPE') result = a * b;
    if (op.opcode === 'DIVIDE' || op.opcode === 'DIVIDE_OR_OBLIGATION') result = b === 0 ? null : a / b;
    if (op.opcode === 'POWER') result = a ** b;
  }

  if (values.length >= 1 && op?.opcode === 'SQRT') {
    result = Math.sqrt(values[0]);
  }

  if (values.length >= 1 && op?.opcode === 'LOG') {
    result = Math.log(values[0]);
  }

  return {
    runtime: 'SHEIKHA_ARABIC_MATH_RUNTIME',
    input,
    compiled,
    result,
    status: result === null ? 'NEEDS_MORE_CONTEXT' : 'EVALUATED'
  };
}

module.exports = { evaluateSimpleArabicMath };
