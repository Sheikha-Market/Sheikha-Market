'use strict';

const { runSheikhaArabicRuntime } = require('./sheikha-arabic-runtime');

function runArabicAccountingPipeline(input) {
  const result = runSheikhaArabicRuntime(input);

  return {
    pipeline: 'SHEIKHA_ARABIC_ACCOUNTING_PIPELINE',
    status: result.decision === 'ACCOUNTING_ENTRY_READY' ? 'PASSED' : 'NEEDS_REVIEW',
    language: {
      tokens: result.tokens,
      irab: result.irab,
      roots: result.roots
    },
    accounting: result.accounting,
    explanation: {
      grammar: 'تم تحويل الإعراب والعلاقات النحوية إلى أثر محاسبي قابل للتفسير.',
      rule: 'حرف الجر يجر الاسم بعده ويحدد علاقة المصدر أو الوجهة أو الالتزام.',
      decision: result.decision
    }
  };
}

module.exports = { runArabicAccountingPipeline };
