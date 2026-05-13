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

## خط الأساس المعتمد الآن (Baseline Scope - Strict)
- الفرع المعتمد: `stable/runtime-baseline` فقط.
- الملفات/المسارات المعتمدة الآن:
	- `.env.runtime`
	- `.runtime-fingerprint`
	- `.githooks/`
	- `docs/experiments/`
	- `docs/exploration/`
	- `docs/runtime/POLICY.md`
	- `docs/FOUNDATIONS.md`
	- `docs/VISION.md`
	- `docs/ARCHITECTURE.md`
	- `docs/NEURAL-NETWORK.md`
	- `docs/IMPLEMENTATION-ROADMAP.md`
- أي تغيير خارج هذا النطاق لا يعتمد كجزء من baseline الحالي.

## شبكة الخلايا الجذرية المنضبطة (Root Disciplined Cells)
- تفعيلها يكون كشبكة معرفة وتشغيل فقط، وليس كادعاء وعي.
- `Root Reference Cell`: المرجع الحاكم = الكتاب والسنة.
- `Governance Cell`: قاعدة القرار = لا ضرر ولا ضرار.
- `Runtime Cell`: التشغيل الإلزامي = PM2 + Node 22 + PORT 8080.
- `Experiment Cell`: دورة التجربة = قبل/أثناء/بعد.
- `Observation Cell`: الرصد الإلزامي = metrics + health + runtime.
- `Decision Cell`: آلية الحسم = score + best path.
- `Improvement Cell`: التحسين المستمر = learning registry.

## سياسة الفروع للتطوير الآمن
- يمنع الدمج من فروع أخرى مباشرة في هذه المرحلة.
- جميع التعديلات تبدأ من `stable/runtime-baseline`.
- أي تطوير جديد يتم عبر:
	- `git checkout -b feature/targeted-improvement`
- لا يتم الدمج إلا بعد:
	- نجاح التجربة.
	- اكتمال التوثيق في `docs/experiments/` و `docs/exploration/`.
	- تحديد `Best Path` بشكل صريح.

## ملفات التحكم
- مرجع البيئة: `.env.runtime` (محلي) + `.env.runtime.example` (مرجعي).
- بصمة التشغيل: `.runtime-fingerprint`.
- أوامر التشغيل: `tools/runtime/*`.
- لوحة الرصد: [OBSERVABILITY-DASHBOARD.md](OBSERVABILITY-DASHBOARD.md).
