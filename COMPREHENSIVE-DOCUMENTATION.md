# 📚 وثائق منظومة شيخة — الشاملة

> **بسم الله الرحمن الرحيم**
>
> "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — سورة المائدة: ٢

---

## 📋 جدول المحتويات

1. [📖 نظرة عامة](#-نظرة-عامة)
2. [🏗️ العمارة](#-العمارة)
3. [🔧 التثبيت والإعداد](#-التثبيت-والإعداد)
4. [🚀 التشغيل](#-التشغيل)
5. [📡 API الرئيسية](#-api-الرئيسية)
6. [🔒 الأمان والحماية](#-الأمان-والحماية)
7. [📊 المراقبة والتقارير](#-المراقبة-والتقارير)
8. [🛠️ استكشاف الأخطاء](#-استكشاف-الأخطاء)
9. [⚙️ الإعدادات المتقدمة](#-الإعدادات-المتقدمة)
10. [📝 الأمثلة والحالات](#-الأمثلة-والحالات)

---

## 📖 نظرة عامة

### ما هي منظومة شيخة؟

**شيخة** هي أول منظومة اقتصادية إسلامية رقمية متكاملة للمعادن والسكراب، مبنية على مبادئ الكتاب والسنة.

### المبادئ الأساسية

- ✅ **لا ربا** — عدم التعامل بالفائدة الربوية
- ✅ **لا غرر** — وضوح تام في المعاملات
- ✅ **لا غش** — صدق القول والفعل
- ✅ **لا احتكار** — حرية السوق والتنافس العادل
- ✅ **تراضٍ كامل** — اتفاق الطرفين برضا

### الميزات الرئيسية

| الميزة | الوصف | الحالة |
|--------|-------|--------|
| 🔐 **المصادقة** | JWT + OAuth (Google, Microsoft, Apple, Nafath) | ✅ فعال |
| 🛡️ **الحماية الشرعية** | فحص شرعي لكل معاملة | ✅ فعال |
| 📊 **التحليلات** | تقارير فورية وشاملة | ✅ فعال |
| 💱 **سعر حي** | تحديثات أسعار فورية عبر WebSocket | ✅ فعال |
| 🤖 **الذكاء الاصطناعي** | توصيات ذكية وتحليل سوقي | ✅ فعال |
| 🌍 **العالمية** | دعم اللغة العربية والإنجليزية | ✅ فعال |

---

## 🏗️ العمارة

### البنية الطبقية

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  HTML5 + CSS3 + Vanilla JS (RTL Arabic)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              API GATEWAY & MIDDLEWARE                        │
│  • CORS + Security Headers                                 │
│  • Request/Response Logging                                │
│  • Rate Limiting                                           │
│  • Input Sanitization                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│           GOVERNANCE & ENFORCEMENT LAYER                    │
│  ├─ Root Control Plane (مركز الحاكمية)                      │
│  ├─ Decision Enforcement (فرض التقيد)                       │
│  ├─ Sharia Guard (حارس الشريعة)                             │
│  └─ Root Governance (الحكومة الجذرية)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│         BUSINESS LOGIC & SERVICE LAYER                      │
│  ├─ Trade Engine (محرك التجارة)                             │
│  ├─ Market Intelligence (ذكاء السوق)                        │
│  ├─ Price Discovery (اكتشاف الأسعار)                        │
│  ├─ Contract Management (إدارة العقود)                      │
│  └─ Payment Processing (معالجة الدفع)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│         NEURAL NETWORK & AI LAYER                           │
│  ├─ Root Neural Network (12 خلية عصبية)                    │
│  ├─ Decision Trees (أشجار القرار)                          │
│  ├─ Predictive Analytics (تحليلات تنبؤية)                  │
│  └─ Market Forecasting (توقع السوق)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│         MONITORING & RELIABILITY LAYER                      │
│  ├─ SRE Monitor (مراقب موثوقية الخدمة)                      │
│  ├─ Health Checks (فحوصات الصحة)                            │
│  ├─ Performance Metrics (مقاييس الأداء)                     │
│  └─ Alert Management (إدارة التنبيهات)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│            DATA & PERSISTENCE LAYER                         │
│  ├─ JSON Files (data/)                                     │
│  ├─ Cache System                                           │
│  └─ Audit Logs                                             │
└─────────────────────────────────────────────────────────────┘
```

### المكونات الأساسية

#### 1. **Root Control Plane** 🎛️
- مركز الحاكمية المركزي
- اتخاذ القرارات الاستراتيجية
- تنسيق جميع الأنظمة
- `/api/root-control-plane/*`

#### 2. **Root Neural Network** 🧠
- 12 خلية عصبية متخصصة
- معالجة القرارات المعقدة
- التنبؤ بالسوق
- `/api/neural-governance/*`

#### 3. **SRE Monitor** 📊
- مراقبة موثوقية الخدمة
- فحوصات الصحة الفورية
- تتبع الأداء
- `/api/sre/*`

#### 4. **Decision Enforcement** 🛡️
- فرض القواعد الشرعية
- التحقق من الامتثال
- حماية البيانات الحساسة
- تُطبق على: `/api/trade`, `/api/orders`, `/api/contracts`, إلخ

#### 5. **Sharia Guard** ✅
- فحص شرعي شامل
- التحقق من الحلال والحرام
- اتباع أحكام الفقه الإسلامي
- `/api/sharia/*`

---

## 🔧 التثبيت والإعداد

### المتطلبات

```bash
# Node.js version
node >= 18.0.0
npm >= 9.0.0

# الملفات المطلوبة
- server.js
- middleware/
- routes/
- lib/
- data/
- public/
```

### خطوات التثبيت

```bash
# 1. استنساخ المستودع
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git
cd sheikha-main-portal

# 2. تثبيت المكتبات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# عدّل الملف حسب احتياجاتك

# 4. التحقق من الإعدادات
npm run server:guard:init

# 5. فحص الأخطاء
npm run lint 2>/dev/null || echo "Lint: اختياري"
```

### متغيرات البيئة

```env
# المنفذ
PORT=8080

# JWT
JWT_SECRET=your-secret-key-here

# النظام
NODE_ENV=development
LOG_LEVEL=info

# البيانات
DATA_PATH=./data

# OAuth (اختياري)
GOOGLE_CLIENT_ID=your-google-id
MICROSOFT_CLIENT_ID=your-microsoft-id
APPLE_CLIENT_ID=your-apple-id
```

---

## 🚀 التشغيل

### البدء السريع

```bash
# تشغيل في وضع التطوير (مع auto-reload)
npm run dev

# تشغيل في الإنتاج
npm start

# تشغيل مع PM2
pm2 start ecosystem.config.js
```

### التحقق من النظام

```bash
# 1. فحص الصحة الأساسي
curl http://localhost:8080/health

# 2. فحص حالة SRE
curl http://localhost:8080/api/health

# 3. فحص نقاط النهاية
curl http://localhost:8080/api/system/status
curl http://localhost:8080/api/system/metrics
curl http://localhost:8080/api/system/services
```

---

## 📡 API الرئيسية

### 1. فحوصات الصحة

#### `/health` — فحص بسيط
```bash
curl http://localhost:8080/health
# Response: OK
```

#### `/api/health` — فحص شامل
```bash
curl http://localhost:8080/api/health
# Response:
{
  "status": "ok",
  "service": "sheikha-main-portal",
  "health": "healthy",
  "slo": true,
  "alerts": 0,
  "warnings": 0,
  "critical": 0,
  "uptime": "2d 5h 30m",
  "uptime_seconds": 185430,
  "timestamp": "2026-05-03T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. نقاط المراقبة

#### `/api/system/status` — حالة النظام
```bash
curl http://localhost:8080/api/system/status
```

#### `/api/system/metrics` — الإحصائيات الفورية
```bash
curl http://localhost:8080/api/system/metrics
# يتضمن: CPU, Memory, Uptime, Alerts
```

#### `/api/system/services` — حالة الخدمات
```bash
curl http://localhost:8080/api/system/services
# يتضمن: SRE, Sharia Guard, Decision Enforcement, etc.
```

### 3. API الأساسية

#### Trade API
```bash
# إضافة عرض تجاري
POST /api/trade
Content-Type: application/json

{
  "type": "buying|selling",
  "commodity": "gold|silver|copper",
  "quantity": 100,
  "unit": "kg|g",
  "price": 50000,
  "currency": "SAR"
}
```

#### Orders API
```bash
# إنشاء طلب
POST /api/orders
{
  "trade_id": "12345",
  "quantity": 50,
  "price": 50000
}
```

#### Contracts API
```bash
# إنشاء عقد
POST /api/contracts
{
  "order_id": "ord_123",
  "terms": "شروط العقد",
  "duration_days": 30
}
```

---

## 🔒 الأمان والحماية

### طبقات الأمان

1. **المصادقة (Authentication)**
   - JWT Token-based
   - OAuth Providers (Google, Microsoft, Apple, Nafath)
   - Session Management

2. **التفويض (Authorization)**
   - Role-based Access Control (RBAC)
   - Permission Checking
   - Resource-level Authorization

3. **الفحص الشرعي (Sharia Guard)**
   - Islamic Law Compliance
   - Haram/Halal Checks
   - Sharia Compliance Verification

4. **فرض القواعد (Decision Enforcement)**
   - Rule Enforcement
   - Policy Validation
   - Sensitive Path Protection

5. **المراقبة والتسجيل (Monitoring & Logging)**
   - Request/Response Logging
   - Security Event Tracking
   - Anomaly Detection

### أمثلة الأمان

```javascript
// التحقق من الشرعية
const result = shariaGuard.check({
  type: 'trade',
  commodity: 'gold',
  price: 50000,
  terms: 'شروط عادلة'
});

if (!result.isHalal) {
  return res.status(403).json({
    error: 'العملية غير شرعية',
    reason: result.reason
  });
}

// فرض القواعد
const enforcement = decisionEnforcement.validate({
  user_id: 'user_123',
  action: 'place_order',
  amount: 50000
});

if (!enforcement.allowed) {
  return res.status(403).json({
    error: 'العملية مرفوضة',
    reason: enforcement.reason
  });
}
```

---

## 📊 المراقبة والتقارير

### SRE Metrics

```json
{
  "health": "healthy|degraded|critical",
  "slo": {
    "compliant": true,
    "availability": 99.95,
    "target": 99.9
  },
  "uptime": {
    "total": 185430,
    "formatted": "2d 5h 30m"
  },
  "alerts": {
    "total": 2,
    "warnings": 1,
    "critical": 1
  }
}
```

### Performance Metrics

```bash
# CPU Usage
process.cpuUsage()
# { user: 1234567, system: 987654 }

# Memory Usage
process.memoryUsage()
# { rss, heapTotal, heapUsed, external, arrayBuffers }

# Uptime
process.uptime()
# 185430 (seconds)
```

### Alerting System

```javascript
// تعريف التنبيهات
const alerts = [
  {
    type: 'CRITICAL',
    message: 'CPU usage > 90%',
    timestamp: '2026-05-03T10:30:00Z',
    service: 'main-portal'
  },
  {
    type: 'WARNING',
    message: 'Memory usage > 80%',
    timestamp: '2026-05-03T10:29:00Z',
    service: 'main-portal'
  }
];
```

---

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. الخادم لا يبدأ
```bash
# تحقق من المنفذ
lsof -i :8080

# تأكد من تثبيت المكتبات
npm install

# قم بتشغيل في منفذ آخر
PORT=3000 npm start
```

#### 2. أخطاء في المراقبة
```bash
# تحقق من SRE Monitor
curl http://localhost:8080/api/health

# افحص السجلات
tail -f server.log
```

#### 3. مشاكل في الشريعة Guard
```bash
# تحقق من Sharia Guard Status
curl http://localhost:8080/api/sharia/status

# ارجع إلى السجلات
grep "Sharia Guard" server.log
```

### Debugging

```bash
# تشغيل مع debug verbose
DEBUG=sheikha:* npm start

# تشغيل مع node inspector
node --inspect server.js

# ثم افتح: chrome://inspect
```

---

## ⚙️ الإعدادات المتقدمة

### تخصيص المراقبة

```javascript
// في middleware/sre-monitor.js
const SRE_CONFIG = {
  HEALTH_CHECK_INTERVAL: 5000, // كل 5 ثواني
  ALERT_THRESHOLD: {
    CPU: 90,        // 90%
    MEMORY: 85,     // 85%
    ERROR_RATE: 5   // 5%
  },
  SLO_TARGET: 99.9  // 99.9% availability
};
```

### تخصيص القواعس

```javascript
// في middleware/sheikha-decision-enforcement.js
const ENFORCEMENT_RULES = {
  MAX_ORDER_VALUE: 1000000,        // الحد الأقصى للطلب
  MIN_ORDER_VALUE: 100,            // الحد الأدنى للطلب
  RATE_LIMIT: 100,                 // 100 طلب
  RATE_LIMIT_WINDOW: 60 * 1000     // في الدقيقة
};
```

---

## 📝 الأمثلة والحالات

### مثال 1: إنشاء عرض تجاري

```bash
curl -X POST http://localhost:8080/api/trade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "selling",
    "commodity": "gold",
    "quantity": 100,
    "unit": "kg",
    "price": 50000,
    "currency": "SAR",
    "description": "ذهب عيار 18 خالص"
  }'

# Response:
{
  "success": true,
  "data": {
    "trade_id": "trade_123456",
    "status": "active",
    "created_at": "2026-05-03T10:30:00Z"
  }
}
```

### مثال 2: فحص الحالة

```bash
curl http://localhost:8080/api/health \
  -H "Accept: application/json"

# Response:
{
  "status": "ok",
  "health": "healthy",
  "slo": true,
  "alerts": 0,
  "uptime": "2d 5h 30m"
}
```

### مثال 3: الحصول على الإحصائيات

```bash
curl http://localhost:8080/api/system/metrics \
  -H "Accept: application/json"

# Response:
{
  "success": true,
  "data": {
    "cpu": { "user": 1234567, "system": 987654 },
    "memory": { "rss": 123456789, "heapUsed": 987654 },
    "uptime": { "total": 185430, "formatted": "2d 5h 30m" },
    "alerts": { "total": 0 }
  }
}
```

---

## 📞 التواصل والدعم

### المعلومات

- **المالك**: سلمان أحمد بن سلمان الراجح
- **الدومين**: sheikha.top
- **البريد الإلكتروني**: market@sheikha.top
- **المستودع**: github.com/Sheikha-Market/sheikha-main-portal

### الموارد

- 📖 [التوثيق الشاملة](COMPREHENSIVE-DOCUMENTATION.md)
- 🔐 [سياسة الأمان](SECURITY.md)
- 📋 [قوائم التحقق](CHECKLISTS.md)
- 🐛 [متتبع الأخطاء](https://github.com/Sheikha-Market/sheikha-main-portal/issues)

---

## 🎓 الدروس المستفادة

### أفضل الممارسات

1. **دائماً التحقق من الصحة** ✅
   - استخدم `/api/health` قبل أي عملية
   - راقب الـ SLO compliance

2. **الحفاظ على الأمان** 🔒
   - استخدم JWT tokens
   - فعّل Sharia Guard
   - راجع السجلات

3. **المراقبة المستمرة** 📊
   - افحص Metrics بانتظام
   - اتجه للتنبيهات بسرعة
   - احتفظ بالسجلات

---

## ✅ قائمة التحقق

### قبل النشر (Pre-deployment)

- [ ] تشغيل `npm run lint`
- [ ] تشغيل الاختبارات
- [ ] فحص متغيرات البيئة
- [ ] التحقق من المراقبة
- [ ] مراجعة السجلات

### بعد النشر (Post-deployment)

- [ ] التحقق من الصحة: `/health`
- [ ] فحص النظام: `/api/system/status`
- [ ] مراقبة الأداء: `/api/system/metrics`
- [ ] التحقق من الخدمات: `/api/system/services`
- [ ] مراجعة التنبيهات

---

**آخر تحديث**: 3 مايو 2026

---

*منظومة شيخة — تجارة عادلة، شرعية، آمنة* 🏢✨

