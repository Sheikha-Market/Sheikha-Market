/*
نظام الأرقام العربية: تطبيع وتحويل جميع الأنظمة (عربي، فارسي/أعجمي، غربي) إلى أرقام عربية هندية (٠١٢٣٤٥٦٧٨٩)
يدعم: التطبيع، التحقق، التحويل العددي، وتصنيف أصل الرقم (عربي/أعجمي/غربي)

normalizeArabicNumbers(str): يطبع أي سلسلة أرقام إلى النظام العربي الهندي (٠١٢٣٤٥٦٧٨٩)
classifyNumberScript(str): يصنف أصل الرقم (ARABIC, AJAMI, WESTERN, MIXED_OR_UNKNOWN)
isArabicNumeric(str): يتحقق هل السلسلة رقمية بأي نظام
parseArabicNumber(str): يحول السلسلة إلى رقم جافاسكريبت
*/
'use strict';


// أرقام عربية (هندية) + أرقام فارسية/أردية + أرقام عربية غربية
const ARABIC_NUMBERS = {
  // العربية الهندية
  '٠':'0', '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9',
  // الفارسية/الأردية
  '۰':'0', '۱':'1', '۲':'2', '۳':'3', '۴':'4', '۵':'5', '۶':'6', '۷':'7', '۸':'8', '۹':'9',
  // الغربية (0-9) تبقى كما هي
};


function normalizeArabicNumbers(input = '') {
  return String(input)
    .split('')
    .map(ch => ARABIC_NUMBERS[ch] !== undefined ? ARABIC_NUMBERS[ch] : ch)
    .join('');
}

function isArabicNumeric(value = '') {

  const normalized =
    normalizeArabicNumbers(value);

  return /^\d+(\.\d+)?$/.test(normalized);
}

function parseArabicNumber(value = '') {

  const normalized =
    normalizeArabicNumbers(value);

  if (!isArabicNumeric(normalized)) {
    return null;
  }

  return Number(normalized);
}


function classifyNumberScript(input = '') {
  // أرقام عربية هندية
  if (/^[٠-٩]+$/.test(input)) return 'ARABIC';
  // أرقام فارسية/أردية
  if (/^[۰-۹]+$/.test(input)) return 'AJAMI';
  // أرقام غربية
  if (/^[0-9]+$/.test(input)) return 'WESTERN';
  // مختلط أو غير معروف
  return 'MIXED_OR_UNKNOWN';
}

module.exports = {
  normalizeArabicNumbers,
  isArabicNumeric,
  parseArabicNumber,
  classifyNumberScript
};
