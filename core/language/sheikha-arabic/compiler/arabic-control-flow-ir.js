'use strict';

const { tokenizeArabic } = require('../tokenizer/arabic-tokenizer');
const { detectControlFlow } = require('../control-flow/arabic-condition-engine');

function buildControlFlowIR(input) {
  const tokens = tokenizeArabic(input);
  const controlFlow = detectControlFlow(tokens);

  return {
    type: 'SheikhaArabicControlFlowIR',
    deterministic: true,
    controlFlow,
    hasCondition: controlFlow.some(x => x.operator === 'IF'),
    hasSequence: controlFlow.some(x => x.operator === 'SEQUENCE')
  };
}

module.exports = { buildControlFlowIR };
