# بسم الله الرحمن الرحيم

# دليل التفعيل السريع — محركات Google
# Quick Activation Guide — Google Engines

## 🎯 الهدف
تفعيل جميع محركات Google (8 محركات) للتكامل الكامل مع منظومة شيخة.

## 📊 الوضع الحالي
- **✅ مفعل بالكامل:** 0/8 (0%)
- **🟡 مفعل جزئياً:** 2/8 (25%)
- **❌ غير مفعل:** 6/8 (75%)
- **📈 نسبة التفعيل الإجمالية:** 12.5%

---

## 🚀 خطوات التفعيل السريعة

### الخطوة 1: إنشاء Google Cloud Project (15 دقيقة)

1. **اذهب إلى:** https://console.cloud.google.com
2. **أنشئ مشروعاً جديداً:**
   - اسم المشروع: `Sheikha Marketplace`
   - Project ID: `sheikha-marketplace` (أو اختر ID متاح)
3. **فعّل Billing:**
   - يمكنك استخدام Free Tier ($300 credit لأول 90 يوم)
   - أضف طريقة دفع (فيزا/ماستركارد)

### الخطوة 2: تفعيل Google APIs (20 دقيقة)

اذهب إلى: **APIs & Services > Library** وفعّل:

#### أساسية (مطلوبة):
- ✅ **Vertex AI API** (للذكاء الاصطناعي)
- ✅ **Cloud Run API** (لنشر التطبيقات)
- ✅ **BigQuery API** (للتحليلات)
- ✅ **Cloud Storage API** (للتخزين)
- ✅ **Cloud Functions API** (للوظائف الخفيفة)
- ✅ **Maps JavaScript API** (للخرائط)
- ✅ **Geocoding API** (للمواقع)
- ✅ **Places API** (للأماكن)

#### إضافية (موصى بها):
- ✅ **Generative Language API** (Gemini Pro)
- ✅ **Google Analytics Data API**
- ✅ **Gmail API**
- ✅ **Google Pay API**

### الخطوة 3: إنشاء OAuth 2.0 Credentials (15 دقيقة)

1. **اذهب إلى:** APIs & Services > Credentials
2. **أنشئ OAuth 2.0 Client ID:**
   - انقر: **Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Sheikha Marketplace Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:8080
     https://sheikha.top
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8080/api/auth/google/callback
     https://sheikha.top/api/auth/google/callback
     ```
3. **احفظ:**
   - `Client ID` (ينتهي بـ `.apps.googleusercontent.com`)
   - `Client Secret` (سر - لا تشاركه)

### الخطوة 4: إنشاء API Keys (10 دقائق)

في نفس الصفحة (Credentials):

1. **API Key للخرائط (Maps):**
   - انقر: **Create Credentials > API Key**
   - اسم: `Sheikha Maps Key`
   - Restrict key > API restrictions > Select APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API
   - احفظ المفتاح

2. **API Key للذكاء الاصطناعي (Gemini):**
   - اذهب إلى: https://makersuite.google.com/app/apikey
   - أنشئ API Key جديد
   - احفظ المفتاح

### الخطوة 5: إنشاء Service Account (15 دقيقة)

1. **اذهب إلى:** IAM & Admin > Service Accounts
2. **أنشئ Service Account:**
   - Name: `sheikha-service-account`
   - Role: **Owner** (أو Project Editor)
3. **أنشئ JSON Key:**
   - انقر على الـ Service Account
   - Keys > Add Key > Create new key
   - Type: **JSON**
   - سيتم تحميل ملف `sheikha-marketplace-xxxxx.json`
4. **احفظ الملف بأمان:**
   ```bash
   mkdir -p credentials
   mv ~/Downloads/sheikha-marketplace-*.json credentials/google-service-account.json
   chmod 600 credentials/google-service-account.json
   ```

### الخطوة 6: إعداد Google Analytics (10 دقيقة)

1. **اذهب إلى:** https://analytics.google.com
2. **أنشئ حساباً جديداً:**
   - Account name: `Sheikha Marketplace`
   - Property name: `Sheikha Website`
   - Time zone: `Riyadh`
3. **أنشئ Data Stream:**
   - Platform: **Web**
   - Website URL: `https://sheikha.top`
   - Stream name: `Sheikha Main`
4. **احفظ Measurement ID:**
   - يبدأ بـ `G-XXXXXXXXXX`

### الخطوة 7: تحديث ملف .env (5 دقائق)

انسخ `.env.example` إلى `.env` وعدّل:

```bash
cp .env.example .env
nano .env  # أو استخدم أي محرر نصوص
```

أضف القيم:

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Google Cloud
GOOGLE_CLOUD_PROJECT=sheikha-marketplace
GOOGLE_APPLICATION_CREDENTIALS=/workspaces/sheikha/sheikha-main-portal/credentials/google-service-account.json

# Google Gemini AI
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_PROJECT_ID=sheikha-marketplace

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYY

# Google Analytics 4
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

احفظ وأغلق.

### الخطوة 8: اختبار التكامل (10 دقائق)

1. **أعد تشغيل السيرفر:**
   ```bash
   npm restart
   ```

2. **شغّل اختبار التفعيل:**
   ```bash
   node scripts/activate-google-engines.js
   ```

3. **يجب أن ترى:**
   ```
   ✅ مفعل بالكامل: 8
   🟡 مفعل جزئياً: 0
   ❌ غير مفعل: 0
   📈 نسبة التفعيل: 100%
   ```

4. **اختبر تسجيل الدخول بـ Google:**
   ```bash
   # افتح المتصفح:
   http://localhost:8080/تسجيل-الدخول.html
   
   # انقر على "تسجيل الدخول بحساب Google"
   ```

5. **اختبر Google Maps:**
   ```bash
   # افتح:
   http://localhost:8080/سوق-شيخة.html
   
   # يجب أن تظهر الخريطة بالمواقع
   ```

---

## 🔧 استكشاف الأخطاء

### 1. Error: "invalid_client"
**السبب:** Client ID أو Secret خاطئ  
**الحل:**
```bash
# تحقق من القيم في .env
cat .env | grep GOOGLE_CLIENT

# تأكد من أنها متطابقة تماماً مع Google Console
```

### 2. Error: "API not enabled"
**السبب:** API غير مفعل في Google Cloud  
**الحل:**
- اذهب إلى: https://console.cloud.google.com/apis/library
- ابحث عن الـ API المطلوب
- انقر "Enable"

### 3. Error: "Project not found"
**السبب:** GOOGLE_CLOUD_PROJECT خاطئ  
**الحل:**
```bash
# تحقق من Project ID:
cat .env | grep GOOGLE_CLOUD_PROJECT

# يجب أن يكون نفس ID في Google Console
```

### 4. Error: "Service account key not found"
**السبب:** مسار ملف JSON خاطئ  
**الحل:**
```bash
# تحقق من المسار:
ls -la credentials/google-service-account.json

# تحديث GOOGLE_APPLICATION_CREDENTIALS في .env
```

---

## 📋 قائمة التحقق النهائية

قبل الانتقال للإنتاج، تأكد من:

- [ ] ✅ كل 8 محركات مفعلة بالكامل (100%)
- [ ] ✅ تسجيل الدخول بـ Google يعمل
- [ ] ✅ Google Maps تظهر على الموقع
- [ ] ✅ Gemini AI تستجيب للاستفسارات الشرعية
- [ ] ✅ Google Analytics تسجّل الزيارات
- [ ] ✅ Service Account له الصلاحيات المطلوبة
- [ ] ✅ ملف .env محفوظ بأمان (chmod 600)
- [ ] ✅ credentials/ مضاف إلى .gitignore
- [ ] ✅ Billing مفعّل في Google Cloud
- [ ] ✅ Alerts مضبوط للتنبيه عند تجاوز الحد (Budget alerts)

---

## 💰 التكلفة المتوقعة

### Free Tier (أول 90 يوم):
- **Credit:** $300 مجاناً
- **يكفي لـ:** ~3-6 أشهر من الاختبار والتطوير

### بعد Free Tier (تقديري):
- **Compute (Cloud Run):** $20-50/شهر
- **Storage (Cloud Storage):** $5-15/شهر
- **AI (Vertex AI / Gemini):** $50-200/شهر (حسب الاستخدام)
- **Maps:** $0-100/شهر (25,000 load مجاناً/شهر)
- **BigQuery:** $10-50/شهر
- **Analytics:** مجاناً
- **الإجمالي المتوقع:** $100-400/شهر

### نصائح لتوفير التكلفة:
1. استخدم **Auto-scaling** — لا تشغّل سيرفرات غير مستخدمة
2. استخدم **Caching** (Redis) — قلل استدعاءات الـ APIs
3. استخدم **Budget Alerts** — راقب الإنفاق يومياً
4. استخدم **Reserved Instances** للـ production (خصم 30-70%)

---

## 📚 الموارد المفيدة

### الوثائق الرسمية:
- **Google Cloud:** https://cloud.google.com/docs
- **Gemini API:** https://ai.google.dev/docs
- **Google Maps:** https://developers.google.com/maps/documentation
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2

### الأدلة الإرشادية:
- **Get Started with Google Cloud:** https://cloud.google.com/docs/get-started
- **Gemini for Developers:** https://ai.google.dev/tutorials
- **OAuth 2.0 Playground:** https://developers.google.com/oauthplayground

### الدعم:
- **Google Cloud Support:** https://cloud.google.com/support
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/google-cloud-platform
- **دعم شيخة:** market@sheikha.top

---

## 🎉 التهاني!

بمجرد إكمال كل الخطوات:
- ✅ **8/8 محركات Google مفعلة بالكامل**
- ✅ **تكامل كامل ومتقن مع منظومة شيخة**
- ✅ **جاهز للإنتاج والإطلاق العام**

**"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"** — التوبة:105

---

**والحمد لله رب العالمين**  
**منظومة شيخة — sheikha.top**
