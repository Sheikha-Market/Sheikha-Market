# تنظيم مراجعة مشروع شيخة — 17 أكتوبر 2026

SHEIKHA Global Runtime Platform · SHEIKHA UGIT-RP

الحالة: `ORGANIZED_REVIEW_OPEN_REPAIRS`. تجمع هذه الحزمة نتائج المراجعة المحلية المنفذة في الجلسة يومي 16 و17 أكتوبر 2026، وتحدد متابعة قابلة للمراجعة. لم تُنفذ الإصلاحات المسجلة فيها. المرجع: [Root Source of Truth](../../ROOT-SOURCE-OF-TRUTH.md).

## الملفات

| الملف | الغرض |
|---|---|
| [review-index.json](review-index.json) | خريطة المشروع، مسارات الأدلة، مستويات التحقق وحدود النطاق |
| [repair-backlog.json](repair-backlog.json) | قائمة الإصلاحات الوحيدة لهذه المراجعة، بأولويات ومعايير قبول |
| [git-change-inventory.json](git-change-inventory.json) | لقطة الملفات المتغيرة قبل التنظيم، مصنفة حسب موضعها وغرضها |
| [SHA256SUMS](SHA256SUMS) | بصمات ملفات الحزمة الأربعة وقت إغلاق التوثيق |

لقطة Git ليست قائمة ملفات مسموحة للإضافة أو الحذف أو الدمج. التصنيف مبني على المسار فقط؛ تصنيف `runtime-evidence-and-state` لا يعني أن محتوياته قابلة للحذف أو أنها مولدة تلقائيًا.

## الحالة المثبتة

| المجال | ما تحقق محليًا | المتابعة |
|---|---|---|
| Git | `main` عند `a97eb0c9e21808ea4ffdace5b437d33645a914e9`؛ فرق `HEAD...origin/main` المحلي صفر/صفر؛ فحص whitespace ناجح | قبل التنظيم: 239 ملفًا متتبعًا معدّلًا و1515 ملفًا غير متتبع، دون تغييرات staged؛ لم يُنفذ fetch |
| AI Router | افتراضي محلي؛ اختبارات runtime وprovider-hierarchy نجحت؛ فحوص المدقق المعزولة نجحت | إغلاق فجوتي الإفصاح الخارجي والتحقق من عنوان Hostinger أولًا |
| Hostinger AI adapter | بناء الطلب، ضوابط التوكنات ومعالجة HTTP 503 نجحت ببيانات مصطنعة وناقل وهمي | الاتصال الحي غير متحقق؛ fallback والتحقق من الردود يحتاجان إصلاحًا |
| توزيع V2→V3 | ست حزم V2 وحزمة V3 موجودة ومطابقة للبصمات والأحجام؛ دوال الحالة القرائية نجحت | تسوية اختلاف بصمة الفهرس وتقوية فاحص الثبات؛ V3 يسجل صفر ملفات desktop executable |
| عقد API V2 | المساعد والمدقق متاحان للفحص المعزول | موضع timestamp غير متسق، والتحقق من requiredDataKeys يقبل data:null، وبعض المسارات لا تطبق الغلاف المعلن |
| سجل البوابتين | JSON سليم؛ البصمات الخمس المطبوعة في verify_portals.py مطابقة | سجل Enterprise وremote المحلي مختلفان؛ لا يوجد إثبات مسار مستقل له ضمن Projects/sheikha |

## خريطة المسارات

| المجال | المسار المرجعي |
|---|---|
| Main Portal | `/home/sheikha/Projects/sheikha/sheikha-main-portal`؛ `origin`: `Sheikha-Market/sheikha-main-portal` |
| Enterprise Portal في سجل البوابتين | `Sheikha-top/sheikha-enterprise-portal`؛ الإثبات المسجل صورة، وفحص API السابق أعاد 404 |
| remote باسم enterprise في Main Portal | `Sheikha-Market/sheikha-enterprise-portal`؛ وجود remote لا يثبت وجود مجلد محلي أو صلاحية الوصول |
| Router factory والحوكمة والناقل | [lib/sheikha-ai-router.js](../../../../../lib/sheikha-ai-router.js)، [مجلد الطبقات](../../../../../lib/sheikha-ai-router/)، [routes/ai.js](../../../../../routes/ai.js) |
| Router Anywhere | [core/ai-router](../../../../../core/ai-router/)؛ خطط تكامل `PLAN_ONLY` |
| Hostinger MCP | `/home/sheikha/.codex/config.toml`: `streamable_http`؛ `/home/sheikha/codex/config.toml`: `stdio/npx` |
| اختيار Codex في بيئة المراجعة | `CODEX_HOME=/home/sheikha/codex`؛ لا يُعمم على كل طرفية أو تطبيق |
| أمر Codex | `/home/sheikha/.local/bin/codex` يشير إلى `/home/sheikha/codex/plugins/.plugin-appserver/codex`؛ لم يُعد اختبار التشغيل التفاعلي |
| السجل الرقمي للبوابتين | [docs/governance/github-accounts/portals](../../../../governance/github-accounts/portals/)؛ الملفات الأساسية مستثناة حاليًا من Git |
| توزيع V2 وV3 | [distribution/artifacts/v2](../../../../../distribution/artifacts/v2/)، [distribution/artifacts/v3](../../../../../distribution/artifacts/v3/) |
| سجل عقد API V2 | [runtime/api-contract-registry/v2](../../../../../runtime/api-contract-registry/v2/) |

موصل إدارة Hostinger عبر MCP مستقل عن محول AI في `lib/sheikha-ai-router/hostinger-upstream.js`. تسجيل أي منهما أو ظهور إعداداته لا يثبت نجاح المصادقة أو الاتصال.

## ترتيب المتابعة

1. `AI-001` و`AI-002`: التفويض قبل الإفصاح الخارجي وتوحيد سياسة عنوان المزود.
2. `GIT-001`: إسناد التغييرات الحالية ومراجعتها في مجموعات محددة، مع حفظ أعمال المستخدم.
3. `AI-003` إلى `AI-006`: حدود المدخلات، صحة الردود، fallback والمهلة.
4. `DIST-001` و`DIST-002` و`API-001` و`API-002`: التوافق والبصمات وإثبات العقود.
5. `PATH-001` و`MCP-001` و`DOC-001`: تسوية المسارات ووضوح إعداد الموصل والتوثيق.

يحتوي كل بند في [repair-backlog.json](repair-backlog.json) على أدلته ومعيار قبوله. جميع البنود مفتوحة، وتُنفذ لاحقًا ضمن نطاق صريح. لم يُنقل أي ملف قديم أو يُحذف، ولم تُنشأ مجموعات Git staged أو commits.

## التحقق وحدود الإثبات

نجحت الاختبارات المعزولة للراوتر والمزود، وستة فحوص لمحاكاة ناقل Hostinger، وفحص سجل البوابتين، وحساب بصمات الحزم، وفحص helpers الخاص بالعقد. رُوجعت الآثار الجانبية قبل التنفيذ؛ لم تُشغّل أدوات activation أو generate أو pipelines التاريخية. لم تُقرأ `.env` ولم تُحفظ مفاتيح أو رموز وصول في الحزمة.

شمل التنظيم إضافة مدخل هذه المراجعة في الفهرس المرجعي وتصحيح الرابط النسبي الموجود فيه لمواصفة لغة شيخة. اجتازت ملفات JSON الثلاثة والروابط المحلية ومراجع الأدلة وبصمات المصادر فحوص الاتساق؛ لم تُعد اختبارات التشغيل أثناء إنشاء التوثيق.

تعكس النتائج تحققًا محليًا محدد النطاق. لم تُختبر شبكة Hostinger أو مصادقته أو Azure أو GitHub الحالي أو الإنتاج. بيانات Azure الواردة في المحادثة السابقة ليست قياسًا حيًا ضمن هذه المراجعة. نتائج اختبارات 16 أكتوبر محفوظة هنا بوصفها نتائج الجلسة، ولا تُوصف بأنها أعيدت كلها في 17 أكتوبر.

لفحص سلامة ملفات التوثيق فقط، من جذر المشروع:

```bash
python3 -I -S -B -m json.tool docs/canonical/registry/reviews/2026-10-17/review-index.json >/dev/null
python3 -I -S -B -m json.tool docs/canonical/registry/reviews/2026-10-17/repair-backlog.json >/dev/null
python3 -I -S -B -m json.tool docs/canonical/registry/reviews/2026-10-17/git-change-inventory.json >/dev/null
```

ولفحص البصمات، من داخل مجلد هذه الحزمة: `sha256sum --check SHA256SUMS`.
