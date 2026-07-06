'use strict';

const EXECUTION_CONTEXTS = {
  'حوّل': {
    ACCOUNTING: { meaning: 'TRANSFER_FUNDS', opcode: 'TRANSFER' },
    NETWORK: { meaning: 'ROUTE_PACKET', opcode: 'NETWORK_TRANSFER' },
    FILESYSTEM: { meaning: 'MOVE_RESOURCE', opcode: 'MOVE' }
  },

  'حول': {
    ACCOUNTING: { meaning: 'TRANSFER_FUNDS', opcode: 'TRANSFER' },
    NETWORK: { meaning: 'ROUTE_PACKET', opcode: 'NETWORK_TRANSFER' },
    FILESYSTEM: { meaning: 'MOVE_RESOURCE', opcode: 'MOVE' }
  },

  'سجل': {
    ACCOUNTING: { meaning: 'REGISTER_LEDGER_ENTRY', opcode: 'COMMIT_LEDGER' },
    STORAGE: { meaning: 'WRITE_STORAGE', opcode: 'STORE' }
  },

  'سجّل': {
    ACCOUNTING: { meaning: 'REGISTER_LEDGER_ENTRY', opcode: 'COMMIT_LEDGER' },
    STORAGE: { meaning: 'WRITE_STORAGE', opcode: 'STORE' }
  }
};

function resolveArabicSemanticOperation({ token, domain = 'ACCOUNTING' } = {}) {
  const contexts = EXECUTION_CONTEXTS[token];

  if (!contexts) {
    return { resolved: false, token, domain, opcode: 'UNKNOWN' };
  }

  const resolved = contexts[domain];

  if (!resolved) {
    return { resolved: false, token, domain, opcode: 'UNSUPPORTED_DOMAIN' };
  }

  return {
    resolved: true,
    token,
    domain,
    meaning: resolved.meaning,
    opcode: resolved.opcode,
    deterministic: true
  };
}

module.exports = {
  EXECUTION_CONTEXTS,
  resolveArabicSemanticOperation
};
