'use strict';

function createArabicRuntimeMemory() {
  return {
    accounts: {},
    operations: [],
    states: [],
    topology: {},
    deterministic: true
  };
}

function applyArabicOperation(memory, operation = {}) {

  const next =
    structuredClone(memory);

  next.operations.push(operation);

  if (operation.opcode === 'TRANSFER') {

    const source =
      operation.source;

    const destination =
      operation.destination;

    const value =
      operation.value;

    next.accounts[source] =
      next.accounts[source] || 0;

    next.accounts[destination] =
      next.accounts[destination] || 0;

    next.accounts[source] -= 1;
    next.accounts[destination] += 1;

    next.states.push({
      type: 'TRANSFER_APPLIED',
      source,
      destination,
      value
    });
  }

  return next;
}

module.exports = {
  createArabicRuntimeMemory,
  applyArabicOperation
};
