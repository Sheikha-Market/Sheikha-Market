'use strict';

const { OPERATORS } = require('../operators/grammar-operators');

function executeArabicLogic(parsed) {
  const execution = [];

  for (const relation of parsed.حروف_جر || []) {

    const op = OPERATORS[relation.حرف];

    if (!op) continue;

    execution.push({
      operator: relation.حرف,
      semanticType: op.type,
      executionEffect: op.effect,
      target: relation.يجر
    });
  }

  return {
    executable: execution.length > 0,
    execution
  };
}

module.exports = { executeArabicLogic };
