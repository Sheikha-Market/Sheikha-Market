# Sheikha AI AL OS Governing Layer

## التعريف
`Sheikha AI AL OS Governing Layer` هي طبقة حاكمة لتكامل Sheikha مع بيئات التطوير وأنظمة التشغيل والحزم والإضافات.

الطبقة لا تدعي السيطرة الفعلية على كل نظام في العالم، بل توفر مصفوفة محولات تشغيل حاكمة يمكن توسيعها لكل نظام مباح ونافع وآمن بعد التثبت والمراجعة.

## النطاق
- VS Code Extension: التحرير، الشات، API، النشر، Debug، المسارات، الشبكة العصبية.
- Git: status، diff، branch، commit plan، review.
- GitHub: repository، pull request، release، actions.
- GitLab: merge request، CI، review.
- GitHub Copilot: مساعد اختياري داخل IDE، لا يكون مصدر حوكمة أو اعتماد.
- Linux: Pop!_OS، Debian، Ubuntu، Red Hat، Fedora، SUSE.
- Windows: 10، 11، 12.
- macOS: 12.0+.

## الحزم
- Linux: `.deb`, `.rpm`, `.tar.gz`, `snap`, `cli`.
- Windows: user installer, system installer, `.zip`, `cli`.
- macOS: `.dmg`, `cli`.

## مسارات API
- `GET /api/sheikha/enterprise-vscode-git/status`
- `POST /api/sheikha/enterprise-vscode-git/status`
- `POST /api/sheikha/enterprise-vscode-git/work-plan`
- `GET /api/sheikha/governing-os/status`
- `POST /api/sheikha/governing-os/status`
- `POST /api/sheikha/governing-os/package-plan`
- `POST /api/sheikha/governing-os/universal-integration-plan`

## الضوابط
- لا تعديل مؤثر بلا موافقة.
- لا نشر بلا خطة وفحص.
- لا أسرار داخل Git أو الحزم.
- لا اعتماد مباشر لمخرجات أي إضافة أو مساعد ذكاء صناعي بلا مراجعة.
- كل تكامل يبقى تحت حوكمة Sheikha والكتاب والسنة.
