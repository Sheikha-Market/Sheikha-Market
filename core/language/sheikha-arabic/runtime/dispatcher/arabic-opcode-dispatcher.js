'use strict';

const OPCODE_HANDLERS = {

  TRANSFER(operation = {}) {
    return {
      executed: true,
      opcode: 'TRANSFER',
      source: operation.source,
      destination: operation.destination
    };
  },

  STORE(operation = {}) {
    return {
      executed: true,
      opcode: 'STORE',
      target: operation.target
    };
  },

  COMMIT_LEDGER(operation = {}) {
    return {
      executed: true,
      opcode: 'COMMIT_LEDGER',
      entries: operation.entries || []
    };
  }
};

function dispatchArabicOpcode(operation = {}) {

  const handler =
    OPCODE_HANDLERS[
      operation.opcode
    ];

  if (!handler) {
    return {
      executed: false,
      reason: 'UNKNOWN_OPCODE',
      opcode: operation.opcode
    };
  }

  return handler(operation);
}

module.exports = {
  dispatchArabicOpcode
};
