'use strict';

const crypto = require('node:crypto');

function reportMarkdown(source, editorial = false) {
  if (!source) return '# مادة التقرير غير محددة\n\nاختر نتيجة أو افحص الحالة أولًا، ثم اطلب التقرير. لا توجد قياسات يمكن اعتبارها صفرًا عند غياب المصدر.';
  const content = String(source.content || '');
  const body = content.slice(0, 48000);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return ['# ' + (editorial ? 'وثيقة مراجعة' : 'تقرير') + ': ' + (source.title || 'آخر رد في المحادثة'), '',
    '## المصدر والنطاق',
    '- وقت إنشاء المصدر: ' + (source.createdAt || 'غير موثق؛ لم يُفترض أنه حديث') + '.',
    '- نوع المصدر: ' + (source.kind || 'CONVERSATION_NOT_INDEPENDENT_EVIDENCE') + '.',
    '- SHA-256 للنص المصدر: `' + hash + '`.',
    '- جرى إعداد التقرير الآن دون تحديث القياسات أو التحقق المستقل من صحة المحتوى.',
    '', '## المادة محل المراجعة', '',
    ...body.split('\n').map(line => '> ' + line),
    ...(body.length < content.length ? ['', 'اقتُطع عرض المادة عند 48000 حرف؛ البصمة تخص النص المصدر الكامل.'] : []),
    '', '## حدود النتيجة',
    '- هذا تقرير عن المصدر المحدد أعلاه، وليس عن Inspector ما لم يكن هو ذلك المصدر. نتائج اللوحة لا تستبدل آخر جواب في المحادثة دون اختيار صريح.',
    '- لم تُستنتج أصفار أو نسب إنجاز أو مدد أو جاهزية إنتاجية من حقول مفقودة.',
    '- تسجيل المصدر أو بصمته لا يمنح صحة علمية أو ترخيصًا أو ملكية أو تفويض تنفيذ.',
    ...(editorial ? ['', '## سجل التحرير',
      'تحديد المصدر والغرض، فصل النص المقتبس عن الاستنتاج، وإضافة بصمة قابلة لإعادة الحساب.',
      'الجمهور: المالك والمراجع. الغرض: مراجعة هذه المادة؛ الاستشهادات والكود والتراخيص تحتاج فحوصًا مستقلة، ولم تُدّعَ مراجعتها هنا.'] : [])
  ].join('\n');
}

function historySource(history) {
  if (!Array.isArray(history)) return null;
  return [...history].reverse().find(item => item?.role === 'assistant' && item.content && !item.derived &&
    !/^# (?:تقرير:|وثيقة مراجعة:|مادة التقرير غير محددة)/u.test(item.content)) || null;
}

module.exports = { reportMarkdown, historySource };
