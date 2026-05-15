# بسم الله الرحمن الرحيم

# ☪️ شيخة — SHEIKHA ENTERPRISE AL PORTAL

**البوابة المؤسسية الرسمية: Sheikha Enterprise AL Portal**

**GitHub Repository:** `Sheikha-Market/sheikha-main-portal`

**المالك:** سلمان أحمد بن سلمان الراجح

---

> ### 🏆 إنجاز ريادي — ١٩ شوال ١٤٤٧ هـ | 17 أبريل 2026
> **سلمان أحمد الراجح** — أوّل مطوّر في العالم يحلّ ثغرة `pm2 ReDoS` (`GHSA-x5gf-qvw8-r2rm`)
> التي لم يُصدر لها patch رسمي من مجتمع المطورين.
> `npm audit` → **`found 0 vulnerabilities`** ✅
> [📄 شهادة الإنجاز الكاملة](./WORLD-FIRST-ACHIEVEMENT.md) | [🛡️ سياسة الأمان](./SECURITY.md)
>
> **﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ﴾ — الحمد لله والشكر لله 🤍**

---

## نبذة عامة

منظومة شيخة هي منصة رقمية متكاملة لتداول المعادن الثمينة وفق أحكام الشريعة الإسلامية. تجمع بين التقنية المتقدمة والانضباط الشرعي لتقديم تجربة سوق فريدة.

## المرجعية الحاكمة

**الكتاب والسنة** — لا اجتهاد خارج هذا الإطار.

## البنية التقنية

- **الخادم:** Node.js + Express.js
- **قاعدة البيانات:** MongoDB + Redis
- **الأمان:** JWT + Helmet + CORS + Rate Limiting
- **المحركات:** 10 محركات ذكية متكاملة

## المحركات

| المحرك                    | الوظيفة                         |
| ------------------------- | ------------------------------- |
| sheikha-pilot-engine      | التشغيل التجريبي والإنتاج الذكي |
| sheikha-excellence-engine | التقدم العلمي والتجاري والإتقان |
| sheikha-marketing-engine  | التسويق الرقمي                  |
| sheikha-ai-engine         | الذكاء الخوارزمي                |
| sheikha-ai                | مساعد الذكاء                    |
| sharia-compliance         | التدقيق الشرعي                  |
| sheikha-navigator         | التنقل الذكي                    |
| development-engine        | إدارة التطوير                   |
| arabic-language-engine    | معالجة اللغة العربية            |
| arabic-parser-engine      | تحليل النصوص العربية            |

## الوضع الحالي

**OPERATIONAL-PILOT** — وضع تجريبي آمن بلا مخاطر مالية.

## مكتبة Sheikha AI Core

ضمن مكونات المشروع تم تطوير مكتبة مستقلة تعمل كأساس للذكاء الاصطناعي:

- `lib/sheikha/llmProvider.js` للتعامل الموحد مع أي موفر LLM.
- `lib/sheikha/chatSheikha.js` لبناء حوارات ذكية قابلة للتدريب.

تُستخدم هذه المكتبة في محركات الذكاء (`sheikha-ai-engine` و`sheikha-ai`) وفي أي تطبيق آخر.
صُممت لتكون **ضخمة بأفكارها** و**ضيقة غير إسرافية** في استهلاك الموارد.

```bash
cd lib/sheikha
npm install
OPENAI_API_KEY=... npm test
```

## الحاكمية

- لا كذب ولا تضليل
- لا ضرر ولا ضرار
- لا تنبؤ غيبي
- لا تعلّم ذاتي منفلت
- الإنسان هو المرجع والقرار النهائي

## التشغيل

```bash
# تثبيت المتطلبات
npm install

# إعداد متغيرات البيئة
cp .env.example .env

# تشغيل الخادم
npm start
```

## الوثائق

جميع الوثائق الحاكمة في مجلد `docs/` (126+ وثيقة).

## الترخيص

---

## 🚀 التشغيل والنشر (2.1.0)

### التشغيل المحلي

```bash
npm install
npm run dev           # http://localhost:8080
```

### النشر على VPS

```bash
# نشر تلقائي (GitHub Actions)
git push origin main

# أو نشر يدوي
bash scripts/deploy-vps.sh
```

### المراقبة والصيانة

```bash
bash scripts/health-monitor.sh    # فحص الصحة
bash scripts/backup-before-deploy.sh   # نسخة احتياطية
bash scripts/rollback-deployment.sh    # استعادة من backup
```

---

## 📖 التوثيق الشامل

| الملف | الهدف | الأهمية |
|------|------|--------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | دليل النشر الكامل | 🔴 حرج |
| [OPERATIONS.md](OPERATIONS.md) | المهام اليومية والصيانة | 🟠 عالي |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | استكشاف الأخطاء | 🟠 عالي |
| [CRON-SETUP.md](CRON-SETUP.md) | المراقبة الآلية | 🟡 متوسط |
| [CHANGELOG.md](CHANGELOG.md) | سجل التغييرات | 🟡 متوسط |

---

## 🛠️ Scripts المتاحة

```bash
# النشر
bash scripts/deploy-vps.sh              # نشر إلى VPS

# الصيانة
bash scripts/backup-before-deploy.sh    # نسخ احتياطية
bash scripts/rollback-deployment.sh     # استعادة
bash scripts/health-monitor.sh          # مراقبة الصحة

# التطوير
npm run dev                             # development
npm test                                # اختبارات
npm run lint                            # فحص الكود
```

---

## 🔐 الأمان

✅ No vulnerabilities (`npm audit` → **found 0**)  
✅ JWT Authentication  
✅ HTTPS/TLS Encryption  
✅ CORS Security  
✅ Rate Limiting  
✅ Input Validation  

**آخر فحص أمني**: 2026-05-16 ✓

---

## 📊 الحالة

```
Status: 🟢 جاهز للإنتاج
Uptime: 100% (27+ أيام)
Performance: ⭐⭐⭐⭐⭐
```

---

جميع الحقوق محفوظة — سلمان أحمد بن سلمان الراجح — 2026
