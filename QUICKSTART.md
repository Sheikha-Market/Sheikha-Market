# 🚀 دليل البدء السريع — منظومة شيخة

## ⚡ البدء السريع (5 دقائق)

### الخطوة 1️⃣: التثبيت
```bash
npm install
```

### الخطوة 2️⃣: الإعداد
```bash
cp .env.example .env
# عدّل .env حسب احتياجاتك
```

### الخطوة 3️⃣: التشغيل
```bash
npm run dev
# سيبدأ الخادم على http://localhost:8080
```

### الخطوة 4️⃣: التحقق
```bash
# افتح المتصفح أو استخدم curl
curl http://localhost:8080/health
# يجب أن ترى: OK
```

---

## 📊 مراقبة النظام

### فحص الصحة
```bash
curl http://localhost:8080/api/health
```

**الاستجابة**:
```json
{
  "status": "ok",
  "service": "sheikha-main-portal",
  "health": "healthy",
  "slo": true,
  "alerts": 0,
  "uptime": "2d 5h 30m",
  "timestamp": "2026-05-03T10:30:00Z"
}
```

### إحصائيات الأداء
```bash
curl http://localhost:8080/api/system/metrics
```

### حالة الخدمات
```bash
curl http://localhost:8080/api/system/services
```

---

## 🎯 الميزات الرئيسية

| الميزة | الوصف | الحالة |
|--------|-------|--------|
| 🛡️ **Sharia Guard** | فحص شرعي إسلامي | ✅ فعال |
| 🧠 **Neural Network** | شبكة عصبية 12 خلية | ✅ فعال |
| 📊 **SRE Monitor** | مراقبة موثوقية الخدمة | ✅ فعال |
| 🔐 **Security** | تشفير + JWT | ✅ فعال |
| 💱 **Live Prices** | أسعار لحظية WebSocket | ✅ فعال |

---

## 📚 وثائق إضافية

📖 [**التوثيق الشاملة**](COMPREHENSIVE-DOCUMENTATION.md)
- شرح تفصيلي للعمارة
- أمثلة API متقدمة
- استكشاف الأخطاء والحلول

---

## 🆘 مساعدة سريعة

**المشكلة**: الخادم لا يبدأ
```bash
# الحل: تحقق من المنفذ
PORT=3000 npm start
```

**المشكلة**: أخطاء في المكتبات
```bash
# الحل: أعد تثبيت
rm -rf node_modules package-lock.json
npm install
```

**المشكلة**: خطأ في JavaScript
```bash
# الحل: فعّل الفحص
node --check server.js
npm run lint
```

---

## 📞 التواصل

- **البريد**: market@sheikha.top
- **الدومين**: sheikha.top
- **GitHub**: github.com/Sheikha-Market/sheikha-main-portal

---

## ✨ نصائح ذهبية

1. 📊 **استخدم المراقبة دائماً**
   - `/api/health` — الفحص السريع
   - `/api/system/metrics` — الإحصائيات المفصلة

2. 🔒 **الأمان أولاً**
   - استخدم JWT tokens
   - فعّل HTTPS في الإنتاج
   - احفظ API keys بأمان

3. 📝 **السجلات مهمة**
   - تحقق من السجلات عند حدوث مشاكل
   - احتفظ بنسخ احتياطية

4. 🚀 **تحديثات منتظمة**
   - تابع الإصدارات الجديدة
   - طبّق التحديثات الأمنية فوراً

---

**نسخة**: 1.0.0  
**آخر تحديث**: 3 مايو 2026  
**الحالة**: ✅ جاهز للإنتاج

