'use strict';

const {
  executeArabicDeterministicRuntime
} = require('../kernel/arabic-deterministic-runtime-kernel');

function buildCanonicalArabicExecutionModel(input) {
  const runtime = executeArabicDeterministicRuntime(input);

  return {
    model: 'SHEIKHA_ARABIC_CANONICAL_EXECUTION_MODEL',
    deterministic: true,
    input,

    source: {
      text: input,
      tokens: runtime.tokens
    },

    language: {
      ast: runtime.ast,
      dependencies: runtime.dependencies
    },

    execution: {
      bytecode: runtime.bytecode,
      memoryGraph: runtime.memoryGraph,
      state: runtime.executionState
    },

    canonicalDecision:
      runtime.executionState?.ready &&
      runtime.executionState?.validated &&
      runtime.executionState?.executable
        ? 'CANONICAL_EXECUTION_READY'
        : 'CANONICAL_EXECUTION_BLOCKED'
  };
}

module.exports = {
  buildCanonicalArabicExecutionModel
};
