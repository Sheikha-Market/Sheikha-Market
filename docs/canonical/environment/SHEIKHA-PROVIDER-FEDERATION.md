# تكامل حسابات شيخة

بسم الله الرحمن الرحيم.

## النطاق

مرجع مشترك لـ Google Cloud وFirebase وGoogle Workspace وCloudflare وGitHub وCopilot وChatGPT وCodex.
المقصود توحيد هويات الموارد والحوكمة وسياق المشروع، وليس دمج الحسابات أو كلمات المرور أو نقل موافقات الأدوات.
قيم الكتاب والسنة مرجعية للمشروع، وليست شهادة امتثال آلية.

- سجل الربط: `config/integrations/sheikha-provider-federation-v1.json`.
- مرجع الصلاحيات: `docs/canonical/environment/SHEIKHA-ASSISTANT-GOVERNANCE.md`.
- مورد الجسر المحلي: `sheikha://integration/providers`، للقراءة فقط ودون طلبات شبكية أو تشغيل أوامر.
- مرجع الكود المحلي: المستودع الحالي؛ أي دفع إلى GitHub أو نشر سحابي عمل مستقل يحتاج اعتمادًا.

## خريطة الربط

| البيئة | الهوية المتوقعة | حدود الربط |
| --- | --- | --- |
| Google Cloud | `sheikha-marketplace`، رقم `952025946298` | قراءة هوية المشروع؛ لا تغيير موقع أو IAM أو فوترة |
| Firebase | نفس معرف ورقم مشروع Google Cloud | فحص `projects.get`؛ لا تفعيل خدمات أو إنشاء تطبيق أو نشر Hosting |
| Google Workspace | النطاق ومعرف العميل غير مؤكدين في السجل | لا قراءة بريد أو ملفات أو إدارة مستخدمين أو تفويض على مستوى النطاق |
| Cloudflare | معرف الحساب المثبت في السجل | الموصل المستقل الموجود؛ لا تغيير DNS أو Workers |
| GitHub | `Sheikha-Market/sheikha-main-portal` | قراءة بيانات المستودع؛ لا دفع أو تعديل Actions |
| GitHub Copilot | المستودع نفسه | تعليمات مشتركة؛ الاشتراك والجلسة غير متحققين |
| ChatGPT وCodex | `sheikha-readonly` | نفس مرجع الحوكمة؛ مصادقة كل بيئة تبقى مستقلة |

المعرفات ليست أسرارًا ولا تثبت بمفردها الملكية أو التفويض. Firebase وGoogle Cloud يشتركان في هوية المشروع وIAM والفوترة عندما يكونان المشروع نفسه، لكن خدمة Workspace لها نطاق وعميل وموافقات منفصلة. راجع [وثائق Firebase](https://firebase.google.com/docs/projects/use-firebase-with-existing-cloud-project).

## التشغيل والتحقق

الفحص الافتراضي محلي، لا يشغّل موصلات من ملفات الإعداد ولا يقرأ مخازن كلمات المرور:

```bash
node tools/environment/sheikha-provider-federation-check.cjs
```

الفحوص التالية اختيارية، تستخدم جلسات `gcloud` و`gh` الحالية لطلبات قراءة محددة:

```bash
node tools/environment/sheikha-provider-federation-check.cjs --probe-google --probe-github
```

لا تُستخدم بيانات اعتماد Google مع غير `firebase.googleapis.com` في فحص Firebase، ولا تُطبع أو تُحفظ الرموز. الطلب لا يتبع تحويلات وله مهلة وحد للحجم. فشل المصادقة أو عدم تطابق معرف المشروع لا يشغّل تسجيل دخول أو إصلاح صلاحيات تلقائيًا. أدوات CLI قد تحدّث سجلاتها أو مخبأ المصادقة المعتاد خارج المشروع؛ تحتاج صلاحية المضيف لذلك.

`READ_VERIFIED` يعني نجاح قراءة بيانات المورد وتطابق الهوية في وقت الفحص فقط، وليس نجاح كل وظائفه أو تفويض الكتابة. `CONFIGURED_NOT_VERIFIED` لا يعني اتصالًا حيًا. `REVIEW_REQUIRED` يعيد رمز خروج `2` ويبين ما يحتاج مراجعة. لا يرفع أي فحص `productionAdmission` عن `HOLD`، ولا يفعّل مزامنة الحسابات.

بعد إعادة تحميل الجسر يمكن للعملاء المحليين قراءة المورد نفسه. نجاح اختبار stdio لا يثبت تحميله في جلسة ChatGPT السحابية أو Copilot الحالية. مرجع إعداد كل عميل مستقل: [MCP لـ Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)، [MCP لـ VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers)، [تعليمات Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions).

## المتبقي قبل المزامنة الخارجية

1. تأكيد نطاق Workspace ومعرف العميل واختيار البيانات المسموح تداولها. لا ترسل مفاتيح أو كلمات مرور.
2. مراجعة هوية وصلاحيات حساب الخدمة أو OAuth لكل خدمة، بأقل نطاق لازم. لا تفعيل تلقائي لتفويض Workspace على مستوى النطاق.
3. تحديد مصدر الحقيقة واتجاه المزامنة وتصنيف البيانات وآلية فض التعارض، ثم اختبار بيانات غير حساسة.
4. اعتماد مستقل للنشر وموقع البيانات والميزانية. لا توجد مزامنة خلفية أو جدول جديد في هذا التغيير.

لربط GitHub Actions بالنشر في Google Cloud مستقبلًا يمكن استخدام OIDC وWorkload Identity Federation بصلاحيات مقيدة بالمستودع والبيئة المعتمدة، دون مفاتيح خدمة طويلة العمر. هذا تصميم لاحق غير مفعّل: [مرجع Google الرسمي](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines).

## ملاحظات الفحص في 2026-11-22

- Cloudflare: نجحت قراءة الحساب عبر الموصل الموجود وتطابق مع المعرف المسجل. لم يُعَد تدقيق تقرير المكونات الخمسة والعشرين.
- Google Cloud: نجحت قراءة المشروع ورقمه وحالته `ACTIVE`؛ وظهرت علامتا `firebase=enabled` و`firebase-core=disabled`. العلامات وحدها ليست اختبارًا لخدمات Firebase.
- GitHub: نجحت قراءة المستودع المتوقع؛ خاص، غير مؤرشف، وفرعه الافتراضي `main`.
- إعداد `servers.cloudflare` الصحيح موجود مسبقًا في `.vscode/mcp.json`؛ لم يضف موصلًا مكررًا.
- يحتوي الملف نفسه أيضًا على قسم `mcpServers` إضافي. الفاحص يبلّغ عنه للمراجعة ولا ينقل تعريفاته أو يشغّل أوامره أو يعرض متغيراته. لم تُحذف إعدادات جلسة أخرى.
- نتائج هذا القسم تاريخية وليست إثباتًا لاتصال مستمر أو أرباح أو تشغيل أجهزة.
