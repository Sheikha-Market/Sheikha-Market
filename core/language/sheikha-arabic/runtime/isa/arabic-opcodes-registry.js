'use strict';

const ARABIC_OPCODES = {

  TRANSFER: {
    code: 0x1001,
    category: 'ACCOUNTING',
    deterministic: true
  },

  STORE: {
    code: 0x1002,
    category: 'STORAGE',
    deterministic: true
  },

  COMMIT_LEDGER: {
    code: 0x1003,
    category: 'ACCOUNTING_LEDGER',
    deterministic: true
  },

  ROUTE_PACKET: {
    code: 0x2001,
    category: 'NETWORK',
    deterministic: true
  },

  EXECUTE_CONTRACT: {
    code: 0x3001,
    category: 'CONTRACT_RUNTIME',
    deterministic: true
  }

};

function resolveArabicOpcode(name) {

  return (
    ARABIC_OPCODES[name] ||
    null
  );
}

module.exports = {
  ARABIC_OPCODES,
  resolveArabicOpcode
};
