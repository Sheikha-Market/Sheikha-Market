'use strict';

function scheduleArabicExecution(ir = {}) {

  const operations =
    Array.isArray(ir.operations)
      ? ir.operations
      : [];

  return operations.map((op, index) => ({
    executionOrder: index + 1,
    opcode: op.effect,
    target: op.target,
    deterministic: true
  }));
}

module.exports = {
  scheduleArabicExecution
};
