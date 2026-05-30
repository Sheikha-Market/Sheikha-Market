'use strict';

const { exportArabicIR } = require('../exporters/export-arabic-ir');

const OPCODES = {
  extract_from: 'LOAD_SOURCE',
  transfer_to: 'MOVE_TO_DESTINATION',
  bind_on: 'BIND_OBLIGATION',
  inside_scope: 'ENTER_SCOPE'
};

function buildArabicBytecode(input) {
  const exported = exportArabicIR(input);

  const bytecode = exported.executionPlan.map((step, index) => ({
    pc: index,
    opcode: OPCODES[step.action] || 'NOOP',
    operand: step.target,
    sourceStep: step.step
  }));

  if (exported.ledgerPayload.ready) {
    bytecode.push({
      pc: bytecode.length,
      opcode: 'EMIT_LEDGER_ENTRY',
      operand: exported.ledgerPayload.entries
    });
  }

  return {
    format: 'SHEIKHA_ARABIC_BYTECODE',
    status: exported.status === 'COMPILED' ? 'BYTECODE_READY' : 'BYTECODE_BLOCKED',
    source: input,
    bytecode
  };
}

module.exports = { buildArabicBytecode };
