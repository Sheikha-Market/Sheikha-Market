'use strict';

const ROOT_PATTERNS = {
  'فعل': ['ف','ع','ل'],
  'فاعل': ['ف','ا','ع','ل'],
  'مفعول': ['م','ف','ع','و','ل'],
  'تفعيل': ['ت','ف','ع','ي','ل']
};

function extractRootByPattern(word = '') {

  const normalized =
    String(word)
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');

  const letters =
    normalized.replace(/[^\u0621-\u064A]/g, '');

  if (letters.length < 3) {
    return null;
  }

  return {
    word,
    root: [
      letters[0],
      letters[1],
      letters[2]
    ].join(''),
    algebraicWeight:
      letters.length
  };
}

module.exports = {
  ROOT_PATTERNS,
  extractRootByPattern
};
