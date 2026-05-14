# SHEIKHA VS Code Power Activation

## الهدف
توحيد عمل VS Code مع Runtime وGitHub وPM2 وشبكة الخلايا الجذرية.

## المكونات
- VS Code Settings
- VS Code Tasks
- Runtime Verification
- Root Neural Cells Status
- GitHub Flow
- PM2 Restart
- Fingerprint Update

## نقاط التحقق
- /api/health
- /api/runtime
- /api/root-neural-cells/status
- /api/consulting/status

## القاعدة
أي تعديل جوهري في runtime/server يجب أن يتبعه:
1. node --check server.js
2. bash tools/runtime/update-fingerprint.sh
3. pm2 restart sheikha-main-portal --update-env
4. اختبار APIs
