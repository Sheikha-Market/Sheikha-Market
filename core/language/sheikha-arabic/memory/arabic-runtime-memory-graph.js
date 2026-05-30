'use strict';

function buildArabicRuntimeMemoryGraph(runtime = {}) {

  const graph = {
    type: 'ARABIC_RUNTIME_MEMORY_GRAPH',
    deterministic: true,

    states: [],

    edges: []
  };

  const tokens =
    runtime.tokens || [];

  const optimized =
    runtime.dependencies?.optimized || [];

  for (let i = 0; i < tokens.length; i++) {

    graph.states.push({
      id: `state_${i + 1}`,
      token: tokens[i].original,
      semantic: tokens[i].semantic
    });
  }

  for (const dep of optimized) {

    graph.edges.push({
      from: dep.controller,
      to: dep.target,
      relation:
        dep.optimizedRelation
    });
  }

  return graph;
}

module.exports = {
  buildArabicRuntimeMemoryGraph
};
