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
  const original = String(input || '').trim();
  const normalized = normalizeArabic(original);
  return normalized.split(/\s+/).filter(Boolean).map((token, index) => ({
    index,
    token,
    original: original.split(/\s+/).filter(Boolean)[index] || token
  }));
}

module.exports = { normalizeArabic, tokenizeArabic };
