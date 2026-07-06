'use strict';

function buildExecutionEquation(ir = {}) {

  const operations =
    Array.isArray(ir.operations)
      ? ir.operations
      : [];

  return operations.map(op => {

    return {
      operation: op.effect,
      equation:
        `${op.effect}(${op.target})`,
      deterministic: true
    };

  });
}

module.exports = {
  buildExecutionEquation
};
