# بسم الله الرحمن الرحيم
# Checklist تشغيل يومي — منظومة وسوق شيخة

## الهدف
ضمان الجاهزية التشغيلية اليومية للمنظومة: الخادم، الاتصالات، الحوكمة، الفوترة، والمعمارية الذكية.

## نافذة الفحص
- بداية اليوم: فحص شامل.
- منتصف اليوم: فحص سريع.
- نهاية اليوم: فحص الإغلاق والتوثيق.

## 1) فحص صحة الخدمات
```bash
sudo systemctl status sheikha-main --no-pager
curl -s http://localhost:8080/health
```

**نجاح:** الخدمة `active (running)` + `/health` يرجع `OK`.

## 2) فحص جاهزية الاتصالات
```bash
curl -s http://localhost:8080/api/comms/readiness | python3 -m json.tool
curl -s http://localhost:8080/api/comms/providers | python3 -m json.tool
```

**نجاح:** `success=true` + القنوات المطلوبة `enabled=true` + `mode=real_send` عند التشغيل الفعلي.

## 3) فحص المعمارية الذكية (Smart Digital)
```bash
curl -s http://localhost:8080/api/erp/architecture/status \
  -H "x-owner-key: YOUR_OWNER_KEY" | python3 -m json.tool
```

**نجاح:** `totalEngines >= 20` و `activeEngines = totalEngines` و `topology.nodes` غير فارغ.

## 4) فحص الحوكمة والامتثال
```bash
curl -s http://localhost:8080/api/comms/dashboard | python3 -m json.tool
```

**نجاح:** لا يوجد ارتفاع غير طبيعي في:
- `providerPolicyBlocked`
- `budgetGuardBlocked`
- `shariaBlocked`

## 5) فحص الفوترة والالتزامات
```bash
curl -s "http://localhost:8080/api/comms/billing/dashboard?days=30" \
  -H "Authorization: Bearer <ADMIN_JWT>" | python3 -m json.tool
```

**نجاح:** لا توجد فواتير متأخرة غير مبررة، وتواريخ الاستحقاق واضحة.

## 6) فحص الأمان
- التحقق أن `SHEIKHA_OWNER_KEY` مضبوط في `.env`.
- التحقق أن المسارات الإدارية لا تعمل بدون صلاحية.

اختبار رفض الوصول:
```bash
curl -s http://localhost:8080/api/erp/architecture/status | python3 -m json.tool
```

**نجاح:** رسالة رفض صلاحية (`يجب تسجيل الدخول كأدمن`).

## 7) توثيق يومي مختصر
يُسجل في نهاية اليوم:
- حالة الخدمة.
- حالة المعمارية الذكية.
- حالة الاتصالات.
- المتأخرات المالية (إن وجدت).
- أي حادثة أمنية أو انقطاع.

## معايير نجاح اليوم
- Availability: لا انقطاع مؤثر.
- Security: لا وصول غير مصرح.
- Communications: القنوات الأساسية تعمل.
- Governance: لا خرق لسياسات "لا ضرر ولا ضرار".
- Finance: لا استحقاق متأخر غير معالج.
