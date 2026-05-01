# بسم الله الرحمن الرحيم

# دليل الاستخدام السريع — منظومة شيخة
**Quick Start Guide — SHEIKHA Platform**

---

## 🚀 تشغيل الخادم / Start Server

```bash
cd /workspaces/sheikha/sheikha-main-portal
npm start
```

الخادم سيعمل على: `http://127.0.0.1:8080`

---

## 📡 قائمة APIs الكاملة

### 1️⃣ التقييم الإسلامي الموحد / Unified Islamic Assessment

#### جلب الهيكل
```bash
curl http://127.0.0.1:8080/api/unified/islamic-blueprint
```

#### تقييم كيان
```bash
curl -X POST http://127.0.0.1:8080/api/unified/islamic-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "مبادرة تجريبية",
    "scores": {
      "zakatAndCharity": 85,
      "halalAndHaram": 90,
      "justiceAndTransparency": 88,
      "honestyAndTrust": 92,
      "brotherhoodAndCooperation": 80,
      "socialResponsibility": 82,
      "sustainability": 78,
      "empowermentAndEducation": 86,
      "halalInnovation": 88
    }
  }'
```

---

### 2️⃣ تحليل برامج الرؤى / Vision Programs

#### جلب الهيكل
```bash
curl http://127.0.0.1:8080/api/unified/vision-program-blueprint
```

#### تقييم برنامج
```bash
curl -X POST http://127.0.0.1:8080/api/unified/vision-program-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "programName": "برنامج التحول الوطني",
    "scores": {
      "nationalAlignment": 92,
      "economicImpact": 88,
      "socialDimension": 85,
      "environmentalSustainability": 78,
      "innovationAndTechnology": 90,
      "inclusivityAndEmpowerment": 82,
      "governanceAndTransparency": 88,
      "integrationAndPartnerships": 86,
      "financialSustainability": 84,
      "adaptability": 80
    }
  }'
```

---

### 3️⃣ البنى الرقمية والمادية / Infrastructure

#### جلب الهيكل
```bash
curl http://127.0.0.1:8080/api/infrastructure/digital-physical-blueprint
```

#### تقييم بنية تحتية
```bash
curl -X POST http://127.0.0.1:8080/api/infrastructure/digital-physical-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "المملكة العربية السعودية",
    "digitalScores": {
      "telecommunications": 85,
      "cloudComputing": 82,
      "cybersecurity": 88,
      "eServices": 90,
      "digitalLegislation": 86,
      "artificialIntelligence": 80
    },
    "physicalScores": {
      "transportation": 88,
      "energyAndWater": 90,
      "healthAndEducation": 85,
      "environment": 78,
      "industryAndTrade": 84,
      "housingAndUrban": 82
    },
    "benchmarkTarget": "singapore"
  }'
```

**Benchmark Options:**
- `uae` — الإمارات
- `singapore` — سنغافورة
- `southKorea` — كوريا الجنوبية
- `switzerland` — سويسرا
- `china` — الصين

---

### 4️⃣ المنظمات الدولية / International Organizations

#### جلب الهيكل
```bash
curl http://127.0.0.1:8080/api/international/organizations-blueprint
```

#### تقييم منظمة
```bash
curl -X POST http://127.0.0.1:8080/api/international/organizations-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "منظمة الصحة العالمية",
    "scores": {
      "geographicCoverage": 95,
      "impactAndOutcomes": 88,
      "governanceAndTransparency": 85,
      "financialCapacity": 82,
      "partnershipsAndNetworks": 90,
      "innovationAndAdaptability": 84,
      "reputationAndRecognition": 92
    },
    "benchmarkTarget": "unitedNations"
  }'
```

**Benchmark Options:**
- `unitedNations` — الأمم المتحدة
- `worldBank` — البنك الدولي
- `redCross` — الصليب الأحمر الدولي
- `gavi` — تحالف اللقاحات
- `fao` — منظمة الأغذية والزراعة

---

### 5️⃣ التكامل الإسلامي الشامل / Islamic Integration

#### جلب الإطار
```bash
curl http://127.0.0.1:8080/api/integration/comprehensive-islamic-framework
```

---

### 6️⃣ النظم المعرفية والابتكارية / Knowledge Systems

#### جلب الهيكل
```bash
curl http://127.0.0.1:8080/api/knowledge-systems/blueprint
```

#### تقييم نظام معرفي
```bash
curl -X POST http://127.0.0.1:8080/api/knowledge-systems/assessment \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "منظومة وسوق شيخة",
    "informationScores": {
      "dataArchitecture": 82,
      "knowledgeManagement": 85,
      "businessIntelligence": 80,
      "informationSecurity": 90,
      "systemsIntegration": 78
    },
    "researchScores": {
      "researchInfrastructure": 75,
      "researchMethodology": 88,
      "collaboration": 82,
      "outputQuality": 85,
      "funding": 70
    },
    "innovationScores": {
      "innovationCulture": 90,
      "ideationProcesses": 85,
      "developmentPipeline": 88,
      "intellectualProperty": 92,
      "ecosystemEngagement": 87
    },
    "benchmarkTarget": "saudiVision2030"
  }'
```

**Benchmark Options:**
- `saudiVision2030` — رؤية السعودية 2030
- `top50Universities` — أفضل 50 جامعة عالمياً
- `bigTech` — الشركات التقنية الكبرى
- `regionalLeaders` — الرواد الإقليميون

---

## 📊 فهم النتائج / Understanding Results

### مستويات النضج / Maturity Levels

| المستوى | النطاق | الوصف |
|---------|--------|-------|
| **1** — ضعيف/ناشئ | 0-40 | قدرات أولية |
| **2** — متطور | 40-60 | قدرات جيدة مع بعض الثغرات |
| **3** — متقدم | 60-75 | قدرات قوية وتنافسية |
| **4** — رائد | 75-90 | قدرات عالمية في معظم المجالات |
| **5** — عالمي المستوى | 90-100 | أفضل الممارسات العالمية |

---

### قراءة الفجوات / Reading Gaps

- **Positive Gap (+)** — أفضل من المعيار المرجعي ✅
- **Negative Gap (−)** — أقل من المعيار المرجعي ⚠️
- **Zero Gap (0)** — مطابق للمعيار 🎯

**مثال:**
```json
{
  "gap": 6.52
}
```
هذا يعني **+6.5 نقطة فوق المعيار** (ممتاز!)

---

## 🎯 أمثلة واقعية / Real Examples

### كاوست (85.04)
```json
{
  "overall": 85.04,
  "maturity": "رائد (Leading)",
  "gap": -5.29  // -5.3 عن أفضل 50 جامعة
}
```
**التحليل:** جامعة رائدة، قريبة جداً من المستوى العالمي

---

### شيخة (83.98)
```json
{
  "overall": 83.98,
  "maturity": "رائد (Leading)",
  "gap": +6.52  // +6.5 فوق رؤية 2030!
}
```
**التحليل:** 🏆 متفوقة على المعيار الوطني في جميع المحاور!

---

## 🔐 حماية البيانات / Data Security

جميع المدخلات يتم:
- ✅ Validation (التحقق من الصحة)
- ✅ Sanitization (التنقية)
- ✅ Logging (التسجيل)
- ✅ Rate Limiting (تحديد المعدل)

**لا ترسل:**
- ❌ JWT tokens
- ❌ كلمات المرور
- ❌ بيانات حساسة شخصية

---

## 📚 الملفات المرجعية / Reference Files

1. `محرك-النظم-المعرفية-والابتكارية.md` — توثيق تفصيلي للنظم المعرفية
2. `منظومة-تحليل-البنى-الشاملة.md` — توثيق البنى التحتية
3. `SHEIKHA-COMPREHENSIVE-SYSTEMS.md` — ملخص تنفيذي شامل
4. `QUICK-START-API.md` — هذا الملف
5. `server.js` — الكود الكامل

---

## 🆘 استكشاف الأخطاء / Troubleshooting

### Error: Could not connect to server
```bash
# تحقق من تشغيل الخادم
lsof -ti :8080

# إن لم يكن عاملاً، شغّله
npm start
```

---

### Error: Invalid benchmark target
```bash
# تأكد من استخدام أحد الخيارات الصحيحة:
# Infrastructure: uae, singapore, southKorea, switzerland, china
# International Orgs: unitedNations, worldBank, redCross, gavi, fao
# Knowledge Systems: saudiVision2030, top50Universities, bigTech, regionalLeaders
```

---

### Error: Missing required scores
```bash
# تأكد من إرسال جميع الدرجات المطلوبة
# كل مجال يحتاج درجة من 0-100
```

---

## 💡 نصائح للاستخدام / Usage Tips

1. **ابدأ بـ Blueprint** — افهم الهيكل قبل التقييم
2. **اختر المعيار المناسب** — قارن مع الكيانات المشابهة
3. **كن صادقاً في الدرجات** — أدق التقييمات تعطي أفضل التوصيات
4. **اقرأ التوصيات** — كل تقييم يتضمن توصيات عملية
5. **تابع خارطة الطريق** — اتبع المراحل الثلاثة للتطوير

---

## 🎓 مصادر التعلم / Learning Resources

- **الوثائق الكاملة:** `/docs` directory
- **أمثلة التطبيق:** `/examples` directory
- **نماذج البيانات:** `/models` directory
- **الكود المصدري:** `server.js` (lines 39770-40450 لمحرك النظم المعرفية)

---

## 📞 الدعم / Support

**Email:** market@sheikha.top  
**Domain:** sheikha.top  
**Owner:** Salman Ahmad Al-Rajhi

---

**والحمد لله رب العالمين**  
**صُنع بـ ❤️ في المملكة العربية السعودية**

