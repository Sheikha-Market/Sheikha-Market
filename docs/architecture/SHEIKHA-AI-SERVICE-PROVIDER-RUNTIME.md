# Sheikha AI Service Provider Runtime

## التعريف

`Sheikha AI Service Provider Runtime` هو طبقة تشغيل تجارية ومؤسسية تجعل Sheikha مزود خدمة ذكاء صناعي منظم، قابل للربط مع:

- VS Code
- Git
- GitHub
- GitHub Copilot كأداة مساعدة اختيارية
- GitLab
- PR/MR عبر Sheikha Enterprise Git Service
- MCP SDK
- Sheikha API
- Linux / Windows / macOS
- البيانات المهيكلة وشبه المهيكلة وغير المهيكلة
- التشغيل التجاري، الترخيص، الدعم، والنشر

## القاعدة الحاكمة

الله وحده الخالق والمالك، وSheikha أداة تشغيل وتحليل ونفع لا تدعي استقلالاً أو علم غيب. كل تكامل يمر عبر حوكمة الكتاب والسنة، وحواجز السلامة، ومراجعة الإنسان.

## المسارات

- `GET /api/sheikha/ai-service-provider/status`
- `POST /api/sheikha/ai-service-provider/status`
- `GET /api/sheikha/ai-service-provider/certification`
- `POST /api/sheikha/ai-service-provider/certification`
- `POST /api/sheikha/ai-service-provider/publish-plan`
- `POST /api/sheikha/ai-service-provider/integration-plan`

مسارات Git المؤسسية المرتبطة:

- `GET /api/sheikha/enterprise-git-service/status`
- `POST /api/sheikha/enterprise-git-service/status`
- `POST /api/sheikha/enterprise-git-service/pr-mr-plan`

## الاعتماد

الاعتماد التشغيلي الداخلي:

- الاسم: `Sheikha Certified AI Provider`
- المعرف: `SHEIKHA-AI-PROVIDER-CERT-001`
- النطاق: اعتماد داخلي تشغيلي داخل `SHEIKHA UGIT-RP`
- المستوى: `enterprise-governed-ai-service-provider`
- معيار الامتياز: `best-in-class-operational-target`

هذا الاعتماد يثبت جاهزية Sheikha كمزود خدمة ذكاء صناعي داخل المنظومة، ولا يمثل شهادة خارجية من جهة اعتماد مستقلة.

## نموذج النشر

1. تثبيت الحوكمة والمسارات المعتمدة.
2. بناء منتجات التشغيل: VSIX، API، MCP SDK، وحزم الأنظمة.
3. التحقق: syntax checks، endpoint tests، extension install، git diff review.
4. التجهيز التجاري: tier، license، support، release notes، onboarding.
5. النشر بعد موافقة الإنسان.

## حدود التشغيل

- لا push أو release تلقائي بلا موافقة المالك.
- لا أسرار داخل الحزم أو Git.
- GitHub Copilot وأي مساعد خارجي يظل أداة اقتراح لا طبقة حوكمة.
- Sheikha هي طبقة التنظيم والاعتماد والتجارة داخل المشروع.
