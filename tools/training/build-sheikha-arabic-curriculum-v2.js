'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v2');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const contexts = [
  'منصة تجارة', 'خدمة تعليمية', 'مصنع', 'سلسلة إمداد', 'مركز بيانات',
  'متجر إلكتروني', 'نظام نقل', 'مختبر هندسي', 'خدمة عملاء', 'منصة بحث',
  'برنامج مكتبي', 'تطبيق جوال', 'واجهة برمجية', 'نظام أرشفة', 'محرك بحث',
  'نظام تحليل', 'خدمة سحابية', 'بيئة تطوير', 'نظام محاسبي', 'لوحة تنفيذية'
];
const lessons = [
  ['التحقق الهندسي', 'ابدأ بمعيار قبول واضح. قس النتيجة بوحدة صحيحة، ثم نفذ اختبارًا قابلًا للتكرار واحفظ الدليل. راجع مصادر الخطأ وعدم اليقين قبل اعتماد النتيجة.'],
  ['التأخير المهني', 'نعتذر عن التأخير. اذكر السبب الموثق، وحدد موعدًا محدثًا بعد التحقق، ثم أرسل نتيجة قابلة للقياس بدل ادعاء الإنجاز.'],
  ['حوكمة بيانات التدريب', 'تحقق من المصدر والترخيص والموافقة والخصوصية قبل التدريب. افحص البيانات الشخصية والأسرار، وسجل المصدر والبصمة وحدود الاستخدام.'],
  ['حساب نسبة الإنجاز', 'عرّف البسط والمقام ومصدر القيم. احسب النسبة بقسمة المحقق على المستهدف ثم الضرب في 100، واعرض حجم العينة وحدود الدقة.'],
  ['إصلاح خلل برمجي', 'ثبت خطوات إعادة إنتاج الخطأ، وحدد أصغر مسار مسؤول، وطبق تعديلًا محدودًا. شغّل اختبار انحدار وlint وفحص الفرق قبل أي نشر.'],
  ['الجاهزية التجارية', 'تتطلب الجاهزية حقوقًا موثقة وأمنًا وخصوصية واختبارات جودة وتحمل ومراقبة وخطة تراجع وموافقة بشرية قانونية وتشغيلية.'],
  ['البحث العلمي', 'حدد سؤالًا قابلًا للاختبار، وافصل الحقيقة عن الفرضية. استخدم مصادر أولية ووحدات صحيحة، واحسب عدم اليقين واذكر حدود النتيجة.'],
  ['التعلم المتحسن', 'استخدم ذاكرة سريعة للأدلة الجديدة وتعلمًا بطيئًا للأنماط التي تعمم. طبق التكرار المتباعد والتغذية الراجعة واختبارًا مستقلًا قبل التثبيت.'],
  ['المعلومة عالية القيمة', 'رتب المعلومات بقوة الدليل والمنفعة والحداثة والندرة، واطرح التكلفة والمخاطر. القيمة هي أثر نافع قابل للقياس وليست كثرة النص.'],
  ['تقليل مساحة المعرفة', 'احتفظ بفهرس وبصمة ومصدر ومصطلحات، واسترجع الأصل عند الحاجة. أزل التكرار واضغط النسخ الباردة واختبر الاسترجاع والتعافي.'],
  ['الاستجابة الآمنة', 'إذا كان الأثر مرتفعًا فتوقف عند بوابة المراجعة البشرية. لا تنفذ أو تنشر أو تمنح صلاحيات قبل التحقق والتفويض وتسجيل الأثر.'],
  ['التشغيل واسع النطاق', 'ابدأ باختبار حمل وحدود خدمة ومراقبة زمن الاستجابة والأخطاء والتكلفة. استخدم طرحًا تدريجيًا وخطة تراجع قبل توسيع الخدمة.']
];
const prompts = [
  (topic, context) => `ما المنهج الصحيح في ${topic} داخل ${context}؟`,
  (topic, context) => `ضع خطوات عملية موجزة لـ${topic} في ${context}.`
];
const records = [];
for (const context of contexts) {
  for (const [topic, answer] of lessons) {
    for (const prompt of prompts) records.push({ prompt: prompt(topic, context), completion: `في ${context}: ${answer}` });
  }
}
const lines = `${records.map(JSON.stringify).join('\n')}\n`;
const duplicateCount = records.length - new Set(records.map((item) => `${item.prompt}\0${item.completion}`)).size;
const sensitive = [
  /\b(?:sk|hf)_[A-Za-z0-9_-]{16,}\b/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /(?:password|كلمة المرور)\s*[:=]/gi
].flatMap((pattern) => lines.match(pattern) || []);
if (duplicateCount || sensitive.length) throw new Error('CURRICULUM_V2_REVIEW_FAILED');
const digest = sha256(lines);
fs.writeFileSync(`${base}.jsonl`, lines);
fs.writeFileSync(`${base}.manifest.json`, `${JSON.stringify({
  system: 'SHEIKHA_DATASET_MANIFEST_V2', datasetId: 'sheikha-arabic-commercial-curriculum-v2',
  path: path.relative(root, `${base}.jsonl`), records: records.length, sha256: digest,
  language: ['ar'], purpose: 'LOCAL_GOVERNED_SFT_CURRICULUM',
  origin: 'DETERMINISTIC_LOCALLY_AUTHORED_TEMPLATES',
  splitPolicy: 'TRAIN_ONLY_EVALUATION_CASES_STORED_SEPARATELY',
  license: { id: 'SHEIKHA-OWNED-CURRICULUM-1.0', commercialTrainingApproved: true, externalRedistributionApproved: false },
  privacy: { personalDataAllowed: false, secretsAllowed: false, reviewStatus: 'PASSED', matches: 0 },
  quality: { exactDuplicates: duplicateCount, templateFamilies: lessons.length, contexts: contexts.length, productionModelSufficiencyClaim: false }
}, null, 2)}\n`);
fs.writeFileSync(`${base}.approval.json`, `${JSON.stringify({
  system: 'SHEIKHA_DATASET_TRAINING_APPROVAL_V1', status: 'APPROVED_FOR_LOCAL_TRAINING_ONLY',
  datasetId: 'sheikha-arabic-commercial-curriculum-v2', datasetSha256: digest,
  approvalSource: 'OWNER_EXPLICIT_CONTINUE_TO_PRODUCTION_REQUEST_2026-08-29', humanTrainingApproval: true,
  commercialProductionApproval: false, externalTrainingApproval: false, expiresOnDatasetChange: true
}, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ records: records.length, sha256: digest, duplicateCount, sensitiveMatches: sensitive.length }, null, 2)}\n`);
