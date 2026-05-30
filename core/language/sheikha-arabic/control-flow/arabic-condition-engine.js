'use strict';

const CONDITIONAL_OPERATORS = {
  'إذا': 'IF',
  'وإلا': 'ELSE',
  'او': 'OR',
  'أو': 'OR',
  'ثم': 'SEQUENCE',
  'و': 'AND'
};

function detectControlFlow(tokens = []) {

  return tokens.map((token, index) => {

    const op =
      CONDITIONAL_OPERATORS[token.original] ||
      CONDITIONAL_OPERATORS[token.normalized];

    if (!op) {
      return null;
    }

    return {
      index,
      token: token.original,
      operator: op
    };

  }).filter(Boolean);
}

module.exports = {
  detectControlFlow
};
