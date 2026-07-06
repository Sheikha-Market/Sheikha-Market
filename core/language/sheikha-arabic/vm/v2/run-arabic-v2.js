'use strict';

const { buildArabicAstV2 } = require('../../ast/arabic-ast-v2');
const { buildArabicBytecodeV2 } = require('./arabic-bytecode-v2');
const { runArabicVmV2 } = require('./arabic-vm-v2');

function runArabicV2(input) {
  const ast = buildArabicAstV2(input);
  const program = buildArabicBytecodeV2(input);
  const result = runArabicVmV2(program);

  return {
    runtime: 'SHEIKHA_ARABIC_RUNTIME_V2_KERNEL',
    input,
    ast,
    program,
    result
  };
}

module.exports = { runArabicV2 };
