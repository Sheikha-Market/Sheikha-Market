# 📖 دليل استخدام منظومة شيخة الموحدة

## 🚀 البدء السريع

### 1. تشغيل الخادم
```bash
npm start                    # الإنتاج
npm run dev                  # التطوير (auto-reload)
npm run stop                 # إيقاف على Port 8080
```

### 2. اختبار الأمر الأساسي
```bash
curl -X POST http://localhost:8080/api/sheikha-pipeline/command \
  -H "Content-Type: application/json" \
  -d '{"command":"احسب زكاة المال 1000"}'
```

---

## 🔌 نقاط الدخول الأساسية

### أ) تنفيذ أمر كامل
```bash
POST /api/sheikha-pipeline/command

Request:
{
  "command": "احسب زكاة المال 1000",
  "priority": "normal"    # اختياري: normal/high
}

Response:
{
  "success": true,
  "data": {
    "neural": {
      "domain": "shariah",
      "confidence": 0.95,
      "topCells": [...]
    },
    "memory": {
      "adjustments": {
        "confidenceDelta": 0.13,
        "priority": "high",
        "executionMode": "auto",
        "orchestratorBehavior": "fast-track"
      }
    },
    "plan": {
      "decision": {
        "intent": "zakat"
      },
      "decisionContext": {
        "neural": {...},
        "memory": {...},
        "orchestration": {...}
      }
    }
  }
}
```

### ب) تسجيل التغذية الراجعة
```bash
POST /api/sheikha-pipeline/feedback

Request:
{
  "command": "احسب زكاة المال 1000",
  "domain": "shariah",
  "score": 5,              # 1-5
  "outcome": "positive",   # positive/negative
  "notes": "دقيق ومفيد"
}

Response:
{
  "success": true,
  "data": {
    "profile": {
      "stats": {
        "executions": 2,
        "successes": 2,
        "failures": 0,
        "avgScore": 5,
        "successRate": 1.0
      },
      "adjustments": {
        "confidenceDelta": 0.13,    # ← تحديث
        "priority": "normal",
        "executionMode": "auto"
      }
    }
  }
}
```

### ج) استعلام الذاكرة والسياق
```bash
GET /api/sheikha-pipeline/memory?command=احسب%20زكاة%20المال%201000&domain=shariah

Response:
{
  "success": true,
  "data": {
    "stats": {
      "executions": 2,
      "successes": 2,
      "avgScore": 5,
      "successRate": 1.0
    },
    "adjustments": {
      "confidenceDelta": 0.13,
      "orchestratorBehavior": "fast-track"
    }
  }
}
```

### د) قواعس التنسيق لمجال معين
```bash
GET /api/sheikha-pipeline/orchestration-rules?domain=shariah

Response:
{
  "success": true,
  "data": {
    "domain": "shariah",
    "rule": "SHARIAH_COMPLIANCE_LAYER",
    "stats": {
      "profileCount": 5,
      "totalExecutions": 15,
      "successRate": 0.93,
      "avgConfidence": 0.95
    },
    "evaluation": {
      "executionMode": "auto",
      "behaviors": ["high-priority", "requires-approval"]
    },
    "recommendations": {
      "action": "continue",
      "confidence": "high"
    }
  }
}
```

### هـ) مقاييس لوحة المعلومات
```bash
GET /api/sheikha-pipeline/dashboard-metrics

Response:
{
  "success": true,
  "data": {
    "shariah": {
      "profileCount": 5,
      "totalExecutions": 15,
      "totalSuccesses": 14,
      "successRate": 0.93,
      "avgConfidence": 0.95,
      "negativeFeedback": 1
    },
    "commerce": {
      "profileCount": 3,
      "totalExecutions": 8,
      "totalSuccesses": 7,
      "successRate": 0.875,
      "avgConfidence": 0.92,
      "negativeFeedback": 0
    },
    ...
  }
}
```

---

## 📊 المقاييس والعروض

### مقاييس النظام الأساسية

#### 1. مقاييس الثقة (Confidence)
- **الثقة الأولية:** من الشبكة العصبية (0.7-1.0)
- **دلتا التعلم:** من التغذية الراجعة (±0.05 إلى ±0.20)
- **الثقة النهائية:** الأولية + الدلتا

#### 2. معدل النجاح
```
successRate = successes / executions
```
- shariah: ≥ 0.80 (مطلوب)
- commerce: ≥ 0.75 (مطلوب)
- mathematics: ≥ 0.90 (مطلوب)
- sciences: ≥ 0.75 (موصى)

#### 3. درجة الملاحظات
- 5: ممتاز (positive feedback)
- 4: جيد جداً
- 3: مقبول
- 2: ضعيف
- 1: سيء (negative feedback)

#### 4. أوضاع التنفيذ
| الوضع | الوصف | الاستخدام |
|------|--------|----------|
| `auto` | عادي تلقائي | الحالات العادية |
| `guarded` | محمي مع مراجعة | عند التحذيرات |
| `fast-track` | متسارع | عند الثقة العالية |
| `review` | مراجعة يدوية | عند الأخطاء |

#### 5. سلوكيات الأوركسترا
- `standard`: تنفيذ معياري
- `fast-track`: تسريع بناءً على التعلم
- `guarded`: حماية من الأخطاء
- `review-required`: يتطلب موافقة

---

## 🔍 أمثلة استخدام متقدمة

### سيناريو 1: تطبيق شريعة مع تعلم
```bash
# الأمر الأول
POST /command { "command": "احسب زكاة 5000 درهم" }
→ confidence: 0.95, executionMode: auto

# تغذية إيجابية
POST /feedback { "score": 5, "outcome": "positive" }

# الأمر الثاني (مع التعلم)
POST /command { "command": "احسب زكاة 5000 درهم" }
→ confidence: 0.95, confidenceDelta: +0.10, executionMode: fast-track
```

### سيناريو 2: كشف خطأ وتفعيل الوضع المحمي
```bash
# الأمر
POST /command { "command": "احسب زكاة 5000 درهم" }
→ success: true

# تغذية سلبية
POST /feedback { "score": 1, "outcome": "negative" }

# الأمر التالي
POST /command { "command": "احسب زكاة 5000 درهم" }
→ executionMode: guarded, reviewRequired: true
```

### سيناريو 3: مقارنة عبر المجالات
```bash
GET /dashboard-metrics

Response shows:
- shariah: 93% success rate ✅
- commerce: 87% success rate ✅
- mathematics: 95% success rate ✅
- language: 80% success rate ⚠️
```

---

## ⚙️ التكوين المتقدم

### متغيرات البيئة
```bash
# مسار تخزين الذاكرة
export SHEIKHA_LEARNING_MEMORY_PATH=/path/to/memory.json

# قاعدة بيانات داخلية
export INTERNAL_API_BASE_URL=http://127.0.0.1:8080

# وضع التطوير
export NODE_ENV=development
```

### قواعس التنسيق المخصصة

يمكن تعديل `lib/sheikha-orchestration-rules-engine.js`:

```javascript
domainRules: {
  shariah: {
    minSuccessRate: 0.80,           // ← قابل للتعديل
    reviewOnNegativeFeedback: true,
    guardedModeThreshold: 2,        // ← عدد الأخطاء قبل الوضع المحمي
    priority: "high",
    requiresApproval: true
  }
}
```

---

## 🧪 اختبار المنظومة

### اختبار شامل (Shell Script)
```bash
#!/bin/bash

# Test 1: shariah domain
curl -X POST http://localhost:8080/api/sheikha-pipeline/command \
  -d '{"command":"احسب زكاة المال 1000"}' \
  -H "Content-Type: application/json"

# Test 2: feedback
curl -X POST http://localhost:8080/api/sheikha-pipeline/feedback \
  -d '{"command":"احسب زكاة المال 1000","domain":"shariah","score":5}' \
  -H "Content-Type: application/json"

# Test 3: memory query
curl http://localhost:8080/api/sheikha-pipeline/memory?command=احسب%20زكاة%20المال%201000

# Test 4: orchestration rules
curl http://localhost:8080/api/sheikha-pipeline/orchestration-rules?domain=shariah

# Test 5: dashboard
curl http://localhost:8080/api/sheikha-pipeline/dashboard-metrics
```

### اختبار Unit (Node.js)
```javascript
const pipeline = require('./routes/sheikha-command-pipeline.routes.js');

describe('Sheikha Unified System', () => {
  it('should route to shariah domain', async () => {
    const response = await post('/api/sheikha-pipeline/command', {
      command: 'احسب زكاة المال 1000'
    });
    assert.equal(response.data.neural.domain, 'shariah');
  });

  it('should learn from feedback', async () => {
    // First execution
    const first = await post('/api/sheikha-pipeline/command', {...});

    // Record feedback
    await post('/api/sheikha-pipeline/feedback', {
      score: 5,
      outcome: 'positive'
    });

    // Second execution should show learning
    const second = await post('/api/sheikha-pipeline/command', {...});
    assert(second.data.plan.decisionContext.memory.adjustments.confidenceDelta > 0);
  });
});
```

---

## 🔐 الأمان والامتثال

### فحوصات الشريعة المدمجة
```javascript
// يُرفع تلقائياً:
if (text.includes('ربا')) return false;     // الربا
if (text.includes('غرر')) return false;     // الغرر
if (text.includes('غش')) return false;      // الغش
if (text.includes('قرض بفائدة')) return false;
```

### مستويات الأولوية
```javascript
priority: 'normal'   // تنفيذ عادي
priority: 'high'     // مراجعة إضافية (شريعة، رياضيات)
priority: 'critical' // موافقة يدوية مطلوبة
```

---

## 📈 مراقبة الأداء

### مؤشرات الأداء الرئيسية (KPIs)

| المؤشر | الهدف | الحالي |
|------|-------|--------|
| متوسط الثقة | 0.92+ | ✅ |
| معدل النجاح | 80%+ | ✅ |
| زمن الاستجابة | <500ms | ✅ |
| توفر الخدمة | 99.5%+ | ✅ |

### تسجيلات النظام
```bash
# عرض السجلات الحية
npm run logs

# السجلات العميقة (JSON)
tail -f data/sheikha-learning-memory.json | jq .recentEvents[]
```

---

## 🆘 استكشاف الأخطاء

### الأمر يعيد `success: false`
1. تحقق من حالة الخادم: `GET /api/sheikha-pipeline/health`
2. افحص السجلات: `npm run logs`
3. تحقق من التغذية الراجعة: `GET /memory?command=...`

### الثقة منخفضة جداً
1. سجّل تغذية إيجابية: `POST /feedback`
2. انتظر تحديث الذاكرة: 1-2 ثانية
3. أعد محاولة الأمر

### الوضع المحمي مُفعّل
1. أرسل تغذية إيجابية إذا كان الأمر صحيحاً
2. أو صحّح الأمر وأعد المحاولة
3. أو اطلب موافقة يدوية

---

## 📚 المراجع

- [بروتوكول شيخة](sheikha-protocol.md) (قريباً)
- [الشبكة العصبية](neural-network.md) (قريباً)
- [محرك التعلم](learning-engine.md) (قريباً)
- [قواعس التنسيق](orchestration-rules.md) (قريباً)

---

**الإصدار:** 1.0
**آخر تحديث:** 26 أبريل 2026
**الحالة:** ✅ مُفعّلة وجاهزة للاستخدام
