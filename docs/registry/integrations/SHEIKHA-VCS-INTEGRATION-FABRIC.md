# Sheikha VCS Integration Fabric

## الهدف

تفعيل تكامل Git / GitHub / GitLab كطبقة منصة مستقلة داخل Runtime، وليس كميزة محصورة داخل VS Code Extension.

## القاعدة

Version-control integrations are platform runtime capabilities first; IDE extensions are only clients.

## الطبقات

- Git Runtime Awareness
- GitHub Pull Request Awareness
- GitLab Merge Request Awareness
- Branch Sync Governance
- Commit / Push / Rebase Guard
- Checks Visibility
- Human Approval Before Risky Actions

## علاقة VS Code Extension

الإكستنشن لا يملك منطق التكامل، بل يستدعي طبقة Runtime / API / CLI المحكومة.

## الحوكمة

- لا تنفيذ مدمر مباشر.
- لا commit قبل diff.
- لا push قبل checks.
- لا تسجيل أسرار.
- موافقة بشرية عند العمليات المؤثرة.

## الحالة

ACTIVE

## الأصل

لا ضرر ولا ضرار
