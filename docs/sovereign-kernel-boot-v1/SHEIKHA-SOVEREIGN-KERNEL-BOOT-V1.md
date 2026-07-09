# SHEIKHA Sovereign Kernel Boot V1

Status: ACTIVE_WITH_SOVEREIGN_BOOT_CATALOG
Score: 100

## Tawhid Root Covenant

- أساس شيخة هو التوحيد لله وحده.
- أعلى طبقة حاكمة: الحكم لله، والمرجع الكتاب والسنة الصحيحة.
- لا توجد طبقة فوق الحاكمية.
- Linux و Node ليستا أساس شيخة ولا طبقة تشغيل حاكمة؛ إن ظهرتا في المستودع فهما أدوات بناء وفحص مؤقتة.
- لغة شيخة هي عقد البرمجة الأول للنظام الأصلي.

## Kernel Covenant

- المرجعية القيمية: الكتاب والسنة الصحيحة.
- الذكاء الصناعي أداة تحليل ودعم وتنفيذ محكوم، لا يدعي الوحي ولا العصمة ولا يصدر فتوى مستقلة.
- القرارات العالية الأثر تحتاج مراجعة بشرية، والمسائل الدينية تحتاج مراجعة أهل الاختصاص.

## Sheikha Language First

كل نظام داخل شيخة يبدأ من عقد لغة شيخة: توحيد الجذر، حاكمية الكتاب والسنة، مواصفة، عقد، ربط، تنفيذ، ثم ترجمة آمنة للأدوات المؤقتة عند الحاجة.

## Sheikha Native Boot Target

الهدف الأصلي هو صورة إقلاع شيخة native/no-host. أوامر المستودع التالية هي أوامر بناء وفحص مؤقتة وليست أساس النظام:

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

التأسيس المعماري من الصفر ثابت في العقد الحاكم. أما ادعاء تشغيل bare-metal بلا مضيف فلا يُعلن إلا بعد وجود صورة إقلاع واختبارات VM/عتاد موثقة.
