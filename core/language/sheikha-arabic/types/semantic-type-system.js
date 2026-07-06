'use strict';

const SEMANTIC_TYPES = {

  ACCOUNT: {
    domain: 'ACCOUNTING',
    executable: true
  },

  VALUE: {
    domain: 'FINANCIAL',
    executable: true
  },

  ENTITY: {
    domain: 'ACTOR',
    executable: true
  },

  OPERATOR: {
    domain: 'GRAMMAR',
    executable: true
  },

  CONDITION: {
    domain: 'CONTROL_FLOW',
    executable: true
  },

  UNKNOWN: {
    domain: 'UNRESOLVED',
    executable: false
  }
};

function normalizeArabic(input = '') {
  return String(input)
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function semanticTypeOf(token = '') {

  const t = normalizeArabic(token);

  if (
    t.includes('حساب')
  ) {
    return 'ACCOUNT';
  }

  if (
    t.includes('مبلغ') ||
    t.includes('رصيد') ||
    t.includes('ريال')
  ) {
    return 'VALUE';
  }

  if (
    t.includes('مورد') ||
    t.includes('مشتري') ||
    t.includes('ناقل') ||
    t.includes('محاسب')
  ) {
    return 'ENTITY';
  }

  if (
    [
      'من',
      'الى',
      'إلى',
      'على',
      'في',
      'ثم',
      'او',
      'أو',
      'و'
    ].includes(token) ||

    [
      'من',
      'الى',
      'على',
      'في',
      'ثم',
      'او',
      'و'
    ].includes(t)
  ) {
    return 'OPERATOR';
  }

  if (
    [
      'اذا',
      'إذا',
      'لو',
      'ان'
    ].includes(token) ||

    [
      'اذا',
      'لو',
      'ان'
    ].includes(t)
  ) {
    return 'CONDITION';
  }

  return 'UNKNOWN';
}

function resolveSemanticNode(token = '') {

  const type =
    semanticTypeOf(token);

  return {
    token,
    normalized:
      normalizeArabic(token),
    semanticType: type,
    metadata:
      SEMANTIC_TYPES[type]
  };
}

function validateSemanticTransfer({
  source,
  destination,
  value
}) {

  const sourceType =
    semanticTypeOf(source);

  const destinationType =
    semanticTypeOf(destination);

  const valueType =
    semanticTypeOf(value);

  return {
    valid:
      sourceType === 'ACCOUNT' &&
      destinationType === 'ACCOUNT' &&
      valueType === 'VALUE',

    sourceType,
    destinationType,
    valueType
  };
}

module.exports = {
  SEMANTIC_TYPES,
  semanticTypeOf,
  resolveSemanticNode,
  validateSemanticTransfer
};
