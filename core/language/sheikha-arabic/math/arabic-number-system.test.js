// اختبار classifyNumberScript وتكامل التطبيع
const { classifyNumberScript, normalizeArabicNumbers } = require('./arabic-number-system');

const samples = [
  { input: '١٢٣٤٥', expected: 'ARABIC' },
  { input: '۱۲۳۴۵', expected: 'AJAMI' },
  { input: '12345', expected: 'WESTERN' },
  { input: '١۲٣٤۵', expected: 'MIXED_OR_UNKNOWN' },
  { input: '٥٦۷٨٩', expected: 'MIXED_OR_UNKNOWN' },
];

console.log('اختبار classifyNumberScript:');
samples.forEach(({ input, expected }) => {
  const result = classifyNumberScript(input);
  const normalized = normalizeArabicNumbers(input);
  console.log(`input: ${input} | classify: ${result} | normalized: ${normalized} | expected: ${expected}`);
  if (result !== expected) {
    console.error('❌ خطأ في التصنيف!');
    process.exit(1);
  }
});
console.log('✅ جميع الاختبارات نجحت');
