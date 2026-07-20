# Sheikha Unified Product Runtime V1

## النطاق

توحّد هذه المرحلة أربع واجهات قائمة داخل حالة تشغيل واحدة:

1. جنات وأشجار شيخة: استعارة دنيوية للمعرفة والتجربة النافعة.
2. Sheikha System Builder: تخطيط الأنظمة وعقود القدرات المحكومة.
3. Sheikha UEFI: سجل UEFI 2.11 وتغطية الأجزاء المتحققة.
4. Sheikha Bare Metal: أساس x86_64 Phase 2B المتحقق في QEMU.

لا تغير هذه الطبقة حالة الاكتمال الأصلية لأي منتج. وهي لا تجعل اختبار QEMU
اختبارًا فيزيائيًا، ولا تجعل التسجيل تنفيذًا كاملًا، ولا تجعل مسارًا عامًا
شهادة اعتماد.

## مسار القرار

```text
طلب الحالة
  -> قراءة ملفات الإثبات المحلية
  -> توحيد سجلات الأدلة المسماة
  -> كشف النقص والتناقض
  -> بوابة منع الضرر والمراجعة البشرية
  -> قرار محكوم ALLOW_BOUNDED أو DENY
  -> واجهة المنتج وسجل التدقيق
```

يصدر محرك المنطق إحدى الحالات:

- `VERIFIED`
- `INSUFFICIENT_EVIDENCE`
- `CONTRADICTED`
- `HUMAN_REVIEW_REQUIRED`
- `BLOCKED`

## المسارات

| العائلة | المسار القانوني | أسماء الوصول المختصرة |
| --- | --- | --- |
| الجنات | `/riyadh-aljannah-community/` | `/gardens` |
| البناء | `/system-builder-workbench/` | `/builder`, `/system-builder` |
| Bare Metal | `/boot-trial/` | `/bare-metal` |
| UEFI | `/boot-trial/` | `/uefi` |
| الدليل | `/site-map/` | `/map` |

كل اسم مختصر يعيد توجيه `308` إلى المسار القانوني، وهو مسجل في كتالوج
الموقع وليس تحويلًا منفصلًا غير معروف للسجل.

## الحوكمة

مرجعية الكتاب والسنة ممثلة بسجل قيم معلن للصدق والأمانة والعدل والوفاء
بالعقود والتثبت ومنع الضرر والإتقان. المراجع الرقمية في العقد هي مفاتيح
مرجعية وليست استنباطًا آليًا للأحكام.

- لا فتوى آلية.
- لا ادعاء سلطة شرعية أو عصمة أو وحي.
- الأحكام الشرعية والاجتهادية تحتاج مراجعة بشرية مؤهلة.
- القرارات عالية الأثر تحتاج موافقة بشرية.
- التفويض الافتراضي `DENY`.

## الأدلة

- التقرير: `runtime/product-runtime/v1/sheikha-unified-product-runtime-v1-report.json`
- العقد: `runtime/product-runtime/v1/contracts/sheikha-unified-product-runtime-v1-contract.json`
- فحص الموقع: `runtime/site-operations/v1/sheikha-local-site-smoke-v1-report.json`
- لقطات الواجهة: `runtime/site-operations/v1/evidence/sheikha-unified-product-ui-visual-evidence-v1.json`

## حدود الاكتمال

- Physical boot verified: `false`
- General-purpose OS complete: `false`
- Secure Boot verified: `false`
- Runnable everywhere today: `false`
- External certification claimed: `false`
- Automated religious ruling: `false`
