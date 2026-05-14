# تكامل شيخة المؤسسي الموحّد — Top Enterprise Integration

## الهدف

توحيد تفعيل الحساب المؤسسي ضمن مسار واحد قابل للتتبع يربط:

- `/api/enterprise`
- `/api/organizations`
- `/api/neural`
- `/api/sheikha/*` (حالة النظام العام)

## المسارات الجديدة

- `GET /api/top-enterprise/status`  
  يعرض نموذج الحالة الموحّد:
  - `enterpriseAccount`
  - `organizationAccount`
  - `domainProfile` (sheikha.top + readiness مفتاح VPS)
  - `neuralStatus` (جاهزية الشبكة العصبية + 12 خلية)

- `POST /api/top-enterprise/activation/workflow`  
  تشغيل Workflow التفعيل المتسلسل (يتطلب صلاحية).

- `POST /api/top-enterprise/activation/retry`  
  إعادة محاولة التفعيل بعد معالجة أسباب الفشل الجزئي (يتطلب صلاحية).

- `GET /api/top-enterprise/activation/:workflowId`  
  تتبّع تقرير عملية تفعيل محددة (يتطلب صلاحية).

## الصلاحيات

نقاط التفعيل الحساسة تتطلب JWT + أحد الأدوار:

- `admin`
- `enterprise`
- `organization`

## readiness gate

التفعيل النهائي يعتمد على نجاح الفحوصات التالية:

1. تفعيل الحساب المؤسسي
2. وجود منظمة فعالة (active organization)
3. ربط نطاق sheikha.top عبر وجود مفتاح VPS
4. جاهزية الشبكة العصبية (ready + 12 خلية)

## متغيرات البيئة

- `SHEIKHA_ENTERPRISE_ENABLED` (افتراضيًا مفعّل ما لم يكن `false`)
- `SHEIKHA_TOP_DOMAIN` (افتراضيًا `sheikha.top`)
- أحد مفاتيح VPS التالية:
  - `SHEIKHA_ENTERPRISE_VPS_KEY`
  - `SHEIKHA_VPS_KEY`
  - `VPS_KEY`
