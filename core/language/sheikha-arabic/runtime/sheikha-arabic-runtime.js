'use strict';

const { tokenizeArabic } = require('../tokenizer/arabic-tokenizer');
const { parseArabicAccountingCommand } = require('../parse-arabic-accounting-command');
const { executeIrab } = require('../irab-engine/irab-executor');
const { analyzeRoot } = require('../root-engine/root-analyzer');

function runSheikhaArabicRuntime(input) {
  const tokens = tokenizeArabic(input);
  const parsed = parseArabicAccountingCommand(input);
  const irab = executeIrab(parsed);
  const roots = parsed.tokens.map(t => analyzeRoot(t.token));

  return {
    runtime: 'Sheikha Arabic Deterministic Linguistic Runtime',
    input,
    tokens,
    parsed,
    irab,
    roots,
    accounting: {
      أثر_محاسبي: parsed.أثر_محاسبي,
      قيود: parsed.قيود
    },
    decision: parsed.قيود.length ? 'ACCOUNTING_ENTRY_READY' : 'NEEDS_MORE_GRAMMAR_CONTEXT'
  };
}

module.exports = { runSheikhaArabicRuntime };
