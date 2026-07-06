'use strict';

const { compileArabicAccounting } = require('../../compiler/compile-arabic-accounting');
const { validateSemanticTransfer } = require('../../types/semantic-type-system');
const { resolveArabicSemanticOperation } = require('../../resolution/arabic-semantic-resolution-engine');

function buildArabicBytecodeV2(input) {
  const compiled = compileArabicAccounting(input);
  const statement = compiled.ast.body[0];
  const effect = statement.accounting.أثر_محاسبي;

  const bytecode = [];

  const semanticOperation = resolveArabicSemanticOperation({
    token: statement.accounting?.أثر_محاسبي?.نوع === 'تحويل'
      ? 'حوّل'
      : statement.ir?.فعل,
    domain: 'ACCOUNTING'
  });

  if (effect?.نوع === 'تحويل') {
    const validation = validateSemanticTransfer({
      source: effect.من,
      destination: effect.إلى,
      value: effect.محل
    });

    bytecode.push({
      opcode: 'VALIDATE_TRANSFER',
      operand: validation
    });

    bytecode.push({
      opcode: 'RESOLVE_SEMANTIC_OPERATION',
      operand: semanticOperation
    });

    if (validation.valid && semanticOperation.resolved) {
      bytecode.push({ opcode: 'PUSH_SOURCE_ACCOUNT', operand: effect.من });
      bytecode.push({ opcode: 'PUSH_DESTINATION_ACCOUNT', operand: effect.إلى });
      bytecode.push({ opcode: 'PUSH_VALUE', operand: effect.محل });
      bytecode.push({ opcode: semanticOperation.opcode });
      bytecode.push({ opcode: 'COMMIT_LEDGER', operand: compiled.ir.accountingEntries });
    } else {
      bytecode.push({ opcode: 'HALT_SEMANTIC_ERROR' });
    }
  }

  return {
    format: 'SHEIKHA_ARABIC_BYTECODE_V2',
    status: bytecode.some(x => x.opcode === 'HALT_SEMANTIC_ERROR')
      ? 'SEMANTIC_BLOCKED'
      : 'BYTECODE_READY',
    bytecode
  };
}

module.exports = { buildArabicBytecodeV2 };
