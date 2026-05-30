'use strict';

const {
  resolveArabicOpcode
} = require('../isa/arabic-opcodes-registry');

const OPCODE_HANDLERS = {

  TRANSFER(operation = {}) {
    return {
      executed: true,
      opcode: 'TRANSFER',
      isa: resolveArabicOpcode('TRANSFER'),
      source: operation.source,
      destination: operation.destination
    };
  },

  STORE(operation = {}) {
    return {
      executed: true,
      opcode: 'STORE',
      isa: resolveArabicOpcode('STORE'),
      target: operation.target
    };
  },

  COMMIT_LEDGER(operation = {}) {
    return {
      executed: true,
      opcode: 'COMMIT_LEDGER',
      isa: resolveArabicOpcode('COMMIT_LEDGER'),
      entries: operation.entries || []
    };
  }
};

function dispatchArabicOpcode(operation = {}) {
  const isa = resolveArabicOpcode(operation.opcode);

  if (!isa) {
    return {
      executed: false,
      reason: 'UNREGISTERED_OPCODE',
      opcode: operation.opcode
    };
  }

  const handler = OPCODE_HANDLERS[operation.opcode];

  if (!handler) {
    return {
      executed: false,
      reason: 'NO_HANDLER_FOR_REGISTERED_OPCODE',
      opcode: operation.opcode,
      isa
    };
  }

  return handler(operation);
}

module.exports = {
  dispatchArabicOpcode
};
