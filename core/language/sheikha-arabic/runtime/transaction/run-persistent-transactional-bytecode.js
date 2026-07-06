'use strict';

const {
  runTransactionalArabicBytecode
} = require('./run-transactional-bytecode');

const {
  saveArabicRuntimeState
} = require('../persistence/arabic-runtime-state-store');

function runPersistentTransactionalArabicBytecode(program = {}) {
  const result = runTransactionalArabicBytecode(program);

  if (result.status === 'TRANSACTION_COMMITTED') {
    saveArabicRuntimeState({
      accounts: result.memoryResult.memory.accounts,
      operations: result.memoryResult.memory.operations,
      states: result.memoryResult.memory.states,
      transaction: result.transaction,
      deterministic: true
    });
  }

  return {
    runtime: 'SHEIKHA_PERSISTENT_TRANSACTIONAL_ARABIC_RUNTIME',
    persisted: result.status === 'TRANSACTION_COMMITTED',
    result
  };
}

module.exports = { runPersistentTransactionalArabicBytecode };
