# Sheikha Enterprise Git Service

## التعريف

`Sheikha Enterprise Git Service` هي خدمة Git مؤسسية لمزود خدمة الذكاء الصناعي Sheikha. تدير PR/MR، المراجعة، الدمج، الإصدار، والنشر تحت حوكمة Sheikha.

## المسارات

- `GET /api/sheikha/enterprise-git-service/status`
- `POST /api/sheikha/enterprise-git-service/status`
- `POST /api/sheikha/enterprise-git-service/pr-mr-plan`

## الأنظمة

- Git
- GitHub PR
- GitLab MR
- GitHub Copilot كأداة اقتراح اختيارية
- VS Code Extension
- Sheikha AI Provider

## القاعدة التنفيذية

1. لا PR/MR قبل `git status` وقراءة `diff`.
2. لا merge قبل الاختبار والمراجعة.
3. لا push أو tag أو release بلا موافقة المالك.
4. لا أسرار أو مفاتيح داخل Git.
5. Sheikha هي طبقة الحوكمة والاعتماد، وCopilot أداة مساعدة فقط.

## نموذج الخدمة

- فرع عمل واضح.
- خطة PR/MR.
- اختبارات وفحوصات.
- مراجعة بشرية.
- دمج بعد الاعتماد.
- خطة إصدار ونشر.
