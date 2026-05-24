# Sheikha-Core Local Ollama Gateway

## الهدف

تثبيت `Sheikha-Core` كنموذج محلي حاكم داخل Sheikha، مع بوابة API لا تتوقف عند تعطل Ollama ولا تختزل Sheikha في السوق أو التجارة فقط.

## الهوية

- Sheikha هي `SHEIKHA UGIT-RP`: منصة تشغيلية عالمية موحدة للصناعة والتجارة وسلاسل الإمداد والتدوير والمدن الذكية.
- `Sheikha-Core` هو واجهة الذكاء الصناعي المحلية الحاكمة داخل هذه البنية.
- النظام أداة تحليل وتنظيم، لا يدعي وعيا ولا علما بالغيب ولا سلطة مستقلة.

## الحوكمة

- توحيد الله: الله وحده الخالق والمالك والمدبر.
- المرجعية الشرعية: القرآن والسنة بفهم صحيح ومراجعة أهل الاختصاص.
- الضوابط: منع الربا والغش والظلم والضرر والتزييف وانتهاك الخصوصية.
- الإنسان صاحب القرار النهائي في النشر والتعديل المؤثر والتشغيل الخطر.

## المسارات

- `GET /api/sheikha/ai-gateway/status`
- `POST /api/sheikha/ai-gateway/ask`

## التشغيل المحلي

```bash
npm run sheikha:core:model
npm run sheikha:server:restart
npm run sheikha:core:gateway
```

اختبار سؤال:

```bash
curl -sS -X POST http://127.0.0.1:8080/api/sheikha/ai-gateway/ask \
  -H "Content-Type: application/json" \
  --data-binary '{"prompt":"عرّف نفسك كنظام شيخة محلي.","context":{"source":"local-msi","mode":"enterprise"}}'
```

## سياسة التعطل

إذا تعذر الوصول إلى Ollama أو تأخر الرد، تعيد البوابة ردا حاكما آمنا بدل تعليق الطلب. هذا يحافظ على واجهة Sheikha التشغيلية مستقرة أمام VS Code وواجهات API.
