'use strict';

function improveArabicResponse(text = '') {
  return String(text || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+/gm, '')
    .trim();
}

function buildArabicExecutiveHeader(intent = 'GENERAL') {
  return [
    'بسم الله الرحمن الرحيم',
    '',
    'تمت معالجة الطلب وفق منهج شيخة: وضوح، حوكمة، دقة، وأدب.',
    `نوع المسار: ${intent}`,
    ''
  ].join('\n');
}

module.exports = {
  improveArabicResponse,
  buildArabicExecutiveHeader
};
