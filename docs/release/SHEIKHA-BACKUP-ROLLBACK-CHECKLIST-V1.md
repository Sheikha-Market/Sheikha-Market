# SHEIKHA BACKUP ROLLBACK CHECKLIST V1

Staging مسموح.

الإطلاق الربحي مؤجل حتى اكتمال النسخ الاحتياطي والاسترجاع والمراقبة.

## المطلوب قبل الربح

- نسخة احتياطية للبيانات.
- نسخة احتياطية لملفات البيئة.
- اختبار Rollback فعلي.
- تفعيل Monitoring/Alerts.
- توثيق مسار الدفع أو الإيراد.

## Rollback أساسي

```bash
git checkout sheikha-v1-production-candidate
npm install
npm run lint
npm test
pm2 restart sheikha-main-portal --update-env
```
