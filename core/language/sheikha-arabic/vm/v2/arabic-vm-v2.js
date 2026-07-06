'use strict';

function runArabicVmV2(program) {
  const stack = [];
  const ledger = [];
  const trace = [];

  for (const ins of program.bytecode || []) {
    trace.push(ins);

    if (ins.opcode === 'HALT_SEMANTIC_ERROR') {
      return { status: 'BLOCKED', reason: 'SEMANTIC_VALIDATION_FAILED', trace };
    }

    if (ins.opcode.startsWith('PUSH_')) stack.push(ins.operand);
    if (ins.opcode === 'COMMIT_LEDGER') ledger.push(...ins.operand);
  }

  return {
    status: ledger.length ? 'EXECUTED' : 'NO_OUTPUT',
    stack,
    ledger,
    trace
  };
}

module.exports = { runArabicVmV2 };
