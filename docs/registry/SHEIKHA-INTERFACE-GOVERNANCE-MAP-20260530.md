# خارطة الواجهات والحوكمة لمنظومة شيخة

## الواجهات العامة

1. **sheikha.top**              ← الواجهة العامة
2. **sheikha.top/market**       ← السوق
3. **sheikha.top/register**     ← التسجيل
4. **sheikha.top/company**      ← لوحة الشركات
5. **sheikha.top/government**   ← التسجيل الحكومي
6. **sheikha.top/runtime**      ← داخلي/محكوم (طبقة التشغيل المركزية)
7. **sheikha.top/ide**          ← داخلي/محكوم (بيئة التطوير الذكية)

---

## الربط مع الحوكمة والمعمارية

- كل واجهة مرتبطة بطبقة تشغيل أو سياسة حوكمة أو مكون بنية تحتية (موثق في computer-architecture/registry و policy).
- لا يمكن لأي مكون (واجهة أو خدمة أو عتاد أو برنامج) أن يصبح أساسيًا إلا بعد القياس، التحقق، الحوكمة، والترقية.
- جميع العمليات التشغيلية والحوكمية مؤتمتة ومراقبة عبر الأدوات:
  - Runtime Admission Controller
  - Protected Runtime Enforcer
  - Runtime Integrity Verifier
  - Runtime Drift Detector
  - Health Supervisor
  - Automation Loop
  - Computer Architecture Governance

---

## حالة النظام

- **DRIFT_DETECTED** و **DEGRADED** بسبب ملف غير محكوم: `self-improvement-latest.json`
- بقية النظام مستقر ومحكوم بالكامل.

## التوصية

- دمج أو حذف الملفات غير المحكومة لإعادة النظام إلى ZERO-DRIFT وHEALTHY.
- يمكن الآن توليد تقارير تكاملية بين الواجهات، التشغيل، البنية التحتية، والحوكمة.

---

آخر تحديث: 30 مايو 2026
