'use strict';

function optimizeArabicBytecode(program = {}) {
  const bytecode = Array.isArray(program.bytecode) ? program.bytecode : [];

  const optimized = [];
  const seen = new Set();

  for (const instruction of bytecode) {
    const key = JSON.stringify(instruction);

    if (seen.has(key)) continue;
    seen.add(key);

    optimized.push({
      ...instruction,
      optimized: true
    });
  }

  return {
    format: 'SHEIKHA_ARABIC_OPTIMIZED_BYTECODE',
    originalLength: bytecode.length,
    optimizedLength: optimized.length,
    optimized
  };
}

module.exports = { optimizeArabicBytecode };
