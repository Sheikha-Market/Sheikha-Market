'use strict';

const OPERATORS =
require('../registry/grammar-operator-registry.json');

function normalizeArabic(input) {
  return String(input || '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function detectSemanticIdentity(token) {

  const t = normalizeArabic(token);

  if (OPERATORS[token] || OPERATORS[t]) {
    return {
      type: 'GRAMMAR_OPERATOR',
      domain: 'EXECUTION',
      runtimeRole: 'FLOW_CONTROL',
      operator:
        OPERATORS[token] ||
        OPERATORS[t]
    };
  }

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

  return {
    type: 'GENERIC',
    domain: 'GENERAL',
    runtimeRole: 'UNKNOWN'
  };
}

module.exports = {
  detectSemanticIdentity
};
