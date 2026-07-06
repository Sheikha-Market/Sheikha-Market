'use strict';

const { runSheikhaArabicRuntimeV2 } = require('../runtime/sheikha-arabic-runtime-v2');

function buildArabicAST(input) {
  const runtime = runSheikhaArabicRuntimeV2(input);

  return {
    type: 'SheikhaArabicProgram',
    deterministic: true,
    input,
    body: [{
      type: 'ArabicAccountingStatement',
      sentenceType: runtime.linguistic.irab.الجملة,
      irab: runtime.linguistic.irab.الإعراب,
      semantic: runtime.semantic,
      execution: runtime.execution.execution,
      accounting: runtime.accounting
    }]
  };
}

module.exports = { buildArabicAST };
