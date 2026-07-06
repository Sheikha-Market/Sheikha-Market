'use strict';

function buildArabicIR(ast) {
  const statement = ast.body[0];

  return {
    type: 'SheikhaArabicIR',
    deterministic: true,
    operations: statement.execution.map((step, index) => ({
      id: `op_${index + 1}`,
      operator: step.operator,
      effect: step.executionEffect,
      target: step.target
    })),
    accountingEntries: statement.accounting.قيود || [],
    decision:
      statement.accounting.قيود?.length
        ? 'IR_READY_FOR_EXECUTION'
        : 'IR_NEEDS_CONTEXT'
  };
}

module.exports = { buildArabicIR };
