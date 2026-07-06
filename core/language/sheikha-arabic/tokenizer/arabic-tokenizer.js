'use strict';

function normalizeArabic(input) {
  return String(input || '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0600-\u06FF0-9_./\s]/g, '')
    .trim();
}

function tokenizeArabic(input) {

  const originalTokens =
    String(input || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return originalTokens.map((original, index) => {

    const normalized = normalizeArabic(original);

    return {
      index,

      original,

      normalized,

      canonical:
        original,

      semantic:
        normalized
    };
  });
}

module.exports = {
  normalizeArabic,
  tokenizeArabic
};
