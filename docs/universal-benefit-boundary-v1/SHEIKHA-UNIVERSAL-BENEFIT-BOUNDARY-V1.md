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

يتضمن العقد مقتطفات مكتوبة للعدل والأمانة والتعاون والتثبت والشورى ومنع الفساد، وحديث «لا ضرر ولا ضرار». هذه النصوص مرجعية قيمية غير تنفيذية؛ لا فتوى آلية ولا استنباط فقهي آلي.

## كلمات لغة شيخة

`قدرة`، `حد`، `إذن`، `دليل`، `منفعة`، `ضرر`، `تخفيف`، `موافقة`، `بديل آمن`، `قرار`، `تدقيق`.

## الواجهات

- `GET /api/governance/universal-benefit/status`
- `POST /api/governance/universal-benefit/evaluate`
- `POST /api/governance/universal-benefit/transform-boundary`
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

## حدود التشغيل

- أوضاع Standard وPro وUltra للتحليل المحكوم ولا تصعد الصلاحيات.
- لا يملك L24 سلطة Ring 0 أو النواة أو البرمجيات الثابتة أو الفعل المادي.
- القرارات عالية الأثر تحتاج مراجعة الإنسان المسؤول.
- الأمن الدفاعي يعمل في نطاق مأذون وداخل العزل.
- لا تنفذ واجهة التقييم كتابة خارجية ولا تمنح إذنًا.
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
