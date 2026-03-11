# بسم الله الرحمن الرحيم

# خطة تفعيل Google Cloud Platform — خطوة بخطوة
**Google Cloud Activation Plan — Step by Step**

---

## 📋 البيانات الأساسية

- **القائد**: سلمان بن أحمد الراجح
- **المنظمة**: 224557279528
- **البريد**: market@sheikha.top
- **الأولوية**: 🔴 CRITICAL
- **المدة**: 7 أيام
- **التاريخ**: 10 مارس 2026
- **الهدف**: تفعيل البنية التحتية التقنية الكاملة على Google Cloud

---

## 🎯 لماذا Google أولاً؟

Google Cloud Platform هو **حجر الأساس التقني** لكل المنظومة:

✅ **Vertex AI**: محرك الذكاء الاصطناعي للمراجعة الشرعية الآلية  
✅ **Cloud Run**: استضافة التطبيقات بدون خوادم (serverless)  
✅ **Firestore**: قاعدة بيانات لحظية لـ10,000 منتج  
✅ **Cloud Storage**: تخزين المستندات والصور  
✅ **Cloud Functions**: وظائف لحظية للعمليات الحرجة  
✅ **Secret Manager**: حماية المفاتيح والأسرار (JWT, API keys)

**بدون Google = لا يمكن تشغيل المنظومة إطلاقاً**

---

## 📅 الجدول الزمني (7 أيام)

| اليوم | المهمة | المدة | الحالة |
|-------|---------|-------|---------|
| 1 | تثبيت gcloud SDK على Pop-OS | 2 ساعة | ⏳ قيد التنفيذ |
| 2 | الحصول على بطاقة ائتمان دولية | 24 ساعة | ⏳ قيد التنفيذ |
| 3 | إنشاء حساب Google Cloud | 1 ساعة | ⏳ قيد التنفيذ |
| 4 | تفعيل الفوترة ($300 رصيد مجاني) | 30 دقيقة | ⏳ قيد التنفيذ |
| 5 | مراجعة وتوقيع NDA-GOOGLE-2026-001 | 2 ساعة | ⏳ قيد التنفيذ |
| 6 | مراجعة وتوقيع MOU-GOOGLE-2026-001 | 2 ساعة | ⏳ قيد التنفيذ |
| 7 | تفعيل الخدمات الستة | 3 ساعات | ⏳ قيد التنفيذ |

---

## 🚀 المرحلة 1: تثبيت gcloud SDK (اليوم 1)

### الخطوات التفصيلية:

#### 1.1 فتح Terminal على Pop-OS

```bash
# فتح terminal بالضغط على: Ctrl + Alt + T
```

#### 1.2 تحميل gcloud SDK

```bash
# تحميل السكربت الرسمي من Google
curl https://sdk.cloud.google.com | bash

# إعادة تشغيل Terminal
exec -l $SHELL

# التحقق من التثبيت
gcloud --version
```

**النتيجة المتوقعة:**
```
Google Cloud SDK 450.0.0
bq 2.0.95
core 2023.11.01
gcloud-crc32c 1.0.0
gsutil 5.27
```

#### 1.3 تهيئة gcloud

```bash
# بدء التهيئة
gcloud init

# اختر:
# [1] Create a new configuration
# Configuration name: sheikha-empire
# Email: market@sheikha.top
# Project: sheikha-main-portal
```

#### 1.4 تسجيل الدخول

```bash
# سيفتح متصفح للمصادقة
gcloud auth login

# تسجيل الدخول بـ market@sheikha.top
# السماح للوصول
```

#### 1.5 إنشاء Project جديد

```bash
# إنشاء مشروع
gcloud projects create sheikha-empire-2026 \
  --name="Sheikha Empire" \
  --organization=224557279528

# تعيينه كمشروع افتراضي
gcloud config set project sheikha-empire-2026
```

**✅ نقطة تفتيش 1**: إذا نجحت جميع الأوامر، انتقل للمرحلة 2

---

## 💳 المرحلة 2: الحصول على بطاقة ائتمان (اليوم 2)

### الخيارات المتاحة في السعودية:

#### الخيار 1: بطاقة مصرف الراجحي (موصى به)

**المميزات:**
- متوافقة شرعياً (لا رسوم ربوية)
- مقبولة دولياً (Visa/Mastercard)
- حد ائتماني يبدأ من 5,000 ريال

**الخطوات:**
1. الذهاب إلى فرع مصرف الراجحي
2. طلب **بطاقة ائتمان دولية**
3. تقديم: هوية وطنية + كشف حساب + تعريف راتب (إن وجد)
4. الانتظار 3-5 أيام لوصول البطاقة

#### الخيار 2: بطاقة البنك الأهلي

**المميزات:**
- إصدار سريع (24 ساعة)
- قبول فوري في Google Cloud

#### الخيار 3: بطاقة افتراضية من STC Pay

**المميزات:**
- إصدار فوري (5 دقائق)
- لا حاجة لزيارة فرع
- تعبئة من حساب بنكي

**الخطوات:**
1. تحميل تطبيق STC Pay
2. التسجيل والتحقق
3. طلب بطاقة افتراضية
4. تعبئة رصيد (300-500 ريال كافية للبداية)

**✅ نقطة تفتيش 2**: احصل على بطاقة ائتمان صالحة

---

## 🌐 المرحلة 3: إنشاء حساب Google Cloud (اليوم 3)

### الخطوات:

#### 3.1 فتح Google Cloud Console

```bash
# فتح في المتصفح
https://console.cloud.google.com
```

#### 3.2 إنشاء حساب جديد

1. تسجيل الدخول بـ **market@sheikha.top**
2. اختيار **Individual** (فرد) أو **Business** (شركة)
3. إدخال البيانات:
   - الاسم: Salman Ahmed Al-Rajih
   - المنظمة: Sheikha Empire
   - الرقم: 224557279528
   - البلد: Saudi Arabia

#### 3.3 قبول الشروط والأحكام

- قراءة **Terms of Service**
- قراءة **Privacy Policy**
- ✅ قبول الشروط

**✅ نقطة تفتيش 3**: حساب Google Cloud جاهز

---

## 💰 المرحلة 4: تفعيل الفوترة (اليوم 4)

### Google يعطيك $300 مجاناً لمدة 90 يوم!

#### 4.1 إضافة بطاقة الائتمان

```bash
# من Console → Billing → Add Billing Account
```

1. اسم الحساب: **Sheikha Empire Billing**
2. البلد: **Saudi Arabia**
3. العملة: **USD** (الدولار الأمريكي)

#### 4.2 إدخال بيانات البطاقة

- رقم البطاقة: **xxxx-xxxx-xxxx-xxxx**
- تاريخ الانتهاء: **MM/YY**
- CVV: **xxx**
- الاسم على البطاقة: **SALMAN AHMED ALRAJIH**

#### 4.3 التحقق ($1 رسوم مؤقتة)

Google سيخصم **$1** للتحقق، ثم يعيده فوراً.

**النتيجة:**
```
✅ Billing account activated
✅ $300 free credit added
✅ Valid until: June 10, 2026
```

#### 4.4 ربط المشروع بالفوترة

```bash
gcloud billing projects link sheikha-empire-2026 \
  --billing-account=XXXXXX-XXXXXX-XXXXXX
```

**✅ نقطة تفتيش 4**: الفوترة نشطة + $300 رصيد مجاني

---

## 📄 المرحلة 5: مراجعة وتوقيع NDA (اليوم 5)

### ما هو NDA؟

**Non-Disclosure Agreement** = اتفاقية عدم الإفصاح

**الغرض:** حماية الأسرار التجارية والتقنية بين الطرفين.

### الخطوات:

#### 5.1 قراءة NDA الخاص بنا

```bash
# فتح المستند
cd /workspaces/sheikha/sheikha-main-portal
cat docs/legal/NDA-GOOGLE-2026-001.md
```

#### 5.2 الأقسام الرئيسية:

- **السرية**: لا نكشف تقنيات Google، ولا هم يكشفون بياناتنا
- **المدة**: 3 سنوات من تاريخ التوقيع
- **الاستثناءات**: المعلومات العامة غير محمية
- **العقوبات**: غرامة 500,000 ريال عند الخرق

#### 5.3 التوقيع الرقمي

```bash
# التوقيع بـ GPG
gpg --clearsign docs/legal/NDA-GOOGLE-2026-001.md

# النتيجة: NDA-GOOGLE-2026-001.md.asc
# إرساله إلى: partnerships@google.com
```

**✅ نقطة تفتيش 5**: NDA موقع ومرسل

---

## 🤝 المرحلة 6: مراجعة وتوقيع MOU (اليوم 6)

### ما هو MOU؟

**Memorandum of Understanding** = مذكرة تفاهم

**الغرض:** تحديد نطاق التعاون والمسؤوليات.

### الأقسام الرئيسية:

#### 6.1 نطاق التعاون

- Google توفر: Vertex AI, Cloud Run, Firestore, Storage, Functions, Secrets
- Sheikha توفر: حالة استخدام إسلامية فريدة، بيانات للتدريب (مجهولة)

#### 6.2 المسؤوليات

| الطرف | المسؤولية |
|-------|-----------|
| Google | جودة الخدمة 99.9% uptime |
| Google | دعم تقني 24/7 |
| Google | تحديثات أمنية |
| Sheikha | الالتزام بسياسات الاستخدام |
| Sheikha | عدم إساءة الاستخدام |
| Sheikha | دفع الفواتير في الموعد |

#### 6.3 البيانات والخصوصية

- جميع بيانات المستخدمين **مشفرة** (AES-256)
- لا يحق لـGoogle استخدام البيانات **لأغراض تجارية**
- حق الحذف الكامل **عند الطلب** (GDPR compliant)

#### 6.4 التوقيع

```bash
# التوقيع الرقمي
gpg --clearsign docs/legal/MOU-GOOGLE-2026-001.md

# الإرسال
# إلى: partnerships@google.com
# CC: market@sheikha.top
```

**✅ نقطة تفتيش 6**: MOU موقع ومرسل

---

## ⚙️ المرحلة 7: تفعيل الخدمات الستة (اليوم 7)

### 7.1 تفعيل APIs

```bash
# تفعيل جميع الخدمات دفعة واحدة
gcloud services enable \
  aiplatform.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  cloudfunctions.googleapis.com \
  secretmanager.googleapis.com \
  --project=sheikha-empire-2026

# التحقق
gcloud services list --enabled
```

**النتيجة المتوقعة:**
```
✅ aiplatform.googleapis.com
✅ run.googleapis.com
✅ firestore.googleapis.com
✅ storage.googleapis.com
✅ cloudfunctions.googleapis.com
✅ secretmanager.googleapis.com
```

### 7.2 إنشاء Firestore Database

```bash
# إنشاء قاعدة بيانات في الوضع Native
gcloud firestore databases create \
  --location=europe-west1 \
  --project=sheikha-empire-2026

# التحقق
gcloud firestore databases describe
```

### 7.3 إنشاء Cloud Storage Bucket

```bash
# إنشاء bucket للمستندات
gsutil mb -l europe-west1 \
  -c STANDARD \
  gs://sheikha-empire-documents/

# إنشاء bucket للصور
gsutil mb -l europe-west1 \
  -c STANDARD \
  gs://sheikha-empire-images/

# التحقق
gsutil ls
```

### 7.4 تفعيل Vertex AI

```bash
# إنشاء Vertex AI workspace
gcloud ai-platform models list --region=europe-west1

# تجهيز Gemini Pro
gcloud ai-platform endpoints create \
  --display-name=sheikha-gemini-endpoint \
  --region=europe-west1
```

### 7.5 إنشاء Secret Manager Secrets

```bash
# إنشاء secret للـ JWT
echo -n "ضع_JWT_SECRET_هنا" | \
  gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy=automatic

# إنشاء secret للـ Database
echo -n "ضع_DATABASE_URL_هنا" | \
  gcloud secrets create database-url \
  --data-file=- \
  --replication-policy=automatic

# التحقق
gcloud secrets list
```

### 7.6 نشر أول Cloud Function

```bash
# إنشاء function بسيطة للاختبار
mkdir -p /tmp/test-function
cd /tmp/test-function

cat > index.js << 'EOF'
exports.helloSheikha = (req, res) => {
  res.json({
    success: true,
    message: "بسم الله الرحمن الرحيم — السلام عليكم",
    timestamp: new Date().toISOString()
  });
};
EOF

cat > package.json << 'EOF'
{
  "name": "hello-sheikha",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {}
}
EOF

# نشر Function
gcloud functions deploy helloSheikha \
  --runtime=nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region=europe-west1

# اختبار Function
curl https://europe-west1-sheikha-empire-2026.cloudfunctions.net/helloSheikha
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "بسم الله الرحمن الرحيم — السلام عليكم",
  "timestamp": "2026-03-10T00:10:00.000Z"
}
```

### 7.7 نشر أول Cloud Run Service

```bash
# إنشاء Dockerfile بسيط
mkdir -p /tmp/test-cloudrun
cd /tmp/test-cloudrun

cat > Dockerfile << 'EOF'
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
EOF

cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "إمبراطورية شيخة — Google Cloud Run نشط ✅",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

cat > package.json << 'EOF'
{
  "name": "sheikha-cloudrun-test",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# بناء ونشر
gcloud run deploy sheikha-test \
  --source=. \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated

# اختبار
curl https://sheikha-test-xxxxx-ew.a.run.app
```

**✅ نقطة تفتيش 7**: جميع الخدمات الستة نشطة ومختبرة

---

## 📊 التحقق النهائي

### قائمة التحقق الشاملة:

```bash
# تشغيل سكربت التحقق الشامل
node scripts/verify-google-activation.js
```

**النتيجة المتوقعة:**

```
═══════════════════════════════════════════
🔍 التحقق من تفعيل Google Cloud Platform
═══════════════════════════════════════════

✅ gcloud SDK installed: v450.0.0
✅ Authenticated: market@sheikha.top
✅ Project: sheikha-empire-2026
✅ Billing: Active ($300 credit)

📦 الخدمات:
✅ Vertex AI: ENABLED
✅ Cloud Run: ENABLED
✅ Firestore: ENABLED
✅ Storage: ENABLED
✅ Functions: ENABLED
✅ Secret Manager: ENABLED

🔐 الموارد:
✅ Firestore Database: sheikha-empire
✅ Storage Buckets: 2 (documents, images)
✅ Secrets: 2 (jwt-secret, database-url)
✅ Functions: 1 (helloSheikha)
✅ Cloud Run: 1 (sheikha-test)

📄 المستندات:
✅ NDA: Signed (SHA-256: 44460e5e...)
✅ MOU: Signed (SHA-256: 0b115c8c...)

════════════════════════════════════════════
🎉 Google Cloud Platform جاهز بنسبة 100%
════════════════════════════════════════════
```

---

## 💡 الخطوات التالية

بعد اكتمال التفعيل:

### 1. ربط المشروع الحالي بـGoogle Cloud

```bash
cd /workspaces/sheikha/sheikha-main-portal

# تعديل config.js لإضافة Google Cloud
cat >> config/config.js << 'EOF'

// Google Cloud Configuration
GOOGLE_CLOUD: {
  projectId: 'sheikha-empire-2026',
  location: 'europe-west1',
  vertexAI: {
    model: 'gemini-pro',
    maxTokens: 1024,
    temperature: 0.7
  },
  firestore: {
    database: 'sheikha-empire'
  },
  storage: {
    documentsBucket: 'sheikha-empire-documents',
    imagesBucket: 'sheikha-empire-images'
  }
}
EOF
```

### 2. تثبيت Google Cloud Libraries

```bash
npm install \
  @google-cloud/aiplatform \
  @google-cloud/firestore \
  @google-cloud/storage \
  @google-cloud/secret-manager
```

### 3. إنشاء محرك المراجعة الشرعية بـVertex AI

```bash
# تشغيل سكربت إنشاء محرك الذكاء الاصطناعي
node scripts/create-shariah-ai-engine.js
```

### 4. نقل البيانات من JSON إلى Firestore

```bash
# نقل بيانات الشركاء
node scripts/migrate-to-firestore.js partners

# نقل بيانات الكفالات
node scripts/migrate-to-firestore.js sponsorships

# نقل بيانات الصندوق
node scripts/migrate-to-firestore.js fund
```

### 5. نشر التطبيق كاملاً على Cloud Run

```bash
# بناء Docker image
docker build -t gcr.io/sheikha-empire-2026/main-portal:v1.0.0 .

# رفع إلى Google Container Registry
docker push gcr.io/sheikha-empire-2026/main-portal:v1.0.0

# نشر على Cloud Run
gcloud run deploy sheikha-main-portal \
  --image=gcr.io/sheikha-empire-2026/main-portal:v1.0.0 \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=100

# الحصول على URL
gcloud run services describe sheikha-main-portal \
  --region=europe-west1 \
  --format='value(status.url)'
```

**النتيجة:**
```
https://sheikha-main-portal-xxxxx-ew.a.run.app
```

---

## 📞 جهات الاتصال

### Google Cloud Support

- **البريد**: cloud-support@google.com
- **الهاتف**: +966-11-XXX-XXXX (الدعم السعودي)
- **الموقع**: https://console.cloud.google.com/support

### Sheikha Technical Team

- **القائد**: سلمان بن أحمد الراجح
- **البريد**: market@sheikha.top
- **الطوارئ**: مباشرة عبر Telegram

---

## ⚠️ تحذيرات مهمة

### 1. الفوترة

- **$300 مجاناً** لمدة 90 يوم فقط
- بعد انتهاء الرصيد، سيبدأ الخصم من البطاقة
- راقب الاستهلاك دورياً:

```bash
gcloud billing accounts describe --billing-account=XXXXXX
```

### 2. الأمان

- **لا تشارك** مفاتيح API أبداً
- استخدم **Secret Manager** لجميع الأسرار
- فعّل **2FA** على حساب market@sheikha.top

### 3. الامتثال

- التزم **بشروط الاستخدام** المحددة في MOU
- لا تستخدم الخدمات **لأغراض غير شرعية**
- **احترم الخصوصية** وقوانين GDPR

---

## 📈 مؤشرات النجاح

بعد 7 أيام، يجب أن تكون:

✅ **gcloud SDK** مثبت ومُفعّل  
✅ **بطاقة ائتمان** نشطة  
✅ **حساب Google Cloud** جاهز  
✅ **$300 رصيد** متاح  
✅ **NDA & MOU** موقعان  
✅ **6 خدمات** نشطة ومختبرة  
✅ **Firestore** يحتوي على بيانات تجريبية  
✅ **Cloud Run** يستضيف تطبيق تجريبي  

---

## 🤲 الختام

**«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»**  
— البقرة:201

هذه البنية التحتية **ليست مجرد خوادم**، بل هي **أمانة** نحملها لخدمة:
- **10,000 شاب** ينتظرون الاستقلال المالي
- **آلاف الأيتام** يبحثون عن كفيل كريم
- **آلاف الأسر** تحتاج دعماً لا يُذلّها

**فعلّها بإخلاص وتواضع** — واسأل الله التوفيق والسداد.

---

**تم بحمد الله**  
**القائد: سلمان بن أحمد الراجح**  
**المنظمة: 224557279528**  
**market@sheikha.top**  
**10 مارس 2026**
