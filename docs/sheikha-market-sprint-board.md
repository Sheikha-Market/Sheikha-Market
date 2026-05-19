# Sheikha-Market Sprint Board

تاريخ التفعيل: 2026-05-20
المرجع: docs/sheikha-market-execution-blueprint.md

## Sprint 1 — Stabilization
الحالة: ACTIVE
الهدف: تثبيت التشغيل والواجهات الحرجة.

### Backlog
- [x] تأكيد سلامة package.json قبل كل تشغيل.
- [x] تشغيل Universal API على المنفذ 9191.
- [x] اختبار endpoints الحرجة الثلاثة.
- [x] تشغيل neural gate وتوثيق النتيجة.

### In Progress
- [ ] مراقبة ثبات تشغيل universal-api لمدة 24 ساعة.

### Monitoring Notes
- بدأت مراقبة 24 ساعة بتاريخ 2026-05-20.
- عملية PM2: sheikha-universal-api-watch24
- سكربت المراقبة: scripts/universal-api-watch24.sh
- ملف السجل: data/monitoring/universal-api-watch24.jsonl
- التواتر: فحص كل 5 دقائق لمسار /api/v2/health
- أول نتيجة موثقة: PASS
- آخر Snapshot (حي):
- إجمالي القياسات: 3
- PASS: 3
- FAIL: 0
- من: 2026-05-20T00:55:46+03:00
- إلى: 2026-05-20T01:05:46+03:00
- فحص Resilience بعد PR #123 (تضارب 8080): PASS (تم تدوير المنفذ تلقائيًا من 8080 إلى 8081).
- الإجراء المنفذ: إضافة معالجة server.on('error') مع fallback تدريجي حتى 10 محاولات.

### Done
- [x] إنشاء Blueprint التنفيذ.
- [x] إضافة endpoints التوافق: health + fundamentals + cosmic-integration.
- [x] تثبيت تشغيل universal-api عبر PM2 على 9191 بعد إزالة تعارض المنفذ.
- [x] حفظ حالة PM2 بعد التفعيل (pm2 save --force).

## Sprint 2 — Security Hardening
الحالة: READY
الهدف: تقوية الأمن ومنع ثغرات الحقن والتلوث البنيوي.

### Backlog
- [ ] حصر ملفات CodeQL المتأثرة فعليًا في هذا الفرع.
- [ ] تطبيق حماية مفاتيح object عبر whitelist.
- [ ] تطبيق حدود صارمة على tokenizer/input size.
- [ ] توحيد رسائل الأخطاء الأمنية بالعربية.

## Sprint 3 — Runtime Governance
الحالة: READY
الهدف: ضبط حدود التنفيذ والمهل الزمنية.

### Backlog
- [ ] فرض max execution time في طبقات التشغيل.
- [ ] توحيد sandbox policy profiles.
- [ ] توثيق قواعد التفعيل الآمن.

## Sprint 4 — Compiler & Test Reliability
الحالة: READY
الهدف: إغلاق فشل parser.test.js.

### Backlog
- [ ] تحليل سبب فشل اختبار compiler CLI emits php and ast files.
- [ ] إصلاح المسار/التوليد مع اختبار regression.
- [ ] الوصول إلى pass rate كامل في suite المستهدفة.

## Sprint 5 — Operations Automation
الحالة: READY
الهدف: أتمتة التشغيل والمراقبة.

### Backlog
- [ ] تفعيل دورة PM2 health + save policy.
- [ ] ربط readiness checks بتقرير يومي.
- [ ] توثيق runbook للطوارئ.

## Sprint 6 — Supply Chain Integration
الحالة: READY
الهدف: توحيد تكامل سلاسل الإمداد.

### Backlog
- [ ] توحيد عقود API لمسارات SCM/ERP.
- [ ] بناء KPIs: الطلب/المخزون/الزمن.
- [ ] اختبار تدفق end-to-end.

## Sprint 7 — Cloud & Data Center Readiness
الحالة: READY
الهدف: جاهزية السحابة ومراكز البيانات.

### Backlog
- [ ] تحسين profiles الإنتاج/الاختبار.
- [ ] ضبط observability ولوحات الإنذار.
- [ ] خطة fallback عند انقطاع الخدمات السحابية.

## Sprint 8 — Scale & Excellence
الحالة: READY
الهدف: الاستقرار عند التوسع.

### Backlog
- [ ] اختبارات الضغط والأداء.
- [ ] توثيق handover النهائي.
- [ ] تعريف نسخة release نهائية.

## Daily Cadence (تشغيل يومي)
1. node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
2. npm run -s os:test
3. UNIVERSAL_API_PORT=9191 npm run -s universal-api
4. bash scripts/neural-gate.sh http://127.0.0.1:8080
5. pm2 save --force
