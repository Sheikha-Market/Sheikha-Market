'use strict';

function normalizeSheikhaReply(text, originalMessage = '') {
  let s = String(text || '');
  const msg = String(originalMessage || '');
  const isCode = /كود|برمج|اصلح|fix|code|test|error|patch|debug|debugging|دبق|ديبق|ديبنق|دبنق/i.test(msg);

  s = s.replace(/أنا Sheikha-Core[^.\n]*(?:\.|\n)?/g, 'أنا شيخة.\n');
  s = s.replace(/Sheikha-Core/g, 'شيخة');
  s = s.replace(/واجهة الذكاء الصناعي المحلية الحاكمة داخل بنية Sheikha[^.\n]*(?:\.|\n)?/g, '');
  s = s.replace(/أستعد لخدمتك/g, 'كيف أستطيع مساعدتك؟');
  s = s.replace(/خدمتك/g, 'مساعدتك');
  s = s.replace(/خدمة/g, 'مساعدة');
  s = s.replace(/خدمات/g, 'مساعدات');
  s = s.replace(/ما هي سؤالك/g, 'ما الذي تحتاج إليه من مساعدة أو عون؟');

  if (/لا أستطيع مساعدتك|لا أستطيع تقديم الإجابة|هل هناك شيء آخر/i.test(s)) {
    if (isCode) {
      return [
        'بسم الله الرحمن الرحيم',
        '',
        'أنا شيخة.',
        '',
        'تم تحويل الطلب إلى مسار CODE.',
        'أرسل الخطأ أو الملف أو نتيجة الاختبار، وسأساعدك بتحليل وتصحيح وPatch.',
        '',
        `الطلب:\n${msg}`
      ].join('\n');
    }

    return [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      'ما الذي تحتاج إليه من مساعدة أو عون؟'
    ].join('\n');
  }

  if (/^\s*شيخة\s*$/i.test(s) || s.trim().length < 8) {
    return 'بسم الله الرحمن الرحيم\n\nأنا شيخة.\n\nما الذي تحتاج إليه من مساعدة أو عون؟';
  }

  return s.trim();
}

module.exports = { normalizeSheikhaReply };
