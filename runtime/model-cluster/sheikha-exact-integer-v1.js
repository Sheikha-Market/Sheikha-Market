'use strict';

const { normalizeArabicNumbers } = require('../../core/language/sheikha-arabic/math/arabic-number-system');

function exactIntegerAnswer(message) {
  if (typeof message !== 'string' || message.length > 300) return null;
  // Entire-input grammar, not a JavaScript evaluator or a general expression parser.
  const normalized = normalizeArabicNumbers(message).trim();
  const match = /^(?:(?:calculate|compute|\u0627\u062d\u0633\u0628)\s+)?([+-]?\d{1,100})\s*([+*\-\u00d7])\s*([+-]?\d{1,100})\s*[?\u061f]?$/i.exec(normalized);
  if (!match) return null;
  const a = BigInt(match[1]);
  const b = BigInt(match[3]);
  const op = match[2] === '\u00d7' ? '*' : match[2];
  const result = (op === '+' ? a + b : op === '-' ? a - b : a * b).toString();
  return { success: true, task: 'EXACT_INTEGER_ARITHMETIC', model: null,
    executor: 'SHEIKHA_EXACT_INTEGER_V1', answer: `${a} ${op} ${b} = ${result}`,
    evidence: { engine: 'ECMASCRIPT_BIGINT', operation: op, operands: [a.toString(), b.toString()],
      result, scope: 'TWO_INTEGER_OPERANDS_ADD_SUBTRACT_MULTIPLY', networkUsed: false,
      modelInferenceUsed: false, arbitraryCodeExecuted: false } };
}

module.exports = { exactIntegerAnswer };
