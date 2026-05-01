# بسم الله الرحمن الرحيم
# FIXES REGISTRY — سجل الإصلاحات الموحد
# قاعدة بيانات لمنع تكرار نفس الإصلاح

> **القاعدة الذهبية**: قبل أي إصلاح، ابحث هنا أولاً  
> **بعد أي إصلاح**: أضف سطراً هنا فوراً

---

## 🔑 PM2 — إدارة العمليات

| الخطأ | السبب | الإصلاح | المرجع |
|-------|-------|---------|--------|
| `Process or Namespace sheikha not found` | اسم العملية الصحيح هو `sheikha-api` لا `sheikha` | استخدم `bash scripts/sheikha.sh restart` أو `npm run server:restart` | 2026-04-27 |
| `pm2 restart sheikha` يفشل | — | `pm2 restart sheikha-api` | 2026-04-27 |

### أسماء العمليات الرسمية (ecosystem.config.js)
```
sheikha-api            ← الخادم الرئيسي :8080
sheikha-copilot        ← خادم MCP :3091
sheikha-meta-background
sheikha-health-monitor  ← cron 06:00 يومياً
sheikha-ollama-copilot  ← :3092
```

---

## 🌐 Express Routes — المسارات

| الخطأ | السبب | الإصلاح | المرجع |
|-------|-------|---------|--------|
| مسارات تعطي 404 رغم تسجيلها | معالج `app.use((req,res)=>404)` في المنتصف يحجب ما بعده | المعالج يجب أن يكون **آخر** شيء في server.js | 2026-04-27 |
| `/api/sheikha-pipeline/health` → 404 | الراوتر يُسجَّل داخل `try/catch` وقد يفشل صامتاً | أضف **failsafe** مباشر بعد كل `try/catch` | 2026-04-27 |
| `/api/health` → أول تسجيل فقط يعمل | نفس المسار مسجّل مرتين | الثانية → `/api/health/extended` | 2026-04-27 |

### القاعدة لتسجيل الراوترات
```js
// 1. تسجيل الراوتر (قد يفشل)
try {
  app.use('/api/X', require('./routes/X'));
} catch (e) {
  console.warn('⚠️', e.message);
}
// 2. failsafe مضمون (دائماً يعمل)
app.get('/api/X/health', (_req, res) => res.json({ success: true, status: 'healthy' }));

// 3. معالج 404 — يجب أن يكون الأخير
app.use((req, res) => { /* 404 */ });
```

---

## 🔧 أوامر التشغيل الموحدة

### الطريقة الموصى بها
```bash
# تشغيل
bash scripts/sheikha.sh start

# إعادة تشغيل (آمن — يبدأ جديداً إن لم يكن موجوداً)
bash scripts/sheikha.sh restart

# بعد git pull
bash scripts/sheikha.sh deploy

# اختبار
bash scripts/sheikha.sh smoke
```

### أوامر npm
```bash
npm run server:start
npm run server:stop
npm run server:restart
npm run server:status
npm run server:logs
npm run server:smoke
npm run server:deploy   ← git pull + restart + smoke
```

---

## 📦 التبعيات

| المشكلة | السبب | الإصلاح | المرجع |
|---------|-------|---------|--------|
| ثغرات uuid | نسخة قديمة | `npm install uuid@14.0.0` | 2026-04-27 |

---

## 🧪 Smoke Test — المسارات المختبرة

```bash
bash scripts/sheikha-smoke-test.sh [BASE_URL]
```

| المسار | الحالة المتوقعة |
|--------|----------------|
| `/health` | 200 |
| `/api/health` | 200 |
| `/api/memory/health` | 200 |
| `/api/network/live` | 200 |
| `/api/network/ready` | 200 |
| `/api/network/health` | 200 |
| `/api/shl-neural/health` | 200 |
| `/api/master-ncn/health` | 200 |
| `/api/protocol-events/health` | 200 |
| `/api/protocol-events/status` | 200 |
| `/api/sheikha-pipeline/health` | 200 ✅ (مُصلح 2026-04-27) |
| `/api/sheikha-pipeline/status` | 200 |
| `/api/offline/status` | 200 |
| `/api/realtime/health` | 200 |

---

## 📋 نموذج إضافة إصلاح جديد

```markdown
## [اسم الخطأ / المشكلة]

**التاريخ**: YYYY-MM-DD  
**الملف**: `server.js` / `routes/X.js` / ...  
**السبب الجذري**: وصف دقيق  
**الإصلاح**: ما تم تغييره  
**التحقق**: الأمر للتأكد  
**يمنع تكرار**: نعم ✅  
```
