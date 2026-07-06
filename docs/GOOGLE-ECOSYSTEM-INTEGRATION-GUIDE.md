# 🌍 دليل تكامل منظومة Google الشاملة

**التاريخ**: 19 مايو 2026
**الحالة**: ✅ **جاهز للتفعيل الفوري**
**الإصدار**: 1.0.0

---

## 📋 المحتويات

1. [الخدمات المتكاملة](#الخدمات-المتكاملة)
2. [التثبيت والإعداد](#التثبيت-والإعداد)
3. [دليل الاستخدام](#دليل-الاستخدام)
4. [أمثلة عملية](#أمثلة-عملية)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 الخدمات المتكاملة

### 1️⃣ **Google OAuth 2.0** - تسجيل الدخول الآمن
- ✅ تسجيل دخول بنقرة واحدة
- ✅ إنشاء حسابات تلقائية
- ✅ ربط الحسابات الموجودة
- ✅ إدارة الجلسات الآمنة

### 2️⃣ **Google Cloud Storage** - تخزين الملفات
- ✅ رفع/تحميل/حذف الملفات
- ✅ نسخ احتياطية تلقائية
- ✅ روابط موقتة آمنة
- ✅ إدارة الأمان والأذونات

### 3️⃣ **Firebase** - قاعدة بيانات فورية
- ✅ مزامنة البيانات الحقيقية
- ✅ إشعارات Push عبر FCM
- ✅ اشتراكات المجموعات
- ✅ تخزين البيانات المرن

### 4️⃣ **Google Maps** - الخرائط والموقع
- ✅ البحث الجغرافي (Geocoding)
- ✅ البحث العكسي (Reverse Geocoding)
- ✅ حساب المسافات والمسارات
- ✅ البحث عن الأماكن القريبة

### 5️⃣ **Google Pay** - معالجة الدفع
- ✅ الدفع الآمن عبر المحافظ الرقمية
- ✅ معالجة رسوم التحويل
- ✅ تسجيل المعاملات
- ✅ استكشاف الأخطاء والرجوع

### 6️⃣ **Google Analytics 4** - التحليلات
- ✅ تتبع سلوك المستخدمين
- ✅ تحليل الصفحات الأكثر زيارة
- ✅ معدل التحويل والمبيعات
- ✅ معلومات ديمغرافية المستخدمين

### 7️⃣ **Google Workspace** - التعاون (اختياري)
- ✅ إدارة البريد الموحدة
- ✅ التقويم المشترك
- ✅ مشاركة المستندات

---

## 🛠️ التثبيت والإعداد

### الخطوة 1: تثبيت المكتبات المطلوبة

```bash
# Google Cloud
composer require google/cloud-storage
composer require kreait/firebase-php

# Google Maps
composer require googlemaps/google-maps-services-php

# Google Analytics
composer require google/analytics-data

# Stripe (شريك Google Pay)
composer require stripe/stripe-php

# SendGrid (شريك البريد)
composer require sendgrid/sendgrid
```

### الخطوة 2: إعداد Google Cloud Console

```bash
# 1. الذهاب إلى: https://console.cloud.google.com
# 2. إنشاء مشروع جديد باسم "Sheikha"
# 3. تفعيل الخدمات التالية:
#    - Google Drive API
#    - Google Cloud Storage API
#    - Google Maps API
#    - Firebase Realtime Database
#    - Google Analytics API
#    - Firebase Cloud Messaging
```

### الخطوة 3: استخراج المفاتيح

```bash
# OAuth Credentials
# - الذهاب إلى: APIs & Services > Credentials
# - إنشاء: OAuth 2.0 Client ID (Web Application)
# - تحميل: JSON وحفظه

# Service Account (للخدمات)
# - إنشاء: Service Account جديد
# - الصلاحيات: Storage Admin, Firebase Admin, Analytics Viewer
# - تحميل: Private Key (JSON)
```

### الخطوة 4: تحديث ملف .env

```bash
# نسخ الملف
cp .env.google-ecosystem.example .env

# ملء القيم من Google Cloud Console
nano .env

# المفاتيح الأساسية:
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CLOUD_STORAGE_BUCKET=sheikha-files
# وغيرها...
```

### الخطوة 5: تشغيل الهجرات

```bash
php artisan migrate
```

---

## 📚 دليل الاستخدام

### 1. تسجيل الدخول عبر Google

**في Blade view:**
```blade
@include('components.google-login-button')
```

**في الـ Route:**
```php
Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
```

### 2. رفع الملفات

**في Controller:**
```php
use App\Services\GoogleCloudStorageService;

$gcsService = app(GoogleCloudStorageService::class);

$result = $gcsService->upload(
    $filePath,
    'products/2026/image.jpg',
    ['category' => 'product', 'user_id' => auth()->id()]
);
```

**الرابط:**
```
POST /files/store
```

### 3. إرسال إشعارات Firebase

**في Controller:**
```php
use App\Services\FirebaseService;

$firebase = app(FirebaseService::class);

$firebase->sendPushNotification(
    $deviceToken,
    ['title' => 'عرض خاص!', 'body' => '20% خصم على المنتجات'],
    ['product_id' => 123]
);
```

### 4. البحث الجغرافي

**في Controller:**
```php
use App\Services\GoogleMapsService;

$mapsService = app(GoogleMapsService::class);

$result = $mapsService->geocode('الرياض، السعودية');
// ['latitude' => 24.7136, 'longitude' => 46.6753]
```

### 5. معالجة الدفع

**في Controller:**
```php
use App\Services\GooglePayService;

$payService = app(GooglePayService::class);

// إنشاء طلب دفع
$paymentData = $payService->getPaymentDataRequest(1000, 'SAR');

// معالجة رد الاتصال
$transaction = $payService->processPaymentToken($token, $paymentData);
```

### 6. تحليلات المستخدمين

**في Blade:**
```blade
@include('components.ga4-tracker')
```

**تتبع أحداث مخصصة:**
```javascript
trackEvent('product_view', {
    product_id: 123,
    product_name: 'منتج مميز',
    price: 500
});
```

---

## 💡 أمثلة عملية

### مثال 1: تسجيل دخول + إرسال ترحيب

```php
// في GoogleAuthController@handleGoogleCallback

$user = User::updateOrCreate(
    ['email' => $googleUser->getEmail()],
    ['name' => $googleUser->getName()]
);

// إرسال ترحيب عبر Firebase
$firebase->sendPushNotification(
    $user->device_token,
    ['title' => 'مرحباً!', 'body' => 'أهلاً وسهلاً بك في سوق شيخة'],
    ['user_id' => $user->id]
);

Auth::login($user);
return redirect()->route('dashboard');
```

### مثال 2: نسخ احتياطي يومي

```php
// في Scheduled Task

\App\Models\Backup::create([
    'filename' => 'backup_' . now()->format('Y-m-d-His') . '.tar.gz',
    'status' => 'pending',
]);

$gcsService = app(GoogleCloudStorageService::class);
$gcsService->backupDirectory(
    storage_path('app/important'),
    'backups/' . now()->format('Y-m-d') . '/'
);
```

### مثال 3: تتبع مبيعات المنتجات

```javascript
// عند الشراء الناجح
document.dispatchEvent(new CustomEvent('purchase', {
    detail: {
        transactionId: 'TXN-12345',
        total: 1500,
        items: [
            {product_id: 1, name: 'ذهب', quantity: 10}
        ]
    }
}));

// سيتم تتبعه تلقائياً في GA4
```

---

## 🔧 استكشاف الأخطاء

### خطأ: "Invalid API Key"
```
الحل:
1. تحقق من GOOGLE_MAPS_API_KEY في .env
2. تأكد من تفعيل Google Maps API
3. تحقق من تقييدات المفتاح
```

### خطأ: "Permission Denied" في GCS
```
الحل:
1. تحقق من صلاحيات Service Account
2. تأكد من وجود الـ bucket
3. أضف صلاحيات Storage Admin
```

### خطأ: Firebase Connection Failed
```
الحل:
1. تحقق من FIREBASE_DATABASE_URI
2. تأكد من ملف firebase.json
3. تحقق من اتصال الإنترنت
```

---

## 📊 المراقبة والإحصائيات

### عرض التحليلات

```php
$analytics = app(GoogleAnalyticsService::class);

// تقرير اليوم
$daily = $analytics->getDailyReport(30);

// أهم الصفحات
$topPages = $analytics->getTopPages(10);

// معدل التحويل
$conversion = $analytics->getConversionRate();
```

### الروابط المهمة

- 📊 **Grafana Dashboard**: http://localhost:3000
- 📈 **Google Analytics**: https://analytics.google.com
- 🗂️ **Google Cloud Console**: https://console.cloud.google.com
- 🔥 **Firebase Console**: https://firebase.google.com

---

## 🚀 الخطوات التالية

- [ ] إنشاء لوحة تحكم للتحليلات
- [ ] إضافة نسخ احتياطية يومية تلقائية
- [ ] تفعيل اشتراكات Firebase
- [ ] إعداد تنبيهات Google Analytics
- [ ] دمج Google Workspace (اختياري)

---

**تم إعداد دليل التكامل بنجاح! جميع الخدمات جاهزة للعمل الفوري.** ✅
