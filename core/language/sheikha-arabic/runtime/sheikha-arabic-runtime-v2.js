'use strict';

const { runSheikhaArabicRuntime } = require('./sheikha-arabic-runtime');
const { executeArabicLogic } = require('./execution/arabic-execution-engine');
const { detectSemanticIdentity } = require('./semantic/semantic-identity-engine');

function runSheikhaArabicRuntimeV2(input) {

  const base = runSheikhaArabicRuntime(input);

  const execution = executeArabicLogic(base.parsed);

  const semanticMap = base.tokens.map(t => ({
    token: t.token,
    semantic: detectSemanticIdentity(t.token)
  }));

  return {
    runtime: 'SHEIKHA_ARABIC_RUNTIME_V2',

    deterministic: true,

    linguistic: {
      irab: base.irab,
      roots: base.roots
    },

    semantic: semanticMap,

    execution,

    accounting: base.accounting,

    finalDecision:
      execution.executable &&
      base.accounting?.قيود?.length
        ? 'READY_FOR_ACCOUNTING_EXECUTION'
        : 'NEEDS_MORE_CONTEXT'
  };
}

module.exports = { runSheikhaArabicRuntimeV2 };
