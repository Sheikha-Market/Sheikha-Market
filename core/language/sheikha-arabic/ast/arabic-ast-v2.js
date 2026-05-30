'use strict';

const { tokenizeArabic } = require('../tokenizer/arabic-tokenizer');
const { getArabicPrecedence } = require('../precedence/arabic-precedence');
const { semanticTypeOf } = require('../types/semantic-type-system');

function buildArabicAstV2(input) {
  const tokens = tokenizeArabic(input);

  return {
    type: 'ArabicProgramV2',
    deterministic: true,
    input,
    body: tokens.map(t => ({
      type: 'ArabicTokenNode',
      original: t.original,
      normalized: t.normalized,
      precedence: getArabicPrecedence(t.original) || getArabicPrecedence(t.normalized),
      semanticType: semanticTypeOf(t.original)
    }))
  };
}

module.exports = { buildArabicAstV2 };
