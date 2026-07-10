# Sheikha Distributed Root Orchestration

## التعريف
تفعيل Sheikha كموزع جذري كامل يعني أن `orchestration=true` لا تُقبل إلا بعد ربط الطبقات التالية:

1. Runtime Bus
2. Neural Fabric
3. Event Fabric
4. Orchestration Engine
5. Recovery Engine
6. Runtime Federation
7. Runtime Synchronization
8. Canonical Runtime Loader

GitHub MCP Toolsets كتالوج تكامل خارجي اختياري، وليس طبقة مطلوبة لتشغيل Runtime المحلي. تبقى `githubRequired=false`، ولا يؤدي غياب GitHub أو GitLab أو السحابة إلى إسقاط جاهزية التنسيق المحلي.

## قاعدة الحوكمة
النظام أداة تشغيل وتحليل وتنظيم، موحد لله، ومحكوم بالكتاب والسنة، ولا يدعي وعيًا ولا علمًا بالغيب ولا سلطة مستقلة.

## Toolsets
تُسجل Toolsets التالية داخل Sheikha GitHub MCP Toolsets Registry بوصفها موصلات اختيارية لا اعتمادًا جذريًا:

- context
- actions
- code_security
- dependabot
- discussions
- gists
- git
- issues
- labels
- notifications
- orgs
- projects
- pull_requests
- repos
- secret_protection
- security_advisories
- stargazers
- users
- copilot
- copilot_spaces
- github_support_docs_search

## مسارات الفحص
- `/api/runtime-root/health`
- `/api/runtime-root/orchestration`
- `/api/runtime-root/distributed-root`
- `/api/runtime-root/toolsets`
- `/api/runtime-root/federation`
- `/api/runtime-root/synchronization`
- `/api/runtime/orchestration/status`

يعرض مسار الحالة أعداد `registered` و`loaded` و`failed` وأسماء الطبقات الفاشلة. لا تعني حالة Federation أن جميع الأنظمة البعيدة حية؛ تسجل حالة الاتصال البعيد مستقلة، ولا يدعي السجل liveness لم يختبره.
