# 🚀 التشغيل السريع لمنظومة شيخة
## Sheikha Quick Start Guide

---

## ⚡ التشغيل في 3 خطوات

### Mac:
```bash
# 1. الانتقال للمجلد
cd "/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal"

# 2. تشغيل الخادم
/usr/local/bin/node server.js

# 3. افتح المتصفح
open http://localhost:8080
```

### Windows:
```powershell
# 1. الانتقال للمجلد
cd "C:\Users\%USERNAME%\OneDrive\Sheikha\sheikha-main-portal"

# 2. تشغيل الخادم
node server.js

# 3. افتح المتصفح
start http://localhost:8080
```

---

## 📁 الملفات المهمة

| الملف | الوصف |
|-------|-------|
| `server.js` | الخادم الرئيسي |
| `public/index.html` | الصفحة الرئيسية |
| `public/السوق.html` | صفحة السوق |
| `lib/sheikha-ai.js` | الذكاء الاصطناعي |
| `docs/المخطط-الرئيسي-الشامل.md` | المخطط الشامل |
| `.env` | متغيرات البيئة |

---

## 🔗 الروابط

- 🌐 **الموقع:** http://localhost:8080
- 📊 **API:** http://localhost:8080/api-docs.html
- 🤖 **المساعد:** http://localhost:8080/مساعد-شيخة.html

---

## 🛠️ حل المشاكل

### الخادم لا يعمل؟
```bash
# Mac - إيقاف الخادم السابق
lsof -ti:8080 | xargs kill -9

# Windows
taskkill /F /IM node.exe
```

### خطأ في Node.js؟
```bash
# استخدم النسخة المثبتة مسبقاً
/usr/local/bin/node server.js
```

---

## 📖 للمزيد

راجع: `docs/دليل-بيئة-التطوير-الشامل.md`

---

*www.sheikha.top*
