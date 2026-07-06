'use strict';

const LOGIC_OPERATORS = {
  'و': 'AND',
  'أو': 'OR',
  'او': 'OR',
  'إذا': 'IF',
  'ثم': 'THEN',
  'ليس': 'NOT'
};

function buildArabicLogicGraph(tokens = []) {

  const graph = [];

  for (let i = 0; i < tokens.length; i++) {

    const token = tokens[i];

    const operator =
      LOGIC_OPERATORS[token.original] ||
      LOGIC_OPERATORS[token.normalized];

    graph.push({
      node: i,
      token: token.original,
      operator: operator || null,
      deterministic: true
    });
  }

  return {
    type: 'ARABIC_LOGIC_GRAPH',
    nodes: graph
  };
}

module.exports = {
  buildArabicLogicGraph
};
