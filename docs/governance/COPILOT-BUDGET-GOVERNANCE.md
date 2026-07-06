# Copilot Budget Governance - Sheikha Top Enterprise (v2)

## ملخص تنفيذي
الوثيقة تضبط تكلفة GitHub Copilot على مستوى المؤسسة بطريقة تمنع التجاوز المالي وتضمن استمرارية العمل.

الأولوية التشغيلية:
1. منع أي Overage غير مخطط.
2. حماية الإنتاجية الأساسية للمستخدمين.
3. توثيق كل تغيير في السياسات أو الميزانية.

## النطاق
1. Enterprise: `sheikha-top`
2. Organization: `Sheikha-top`
3. نطاق التكلفة: Copilot Seats + AI Credits + Metered Usage

## خط الأساس المعتمد (Baseline)
1. Enterprise budget: مفعلة.
2. `Stop usage when budget limit is reached`: مفعلة دائمًا.
3. Budget alerts: مفعلة.
4. النموذج الافتراضي: `Auto model selection`.

## مراحل التشغيل

### المرحلة 1: وضع الاختبار الصارم (7 أيام)
1. `Enterprise monthly budget`: `5 USD`
2. `User-level budget`: `2 USD` لكل مستخدم
3. Alerts: `50%`, `75%`, `90%`, `100%`
4. `Stop usage`: `On`
5. هدف المرحلة: قياس السلوك الحقيقي للاستهلاك بدون تجاوز.

### المرحلة 2: وضع التدرج الآمن
1. `Enterprise monthly budget`: `20 USD`
2. `User-level budget`: `5 USD`
3. Alerts: `50%`, `75%`, `90%`, `100%`
4. `Stop usage`: `On` (إجباري)
5. هدف المرحلة: رفع القدرة التشغيلية مع حوكمة صارمة.

## قواعد الانتقال بين المراحل

### الانتقال من المرحلة 1 إلى المرحلة 2
1. لا يوجد Overage غير مصرح به.
2. لا يوجد توقف حرج على المستخدمين الأساسيين.
3. مراجعة موثقة وموقعة من Owner أو Billing Admin.

### الرجوع من المرحلة 2 إلى المرحلة 1
1. تكرار استهلاك أعلى من 90% قبل منتصف الدورة الشهرية.
2. زيادة مفاجئة في الاستخدام من مستخدمين أو مستودعات خارج النمط المعتاد.
3. وجود نشاط غير موثق أو تغيير سياسة بدون اعتماد.

## حوكمة الصلاحيات (RACI مختصر)
1. Owner: اعتماد الزيادة/التخفيض النهائي.
2. Billing Admin: تنفيذ التغيير داخل GitHub Billing.
3. Security/Compliance: مراجعة أثر التغيير على السياسات.
4. Engineering Lead: تأكيد أثر التغيير على فرق التطوير.

قاعدة إلزامية:
1. لا تعديل للميزانية أو `Stop usage` إلا من Owner أو Billing Admin.
2. لا تعطيل `Stop usage` إلا بتفويض زمني محدد ومكتوب.
3. كل استثناء يسجل بسبب ومدة وتاريخ انتهاء.

## مؤشرات المراقبة (KPI)
1. Copilot usage total (Enterprise).
2. AI credits included مقابل consumed.
3. Additional usage (overage).
4. Top users / top repositories استهلاكًا.
5. معدل التسارع الأسبوعي للاستهلاك (Consumption Velocity).

## حدود التنبيه والإجراء
1. عند 50%: مراجعة استهلاك الفرق وإرسال تنبيه داخلي.
2. عند 75%: مراجعة أعلى 10 مستخدمين/مستودعات وإجراءات ترشيد.
3. عند 90%: تجميد أي توسع غير ضروري وتحضير خطة تقليل فوري.
4. عند 100%: يتوقف الاستخدام تلقائيًا وفق السياسة المعتمدة.

## Runbook الاستجابة السريعة

### سيناريو A: الوصول إلى 90% مبكرًا
1. التأكد من سلامة البيانات من صفحة Billing.
2. تحديد السبب: مستخدم، مستودع، أو نمط استخدام جديد.
3. تطبيق تقييد مؤقت على User-level budgets عند الحاجة.
4. إرسال ملخص تنفيذي للمالك خلال نفس اليوم.

### سيناريو B: ظهور Overage غير متوقع
1. تفعيل وضع ضبط صارم فوري.
2. تثبيت/خفض الحدود حتى انتهاء التحقيق.
3. توثيق السبب الجذري والإجراء التصحيحي خلال 24 ساعة.

### سيناريو C: توقف الخدمة بسبب بلوغ 100%
1. التأكيد أن `Stop usage` هو سبب التوقف.
2. رفع قرار للمالك: زيادة مؤقتة أو انتظار دورة جديدة.
3. تطبيق القرار وتسجيله في سجل الحوكمة.

## روابط التشغيل
1. Budgets and alerts: `https://github.com/enterprises/sheikha-top/billing/budgets`
2. Metered usage: `https://github.com/enterprises/sheikha-top/billing/usage?group=2&period=3&query=product%3Acopilot`
3. AI usage: `https://github.com/enterprises/sheikha-top/billing/ai_usage`
4. Copilot policy (Enterprise): `https://github.com/enterprises/sheikha-top/settings/copilot`

## سياسة Vision في IDE
1. يتطلب تفعيل `Editor preview features` على النطاق الفعال.
2. إذا استمرت رسالة `Vision is disabled by organization` بعد التفعيل، يتم التصعيد إلى GitHub Support مع لقطات سياسات المؤسسة.

## إجراء التصعيد (Support Escalation)
1. لقطة من صفحة سياسات Enterprise.
2. لقطة من رسالة الخطأ في VS Code.
3. تذكرة دعم تتضمن: enterprise slug، org slug، الحالة الحالية، الخطوات المنفذة، والتوقيت.

## إيقاع المراجعة
1. يومي خلال أول 7 أيام.
2. أسبوعي خلال أول شهر.
3. شهري بعد الاستقرار.

## سجل الحوكمة المطلوب
1. من غيّر السياسة.
2. ماذا تغير.
3. متى تغير.
4. لماذا تغير.
5. متى ينتهي الاستثناء (إن وجد).

## اعتماد
1. Policy owner: Sheikha Top Enterprise Admin
2. Effective date: 2026-06-01
3. Version: v2
