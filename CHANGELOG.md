# بسم الله الرحمن الرحيم
# CHANGELOG — سجل تغييرات سوق شيخة

> **الغرض**: توثيق كل إصلاح وتحسين لمنع التكرار  
> **القاعدة**: أي إصلاح يُطبَّق → يُوثَّق هنا فوراً

---

## [2026-04-27] — إصلاح مسارات الشبكة العصبية وتوحيد PM2

### 🔴 المشكلة
- `pipeline-health` → 404 دائماً
- `pm2 restart sheikha` → `Process not found` (الاسم الصحيح: `sheikha-api`)
- معالج 404 كان في منتصف سلسلة Express يحجب 7 مجموعات مسارات

### ✅ الإصلاح
1. **نقل معالج 404**: من السطر ~36695 إلى نهاية جميع المسارات (بعد السطر 37035)
2. **مسارات failsafe**: أضيفت مسارات صحة مضمونة بعد كل `try/catch`:
   - `GET /api/sheikha-pipeline/health` + `/status`
   - `GET /api/shl-neural/health`
   - `GET /api/master-ncn/health`
   - `GET /api/protocol-events/health` + `/status`
3. **إصلاح تكرار**: `/api/health` الثانية → `/api/health/extended`
4. **PM2 wrapper**: `scripts/sheikha.sh` + أوامر `npm run server:*`
5. **Smoke test**: توسيع من 7 إلى 14 endpoint

### 📁 الملفات المُعدَّلة
- `server.js` — نقل 404 handler + failsafe endpoints
- `scripts/sheikha-smoke-test.sh` — توسيع التغطية
- `scripts/sheikha.sh` — **جديد**: wrapper موحد لـ PM2
- `package.json` — إضافة `server:start/stop/restart/status/logs/smoke/deploy`
- `CHANGELOG.md` — **جديد**: هذا الملف
- `docs/FIXES-REGISTRY.md` — **جديد**: قاعدة بيانات الإصلاحات

### 🧪 التحقق
```bash
bash scripts/sheikha.sh smoke
# المتوقع: نجح: 14 | فشل: 0
```

---

## [2026-03-08] — تفعيل نظام الإصلاح الذاتي

### ✅ التفعيلات
- قاعدة بيانات التنبيهات (in-memory)
- نظام الإحصائيات والتتبع
- محرك التشخيص الذكي
- محرك التنفيذ التلقائي (6 قواعد إصلاح)

### 📁 الملفات
- `server.js` — ~650 سطر
- `docs/SELF-HEALING-ACTIVATION-LOG.md`

---

## [تنسيق الإدخال الجديد]

```
## [YYYY-MM-DD] — عنوان التغيير

### 🔴 المشكلة
وصف المشكلة

### ✅ الإصلاح
1. الخطوة الأولى
2. الخطوة الثانية

### 📁 الملفات المُعدَّلة
- `file.js` — وصف

### 🧪 التحقق
```bash
# أمر التحقق
```
```
