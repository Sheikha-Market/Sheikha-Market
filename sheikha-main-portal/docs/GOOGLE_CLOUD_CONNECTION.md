# 🛡️ محرك اتصال Google Cloud - شيخة

## الملف الرئيسي:
`lib/google-cloud-connection.js`

### الميزات:
- ✅ اتصال **حقيقي** بـ Google Cloud Storage
- ✅ اتصال **حقيقي** بـ Google Cloud BigQuery  
- ✅ اتصال **حقيقي** بـ Google Cloud Pub/Sub
- ✅ اختبار شامل لكل الخدمات
- ✅ تقارير تفصيلية

## كيفية الاستخدام:

### 1️⃣ الاستخدام كوحدة (Module):
```javascript
const sheikhaCloud = require('./lib/google-cloud-connection');

// استخدام الاتصالات
const status = sheikhaCloud.getStatus();
console.log(status);
```

### 2️⃣ الاختبار المباشر:
```bash
node lib/google-cloud-connection.js
```

### 3️⃣ الاستخدام في Express Router:
```javascript
const sheikhaCloud = require('../lib/google-cloud-connection');

router.get('/api/google/status', (req, res) => {
    res.json(sheikhaCloud.getStatus());
});

router.post('/api/google/test', async (req, res) => {
    const results = await sheikhaCloud.checkAllConnections();
    res.json(results);
});
```

## المتطلبات:

### ملف المفتاح (service-account-key.json):
ضع هذا الملف في جذر المشروع:
```
/workspaces/sheikha/sheikha-main-portal/service-account-key.json
```

### الحصول على المفتاح:
1. اذهب إلى Google Cloud Console
2. اختر المشروع (Project ID: 224557279528)
3. Service Accounts → اختر الحساب
4. Keys → Create new key → JSON
5. احفظ الملف في المسار أعلاه

## الحالات:

### ✅ متصل (مع ملف المفتاح):
```
Storage: ✅ 5 سلال
BigQuery: ✅ 10 مجموعات بيانات
Pub/Sub: ✅ 3 اشتراكات
```

### ⚠️ غير متصل (بدون ملف المفتاح):
```
⚠️ ملف مفتاح Google Cloud غير موجود
يُرجى إضافة service-account-key.json
```

## الدوال المتاحة:

| الدالة | الوصف |
|--------|--------|
| `init()` | تهيئة الاتصالات |
| `checkStorageConnection()` | اختبار Storage |
| `checkBigQueryConnection()` | اختبار BigQuery |
| `checkPubSubConnection()` | اختبار Pub/Sub |
| `checkAllConnections()` | اختبار جميع الخدمات |
| `getStatus()` | الحصول على الحالة الحالية |

---

**الحالة الحالية:** ⚠️ بانتظار ملف المفتاح (service-account-key.json)

**الخطوة التالية:** ضع ملف service-account-key.json لتفعيل الاتصالات الحقيقية ✨
