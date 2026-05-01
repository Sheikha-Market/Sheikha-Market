# بسم الله الرحمن الرحيم

# خطة النمو والتسويق الأخلاقي — اعتياد الاستخدام
**Ethical Growth & Marketing Plan — Building User Habits**

---

## 📋 البيانات الأساسية

- **القائد**: سلمان بن أحمد الراجح
- **المنظمة**: 224557279528
- **النطاق**: sheikha.top
- **تاريخ الإطلاق**: 10 مارس 2026
- **المرحلة**: Beta (تجريبي محدود)
- **المدة**: 30 يوماً
- **الهدف**: 100 تاجر + 1,000 معاملة

---

## 🎯 أهداف خطة النمو الأخلاقي

### 1. **اعتياد الاستخدام اليومي (Build Daily Habits)**
- جعل شيخة جزءاً من الروتين اليومي للتاجر
- إشعارات ذكية بالأسعار والفرص (بدون إزعاج)
- مكافآت على الاستخدام المستمر (Gamification أخلاقي)
- تجربة مستخدم سلسة تجذب للعودة

### 2. **الثقة والشفافية الكاملة**
- صور حقيقية 100% (استوديو فاخر - بلا أرواح)
- تتبع لحظي للمنتجات (IoT + GPS)
- مراجعة شرعية مرئية لكل معاملة
- سمعة التاجر مبنية على التقييمات الصادقة

### 3. **النمو العضوي المستدام**
- كل مستخدم راضٍ = 3 مستخدمين جدد (Word of Mouth)
- برنامج إحالة مجزي (100 ريال/إحالة)
- شراكات استراتيجية مع الجمعيات التجارية
- محتوى تعليمي يبني السلطة (Authority)

### 4. **التوسع التقني للمطورين**
- **"Sign in with Sheikha"** — OAuth للمطورين
- منصة ربط المشاريع والتقنيات (Developer Platform)
- APIs مفتوحة لربط أي نظام (ERP, AI, IoT)
- نموذج Freemium: مجاناً للبداية، دفع عند النمو

---

## 📅 الجدول الزمني (30 يوماً)

### الأسبوع 1: الإطلاق الناعم (Soft Launch)

**الأيام 1-3: اختبار داخلي**
- ✅ تشغيل الموقع على http://localhost:8080
- ✅ اختبار جميع الصفحات (14 صفحة)
- ✅ التحقق من APIs (200+ endpoint)
- ✅ فحص الأمان والتشفير

**الأيام 4-7: مستخدمون تجريبيون**
- دعوة 10 تجار كبار (خاص بالدعوة)
- مساعدتهم في التسجيل
- متابعة تجربتهم اليومية
- إصلاح أي مشاكل فوراً

### الأسبوع 2: التوسع المحدود (Limited Expansion)

**الأيام 8-14:**
- دعوة 40 تاجر إضافي
- إطلاق حملة تسويقية صغيرة (Instagram + Twitter)
- نشر أول قصة نجاح
- تفعيل خدمة العملاء (WhatsApp)

### الأسبوع 3: الإطلاق العام (Public Beta)

**الأيام 15-21:**
- فتح التسجيل للجميع
- إطلاق حملة إعلانية (Google Ads + Facebook)
- تفعيل برنامج الإحالة (Referral)
- مسابقة للتجار الأوائل

### الأسبوع 4: التقييم والتحسين

**الأيام 22-30:**
- جمع التغذية الراجعة من 100 تاجر
- إصلاح الأخطاء الرئيسية
- تنفيذ التحسينات المطلوبة
- الاستعداد للإطلاق الكامل

---

## 🚀 خطوات الإطلاق الفوري

### 1. تشغيل الموقع (الآن)

```bash
# التأكد من أن المنفذ 8080 متاح
lsof -ti :8080 | xargs kill -9

# تشغيل السيرفر
npm start

# فتح في المتصفح
xdg-open http://localhost:8080
```

**النتيجة المتوقعة:**
```
✅ Server running on http://localhost:8080
✅ Database initialized
✅ Security enabled
✅ APIs ready (200+ endpoints)
```

### 2. اختبار شامل (30 دقيقة)

#### اختبار الصفحات الرئيسية:

| الصفحة | URL | الاختبار | الحالة |
|--------|-----|----------|---------|
| الرئيسية | `/` | فتح الصفحة + تحميل البيانات | ⏳ |
| السوق | `/سوق-شيخة.html` | عرض المنتجات + الفلاتر | ⏳ |
| التسجيل | `/تسجيل-الدخول.html` | 5 طرق مصادقة | ⏳ |
| الشركات | `/تسجيل-الشركات.html` | 5 خطوات تسجيل | ⏳ |
| لوحة المستخدم | `/لوحة-تحكم-المستخدم.html` | 15 قسم | ⏳ |
| لوحة الشركة | `/لوحة-الشركة.html` | 10 أقسام | ⏳ |
| الأدمن | `/لوحة-الادمن.html` | إدارة كاملة | ⏳ |
| الشريعة | `/الشريعة-الاسلامية.html` | المرجع + الزكاة | ⏳ |
| المجتمع | `/المجتمع.html` | المنتدى | ⏳ |

#### اختبار APIs الحرجة:

```bash
# اختبار المصادقة
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sheikha.top","password":"test123"}'

# اختبار السوق
curl http://localhost:8080/api/market/listings

# اختبار الزكاة
curl -X POST http://localhost:8080/api/zakah/calculate \
  -H "Content-Type: application/json" \
  -d '{"amount":100000,"type":"gold"}'

# اختبار الشريعة
curl -X POST http://localhost:8080/api/shariah/audit/transaction \
  -H "Content-Type: application/json" \
  -d '{"type":"sale","amount":5000,"details":"test"}'
```

### 3. إنشاء بيانات تجريبية (10 دقائق)

```bash
# تشغيل سكربت البيانات التجريبية
node scripts/seed-beta-data.js
```

**البيانات التجريبية:**
- 20 تاجر تجريبي
- 50 منتج معادن (بصور حقيقية)
- 30 إعلان سكراب
- 10 شركات
- 5 مناقصات (RFQ)

---

## 📸 استوديو الصور الحقيقية للتاجر (فاخر + بلا أرواح)
**Real Product Photography Studio — Ethical & Premium**

### المبدأ الشرعي:
**«لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا... وَلَا يَبِعْ بَعْضُكُمْ عَلَىٰ بَيْعِ بَعْضٍ»**  
— صحيح مسلم

الصورة الحقيقية = الصدق في البيع = البركة

### النظام الداخلي الكامل:

#### 1️⃣ شروط قبول الصور (Auto-Validation)

```javascript
// AI للتحقق من جودة الصورة
const imageValidation = {
  minimumResolution: { width: 1200, height: 800 },
  maximumSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  requiredQuality: {
    sharpness: 85,      // وضوح
    brightness: 60,     // إضاءة مناسبة
    contrast: 70,       // تباين
    realProduct: true   // صورة حقيقية (ليست CGI)
  },
  forbidden: [
    'photoshop_effects',  // مؤثرات فوتوشوب
    'color_manipulation', // تغيير الألوان
    'stock_photo',        // صور جاهزة
    'watermark',          // علامات مائية غير شيخة
    'misleading_angle'    // زاوية خادعة
  ],
  shariahCompliant: {
    noLivingBeings: true,  // بلا أرواح (بشر/حيوانات)
    noProhibited: true,    // لا محرمات
    modestPresentation: true // عرض محتشم
  }
};

// فحص تلقائي عند الرفع
app.post('/api/products/upload-image', upload.single('image'), async (req, res) => {
  const image = req.file;
  const product = req.body;
  
  try {
    // 1. فحص الدقة
    const metadata = await sharp(image.buffer).metadata();
    if (metadata.width < 1200 || metadata.height < 800) {
      return res.status(400).json({
        success: false,
        error: 'الصورة صغيرة جداً',
        required: '1200×800 كحد أدنى',
        current: `${metadata.width}×${metadata.height}`
      });
    }
    
    // 2. فحص الوضوح (Sharpness Detection)
    const sharpness = await detectSharpness(image.buffer);
    if (sharpness < 85) {
      return res.status(400).json({
        success: false,
        error: 'الصورة غير واضحة',
        tip: 'استخدم إضاءة جيدة وكاميرا مستقرة'
      });
    }
    
    // 3. كشف التلاعب (AI-Powered)
    const manipulation = await detectManipulation(image.buffer);
    if (manipulation.detected) {
      return res.status(400).json({
        success: false,
        error: 'تم رفض الصورة',
        reason: 'تم اكتشاف تعديلات غير مسموحة',
        details: manipulation.types, // ['photoshop', 'color_change']
        message: 'نحن نقدّر الصدق — صوّر المنتج كما هو'
      });
    }
    
    // 4. فحص شرعي (كشف الأرواح)
    const shariahCheck = await detectLivingBeings(image.buffer);
    if (shariahCheck.found) {
      return res.status(400).json({
        success: false,
        error: 'الصورة تحتوي على كائنات حية',
        found: shariahCheck.types, // ['person', 'animal']
        message: 'يرجى تصوير المنتج فقط بدون أشخاص أو حيوانات'
      });
    }
    
    // 5. تحسين أمين (بدون خداع)
    const optimized = await optimizeImage(image.buffer, {
      resize: { width: 1200, height: 800, fit: 'inside' },
      format: 'webp',
      quality: 90,
      compress: true,
      watermark: {
        text: 'شيخة | Sheikha',
        position: 'bottom-right',
        opacity: 0.3
      },
      // تحسينات أمينة فقط
      enhance: {
        brightness: 0,    // لا تغيير
        contrast: 0,      // لا تغيير
        saturation: 0,    // لا تغيير
        sharpness: 5      // زيادة طفيفة للوضوح
      }
    });
    
    // 6. حفظ في Cloud Storage
    const imageUrl = await uploadToStorage(optimized, {
      folder: 'products',
      filename: `${product.id}_${Date.now()}.webp`
    });
    
    // 7. ربط تلقائي بالمنتج
    await updateProduct(product.id, {
      images: [imageUrl],
      imageMetadata: {
        uploadedAt: new Date(),
        resolution: `${metadata.width}×${metadata.height}`,
        verified: true,
        shariahCompliant: true
      }
    });
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'تم رفع الصورة بنجاح ✅',
      quality: 'ممتاز — شكراً على الصدق'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 2️⃣ نموذج منتج حقيقي مع IoT

```html
<div class="product-card iot-enabled">
  <div class="product-header">
    <h3>خام حديد عالي الجودة 62% Fe</h3>
    <span class="hs-code">HS 2601.11</span>
    <span class="badge verified">✓ صورة حقيقية</span>
    <span class="badge shariah">✓ متوافق شرعياً</span>
  </div>
  
  <!-- معرض الصور (حقيقية 100%) -->
  <div class="image-gallery">
    <img src="/uploads/products/iron-ore-62fe-1234.webp" 
         alt="خام حديد" 
         class="main-image"
         data-verified="true">
    <div class="image-badge">📸 صورة حقيقية — تم التحقق</div>
  </div>
  
  <!-- معلومات المنتج -->
  <div class="product-info">
    <div class="info-item">
      <i class="icon-location"></i>
      <strong>الموقع:</strong>
      <span>ينبع الصناعية، المستودع رقم 12</span>
      <button class="btn-map" onclick="showMap(24.089, 38.063)">📍 عرض الخريطة</button>
    </div>
    
    <div class="info-item">
      <i class="icon-weight"></i>
      <strong>الكمية:</strong>
      <span>500 طن متري</span>
    </div>
    
    <div class="info-item">
      <i class="icon-quality"></i>
      <strong>المواصفة:</strong>
      <span>نقاء 62% Fe، رطوبة < 8%، كبريت < 0.05%</span>
    </div>
    
    <div class="info-item">
      <i class="icon-barcode"></i>
      <strong>HS Code:</strong>
      <span>2601.11 (خام حديد غير محمّص)</span>
    </div>
  </div>
  
  <!-- تتبع IoT لحظي -->
  <div class="iot-tracking">
    <h4>🛰️ تتبع لحظي (IoT)</h4>
    
    <div class="tracking-status active">
      <i class="icon-signal"></i>
      <span>متصل الآن</span>
    </div>
    
    <div class="tracking-data">
      <div class="data-item">
        <strong>الموقع الحالي:</strong>
        <span class="live-location">24.0890°N, 38.0630°E</span>
        <span class="update-time">تحديث منذ 3 دقائق</span>
      </div>
      
      <div class="data-item">
        <strong>درجة الحرارة:</strong>
        <span class="sensor-temp">28°C</span>
      </div>
      
      <div class="data-item">
        <strong>الرطوبة:</strong>
        <span class="sensor-humidity">7.2%</span>
      </div>
      
      <div class="data-item">
        <strong>تنبيه الحركة:</strong>
        <span class="alert-none">لا يوجد — آمن ✓</span>
      </div>
    </div>
    
    <button class="btn-enable-iot" onclick="enableIoT()">
      <i class="icon-radar"></i>
      تشغيل تتبع IoT المتقدم
    </button>
    
    <p class="iot-note">
      📡 يلزم السماح بالموقع لمطابقة GPS مع إحداثيات المنتج
    </p>
  </div>
  
  <!-- شروط الرفع (للبائع) -->
  <div class="upload-guidelines" style="display:none;">
    <h4>📸 شروط رفع الصور</h4>
    <ul>
      <li>✅ دقة ≥ 1200×800 بكسل</li>
      <li>✅ وضوح كافٍ وإضاءة جيدة</li>
      <li>✅ صورة حقيقية للمنتج (ليست من الإنترنت)</li>
      <li>❌ لا مؤثرات فوتوشوب تغيّر الحقيقة</li>
      <li>❌ لا صور بها أشخاص أو حيوانات (بلا أرواح)</li>
      <li>❌ لا ألوان مُغيّرة أو زوايا خادعة</li>
    </ul>
    <p class="guideline-reason">
      <strong>لماذا؟</strong> الصدق في البيع = البركة في المال
    </p>
  </div>
</div>
```

#### 3️⃣ نموذج رفع صورة (للبائع)

```html
<div class="upload-product-image">
  <h3>رفع صور المنتج</h3>
  
  <div class="upload-zone" id="dropZone">
    <input type="file" 
           id="productImage" 
           accept="image/jpeg,image/png,image/webp"
           multiple
           capture="environment">
    
    <div class="upload-placeholder">
      <i class="icon-camera"></i>
      <p>اسحب الصور هنا أو انقر للتصوير</p>
      <span class="requirements">دقة 1200×800 كحد أدنى</span>
    </div>
  </div>
  
  <!-- معاينة الصورة بعد الرفع -->
  <div class="image-preview" id="imagePreview" style="display:none;">
    <img id="previewImg" src="" alt="معاينة">
    
    <div class="validation-results">
      <div class="check-item resolution">
        <i class="icon-loading"></i>
        <span>فحص الدقة...</span>
      </div>
      <div class="check-item quality">
        <i class="icon-loading"></i>
        <span>فحص الوضوح...</span>
      </div>
      <div class="check-item manipulation">
        <i class="icon-loading"></i>
        <span>كشف التعديلات...</span>
      </div>
      <div class="check-item shariah">
        <i class="icon-loading"></i>
        <span>المراجعة الشرعية...</span>
      </div>
    </div>
    
    <button class="btn-upload" id="btnUpload" disabled>
      <i class="icon-upload"></i>
      رفع الصورة
    </button>
  </div>
</div>

<script>
// JavaScript للتحقق الفوري
document.getElementById('productImage').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // عرض معاينة
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  previewImg.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  
  // فحص الدقة
  const img = new Image();
  img.onload = async () => {
    const checks = {
      resolution: img.width >= 1200 && img.height >= 800,
      size: file.size <= 5 * 1024 * 1024
    };
    
    updateCheck('resolution', checks.resolution, 
      checks.resolution ? '✓ الدقة ممتازة' : '✗ الدقة منخفضة (يلزم 1200×800)');
    
    // إرسال للسيرفر للفحص المتقدم
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/products/validate-image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      updateCheck('quality', result.quality.pass, 
        result.quality.pass ? '✓ وضوح ممتاز' : '✗ ' + result.quality.message);
      
      updateCheck('manipulation', !result.manipulation.detected, 
        !result.manipulation.detected ? '✓ صورة أصلية' : '✗ تم اكتشاف تعديلات');
      
      updateCheck('shariah', result.shariah.compliant, 
        result.shariah.compliant ? '✓ متوافق شرعياً' : '✗ ' + result.shariah.issue);
      
      // تفعيل زر الرفع
      const allPassed = result.quality.pass && !result.manipulation.detected && result.shariah.compliant;
      document.getElementById('btnUpload').disabled = !allPassed;
      
    } catch (error) {
      console.error('خطأ في التحقق:', error);
    }
  };
  img.src = URL.createObjectURL(file);
});

function updateCheck(type, passed, message) {
  const checkItem = document.querySelector(`.check-item.${type}`);
  checkItem.querySelector('i').className = passed ? 'icon-check' : 'icon-x';
  checkItem.querySelector('span').textContent = message;
  checkItem.classList.add(passed ? 'passed' : 'failed');
}
</script>
```

---

## 👨‍💻 منصة ربط المشاريع للمطورين
**Developer Platform — Connect Any Project**

### 🌐 السياق الموحد للذكاء الاصطناعي
**ميزة ثورية:** سياق موحد عبر جميع منصات AI!  
📄 [اقرأ التفاصيل الكاملة](../ecosystem/UNIFIED-AI-CONTEXT-SYSTEM.md)

**ما هو؟**  
عندما تشترك في منظومة شيخة، جميع AIs (ChatGPT، Claude، Gemini، أي chatbot) تفهمك تلقائياً:
- ✅ أهدافك محفوظة
- ✅ أسلوبك معروف
- ✅ سياقك متواصل
- ✅ ذاكرة موحدة

**مثال:**  
- صباحاً: تسأل ChatGPT عن تحسين API
- ظهراً: Claude يكتب الكود (ويعرف مناقشتك مع ChatGPT!)
- مساءً: Gemini يختبر الحل (ويعرف كل ما حصل!)

**لا إعادة شرح أبداً — سياق متواصل 24/7** 🎯

---

### للمطورين الذين لديهم:
- مشاريع تقنية
- مواقع إلكترونية
- تطبيقات
- ذكاء اصطناعي
- أنظمة IoT
- أي تقنية

### كيف تربط مشروعك بمنظومة شيخة؟

#### 1️⃣ OAuth Integration ("Sign in with Sheikha")

```javascript
// مثال: ربط تطبيقك بمنظومة شيخة

// الخطوة 1: توجيه المستخدم لصفحة التفويض
const authUrl = new URL('https://sheikha.top/oauth/authorize');
authUrl.searchParams.append('client_id', 'YOUR_CLIENT_ID');
authUrl.searchParams.append('redirect_uri', 'https://yourapp.com/callback');
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', 'profile email market');

window.location.href = authUrl.toString();

// الخطوة 2: استقبال الرمز في callback
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  // الخطوة 3: استبدال الرمز بـ access_token
  const response = await fetch('https://sheikha.top/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uri: 'https://yourapp.com/callback'
    })
  });
  
  const { access_token, refresh_token } = await response.json();
  
  // الخطوة 4: الحصول على معلومات المستخدم
  const userResponse = await fetch('https://sheikha.top/api/user/profile', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  
  const user = await userResponse.json();
  
  // الآن لديك معلومات المستخدم من شيخة
  console.log(user); // { id, name, email, ... }
  
  // حفظ في session
  req.session.user = user;
  req.session.accessToken = access_token;
  
  res.redirect('/dashboard');
});
```

#### 2️⃣ APIs للمطورين

**قائمة APIs المتاحة:**

| API | الوصف | الاستخدام |
|-----|---------|----------|
| `/api/market/listings` | جلب قائمة المنتجات | عرض المنتجات في تطبيقك |
| `/api/market/prices` | الأسعار اللحظية | مؤشر أسعار حي |
| `/api/user/profile` | ملف المستخدم | تخصيص التجربة |
| `/api/transactions` | المعاملات | سجل الشراء/البيع |
| `/api/shariah/check` | مراجعة شرعية | التحقق من المعاملة |
| `/api/iot/track` | تتبع IoT | موقع المنتجات |
| `/api/analytics` | إحصائيات | تحليلات مخصصة |

**مثال استخدام:**

```javascript
// جلب أسعار الحديد اليوم
const response = await fetch('https://sheikha.top/api/market/prices/iron', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  }
});

const ironPrices = await response.json();
console.log(ironPrices);
// {
//   metal: 'iron',
//   price: 2450,
//   currency: 'SAR',
//   unit: 'ton',
//   lastUpdate: '2026-03-10T14:30:00Z'
// }
```

#### 3️⃣ نموذج Freemium للمطورين

| الخطة | مجاني | Pro | Enterprise |
|-------|--------|-----|------------|
| **السعر** | 0 ريال | 199 ريال/شهر | حسب الطلب |
| **API Calls** | 1,000/يوم | 100,000/يوم | غير محدود |
| **الدعم** | Community | Email | Dedicated |
| **SLA** | — | 99% | 99.9% |
| **Webhooks** | ✗ | ✓ | ✓ |
| **Custom Domain** | ✗ | ✗ | ✓ |

#### 4️⃣ التسجيل كمطور

```
1. اذهب إلى: https://sheikha.top/developers
2. أنشئ حساب مطور
3. سجّل تطبيقك/مشروعك
4. احصل على: Client ID + Client Secret
5. ابدأ التطوير!
```

### 4. نشر على الإنترنت (Vercel)

```bash
# تسجيل الدخول إلى Vercel
vercel login

# نشر المشروع
vercel --prod

# الحصول على الرابط
vercel inspect sheikha-main-portal
```

**النتيجة المتوقعة:**
```
✅ Deployed to: https://sheikha-top.vercel.app
✅ Domain: sheikha.top
✅ Status: Ready
```

---

## 📢 الحملة التسويقية

### 1. الدعوات الشخصية (الأسبوع 1)

**القائمة المستهدفة:**
- 50 تاجر معادن في الرياض
- 30 تاجر سكراب في جدة
- 20 مصنع إعادة تدوير

**الرسالة:**
```
السلام عليكم،

أنا سلمان بن أحمد الراجح، وأدعوك لتكون من أوائل المستخدمين لـ"سوق شيخة" — أول منصة رقمية إسلامية للمعادن والسكراب في السعودية.

🎁 مزايا خاصة للأوائل:
✅ تسجيل مجاني مدى الحياة
✅ عمولة 0% لأول 100 معاملة
✅ دعم شخصي مباشر مني
✅ ظهور مميز في الصفحة الرئيسية

📱 سجّل الآن: https://sheikha.top/تسجيل-الدخول.html
📧 أو راسلني: market@sheikha.top

بارك الله فيك
سلمان الراجح
```

### 2. وسائل التواصل الاجتماعي

#### Twitter/X

**التغريدة الأولى:**
```
🚀 إطلاق "سوق شيخة" — أول سوق رقمي إسلامي للمعادن والسكراب في السعودية!

✅ بدون ربا أو غرر
✅ شفافية كاملة بالبلوكشين
✅ أسعار عادلة ومؤشر لحظي
✅ مراجعة شرعية لكل معاملة

سجّل الآن: https://sheikha.top

#سوق_شيخة #المعادن #السكراب #الاقتصاد_الإسلامي
```

#### Instagram

**المنشور الأول:**
- صورة: شعار شيخة + "قريباً"
- النص: نفس تغريدة Twitter
- Stories: 10 slides عن الميزات

#### LinkedIn

**المقال الأول:**
```
عنوان: كيف تُحدث التكنولوجيا ثورة في قطاع المعادن والسكراب؟

المحتوى:
- المشكلة: 80% من تجار السكراب غير نظاميين
- الحل: منصة رقمية شفافة ومتوافقة شرعياً
- الأثر: تمكين 10,000 شاب + حماية البيئة
- الدعوة: انضم للثورة

[رابط التسجيل]
```

### 3. إعلانات مدفوعة (الأسبوع 3)

#### Google Ads

**الميزانية:** 5,000 ريال / أسبوع

**الكلمات المفتاحية:**
- أسعار المعادن اليوم
- بيع سكراب
- شراء حديد
- تجارة المعادن السعودية
- محلات سكراب الرياض

**الإعلان:**
```
عنوان: سوق شيخة | أسعار المعادن لحظياً
الوصف: تداول المعادن والسكراب بشفافية وأمان. مؤشر أسعار لحظي + مراجعة شرعية. سجل مجاناً!
الرابط: sheikha.top
```

#### Facebook/Instagram Ads

**الميزانية:** 3,000 ريال / أسبوع

**الجمهور المستهدف:**
- الموقع: السعودية (الرياض، جدة، الدمام)
- العمر: 25-55
- الاهتمامات: تجارة، استثمار، مشاريع صغيرة، إعادة تدوير

**الإعلان:**
- صورة/فيديو: تاجر سعيد يستخدم الموقع
- النص: "حوّل هاتفك لمحل معادن متنقل!"

### 4. العلاقات العامة (PR)

**بيان صحفي:**
```
للنشر الفوري
10 مارس 2026

"سوق شيخة" تطلق أول منصة رقمية إسلامية للمعادن في السعودية

الرياض — أعلن سلمان بن أحمد الراجح اليوم عن إطلاق "سوق شيخة"، أول منصة رقمية متوافقة شرعياً لتجارة المعادن والسكراب في المملكة.

تهدف المنصة إلى تمكين 10,000 شاب سعودي من الاستقلال المالي، مع ضمان الشفافية الكاملة عبر تقنية البلوكشين، ومراجعة شرعية لكل معاملة.

للمزيد: market@sheikha.top | sheikha.top
```

**إرساله إلى:**
- جريدة الرياض
- الاقتصادية
- المدينة
- أرقام
- موقع أخبار السعودية
- TechCrunch عربي

---

## 📊 مقاييس النجاح (KPIs)

### أسبوع 1 (الأهداف):
- ✅ 10 مستخدمين مسجلين
- ✅ 20 منتج منشور
- ✅ 5 معاملات مكتملة
- ✅ 0 أخطاء حرجة

### أسبوع 2 (الأهداف):
- ✅ 50 مستخدم مسجل
- ✅ 100 منتج منشور
- ✅ 50 معاملة مكتملة
- ✅ متوسط زمن استجابة < 2 ثانية

### أسبوع 3 (الأهداف):
- ✅ 100 مستخدم مسجل
- ✅ 300 منتج منشور
- ✅ 200 معاملة مكتملة
- ✅ معدل رضا > 90%

### أسبوع 4 (الأهداف):
- ✅ 150 مستخدم مسجل
- ✅ 500 منتج منشور
- ✅ 500 معاملة مكتملة
- ✅ 10 قصة نجاح موثقة

---

## 💰 الموازنة التقديرية

| البند | المبلغ (ريال) |
|-------|---------------|
| Google Ads | 20,000 |
| Facebook/Instagram Ads | 12,000 |
| أدوات تحليل وتتبع | 3,000 |
| خدمة عملاء (WhatsApp Business) | 2,000 |
| تصميم إعلانات | 5,000 |
| علاقات عامة | 8,000 |
| **الإجمالي** | **50,000** |

**مصدر التمويل:** من صندوق البركة (29 مليون ريال مخصصة للعمليات)

---

## 🎁 برنامج الحوافز

### للمستخدمين الأوائل (أول 100):

1. **رسوم صفرية**
   - لا عمولة على أول 100 معاملة
   - توفير يصل إلى 5,000 ريال

2. **دعم مخصص**
   - رقم WhatsApp مباشر للدعم
   - استجابة خلال ساعة واحدة

3. **شارة "العضو المؤسس"**
   - ظهور مميز في السوق
   - أولوية في نتائج البحث

4. **مكافآت الإحالة**
   - 100 ريال لكل صديق تُحيله
   - حتى 10 إحالات = 1,000 ريال

### للتجار النشطين:

1. **برنامج النقاط**
   - 1 نقطة لكل 100 ريال معاملة
   - استبدل النقاط بخصومات أو نقد

2. **مسابقة "تاجر الشهر"**
   - جائزة: 10,000 ريال نقداً
   - معايير: حجم المعاملات + تقييمات العملاء

---

## 📱 خدمة العملاء

### قنوات التواصل:

1. **WhatsApp Business**
   - رقم: [يُضاف]
   - أوقات العمل: 8 ص - 10 م (7 أيام)
   - زمن الاستجابة: < 1 ساعة

2. **البريد الإلكتروني**
   - support@sheikha.top
   - زمن الاستجابة: < 24 ساعة

3. **Twitter**
   - @SheikhaSA
   - استجابة فورية للشكاوى

### الأسئلة الشائعة (FAQ):

**س: هل التسجيل مجاني؟**
ج: نعم، التسجيل مجاني بالكامل ومدى الحياة.

**س: هل هناك عمولة على المعاملات؟**
ج: للأوائل (أول 100): 0% عمولة على أول 100 معاملة. بعدها: 2% فقط.

**س: كيف تضمنون التوافق الشرعي؟**
ج: لدينا لجنة شرعية تراجع آلياً كل معاملة، ونمنع الربا والغرر.

**س: أين توجد بياناتي؟**
ج: في خوادم آمنة في السعودية، مشفّرة بأعلى معايير الأمان (AES-256).

---

## ⚠️ خطة الطوارئ

### المشاكل المحتملة والحلول:

#### 1. السيرفر يتعطل

**الحل:**
- نسخة احتياطية على Vercel (تفعيل تلقائي)
- إعادة التشغيل خلال 5 دقائق
- إشعار المستخدمين عبر Twitter

#### 2. اكتشاف ثغرة أمنية

**الحل:**
- إيقاف الموقع فوراً
- إصلاح الثغرة خلال ساعة
- إخطار جميع المستخدمين
- تحديث كلمات المرور

#### 3. حجم الزوار كبير جداً

**الحل:**
- تفعيل Auto-scaling على Vercel
- استخدام CDN لتخفيف الحمل
- إضافة خوادم إضافية

#### 4. شكاوى من بطء الموقع

**الحل:**
- فحص Performance (Google Lighthouse)
- تحسين الصور (WebP + lazy loading)
- تفعيل caching
- ترقية السيرفر

---

## 📈 التقارير اليومية

### نموذج تقرير يومي:

```
تقرير يوم [التاريخ] — سوق شيخة Beta

📊 الإحصائيات:
- المستخدمون الجدد: X
- الإعلانات الجديدة: X
- المعاملات المكتملة: X
- الإيرادات: X ريال

🎯 الأهداف:
- هدف المستخدمين: X / Y (Z%)
- هدف المعاملات: X / Y (Z%)

⚠️ المشاكل:
- [قائمة المشاكل إن وجدت]

✅ الإنجازات:
- [قائمة الإنجازات]

📝 المهام غداً:
- [قائمة المهام]
```

---

## 🤲 الختام

**«رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ»**  
— النمل:19

هذا الإطلاق **ليس مجرد موقع**، بل هو **بداية رحلة** لتمكين 10,000 شاب، وتحويل قطاع بأكمله.

**نسأل الله التوفيق والسداد.**

---

**تم بحمد الله**  
**القائد: سلمان بن أحمد الراجح**  
**المنظمة: 224557279528**  
**10 مارس 2026**
