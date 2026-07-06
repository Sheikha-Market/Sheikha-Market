'use strict';

const { buildArabicAST } = require('./arabic-ast-builder');
const { buildArabicIR } = require('./arabic-ir-builder');

function compileArabicAccounting(input) {
  const ast = buildArabicAST(input);
  const ir = buildArabicIR(ast);

  return {
    compiler: 'SHEIKHA_ARABIC_ACCOUNTING_COMPILER',
    input,
    ast,
    ir,
    status: ir.decision === 'IR_READY_FOR_EXECUTION' ? 'COMPILED' : 'NEEDS_CONTEXT'
  };
}

module.exports = { compileArabicAccounting };
