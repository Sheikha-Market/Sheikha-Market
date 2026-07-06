'use strict';

const ONTOLOGY = {

  'فاعل': {
    grammaticalRole: 'SUBJECT',
    runtimeRole: 'EXECUTION_CONTROLLER',
    accountingRole: 'TRANSACTION_EXECUTOR',
    precedence: 90
  },

  'مفعول': {
    grammaticalRole: 'OBJECT',
    runtimeRole: 'EXECUTION_TARGET',
    accountingRole: 'VALUE_TARGET',
    precedence: 80
  },

  'من': {
    grammaticalRole: 'PREPOSITION',
    runtimeRole: 'SOURCE_SCOPE_BINDING',
    accountingRole: 'LEDGER_SOURCE',
    precedence: 70
  },

  'إلى': {
    grammaticalRole: 'PREPOSITION',
    runtimeRole: 'DESTINATION_SCOPE_BINDING',
    accountingRole: 'LEDGER_DESTINATION',
    precedence: 70
  },

  'على': {
    grammaticalRole: 'PREPOSITION',
    runtimeRole: 'OBLIGATION_BINDING',
    accountingRole: 'LIABILITY_SCOPE',
    precedence: 75
  },

  'إذا': {
    grammaticalRole: 'CONDITIONAL',
    runtimeRole: 'EXECUTION_GATE',
    accountingRole: 'CONDITIONAL_EXECUTION',
    precedence: 100
  },

  'ثم': {
    grammaticalRole: 'SEQUENCE',
    runtimeRole: 'NEXT_EXECUTION',
    accountingRole: 'SEQUENTIAL_OPERATION',
    precedence: 60
  }
};

function resolveArabicOntology(token = {}) {

  const original =
    token.original || '';

  const normalized =
    token.normalized || '';

  return (
    ONTOLOGY[original] ||
    ONTOLOGY[normalized] ||
    {
      grammaticalRole: 'UNKNOWN',
      runtimeRole: 'UNRESOLVED',
      accountingRole: 'UNRESOLVED',
      precedence: 0
    }
  );
}

module.exports = {
  ONTOLOGY,
  resolveArabicOntology
};
