'use strict';

const { compileArabicAccounting } = require('./compile-arabic-accounting');
const { buildControlFlowIR } = require('./arabic-control-flow-ir');

function compileArabicProgram(input) {
  const accounting = compileArabicAccounting(input);
  const control = buildControlFlowIR(input);

  return {
    compiler: 'SHEIKHA_ARABIC_PROGRAM_COMPILER',
    deterministic: true,
    input,
    accounting,
    control,
    status:
      accounting.status === 'COMPILED'
        ? 'PROGRAM_COMPILED'
        : 'PROGRAM_NEEDS_CONTEXT'
  };
}

module.exports = { compileArabicProgram };
