# منظومة البكسل الذكية المتكاملة
# Sheikha Intelligent Pixel Ecosystem

## 📋 نظرة عامة
منظومة متكاملة تجمع بين:
- 🧠 محرك الذكاء الاصطناعي (AI Engine)
- 💬 جسر اللغات الكبيرة (LLM Bridge)
- 🔄 محرك التوليد الذكي (Generation Engine)
- 🛠️ مدير الأدوات والسكريبتات (Tools Manager)
- 🔗 منسق المنظومة (Ecosystem Orchestrator)

---

## 🚀 البدء السريع

### 1️⃣ تشغيل الخادم الرئيسي
```bash
npm run dev
# أو
node server.js
```

### 2️⃣ اختبار المنظومة
```bash
# اختبارات شاملة
node tests/pixel-ecosystem-integration.test.js
```

### 3️⃣ استخدام السكريبتات الجاهزة
```bash
# توليد وتحليل البكسلات
node scripts/pixel-scripts.js generate product 10

# تدريب النموذج والتنبؤ
node scripts/pixel-scripts.js train

# معالجة دفعة متقدمة
node scripts/pixel-scripts.js batch

# عرض الحالة
node scripts/pixel-scripts.js status

# تجميع ذكي
node scripts/pixel-scripts.js cluster
```

---

## 🔌 واجهات API

### الأساسية

**تهيئة المنظومة:**
```
POST /api/ecosystem/init
```

**الحصول على الحالة:**
```
GET /api/status
```

### محرك AI

**تدريب نموذج:**
```
POST /api/ai/train
Body: {
  "trainingData": [...],
  "modelName": "model-name"
}
```

**التنبؤ:**
```
POST /api/ai/predict
Body: {
  "input": {...},
  "modelName": "model-name"
}
```

**قائمة النماذج:**
```
GET /api/ai/models
```

### جسر LLM

**توليد أوامر:**
```
POST /api/llm/generate-prompt
Body: {
  "pixel": {...},
  "context": {...}
}
```

**معالجة الاستجابة:**
```
POST /api/llm/process-response
Body: {
  "promptId": "...",
  "aiResponse": "..."
}
```

### محرك التوليد

**توليد بكسلات:**
```
POST /api/generation/generate
Body: {
  "template": "product",
  "count": 10,
  "options": {...}
}
```

**الإحصائيات:**
```
GET /api/generation/stats
```

### الأدوات

**تنفيذ أداة:**
```
POST /api/tools/execute
Body: {
  "toolName": "analyze",
  "args": [pixel, ...]
}
```

**قائمة الأدوات:**
```
GET /api/tools/list
```

### السكريبتات

**تنفيذ سكريبت:**
```
POST /api/scripts/execute
Body: {
  "scriptName": "batch-process",
  "context": {...}
}
```

**قائمة السكريبتات:**
```
GET /api/scripts/list
```

---

## 🛠️ الأدوات المتاحة

### أداة `analyze`
تحليل البكسل وحساب التعقيد والتوصيات

```javascript
ecosystem.toolsManager.executeTool('analyze', pixel);
// {
//   dataSize: 123,
//   complexity: 0.75,
//   recommendations: ['..']
// }
```

### أداة `optimize`
تنظيف البيانات وضغطها

```javascript
ecosystem.toolsManager.executeTool('optimize', pixel);
// { optimized: true, originalSize: 200, newSize: 150 }
```

### أداة `compare`
مقارنة بكسلين

```javascript
ecosystem.toolsManager.executeTool('compare', pixel1, pixel2);
// { similarity: 0.85, differences: [...] }
```

### أداة `cluster`
تجميع البكسلات بناءً على الأنماط

```javascript
ecosystem.toolsManager.executeTool('cluster', [pixels]);
// { clusterCount: 3, clusters: [...] }
```

---

## 📚 السكريبتات الجاهزة

### `batch-process`
معالجة دفعة بكسلات مع تحقق شرعي

```javascript
ecosystem.toolsManager.executeScript('batch-process', {
  pixels: [...],
  applyNeural: true,
  verifySharia: true
});
```

### `generate-and-analyze`
توليد بكسلات ثم تحليلها

```javascript
ecosystem.toolsManager.executeScript('generate-and-analyze', {
  template: 'product',
  count: 5
});
```

### `train-and-predict`
تدريب نموذج والتنبؤ

```javascript
ecosystem.toolsManager.executeScript('train-and-predict', {
  trainingData: [...],
  testData: [...],
  modelName: 'test'
});
```

---

## 🔧 الأدوات المساعدة (Utilities)

```javascript
const utilities = require('./lib/sheikha-pixel-utilities');

// تحديث البيانات
utilities.normalizePixelData(data);

// التحقق من الصحة
utilities.validatePixel(pixel);

// حساب البصمة
utilities.generatePixelFingerprint(pixel);

// المقارنة المتقدمة
utilities.advancedCompare(pixel1, pixel2);

// التقرير
utilities.generateReport(pixels);

// التصدير
utilities.exportToCSV(pixels);
utilities.exportToJSON(pixels);

// الاستيراد
utilities.importFromJSON(jsonData);

// التشفير
utilities.encryptPixel(pixel, key);
utilities.decryptPixel(encryptedData, key);

// الإحصائيات التفصيلية
utilities.getDetailedStatistics(pixels);
```

---

## 📊 أمثلة عملية

### مثال 1: توليد وتحليل دفعة

```bash
# تشغيل السكريبت
node scripts/pixel-scripts.js generate product 5

# النتيجة:
# ✅ تم توليد 5 بكسل
# 📊 تحليل البكسلات:
#   📌 البكسل: pixel-001
#      - حجم البيانات: 245 بايت
#      - التعقيد: 0.65
#      - التوصيات: ...
```

### مثال 2: تدريب والتنبؤ

```bash
# تشغيل السكريبت
node scripts/pixel-scripts.js train

# النتيجة:
# 🧠 تدريب النموذج على 4 عينات...
# ✅ تم التدريب بنجاح
#    - الدقة: 92.50%
#    - الأنماط: 3
# 🔮 اختبار التنبؤات:
#   📈 gold:
#      - القيمة المتوقعة: 0.956
#      - الثقة: 89.5%
```

### مثال 3: استدعاء API

```bash
# توليد بكسلات عبر API
curl -X POST http://localhost:8080/api/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": "product",
    "count": 3
  }'

# النتيجة:
# {
#   "success": true,
#   "data": {
#     "generated": 3,
#     "pixels": [...]
#   }
# }
```

---

## 🧠 معالجة البيانات

### مراحل المعالجة الذكية

```
البيانات الخام
    ↓
1️⃣ استخراج الأنماط (AI Engine)
    ↓
2️⃣ معالجة عبر LLM (LLM Bridge)
    ↓
3️⃣ معالجة عصبية (Neural Processing)
    ↓
4️⃣ التحقق الشرعي (Sharia Verification)
    ↓
5️⃣ التطبيق على أدوات المنظومة
    ↓
بكسل متكامل جاهز للاستخدام
```

---

## 📈 الإحصائيات والمراقبة

### لوحة التحكم

```
GET /api/dashboard

{
  "success": true,
  "dashboard": {
    "title": "لوحة تحكم منظومة البكسل الذكية",
    "timestamp": "2026-05-11T10:30:00Z",
    "components": {
      "aiEngine": { "modelsCount": 3, ... },
      "llmBridge": { "promptsCount": 15, ... },
      "generationEngine": { "generatedCount": 45, ... },
      "toolsManager": { "toolsCount": 4, ... }
    },
    "systemHealth": {
      "aiEngine": "ready",
      "llmBridge": "connected",
      "generationEngine": "active",
      "toolsManager": "operational"
    }
  }
}
```

---

## 🧪 الاختبارات

### تشغيل جميع الاختبارات

```bash
node tests/pixel-ecosystem-integration.test.js

# النتيجة:
# ✅ نجح: 35
# ❌ فشل: 0
# 📊 النسبة: 100% (35/35)
# 🎉 جميع الاختبارات نجحت!
```

---

## 🔐 الأمان والتشفير

### تشفير البكسلات

```javascript
const encrypted = utilities.encryptPixel(pixel, 'my-secret-key');
// {
//   "pixelId": "pixel-001",
//   "encrypted": "eyJkYXRhIjoie1wiYVwiOjF9In0=",
//   "key": "my-secret-key",
//   "encryptedAt": "2026-05-11T10:30:00Z"
// }

const decrypted = utilities.decryptPixel(encrypted, 'my-secret-key');
// {
//   "success": true,
//   "data": { ... },
//   "pixelId": "pixel-001"
// }
```

---

## 📝 التصدير والاستيراد

### تصدير إلى CSV

```javascript
const csv = utilities.exportToCSV(pixels);
// ID,Type,DataSize,Status
// "pixel-001","object",245,"Valid"
// "pixel-002","object",198,"Valid"
```

### تصدير إلى JSON

```javascript
const json = utilities.exportToJSON(pixels);
// {
//   "export": {
//     "timestamp": "2026-05-11T10:30:00Z",
//     "pixelCount": 2,
//     "pixels": [...]
//   }
// }
```

### الاستيراد من JSON

```javascript
const imported = utilities.importFromJSON(jsonData);
// {
//   "success": true,
//   "pixels": [...],
//   "count": 2
// }
```

---

## 🌍 التكامل مع الخادم الرئيسي

في `server.js`:

```javascript
// استيراد المنظومة
const ecosystemRoutes = require('./routes/pixel-ecosystem');

// تسجيل المسارات
app.use('/api', ecosystemRoutes);

// الآن جميع المسارات متاحة
// /api/ecosystem/init
// /api/ai/train
// /api/llm/generate-prompt
// وغيرها...
```

---

## 📊 بيانات مرجعية

### القوالب المتاحة
- `product`: قالب المنتج
- `transaction`: قالب المعاملة
- `content`: قالب المحتوى

### الأدوات المدمجة
- `analyze`: تحليل شامل
- `optimize`: تحسين البيانات
- `compare`: مقارنة متقدمة
- `cluster`: تجميع ذكي

### السكريبتات المرجعية
- `batch-process`: معالجة دفعات
- `generate-and-analyze`: توليد وتحليل
- `train-and-predict`: تدريب والتنبؤ

---

## 🆘 حل المشاكل

### المنظومة لا تستجيب
```
1. تحقق من تشغيل الخادم: npm run dev
2. اختبر الاتصال: curl http://localhost:8080/api/status
3. تحقق من السجلات: tail -f logs/sheikha.log
```

### خطأ في التدريب
```
تأكد من:
1. صيغة البيانات صحيحة
2. وجود بيانات كافية (على الأقل 3 عينات)
3. عدم وجود قيم null
```

### بطء في المعالجة
```
1. قلل حجم الدفعة (PIXEL_BATCH_SIZE)
2. فعّل الذاكرة المؤقتة (PIXEL_CACHE_ENABLED)
3. استخدم المعالجة غير المتزامنة
```

---

## 📞 الدعم والتوثيق

- 📧 البريد: market@sheikha.top
- 🌐 الموقع: sheikha.top
- 📚 الوثائق: docs/pixel-ecosystem/

---

**آخر تحديث:** 11 مايو 2026
**الإصدار:** 1.0
**الحالة:** ✅ جاهز للإنتاج
