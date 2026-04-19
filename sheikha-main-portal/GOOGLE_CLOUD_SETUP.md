# 🚀 دليل إعداد Google Cloud - Sheikha

## ✅ الحالة الحالية

```
✅ Node.js v25.6.1
✅ NPM 11.9.0
✅ جميع حزم Google Cloud مثبتة:
   - @google-cloud/aiplatform@^6.5.0
   - @google-cloud/storage@^7.19.0
   - @google-cloud/bigquery@^8.1.1
   - @google-cloud/pubsub@^5.3.0
✅ محرك الاتصال: lib/google-cloud-connection.js (7.26 KB)
✅ المنفذ 8080: متاح
⏳ ملف المفتاح: بانتظار الإضافة
```

---

## 📝 الخطوة 1️⃣: الحصول على ملف المفتاح (Service Account Key)

### في Google Cloud Console:

1. **افتح Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **اختر المشروع:**
   - Project ID: `sheikha-marketplace`
   - Project Number: `952025946298`

3. **اذهب إلى Service Accounts:**
   - الشريط الجانبي ← APIs & Services ← Service Accounts
   - اختر: `market@sheikha.top`

4. **إنشء مفتاح جديد:**
   - الملف (Keys) → Create new key
   - الصيغة: **JSON**
   - سيتم تحميل الملف تلقائياً

5. **ضع الملف في المشروع:**
   ```
   service-account-key.json
   ```
   (في جذر المشروع `/workspaces/sheikha/sheikha-main-portal/`)

### الملف سيحتوي على:
```json
{
  "type": "service_account",
  "project_id": "sheikha-marketplace",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "market@sheikha.top",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 🔧 الخطوة 2️⃣: تفعيل Google Cloud APIs

في Google Cloud Console:

### تفعيل هذه APIs:

1. **Cloud Storage API**
   ```
   https://console.developers.google.com/apis/library/storage-api.googleapis.com
   ```
   
2. **BigQuery API**
   ```
   https://console.developers.google.com/apis/library/bigquery.googleapis.com
   ```

3. **Cloud Pub/Sub API**
   ```
   https://console.developers.google.com/apis/library/pubsub.googleapis.com
   ```

4. **Vertex AI API** (للـ Gemini)
   ```
   https://console.developers.google.com/apis/library/aiplatform.googleapis.com
   ```

### خطوات التفعيل:
- اضغط على كل رابط
- اضغط **Enable** أو **Activate**
- انتظر التفعيل (قد يستغرق بضع ثوانٍ)

---

## 🧪 الخطوة 3️⃣: اختبار الاتصال

### اختبار البيئة (بدون مفتاح):
```bash
node scripts/test-google-cloud-env.js
```

### اختبار الاتصال الحقيقي (مع مفتاح):
بعد إضافة `service-account-key.json`:

```bash
node lib/google-cloud-connection.js
```

**النتيجة المتوقعة:**
```
🚀 بسم الله.. اختبار الاتصال بـ Google Cloud

✅ Cloud Storage: متصل
   - عدد السلال: 5
   - المساحة المستخدمة: 2.3 GB

✅ BigQuery: متصل
   - عدد مجموعات البيانات: 10
   - عدد الجداول: 47

✅ Pub/Sub: متصل
   - عدد المواضيع: 3
   - عدد الاشتراكات: 8

⏱️ وقت الاختبار: 2.5s
```

---

## 🚀 الخطوة 4️⃣: تشغيل الخادم

### بدء الخادم:
```bash
npm start
```

**النتيجة:**
```
🚀 Server running on http://localhost:8080
📡 Google Cloud Integration: Active
✅ Storage: Connected
✅ BigQuery: Connected
✅ Pub/Sub: Connected
```

### مع auto-reload (للتطوير):
```bash
npm run dev
```

---

## 📚 استخدام APIs

### مثال 1: حفظ ملف في Cloud Storage
```javascript
const sheikhaCloud = require('./lib/google-cloud-connection');

app.post('/api/upload', async (req, res) => {
    try {
        const bucket = sheikhaCloud.getStorage().bucket('sheikha-marketplace');
        const file = bucket.file('documents/invoice.pdf');
        
        await file.save(req.body);
        res.json({ success: true, url: file.publicUrl() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### مثال 2: الاستعلام من BigQuery
```javascript
const sheikhaCloud = require('./lib/google-cloud-connection');

app.get('/api/market-stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                gold_price,
                silver_price,
                copper_price,
                timestamp
            FROM sheikha.market_prices
            ORDER BY timestamp DESC
            LIMIT 100
        `;
        
        const [rows] = await sheikhaCloud.getBigQuery()
            .query({ query });
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### مثال 3: نشر رسالة في Pub/Sub
```javascript
const sheikhaCloud = require('./lib/google-cloud-connection');

app.post('/api/broadcast-price', async (req, res) => {
    try {
        const topic = sheikhaCloud.getPubSub()
            .topic('market-price-updates');
        
        const message = JSON.stringify({
            gold: req.body.gold_price,
            silver: req.body.silver_price,
            timestamp: new Date()
        });
        
        const messageId = await topic.publish(message);
        res.json({ success: true, messageId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 🔒 أمان وأفضل الممارسات

### ✅ يجب القيام به:
1. **حماية ملف المفتاح:**
   - لا تضعه في Git
   - وضعه في `.gitignore` (موجود بالفعل)
   - قم بتعيين الصلاحيات: `chmod 600 service-account-key.json`

2. **استخدام متغيرات البيئة:**
   ```javascript
   const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
       || './service-account-key.json';
   ```

3. **تسجيل الأخطاء:**
   ```javascript
   if (!fs.existsSync(keyPath)) {
       logger.warn('Google Cloud credentials not found');
   }
   ```

### ❌ يجب تجنبه:
- ❌ لا تشارك ملف المفتاح
- ❌ لا تضعه في رسالتك البريدية
- ❌ لا تاركه في السجلات (logs)
- ❌ لا تضعه في GitHub (مخزن عام)

---

## 🐛 استكشاف الأخطاء

### خطأ: "service-account-key.json not found"
```
✅ الحل: ضع ملف service-account-key.json في جذر المشروع
```

### خطأ: "Permission denied"
```
✅ الحل: تأكد من أن حساب الخدمة له الصلاحيات:
   - roles/storage.admin (للـ Cloud Storage)
   - roles/bigquery.admin (للـ BigQuery)
   - roles/pubsub.editor (للـ Pub/Sub)
   - roles/aiplatform.admin (للـ Vertex AI)
```

### خطأ: "API not enabled"
```
✅ الحل: عد إلى الخطوة 2️⃣ وفعّل الـ APIs المطلوبة
```

### خطأ: "Network timeout"
```
✅ الحل: تحقق من اتصال الإنترنت والجدار الناري (firewall)
```

---

## 📊 المراقبة والسجلات

### عرض سجلات Google Cloud:
```bash
# في Google Cloud Console:
# Logging → Logs Explorer
# Filter:
# resource.type="service_account"
# resource.labels.service_account_id="market@sheikha.top"
```

### إضافة مراقبة في التطبيق:
```javascript
const logger = require('./lib/logger');

app.use((req, res, next) => {
    logger.info('Google Cloud API Call', {
        method: req.method,
        path: req.path,
        timestamp: new Date(),
        service: req.query.service || 'unknown'
    });
    next();
});
```

---

## 🎯 الخطوات التالية

- [ ] احصل على ملف service-account-key.json من Google Cloud
- [ ] ضعه في جذر المشروع
- [ ] فعّل الـ APIs المطلوبة
- [ ] شغّل اختبار الاتصال: `node lib/google-cloud-connection.js`
- [ ] بدّئ الخادم: `npm start`
- [ ] اختبر الـ APIs من خلال Postman أو curl

---

## 📞 الدعم والمساعدة

**البريد:** market@sheikha.top  
**الدومين:** sheikha.top  
**المشروع:** Sheikha Marketplace  
**بسم الله الرحمن الرحيم** 🕌

---

*آخر تحديث: 10 مارس 2026*
