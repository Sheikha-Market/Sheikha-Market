'use strict';

const PERMISSIONS = {

  TRANSFER: [
    'ACCOUNTING',
    'FINANCIAL'
  ],

  STORE: [
    'STORAGE'
  ],

  COMMIT_LEDGER: [
    'ACCOUNTING'
  ]
};

function authorizeArabicOpcode({
  opcode,
  domain
} = {}) {

  const allowed =
    PERMISSIONS[opcode];

  if (!allowed) {
    return {
      authorized: false,
      reason: 'UNKNOWN_OPCODE'
    };
  }

  return {
    authorized:
      allowed.includes(domain),
    opcode,
    domain,
    allowed
  };
}

module.exports = {
  authorizeArabicOpcode
};
