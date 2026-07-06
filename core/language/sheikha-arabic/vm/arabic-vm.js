'use strict';

function runArabicBytecode(program) {
  const state = {
    source: null,
    destination: null,
    ledgerEntries: [],
    trace: []
  };

  for (const instruction of program.bytecode || []) {
    switch (instruction.opcode) {
      case 'LOAD_SOURCE':
        state.source = instruction.operand;
        break;

      case 'MOVE_TO_DESTINATION':
        state.destination = instruction.operand;
        break;

      case 'EMIT_LEDGER_ENTRY':
        state.ledgerEntries.push(...instruction.operand);
        break;

      default:
        break;
    }

    state.trace.push({
      pc: instruction.pc,
      opcode: instruction.opcode,
      operand: instruction.operand
    });
  }

  return {
    vm: 'SHEIKHA_ARABIC_VM',
    status: state.ledgerEntries.length ? 'EXECUTED' : 'NO_LEDGER_OUTPUT',
    state
  };
}

module.exports = { runArabicBytecode };
