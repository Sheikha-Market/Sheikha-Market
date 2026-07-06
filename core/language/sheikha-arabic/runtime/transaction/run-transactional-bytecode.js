'use strict';

const {
  createArabicTransaction,
  addTransactionOperation,
  commitArabicTransaction,
  rollbackArabicTransaction
} = require('./arabic-transaction-engine');

const {
  runArabicBytecodeWithFrame
} = require('../frame/run-bytecode-with-frame');

const {
  runArabicBytecodeWithMemory
} = require('../memory/run-bytecode-with-memory');

function runTransactionalArabicBytecode(program = {}) {
  let txn = createArabicTransaction({
    frame: 'arabic_transaction_frame'
  });

  try {
    const frameResult = runArabicBytecodeWithFrame(program);
    const memoryResult = runArabicBytecodeWithMemory(program);

    txn = addTransactionOperation(txn, {
      type: 'FRAME_RESULT',
      status: frameResult.status
    });

    txn = addTransactionOperation(txn, {
      type: 'MEMORY_RESULT',
      status: memoryResult.status
    });

    if (
      frameResult.status === 'FRAME_EXECUTED' &&
      memoryResult.status === 'MEMORY_EXECUTED'
    ) {
      txn = commitArabicTransaction(txn);
    } else {
      txn = rollbackArabicTransaction(txn);
    }

    return {
      runtime: 'SHEIKHA_TRANSACTIONAL_ARABIC_BYTECODE_RUNTIME',
      status: txn.committed ? 'TRANSACTION_COMMITTED' : 'TRANSACTION_ROLLED_BACK',
      transaction: txn,
      frameResult,
      memoryResult
    };

  } catch (error) {
    txn = rollbackArabicTransaction(txn);

    return {
      runtime: 'SHEIKHA_TRANSACTIONAL_ARABIC_BYTECODE_RUNTIME',
      status: 'TRANSACTION_ROLLED_BACK',
      error: error.message,
      transaction: txn
    };
  }
}

module.exports = { runTransactionalArabicBytecode };
