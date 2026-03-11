# تقرير تفعيل الهيكلية السيادية - Google Cloud

- الوقت: 2026-03-10T23:39:58Z
- الوضع: dry-run
- المنظمة: 224557279528
- الحساب النشط: غير متاح
- الإقليم الافتراضي: me-central2
- حالة gcloud: غير متوفر

## المشاريع المستهدفة
- إنتاج: sheikha-empire
- تطوير: sheikha-core
- اختبار: sheikha-test

## الفوترة
- BILLING_ACCOUNT: غير محدد
- ملاحظة: بدون BILLING_ACCOUNT لن يتم الربط التلقائي للفوترة

## حساب التشغيل (بدون بطاقة شخصية)
- OPERATOR_PRINCIPAL: غير محدد
- ملاحظة: يفضّل صيغة member كاملة مثل user:market@sheikha.top

## الخدمات المفعلة
- aiplatform.googleapis.com
- run.googleapis.com
- bigquery.googleapis.com
- storage.googleapis.com
- cloudfunctions.googleapis.com
- monitoring.googleapis.com
- cloudresourcemanager.googleapis.com
- iam.googleapis.com
- serviceusage.googleapis.com

## حساب الخدمة
- الاسم: sheikha-orchestrator
- الأدوار:
  - roles/run.admin
  - roles/aiplatform.user
  - roles/bigquery.admin
  - roles/storage.admin
  - roles/cloudfunctions.admin
  - roles/monitoring.editor

## أدوار المشغّل
- roles/viewer
- roles/serviceusage.serviceUsageAdmin
- roles/run.admin
- roles/aiplatform.user
- roles/bigquery.jobUser
- roles/storage.objectAdmin
- roles/cloudfunctions.developer

## حالة التنفيذ
- في وضع dry-run: تم عرض الأوامر فقط بدون أي تغيير
- في وضع apply: تم تنفيذ الأوامر الفعلية بحسب الصلاحيات المتاحة
- عند غياب gcloud: يتم إصدار تقرير جاهزية فقط بدون تنفيذ

## أوامر التشغيل
- معاينة: 
  -             bash scripts/google-unified-alliance-activate.sh
- تنفيذ فعلي:
  -                 BILLING_ACCOUNT=XXXX-XXXX-XXXX OPERATOR_PRINCIPAL=user:market@sheikha.top bash scripts/google-unified-alliance-activate.sh --apply
