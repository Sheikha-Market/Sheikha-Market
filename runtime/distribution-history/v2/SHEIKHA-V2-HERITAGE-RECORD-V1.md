# سجل إرث Sheikha V2

## الحالة

- التصنيف: `HISTORICAL_RUNTIME_INCOMPLETE_PRESERVED`
- الإصدار: `1.0.51`
- SHA-256: `3ca1dfdcf690c01efdbeb382c936f2a1f9a347123d92e663176011b5972ebc42`
- الأصل التاريخي محفوظ ولا يُستبدل.

## الحقيقة الفنية

حزمة V2 تمثل أصل التغليف التاريخي، لكنها لا تحتوي شجرة
Production dependencies المكتملة، ولذلك لا تُصنف Runtime baseline
ولا Native Verified.

## سلسلة الوراثة الهندسية

```text
V2 — أصل التغليف التاريخي
  ↓ استخلاص الدروس
V6.1 — أول Baseline DEB مكتملة التبعيات
  ↓ تصحيح المدخل العام
V6.2 — Canonical CLI Entry Point
```

## الدروس

1. وجود Artifact لا يكفي دون دورة تشغيل أصلية.
2. يجب إدخال التبعيات التشغيلية داخل الحزمة.
3. يجب فصل الأصل التاريخي عن النسخة المصلحة.
4. الترقية والرجوع يجب أن يكونا بين نسختين مكتملتين.
5. الإصلاح المشتق المقترح هو `V2R1` ولا يحل محل V2.

## سياسة الإصلاح

```text
Original V2: immutable
Repair derivative: 1.0.51+sheikha.v2.r1
Native verification required
No overwrite
No false claim
```
