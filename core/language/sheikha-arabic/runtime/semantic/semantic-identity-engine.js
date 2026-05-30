'use strict';

function detectSemanticIdentity(token) {

  if (!token) return null;

  if (token.includes('حساب')) {
    return {
      type: 'ACCOUNT',
      domain: 'ACCOUNTING'
    };
  }

  if (token.includes('مبلغ')) {
    return {
      type: 'AMOUNT',
      domain: 'FINANCIAL'
    };
  }

  if (
    token.includes('المورد') ||
    token.includes('المشتري') ||
    token.includes('المحاسب')
  ) {
    return {
      type: 'ACTOR',
      domain: 'BUSINESS'
    };
  }

  return {
    type: 'GENERIC',
    domain: 'GENERAL'
  };
}

module.exports = { detectSemanticIdentity };
