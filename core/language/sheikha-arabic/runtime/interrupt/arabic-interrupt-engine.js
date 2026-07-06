'use strict';

function createArabicInterrupt({
  type,
  reason,
  severity = 'NORMAL'
} = {}) {

  return {
    id: `interrupt_${Date.now()}`,
    type,
    reason,
    severity,
    createdAt: Date.now(),
    deterministic: true
  };
}

function attachInterrupt(
  kernel,
  interrupt
) {

  return {
    ...kernel,
    interrupts: [
      ...kernel.interrupts,
      interrupt
    ]
  };
}

function recoverArabicKernel(
  kernel
) {

  return {
    ...kernel,
    recovered: true,
    recoveredAt: Date.now()
  };
}

module.exports = {
  createArabicInterrupt,
  attachInterrupt,
  recoverArabicKernel
};
