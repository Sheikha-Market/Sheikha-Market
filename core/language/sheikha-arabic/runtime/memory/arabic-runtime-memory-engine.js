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

function cloneMemoryState(memory) {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(memory);
  }

  return JSON.parse(JSON.stringify(memory));
}

function applyArabicOperation(memory, operation = {}) {

  const next =
    cloneMemoryState(memory);

  next.operations.push(operation);

  if (operation.opcode === 'TRANSFER') {

    const source =
      operation.source;

    const destination =
      operation.destination;

    const value =
      Number(operation.value) || 0;

    next.accounts[source] =
      next.accounts[source] || 0;

    next.accounts[destination] =
      next.accounts[destination] || 0;

    next.accounts[source] -= value;
    next.accounts[destination] += value;

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
