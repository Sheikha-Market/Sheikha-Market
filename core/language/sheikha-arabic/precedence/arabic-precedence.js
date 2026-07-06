'use strict';

const PRECEDENCE = {
  'إذا': 10,
  'ثم': 20,
  'و': 30,
  'أو': 30,
  'من': 40,
  'إلى': 40,
  'على': 40,
  'في': 40,
  'زائد': 50,
  'ناقص': 50,
  'ضرب': 60,
  'قسمة': 60,
  'أس': 70
};

function getArabicPrecedence(token) {
  return PRECEDENCE[token] || 0;
}

module.exports = { PRECEDENCE, getArabicPrecedence };
