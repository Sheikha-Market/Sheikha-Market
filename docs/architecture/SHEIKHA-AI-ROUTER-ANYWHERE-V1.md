# Sheikha AI Router Anywhere V1

## الهدف

توسعة `Multi-Model Router` الموجود في Sheikha-Core إلى طبقة تكامل موحدة يمكن استهلاكها من:

- التطبيقات
- وكلاء البرمجة
- بيئات التطوير المتكاملة IDEs
- SDKs
- عملاء MCP

هذه الطبقة لا تدعي أن مزودًا خارجيًا متصل فعليًا لمجرد وجود ملف تعريف أو مفتاح في البيئة.

## الهيكل

```text
Applications / Coding Agents / IDEs / SDKs / MCP Clients
        ↓
Surface Adapters
        ↓
Identity + Secret Boundary + Data Classification
Authorization + Cost + Model Capability + Safety
        ↓
Sheikha AI Router
        ↓
Local Sheikha Runtime / Ramp Router / OpenRouter
        ↓
Usage Metering + Trace + Audit
```

## المسارات المحلية

- `GET /api/ai-core/router-anywhere/status`
- `GET /api/ai-core/router-anywhere/guides`
- `POST /api/ai-core/router-anywhere/plan`

المسار POST هو **خطة فقط** ولا ينفذ اتصالًا خارجيًا.

## Ramp Router

الملف التعريفي المحلي:

- Base URL: `https://api.router.com/v1`
- Secret env: `RAMP_ROUTER_API_KEY`
- Model env: `RAMP_ROUTER_MODEL`
- Model discovery: `GET /v1/models`
- OpenAI-facing protocol: Responses API
- Anthropic-facing protocol: Messages-compatible path حسب الدليل الرسمي

أدلة الإعداد المسجلة:

- https://docs.router.com/getting-started
- https://docs.router.com/getting-started/connect
- https://docs.router.com/getting-started/quickstart

## OpenRouter

الملف التعريفي المحلي:

- Base URL: `https://openrouter.ai/api/v1`
- Secret env: `OPENROUTER_API_KEY`
- MCP: `https://mcp.openrouter.ai/mcp`
- Client SDKs: TypeScript / Python / Go
- Agent SDK: مسار مستقل للوكلاء والأدوات والحالة

أدلة الإعداد المسجلة:

- https://openrouter.ai/docs/quickstart
- https://openrouter.ai/docs/client-sdks/overview
- https://openrouter.ai/docs/client-sdks/usage-for-agents
- https://openrouter.ai/docs/guides/coding-agents/claude-code-integration
- https://openrouter.ai/developers

## الحوكمة

- لا حفظ للمفاتيح في Git.
- لا عرض لقيمة أي مفتاح.
- وجود المفتاح في البيئة لا يعني وجود تفويض.
- وجود ملف تعريف لا يعني وجود اتصال حي.
- لا install تلقائي.
- لا network fetch تلقائي.
- لا spend تلقائي.
- لا deploy أو production أو merge.
- المهام عالية الأثر تحتاج مراجعة بشرية.
