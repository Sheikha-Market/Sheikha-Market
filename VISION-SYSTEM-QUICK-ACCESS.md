# 🚀 منظومة الرؤية الشاملة — الوصول السريع

**تاريخ التفعيل:** 5 مارس 2026
**الحالة:** ✅ مُفعّل بالكامل — داخلياً وخارجياً

---

## 📍 الوصول المباشر

### 🖥️ لوحة التحكم

```
http://localhost:8080/منظومة-الرؤية-الشاملة.html
```

### 🔌 API Base URL

```
http://localhost:8080/api/vision
```

---

## 🎯 10 نقاط نهاية جاهزة

### 1. حالة النظام ⚕️

```bash
GET /api/vision/status
```

**مثال:**

```bash
curl http://localhost:8080/api/vision/status | jq .
```

### 2. تحليل صفحة 👁️

```bash
POST /api/vision/analyze-page
```

**مثال:**

```bash
curl -X POST http://localhost:8080/api/vision/analyze-page \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://sheikha.top",
    "htmlContent": "<html><body><h1>شيخة</h1></body></html>",
    "depth": "comprehensive",
    "options": {
      "includeScreenshot": false,
      "extractData": true,
      "generateLogic": true
    }
  }'
```

### 3. تحليل صورة 🖼️

```bash
POST /api/vision/analyze-image
```

**مثال:**

```bash
curl -X POST http://localhost:8080/api/vision/analyze-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "imageBase64": "data:image/png;base64,...",
    "analysis": {
      "detectObjects": true,
      "extractText": true,
      "analyzeColors": true,
      "detectFaces": false
    }
  }'
```

### 4. تحليل فيديو 🎥

```bash
POST /api/vision/analyze-video
```

### 5. توليد منطق برمجي 🧠

```bash
POST /api/vision/generate-logic
```

**مثال:**

```bash
curl -X POST http://localhost:8080/api/vision/generate-logic \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "analysis-12345",
    "targetLanguage": "javascript",
    "framework": "react",
    "options": {
      "includeTests": true,
      "addComments": true,
      "islamicCompliance": true
    }
  }'
```

### 6. الرسم البياني الدلالي 🕸️

```bash
GET /api/vision/semantic-graph/:id
```

### 7. التحقق الشرعي 🕋

```bash
POST /api/vision/validate-islamic-compliance
```

**مثال:**

```bash
curl -X POST http://localhost:8080/api/vision/validate-islamic-compliance \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "page",
      "url": "https://example.com",
      "elements": [...]
    },
    "checks": {
      "noHarm": true,
      "truthfulness": true,
      "justice": true,
      "transparency": true,
      "publicBenefit": true
    }
  }'
```

### 8. تقرير شامل 📊

```bash
GET /api/vision/comprehensive-report/:id
```

### 9. تصدير النتائج 💾

```bash
GET /api/vision/export/:id/:format
```

**الصيغ المتاحة:** `json`, `pdf`, `html`, `markdown`

### 10. تحليل دفعات 📦

```bash
POST /api/vision/batch-analyze
```

---

## 🤖 6 وكلاء ذكاء اصطناعي

| الوكيل                 | الوظيفة            | الحالة |
| ---------------------- | ------------------ | ------ |
| 👁️ Visual Analysis     | تحليل بصري متقدم   | ✅ نشط |
| 🧠 Semantic Analysis   | فهم معاني عميق     | ✅ نشط |
| 🏗️ Structural Analysis | تحليل بنية هيكلية  | ✅ نشط |
| 📊 Data Extraction     | استخراج بيانات ذكي | ✅ نشط |
| ⚙️ Logic Generation    | توليد منطق برمجي   | ✅ نشط |
| 🕋 Islamic Validator   | مطابقة شرعية كاملة | ✅ نشط |

---

## 📜 5 مبادئ إسلامية مُطبّقة

1. **لا ضرر ولا ضرار** — No Harm Principle
2. **صدق القول والأمانة** — Truthfulness & Trust
3. **العدل واليسر** — Justice & Ease
4. **الشفافية والوضوح** — Transparency & Clarity
5. **المصلحة العامة** — Public Benefit

---

## 📂 ملفات النظام

| الملف                                                                    | الحجم    | الوصف          |
| ------------------------------------------------------------------------ | -------- | -------------- |
| [`lib/sheikha-vision-system.js`](lib/sheikha-vision-system.js)           | ~800 سطر | المحرك الأساسي |
| [`mcp-servers/sheikha-vision-mcp.js`](mcp-servers/sheikha-vision-mcp.js) | ~400 سطر | خادم MCP       |
| [`routes/vision-system-routes.js`](routes/vision-system-routes.js)       | ~600 سطر | نقاط النهاية   |
| [`public/منظومة-الرؤية-الشاملة.html`](public/منظومة-الرؤية-الشاملة.html) | ~800 سطر | لوحة التحكم    |
| [`VISION-SYSTEM-README.md`](VISION-SYSTEM-README.md)                     | -        | وثائق شاملة    |
| [`VISION-SYSTEM-SUMMARY.js`](VISION-SYSTEM-SUMMARY.js)                   | -        | ملخص تقني      |

---

## 🔧 إدارة الخادم

### تشغيل الخادم

```bash
cd /workspaces/sheikha/sheikha-main-portal
npm start
```

### فحص حالة الخادم

```bash
lsof -ti :8080 && echo "✅ الخادم يعمل" || echo "❌ الخادم متوقف"
```

### إيقاف الخادم

```bash
lsof -ti :8080 | xargs kill -9
```

### إعادة تشغيل الخادم

```bash
lsof -ti :8080 | xargs kill -9 && sleep 2 && npm start
```

---

## 📖 الوثائق الكاملة

- **[VISION-SYSTEM-README.md](VISION-SYSTEM-README.md)** — دليل شامل للنظام
- **[VISION-SYSTEM-SUMMARY.js](VISION-SYSTEM-SUMMARY.js)** — ملخص تقني للكود
- **[CLAUDE.md](CLAUDE.md)** — بروتوكول التكامل

---

## 🌟 الحالة الحالية

✅ **النظام مُفعّل بالكامل**
✅ **جميع الوكلاء نشطة**
✅ **جميع نقاط النهاية تعمل**
✅ **لوحة التحكم متاحة**
✅ **التوثيق كامل**
✅ **المبادئ الإسلامية مطبقة**

---

## 📞 الدعم

**المالك:** سلمان أحمد بن سلمان الراجح
**البريد:** market@sheikha.top
**المشروع:** SHEIKHA — أول منظومة اقتصادية إسلامية رقمية

---

**بسم الله الرحمن الرحيم**
تم بحمد الله — 5 مارس 2026
