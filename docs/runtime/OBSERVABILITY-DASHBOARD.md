# Runtime Observability Dashboard
## لوحة الرصد التشغيلية

**الهدف:** عرض حالة التشغيل والذاكرة والسرعة والانحراف بشكل مباشر وبسيط.

---

## 1. المصدر الحي للبيانات

```text
GET /api/observability/summary
```

هذا الـ endpoint يقرأ آخر السطور من:

- `data/runtime-metrics/memory.ndjson`
- `data/runtime-metrics/event-loop.ndjson`
- `data/runtime-metrics/restart.ndjson`
- `data/runtime-metrics/drift.ndjson`
- `data/runtime-metrics/latency.ndjson`

---

## 2. لوحة سريعة

| Stream | Purpose | Healthy Signal | Warning Signal |
|---|---|---|---|
| Memory | ضغط الذاكرة | `heapPercent < 85` و `rss < 512MB` | `pressure: true` |
| Event Loop | تأخير الحلقة | `p95Ms < 200` | `p95Ms >= 200` |
| Restart | استقرار العملية | `restarts` ثابتة | ارتفاع متكرر |
| Drift | عدم الانحراف | `status: verified` | `status: mismatch` |
| Latency | سرعة الاستجابة | أغلب الطلبات < 1000ms | `slow: true` |

---

## 3. قراءة حالية مقترحة

```json
{
  "ring": "stable",
  "runtime": {
    "node": "v22.22.2",
    "port": 8080
  },
  "fingerprint": {
    "status": "verified"
  }
}
```

هذه القيم تأتي من `/api/runtime`، بينما تفاصيل streams تأتي من `/api/observability/summary`.

---

## 4. كيف تستخدم اللوحة

1. افتح `/api/observability/summary` لمشاهدة الملخص الحي.
2. راقب `memory.ndjson` إذا ظهرت `pressure: true`.
3. راقب `drift.ndjson` إذا ظهر `status: mismatch`.
4. راقب `restart.ndjson` إذا ارتفع العداد بعد reset.
5. راقب `latency.ndjson` إذا زادت الطلبات البطيئة.

---

## 5. قواعد القرار

- إذا كانت `fingerprint.status = verified` والـ streams خضراء، فالحالة مستقرة.
- إذا ظهر ضغط ذاكرة متكرر، فالمسار التالي هو التحليل على مستوى الكاش والـ retained objects.
- إذا ارتفع restart count بعد reset، فهذا يعني crash loop أو إعادة تحميل متكررة.
- إذا ظهر drift، فلا يُعتمد أي تغيير حتى تحديث fingerprint والتأكد من البصمة.

---

## 6. الرابط مع التشغيل

- مصدر التشغيل: `stable/runtime-baseline`
- السياسة المرجعية: [POLICY.md](POLICY.md)
- الـ runtime rings: `dev`, `canary`, `stable`, `production`

---

## 7. ملاحظة تنفيذية

هذه اللوحة مقصودة أن تبقى بسيطة ومباشرة:

- لا تعتمد على تبعيات جديدة.
- لا تضيف طبقة UI معقدة الآن.
- استخرج الرؤية من الـ NDJSON مباشرة.
- ابقِ القرار التشغيلي قابلاً للتتبع.
