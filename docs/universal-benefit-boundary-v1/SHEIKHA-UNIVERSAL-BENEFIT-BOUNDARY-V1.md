# منظومة شيخة الشاملة للخير والنفع والحدود V1

النظام: `SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1`

اللغة الأولى: العربية، والمعرفات الإنجليزية رموز تقنية ثابتة للتوافق البرمجي فقط.

## الغرض

تفحص المنظومة القدرة المسجلة قبل توجيهها، وتحول الحد إلى طلب موافقة أو خطة دليل أو عزل أو محاكاة أو صيغة وصول أو تشغيل محلي أو تعاف أو إحالة بشرية مؤهلة. لا يعامل أي حد بوصفه طريقًا لتجاوز الأمن أو السلامة أو القانون أو الخصوصية أو الحقوق أو الملكية.

## القرارات

- `ALLOW`: مسموح بالمرور إلى بوابة التفويض المنفصلة، ولا يعني إذن التنفيذ.
- `REVIEW`: مراجعة بشرية أو تخصصية أو دليل أو إذن مطلوب.
- `SANDBOX`: عزل أو محاكاة أو قراءة فقط أو تشغيل محلي محدود.
- `DENY`: منع التنفيذ مع بيان السبب والبديل الآمن.

كل استجابة تتضمن حقل `arabic` وفيه: القرار والسبب وحالة الدليل والحدود والموافقات والبديل الآمن باللغة العربية.

## المرجعية المكتوبة

العقد العربي المرجعي موثق في:

`docs/universal-benefit-boundary-v1/SHEIKHA-ISLAMIC-VALUE-REFERENCE-CONTRACT-V1.md`

وعقد لغة شيخة موجود في:

`sheikha-language/governance/sheikha-universal-benefit-boundary-v1.shk`

يتضمن العقد ثمانية عشر مقتطفًا قرآنيًا مكتوبًا وحديثين ببيانات المصدر، تشمل منهج التثبت والحجة في الخلق والتوحيد والعبودية. هذه النصوص مرجعية للعرض والبحث غير التنفيذي؛ لا فتوى آلية ولا استنباط فقهي أو برهان عقدي آلي.

## كلمات لغة شيخة

`قدرة`، `حد داخلي`، `حد خارجي`، `ربط عابر`، `إذن`، `دليل`، `منفعة`، `ضرر`، `تخفيف`، `موافقة`، `بديل آمن`، `قرار`، `تدقيق`.

## تصنيف المقدرة

يسجل النظام ثلاثة نطاقات تشغيلية: `INTERNAL` و`EXTERNAL` و`CROSS_BOUNDARY`، وعشر فئات للمقدرة تشمل الحوسبة والشبكة والمعرفة والمواد والميزانية والطاقة الفيزيائية والحيز والوقت والمعدات. `HUMAN_PARTICIPATION` ليست تحويلًا للإنسان إلى مورد؛ إنها مشاركة طوعية تحتاج الرضا وحق الانسحاب وحفظ الكرامة.

يحسب المصنف المقدار المطلوب والمتاح ونسبة الاستخدام من دليل موثق. إذا غاب القياس كانت النتيجة `REVIEW`، وإذا تجاوز المطلوب المتاح كانت `SANDBOX`، وإذا ثبت الضرر كانت `DENY`. حتى النتيجة `ALLOW` تعني أن الخطة جاهزة لبوابة تفويض أخرى فقط.

## الواجهات

- `GET /api/governance/universal-benefit/status`
- `POST /api/governance/universal-benefit/evaluate`
- `POST /api/governance/universal-benefit/transform-boundary`
- `POST /api/governance/universal-benefit/classify-capacity`
- `POST /api/governance/universal-benefit/plan-integration`
- `POST /api/governance/universal-benefit/research-evidence`
- `GET /api/governance/universal-benefit/capabilities`
- `GET /api/governance/universal-benefit/evidence`

مثال:

```json
{
  "capabilityId": "SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE",
  "purpose": "تقديم معرفة عامة قابلة للتحقق",
  "beneficiaries": ["PUBLIC"],
  "evidence": [
    {
      "evidenceId": "test-123",
      "source": "verified-test",
      "verified": true
    }
  ],
  "reasoningMode": "standard"
}
```

مثال تصنيف مقدرة داخلية:

```json
{
  "capabilityId": "SHEIKHA_RESOURCE_OPTIMIZATION",
  "purpose": "تخصيص قدرة حوسبية مأذونة لخدمة عامة",
  "boundaryScope": "INTERNAL",
  "resource": {
    "resourceId": "compute-pool-1",
    "class": "COMPUTE",
    "requestedAmount": 20,
    "availableAmount": 100,
    "unit": "vCPU-hours",
    "owner": "RESOURCE_OWNER"
  },
  "ownerPermissionGranted": true,
  "ownerPermissionReference": "permission-123",
  "nonHarmConfirmed": true,
  "evidence": [{ "evidenceId": "capacity-123", "verified": true }]
}
```

## حدود التشغيل

- أوضاع Standard وPro وUltra للتحليل المحكوم ولا تصعد الصلاحيات.
- لا يملك L24 سلطة Ring 0 أو النواة أو البرمجيات الثابتة أو الفعل المادي.
- القرارات عالية الأثر تحتاج مراجعة الإنسان المسؤول.
- الأمن الدفاعي يعمل في نطاق مأذون وداخل العزل.
- لا تنفذ واجهة التقييم كتابة خارجية ولا تمنح إذنًا.
- لا تنفذ واجهتا تصنيف المقدرة وتخطيط التكامل اتصالًا أو نقلًا أو استهلاكًا للمورد.
- البرنامج لا يحدد حدود الله ولا يعلن الحلال أو الحرام؛ المسائل الشرعية لأهل العلم المؤهلين.
- المشاركة البشرية طوعية ومصونة الكرامة، وليست موردًا قابلًا للاستغلال.
- تعني «الطاقة التشغيلية» مقدرة مقاسة؛ ولا يثبت ادعاء طاقة فيزيائية إلا بقياس هندسي.
- عند نقص الدليل تبقى النتيجة `UNKNOWN` ويبدأ بحث محلي منضبط، ثم يسجل ما يحتاج موصلًا خارجيًا أو عالمًا أو خبيرًا.
- المصدر المرشح ونتيجة الويب لا يصبحان `VERIFIED` تلقائيًا.
- يفصل مسار البحث بين نص القرآن، وإسناد الحديث ودرجته، والتفسير، والحجة العقلية، والقياس التجريبي.
- عرض أدلة الخلق والتوحيد والعبودية لا يعني ادعاء أن البرنامج أثبت الغيب آليًا أو أصدر حكمًا عقديًا ملزمًا.
- تعيد كل عملية `executionAllowed: false` و`decisionGrantsAuthorization: false`.
- سجل التدقيق التشغيلي محدود وفي الذاكرة ولا يحفظ حمولة الطلب الحساسة.
- مؤشر النفع إشارة تشغيلية قابلة للمراجعة وليس حكمًا أخلاقيًا مطلقًا.

## أوامر التشغيل

```bash
npm run -s ops:universal-benefit:activate:v1
npm run -s ops:universal-benefit:verify:v1
npm run -s ops:universal-benefit:status:v1
npm run -s ops:universal-benefit:test:v1
```
