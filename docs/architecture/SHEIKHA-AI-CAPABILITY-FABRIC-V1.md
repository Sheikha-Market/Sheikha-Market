# Sheikha AI Capability Fabric V1

## الهدف

توسعة ذكاء شيخة من مجرد مسار نموذج واحد إلى **نسيج قدرات محكوم** تحت هوية شيخة نفسها.

الهوية والسيادة لا تتغير:

```text
Sheikha Supreme AI Governance
        ↓
Sheikha AI Provider
        ↓
Sheikha AI Router
        ↓
Sheikha Capability Fabric
        ↓
Native Sheikha / Optional Adapters
```

## الحالة التشغيلية

### قدرات أصلية مفعلة داخل شيخة

- المحادثة النصية
- الاستدلال المتخصص داخل نطاقات شيخة
- RAG
- الوكلاء
- استدعاء أدوات شيخة
- التوجيه بين القدرات
- التوجيه بين المسارات
- الحوكمة، العزل، والتدقيق

### قدرات تعتمد على Adapter خارجي

هذه القدرات لا يُدَّعى أنها نشطة لمجرد وجود profile:

- Structured Outputs
- Streaming
- Vision
- Audio
- File / Video input
- Web Search
- Image generation
- Prompt caching
- Batching

لكل قدرة خارجية يجب أن يثبت:
1. أن الـadapter يدعمها.
2. أن المفتاح موجود في بيئة آمنة.
3. أن البيانات مصرح بخروجها.
4. أن الأثر والتكلفة ضمن السياسة.
5. أن التنفيذ مُفوّض.

## OpenRouter كـAdapter اختياري

OpenRouter لا يصبح هوية شيخة ولا الـupstream الافتراضي.

يمكن استخدامه فقط عندما تحتاج القدرة إلى نموذج/أداة خارجية لا يوفّرها المسار الأصلي.

المزايا التي تسجلها شيخة كقدرات Adapter تشمل:
- Auto Router
- Tool Calling
- Structured Outputs
- Web Search
- Model Fallbacks
- Provider Routing
- Streaming
- multimodal capabilities حسب النموذج

يجب التحقق من capability support الفعلي للنموذج قبل التنفيذ.

## الحوكمة

### البيانات المقيدة

`restricted / secret / highly-confidential`

لا تخرج إلى Adapter خارجي تلقائيًا.

### المهام عالية الأثر

لا تُوجّه تلقائيًا إلى مزود خارجي.

### التكاليف

لا يوجد Spend تلقائي. أي Adapter خارجي يخضع لحدود مفاتيح/ميزانية المزود ولحدود شيخة الداخلية.

### الخصوصية

حتى Zero Data Retention عند مزود خارجي لا يعني أن البيانات لم تغادر البيئة؛ لذلك تظل البيانات المقيدة محلية افتراضيًا.

## المسارات

```text
GET  /api/ai-core/capability-fabric/status
POST /api/ai-core/capability-fabric/plan
```

`plan` لا ينفذ اتصالًا خارجيًا. يعيد قرار الحوكمة وخطة المسار فقط.

## أمثلة

طلب محلي:

```json
{
  "capabilities": ["text-chat", "rag"],
  "dataClass": "internal"
}
```

القرار المتوقع: `ALLOW_NATIVE`.

طلب Web Search ببيانات مقيدة:

```json
{
  "capabilities": ["web-search"],
  "dataClass": "restricted",
  "allowExternal": true
}
```

القرار المتوقع: `DENY`.

طلب Structured Output ببيانات داخلية بدون تفويض خارجي:

```json
{
  "capabilities": ["structured-output"],
  "dataClass": "internal",
  "allowExternal": false
}
```

القرار المتوقع: `PLAN_EXTERNAL_ONLY`.

## المبدأ

شيخة لا تجمع مزودين لتصبح تابعة لهم؛ بل تستوعب قدراتهم عبر Adapters تحت حوكمة شيخة.

الـProvider الظاهر للمستهلك: `sheikha`.

الـupstream الافتراضي: `sheikha`.

كل مسار خارجي: اختياري، مقيد، قابل للعزل، وغير مفوض تلقائيًا.
