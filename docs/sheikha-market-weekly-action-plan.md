# Sheikha-Market Weekly Action Plan

تاريخ البدء: 2026-05-20
المالك التنفيذي: Sheikha-Market
المرجع: docs/sheikha-market-execution-blueprint.md

## Week 1 — Stabilization Baseline
الفترة: 2026-05-20 إلى 2026-05-26
المالك: Platform Runtime Team

### المهام
1. تثبيت جاهزية package.json ومنع EJSONPARSE.
- المالك: Runtime Maintainer
- تاريخ الاستحقاق: 2026-05-21
- معيار الإنجاز: نجاح فحص JSON قبل التشغيل يوميًا.

2. تفعيل Universal API على 9191.
- المالك: API Maintainer
- تاريخ الاستحقاق: 2026-05-22
- معيار الإنجاز: endpoints الحرجة الثلاثة تعمل.

3. تثبيت Neural Gate كفحص يومي.
- المالك: Operations Team
- تاريخ الاستحقاق: 2026-05-23
- معيار الإنجاز: PASS يومي موثق.

4. تثبيت PM2 save policy.
- المالك: Runtime Ops
- تاريخ الاستحقاق: 2026-05-24
- معيار الإنجاز: لا فقد في حالة العمليات بعد restart.

## Week 2 — Security Hardening
الفترة: 2026-05-27 إلى 2026-06-02
المالك: Security Engineering

### المهام
1. حصر تنبيهات CodeQL الفعلية في هذا الفرع.
- المالك: AppSec
- تاريخ الاستحقاق: 2026-05-28

2. تطبيق حماية object key whitelist.
- المالك: Backend Security
- تاريخ الاستحقاق: 2026-05-30

3. فرض حدود parser/tokenizer.
- المالك: Language Runtime
- تاريخ الاستحقاق: 2026-06-01

4. إعادة اختبار الأمن + neural gate.
- المالك: SecOps
- تاريخ الاستحقاق: 2026-06-02

## Week 3 — Runtime Governance & Reliability
الفترة: 2026-06-03 إلى 2026-06-09
المالك: Runtime Governance Team

### المهام
1. توحيد سياسات sandbox والمهل الزمنية.
2. إصلاح فشل parser.test.js وإغلاق regression.
3. رفع pass rate لاختبارات sprint3 المستهدفة.

## Week 4 — Release Readiness
الفترة: 2026-06-10 إلى 2026-06-16
المالك: Release Manager

### المهام
1. تنفيذ Go/No-Go Gate كامل.
2. اعتماد PR-ready package للقرار التنفيذي.
3. تجميد baseline للإصدار التالي.

## قالب تتبع يومي
- التاريخ:
- الفحوص المنفذة:
- الحالة (PASS/FAIL):
- المعوقات:
- الإجراء التصحيحي:
- المسؤول:

## أوامر مرجعية يومية
1. node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json valid')"
2. npm run -s os:test
3. UNIVERSAL_API_PORT=9191 npm run -s universal-api
4. curl -s http://127.0.0.1:9191/api/v2/health
5. bash scripts/neural-gate.sh http://127.0.0.1:8080
6. pm2 save --force
