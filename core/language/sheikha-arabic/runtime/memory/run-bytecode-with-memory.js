'use strict';

const {
  createArabicRuntimeMemory,
  applyArabicOperation
} = require('./arabic-runtime-memory-engine');

function runArabicBytecodeWithMemory(program = {}) {
  let memory = createArabicRuntimeMemory();

  const bytecode = Array.isArray(program.bytecode)
    ? program.bytecode
    : program.optimized || [];

  let source = null;
  let destination = null;
  let value = null;

  for (const ins of bytecode) {
    if (ins.opcode === 'PUSH_SOURCE_ACCOUNT') source = ins.operand;
    if (ins.opcode === 'PUSH_DESTINATION_ACCOUNT') destination = ins.operand;
    if (ins.opcode === 'PUSH_VALUE') value = ins.operand;

    if (ins.opcode === 'TRANSFER') {
      memory = applyArabicOperation(memory, {
        opcode: 'TRANSFER',
        source,
        destination,
        value
      });
    }
  }

  return {
    runtime: 'SHEIKHA_ARABIC_BYTECODE_MEMORY_RUNTIME',
    status: memory.states.length ? 'MEMORY_EXECUTED' : 'NO_MEMORY_EFFECT',
    memory
  };
}

module.exports = { runArabicBytecodeWithMemory };
