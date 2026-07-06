'use strict';

function optimizeArabicDependencies(graph = {}) {

  const deps =
    Array.isArray(graph.dependencies)
      ? graph.dependencies
      : [];

  const optimized = [];

  for (const dep of deps) {

    let optimizedRelation =
      dep.relation;

    if (
      dep.controller === 'من'
    ) {
      optimizedRelation =
        'SOURCE_SCOPE_BINDING';
    }

    if (
      dep.controller === 'إلى'
    ) {
      optimizedRelation =
        'DESTINATION_SCOPE_BINDING';
    }

    if (
      dep.controller === 'على'
    ) {
      optimizedRelation =
        'OBLIGATION_SCOPE_BINDING';
    }

    optimized.push({
      ...dep,
      optimizedRelation
    });
  }

  return {
    type: 'ARABIC_SEMANTIC_OPTIMIZATION',
    deterministic: true,
    optimized
  };
}

module.exports = {
  optimizeArabicDependencies
};
