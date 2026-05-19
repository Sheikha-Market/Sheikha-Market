# Sheikha-Market Sprint Checklists

## Sprint 1 — Stabilization Checklist
- [ ] package.json valid JSON.
- أمر التحقق: node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json valid')"
- [ ] script `universal-api` موجود ويعمل.
- أمر التشغيل: UNIVERSAL_API_PORT=9191 npm run universal-api
- [ ] endpoints:
  - [ ] GET /api/v2/health
  - أمر التحقق: curl -s http://127.0.0.1:9191/api/v2/health
  - [ ] POST /api/neural/root/activate/fundamentals
  - أمر التحقق: curl -s -X POST http://127.0.0.1:9191/api/neural/root/activate/fundamentals -H "Content-Type: application/json" -d '{"domain":"computing","action":"activate kernel boot os"}'
  - [ ] POST /api/neural/root/cosmic-integration
  - أمر التحقق: curl -s -X POST http://127.0.0.1:9191/api/neural/root/cosmic-integration -H "Content-Type: application/json" -d '{"scope":"global"}'
- [ ] neural-gate PASS.
- أمر التحقق: bash scripts/neural-gate.sh http://127.0.0.1:8080
- [ ] pm2 save --force ناجح.
- أمر التشغيل: pm2 save --force

## Sprint 2 — Security Hardening Checklist
- [ ] إغلاق أي تنبيه Prototype/Property Injection في المسارات الفعلية.
- أمر الفحص: npm run lint
- [ ] تحقق إدخال صارم على مفاتيح object.
- [ ] حد أقصى لحجم المدخلات النصية.
- [ ] إزالة imports/vars غير المستخدمة الحساسة.
- [ ] توثيق الإصلاحات في changelog أمني داخلي.

## Sprint 3 — Runtime Governance Checklist
- [ ] تعريف max execution/timeouts لكل مسار حساس.
- [ ] سياسة sandbox فعالة ومختبرة.
- [ ] رسائل أخطاء موحدة.
- [ ] اختبار سيناريوهات الفشل المتوقعة.
- أمر التحقق: npm run -s ops:sheikha:lang:sprint3:run

## Sprint 4 — Test Reliability Checklist
- [ ] إصلاح parser.test.js الفاشل.
- [ ] test suite المستهدفة = 100% pass.
- [ ] regression tests مضافة.
- أمر التحقق: npm run -s ops:sheikha:lang:sprint3:test

## Sprint 5 — Ops Automation Checklist
- [ ] health checks مجدولة.
- [ ] PM2 monitoring يعمل دون crash loops.
- [ ] runbook للطوارئ محدث.
- أمر التحقق: npm run -s ops:monitor:status

## Sprint 6 — Supply Chain Integration Checklist
- [ ] توحيد contract لمسارات SCM.
- [ ] KPIs سلاسل الإمداد متاحة.
- [ ] اختبار end-to-end مكتمل.
- أمر التحقق: npm run -s ops:projects:sync

## Sprint 7 — Cloud Readiness Checklist
- [ ] fallback mode جاهز.
- [ ] observability dashboards محدثة.
- [ ] اختبار outage scenario موثق.
- أمر التحقق: npm run -s ops:readiness

## Sprint 8 — Scale Checklist
- [ ] load tests ناجحة.
- [ ] performance baseline موثق.
- [ ] وثائق handover مكتملة.
- أمر التحقق: npm run -s ops:universal:score

## Go/No-Go Gate (قبل أي Release)
- [ ] Security: لا تنبيهات حرجة مفتوحة.
- [ ] Runtime: neural gate = PASS.
- [ ] API: المسارات الحرجة تعمل.
- [ ] Ops: PM2 مستقر.
- [ ] Tests: suite الحرجة pass.

### أوامر Gate النهائية
1. node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json valid')"
2. npm run -s os:test
3. UNIVERSAL_API_PORT=9191 npm run -s universal-api
4. bash scripts/neural-gate.sh http://127.0.0.1:8080
5. npm run -s ops:sheikha:lang:sprint3:test
6. pm2 save --force
