'use strict';

const { exportArabicIR } = require('../exporters/export-arabic-ir');
const { buildControlFlowIR } = require('../compiler/arabic-control-flow-ir');

const OPCODES = {
  extract_from: 'LOAD_SOURCE',
  transfer_to: 'MOVE_TO_DESTINATION',
  bind_on: 'BIND_OBLIGATION',
  inside_scope: 'ENTER_SCOPE'
};

function buildArabicBytecode(input) {
  const exported = exportArabicIR(input);
  const control = buildControlFlowIR(input);

  const bytecode = [];

  if (control.hasCondition) {
    bytecode.push({
      pc: bytecode.length,
      opcode: 'IF_BEGIN',
      operand: control.controlFlow
    });
  }

  for (const step of exported.executionPlan) {
    bytecode.push({
      pc: bytecode.length,
      opcode: OPCODES[step.action] || 'NOOP',
      operand: step.target,
      sourceStep: step.step
    });
  }

  if (exported.ledgerPayload.ready) {
    bytecode.push({
      pc: bytecode.length,
      opcode: 'EMIT_LEDGER_ENTRY',
      operand: exported.ledgerPayload.entries
    });
  }

  if (control.hasCondition) {
    bytecode.push({
      pc: bytecode.length,
      opcode: 'IF_END',
      operand: null
    });
  }

  return {
    format: 'SHEIKHA_ARABIC_BYTECODE',
    status: exported.status === 'COMPILED' ? 'BYTECODE_READY' : 'BYTECODE_BLOCKED',
    source: input,
    control,
    bytecode
  };
}

module.exports = { buildArabicBytecode };
