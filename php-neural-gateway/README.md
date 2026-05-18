# 🧠 بوابة شيخة PHP للشبكة العصبية الجذرية
## Sheikha PHP Neural Root Cell Network Gateway

> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ  
> ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة:31

---

## نظرة عامة / Overview

**بوابة شيخة PHP** هي طبقة تكامل رسمية تُفعِّل الشبكة العصبية الجذرية بلغة PHP وتتصل بخادم `sheikha-main-portal` (Node.js).

**Sheikha PHP Gateway** is a formal integration layer that activates the Neural Root Cell Network in PHP and connects to the `sheikha-main-portal` (Node.js) server.

### الخلايا العصبية (19 خلية) / Neural Cells (19 Cells)

| الطبقة / Layer | العدد / Count | الوصف / Description |
|----------------|--------------|---------------------|
| خلايا القرآن الكريم | 8 | ربا، تجارة، غرر، عدل، زكاة، وقف، ذهب، عقود |
| خلايا السنة النبوية | 5 | تجارة، غرر، ربا، زكاة، أمانة |
| خلايا المقاصد الخمس | 5 | دين، نفس، عقل، نسل، مال |
| خلية التوحيد العليا | 1 | الجذر الحاكم — لا إله إلا الله |
| **المجموع** | **19** | |

---

## التثبيت السريع / Quick Start

```bash
cd php-neural-gateway

# 1. تثبيت التبعيات — Install dependencies
composer install

# 2. ضبط البيئة — Configure environment
cp .env.example .env
# عدّل .env وأضف JWT_SECRET (32+ حرفاً)

# 3. تشغيل الخادم — Start server
composer start
# أو مباشرة: php -S 0.0.0.0:8090 public/index.php
```

---

## نقاط API / API Endpoints

| الأسلوب / Method | المسار / Path | الوظيفة / Description |
|-----------------|--------------|----------------------|
| `GET`  | `/`                   | معلومات المنظومة |
| `GET`  | `/health`             | فحص صحة PHP + Node.js |
| `GET`  | `/neural/status`      | حالة الشبكة العصبية الجذرية |
| `GET`  | `/neural/cells`       | قائمة جميع الخلايا |
| `POST` | `/neural/infer`       | الاستدلال الشرعي |
| `POST` | `/neural/activate`    | تفعيل الشبكة |
| `POST` | `/neural/halal-check` | فحص الحلال السريع |
| `POST` | `/neural/maqasid`     | تقييم المقاصد الشرعية |
| `*`    | `/api/v2/*`           | بروكسي → Node.js /api/v2/* |
| `*`    | `/api/*`              | بروكسي → Node.js /api/* |

---

## أمثلة / Examples

### فحص الصحة / Health Check
```bash
curl http://localhost:8090/health
```
```json
{
  "status": "healthy",
  "phpEngine": { "ready": true, "totalCells": 19, "version": "1.0.0" },
  "nodeJs": { "alive": true, "message": "Node.js خادم متاح" },
  "checkedAt": "2026-05-18T22:00:00+00:00"
}
```

### الاستدلال الشرعي / Sharia Inference
```bash
curl -X POST http://localhost:8090/neural/infer \
  -H 'Content-Type: application/json' \
  -d '{"type":"TRADE","amount":5000,"interestRate":0}'
```
```json
{
  "verdict": "HALAL",
  "confidence": 0.7143,
  "score": 0.7143,
  "cellsActivated": 14,
  "quranCells": 8,
  "sunnahCells": 5,
  "maqasidCells": 5,
  "supremeCell": "لا إله إلا الله — كل شيء لله",
  "engine": "SNRN-PHP",
  "latencyMs": 0.12
}
```

### كشف الربا / Detect Riba
```bash
curl -X POST http://localhost:8090/neural/infer \
  -H 'Content-Type: application/json' \
  -d '{"type":"LOAN_WITH_INTEREST","interestRate":12}'
```
```json
{
  "verdict": "HARAM",
  "confidence": 0.99,
  "supremeCell": "لا إله إلا الله — كل شيء لله"
}
```

### فحص الحلال / Halal Check
```bash
curl -X POST http://localhost:8090/neural/halal-check \
  -H 'Content-Type: application/json' \
  -d '{"type":"SALE","amount":100,"interestRate":0}'
```
```json
{
  "isHalal": true,
  "valid": true,
  "verdict": "HALAL",
  "violations": []
}
```

### بروكسي Node.js / Node.js Proxy
```bash
# الوصول لـ Node.js API عبر PHP Gateway
curl http://localhost:8090/api/v2/status
curl http://localhost:8090/api/health
curl http://localhost:8090/api/catalog
```

---

## الاختبارات / Tests

```bash
# اختبارات الوحدة فقط
composer test -- --testsuite Unit

# اختبارات التكامل (تتطلب Node.js)
NODE_API_URL=http://localhost:8080 composer test -- --testsuite Integration

# جميع الاختبارات
composer test
```

---

## Docker

```bash
# بناء الصورة
docker build -t sheikha-php-gateway .

# تشغيل مع Node.js
docker run -d \
  -p 8090:8090 \
  -e JWT_SECRET=your-secret-here \
  -e NODE_API_URL=http://host.docker.internal:8080 \
  --name sheikha-php-gateway \
  sheikha-php-gateway
```

---

## هيكل المشروع / Project Structure

```
php-neural-gateway/
├── src/
│   ├── NeuralCells/
│   │   ├── CellInterface.php     ← واجهة الخلية العصبية
│   │   ├── QuranCell.php         ← 8 خلايا قرآنية
│   │   ├── SunnahCell.php        ← 5 خلايا سنة نبوية
│   │   ├── MaqasidCell.php       ← 5 خلايا مقاصد
│   │   └── SupremeCell.php       ← 1 خلية توحيد عليا
│   ├── Network/
│   │   └── SNRNEngine.php        ← المحرك الرئيسي (19 خلية)
│   ├── Security/
│   │   ├── InputValidator.php    ← التحقق من المدخلات
│   │   ├── JwtAuth.php           ← مصادقة JWT
│   │   └── RateLimit.php         ← حد معدل الطلبات
│   ├── Client/
│   │   ├── NodeJsClient.php      ← عميل HTTP لـ Node.js
│   │   └── ApiResponse.php       ← غلاف الاستجابة
│   ├── Gateway/
│   │   ├── Router.php            ← موجّه الطلبات
│   │   └── SheikhaGateway.php    ← البوابة الرئيسية
│   └── Logging/
│       └── SheikhaLogger.php     ← مُسجِّل آمن
├── public/
│   └── index.php                 ← نقطة الدخول
├── tests/
│   ├── Unit/
│   │   ├── SNRNEngineTest.php    ← اختبارات المحرك
│   │   ├── NeuralCellsTest.php   ← اختبارات الخلايا
│   │   ├── SecurityTest.php      ← اختبارات الأمان
│   │   └── RouterTest.php        ← اختبارات الـ Router
│   └── Integration/
│       └── GatewayIntegrationTest.php ← اختبارات التكامل
├── Dockerfile
├── composer.json
├── phpunit.xml
└── .env.example
```

---

## الامتثال الشرعي / Sharia Compliance

- ❌ الربا محرم — نهى الله عنه في القرآن: ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾
- ❌ الغرر محرم — نهى النبي ﷺ عن بيع الغرر
- ✅ العدل واجب — ﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾
- ✅ الزكاة واجبة — ركن من أركان الإسلام
- ✅ الشفافية في التسعير — من أحكام البيع الصحيح

---

*منظومة شيخة™ — «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»*
