'use strict';

function buildArabicDependencyGraph(ast = {}) {

  const body =
    Array.isArray(ast.body)
      ? ast.body
      : [];

  const dependencies = [];

  for (let i = 0; i < body.length; i++) {

    const current = body[i];
    const next = body[i + 1];

    if (!next) continue;

    if (
      current.semanticType === 'OPERATOR'
    ) {

      dependencies.push({
        controller: current.original,
        target: next.original,
        relation:
          current.grammaticalState?.runtimeMeaning ||
          'SCOPE_CONTROL'
      });
    }

    if (
      current.semanticType === 'ENTITY' &&
      next.semanticType === 'VALUE'
    ) {

      dependencies.push({
        controller: current.original,
        target: next.original,
        relation: 'EXECUTES_ON'
      });
    }
  }

  return {
    type: 'ARABIC_DEPENDENCY_GRAPH',
    deterministic: true,
    dependencies
  };
}

module.exports = {
  buildArabicDependencyGraph
};
