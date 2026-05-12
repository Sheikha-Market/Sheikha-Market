# Sheikha.top Deployment Workflow

هذا الدليل يجهز نشر البوابة على `sheikha.top` بشكل منضبط.

## 1) المتطلبات

- صلاحية الوصول إلى المستودع المحلي.
- تثبيت Node.js و npm.
- تثبيت Vercel CLI: `npm i -g vercel`.
- حساب Vercel مربوط بالمشروع.
- متغيرات بيئة محدثة للإنتاج.

## 2) متغيرات البيئة المطلوبة

في `.env` أو بيئة Vercel Production:

- `BASE_URL=https://www.sheikha.top`
- `JWT_SECRET` (قوي وطويل)
- `DATA_ENCRYPTION_KEY` أو `DATA_ENCRYPTION_KEY_HEX`
- مفاتيح OAuth المطلوبة (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, ...)

متغيرات Vercel للنشر غير التفاعلي:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 3) فحص الجاهزية (بدون نشر)

```bash
bash scripts/sheikha-top-deploy-workflow.sh
```

هذا الأمر يقوم بـ:

- فحص الأدوات المطلوبة.
- تشغيل اختبارات الوحدة.
- فحص وجود إعدادات بيئة أساسية.
- عرض خطة نشر واضحة بدون تنفيذ فعلي.

## 4) تنفيذ النشر الفعلي

```bash
bash scripts/sheikha-top-deploy-workflow.sh --execute
```

خيارات مفيدة:

- `--skip-tests` لتجاوز الاختبارات.
- `--allow-dirty` للسماح بوجود تغييرات محلية غير متعلقة بالنشر.

## 5) تحقق ما بعد النشر

```bash
curl -I https://www.sheikha.top
curl -sS https://www.sheikha.top/api/health
curl -sS https://www.sheikha.top/api/finance/status
```

## 6) Rollback سريع

في Vercel:

- افتح Dashboard > Project > Deployments.
- اختر آخر نسخة مستقرة.
- نفذ Promote لإعادتها إلى Production.

## 7) ملاحظات تشغيلية

- لا تنفذ نشر Production إذا كانت أسرار البيئة ناقصة.
- يفضل النشر من شجرة عمل نظيفة (clean working tree).
- إذا كان بالمستودع تغييرات كبيرة غير مرتبطة، استخدم `--allow-dirty` بعد مراجعة يدوية.
