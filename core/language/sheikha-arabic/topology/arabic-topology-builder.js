'use strict';

function buildArabicExecutionTopology(ast = {}) {

  const body =
    Array.isArray(ast.body)
      ? ast.body
      : [];

  const nodes = [];
  const edges = [];

  for (let i = 0; i < body.length; i++) {

    const node = body[i];

    nodes.push({
      id: i + 1,
      token: node.original,
      semanticType: node.semanticType,
      grammaticalState:
        node.grammaticalState?.runtimeMeaning || null
    });

    if (i < body.length - 1) {

      edges.push({
        from: i + 1,
        to: i + 2,
        relation:
          node.grammaticalState?.runtimeMeaning ||
          'SEQUENTIAL_FLOW'
      });
    }
  }

  return {
    topology: 'SHEIKHA_ARABIC_EXECUTION_TOPOLOGY',
    deterministic: true,
    nodes,
    edges
  };
}

module.exports = {
  buildArabicExecutionTopology
};
