'use strict';

function createArabicTransaction({
  id,
  frame
} = {}) {

  return {
    id: id || `txn_${Date.now()}`,
    frame,
    operations: [],
    committed: false,
    rolledBack: false,
    deterministic: true
  };
}

function addTransactionOperation(txn, operation) {

  return {
    ...txn,
    operations: [
      ...txn.operations,
      operation
    ]
  };
}

function commitArabicTransaction(txn) {

  return {
    ...txn,
    committed: true,
    committedAt: Date.now()
  };
}

function rollbackArabicTransaction(txn) {

  return {
    ...txn,
    rolledBack: true,
    rollbackAt: Date.now()
  };
}

module.exports = {
  createArabicTransaction,
  addTransactionOperation,
  commitArabicTransaction,
  rollbackArabicTransaction
};
