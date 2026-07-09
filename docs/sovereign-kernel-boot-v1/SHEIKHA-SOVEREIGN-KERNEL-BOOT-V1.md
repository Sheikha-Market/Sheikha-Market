# SHEIKHA Sovereign Kernel Boot V1

Status: ACTIVE_WITH_SOVEREIGN_BOOT_CATALOG
Score: 100

## Kernel Covenant

- المرجعية القيمية: الكتاب والسنة الصحيحة.
- الذكاء الصناعي أداة تحليل ودعم وتنفيذ محكوم، لا يدعي الوحي ولا العصمة ولا يصدر فتوى مستقلة.
- القرارات العالية الأثر تحتاج مراجعة بشرية، والمسائل الدينية تحتاج مراجعة أهل الاختصاص.

## Sheikha Language First

كل نظام جديد يبدأ من عقد لغة شيخة: مواصفة، حوكمة، workflow، عقد، تنفيذ، ثم ترجمة آمنة عند الحاجة.

## Hosted Laptop Boot

```bash
npm install
npm run -s ops:sovereign-kernel-boot:v1
npm run -s ops:master-activation:consolidation:v1
npm run server:restart
curl -s http://127.0.0.1:8080/api/health
```

## Frontend Smoke

```bash
curl -I http://127.0.0.1:8080/
curl -I http://127.0.0.1:8080/marketplace
curl -s http://127.0.0.1:8080/api/stores
curl -s http://127.0.0.1:8080/api/stores-by-specialty
```

## Recovery

1. Detect: افحص الصحة والسجلات.
2. Isolate: أوقف المسارات الخطرة واحفظ الأدلة.
3. Restore: اختبر الاستعادة في /tmp أولًا.
4. Repair: شغّل الاختبارات المستهدفة.
5. Restart: أعد تشغيل PM2.
6. Verify: افحص الصحة والمتاجر واللايف.
7. Document: حدّث تقرير التعافي.

## Truth Boundary

تشغيل شيخة الحالي هو hosted sovereign kernel فوق مضيف محلي. لا يُدّعى استقلال bare-metal كامل حتى تكتمل اختبارات صورة إقلاع موثقة.
