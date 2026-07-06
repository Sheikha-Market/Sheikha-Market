# SHEIKHA Template Engine Unification V11

## التعريف

`SHEIKHA_TEMPLATE_ENGINE_UNIFICATION_V11` يوحد محركي القوالب الموجودين في شيخة:

- `SHEIKHA_UNIVERSAL_TEMPLATE_ENGINE_V8` كطبقة توافق وتوسعة قديمة.
- `SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8` كمصدر حاكم للقوالب والحزم وOpenAPI وSDK descriptors.
- `SHEIKHA_UNIVERSAL_GOVERNED_FEDERATION_PLATFORM_V10` كمنصة تشغيل جامعة للسجل والرسم والأحداث والحوكمة.

## سبب التوحيد

بدلاً من إضافة محرك جديد لكل عائلة أو تقنية، تعتمد الطبقة على مسار واحد:

```text
Compatibility Template
-> Canonical Federation Template
-> Federation Package
-> OpenAPI Descriptor
-> SDK Descriptors
-> V10 Governed Registry / Graph / Event / Inspector
```

## mapping

```text
Linux      -> OperatingSystem
PostgreSQL -> Database
Language   -> Language
AI         -> AI
```

## حوكمة التشغيل

- مصدر الحقيقة الحاكم هو `SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8`.
- طبقة التوافق محفوظة حتى لا تنكسر الاختبارات أو الاستدعاءات القديمة.
- توليد SDK يبقى descriptor-only.
- لا يوجد تثبيت حزم.
- لا يوجد تعديل Kernel أو Boot أو Firmware.
- لا يوجد external mutation.
- أي تغيير خارجي يبقى خارج نطاق هذه الطبقة ويتطلب موافقة بشرية صريحة.

## endpoints

```text
GET /api/enterprise-architecture/template-engine-unification/status
GET /api/enterprise-architecture/template-engine-unification/full
```

## أمر التفعيل

```bash
npm run ops:template-engine-unification:v11
```

ينتج:

```text
runtime/template-engine-unification/sheikha-template-engine-unification-v11-report.json
```

## النتيجة

هذه الطبقة تمنع تضخم القوالب وتضع مساراً واحداً للتوسع:

```text
DNA -> Blueprint -> Template -> Package -> API -> SDK -> Registry -> Graph -> Governance
```
