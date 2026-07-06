# SHEIKHA Optional Engine Contract Fabric V14

## التعريف

`SHEIKHA_OPTIONAL_ENGINE_CONTRACT_FABRIC_V14` طبقة حاكمة فوق `Engine Registry V1` تمنع انهيار المنظومة عند غياب محركات اختيارية أو عدم تهيئة بياناتها.

هذه الطبقة لا تستبدل المحركات الحقيقية، بل توفر عقد بيانات ثابتًا وآمنًا إلى أن يتم تسجيل التنفيذ الحقيقي لكل محرك.

## المحركات المشمولة

المحركات المطلوبة:

```text
AS TNH LG MB LR OD AE GPE LME MSE RCE WPE MIE MME LE QSE WFE QJE SLE WBE TLE AAE
```

والمحركات المستنتجة من أخطاء التشغيل:

```text
LSC ACE TAE
```

الإجمالي:

```text
25 optional governed engines
```

## المشكلة التي تحلها

بدل أخطاء مثل:

```text
Cannot read properties of undefined (reading 'quranVerses')
Cannot read properties of undefined (reading 'total')
Cannot read properties of undefined (reading 'ports')
Cannot read properties of undefined (reading 'chartOfAccounts')
Cannot read properties of undefined (reading 'trustPillars')
```

تعود العقود الافتراضية دائمًا بشكل ثابت:

```json
{
  "total": 0,
  "quranVerses": { "total": 0, "loaded": false, "items": [] },
  "ports": [],
  "chartOfAccounts": [],
  "trustPillars": [],
  "ready": false
}
```

## حدود الحوكمة

- لا تعديل خارجي.
- لا إعادة تشغيل خدمات.
- لا تثبيت حزم.
- لا صلاحيات إضافية.
- لا ادعاء توفر محرك حقيقي إذا كان غير مطبق.
- المحرك الاختياري يرجع `available: false` حتى يتم تسجيل التنفيذ الحقيقي.
- الأصل الحاكم: لا ضرر ولا ضرار.

## التكامل

تعمل الطبقة مع:

- Engine Registry V1.
- Safe Optional Engine.
- server.js عند بدء التشغيل.
- Enterprise Architecture Routes.
- Runtime report generator.

## endpoints

```text
GET /api/enterprise-architecture/optional-engine-contract-fabric/status
GET /api/enterprise-architecture/optional-engine-contract-fabric/full
```

## أمر التفعيل

```bash
npm run ops:optional-engine-contract-fabric:v14
```

ينتج:

```text
runtime/optional-engine-contract-fabric/sheikha-optional-engine-contract-fabric-v14-report.json
```

## الخطوة التالية

بعد هذه الطبقة، يتم استبدال أي قراءة مباشرة للمحركات الاختيارية بعقود ثابتة أو تنفيذ حقيقي مسجل في الـ Registry، ثم تفكيك الاعتماد الدائري داخل Enterprise Inspector عبر واجهة مشتركة أو Dependency Injection.
