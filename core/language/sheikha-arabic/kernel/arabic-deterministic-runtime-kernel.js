'use strict';

const {
  tokenizeArabic
} = require('../tokenizer/arabic-tokenizer');

const {
  buildArabicAstV2
} = require('../ast/arabic-ast-v2');

const {
  buildArabicDependencyGraph
} = require('../dependency/arabic-dependency-engine');

const {
  optimizeArabicDependencies
} = require('../optimizer/arabic-semantic-optimizer');

const {
  buildArabicBytecodeV2
} = require('../vm/v2/arabic-bytecode-v2');

const {
  optimizeArabicBytecode
} = require('../vm/optimizer/arabic-bytecode-optimizer');

function executeArabicDeterministicRuntime(input) {

  const tokens =
    tokenizeArabic(input);

  const ast =
    buildArabicAstV2(input);

  const dependencies =
    buildArabicDependencyGraph(ast);

  const optimizedDependencies =
    optimizeArabicDependencies(dependencies);

  const bytecode =
    buildArabicBytecodeV2(input);

  const optimizedBytecode =
    optimizeArabicBytecode(bytecode);

  return {
    runtime: 'SHEIKHA_ARABIC_DETERMINISTIC_RUNTIME',
    deterministic: true,

    input,

    tokens,

    ast,

    dependencies: optimizedDependencies,

    memoryGraph: buildArabicRuntimeMemoryGraph({
      tokens,
      dependencies: optimizedDependencies
    }),

    bytecode: optimizedBytecode,

    executionState: {
      ready: true,
      validated: true,
      executable: true
    }
  };
}

const { buildArabicRuntimeMemoryGraph } = require('../memory/arabic-runtime-memory-graph');

module.exports = {
  executeArabicDeterministicRuntime
};
