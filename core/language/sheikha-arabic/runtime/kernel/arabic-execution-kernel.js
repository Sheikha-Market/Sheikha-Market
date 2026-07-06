'use strict';

function createArabicExecutionKernel() {

  return {
    runtime: 'SHEIKHA_ARABIC_EXECUTION_KERNEL',
    cycle: 0,
    frames: [],
    transactions: [],
    interrupts: [],
    deterministic: true
  };
}

function tickArabicKernel(kernel) {

  return {
    ...kernel,
    cycle: kernel.cycle + 1
  };
}

function attachFrame(kernel, frame) {

  return {
    ...kernel,
    frames: [
      ...kernel.frames,
      frame
    ]
  };
}

function attachTransaction(kernel, txn) {

  return {
    ...kernel,
    transactions: [
      ...kernel.transactions,
      txn
    ]
  };
}

module.exports = {
  createArabicExecutionKernel,
  tickArabicKernel,
  attachFrame,
  attachTransaction
};
