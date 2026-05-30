'use strict';

function detectSemanticIdentity(token) {

  const t =
    String(token || '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');

  if (t.includes('حساب')) {
    return {
      type: 'ACCOUNT',
      domain: 'ACCOUNTING',
      runtimeRole: 'LEDGER_ACCOUNT'
    };
  }

  if (
    t.includes('مبلغ') ||
    t.includes('رصيد') ||
    t.includes('ريال')
  ) {
    return {
      type: 'AMOUNT',
      domain: 'FINANCIAL',
      runtimeRole: 'VALUE_OBJECT'
    };
  }

  if (
    t.includes('مورد') ||
    t.includes('مشتري') ||
    t.includes('محاسب') ||
    t.includes('ناقل')
  ) {
    return {
      type: 'ACTOR',
      domain: 'BUSINESS',
      runtimeRole: 'EXECUTOR'
    };
  }

  if (
    t === 'من' ||
    t === 'الى' ||
    t === 'إلى' ||
    t === 'على'
  ) {
    return {
      type: 'GRAMMAR_OPERATOR',
      domain: 'EXECUTION',
      runtimeRole: 'FLOW_CONTROL'
    };
  }

  return {
    type: 'GENERIC',
    domain: 'GENERAL',
    runtimeRole: 'UNKNOWN'
  };
}

module.exports = { detectSemanticIdentity };
