# منظومة شيخة | Sheikha System

منظومة رقمية متكاملة لإدارة السوق والتشغيل والحوكمة التقنية وفق:
- كتاب الله
- سنة النبي ﷺ
- العدل والشفافية والأمانة

## الرؤية
بناء منظومة تشغيلية وتجارية ذكية وآمنة تحقق الأثر والاستدامة مع امتثال شرعي كامل.

## خط الأساس التشغيلي
- الفرع المرجعي: stable/runtime-baseline
- التشغيل عبر PM2 باستخدام ecosystem.config.js
- ملف البيئة الموحد: .env.runtime (محلي) و .env.runtime.example (مرجعي)
- صحة الخدمة: /api/health
- عقود الصحة: /api/live و /api/ready و /api/version و /api/runtime
- بصمة التشغيل: .runtime-fingerprint

## منظومة منع الفشل
- Git reliability gates عبر .githooks/pre-commit
- منع إدخال مسارات الانحراف المحلي (data/, repos/, scripts/)
- منع إدخال علامات التعارض غير المحلولة
- فحص تنسيق diff وفحص syntax لملف server.js

لتفعيل hooks المتتبعة:

bash tools/setup-hooks.sh

## منظومة التجارب والتعلم المستمر
- الدليل: docs/experiments/PLAYBOOK.md
- سجل التجارب: docs/experiments/registry.md
- قالب التجربة: docs/experiments/templates/experiment-record.md

كل تجربة يجب أن توثق:
- قبل التنفيذ: الفرضية، الثوابت، المتغيرات، معايير النجاح، خطة التراجع.
- أثناء التنفيذ: كل المتغيرات البيئية والنتائج المرحلية.
- بعد التنفيذ: النتائج، السبب الجذري لأي فشل، الإجراء الوقائي، القرار النهائي.

## تفعيل PHP العصبي ولغة شيخة
- التفعيل الموحد: `npm run ops:neural:php:activate`
- التفعيل القسري: `npm run ops:neural:php:activate:force`
- التشغيل المتوافق للـ runtime: `php sheikha-lang/runtime.php run sheikha-lang/examples/full-activation.shk`
- الترجمة المتوافقة: `php sheikha-lang/runtime.php compile sheikha-lang/examples/full-activation.shk build/sheikha.generated.php`
- مخرجات التفعيل والتشخيص تُحفظ في: `build/sheikha-php-neural/`
