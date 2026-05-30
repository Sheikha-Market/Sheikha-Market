'use strict';

const STATES = {

  رفع: {
    runtimeMeaning: 'SUBJECT_ELEVATION',
    executable: true
  },

  نصب: {
    runtimeMeaning: 'TARGET_EXECUTION',
    executable: true
  },

  جر: {
    runtimeMeaning: 'SCOPE_BINDING',
    executable: true
  },

  جزم: {
    runtimeMeaning: 'EXECUTION_HALT_OR_ASSERT',
    executable: true
  }
};

function resolveGrammaticalState(node = {}) {

  const semantic =
    node.semanticType;

  if (semantic === 'ENTITY') {
    return STATES['رفع'];
  }

  if (semantic === 'VALUE') {
    return STATES['نصب'];
  }

  if (semantic === 'OPERATOR') {
    return STATES['جر'];
  }

  return {
    runtimeMeaning: 'UNRESOLVED'
  };
}

module.exports = {
  STATES,
  resolveGrammaticalState
};
