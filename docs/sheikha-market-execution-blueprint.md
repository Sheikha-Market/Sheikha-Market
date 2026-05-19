# Sheikha-Market Execution Blueprint

## الهدف
تجهيز خارطة تنفيذ عملية لمنظومة Sheikha-Market تربط بين:
- واجهات التشغيل الموحدة.
- مسارات التفعيل العصبي والجذري.
- الحوكمة والأمن.
- التشغيل السحابي والمحلي.
- خطة تطوير متدرجة Sprint-by-Sprint.

تاريخ الإصدار: 2026-05-20
الحالة: Active

## نطاق التنفيذ
يشمل هذا المخطط:
- طبقة API التشغيلية.
- طبقة النواة والخدمات الأساسية.
- طبقة الذكاء والحوكمة.
- طبقة مراقبة الصحة والتشغيل.
- طبقة التكامل الكوني وسلاسل الإمداد.

لا يشمل هذا المخطط:
- تغيير سياسات الملكية أو التراخيص القانونية.
- تعديلات البنية التحتية خارج بيئة المشروع الحالية بدون موافقة تشغيلية.

## خريطة الخدمات الأساسية
1. خدمة التشغيل الرئيسية
- الهدف: خدمة HTTP الأساسية للمنظومة.
- المرجع التشغيلي: npm start
- مرجع PM2: sheikha-api / sheikha-main-portal

2. خدمة Universal API
- الهدف: توفير endpoints موحدة للتفعيل السريع بين الأنظمة.
- المنفذ الافتراضي: 9191
- endpoint الصحة: GET /api/v2/health

3. خدمة Root Science Activation
- الهدف: تفعيل مجالات الحاسب والعلوم والذكاء.
- تشغيل: ops:root-science:* scripts

4. خدمة Cosmic Integration
- الهدف: تفعيل مسارات التمكين الكوني والمواءمة الشاملة.
- تشغيل: sovereign:cosmic:* + ops:cosmic-heart:activate

5. خدمة Neural Gate
- الهدف: تأكيد صلاحية واجهات الشبكة الحيوية قبل الانتقال لأي طور إنتاجي.
- تشغيل: scripts/neural-gate.sh

6. خدمة Policy Rotation
- الهدف: تدوير وتثبيت سياسات التوقيع والتحقق بشكل دوري وآمن.
- تشغيل: ops:sheikha:policy:rotate:cycle:* scripts

## المسارات الحرجة (Priority API Paths)
1. Health & Readiness
- GET /api/health
- GET /api/v2/health

2. Neural Root Activation
- POST /api/neural/root/activate/fundamentals
- POST /api/neural/root/cosmic-integration

3. Governance & Network Status
- GET /api/governance/status
- GET /api/network/dns/status
- GET /api/network/dbus/status
- GET /api/network/neural/status

## الأولويات التنفيذية
### P0
- ثبات package.json وصحته دائمًا.
- منع تعارض المنافذ التشغيلية (9090 محجوز لخدمات خارجية، 9191 للخدمة الموحدة).
- نجاح بوابة neural gate قبل أي نشر.
- ضمان عمل policy rotation دون انهيار PM2.

### P1
- زيادة تغطية اختبارات sheikha-language وإزالة الفشل الحالي في parser.test.js.
- تقوية الإدخال على endpoints الجديدة (تحقق صارم + حدود أحجام الطلب).
- توحيد بنية الاستجابة API: success, data, message, timestamp.

### P2
- أتمتة تقارير الأداء والجاهزية التشغيلية يوميًا.
- توسيع تكامل سلاسل الإمداد بواجهات SCM/ERP.
- لوحات تشغيل موحدة للفرق (تقنية، حوكمة، تشغيل).

## خطة التنفيذ Sprint-by-Sprint
### Sprint 1 (Stabilization)
- تثبيت scripts الحرجة في package.json.
- تثبيت Universal API على 9191.
- تشغيل واختبار endpoints الحرجة.
- مخرجات التسليم: readiness report + neural gate pass.

### Sprint 2 (Security Hardening)
- مراجعة CodeQL alerts وتطبيق حماية ضد prototype pollution.
- تعزيز التحقق من المدخلات على المسارات الحرجة.
- تنظيف الوحدات غير المستخدمة لتقليل الضوضاء التحليلية.
- مخرجات التسليم: security hardening report.

### Sprint 3 (Runtime Governance)
- توحيد حدود sandbox وحدود parser.
- تفعيل قيود التنفيذ والمهلة الزمنية per request.
- تحسين إدارة أخطاء runtime بالرسائل العربية الموحدة.
- مخرجات التسليم: runtime governance baseline.

### Sprint 4 (Core Intelligence Reliability)
- إصلاح اختبارات compiler/parser الفاشلة.
- تثبيت regression suite لطبقة اللغة.
- تحسين deterministic outputs لوحدات التفعيل.
- مخرجات التسليم: test reliability >= 98%.

### Sprint 5 (Operations Automation)
- بناء دورة تشغيل يومية آلية للصحة والسياسات.
- تكامل PM2 workflows مع alerts.
- تحسين rollback policy لأي فشل تفعيل.
- مخرجات التسليم: التشغيل الذاتي الأساسي.

### Sprint 6 (Supply Chain Integration)
- ربط مسارات سلسلة الإمداد بواجهات موحدة.
- توحيد model contracts لتبادل البيانات.
- إضافة مؤشرات KPI خاصة بسير الطلبات والمخزون.
- مخرجات التسليم: supply chain integration v1.

### Sprint 7 (Cloud & Data Center Readiness)
- تحسين جاهزية السحابة ومراكز البيانات.
- ضبط environment profiles للإنتاج/الاختبار.
- تعزيز observability وتقارير الاستيعاب.
- مخرجات التسليم: cloud readiness gate.

### Sprint 8 (Scale & Excellence)
- تحسين الأداء تحت الضغط.
- تفعيل blueprint المعياري للتوسع بين المستودعات.
- توثيق نهائي + handover تشغيلي.
- مخرجات التسليم: production excellence release.

## مؤشرات النجاح (KPIs)
1. جاهزية التشغيل
- Neural gate pass rate >= 99%
- PM2 uptime >= 99.9%

2. جودة البرمجيات
- Test pass rate >= 98%
- Critical security alerts = 0

3. موثوقية API
- Health endpoint latency p95 < 250ms
- Error rate < 1%

4. الاستقرار التشغيلي
- Zero unplanned runtime crash في sprint window
- Mean recovery time < 10 minutes

## مخاطر معروفة ومعالجاتها
1. تعارض المنافذ
- المعالجة: اعتماد 9191 للخدمة الموحدة وتوثيقها.

2. انجراف scripts في package.json
- المعالجة: gate ثابت لفحص JSON قبل أي تشغيل أو دمج.

3. فشل اختبارات parser
- المعالجة: تخصيص Sprint 4 لثبات compiler suite.

4. اتصالات سحابية غير متاحة
- المعالجة: fallback local mode + retry policy + health labeling واضح.

## Definition of Done لكل Sprint
1. نجاح الاختبارات المرتبطة بنطاق Sprint.
2. تحديث وثائق التشغيل والتغييرات.
3. تنفيذ فحص أمني أساسي وعدم وجود regression حرج.
4. تسليم تقرير نتائج قابل للمراجعة.

## أوامر مرجعية للتشغيل
1. فحص صحة JSON
- node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json valid')"

2. تشغيل Universal API
- UNIVERSAL_API_PORT=9191 npm run universal-api

3. اختبارات endpoints الحرجة
- curl -s http://127.0.0.1:9191/api/v2/health
- curl -s -X POST http://127.0.0.1:9191/api/neural/root/activate/fundamentals -H "Content-Type: application/json" -d '{"domain":"computing","action":"activate kernel boot os"}'
- curl -s -X POST http://127.0.0.1:9191/api/neural/root/cosmic-integration -H "Content-Type: application/json" -d '{"scope":"global"}'

4. فحص البوابة العصبية
- bash scripts/neural-gate.sh http://127.0.0.1:8080

5. حفظ حالة PM2
- pm2 save --force
