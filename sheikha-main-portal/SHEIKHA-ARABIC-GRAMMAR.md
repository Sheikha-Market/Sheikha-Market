# منظومة قواعد اللغة العربية الرقمية — SHEIKHA

## نظرة عامة
هذه المنظومة تضيف طبقة تحليل نحوي رقمية قابلة للربط مع:
- sheikha-code
- cs-language
- execution orchestrator

## الملفات الأساسية
- `lib/sheikha-arabic-grammar-rules.js`
- `lib/sheikha-arabic-grammar-engine.js`
- `routes/arabic-grammar.routes.js`
- `routes/sheikha-code-decision.routes.js`

## بنية الخلايا المعرفية
- خلايا القواعد النحوية: 75
- خلايا محرك التحليل: 60

## مسارات API
- `GET /api/arabic-grammar/health`
- `GET /api/arabic-grammar/rules`
- `GET /api/arabic-grammar/cells`
- `POST /api/arabic-grammar/analyze`
- `GET /api/sheikha-code-decision/health`
- `POST /api/sheikha-code-decision/command`

## مثال اختبار
```bash
curl -X POST http://127.0.0.1/api/arabic-grammar/analyze \
-H "Content-Type: application/json" \
-d '{"text":"كتب التاجر العقد"}'
```

```bash
curl -X POST http://127.0.0.1/api/sheikha-code-decision/command \
-H "Content-Type: application/json" \
-d '{"command":"رتب 5 3 1 4 2"}'
```
