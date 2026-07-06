'use strict';

const { buildArabicBytecode } = require('./arabic-bytecode-builder');
const { runArabicBytecode } = require('./arabic-vm');

function runArabicProgram(input) {
  const program = buildArabicBytecode(input);
  const result = runArabicBytecode(program);

  return {
    runtime: 'SHEIKHA_ARABIC_EXECUTION_KERNEL',
    program,
    result
  };
}

module.exports = { runArabicProgram };
