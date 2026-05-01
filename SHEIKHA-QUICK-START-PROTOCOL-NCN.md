# 🚀 دليل التفعيل السريع — بروتوكول شيخة + الشبكة العصبية الرئيسية

**تاريخ:** 26 أبريل 2026

---

## ✅ التحقق من التفعيل

### 1. تحقق من البروتوكول
```bash
curl -s http://localhost:8080/api/protocol/health | jq .
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "service": "sheikha-protocol",
    "version": "2.0.0",
    "status": "ready"
  }
}
```

### 2. تحقق من الشبكة العصبية
```bash
curl -s http://localhost:8080/api/master-ncn/health | jq .
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "service": "sheikha-master-neural-cell-network",
    "architecture": {
      "totalCells": 100,
      "layers": 6
    }
  }
}
```

---

## 🔬 اختبارات سريعة

### اختبار 1: فحص الشريعة
```bash
curl -X POST http://localhost:8080/api/protocol/check \
  -H "Content-Type: application/json" \
  -d '{"text":"احسب زكاة المال 1000"}'
```

### اختبار 2: توجيه المجال
```bash
curl -X POST http://localhost:8080/api/protocol/route \
  -H "Content-Type: application/json" \
  -d '{"text":"احسب زكاة المال 1000"}'
```

### اختبار 3: الاستدلال العصبي
```bash
curl -X POST http://localhost:8080/api/master-ncn/infer \
  -H "Content-Type: application/json" \
  -d '{"text":"احسب زكاة المال 1000"}'
```

### اختبار 4: Pipeline الموحد الكامل
```bash
curl -X POST http://localhost:8080/api/sheikha-pipeline/command \
  -H "Content-Type: application/json" \
  -d '{"command":"احسب زكاة المال 1000"}'
```

---

## 📋 ملخص الـ APIs الجديدة

### `/api/protocol/*` (6 endpoints)
| الـ Endpoint | الطريقة | الوصف |
|----------|--------|--------|
| `/health` | GET | حالة البروتوكول |
| `/check` | POST | فحص الشريعة |
| `/route` | POST | توجيه المجال |
| `/process` | POST | معالجة شاملة |
| `/events` | GET | الأحداث الحديثة |
| `/standards` | GET | المعايير |

### `/api/master-ncn/*` (7 endpoints)
| الـ Endpoint | الطريقة | الوصف |
|----------|--------|--------|
| `/health` | GET | حالة الشبكة |
| `/infer` | POST | الاستدلال |
| `/process` | POST | المعالجة الكاملة |
| `/compare` | POST | مقارنة نصين |
| `/search` | POST | البحث في الخلايا |
| `/topology` | GET | المعمارية |
| `/domains` | GET | المجالات السبعة |

---

## 🔄 الترتيب الجديد للـ Pipeline

```
Protocol (Layer 1)
    ↓
Master NCN (Layer 2)
    ↓
SHL Execute (Layer 3)
    ↓
Grammar Analysis (Layer 4)
    ↓
Memory & Learning (Layer 5)
    ↓
CS Decision Engine (Layer 6)
    ↓
Dynamic Planner (Layer 7)
    ↓
Execution & Queue (Layer 8)
    ↓
Realtime Events (Layer 9)
    ↓
Dashboard (Layer 10)
```

---

## 🎯 النقاط المهمة

✅ **البروتوكول الآن في المقدمة**
- فحص شريعة أول شيء
- توجيه مجال مباشر

✅ **الشبكة العصبية الآن ثانية**
- 100 خلية في 6 طبقات
- 7 مجالات متخصصة

✅ **لا تكرار أو تعارض**
- كل طبقة لها دور واضح
- ترتيب تسلسلي منطقي

✅ **APIs رسمية كاملة**
- توثيق دقيق
- أخطاء معالجة
- استجابات موحدة

---

## 💾 الملفات الجديدة

```
routes/
├── protocol.routes.js           ← 6.8K (5 endpoints)
├── master-ncn.routes.js         ← 9.4K (6 endpoints)
└── sheikha-command-pipeline.routes.js (معدَّل)

server.js (معدَّل)
├── app.use('/api/protocol', ...)
└── app.use('/api/master-ncn', ...)
```

---

## 🧪 اختبار متقدم (Node.js)

```javascript
(async () => {
  // Test Protocol
  const protocol = await fetch('http://localhost:8080/api/protocol/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: 'احسب زكاة المال'})
  }).then(r => r.json());
  
  console.log('Protocol:', protocol.data.verdict);
  
  // Test Neural
  const neural = await fetch('http://localhost:8080/api/master-ncn/infer', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: 'احسب زكاة المال'})
  }).then(r => r.json());
  
  console.log('Neural Domain:', neural.data.domain);
  console.log('Confidence:', neural.data.confidence);
  
  // Test Full Pipeline
  const pipeline = await fetch('http://localhost:8080/api/sheikha-pipeline/command', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({command: 'احسب زكاة المال'})
  }).then(r => r.json());
  
  console.log('Pipeline Path:', pipeline.data.pipeline.path);
})();
```

---

## ⚡ الخطوات التالية

1. ✅ تفعيل البروتوكول و Master NCN — **مُكتمل**
2. ⬜ إضافة Dashboard metrics الجديدة
3. ⬜ تحسين معالجة الأخطاء
4. ⬜ إضافة logging مفصل
5. ⬜ توثيق API كاملة

---

## 📞 الدعم والمساعدة

**للأسئلة:**
- اطلع على `SHEIKHA-PROTOCOL-AND-NCN-ACTIVATION.md`
- اطلع على `SHEIKHA-USAGE-GUIDE.md`
- اطلع على `SHEIKHA-ARCHITECTURE.md`

**للاختبار:**
```bash
npm run qa:all          # QA كامل
npm run test            # اختبارات Unit
npm start               # تشغيل الخادم
npm run dev             # وضع التطوير
```

---

**الحالة:** ✅ مُفعّلة وجاهزة للعمل  
**الإصدار:** 2.0.0  
**التاريخ:** 26 أبريل 2026

بسم الله الرحمن الرحيم
