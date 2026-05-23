# Sheikha Enterprise VS Code Git Integration

## التعريف
هذه الطبقة تربط منظومة Sheikha مع VS Code وGit وGitHub وGitLab وGitHub Copilot كبيئة تطوير مؤسسية وتجارية محكومة.

Sheikha هي طبقة التنظيم والاعتماد والحوكمة. GitHub Copilot، وأي إضافة أخرى، أدوات مساعدة فقط ولا تعتمد مخرجاتها إلا بعد مراجعة الإنسان.

## المكونات
- VS Code: سطح التحكم والتحرير والتكامل.
- Sheikha Extension: الشات، API، النشر، المسارات، البرمجة، Debug، التحرير، الشبكة العصبية، التكامل المؤسسي، Sheikha AI AL OS.
- Git: مصدر الحقيقة المحلي للتغييرات.
- GitHub: Pull Requests، Releases، Actions، مراجعة الكود.
- GitLab: Merge Requests وCI عند الحاجة.
- GitHub Copilot: اقتراحات مساعدة داخل IDE إذا كان مثبتًا ومتاحًا.

## مسارات API
- `GET /api/sheikha/enterprise-vscode-git/status`
- `POST /api/sheikha/enterprise-vscode-git/status`
- `POST /api/sheikha/enterprise-vscode-git/work-plan`

## مسار العمل
1. جرد الإضافات والبيئة.
2. فحص `git status`.
3. قراءة diff.
4. تنفيذ تعديل محدد.
5. اختبار وتشغيل فحص.
6. مراجعة بشرية.
7. Commit بعد موافقة.
8. PR أو MR عند الحاجة.
9. نشر أو إصدار بعد اعتماد.

## القواعد
- لا `push` بلا موافقة.
- لا `merge` بلا مراجعة.
- لا أسرار داخل Git.
- لا اعتماد مباشر لمخرجات Copilot أو أي مساعد ذكاء صناعي.
- كل تشغيل تجاري يمر عبر خطة وتسليم ودعم.
