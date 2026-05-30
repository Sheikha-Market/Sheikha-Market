'use strict';

const { compileArabicAccounting } = require('../compiler/compile-arabic-accounting');

function exportArabicIR(input) {
  const compiled = compileArabicAccounting(input);

  return {
    format: 'SHEIKHA_ARABIC_EXPORTABLE_IR',
    status: compiled.status,
    source: input,
    ir: compiled.ir,
    ledgerPayload: {
      entries: compiled.ir.accountingEntries,
      ready: compiled.ir.decision === 'IR_READY_FOR_EXECUTION'
    },
    executionPlan: compiled.ir.operations.map(op => ({
      step: op.id,
      action: op.effect,
      target: op.target
    }))
  };
}

function exportArabicToJavaScriptPlan(input) {
  const exported = exportArabicIR(input);

  return [
    "'use strict';",
    '',
    'const executionPlan = ' + JSON.stringify(exported.executionPlan, null, 2) + ';',
    'const ledgerPayload = ' + JSON.stringify(exported.ledgerPayload, null, 2) + ';',
    '',
    'module.exports = { executionPlan, ledgerPayload };'
  ].join('\n');
}

module.exports = {
  exportArabicIR,
  exportArabicToJavaScriptPlan
};
