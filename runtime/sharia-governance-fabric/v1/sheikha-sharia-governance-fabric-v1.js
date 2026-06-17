'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 28,
    role: 'SUPREME_SHARIA_POLICY_GOVERNANCE_LAYER',
    clarification: {
      noHumanMindClaim: true,
      noConsciousnessClaim: true,
      systemIsTool: true,
      humansLearnAndJudge: true
    },
    hierarchy: [
      'QURAN',
      'AUTHENTIC_SUNNAH',
      'SUNNAH_OF_RIGHTLY_GUIDED_CALIPHS',
      'RECOGNIZED_ISLAMIC_LEGAL_MAXIMS',
      'GOVERNANCE_POLICIES',
      'SHEIKHA_EXECUTION_FABRICS',
      'OUTPUTS'
    ],
    principles: [
      'لا ضرر ولا ضرار',
      'الصدق',
      'الأمانة',
      'العدل',
      'الإحسان',
      'حفظ الحقوق',
      'منع الظلم',
      'منع الربا والغرر والخداع',
      'الشورى والمحاسبة',
      'حماية الأسرار والخصوصية'
    ],
    enforcement: {
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      humanApprovalForCriticalChanges: true,
      noIndependentFatwaClaim: true,
      scholarReviewRequiredForReligiousRulings: true
    }
  };
}

function governRequest(message = '') {
  const text = String(message || '');

  if (/ربا|riba|interest|غرر|خداع|احتيال|ظلم/i.test(text)) {
    return {
      allowed: false,
      severity: 'HIGH',
      action: 'BLOCK_OR_REVIEW',
      reason: 'Potential prohibited or harmful transaction/request'
    };
  }

  if (/فتوى|حكم شرعي|حلال|حرام/i.test(text)) {
    return {
      allowed: true,
      severity: 'MEDIUM',
      action: 'ANSWER_WITH_CAUTION_AND_REFER_TO_QUALIFIED_SCHOLAR',
      reason: 'Religious ruling requires qualified scholarly review'
    };
  }

  if (/\.env|secret|token|password|private key/i.test(text)) {
    return {
      allowed: false,
      severity: 'CRITICAL',
      action: 'BLOCK_SECRET_EXPOSURE',
      reason: 'Secrets and environment values are protected'
    };
  }

  return {
    allowed: true,
    severity: 'LOW',
    action: 'ALLOW_WITH_GOVERNANCE',
    reason: 'No sharia/governance blocker detected'
  };
}

module.exports = { status, governRequest };
