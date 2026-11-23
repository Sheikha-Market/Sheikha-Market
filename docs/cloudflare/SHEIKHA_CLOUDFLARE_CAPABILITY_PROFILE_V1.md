# منظومة شيخة — ملف قدرات وصلاحيات Cloudflare (V1)

الحالة: إعداد محلي موثق؛ لا دمج، لا نشر، لا إنتاج، لا تغييرات DNS أو عقود أو دفع أو أسرار.
المستودع: `Sheikha-Market/sheikha-main-portal`؛ المرجع المحلي: `docs/canonical/environment/SHEIKHA-ASSISTANT-GOVERNANCE.md`.

## التحقّق من أدوات التطوير

- `cloudflare`: خادم Cloudflare API MCP الرسمي في Codex: `https://mcp.cloudflare.com/mcp`.
- `cloudflare-docs`: التوثيق الرسمي: `https://docs.mcp.cloudflare.com/mcp`.
- `cloudflare-agents-docs`: توثيق Agents SDK: `https://agents.cloudflare.com/mcp`.
- مهارات Cloudflare الرسمية: تم تثبيت 22 مهارة عامة في بيئة Codex.
- أدوات متاحة محلياً: Wrangler v4.156.2، cf CLI v0.15.0 (تجريبي).
- OAuth Cloudflare: اكتملت خطوة تسجيل الدخول لمجموعة القراءة أدناه؛ لا تفترض أن كل مورد مفعل أو أن التراخيص متاحة.

## طلب صلاحيات OAuth المؤكّد

عددها 24، وكلها قراءة/بيانات وصفية:

- `user:read`
- `account:read`
- `zone.read`
- `dns.read`
- `zone-settings.read`
- `ssl-and-certificates.read`
- `workers-scripts.read`
- `workers-observability.read`
- `workers-routes.read`
- `workers-ci.read`
- `workers-tail.read`
- `workers-kv-storage.metadata_read`
- `workers-r2.metadata_read`
- `d1.metadata_read`
- `queues.metadata_read`
- `ai.read`
- `ai-model.read`
- `aig.read`
- `agw.read`
- `vectorize.read`
- `account-analytics.read`
- `logs.read`
- `zone-waf.read`
- `access.read`

## صلاحيات محجوبة افتراضياً

- كل `.write` وعمليات النشر والتعديل والحذف وإبطال الصلاحيات، بما فيها `dns.write` و`workers-scripts.write` و`workers-routes.write`.
- لا توسّع التفويض تلقائياً؛ كل تغيير صلاحية يستلزم موافقة بشرية من Cloudflare وتوافقاً مع حوكمة شيخة.
- لا تستنسخ OAuth tokens أو API keys إلى الشفرة، أو المستودع، أو سجلات التتبّع.

## مسارات قدرات متقدمة — غير معتمدة إنتاجياً

| الطبقة | التقنيات | الحالة الآن |
|---|---|---|
| الحوسبة والوكلاء | Workers، Agents SDK، Durable Objects، Workflows | أدوات ووثائق متاحة؛ لا نشر |
| الذكاء والنماذج | Workers AI، AI Gateway، Vectorize، AI Search | نطاق قراءة للتقييم؛ الربط العملي غير مثبت |
| البيانات | R2، D1، KV، Queues، Hyperdrive | قراءة البيانات الوصفية لبعض الخدمات؛ لا إنشاء موارد |
| المراقبة | Workers Observability، Logs، Traces | نطاق قراءة؛ Trace sampling وحفظ المحتوى لم يُفعَّلا |
| الأمن | Cloudflare One، Access، WAF، SSL، DNS | الاطلاع فقط؛ تغييرات السياسة محجوبة |

## بوابات التشغيل

1. افحص المصدر ومسؤولية كل طلب وWorker والـCron قبل Instrumentation أو تغيير Bindings.
2. ابدأ بتتبّع البيانات الوصفية فقط، ولا تخزّن محتويات طلبات المستخدمين أو الأدوات دون موافقة صريحة.
3. اعزل الإنتاج عن مختبر التحقق؛ لا تختبر الاستدعاءات المجدولة على المال أو الطلبات التجارية.
4. راجع الأذونات والأصول والمعرفات من الموصل بحساب ذي صلاحية، وتحقق من الاعتمادات دون عرضها.
5. قبل أي تعديل منتج: مراجعة مستقلة + موافقة بشرية + اختبارات محلية + دليل Rollback.

## فحص آمن في Codex

```bash
codex mcp list
wrangler --version
cf --version
```

لا تشغّل `wrangler deploy` أو `cf deploy` أو أي `write` استناداً إلى هذا الملف.

المراجع: https://developers.cloudflare.com/agent-setup/codex/ ؛ https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/ ؛ https://developers.cloudflare.com/workers/authorization/


## نتيجة تحقق الاتصال الفعلي — 2026-11-13

- OAuth عبر `codex mcp login cloudflare --scopes ...`: **نجح** (رمز الخروج 0).
- وجود خوادم MCP الثلاثة في `codex mcp list`: **متحقق**.
- الفحص غير التفاعلي لقراءة نطاق `sheikha.top` عبر Codex: **BLOCKED**؛ لم تتوفر أدوات zone-access وقت الاختبار.
- سجل عملية Codex أظهر أخطاء تهيئة/نقل لبعض خوادم MCP؛ لا يجوز تفسيرها على أنها تأكيد لمنح الصلاحيات على موارد الحساب.
- طلبات HEAD العامة دون مصادقة لخادم API أعادت HTTP 401، وخادمَي الوثائق أعادا HTTP 405؛ هذا لا يثبت اتصال جلسة OAuth نفسها.
- الخطوة التالية: بعد إعادة فتح جلسة Codex، راجع `/mcp` ثم اختبر استعلام `zone.read` فقط دون تعديل.
