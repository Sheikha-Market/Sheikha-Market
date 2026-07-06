'use strict';

function removeRepeatedGreeting(text) {
  let s = String(text || '').trimStart();
  let previous = '';

  while (s && s !== previous) {
    previous = s;
    s = s.replace(/^\s*(?:بسم الله الرحمن الرحيم)[\s.،:;-]*/i, '');
    s = s.replace(/^\s*(?:أنا\s+شيخة\.?)[\s.،:;-]*/i, '');
    s = s.replace(
      /^\s*(?:ما الذي تحتاج إليه من مساعدة أو عون\??)[\s.،:;-]*/i,
      ''
    );
  }

  return s.trimStart();
}

function normalizeSheikhaReply(text, originalMessage = '', options = {}) {
  let s = String(text || '');
  const msg = String(originalMessage || '');
  const isCode = /كود|برمج|اصلح|fix|code|test|error|patch|debug|debugging|دبق|ديبق|ديبنق|دبنق/i.test(msg);
  const greetingAllowed = options.greetingAllowed !== false;

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

  if (!greetingAllowed) {
    const withoutGreeting = removeRepeatedGreeting(s);
    if (withoutGreeting.length >= 8) {
      return withoutGreeting.trim();
    }
  }

  return s.trim();
}

module.exports = { normalizeSheikhaReply, removeRepeatedGreeting };


function normalizeActionFirstReply(reply = '', options = {}) {
  const text = String(reply || '').trim();
  const policy = options.actionFirstPolicy || {};
  const living = options.livingConversation || {};

  const genericPatterns = [
    /^بسم الله الرحمن الرحيم\s*/u,
    /^أنا شيخة[.\s\n]*/u,
    /ما الذي تحتاج إليه من مساعدة أو عون[؟?]*/u
  ];

  let cleaned = text;
  for (const pattern of genericPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  if (!cleaned && living.reply) cleaned = living.reply;
  if (policy.opening && cleaned && !cleaned.includes(policy.opening)) {
    cleaned = `${policy.opening}\n\n${cleaned}`;
  }

  return cleaned || living.reply || policy.opening || 'تم فهم الطلب. سأبدأ بالعمل مباشرة.';
}

module.exports.normalizeActionFirstReply = normalizeActionFirstReply;
