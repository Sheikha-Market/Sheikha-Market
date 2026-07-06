'use strict';

function adviseWarning(warning = {}) {
  const message = String(warning.message || warning || '').toLowerCase();

  const category =
    message.includes('secret') ||
    message.includes('token') ||
    message.includes('key') ||
    message.includes('permission')
      ? 'AMANAH_SECURITY_REVIEW'
      : message.includes('deprecated') ||
        message.includes('punycode') ||
        message.includes('node-fetch') ||
        message.includes('whatwg-url')
        ? 'ITQAN_TECHNICAL_DEBT'
        : message.includes('error') ||
          message.includes('fail') ||
          message.includes('exception')
          ? 'ISLAH_REQUIRED'
          : 'GENERAL_NASIHA';

  return {
    system: 'SHEIKHA_MAAROOF_MUNKAR_WARNING_ADVISOR_V1',
    status: 'ACTIVE',
    category,
    principle: 'AMR_BIL_MAAROOF_NAHY_ANIL_MUNKAR',
    mode: 'ADVISORY_GOVERNANCE_ONLY',
    noCoercion: true,
    noFatwaClaim: true,
    noHiddenSuppression: true,
    advice: {
      commandGood: [
        'اتق الله في الأمانة',
        'التزم بالصدق والإتقان',
        'أصلح الخلل بالدليل والاختبار',
        'احفظ الحقوق ولا تكتم التنبيه'
      ],
      forbidWrong: [
        'لا تُخفِ التحذير',
        'لا تتجاوز الحوكمة',
        'لا تكسر العقود',
        'لا ترقي للإنتاج بلا تحقق'
      ]
    },
    requiredAction: [
      'classify-warning',
      'find-root-cause',
      'create-repair-plan',
      'verify-with-tests',
      'record-evidence'
    ],
    originalWarning: warning
  };
}

module.exports = {
  adviseWarning
};
