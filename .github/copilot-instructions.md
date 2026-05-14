# 🤖 تعليمات GitHub Copilot — سوق شيخة™
# Copilot Custom Instructions — Sheikha Market

> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

## نظرة عامة على المشروع / Project Overview

**سوق شيخة™** هو السوق الذكي المتكامل للتجارة والتحليل والربط بين الموردين والمشترين في المملكة العربية السعودية والعالم العربي.

Sheikha Market™ is an integrated smart marketplace connecting suppliers and buyers across Saudi Arabia and the Arab world, powered by a neural AI engine called **Sheikha Codex Neural Engine**.

---

## 🏗️ البنية المعمارية / Architecture

### المجلدات الأساسية
```
sheikha-main-portal/        ← الخادم الرئيسي (Node.js/Express)
  ├── server.js             ← نقطة الدخول الرئيسية
  ├── routes/               ← مسارات API (products, orders, suppliers, analytics, auth)
  ├── lib/                  ← مكتبات المنظومة الأساسية
  ├── core/                 ← المحرك العصبي (Neural Engine)
  │   ├── neural/           ← خلايا شيخة العصبية (12 خلية)
  │   └── sheikha-ubuntu-upper-layer.js
  ├── middleware/            ← وسطاء الأمان والمصادقة
  ├── scripts/              ← سكريبتات البيانات والأدوات
  └── tests/                ← اختبارات التكامل
data/                       ← ملفات البيانات والتحليلات
docs/                       ← التوثيق
```

### Stack التقني
- **Backend:** Node.js + Express.js
- **Auth:** JWT + bcrypt
- **Storage:** In-memory / JSON (MVP phase)
- **Container:** Docker + Azure Container Apps
- **CI/CD:** GitHub Actions
- **AI Engine:** Sheikha Codex Neural Engine (12 Neural Cells)

---

## 📏 معايير الكود / Coding Standards

### اللغة والأسلوب
- الكود يُكتب بالإنجليزية
- التعليقات والوثائق تُكتب بالعربية **أولاً** ثم بالإنجليزية إذا لزم
- استخدم Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `security:`
- لا تضع credentials أو secrets في الكود أبداً — استخدم Environment Variables

### Node.js / JavaScript
```javascript
// ✅ مثال جيد
async function getProduct(id) {
  // التحقق من المدخلات — Input validation
  if (!id || typeof id !== 'string') throw new Error('معرّف المنتج غير صالح');
  return db.findById(id);
}

// ❌ تجنب
function getProduct(id) {
  return db.findById(id); // لا تحقق من المدخلات
}
```

### أنماط الأمان المطلوبة
- تحقق دائماً من المدخلات (Input Validation)
- استخدم Helmet.js لحماية HTTP headers
- Rate limiting على جميع endpoints
- JWT للمصادقة — لا session cookies
- لا تُسجّل passwords أو tokens في الـ logs

---

## 🕌 معايير الامتثال الشرعي / Sharia Compliance

هذا المشروع يلتزم بمبادئ الاقتصاد الإسلامي:

- ❌ لا ربا (No interest-based transactions)
- ❌ لا غرر (No excessive uncertainty in contracts)  
- ❌ لا منتجات محرمة (No haram products: alcohol, pork, weapons, etc.)
- ✅ الشفافية في التسعير (Transparent pricing)
- ✅ العدل في المعاملات (Fair dealings)
- ✅ حماية المستهلك (Consumer protection)

عند اقتراح كود يتعلق بالمدفوعات أو العقود، تأكد من توافقه مع هذه المبادئ.

---

## 🧠 المحرك العصبي / Neural Engine

المنظومة تعتمد على **12 خلية عصبية** (Neural Cells) و**19 وحدة في Runtime الجذري**:

```javascript
// للتحقق من حالة المحرك
const cells = require('./core/neural/neural-cells');
const status = cells.status();
// يجب أن يكون: status.ready === true && status.totalCells === 12
```

لا تعدّل ملفات `core/neural/` إلا إذا كنت على دراية كاملة بالمنظومة.

---

## 🔌 نقاط API الرئيسية / Key API Endpoints

```
GET  /api/health                    ← فحص صحة الخادم
GET  /api/catalog                   ← قائمة المنتجات (عام)
GET  /api/catalog/categories        ← التصنيفات
POST /api/catalog                   ← إضافة منتج (supplier فقط)
GET  /api/suppliers                 ← قائمة الموردين (عام)
GET  /api/market-analytics/market   ← تحليلات السوق (عام)
POST /api/auth/register             ← تسجيل مستخدم جديد
POST /api/auth/login                ← تسجيل الدخول
GET  /api/market-orders             ← الطلبات (يتطلب JWT)
```

---

## ✅ قائمة التحقق للكود الجديد / New Code Checklist

عند إنشاء كود جديد، تأكد من:

- [ ] التحقق من المدخلات (Input validation)
- [ ] معالجة الأخطاء (Error handling with try/catch)
- [ ] عدم كشف معلومات حساسة في الـ responses
- [ ] إضافة تعليق بالعربية يشرح الغرض
- [ ] التوافق الشرعي إذا كان الكود يتعلق بمعاملات مالية
- [ ] عدم كسر الـ 12 خلية العصبية الموجودة

---

## 🚫 ما يجب تجنبه / Avoid

- لا تقترح مكتبات غير ضرورية
- لا تستخدم `eval()` أو `Function()` constructor
- لا تُعدّل `package-lock.json` يدوياً
- لا تقترح إزالة middleware الأمان (Helmet, rate-limit, auth)
- لا تقترح تعطيل فحوصات CI

---

*منظومة سوق شيخة™ — «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»*
