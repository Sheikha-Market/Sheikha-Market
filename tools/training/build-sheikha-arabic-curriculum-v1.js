'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const dataPath = path.join(root, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v1.jsonl');
const manifestPath = path.join(root, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v1.manifest.json');
const approvalPath = path.join(root, 'data/sheikha-ai-training/sheikha-arabic-commercial-curriculum-v1.approval.json');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const contexts = [
  'منصة تجارة', 'نظام صحي غير تشخيصي', 'خدمة تعليمية', 'مصنع', 'سلسلة إمداد',
  'تطبيق مالي تجريبي', 'بوابة حكومية تجريبية', 'مركز بيانات', 'متجر إلكتروني',
  'نظام نقل', 'مختبر هندسي', 'خدمة عملاء', 'نظام مراقبة', 'منصة بحث',
  'برنامج مكتبي', 'تطبيق جوال', 'واجهة API', 'نظام أرشفة', 'محرك بحث',
  'نظام تحليل', 'خدمة سحابية', 'بيئة تطوير', 'نظام محاسبي', 'لوحة تنفيذية'
];

const lessons = [
  {
    prompt: (context) => `كيف أتحقق من نتيجة هندسية في ${context}؟`,
    completion: (context) => `في ${context}: عرّف معيار القبول أولًا، ثم نفّذ قياسًا بوحدة صحيحة، وشغّل اختبارًا قابلًا للتكرار، واحفظ الدليل والظروف والنتيجة. لا تعتمد النتيجة حتى تطابق حد القبول وتراجع مصادر الخطأ وعدم اليقين.`
  },
  {
    prompt: (context) => `اكتب ردًا مهنيًا عن تأخير مهمة تخص ${context}.`,
    completion: (context) => `نعتذر عن التأخير في مهمة ${context}. السبب الموثق قيد المعالجة، والموعد المحدّث سيُحدد بعد التحقق من الإصلاح. سنرسل حالة قابلة للقياس عند اكتمال الاختبار، ولن ندّعي الإنجاز قبل وجود الدليل.`
  },
  {
    prompt: (context) => `ما ضابط استخدام بيانات ${context} في تدريب نموذج؟`,
    completion: (context) => `قبل التدريب على بيانات ${context} تحقّق من المصدر والترخيص والموافقة وحدود الغرض، وافحص الخصوصية والبيانات الشخصية والأسرار، وسجّل provenance وبصمة ثابتة وفترة الاحتفاظ والحذف. عند غياب حق واضح يكون القرار المنع حتى المراجعة البشرية.`
  },
  {
    prompt: (context) => `كيف أحسب مؤشر نجاح موثوقًا في ${context}؟`,
    completion: (context) => `عرّف البسط والمقام والوحدة والفترة في ${context}. احسب النسبة = القيمة المحققة ÷ القيمة المستهدفة × 100، ثم اعرض حجم العينة ومصدر الأرقام وحدود الدقة. أعد الحساب باختبار مستقل ولا تخلط الارتباط بالسببية.`
  },
  {
    prompt: (context) => `صمم منهج تعلم متحسنًا لـ${context}.`,
    completion: (context) => `استخدم في ${context} مسارين متكاملين: ذاكرة سريعة تحفظ الخبرة الجديدة مع مصدرها، وتعلّم بطيء يثبت الأنماط المتكررة فقط بعد التقييم. طبّق الاسترجاع المتباعد، والتدرج، والتغذية الراجعة، واختبار التعميم، والنسيان الانتقائي للمحتوى الضعيف. هذا تشبيه هندسي مستلهم من أبحاث الذاكرة وليس محاكاة بيولوجية للإنسان.`
  },
  {
    prompt: (context) => `كيف أصلح خللًا برمجيًا في ${context}؟`,
    completion: (context) => `ثبّت خطوات إعادة إنتاج خلل ${context} ورسالة الخطأ، وحدد أصغر مسار مسؤول، ثم طبّق تعديلًا محدودًا. شغّل اختبار انحدار واختبارات الحدود وlint وفحص الأسرار والفرق. وثّق ما تغير وما لم يتغير وخطة التراجع قبل أي نشر.`
  },
  {
    prompt: (context) => `كيف أبني إجابة علمية موثقة عن ${context}؟`,
    completion: (context) => `ابدأ بسؤال قابل للاختبار عن ${context}، وافصل الحقيقة المرصودة عن الفرضية والاستنتاج. استخدم مصادر أولية، وحدد المتغيرات والوحدات، وقارن بدائل التفسير، واحسب عدم اليقين والحساسية. اذكر حدود النتيجة واطلب مراجعة متخصصة عند ارتفاع الأثر.`
  },
  {
    prompt: (context) => `كيف أقلل مساحة المعرفة في ${context} دون فقد القيمة؟`,
    completion: (context) => `احفظ في فهرس ${context} البصمة والمصدر والمصطلحات ودرجة القيمة بدل نسخ المحتوى كله، واسترجع الأصل عند الطلب بعد التحقق من الصلاحية. أزل التكرار، واضغط النسخ الباردة، واحتفظ بالأدلة الأعلى منفعة. لا يمكن جعل التخزين صفرًا، ويجب اختبار الاسترجاع والتعافي.`
  },
  {
    prompt: (context) => `ما بوابة الجاهزية التجارية لـ${context}؟`,
    completion: (context) => `جاهزية ${context} تتطلب حقوقًا موثقة، وأمنًا وخصوصية، واختبارات جودة وتحمل، وقياس زمن وتكلفة، وCanary وخطة تراجع ودعمًا ومراقبة. نجاح التدريب وحده لا يكفي، ولا تتم الترقية التجارية قبل موافقة بشرية قانونية وتشغيلية.`
  },
  {
    prompt: (context) => `كيف أختار معلومة عالية القيمة لـ${context}؟`,
    completion: (context) => `رتّب معلومات ${context} بحسب قوة الدليل والمنفعة والحداثة والندرة، ثم اطرح التكلفة والمخاطر. لا تساوِ بين كثرة النص والقيمة؛ المعلومة الأعلى قيمة قابلة للتحقق وتغيّر قرارًا أو نتيجة مع أثر نافع مقاس وحدود معلنة.`
  }
];

const records = [];
for (const context of contexts) {
  for (const lesson of lessons) {
    records.push({ prompt: lesson.prompt(context), completion: lesson.completion(context) });
  }
}
const lines = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
const duplicateCount = records.length - new Set(records.map((record) => `${record.prompt}\0${record.completion}`)).size;
const forbiddenPatterns = [
  /\b(?:sk|hf)_[A-Za-z0-9_-]{16,}\b/g,
  /\b\d{10}\b/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /(?:password|كلمة المرور)\s*[:=]/gi
];
const piiOrSecretMatches = forbiddenPatterns.flatMap((pattern) => lines.match(pattern) || []);
if (duplicateCount || piiOrSecretMatches.length) {
  throw new Error(`CURRICULUM_REVIEW_FAILED duplicates=${duplicateCount} sensitive=${piiOrSecretMatches.length}`);
}
fs.writeFileSync(dataPath, lines);
const datasetSha256 = sha256(lines);
const manifest = {
  system: 'SHEIKHA_DATASET_MANIFEST_V1',
  datasetId: 'sheikha-arabic-commercial-curriculum-v1',
  path: path.relative(root, dataPath),
  records: records.length,
  sha256: datasetSha256,
  language: ['ar'],
  purpose: 'LOCAL_GOVERNED_SFT_CURRICULUM',
  origin: 'DETERMINISTIC_LOCALLY_AUTHORED_TEMPLATES',
  methodology: ['FAST_AND_SLOW_MEMORY', 'SPACED_RETRIEVAL', 'FEEDBACK', 'GENERALIZATION_TESTING'],
  license: {
    id: 'SHEIKHA-OWNED-CURRICULUM-1.0',
    commercialTrainingApproved: true,
    externalRedistributionApproved: false,
    legallyIssuedThirdPartyLicense: false
  },
  privacy: {
    personalDataAllowed: false,
    secretsAllowed: false,
    reviewStatus: 'PASSED',
    matches: 0
  },
  quality: {
    exactDuplicates: duplicateCount,
    humanTemplateFamilies: lessons.length,
    contexts: contexts.length,
    productionModelSufficiencyClaim: false
  }
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const approval = {
  system: 'SHEIKHA_DATASET_TRAINING_APPROVAL_V1',
  status: 'APPROVED_FOR_LOCAL_TRAINING_ONLY',
  datasetId: manifest.datasetId,
  datasetSha256,
  approvalSource: 'OWNER_EXPLICIT_REQUEST_2026-08-29',
  humanTrainingApproval: true,
  commercialProductionApproval: false,
  externalTrainingApproval: false,
  expiresOnDatasetChange: true
};
fs.writeFileSync(approvalPath, `${JSON.stringify(approval, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ records: records.length, datasetSha256, duplicateCount, piiOrSecretMatches: 0 }, null, 2)}\n`);
