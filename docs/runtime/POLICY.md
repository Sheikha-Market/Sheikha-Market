# Runtime Policy Layer

هذا المستند يحدد قواعد التشغيل الإلزامية لمنع الانحراف والفشل.

## قواعد إلزامية
- يمنع تشغيل Node مباشرة للإنتاج. التشغيل المعتمد عبر PM2 + ecosystem فقط.
- يمنع تغيير PORT خارج `.env.runtime`.
- يمنع تشغيل نسخة PM2 ثانية من نفس الخدمة.
- يمنع fallback تلقائي للمنافذ في baseline المستقر.
- يمنع require قاتل لوحدات optional؛ يجب أن تكون محمية بـ try/catch.
- يمنع commit مع conflict markers غير محلولة.
- يمنع push عند غياب قرار Best Path في ملفات التجارب.

## العقود التشغيلية
- `GET /api/health`: فحص صحة شامل.
- `GET /api/ready`: جاهزية الخدمة.
- `GET /api/live`: حيوية العملية.
- `GET /api/version`: معلومات الإصدار/الفرع.
- `GET /api/runtime`: توافق runtime والبصمة والحلقة الحالية.

## الحلقات المعتمدة (Stable Rings)
- `dev`: تجارب أولية.
- `canary`: تحقق محدود.
- `stable`: baseline معتمد.
- `production`: تشغيل نهائي.

## ملفات التحكم
- مرجع البيئة: `.env.runtime` (محلي) + `.env.runtime.example` (مرجعي).
- بصمة التشغيل: `.runtime-fingerprint`.
- أوامر التشغيل: `tools/runtime/*`.
